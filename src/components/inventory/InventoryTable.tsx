'use client'

import { PackagePlus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { getStockStatus } from '@/types/ingredient'

interface Category {
  id: string
  name: string
  color: string | null
}

interface Ingredient {
  id: string
  name: string
  purchaseUnit: string
  baseUnit: string
  currentStock: number
  minimumStock: number
  purchasePrice: number
  conversionFactor: number
  wastePercentage: number
  category: Category | null
  stockMovements: { createdAt: Date; type: string }[]
}

interface InventoryTableProps {
  ingredients: Ingredient[]
  onRestock: (ingredient: Ingredient) => void
}

export function InventoryTable({
  ingredients,
  onRestock,
}: InventoryTableProps) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border bg-muted/50 border-b">
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Ingrediente
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Stock actual
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Stock mínimo
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Precio actual
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Estado
            </th>
            <th className="text-muted-foreground px-4 py-3 text-right font-medium">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {ingredients.map((ingredient) => {
            const status = getStockStatus(
              ingredient.currentStock,
              ingredient.minimumStock
            )

            return (
              <tr
                key={ingredient.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="text-foreground font-medium">
                      {ingredient.name}
                    </p>
                    {ingredient.category && (
                      <Badge
                        variant="secondary"
                        className="mt-1"
                        style={{
                          backgroundColor:
                            (ingredient.category.color ?? '#888') + '20',
                          color: ingredient.category.color ?? '#888',
                        }}
                      >
                        {ingredient.category.name}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p
                    className={`font-semibold ${
                      status === 'critical'
                        ? 'text-red-600'
                        : status === 'low'
                          ? 'text-amber-600'
                          : 'text-foreground'
                    }`}
                  >
                    {ingredient.currentStock.toFixed(2)}{' '}
                    {ingredient.purchaseUnit}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-muted-foreground">
                    {ingredient.minimumStock} {ingredient.purchaseUnit}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground">
                    {formatCurrency(ingredient.purchasePrice)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    por {ingredient.purchaseUnit}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {status === 'healthy' && (
                    <Badge
                      variant="secondary"
                      className="border-emerald-200 bg-emerald-100 text-emerald-700"
                    >
                      Saludable
                    </Badge>
                  )}
                  {status === 'low' && (
                    <Badge
                      variant="secondary"
                      className="border-amber-200 bg-amber-100 text-amber-700"
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Stock bajo
                    </Badge>
                  )}
                  {status === 'critical' && (
                    <Badge
                      variant="secondary"
                      className="border-red-200 bg-red-100 text-red-700"
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Agotado
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestock(ingredient)}
                    >
                      <PackagePlus className="mr-1 h-4 w-4" />
                      Reabastecer
                    </Button>
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
