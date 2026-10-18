'use client'

import { useEffect, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { db, PendingSale } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface POSPendingModalProps {
  onClose: () => void
}

export function POSPendingModal({ onClose }: POSPendingModalProps) {
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([])

  useEffect(() => {
    async function load() {
      const all = await db.pendingSales.toArray()
      setPendingSales(all.filter((s) => !s.syncedAt))
    }
    load()
  }, [])

  async function handleDeleteOne(id: number) {
    if (!confirm('¿Borrar esta venta pendiente?')) return
    await db.pendingSales.delete(id)
    setPendingSales((prev) => prev.filter((s) => s.id !== id))
  }

  async function handleDeleteAll() {
    if (!confirm('¿Borrar todas las ventas pendientes?')) return
    for (const sale of pendingSales) {
      if (sale.id !== undefined) await db.pendingSales.delete(sale.id)
    }
    setPendingSales([])
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="bg-card border-border flex max-h-[80vh] w-full max-w-sm flex-col rounded-2xl border">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-4">
          <p className="text-foreground font-semibold">
            Ventas pendientes ({pendingSales.length})
          </p>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {pendingSales.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No hay ventas pendientes
            </p>
          ) : (
            pendingSales.map((sale) => {
              const total = sale.items.reduce(
                (sum, item) => sum + item.unitPrice * item.quantity,
                0
              )
              const date = new Date(sale.createdAt)
              const timeStr = date.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Mexico_City',
              })

              return (
                <div
                  key={sale.id}
                  className="border-border space-y-2 rounded-xl border p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-xs">{timeStr}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-sm font-bold">
                        {formatCurrency(total)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {sale.paymentMethod === 'CASH' ? '💵' : '📱'}
                      </span>
                      <button
                        onClick={() =>
                          sale.id !== undefined && handleDeleteOne(sale.id)
                        }
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {sale.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <p className="text-foreground text-sm">
                          {item.recipeName}
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({item.variantSize}) ×{item.quantity}
                          </span>
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {sale.loyaltyPhone && (
                    <p className="text-muted-foreground text-xs">
                      📱 Lealtad: {sale.loyaltyPhone}
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {pendingSales.length > 0 && (
          <div className="border-border space-y-2 border-t p-4">
            <Button
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10 w-full"
              onClick={handleDeleteAll}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Borrar todas
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
