export type RecipeOptionIngredient = {
  id: string
  quantity: number
  ingredientId: string
  ingredient: {
    id: string
    name: string
    baseUnit: string
    purchasePrice: number
    conversionFactor: number
    wastePercentage: number
  }
}

export type RecipeOptionWithIngredients = {
  id: string
  name: string
  priceModifier: number
  isDefault: boolean
  isActive: boolean
  sortOrder: number
  groupId: string
  ingredients: RecipeOptionIngredient[]
}

export type RecipeOptionGroupWithOptions = {
  id: string
  name: string
  required: boolean
  multiSelect: boolean
  sortOrder: number
  recipeId: string
  createdAt: Date
  updatedAt: Date
  options: RecipeOptionWithIngredients[]
}

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
  optionGroups: RecipeOptionGroupWithOptions[]
}

export function calculateVariantCost(variant: RecipeVariantWithItems): number {
  return variant.items.reduce((total, item) => {
    const { purchasePrice, conversionFactor, wastePercentage } = item.ingredient
    const unitCost = purchasePrice / conversionFactor
    const unitCostWithWaste = unitCost * (1 + wastePercentage / 100)
    return total + unitCostWithWaste * item.quantity
  }, 0)
}

export function calculateOptionCost(
  option: RecipeOptionWithIngredients
): number {
  return option.ingredients.reduce((total, item) => {
    const { purchasePrice, conversionFactor, wastePercentage } = item.ingredient
    const unitCost = purchasePrice / conversionFactor
    const unitCostWithWaste = unitCost * (1 + wastePercentage / 100)
    return total + unitCostWithWaste * item.quantity
  }, 0)
}

export function calculateVariantCostRange(
  variant: RecipeVariantWithItems,
  optionGroups: RecipeOptionGroupWithOptions[]
): { min: number; max: number } {
  const baseCost = calculateVariantCost(variant)

  if (optionGroups.length === 0) {
    return { min: baseCost, max: baseCost }
  }

  let minOptionsAdded = 0
  let maxOptionsAdded = 0

  for (const group of optionGroups) {
    if (group.options.length === 0) continue
    const optionCosts = group.options.map((opt) => calculateOptionCost(opt))

    if (group.required) {
      minOptionsAdded += Math.min(...optionCosts)
      maxOptionsAdded += Math.max(...optionCosts)
    } else {
      if (group.multiSelect) {
        maxOptionsAdded += optionCosts.reduce((a, b) => a + b, 0)
      } else {
        maxOptionsAdded += Math.max(...optionCosts)
      }
    }
  }

  return {
    min: baseCost + minOptionsAdded,
    max: baseCost + maxOptionsAdded,
  }
}

export function calculateVariantMargin(
  salePrice: number,
  cost: number
): number {
  if (salePrice === 0) return 0
  return ((salePrice - cost) / salePrice) * 100
}

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
