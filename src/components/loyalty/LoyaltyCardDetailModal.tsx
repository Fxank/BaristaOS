'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Star, Gift } from 'lucide-react'
import { addStamp, redeemReward } from '@/server/actions/loyalty'
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

  const stampsOnCurrentCard = currentStamps % STAMPS_FOR_REWARD
  const canRedeem = currentStamps > 0 && currentStamps % STAMPS_FOR_REWARD === 0
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            {card.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
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

          {/* Canjear si puede */}
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

          {/* Agregar sello */}
          <div className="border-border space-y-3 rounded-xl border p-4">
            <p className="text-foreground text-sm font-medium">Agregar sello</p>
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

          {/* Mensaje de resultado */}
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

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
