'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import {
  calculateVariantMargin,
  getMarginColor,
  RecipeWithRelations,
} from '@/types/recipe'
import { createRecipe, updateRecipe } from '@/server/actions/recipes'

const SIZES = ['Único', 'Chico', 'Mediano', 'Grande', 'Extra Grande']
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'INACTIVE', label: 'Inactiva' },
  { value: 'SEASONAL', label: 'De temporada' },
]

interface Category {
  id: string
  name: string
  color: string | null
}

interface Ingredient {
  id: string
  name: string
  baseUnit: string
  purchasePrice: number
  conversionFactor: number
  wastePercentage: number
}

interface VariantForm {
  size: string
  salePrice: string
  items: { ingredientId: string; quantity: string }[]
}

interface RecipeFormProps {
  recipe?: RecipeWithRelations | null
  categories: Category[]
  ingredients: Ingredient[]
  onSuccess: () => void
}

export function RecipeForm({
  recipe,
  categories,
  ingredients,
  onSuccess,
}: RecipeFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const [name, setName] = useState(recipe?.name ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [prepTime, setPrepTime] = useState(
    recipe?.prepTimeMinutes?.toString() ?? ''
  )
  const [status, setStatus] = useState(recipe?.status ?? 'ACTIVE')
  const [categoryId, setCategoryId] = useState(recipe?.category?.id ?? '')

  const [variants, setVariants] = useState<VariantForm[]>(
    recipe?.variants.length
      ? recipe.variants.map((v) => ({
          size: v.size,
          salePrice: v.salePrice.toString(),
          items: v.items.map((i) => ({
            ingredientId: i.ingredient.id,
            quantity: i.quantity.toString(),
          })),
        }))
      : [{ size: 'Único', salePrice: '', items: [] }]
  )

  function addVariant() {
    setVariants([...variants, { size: 'Mediano', salePrice: '', items: [] }])
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index))
  }

  function updateVariant(
    index: number,
    field: keyof VariantForm,
    value: string
  ) {
    setVariants(
      variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }

  function addIngredientToVariant(variantIndex: number) {
    setVariants(
      variants.map((v, i) =>
        i === variantIndex
          ? { ...v, items: [...v.items, { ingredientId: '', quantity: '' }] }
          : v
      )
    )
  }

  function removeIngredientFromVariant(
    variantIndex: number,
    itemIndex: number
  ) {
    setVariants(
      variants.map((v, i) =>
        i === variantIndex
          ? { ...v, items: v.items.filter((_, j) => j !== itemIndex) }
          : v
      )
    )
  }

  function updateVariantItem(
    variantIndex: number,
    itemIndex: number,
    field: 'ingredientId' | 'quantity',
    value: string
  ) {
    setVariants(
      variants.map((v, i) =>
        i === variantIndex
          ? {
              ...v,
              items: v.items.map((item, j) =>
                j === itemIndex ? { ...item, [field]: value } : item
              ),
            }
          : v
      )
    )
  }

  function getVariantCostPreview(variant: VariantForm): number {
    return variant.items.reduce((total, item) => {
      const ingredient = ingredients.find((i) => i.id === item.ingredientId)
      if (!ingredient || !item.quantity) return total
      const unitCost = ingredient.purchasePrice / ingredient.conversionFactor
      const unitCostWithWaste =
        unitCost * (1 + ingredient.wastePercentage / 100)
      return total + unitCostWithWaste * Number(item.quantity)
    }, 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const data = {
      name,
      description: description || undefined,
      prepTimeMinutes: prepTime ? Number(prepTime) : undefined,
      status: status as 'ACTIVE' | 'INACTIVE' | 'SEASONAL',
      categoryId: categoryId || undefined,
      variants: variants.map((v) => ({
        size: v.size,
        salePrice: Number(v.salePrice),
        items: v.items
          .filter((i) => i.ingredientId && i.quantity)
          .map((i) => ({
            ingredientId: i.ingredientId,
            quantity: Number(i.quantity),
          })),
      })),
    }

    const result = recipe
      ? await updateRecipe(recipe.id, data)
      : await createRecipe(data)

    if (result.success) {
      onSuccess()
    } else {
      if ('fieldErrors' in result && result.fieldErrors) {
        setErrors(result.fieldErrors as Record<string, string[]>)
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información general */}
      <div className="space-y-4">
        <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Información general
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nombre de la bebida</Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Frappé Moka"
              className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            />
            {errors.name && (
              <p className="text-destructive mt-1 text-xs">{errors.name[0]}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label>Descripción (opcional)</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción de la bebida..."
              rows={2}
              className="border-input bg-background focus:ring-ring mt-1 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div>
            <Label>Tiempo de preparación (min)</Label>
            <input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="Ej: 4"
              min="1"
              className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div>
            <Label>Estado</Label>
            <Select
              value={status}
              onValueChange={(val) =>
                val && setStatus(val as 'ACTIVE' | 'INACTIVE' | 'SEASONAL')
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue>
                  {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Categoría (opcional)</Label>
            <Select
              value={categoryId}
              onValueChange={(val) => setCategoryId(val ?? '')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue>
                  {categoryId
                    ? categories.find((c) => c.id === categoryId)?.name
                    : 'Sin categoría'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Variantes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
            Variantes y precios
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar tamaño
          </Button>
        </div>

        {variants.map((variant, variantIndex) => {
          const cost = getVariantCostPreview(variant)
          const salePrice = Number(variant.salePrice) || 0
          const margin = calculateVariantMargin(salePrice, cost)
          const marginColor = getMarginColor(margin)

          return (
            <div
              key={variantIndex}
              className="border-border space-y-4 rounded-xl border p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="grid flex-1 grid-cols-2 gap-3">
                  <div>
                    <Label>Tamaño</Label>
                    <Select
                      value={variant.size}
                      onValueChange={(val) =>
                        val && updateVariant(variantIndex, 'size', val)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue>{variant.size}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Precio de venta ($MXN)</Label>
                    <input
                      type="number"
                      step="0.50"
                      value={variant.salePrice}
                      onChange={(e) =>
                        updateVariant(variantIndex, 'salePrice', e.target.value)
                      }
                      placeholder="Ej: 65"
                      className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                    />
                  </div>
                </div>
                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(variantIndex)}
                    className="text-destructive hover:text-destructive mt-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {cost > 0 && (
                <div className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      Costo:{' '}
                      <span className="text-foreground font-medium">
                        {formatCurrency(cost)}
                      </span>
                    </span>
                    {salePrice > 0 && (
                      <span className="text-muted-foreground">
                        Ganancia:{' '}
                        <span className="text-foreground font-medium">
                          {formatCurrency(salePrice - cost)}
                        </span>
                      </span>
                    )}
                  </div>
                  {salePrice > 0 && (
                    <span className={`font-bold ${marginColor}`}>
                      {margin.toFixed(1)}% margen
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Ingredientes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addIngredientToVariant(variantIndex)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Agregar
                  </Button>
                </div>

                {variant.items.length === 0 && (
                  <p className="text-muted-foreground py-2 text-xs">
                    Sin ingredientes — agrega al menos uno
                  </p>
                )}

                {variant.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select
                        value={item.ingredientId}
                        onValueChange={(val) =>
                          val &&
                          updateVariantItem(
                            variantIndex,
                            itemIndex,
                            'ingredientId',
                            val
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {item.ingredientId
                              ? ingredients.find(
                                  (i) => i.id === item.ingredientId
                                )?.name
                              : 'Selecciona ingrediente'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id}>
                              {ing.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateVariantItem(
                            variantIndex,
                            itemIndex,
                            'quantity',
                            e.target.value
                          )
                        }
                        placeholder="Cant."
                        className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                      />
                    </div>
                    <span className="text-muted-foreground w-10 shrink-0 text-xs">
                      {item.ingredientId
                        ? ingredients.find((i) => i.id === item.ingredientId)
                            ?.baseUnit
                        : ''}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeIngredientFromVariant(variantIndex, itemIndex)
                      }
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {errors.variants && (
          <p className="text-destructive text-xs">{errors.variants[0]}</p>
        )}
      </div>

      <div className="border-border flex justify-end gap-3 border-t pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Guardando...'
            : recipe
              ? 'Guardar cambios'
              : 'Crear receta'}
        </Button>
      </div>
    </form>
  )
}
