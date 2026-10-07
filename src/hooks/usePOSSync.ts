'use client'

import { useState, useEffect, useRef } from 'react'
import { db, LocalRecipe, PendingSale } from '@/lib/db'
import { getPOSData, syncPendingSales } from '@/server/actions/pos'

export function usePOSSync() {
  const [recipes, setRecipes] = useState<LocalRecipe[]>([])
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const syncRef = useRef(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      doSync()
    }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    db.recipes.toArray().then(setRecipes)
    doSync()
  }, [])

  useEffect(() => {
    async function countPending() {
      const all = await db.pendingSales.toArray()
      setPendingCount(all.filter((s) => !s.syncedAt).length)
    }
    countPending()
    const interval = setInterval(countPending, 3000)
    return () => clearInterval(interval)
  }, [])

  async function doSync() {
    if (syncRef.current || !navigator.onLine) return
    syncRef.current = true
    setIsSyncing(true)

    try {
      // 1. Actualizar recetas
      const posData = await getPOSData()
      if (posData.success && posData.data) {
        await db.recipes.clear()
        await db.recipes.bulkPut(posData.data)
        setRecipes(posData.data)
      }

      // 2. Sincronizar ventas pendientes — todas de una vez
      const all = await db.pendingSales.toArray()
      const pending = all.filter((s) => !s.syncedAt)

      if (pending.length > 0) {
        console.log(`Sincronizando ${pending.length} ventas pendientes...`)
        const result = await syncPendingSales(pending)

        if (result.success && result.results) {
          for (const r of result.results) {
            if (r.success) {
              const sale = await db.pendingSales
                .where('localId')
                .equals(r.localId)
                .first()
              if (sale?.id !== undefined) {
                await db.pendingSales.update(sale.id, {
                  syncedAt: new Date(),
                })
              }
            }
          }
        }

        const remaining = await db.pendingSales.toArray()
        setPendingCount(remaining.filter((s) => !s.syncedAt).length)
      }

      setLastSync(new Date())
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
      syncRef.current = false
    }
  }

  async function saveSaleLocally(sale: Omit<PendingSale, 'id' | 'syncedAt'>) {
    await db.pendingSales.add({
      ...sale,
      syncedAt: null,
    })
    setPendingCount((prev) => prev + 1)

    // Intentar sincronizar inmediatamente si hay internet
    // Sin bloquear — si ya hay una sync en curso, se reintentará
    if (navigator.onLine && !syncRef.current) {
      doSync()
    }
  }

  async function clearPending() {
    if (
      !confirm(
        '¿Borrar todas las ventas pendientes? Esta acción no se puede deshacer.'
      )
    )
      return
    await db.pendingSales.clear()
    const remaining = await db.pendingSales.toArray()
    setPendingCount(remaining.filter((s) => !s.syncedAt).length)
  }

  async function getPendingSales(): Promise<PendingSale[]> {
    const all = await db.pendingSales.toArray()
    return all.filter((s) => !s.syncedAt)
  }

  return {
    recipes,
    isOnline,
    isSyncing,
    pendingCount,
    lastSync,
    sync: doSync,
    saveSaleLocally,
    clearPending,
    getPendingSales,
  }
}
