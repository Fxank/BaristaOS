import Dexie, { Table } from 'dexie'

export interface LocalRecipe {
  id: string
  name: string
  categoryName: string | null
  categoryColor: string | null
  variants: LocalVariant[]
  optionGroups: LocalOptionGroup[]
  status: string
}

export interface LocalVariant {
  id: string
  size: string
  salePrice: number
  items: LocalVariantItem[]
}

export interface LocalVariantItem {
  ingredientId: string
  ingredientName: string
  quantity: number
  purchasePrice: number
  conversionFactor: number
  wastePercentage: number
  baseUnit: string
  purchaseUnit: string
}

export interface LocalOptionGroup {
  id: string
  name: string
  required: boolean
  multiSelect: boolean
  sortOrder: number
  options: LocalOption[]
}

export interface LocalOption {
  id: string
  name: string
  priceModifier: number
  isDefault: boolean
  sortOrder: number
  ingredients: LocalOptionIngredient[]
}

export interface LocalOptionIngredient {
  ingredientId: string
  ingredientName: string
  quantity: number
  purchasePrice: number
  conversionFactor: number
  wastePercentage: number
  baseUnit: string
  purchaseUnit: string
}

export interface PendingSale {
  id?: number
  localId: string
  syncedAt: Date | null // null = pendiente, Date = sincronizado
  createdAt: Date
  channel: string
  notes: string | null
  discount: number
  items: PendingSaleItem[]
}

export interface PendingSaleItem {
  recipeId: string
  recipeName: string
  recipeVariantId: string
  variantSize: string
  quantity: number
  unitPrice: number
  unitCost: number
  selectedOptions: PendingSaleItemOption[]
}

export interface PendingSaleItemOption {
  optionId: string
  optionName: string
  priceModifier: number
}

class BaristaDB extends Dexie {
  recipes!: Table<LocalRecipe>
  pendingSales!: Table<PendingSale>

  constructor() {
    super('BaristaOS')
    this.version(1).stores({
      recipes: 'id, name, status',
      pendingSales: '++id, localId, createdAt',
    })
  }
}

export const db = new BaristaDB()
