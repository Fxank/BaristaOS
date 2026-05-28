export type IngredientWithRelations = {
  id: string
  name: string
  baseUnit: string
  purchaseUnit: string
  conversionFactor: number
  purchasePrice: number
  currentStock: number
  minimumStock: number
  wastePercentage: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
    color: string | null
  } | null
  supplier: {
    id: string
    name: string
  } | null
}

export type StockStatus = 'healthy' | 'low' | 'critical'

export function getStockStatus(
  currentStock: number,
  minimumStock: number
): StockStatus {
  if (currentStock <= 0) return 'critical'
  if (currentStock <= minimumStock) return 'low'
  return 'healthy'
}

export function calculateIngredientUnitCost(
  purchasePrice: number,
  conversionFactor: number,
  wastePercentage: number
): number {
  if (conversionFactor === 0) return 0
  const baseCost = purchasePrice / conversionFactor
  const wasteMultiplier = 1 + wastePercentage / 100
  return baseCost * wasteMultiplier
}
