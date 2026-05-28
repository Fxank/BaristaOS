'use client'

import { formatCurrency } from '@/lib/utils'
import {
  SaleWithItems,
  CHANNEL_LABELS,
  calculateSaleTotal,
  calculateSaleProfit,
} from '@/types/sale'
import { ShoppingCart } from 'lucide-react'

interface SalesListProps {
  sales: SaleWithItems[]
}

export function SalesList({ sales }: SalesListProps) {
  if (sales.length === 0) {
    return (
      <div className="border-border bg-card rounded-xl border p-12 text-center">
        <ShoppingCart className="text-muted-foreground/50 mx-auto h-10 w-10" />
        <p className="text-muted-foreground mt-3 text-sm">
          No hay ventas registradas todavía
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Registra tu primera venta con el botón de arriba
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
              Folio
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Productos
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Canal
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Total
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Ganancia
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {sales.map((sale) => {
            const total = calculateSaleTotal(sale)
            const profit = calculateSaleProfit(sale)

            return (
              <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-foreground font-mono font-medium">
                    {sale.folio}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    {sale.items.map((item) => (
                      <p key={item.id} className="text-foreground">
                        {item.quantity}x {item.recipe.name}{' '}
                        <span className="text-muted-foreground">
                          ({item.recipeVariant.size})
                        </span>
                      </p>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-muted-foreground">
                    {CHANNEL_LABELS[sale.channel]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-foreground font-medium">
                    {formatCurrency(total)}
                  </span>
                  {sale.discount > 0 && (
                    <p className="text-muted-foreground text-xs">
                      Descuento: {formatCurrency(sale.discount)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(profit)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-muted-foreground text-xs">
                    {new Date(sale.createdAt).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                  <p className="text-muted-foreground text-xs">
                    {new Date(sale.createdAt).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
