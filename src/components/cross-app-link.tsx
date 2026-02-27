/**
 * Cross-App Link Component
 * Ermöglicht Navigation zwischen den drei Apps (Makler, Assekuradeur, Versicherer)
 * mit Kontext-Weitergabe
 */

import { Link } from '@tanstack/react-router'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/apps/reference-app/components/ui/button'
import { Badge } from '@/apps/reference-app/components/ui/badge'

export type AppType = 'makler' | 'assekuradeur' | 'versicherer'

interface CrossAppLinkProps {
  app: AppType
  path: string
  context?: {
    anfrageId?: string
    kundeId?: string
    vorquotierungId?: string
    vertragId?: string
  }
  variant?: 'link' | 'button' | 'badge'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
}

const appLabels: Record<AppType, string> = {
  makler: 'Makler-Portal',
  assekuradeur: 'Assekuradeur-Portal',
  versicherer: 'Versicherer-Portal',
}

const appColors: Record<AppType, string> = {
  makler: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  assekuradeur: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  versicherer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

/**
 * Cross-App Link Component
 * Verlinkt zwischen Apps und überträgt optional Kontext-Daten
 */
export function CrossAppLink({
  app,
  path,
  context,
  variant = 'link',
  size = 'md',
  className,
  children,
  showIcon = true,
}: CrossAppLinkProps) {
  // Construct full path with app prefix
  const fullPath = `/${app}${path}`

  // Add context as query parameters if provided
  const searchParams = context ? new URLSearchParams(context as Record<string, string>).toString() : ''
  const href = searchParams ? `${fullPath}?${searchParams}` : fullPath

  const label = children || appLabels[app]

  // Badge Variant
  if (variant === 'badge') {
    return (
      <Link to={href} className="inline-flex">
        <Badge className={cn(appColors[app], 'gap-1.5 cursor-pointer hover:opacity-80', className)}>
          {label}
          {showIcon && <ExternalLink className="h-3 w-3" />}
        </Badge>
      </Link>
    )
  }

  // Button Variant
  if (variant === 'button') {
    return (
      <Link to={href}>
        <Button
          variant="outline"
          size={size}
          className={cn('gap-2', className)}
        >
          {label}
          {showIcon && <ArrowRight className="h-4 w-4" />}
        </Button>
      </Link>
    )
  }

  // Link Variant (default)
  return (
    <Link
      to={href}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline',
        className
      )}
    >
      {label}
      {showIcon && <ExternalLink className="h-3.5 w-3.5" />}
    </Link>
  )
}

/**
 * App-Badge Component
 * Zeigt an, aus welcher App ein Element stammt
 */
interface AppBadgeProps {
  app: AppType
  className?: string
}

export function AppBadge({ app, className }: AppBadgeProps) {
  return (
    <Badge className={cn(appColors[app], 'text-xs', className)}>
      {appLabels[app]}
    </Badge>
  )
}

/**
 * Workflow Navigation Component
 * Zeigt den aktuellen Workflow-Status und Links zu allen beteiligten Apps
 */
interface WorkflowNavigationProps {
  currentApp: AppType
  anfrageId: string
  className?: string
}

export function WorkflowNavigation({ currentApp, anfrageId, className }: WorkflowNavigationProps) {
  const apps: AppType[] = ['makler', 'assekuradeur', 'versicherer']

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">Workflow:</span>
      {apps.map((app, index) => (
        <div key={app} className="flex items-center gap-2">
          {currentApp === app ? (
            <Badge className={cn(appColors[app])}>
              {appLabels[app]}
            </Badge>
          ) : (
            <CrossAppLink
              app={app}
              path={`/anfragen/${anfrageId}`}
              context={{ anfrageId }}
              variant="badge"
              showIcon={false}
            />
          )}
          {index < apps.length - 1 && (
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Quick App Switcher Component
 * Schnellzugriff auf die anderen Apps im aktuellen Kontext
 */
interface QuickAppSwitcherProps {
  currentApp: AppType
  context?: {
    anfrageId?: string
    kundeId?: string
  }
  className?: string
}

export function QuickAppSwitcher({ currentApp, context, className }: QuickAppSwitcherProps) {
  const otherApps = (['makler', 'assekuradeur', 'versicherer'] as AppType[]).filter(
    (app) => app !== currentApp
  )

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">Wechseln zu:</span>
      {otherApps.map((app) => (
        <CrossAppLink
          key={app}
          app={app}
          path="/dashboard"
          context={context}
          variant="badge"
          showIcon={true}
        />
      ))}
    </div>
  )
}
