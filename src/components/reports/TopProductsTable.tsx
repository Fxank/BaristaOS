import { formatCurrency } from '@/lib/utils'

interface Product {
  recipeName: string
  variantSize: string
  quantity: number
  revenue: number
  profit: number
}

interface TopProductsTableProps {
  products: Product[]
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="border-border bg-card rounded-xl border p-12 text-center">
        <p className="text-muted-foreground text-sm">
          Sin ventas registradas en este período
        </p>
      </div>
    )
  }

  const maxRevenue = Math.max(...products.map((p) => p.revenue))

  return (
    <div className="border-border bg-card rounded-xl border shadow-sm">
      <div className="border-border border-b px-6 py-4">
        <h2 className="text-foreground font-semibold">
          Productos más vendidos
        </h2>
      </div>
      <div className="divide-border divide-y">
        {products.map((product, index) => {
          const margin =
            product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0
          const barWidth = (product.revenue / maxRevenue) * 100

          return (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-6 text-sm font-medium">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-foreground font-medium">
                      {product.recipeName}
                      <span className="text-muted-foreground ml-2 text-sm">
                        {product.variantSize}
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {product.quantity} unidad
                      {product.quantity !== 1 ? 'es' : ''} vendida
                      {product.quantity !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-semibold">
                    {formatCurrency(product.revenue)}
                  </p>
                  <p className="text-xs font-medium text-emerald-600">
                    {margin.toFixed(1)}% margen
                  </p>
                </div>
              </div>
              {/* Barra de progreso visual */}
              <div className="bg-muted mt-2 h-1.5 w-full rounded-full">
                <div
                  className="h-1.5 rounded-full bg-violet-500 transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
