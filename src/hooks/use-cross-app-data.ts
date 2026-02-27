/**
 * Cross-App Data Exchange Hooks
 * Ermöglicht Daten-Austausch zwischen den drei Apps
 */

import { useWorkflowSyncStore } from '@/stores/workflow-sync-store'
import type { Anfrage, Kunde, Angebot, Vertrag } from '@/types'

/**
 * Hook zum Teilen von Anfrage-Daten zwischen Apps
 */
export function useSharedAnfrage(anfrageId?: string) {
  const { getCachedData, setCachedData } = useWorkflowSyncStore()

  const cacheKey = anfrageId ? `anfrage:${anfrageId}` : null

  const getAnfrage = (): Anfrage | undefined => {
    if (!cacheKey) return undefined
    return getCachedData<Anfrage>(cacheKey)
  }

  const setAnfrage = (anfrage: Anfrage) => {
    if (!cacheKey) return
    setCachedData(cacheKey, anfrage)
  }

  const updateAnfrage = (updates: Partial<Anfrage>) => {
    const current = getAnfrage()
    if (!current) return

    setAnfrage({
      ...current,
      ...updates,
      aktualisiertAm: new Date().toISOString(),
    })
  }

  return {
    anfrage: getAnfrage(),
    setAnfrage,
    updateAnfrage,
  }
}

/**
 * Hook zum Teilen von Kunden-Daten zwischen Apps
 */
export function useSharedKunde(kundeId?: string) {
  const { getCachedData, setCachedData } = useWorkflowSyncStore()

  const cacheKey = kundeId ? `kunde:${kundeId}` : null

  const getKunde = (): Kunde | undefined => {
    if (!cacheKey) return undefined
    return getCachedData<Kunde>(cacheKey)
  }

  const setKunde = (kunde: Kunde) => {
    if (!cacheKey) return
    setCachedData(cacheKey, kunde)
  }

  return {
    kunde: getKunde(),
    setKunde,
  }
}

/**
 * Hook zum Teilen von Angebots-Daten zwischen Apps
 */
export function useSharedAngebot(angebotId?: string) {
  const { getCachedData, setCachedData } = useWorkflowSyncStore()

  const cacheKey = angebotId ? `angebot:${angebotId}` : null

  const getAngebot = (): Angebot | undefined => {
    if (!cacheKey) return undefined
    return getCachedData<Angebot>(cacheKey)
  }

  const setAngebot = (angebot: Angebot) => {
    if (!cacheKey) return
    setCachedData(cacheKey, angebot)
  }

  return {
    angebot: getAngebot(),
    setAngebot,
  }
}

/**
 * Hook zum Teilen von Vertrags-Daten zwischen Apps
 */
export function useSharedVertrag(vertragId?: string) {
  const { getCachedData, setCachedData } = useWorkflowSyncStore()

  const cacheKey = vertragId ? `vertrag:${vertragId}` : null

  const getVertrag = (): Vertrag | undefined => {
    if (!cacheKey) return undefined
    return getCachedData<Vertrag>(cacheKey)
  }

  const setVertrag = (vertrag: Vertrag) => {
    if (!cacheKey) return
    setCachedData(cacheKey, vertrag)
  }

  return {
    vertrag: getVertrag(),
    setVertrag,
  }
}

/**
 * Hook für allgemeinen Daten-Austausch
 */
export function useSharedData<T = unknown>(key: string) {
  const { getCachedData, setCachedData } = useWorkflowSyncStore()

  const getData = (): T | undefined => {
    return getCachedData<T>(key)
  }

  const setData = (data: T) => {
    setCachedData(key, data)
  }

  return {
    data: getData(),
    setData,
  }
}

/**
 * Hook für Workflow-Kontext
 * Gibt Kontext-Informationen zurück, die zwischen Apps weitergegeben werden
 */
export function useWorkflowContext() {
  const { currentContext, setContext, clearContext } = useWorkflowSyncStore()

  return {
    context: currentContext,
    setContext,
    clearContext,
    hasContext: Boolean(currentContext),
  }
}
