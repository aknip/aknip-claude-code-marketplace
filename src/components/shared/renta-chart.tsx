/**
 * Renta Chart Component
 * Visualisierung von Rentabilitätsdaten mit Recharts
 */

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/apps/reference-app/components/ui/card'
import { type JahresRenta } from '@/types/renta'

interface RentaChartProps {
  data: JahresRenta[]
  variant?: 'combined' | 'schadenquote' | 'praemien'
  height?: number
}

// Custom Tooltip
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-semibold text-sm mb-2">Jahr {label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {entry.name === 'Schadenquote'
              ? `${entry.value}%`
              : new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                }).format(entry.value as number)}
          </span>
        </div>
      ))}
    </div>
  )
}

// Combined Chart (Prämien + Schadenquote)
export function RentaChart({ data, variant = 'combined', height = 300 }: RentaChartProps) {
  if (variant === 'schadenquote') {
    return <RentaSchadenquoteChart data={data} height={height} />
  }

  if (variant === 'praemien') {
    return <RentaPraemienChart data={data} height={height} />
  }

  // Combined Chart
  const chartData = data.map((jahr) => ({
    jahr: jahr.jahr,
    'Bruttoprämie': jahr.bruttoJahrespraemie,
    'Schadenaufwand': jahr.schadenaufwand,
    'Schadenquote': jahr.schadenquote,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rentabilitätsentwicklung</CardTitle>
        <CardDescription>
          Prämienentwicklung und Schadenquote der letzten {data.length} Jahre
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="jahr"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) =>
                new Intl.NumberFormat('de-DE', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value)
              }
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar
              yAxisId="left"
              dataKey="Bruttoprämie"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="Schadenaufwand"
              fill="hsl(var(--destructive))"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Schadenquote"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-3))', r: 4 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Schadenquote Chart (Line)
function RentaSchadenquoteChart({ data, height }: { data: JahresRenta[]; height: number }) {
  const chartData = data.map((jahr) => ({
    jahr: jahr.jahr,
    'Schadenquote': jahr.schadenquote,
    'Kombinierte Quote': jahr.kombinierteQuote,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schadenquoten-Entwicklung</CardTitle>
        <CardDescription>Verlauf der Schadenquote über {data.length} Jahre</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="jahr"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Line
              type="monotone"
              dataKey="Schadenquote"
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--chart-1))', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="Kombinierte Quote"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Prämien Chart (Stacked Bar)
function RentaPraemienChart({ data, height }: { data: JahresRenta[]; height: number }) {
  const chartData = data.map((jahr) => ({
    jahr: jahr.jahr,
    'Haftpflicht': jahr.spartenDetails.haftpflicht.praemie,
    'Vollkasko': jahr.spartenDetails.vollkasko.praemie,
    'Teilkasko': jahr.spartenDetails.teilkasko.praemie,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prämienverteilung nach Sparten</CardTitle>
        <CardDescription>Aufteilung der Jahresprämie nach Versicherungssparten</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="jahr"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
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
              dataKey="Haftpflicht"
              stackId="a"
              fill="hsl(var(--chart-1))"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Vollkasko"
              stackId="a"
              fill="hsl(var(--chart-2))"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Teilkasko"
              stackId="a"
              fill="hsl(var(--chart-3))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
