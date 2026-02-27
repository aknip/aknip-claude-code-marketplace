/**
 * Status Badge Component
 * Einheitliche Status-Anzeige für Anfragen, Angebote, Verträge, etc.
 */

import { Badge } from '@/apps/reference-app/components/ui/badge'
import { type AnfrageStatus } from '@/types/anfrage'
import { type AngebotStatus } from '@/types/angebot'
import { type VertragStatus } from '@/types/vertrag'
import { type SchadenStatus } from '@/types/schaden'
import { type Fahrzeugstatus } from '@/types/fahrzeug'

type AllStatus = AnfrageStatus | AngebotStatus | VertragStatus | SchadenStatus | Fahrzeugstatus

interface StatusBadgeProps {
  status: AllStatus
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

// Status-Labels (deutsch)
const statusLabels: Record<string, string> = {
  // Anfrage Status
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

  // Angebot Status
  angefordert: 'Angefordert',
  in_bearbeitung: 'In Bearbeitung',
  angebot_erhalten: 'Angebot erhalten',
  abgelehnt_versicherer: 'Abgelehnt (Versicherer)',
  abgelehnt_kunde: 'Abgelehnt (Kunde)',
  verfallen: 'Verfallen',

  // Vertrag Status
  aktiv: 'Aktiv',
  gekuendigt: 'Gekündigt',
  ausgelaufen: 'Ausgelaufen',
  storniert: 'Storniert',

  // Schaden Status
  gemeldet: 'Gemeldet',
  reguliert: 'Reguliert',
  teilreguliert: 'Teilreguliert',

  // Fahrzeug Status
  stillgelegt: 'Stillgelegt',
  in_reparatur: 'In Reparatur',
  verkauft: 'Verkauft',
}

// Status-Farben (Tailwind CSS Classes)
const statusColors: Record<string, string> = {
  // Anfrage Status
  entwurf: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
  eingereicht: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  in_pruefung: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  rueckfrage: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  deckungsanfrage: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  angebot_erstellt: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  nachverhandlung: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  angenommen: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  abgelehnt: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  vertrag_aktiv: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',

  // Angebot Status
  angefordert: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  in_bearbeitung: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  angebot_erhalten: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  abgelehnt_versicherer: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  abgelehnt_kunde: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  verfallen: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',

  // Vertrag Status
  aktiv: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  gekuendigt: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  ausgelaufen: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
  storniert: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',

  // Schaden Status
  gemeldet: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  reguliert: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  teilreguliert: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',

  // Fahrzeug Status
  stillgelegt: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
  in_reparatur: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  verkauft: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
}

// Size-Mapping
const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function StatusBadge({ status, variant = 'default', size = 'md' }: StatusBadgeProps) {
  const label = statusLabels[status] || status
  const colorClass = statusColors[status] || statusColors.entwurf
  const sizeClass = sizeClasses[size]

  return (
    <Badge
      variant={variant}
      className={`${colorClass} ${sizeClass} font-medium border`}
    >
      {label}
    </Badge>
  )
}
