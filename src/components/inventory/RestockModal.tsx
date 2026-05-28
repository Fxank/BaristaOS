'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { restockIngredient } from '@/server/actions/inventory'
import { PackagePlus } from 'lucide-react'

interface Ingredient {
  id: string
  name: string
  purchaseUnit: string
  currentStock: number
  purchasePrice: number
}

interface RestockModalProps {
  ingredient: Ingredient
  onClose: () => void
}

export function RestockModal({ ingredient, onClose }: RestockModalProps) {
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState(ingredient.purchasePrice.toString())
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await restockIngredient({
      ingredientId: ingredient.id,
      quantity: Number(quantity),
      price: Number(price),
      notes: notes || undefined,
    })

    if (result.success) {
      onClose()
    } else {
      setError(
        'error' in result
          ? (result.error ?? 'Error al reabastecer')
          : 'Error al reabastecer'
      )
    }

    setLoading(false)
  }

  const newStock = ingredient.currentStock + (Number(quantity) || 0)
  const totalCost = (Number(quantity) || 0) * (Number(price) || 0)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            Reabastecer — {ingredient.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info actual */}
          <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Stock actual:{' '}
              <span className="text-foreground font-medium">
                {ingredient.currentStock.toFixed(2)} {ingredient.purchaseUnit}
              </span>
            </p>
            <p className="text-muted-foreground mt-1">
              Precio actual:{' '}
              <span className="text-foreground font-medium">
                {formatCurrency(ingredient.purchasePrice)} /{' '}
                {ingredient.purchaseUnit}
              </span>
            </p>
          </div>

          {/* Cantidad */}
          <div>
            <Label htmlFor="quantity">
              Cantidad a agregar ({ingredient.purchaseUnit})
            </Label>
            <input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ej: 5"
              className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              required
            />
          </div>

          {/* Precio */}
          <div>
            <Label htmlFor="price">
              Precio de compra ($MXN por {ingredient.purchaseUnit})
            </Label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              required
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Actualiza el precio si cambió desde la última compra
            </p>
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Compra en Costco"
              className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          {/* Preview */}
          {quantity && (
            <div className="border-border space-y-1 rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nuevo stock</span>
                <span className="text-foreground font-medium">
                  {newStock.toFixed(2)} {ingredient.purchaseUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Costo total</span>
                <span className="text-foreground font-medium">
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-destructive rounded-lg bg-red-50 px-4 py-3 text-sm">
              {error}
            </p>
          )}

          <div className="border-border flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !quantity}>
              {loading ? 'Guardando...' : 'Confirmar reabastecimiento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
