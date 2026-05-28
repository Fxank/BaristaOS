'use client'

import { useState } from 'react'
import { Plus, Trash2, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import {
  RecipeForSale,
  RecipeVariantForSale,
  calculateVariantCostForSale,
} from '@/types/sale'
import { createSale } from '@/server/actions/sales'

interface CartItem {
  recipeId: string
  recipeName: string
  recipeCategory: string | null
  recipeVariantId: string
  variantSize: string
  quantity: number
  unitPrice: number
  unitCost: number
}

interface NewSaleModalProps {
  open: boolean
  onClose: () => void
  recipes: RecipeForSale[]
}

const CHANNELS = [
  { value: 'IN_STORE', label: 'En local' },
  { value: 'TAKEOUT', label: 'Para llevar' },
  { value: 'DELIVERY', label: 'Delivery' },
]

export function NewSaleModal({ open, onClose, recipes }: NewSaleModalProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [channel, setChannel] = useState('IN_STORE')
  const [discount, setDiscount] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState('1')

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId)
  const selectedVariant = selectedRecipe?.variants.find(
    (v) => v.id === selectedVariantId
  ) as RecipeVariantForSale | undefined

  function handleRecipeChange(recipeId: string) {
    setSelectedRecipeId(recipeId)
    // Limpiamos el variant para forzar nueva selección
    setSelectedVariantId('')
  }

  function addToCart() {
    if (!selectedRecipe || !selectedVariant) return

    const unitCost = calculateVariantCostForSale(selectedVariant)
    const quantity = parseInt(selectedQuantity) || 1

    const existingIndex = cart.findIndex(
      (item) => item.recipeVariantId === selectedVariantId
    )

    if (existingIndex >= 0) {
      setCart(
        cart.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          recipeId: selectedRecipe.id,
          recipeName: selectedRecipe.name,
          recipeCategory: selectedRecipe.category?.name ?? null,
          recipeVariantId: selectedVariant.id,
          variantSize: selectedVariant.size,
          quantity,
          unitPrice: selectedVariant.salePrice,
          unitCost,
        },
      ])
    }

    setSelectedRecipeId('')
    setSelectedVariantId('')
    setSelectedQuantity('1')
  }

  function removeFromCart(index: number) {
    setCart(cart.filter((_, i) => i !== index))
  }

  function updateQuantity(index: number, quantity: number) {
    if (quantity < 1) return
    setCart(cart.map((item, i) => (i === index ? { ...item, quantity } : item)))
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  )
  const discountAmount = parseFloat(discount) || 0
  const total = subtotal - discountAmount
  const profit = cart.reduce(
    (total, item) => total + (item.unitPrice - item.unitCost) * item.quantity,
    0
  )

  async function handleSubmit() {
    if (cart.length === 0) {
      setError('Agrega al menos un producto')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const result = await createSale({
      channel,
      notes: notes || undefined,
      discount: discountAmount,
      items: cart.map((item) => ({
        recipeId: item.recipeId,
        recipeVariantId: item.recipeVariantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: item.unitCost,
      })),
    })

    if (result.success && 'data' in result && result.data) {
      setSuccess(`¡Venta ${result.data.folio} registrada exitosamente!`)
      setCart([])
      setDiscount('')
      setNotes('')
      setTimeout(() => {
        setSuccess('')
        onClose()
      }, 2000)
    } else {
      setError(
        'error' in result
          ? (result.error ?? 'Error al registrar la venta')
          : 'Error al registrar la venta'
      )
    }

    setLoading(false)
  }

  function handleClose() {
    setCart([])
    setSelectedRecipeId('')
    setSelectedVariantId('')
    setSelectedQuantity('1')
    setChannel('IN_STORE')
    setDiscount('')
    setNotes('')
    setError('')
    setSuccess('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-[95vw]! max-w-4xl! overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nueva venta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selector de producto */}
          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Agregar producto
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
              {/* Receta */}
              <div>
                <Label>Bebida</Label>
                <Select
                  value={selectedRecipeId}
                  onValueChange={(val) => val && handleRecipeChange(val)}
                >
                  <SelectTrigger className="mt-1 h-auto min-h-9">
                    <SelectValue>
                      {selectedRecipeId ? (
                        <div className="flex flex-col items-start">
                          <span>
                            {
                              recipes.find((r) => r.id === selectedRecipeId)
                                ?.name
                            }
                          </span>
                          {recipes.find((r) => r.id === selectedRecipeId)
                            ?.category && (
                            <span className="text-muted-foreground text-xs">
                              {
                                recipes.find((r) => r.id === selectedRecipeId)
                                  ?.category?.name
                              }
                            </span>
                          )}
                        </div>
                      ) : (
                        'Selecciona bebida'
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="w-75">
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        <span>{recipe.name}</span>
                        {recipe.category && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            {recipe.category.name}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Variante — key fuerza re-render cuando cambia la receta */}
              <div>
                <Label>Tamaño</Label>
                <Select
                  key={selectedRecipeId}
                  value={selectedVariantId}
                  onValueChange={(val) => val && setSelectedVariantId(val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue>
                      {selectedVariantId
                        ? selectedRecipe?.variants.find(
                            (v) => v.id === selectedVariantId
                          )?.size
                        : 'Tamaño'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {selectedRecipe?.variants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.size} — {formatCurrency(variant.salePrice)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cantidad */}
              <div>
                <Label>Cantidad</Label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                  />
                  <Button
                    type="button"
                    onClick={addToCart}
                    disabled={!selectedVariantId}
                    size="sm"
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Carrito */}
          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Productos en esta venta
            </h3>

            {cart.length === 0 ? (
              <div className="border-border rounded-lg border border-dashed p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Sin productos — agrega bebidas arriba
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3"
                  >
                    <div className="flex-1">
                      <p className="text-foreground font-medium">
                        {item.recipeName}
                        <span className="text-muted-foreground ml-1 text-sm">
                          ({item.variantSize})
                        </span>
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatCurrency(item.unitPrice)} c/u · Costo:{' '}
                        {formatCurrency(item.unitCost)}
                        {item.recipeCategory && (
                          <span> · {item.recipeCategory}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(index, item.quantity - 1)
                          }
                          className="border-border bg-background hover:bg-muted flex h-7 w-7 items-center justify-center rounded border text-sm"
                        >
                          −
                        </button>
                        <span className="text-foreground w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(index, item.quantity + 1)
                          }
                          className="border-border bg-background hover:bg-muted flex h-7 w-7 items-center justify-center rounded border text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-foreground w-20 text-right font-medium">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opciones */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Canal de venta</Label>
              <Select
                value={channel}
                onValueChange={(val) => val && setChannel(val)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue>
                    {CHANNELS.find((c) => c.value === channel)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descuento ($MXN)</Label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0.00"
                className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Notas (opcional)</Label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Sin hielo, extra caramelo..."
                className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Resumen */}
          {cart.length > 0 && (
            <div className="border-border space-y-2 rounded-xl border p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="text-destructive">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
              <div className="border-border flex justify-between border-t pt-2">
                <span className="text-foreground font-semibold">Total</span>
                <span className="text-foreground font-bold">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ganancia estimada</span>
                <span className="font-medium text-emerald-600">
                  {formatCurrency(profit)}
                </span>
              </div>
            </div>
          )}

          {/* Mensajes */}
          {error && (
            <p className="text-destructive rounded-lg bg-red-50 px-4 py-3 text-sm">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          )}

          {/* Botones */}
          <div className="border-border flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || cart.length === 0}
            >
              {loading
                ? 'Registrando...'
                : `Registrar venta (${formatCurrency(total)})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
