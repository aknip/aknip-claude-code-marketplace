/**
 * ESA Chart Component
 * Visualisierung von Einzelschadendaten mit Recharts
 */

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/apps/reference-app/components/ui/card'
import { type Schaden, type SchadenUrsache, type SchadenTyp } from '@/types/schaden'

interface ESAChartProps {
  data: Schaden[]
  variant?: 'schadenhoehe' | 'verteilung' | 'ursachen'
  height?: number
}

// Chart Colors
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#a78bfa',
]

// Custom Tooltip
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {typeof entry.value === 'number' && entry.name?.includes('Höhe')
              ? new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                }).format(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// Main ESA Chart
export function ESAChart({ data, variant = 'schadenhoehe', height = 300 }: ESAChartProps) {
  if (variant === 'verteilung') {
    return <ESAVerteilungChart data={data} height={height} />
  }

  if (variant === 'ursachen') {
    return <ESAUrsachenChart data={data} height={height} />
  }

  // Schadenhöhe nach Jahr
  const schadenProJahr = data.reduce((acc, schaden) => {
    const jahr = new Date(schaden.schadendatum).getFullYear()
    if (!acc[jahr]) {
      acc[jahr] = {
        jahr,
        anzahl: 0,
        gesamthoehe: 0,
      }
    }
    acc[jahr].anzahl++
    acc[jahr].gesamthoehe += schaden.schadenhoehe
    return acc
  }, {} as Record<number, { jahr: number; anzahl: number; gesamthoehe: number }>)

  const chartData = Object.values(schadenProJahr)
    .sort((a, b) => a.jahr - b.jahr)
    .map((item) => ({
      Jahr: item.jahr.toString(),
      'Anzahl Schäden': item.anzahl,
      'Schadenhöhe': item.gesamthoehe,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schadenentwicklung</CardTitle>
        <CardDescription>
          Anzahl und Höhe der Schäden pro Jahr
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="Jahr"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) =>
                new Intl.NumberFormat('de-DE', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar
              yAxisId="left"
              dataKey="Anzahl Schäden"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="Schadenhöhe"
              fill="hsl(var(--destructive))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Schadenverteilung (Pie Chart)
function ESAVerteilungChart({ data, height }: { data: Schaden[]; height: number }) {
  // Group by SchadenTyp
  const verteilung = data.reduce((acc, schaden) => {
    acc[schaden.schadenTyp] = (acc[schaden.schadenTyp] || 0) + 1
    return acc
  }, {} as Record<SchadenTyp, number>)

  const chartData = Object.entries(verteilung).map(([typ, anzahl]) => ({
    name: typ,
    value: anzahl,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schadenverteilung nach Typ</CardTitle>
        <CardDescription>
          Aufteilung der {data.length} Schäden nach Versicherungsart
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Schadenursachen (Bar Chart)
function ESAUrsachenChart({ data, height }: { data: Schaden[]; height: number }) {
  // Group by SchadenUrsache
  const ursachen = data.reduce((acc, schaden) => {
    if (!acc[schaden.schadenUrsache]) {
      acc[schaden.schadenUrsache] = {
        anzahl: 0,
        hoehe: 0,
      }
    }
    acc[schaden.schadenUrsache].anzahl++
    acc[schaden.schadenUrsache].hoehe += schaden.schadenhoehe
    return acc
  }, {} as Record<SchadenUrsache, { anzahl: number; hoehe: number }>)

  const chartData = Object.entries(ursachen)
    .map(([ursache, stats]) => ({
      Ursache: ursache,
      'Anzahl': stats.anzahl,
      'Ø Schadenhöhe': Math.round(stats.hoehe / stats.anzahl),
    }))
    .sort((a, b) => b.Anzahl - a.Anzahl)
    .slice(0, 10) // Top 10

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Schadenursachen</CardTitle>
        <CardDescription>
          Häufigste Ursachen und durchschnittliche Schadenhöhe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="Ursache"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar
              dataKey="Anzahl"
              fill="hsl(var(--chart-1))"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="Ø Schadenhöhe"
              fill="hsl(var(--chart-2))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
