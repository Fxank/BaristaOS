export type RecipeVariantWithItems = {
  id: string
  size: string
  salePrice: number
  recipeId: string
  items: {
    id: string
    quantity: number
    ingredient: {
      id: string
      name: string
      baseUnit: string
      purchasePrice: number
      conversionFactor: number
      wastePercentage: number
    }
  }[]
}

export type RecipeWithRelations = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  prepTimeMinutes: number | null
  status: 'ACTIVE' | 'INACTIVE' | 'SEASONAL'
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
    color: string | null
  } | null
  variants: RecipeVariantWithItems[]
}

// Calcula el costo total de producción de una variante
// sumando el costo de cada ingrediente usado
export function calculateVariantCost(variant: RecipeVariantWithItems): number {
  return variant.items.reduce((total, item) => {
    const { purchasePrice, conversionFactor, wastePercentage } = item.ingredient
    const unitCost = purchasePrice / conversionFactor
    const unitCostWithWaste = unitCost * (1 + wastePercentage / 100)
    return total + unitCostWithWaste * item.quantity
  }, 0)
}

// Calcula el margen de ganancia en porcentaje
export function calculateVariantMargin(
  salePrice: number,
  cost: number
): number {
  if (salePrice === 0) return 0
  return ((salePrice - cost) / salePrice) * 100
}

// Determina el color del margen según qué tan rentable es
export function getMarginColor(margin: number): string {
  if (margin >= 60) return 'text-emerald-600'
  if (margin >= 40) return 'text-amber-600'
  return 'text-red-500'
}

export type RecipeFormData = {
  name: string
  description?: string
  prepTimeMinutes?: number
  status: 'ACTIVE' | 'INACTIVE' | 'SEASONAL'
  categoryId?: string
  variants: {
    size: string
    salePrice: number
    items: {
      ingredientId: string
      quantity: number
    }[]
  }[]
}
