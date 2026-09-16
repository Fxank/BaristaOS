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
  paymentMethod: 'CASH' | 'TRANSFER'
  onPaymentMethodChange: (method: 'CASH' | 'TRANSFER') => void
  loyaltyPhone: string
  onLoyaltyPhoneChange: (phone: string) => void
  loyaltyStatus: 'idle' | 'not-found' | 'found' | 'creating'
  newClientName: string
  onNewClientNameChange: (name: string) => void
  onConfirmNewClient: () => void
  onCancelNewClient: () => void
}

export function POSCart({
  cart,
  total,
  onUpdateQuantity,
  onCheckout,
  paymentMethod,
  onPaymentMethodChange,
  loyaltyPhone,
  onLoyaltyPhoneChange,
  loyaltyStatus,
  newClientName,
  onNewClientNameChange,
  onConfirmNewClient,
  onCancelNewClient,
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

      <div className="border-border space-y-3 border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-foreground font-semibold">Total</span>
          <span className="text-foreground text-xl font-bold">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Lealtad */}
        <div className="space-y-2">
          <p className="text-foreground text-sm font-medium">
            Teléfono lealtad (opcional)
          </p>
          <input
            type="tel"
            value={loyaltyPhone}
            onChange={(e) => onLoyaltyPhoneChange(e.target.value)}
            placeholder="5551234567"
            className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />

          {loyaltyStatus === 'found' && (
            <p className="text-xs font-medium text-emerald-600">
              ✅ Cliente registrado — se agregarán sellos automáticamente
            </p>
          )}

          {loyaltyStatus === 'not-found' && (
            <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-3">
              <p className="text-xs text-amber-600">
                ⚠️ No registrado — ¿registrar cliente?
              </p>
              <input
                type="text"
                value={newClientName}
                onChange={(e) => onNewClientNameChange(e.target.value)}
                placeholder="Nombre del cliente"
                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancelNewClient}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirmNewClient}
                  className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                >
                  Registrar
                </button>
              </div>
            </div>
          )}

          {loyaltyStatus === 'creating' && (
            <p className="text-muted-foreground text-xs">
              Registrando cliente...
            </p>
          )}
        </div>

        {/* Método de pago */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPaymentMethodChange('CASH')}
            className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              paymentMethod === 'CASH'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground'
            }`}
          >
            💵 Efectivo
          </button>
          <button
            type="button"
            onClick={() => onPaymentMethodChange('TRANSFER')}
            className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              paymentMethod === 'TRANSFER'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground'
            }`}
          >
            📱 Transferencia
          </button>
        </div>

        <Button onClick={onCheckout} className="w-full" size="lg">
          Registrar venta
        </Button>
      </div>
    </div>
  )
}
