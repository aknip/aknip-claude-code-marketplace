/**
 * Workflow Synchronization Store
 * Zentraler Store für App-übergreifende Workflow-Synchronisation
 * Ermöglicht Daten-Austausch zwischen Makler, Assekuradeur und Versicherer
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnfrageStatus } from '@/types'

export interface WorkflowContext {
  anfrageId?: string
  kundeId?: string
  vorquotierungId?: string
  vertragId?: string
  rahmenkonzeptId?: string
}

export interface WorkflowUpdate {
  anfrageId: string
  status: AnfrageStatus
  updatedBy: 'makler' | 'assekuradeur' | 'versicherer'
  timestamp: string
  message?: string
  data?: Record<string, unknown>
}

export interface CrossAppNotification {
  id: string
  type: 'status_change' | 'new_document' | 'comment' | 'request_info'
  fromApp: 'makler' | 'assekuradeur' | 'versicherer'
  toApp: 'makler' | 'assekuradeur' | 'versicherer'
  anfrageId: string
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

interface WorkflowSyncState {
  // Current context
  currentContext: WorkflowContext | null

  // Workflow updates (für Status-Synchronisation)
  workflowUpdates: WorkflowUpdate[]

  // Cross-app notifications
  notifications: CrossAppNotification[]

  // Shared data cache (vermeidet redundante API-Calls)
  sharedDataCache: Record<string, unknown>

  // Actions
  setContext: (context: WorkflowContext) => void
  clearContext: () => void

  addWorkflowUpdate: (update: Omit<WorkflowUpdate, 'timestamp'>) => void
  getLatestUpdate: (anfrageId: string) => WorkflowUpdate | undefined

  addNotification: (notification: Omit<CrossAppNotification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationAsRead: (notificationId: string) => void
  getUnreadNotifications: (app: 'makler' | 'assekuradeur' | 'versicherer') => CrossAppNotification[]
  clearNotifications: () => void

  setCachedData: (key: string, data: unknown) => void
  getCachedData: <T = unknown>(key: string) => T | undefined
  clearCache: () => void

  // Navigation helpers
  getAnfrageContext: (anfrageId: string) => WorkflowContext
  getKundeContext: (kundeId: string) => WorkflowContext
}

export const useWorkflowSyncStore = create<WorkflowSyncState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentContext: null,
      workflowUpdates: [],
      notifications: [],
      sharedDataCache: {},

      // Context management
      setContext: (context) => {
        set({ currentContext: context })
      },

      clearContext: () => {
        set({ currentContext: null })
      },

      // Workflow updates
      addWorkflowUpdate: (update) => {
        const newUpdate: WorkflowUpdate = {
          ...update,
          timestamp: new Date().toISOString(),
        }
        set((state) => ({
          workflowUpdates: [newUpdate, ...state.workflowUpdates].slice(0, 100), // Keep last 100
        }))
      },

      getLatestUpdate: (anfrageId) => {
        const { workflowUpdates } = get()
        return workflowUpdates.find((update) => update.anfrageId === anfrageId)
      },

      // Notifications
      addNotification: (notification) => {
        const newNotification: CrossAppNotification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          read: false,
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }))
      },

      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        }))
      },

      getUnreadNotifications: (app) => {
        const { notifications } = get()
        return notifications.filter((n) => n.toApp === app && !n.read)
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      // Cache management
      setCachedData: (key, data) => {
        set((state) => ({
          sharedDataCache: {
            ...state.sharedDataCache,
            [key]: data,
          },
        }))
      },

      getCachedData: <T = unknown>(key: string): T | undefined => {
        const { sharedDataCache } = get()
        return sharedDataCache[key] as T | undefined
      },

      clearCache: () => {
        set({ sharedDataCache: {} })
      },

      // Navigation helpers
      getAnfrageContext: (anfrageId) => ({
        anfrageId,
      }),

      getKundeContext: (kundeId) => ({
        kundeId,
      }),
    }),
    {
      name: 'workflow-sync-storage',
      // Only persist context and notifications, not cache
      partialize: (state) => ({
        currentContext: state.currentContext,
        notifications: state.notifications,
        workflowUpdates: state.workflowUpdates.slice(0, 20), // Persist only last 20 updates
      }),
    }
  )
)

/**
 * Custom hook für Workflow-Synchronisation
 * Vereinfacht die Verwendung von Workflow-Updates
 */
export function useWorkflowSync(anfrageId?: string) {
  const {
    addWorkflowUpdate,
    getLatestUpdate,
    addNotification,
    setContext,
  } = useWorkflowSyncStore()

  const updateStatus = (
    status: AnfrageStatus,
    updatedBy: 'makler' | 'assekuradeur' | 'versicherer',
    message?: string,
    data?: Record<string, unknown>
  ) => {
    if (!anfrageId) return

    addWorkflowUpdate({
      anfrageId,
      status,
      updatedBy,
      message,
      data,
    })
  }

  const notifyOtherApps = (
    type: CrossAppNotification['type'],
    fromApp: 'makler' | 'assekuradeur' | 'versicherer',
    toApp: 'makler' | 'assekuradeur' | 'versicherer',
    title: string,
    message: string,
    actionUrl?: string
  ) => {
    if (!anfrageId) return

    addNotification({
      type,
      fromApp,
      toApp,
      anfrageId,
      title,
      message,
      actionUrl,
    })
  }

  const latestUpdate = anfrageId ? getLatestUpdate(anfrageId) : undefined

  // Set context when anfrageId changes
  if (anfrageId) {
    setContext({ anfrageId })
  }

  return {
    updateStatus,
    notifyOtherApps,
    latestUpdate,
  }
}

/**
 * Hook für Cross-App Notifications
 */
export function useCrossAppNotifications(app: 'makler' | 'assekuradeur' | 'versicherer') {
  const {
    notifications,
    getUnreadNotifications,
    markNotificationAsRead,
    clearNotifications,
  } = useWorkflowSyncStore()

  const unreadCount = getUnreadNotifications(app).length
  const allNotifications = notifications.filter((n) => n.toApp === app)

  return {
    notifications: allNotifications,
    unreadCount,
    markAsRead: markNotificationAsRead,
    clearAll: clearNotifications,
  }
}
