'use client'

import {
  Pencil,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  Settings2,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import {
  RecipeWithRelations,
  calculateVariantCostRange,
  calculateVariantMargin,
  getMarginColor,
} from '@/types/recipe'
import { deleteRecipe, permanentDeleteRecipe } from '@/server/actions/recipes'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { OptionGroupsManager } from '@/components/recipes/OptionGroupsManager'

interface RecipeCardProps {
  recipe: RecipeWithRelations
  ingredients: {
    id: string
    name: string
    baseUnit: string
    purchasePrice: number
    conversionFactor: number
    wastePercentage: number
  }[]
  onEdit: (recipe: RecipeWithRelations) => void
}

export function RecipeCard({ recipe, ingredients, onEdit }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  async function handleDelete() {
    const isInactive = recipe.status === 'INACTIVE'
    const message = isInactive
      ? `¿Eliminar permanentemente "${recipe.name}"? Esta acción no se puede deshacer.`
      : `¿Desactivar la receta "${recipe.name}"?`
    if (!confirm(message)) return
    setDeleting(true)
    if (isInactive) {
      await permanentDeleteRecipe(recipe.id)
    } else {
      await deleteRecipe(recipe.id)
    }
    setDeleting(false)
  }

  const statusLabels = {
    ACTIVE: { label: 'Activa', class: 'bg-emerald-100 text-emerald-700' },
    INACTIVE: { label: 'Inactiva', class: 'bg-gray-100 text-gray-600' },
    SEASONAL: { label: 'Temporada', class: 'bg-blue-100 text-blue-700' },
  }

  const statusInfo = statusLabels[recipe.status]

  return (
    <>
      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        {/* Header */}
        <div className="border-border border-b p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-foreground truncate font-semibold">
                  {recipe.name}
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.class}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              {recipe.description && (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                  {recipe.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {recipe.category && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: (recipe.category.color ?? '#888') + '20',
                      color: recipe.category.color ?? '#888',
                    }}
                  >
                    {recipe.category.name}
                  </Badge>
                )}
                {recipe.prepTimeMinutes && (
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {recipe.prepTimeMinutes} min
                  </span>
                )}
                {recipe.optionGroups.length > 0 && (
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Settings2 className="h-3 w-3" />
                    {recipe.optionGroups.length} grupo
                    {recipe.optionGroups.length !== 1 ? 's' : ''} de opciones
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(true)}
                title="Gestionar opciones"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(recipe)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Variantes */}
        <div className="space-y-3 p-4">
          {recipe.variants.map((variant) => {
            const costRange = calculateVariantCostRange(
              variant,
              recipe.optionGroups
            )
            const hasRange = costRange.min !== costRange.max
            const margin = calculateVariantMargin(
              variant.salePrice,
              costRange.min
            )
            const marginColor = getMarginColor(margin)

            return (
              <div key={variant.id} className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-sm font-medium">
                    {variant.size}
                  </span>
                  <span className="text-foreground text-sm font-bold">
                    {formatCurrency(variant.salePrice)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {hasRange ? (
                      <>
                        Costo:{' '}
                        <span className="text-foreground">
                          {formatCurrency(costRange.min)} —{' '}
                          {formatCurrency(costRange.max)}
                        </span>
                      </>
                    ) : (
                      <>Costo: {formatCurrency(costRange.min)}</>
                    )}
                  </span>
                  <span className={`font-semibold ${marginColor}`}>
                    {hasRange ? (
                      <>desde {margin.toFixed(1)}% margen</>
                    ) : (
                      <>{margin.toFixed(1)}% margen</>
                    )}
                  </span>
                </div>
                <div className="border-border bg-border mt-2 h-1.5 w-full rounded-full">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      margin >= 60
                        ? 'bg-emerald-500'
                        : margin >= 40
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(margin, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Toggle ingredientes */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground border-border hover:bg-muted/30 flex w-full items-center justify-center gap-1 border-t py-2 text-xs transition-colors"
        >
          {expanded ? (
            <>
              Ver menos <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Ver ingredientes <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>

        {/* Ingredientes expandibles */}
        {expanded && (
          <div className="border-border border-t px-4 pb-4">
            {recipe.variants.map((variant) => (
              <div key={variant.id} className="mt-3">
                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                  {variant.size}
                </p>
                <div className="space-y-1">
                  {variant.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-foreground">
                        {item.ingredient.name}
                      </span>
                      <span className="text-muted-foreground">
                        {item.quantity} {item.ingredient.baseUnit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de opciones */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="max-h-[90vh] w-[95vw]! max-w-4xl! overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Opciones — {recipe.name}
            </DialogTitle>
          </DialogHeader>
          <OptionGroupsManager
            recipeId={recipe.id}
            optionGroups={recipe.optionGroups}
            ingredients={ingredients}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
