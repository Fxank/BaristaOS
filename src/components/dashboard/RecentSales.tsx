import { formatCurrency, formatDate } from '@/lib/utils'
import { DashboardStats } from '@/server/services/dashboard.service'
import { ShoppingCart } from 'lucide-react'

interface RecentSalesProps {
  sales: DashboardStats['recentSales']
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <h2 className="text-foreground font-semibold">Ventas recientes</h2>
      {sales.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
          <ShoppingCart className="text-muted-foreground/50 h-8 w-8" />
          <p className="text-muted-foreground mt-2 text-sm">
            No hay ventas registradas todavía
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {sales.map((sale) => {
            const total = sale.items.reduce((sum, item) => {
              return sum + Number(item.unitPrice) * item.quantity
            }, 0)

            return (
              <div
                key={sale.id}
                className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {sale.folio}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {sale.items
                      .map(
                        (item) =>
                          `${item.recipe.name} (${item.recipeVariant.size})`
                      )
                      .join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-foreground text-sm font-bold">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(sale.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
