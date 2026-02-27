/**
 * Status Synchronization Utilities
 * Hilfsfunktionen für die Synchronisation von Workflow-Stati zwischen Apps
 */

import type { AnfrageStatus, AngebotStatus } from '@/types'

/**
 * Status-Transitions-Map
 * Definiert erlaubte Status-Übergänge und welche App sie ausführen kann
 */
export const statusTransitions: Record<
  AnfrageStatus,
  {
    next: AnfrageStatus[]
    allowedApps: ('makler' | 'assekuradeur' | 'versicherer')[]
  }
> = {
  entwurf: {
    next: ['eingereicht'],
    allowedApps: ['makler'],
  },
  eingereicht: {
    next: ['in_pruefung', 'rueckfrage', 'abgelehnt'],
    allowedApps: ['assekuradeur'],
  },
  in_pruefung: {
    next: ['deckungsanfrage', 'rueckfrage', 'abgelehnt'],
    allowedApps: ['assekuradeur'],
  },
  rueckfrage: {
    next: ['in_pruefung', 'abgelehnt'],
    allowedApps: ['makler', 'assekuradeur'],
  },
  deckungsanfrage: {
    next: ['angebot_erstellt', 'abgelehnt'],
    allowedApps: ['versicherer'],
  },
  angebot_erstellt: {
    next: ['nachverhandlung', 'angenommen', 'abgelehnt'],
    allowedApps: ['makler', 'assekuradeur'],
  },
  nachverhandlung: {
    next: ['angebot_erstellt', 'angenommen', 'abgelehnt'],
    allowedApps: ['makler', 'assekuradeur', 'versicherer'],
  },
  angenommen: {
    next: ['vertrag_aktiv'],
    allowedApps: ['assekuradeur'],
  },
  abgelehnt: {
    next: [],
    allowedApps: [],
  },
  vertrag_aktiv: {
    next: [],
    allowedApps: [],
  },
}

/**
 * Prüft, ob ein Status-Übergang erlaubt ist
 */
export function isTransitionAllowed(
  currentStatus: AnfrageStatus,
  newStatus: AnfrageStatus,
  app: 'makler' | 'assekuradeur' | 'versicherer'
): boolean {
  const transition = statusTransitions[currentStatus]
  if (!transition) return false

  return (
    transition.next.includes(newStatus) &&
    transition.allowedApps.includes(app)
  )
}

/**
 * Gibt alle möglichen nächsten Stati zurück
 */
export function getNextPossibleStati(
  currentStatus: AnfrageStatus,
  app: 'makler' | 'assekuradeur' | 'versicherer'
): AnfrageStatus[] {
  const transition = statusTransitions[currentStatus]
  if (!transition) return []

  if (transition.allowedApps.includes(app)) {
    return transition.next
  }

  return []
}

/**
 * Status-Labels (Deutsch)
 */
export const statusLabels: Record<AnfrageStatus, string> = {
  entwurf: 'Entwurf',
  eingereicht: 'Eingereicht',
  in_pruefung: 'In Prüfung',
  rueckfrage: 'Rückfrage',
  deckungsanfrage: 'Deckungsanfrage',
  angebot_erstellt: 'Angebot erstellt',
  nachverhandlung: 'Nachverhandlung',
  angenommen: 'Angenommen',
  abgelehnt: 'Abgelehnt',
  vertrag_aktiv: 'Vertrag aktiv',
}

/**
 * Angebots-Status zu Anfrage-Status Mapping
 */
export function angebotStatusToAnfrageStatus(
  angebotStatus: AngebotStatus
): AnfrageStatus | null {
  const mapping: Record<AngebotStatus, AnfrageStatus | null> = {
    angefordert: 'deckungsanfrage',
    in_bearbeitung: 'deckungsanfrage',
    kalkuliert: 'angebot_erstellt',
    angebot_erhalten: 'angebot_erstellt',
    angebot_abgegeben: 'angebot_erstellt',
    angenommen: 'angenommen',
    abgelehnt: 'abgelehnt',
  }

  return mapping[angebotStatus] || null
}

/**
 * Workflow-Schritt zu Status Mapping
 */
export function workflowStepToStatus(step: number): AnfrageStatus {
  const stepMapping: Record<number, AnfrageStatus> = {
    1: 'entwurf',
    2: 'eingereicht',
    3: 'in_pruefung',
    4: 'deckungsanfrage',
    5: 'angebot_erstellt',
    6: 'angenommen',
  }

  return stepMapping[step] || 'entwurf'
}

/**
 * Status zu Workflow-Schritt Mapping
 */
export function statusToWorkflowStep(status: AnfrageStatus): number {
  const statusMapping: Record<AnfrageStatus, number> = {
    entwurf: 1,
    eingereicht: 2,
    in_pruefung: 3,
    rueckfrage: 3,
    deckungsanfrage: 4,
    angebot_erstellt: 5,
    nachverhandlung: 5,
    angenommen: 6,
    abgelehnt: 6,
    vertrag_aktiv: 6,
  }

  return statusMapping[status] || 1
}

/**
 * Gibt die verantwortliche App für einen Status zurück
 */
export function getResponsibleApp(status: AnfrageStatus): 'makler' | 'assekuradeur' | 'versicherer' {
  const appMapping: Record<AnfrageStatus, 'makler' | 'assekuradeur' | 'versicherer'> = {
    entwurf: 'makler',
    eingereicht: 'assekuradeur',
    in_pruefung: 'assekuradeur',
    rueckfrage: 'makler',
    deckungsanfrage: 'versicherer',
    angebot_erstellt: 'makler',
    nachverhandlung: 'assekuradeur',
    angenommen: 'assekuradeur',
    abgelehnt: 'assekuradeur',
    vertrag_aktiv: 'versicherer',
  }

  return appMapping[status] || 'makler'
}

/**
 * Status-Farben für UI
 */
export const statusColors: Record<AnfrageStatus, string> = {
  entwurf: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  eingereicht: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_pruefung: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  rueckfrage: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  deckungsanfrage: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  angebot_erstellt: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  nachverhandlung: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  angenommen: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  abgelehnt: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  vertrag_aktiv: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
}

/**
 * Prüft, ob ein Status final ist (keine weiteren Übergänge möglich)
 */
export function isFinalStatus(status: AnfrageStatus): boolean {
  return status === 'abgelehnt' || status === 'vertrag_aktiv'
}

/**
 * Gibt den Progress-Prozentsatz für einen Status zurück
 */
export function getStatusProgress(status: AnfrageStatus): number {
  const progressMapping: Record<AnfrageStatus, number> = {
    entwurf: 10,
    eingereicht: 20,
    in_pruefung: 35,
    rueckfrage: 30,
    deckungsanfrage: 50,
    angebot_erstellt: 70,
    nachverhandlung: 75,
    angenommen: 90,
    abgelehnt: 100,
    vertrag_aktiv: 100,
  }

  return progressMapping[status] || 0
}
