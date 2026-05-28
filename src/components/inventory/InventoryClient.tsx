'use client'

import { useState } from 'react'
import { Package, History } from 'lucide-react'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { MovementsTable } from '@/components/inventory/MovementsTable'
import { RestockModal } from '@/components/inventory/RestockModal'

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

interface Movement {
  id: string
  type: string
  quantity: number
  reason: string | null
  createdAt: Date
  ingredient: { id: string; name: string; purchaseUnit: string }
}

interface InventoryClientProps {
  ingredients: Ingredient[]
  movements: Movement[]
}

type ActiveTab = 'overview' | 'movements'

export function InventoryClient({
  ingredients,
  movements,
}: InventoryClientProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [restockingIngredient, setRestockingIngredient] =
    useState<Ingredient | null>(null)

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-border bg-muted/30 flex w-fit gap-1 rounded-lg border p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="h-4 w-4" />
          Stock actual
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'movements'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="h-4 w-4" />
          Historial
        </button>
      </div>

      {/* Contenido */}
      {activeTab === 'overview' && (
        <InventoryTable
          ingredients={ingredients}
          onRestock={setRestockingIngredient}
        />
      )}

      {activeTab === 'movements' && <MovementsTable movements={movements} />}

      {/* Modal de reabastecimiento */}
      {restockingIngredient && (
        <RestockModal
          ingredient={restockingIngredient}
          onClose={() => setRestockingIngredient(null)}
        />
      )}
    </div>
  )
}
