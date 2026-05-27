'use client'

import { useState } from 'react'
import { Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { getStockStatus, calculateIngredientUnitCost } from '@/types/ingredient'
import { deleteIngredient } from '@/server/actions/ingredients'

interface Ingredient {
  id: string
  name: string
  baseUnit: string
  purchaseUnit: string
  conversionFactor: unknown
  purchasePrice: unknown
  currentStock: unknown
  minimumStock: unknown
  wastePercentage: unknown
  category: { id: string; name: string; color: string | null } | null
  supplier: { id: string; name: string } | null
}

interface IngredientTableProps {
  ingredients: Ingredient[]
  onEdit: (ingredient: Ingredient) => void
}

export function IngredientTable({ ingredients, onEdit }: IngredientTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este ingrediente?'))
      return
    setDeletingId(id)
    await deleteIngredient(id)
    setDeletingId(null)
  }

  if (ingredients.length === 0) {
    return (
      <div className="border-border bg-card rounded-xl border p-12 text-center">
        <p className="text-muted-foreground">No se encontraron ingredientes</p>
      </div>
    )
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border bg-muted/50 border-b">
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Nombre
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Categoría
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Costo unitario
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left font-medium">
              Stock actual
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
            const currentStock = Number(ingredient.currentStock)
            const minimumStock = Number(ingredient.minimumStock)
            const purchasePrice = Number(ingredient.purchasePrice)
            const conversionFactor = Number(ingredient.conversionFactor)
            const wastePercentage = Number(ingredient.wastePercentage)

            const status = getStockStatus(currentStock, minimumStock)
            const unitCost = calculateIngredientUnitCost(
              purchasePrice,
              conversionFactor,
              wastePercentage
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
                    <p className="text-muted-foreground text-xs">
                      {ingredient.purchaseUnit} → {ingredient.baseUnit}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {ingredient.category ? (
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: ingredient.category.color + '20',
                        color: ingredient.category.color ?? undefined,
                        borderColor: ingredient.category.color + '40',
                      }}
                    >
                      {ingredient.category.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground font-medium">
                    {formatCurrency(unitCost)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    por {ingredient.baseUnit}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground font-medium">
                    {currentStock} {ingredient.purchaseUnit}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    mín. {minimumStock} {ingredient.purchaseUnit}
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(ingredient)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ingredient.id)}
                      disabled={deletingId === ingredient.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
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
