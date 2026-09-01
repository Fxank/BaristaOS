'use client'

import { CartItem } from '@/components/pos/POSClient'
import { formatCurrency } from '@/lib/utils'
import { Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface POSCartProps {
  cart: CartItem[]
  total: number
  onUpdateQuantity: (localId: string, quantity: number) => void
  onCheckout: () => void
}

export function POSCart({
  cart,
  total,
  onUpdateQuantity,
  onCheckout,
}: POSCartProps) {
  if (cart.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <ShoppingBag className="text-muted-foreground/50 h-12 w-12" />
        <p className="text-muted-foreground mt-3 text-sm">
          El carrito está vacío
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Selecciona bebidas del menú
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {cart.map((item) => (
          <div
            key={item.localId}
            className="border-border bg-card rounded-xl border p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-foreground text-sm font-medium">
                  {item.recipeName}
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({item.variantSize})
                  </span>
                </p>
                {item.optionNames.length > 0 && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {item.optionNames.join(', ')}
                  </p>
                )}
                <p className="text-primary mt-1 text-sm font-bold">
                  {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <button
                onClick={() => onUpdateQuantity(item.localId, 0)}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.localId, item.quantity - 1)
                  }
                  className="border-border bg-background hover:bg-muted flex h-7 w-7 items-center justify-center rounded border text-sm"
                >
                  −
                </button>
                <span className="text-foreground w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity(item.localId, item.quantity + 1)
                  }
                  className="border-border bg-background hover:bg-muted flex h-7 w-7 items-center justify-center rounded border text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-foreground text-sm font-semibold">
                {formatCurrency(item.unitPrice * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total y botón de cobrar */}
      <div className="border-border space-y-3 border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-foreground font-semibold">Total</span>
          <span className="text-foreground text-xl font-bold">
            {formatCurrency(total)}
          </span>
        </div>
        <Button onClick={onCheckout} className="w-full" size="lg">
          Registrar venta
        </Button>
      </div>
    </div>
  )
}
