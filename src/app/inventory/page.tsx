import { Header } from '@/components/layout/Header'
import { InventoryClient } from '@/components/inventory/InventoryClient'
import {
  getInventoryOverview,
  getStockMovements,
} from '@/server/actions/inventory'

export default async function InventoryPage() {
  const [inventoryResult, movementsResult] = await Promise.all([
    getInventoryOverview(),
    getStockMovements(),
  ])

  const ingredients = inventoryResult.success
    ? (inventoryResult.data ?? [])
    : []
  const movements = movementsResult.success ? (movementsResult.data ?? []) : []

  return (
    <div>
      <Header
        title="Inventario"
        description="Controla el stock y movimientos de ingredientes"
      />
      <div className="p-6">
        <InventoryClient ingredients={ingredients} movements={movements} />
      </div>
    </div>
  )
}
