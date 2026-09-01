'use client'

import { LocalRecipe, LocalVariant } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface POSMenuProps {
  recipes: LocalRecipe[]
  selectedRecipe: LocalRecipe | null
  selectedVariant: LocalVariant | null
  selectedOptions: Record<string, string>
  onSelectRecipe: (recipe: LocalRecipe) => void
  onSelectVariant: (variant: LocalVariant) => void
  onOptionChange: (
    groupId: string,
    optionId: string,
    multiSelect: boolean
  ) => void
  onAddToCart: () => void
  onBackToRecipes: () => void
  onBackToVariants: () => void
  canAdd: boolean
}

export function POSMenu({
  recipes,
  selectedRecipe,
  selectedVariant,
  selectedOptions,
  onSelectRecipe,
  onSelectVariant,
  onOptionChange,
  onAddToCart,
  onBackToRecipes,
  onBackToVariants,
  canAdd,
}: POSMenuProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground text-sm">Cargando menú...</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Se necesita internet la primera vez para cargar el menú
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Lista de bebidas */}
      {!selectedRecipe && (
        <>
          <h2 className="text-foreground font-semibold">
            Selecciona una bebida
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {recipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe)}
                className="border-border bg-card hover:bg-muted rounded-xl border p-4 text-left transition-colors"
              >
                <p className="text-foreground text-sm font-medium">
                  {recipe.name}
                </p>
                {recipe.categoryName && (
                  <p
                    className="mt-1 text-xs"
                    style={{ color: recipe.categoryColor ?? '#888' }}
                  >
                    {recipe.categoryName}
                  </p>
                )}
                <p className="text-muted-foreground mt-2 text-xs">
                  desde{' '}
                  {formatCurrency(
                    Math.min(...recipe.variants.map((v) => v.salePrice))
                  )}
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Selección de tamaño */}
      {selectedRecipe && !selectedVariant && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToRecipes}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <h2 className="text-foreground font-semibold">
              {selectedRecipe.name} — Tamaño
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {selectedRecipe.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(variant)}
                className="border-border bg-card hover:bg-muted rounded-xl border p-4 text-left transition-colors"
              >
                <p className="text-foreground font-medium">{variant.size}</p>
                <p className="text-primary mt-1 font-bold">
                  {formatCurrency(variant.salePrice)}
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Selección de opciones */}
      {selectedRecipe && selectedVariant && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToVariants}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <h2 className="text-foreground font-semibold">
              {selectedRecipe.name} ({selectedVariant.size})
            </h2>
          </div>

          {selectedRecipe.optionGroups.length === 0 ? (
            <div className="border-border bg-card rounded-xl border p-4">
              <p className="text-muted-foreground text-center text-sm">
                Sin personalizaciones disponibles
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedRecipe.optionGroups.map((group) => (
                <div
                  key={group.id}
                  className="border-border bg-card rounded-xl border p-4"
                >
                  <p className="text-foreground mb-3 text-sm font-medium">
                    {group.name}
                    {group.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                    {group.multiSelect && (
                      <span className="text-muted-foreground ml-1 text-xs">
                        (varios)
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt) => {
                      const selectedIds = (selectedOptions[group.id] ?? '')
                        .split(',')
                        .filter(Boolean)
                      const isSelected = selectedIds.includes(opt.id)

                      return (
                        <button
                          key={opt.id}
                          onClick={() =>
                            onOptionChange(group.id, opt.id, group.multiSelect)
                          }
                          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-foreground hover:bg-muted'
                          }`}
                        >
                          {opt.name}
                          {opt.priceModifier > 0 && (
                            <span className="ml-1 text-xs opacity-80">
                              +{formatCurrency(opt.priceModifier)}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={onAddToCart}
            disabled={!canAdd}
            className="w-full"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar al carrito —{' '}
            {formatCurrency(
              selectedVariant.salePrice +
                selectedRecipe.optionGroups.reduce((total, group) => {
                  const selectedIds = (selectedOptions[group.id] ?? '')
                    .split(',')
                    .filter(Boolean)
                  return (
                    total +
                    selectedIds.reduce((sum, optId) => {
                      const opt = group.options.find((o) => o.id === optId)
                      return sum + (opt?.priceModifier ?? 0)
                    }, 0)
                  )
                }, 0)
            )}
          </Button>
        </>
      )}
    </div>
  )
}
