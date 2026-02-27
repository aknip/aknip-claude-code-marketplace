/**
 * Cross-App Notifications Component
 * Zeigt Benachrichtigungen zwischen Apps an
 */

import { useState } from 'react'
import { Bell, Check, X, ExternalLink } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/apps/reference-app/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/apps/reference-app/components/ui/dropdown-menu'
import { Badge } from '@/apps/reference-app/components/ui/badge'
import { ScrollArea } from '@/apps/reference-app/components/ui/scroll-area'
import { useCrossAppNotifications } from '@/stores/workflow-sync-store'
import { cn } from '@/lib/utils'

interface CrossAppNotificationBellProps {
  app: 'makler' | 'assekuradeur' | 'versicherer'
  className?: string
}

const notificationTypeLabels = {
  status_change: 'Status geändert',
  new_document: 'Neues Dokument',
  comment: 'Neuer Kommentar',
  request_info: 'Informationsanfrage',
}

const notificationTypeIcons = {
  status_change: '🔄',
  new_document: '📄',
  comment: '💬',
  request_info: '❓',
}

/**
 * Notification Bell Component
 * Zeigt ein Bell-Icon mit Unread-Badge an
 */
export function CrossAppNotificationBell({ app, className }: CrossAppNotificationBellProps) {
  const { notifications, unreadCount, markAsRead, clearAll } = useCrossAppNotifications(app)
  const [isOpen, setIsOpen] = useState(false)

  const handleMarkAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) {
        markAsRead(n.id)
      }
    })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount} ungelesene Benachrichtigungen
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Benachrichtigungen</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Alle als gelesen markieren
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Keine Benachrichtigungen
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-96">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex flex-col items-start gap-2 p-3 cursor-pointer',
                    !notification.read && 'bg-muted/50'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <span className="text-lg">{notificationTypeIcons[notification.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            Neu
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notificationTypeLabels[notification.type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {notification.actionUrl && (
                    <Link
                      to={notification.actionUrl}
                      className="text-xs text-primary hover:underline flex items-center gap-1 ml-7"
                      onClick={() => setIsOpen(false)}
                    >
                      Details anzeigen
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </DropdownMenuItem>
              ))}
            </ScrollArea>
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      clearAll()
                      setIsOpen(false)
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Alle löschen
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Notification List Component
 * Vollständige Benachrichtigungs-Liste für eine dedizierte Seite
 */
interface CrossAppNotificationListProps {
  app: 'makler' | 'assekuradeur' | 'versicherer'
}

export function CrossAppNotificationList({ app }: CrossAppNotificationListProps) {
  const { notifications, markAsRead, clearAll } = useCrossAppNotifications(app)

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Keine Benachrichtigungen</h3>
        <p className="text-sm text-muted-foreground">
          Sie sind auf dem neuesten Stand
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Benachrichtigungen</h2>
        <Button variant="outline" size="sm" onClick={clearAll}>
          <X className="h-4 w-4 mr-2" />
          Alle löschen
        </Button>
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'border rounded-lg p-4 space-y-3 transition-colors',
              !notification.read && 'bg-muted/50 border-primary/20'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{notificationTypeIcons[notification.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  {!notification.read && (
                    <Badge variant="secondary" className="text-xs">
                      Neu
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="outline">
                    {notificationTypeLabels[notification.type]}
                  </Badge>
                  <span>
                    {new Date(notification.timestamp).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>Von: {notification.fromApp}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {notification.actionUrl && (
              <Link to={notification.actionUrl}>
                <Button variant="outline" size="sm" className="w-full">
                  Details anzeigen
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
