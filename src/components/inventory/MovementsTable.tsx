'use client'

import { Badge } from '@/components/ui/badge'

interface Movement {
  id: string
  type: string
  quantity: number
  reason: string | null
  createdAt: Date
  ingredient: { id: string; name: string; purchaseUnit: string }
}

interface MovementsTableProps {
  movements: Movement[]
}

const MOVEMENT_LABELS = {
  PURCHASE: {
    label: 'Compra',
    class: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  SALE_USE: {
    label: 'Venta',
    class: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  ADJUSTMENT: {
    label: 'Ajuste',
    class: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  WASTE: { label: 'Merma', class: 'bg-red-100 text-red-700 border-red-200' },
}

export function MovementsTable({ movements }: MovementsTableProps) {
  if (movements.length === 0) {
    return (
      <div className="border-border bg-card rounded-xl border p-12 text-center">
        <p className="text-muted-foreground text-sm">
          No hay movimientos registrados todavía
        </p>
      </div>
    )
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border bg-muted/50 border-b">
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Ingrediente
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Tipo
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Cantidad
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Motivo
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {movements.map((movement) => {
            const typeInfo =
              MOVEMENT_LABELS[movement.type as keyof typeof MOVEMENT_LABELS]
            const isPositive = movement.quantity > 0

            return (
              <tr
                key={movement.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="text-foreground font-medium">
                    {movement.ingredient.name}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={typeInfo?.class ?? ''}>
                    {typeInfo?.label ?? movement.type}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-semibold ${
                      isPositive ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {movement.quantity.toFixed(3)}{' '}
                    {movement.ingredient.purchaseUnit}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-muted-foreground">
                    {movement.reason ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {new Date(movement.createdAt).toLocaleDateString(
                        'es-MX',
                        { day: '2-digit', month: '2-digit', year: 'numeric' }
                      )}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(movement.createdAt).toLocaleTimeString(
                        'es-MX',
                        { hour: '2-digit', minute: '2-digit', hour12: true }
                      )}
                    </p>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
