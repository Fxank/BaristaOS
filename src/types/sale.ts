export type SaleWithItems = {
  id: string
  folio: string
  status: 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
  channel: 'IN_STORE' | 'TAKEOUT' | 'DELIVERY'
  notes: string | null
  discount: number
  createdAt: Date
  items: {
    id: string
    quantity: number
    unitPrice: number
    unitCost: number
    recipe: { id: string; name: string }
    recipeVariant: { id: string; size: string }
  }[]
}

export type IngredientForSale = {
  id: string
  name: string
  purchasePrice: number
  conversionFactor: number
  wastePercentage: number
  currentStock: number
  baseUnit: string
  purchaseUnit: string
}

export type RecipeOptionForSale = {
  id: string
  name: string
  priceModifier: number
  quantity: number
  isDefault: boolean
  groupId: string
  ingredientId: string | null
  ingredient: IngredientForSale | null
}

export type RecipeOptionGroupForSale = {
  id: string
  name: string
  required: boolean
  multiSelect: boolean
  sortOrder: number
  options: RecipeOptionForSale[]
}

export type RecipeVariantForSale = {
  id: string
  size: string
  salePrice: number
  recipeId: string
  items: {
    id: string
    quantity: number
    ingredient: IngredientForSale
  }[]
}

export type RecipeForSale = {
  id: string
  name: string
  category: { id: string; name: string; color: string | null } | null
  variants: RecipeVariantForSale[]
  optionGroups: RecipeOptionGroupForSale[]
}

export const CHANNEL_LABELS = {
  IN_STORE: 'En local',
  TAKEOUT: 'Para llevar',
  DELIVERY: 'Delivery',
} as const

export function calculateVariantCostForSale(
  variant: RecipeVariantForSale
): number {
  return variant.items.reduce((total, item) => {
    const unitCost =
      item.ingredient.purchasePrice / item.ingredient.conversionFactor
    const unitCostWithWaste =
      unitCost * (1 + item.ingredient.wastePercentage / 100)
    return total + unitCostWithWaste * item.quantity
  }, 0)
}

export function calculateOptionCostForSale(
  option: RecipeOptionForSale
): number {
  if (!option.ingredient || option.quantity === 0) return 0
  const unitCost =
    option.ingredient.purchasePrice / option.ingredient.conversionFactor
  const unitCostWithWaste =
    unitCost * (1 + option.ingredient.wastePercentage / 100)
  return unitCostWithWaste * option.quantity
}

export function calculateSaleTotal(sale: SaleWithItems): number {
  const subtotal = sale.items.reduce((total, item) => {
    return total + item.unitPrice * item.quantity
  }, 0)
  return subtotal - sale.discount
}

export function calculateSaleProfit(sale: SaleWithItems): number {
  return sale.items.reduce((total, item) => {
    return total + (item.unitPrice - item.unitCost) * item.quantity
  }, 0)
}
