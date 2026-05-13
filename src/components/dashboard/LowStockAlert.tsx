import { AlertTriangle } from 'lucide-react'
import { DashboardStats } from '@/server/services/dashboard.service'

interface LowStockAlertProps {
  ingredients: DashboardStats['lowStockIngredients']
}

export function LowStockAlert({ ingredients }: LowStockAlertProps) {
  if (ingredients.length === 0) {
    return (
      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <h2 className="text-foreground font-semibold">Alertas de inventario</h2>
        <div className="mt-4 flex items-center gap-2 text-emerald-600">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <p className="text-sm">
            Todos los ingredientes tienen stock suficiente
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <h2 className="text-foreground font-semibold">Alertas de inventario</h2>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          {ingredients.length} ingrediente{ingredients.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {ingredients.map((ingredient) => {
          const current = Number(ingredient.currentStock)
          const minimum = Number(ingredient.minimumStock)
          const percentage = Math.min((current / minimum) * 100, 100)

          return (
            <div key={ingredient.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">
                  {ingredient.name}
                </span>
                <span className="text-muted-foreground">
                  {current} / {minimum} {ingredient.purchaseUnit}
                </span>
              </div>
              <div className="bg-secondary mt-1.5 h-1.5 w-full rounded-full">
                <div
                  className="h-1.5 rounded-full bg-amber-500 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
