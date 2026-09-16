'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Star, Gift, Pencil, Trash2 } from 'lucide-react'
import {
  addStamp,
  redeemReward,
  updateLoyaltyCard,
  deleteLoyaltyCard,
} from '@/server/actions/loyalty'
import { formatCurrency } from '@/lib/utils'

const STAMPS_FOR_REWARD = 10
const MIN_PURCHASE_FOR_STAMP = 50

interface LoyaltyCard {
  id: string
  name: string
  phone: string | null
  stamps: number
  totalRedeemed: number
}

interface LoyaltyCardDetailModalProps {
  card: LoyaltyCard
  onClose: () => void
}

export function LoyaltyCardDetailModal({
  card,
  onClose,
}: LoyaltyCardDetailModalProps) {
  const [purchaseTotal, setPurchaseTotal] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [currentStamps, setCurrentStamps] = useState(card.stamps)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(card.name)
  const [editPhone, setEditPhone] = useState(card.phone ?? '')

  const stampsOnCurrentCard = currentStamps % STAMPS_FOR_REWARD
  const canRedeem = currentStamps >= STAMPS_FOR_REWARD
  const stampsLeft = canRedeem ? 0 : STAMPS_FOR_REWARD - stampsOnCurrentCard

  async function handleAddStamp() {
    const total = parseFloat(purchaseTotal)
    if (!total || isNaN(total)) {
      setMessage({ type: 'error', text: 'Ingresa el total de la compra' })
      return
    }

    setLoading(true)
    setMessage(null)

    const result = await addStamp(card.id, total)

    if (result.success && result.data) {
      setCurrentStamps(result.data.stamps)
      setPurchaseTotal('')
      if (result.data.canRedeem) {
        setMessage({
          type: 'success',
          text: `🎉 ¡Sello agregado! ${card.name} tiene una bebida gratis disponible`,
        })
      } else {
        setMessage({
          type: 'success',
          text: `✅ Sello agregado — faltan ${result.data.stampsLeft} para bebida gratis`,
        })
      }
    } else {
      setMessage({
        type: 'error',
        text: result.error ?? 'Error al agregar sello',
      })
    }

    setLoading(false)
  }

  async function handleRedeem() {
    if (!confirm(`¿Canjear bebida gratis para ${card.name}?`)) return

    setLoading(true)
    setMessage(null)

    const result = await redeemReward(card.id)

    if (result.success && result.data) {
      setCurrentStamps(result.data.stampsAfter)
      setMessage({
        type: 'success',
        text: `🎁 ¡Bebida gratis canjeada! Sellos restantes: ${result.data.stampsAfter}`,
      })
    } else {
      setMessage({
        type: 'error',
        text: result.error ?? 'Error al canjear',
      })
    }

    setLoading(false)
  }

  async function handleUpdate() {
    if (!editName || !editPhone) return
    setLoading(true)
    setMessage(null)

    const result = await updateLoyaltyCard(card.id, {
      name: editName,
      phone: editPhone,
    })

    if (result.success) {
      setIsEditing(false)
      setMessage({ type: 'success', text: '✅ Tarjeta actualizada' })
    } else {
      setMessage({
        type: 'error',
        text: result.error ?? 'Error al actualizar',
      })
    }

    setLoading(false)
  }

  async function handleDelete() {
    if (
      !confirm(
        `¿Eliminar la tarjeta de ${card.name}? Esta acción no se puede deshacer.`
      )
    )
      return
    setLoading(true)

    const result = await deleteLoyaltyCard(card.id)

    if (result.success) {
      onClose()
    } else {
      setMessage({
        type: 'error',
        text: result.error ?? 'Error al eliminar',
      })
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            {isEditing ? 'Editar tarjeta' : card.name}
          </DialogTitle>
        </DialogHeader>

        {/* Botones de acción — separados del header para no chocar con el X */}
        {!isEditing && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              onClick={handleDelete}
              className="text-destructive hover:text-destructive/80 flex items-center gap-1 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar tarjeta
            </button>
          </div>
        )}

        <div className="space-y-5">
          {/* Modo edición */}
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-foreground text-sm font-medium">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="text-foreground text-sm font-medium">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditName(card.name)
                    setEditPhone(card.phone ?? '')
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={loading || !editName || !editPhone}
                  className="flex-1"
                >
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Info del cliente */}
              {card.phone && (
                <p className="text-muted-foreground text-sm">📱 {card.phone}</p>
              )}

              {/* Grid de sellos */}
              <div>
                <p className="text-foreground mb-3 text-sm font-medium">
                  Sellos actuales — {stampsOnCurrentCard}/{STAMPS_FOR_REWARD}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: STAMPS_FOR_REWARD }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                        i < stampsOnCurrentCard
                          ? 'border-amber-400 bg-amber-400'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      {i < stampsOnCurrentCard && (
                        <Star className="h-5 w-5 fill-white text-white" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  {canRedeem
                    ? '🎉 ¡Bebida gratis disponible para canjear!'
                    : `Faltan ${stampsLeft} sello${stampsLeft !== 1 ? 's' : ''} para bebida gratis`}
                  {card.totalRedeemed > 0 && (
                    <span className="ml-2">
                      · {card.totalRedeemed} canje
                      {card.totalRedeemed !== 1 ? 's' : ''} totales
                    </span>
                  )}
                </p>
              </div>

              {/* Canjear */}
              {canRedeem && (
                <Button
                  onClick={handleRedeem}
                  disabled={loading}
                  className="w-full bg-amber-500 text-white hover:bg-amber-600"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Canjear bebida gratis
                </Button>
              )}

              {/* Agregar sello manual */}
              <div className="border-border space-y-3 rounded-xl border p-4">
                <p className="text-foreground text-sm font-medium">
                  Agregar sello manual
                </p>
                <p className="text-muted-foreground text-xs">
                  Mínimo {formatCurrency(MIN_PURCHASE_FOR_STAMP)} de compra para
                  ganar sello
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={purchaseTotal}
                    onChange={(e) => setPurchaseTotal(e.target.value)}
                    placeholder="Total de la compra $"
                    className="border-input bg-background focus:ring-ring flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                  />
                  <Button
                    onClick={handleAddStamp}
                    disabled={loading || !purchaseTotal}
                    size="sm"
                  >
                    <Star className="mr-1 h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Mensaje */}
          {message && (
            <p
              className={`rounded-lg px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-destructive bg-red-50'
              }`}
            >
              {message.text}
            </p>
          )}

          {!isEditing && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
