import { Header } from '@/components/layout/Header'
import { SalesClient } from '@/components/sales/SalesClient'
import { getSales, getRecipesForSale } from '@/server/actions/sales'

export default async function SalesPage() {
  const [salesResult, recipesResult] = await Promise.all([
    getSales(),
    getRecipesForSale(),
  ])

  const sales = salesResult.success ? (salesResult.data ?? []) : []
  const recipes = recipesResult.success ? (recipesResult.data ?? []) : []

  return (
    <div>
      <Header
        title="Ventas"
        description="Registra y consulta las ventas del negocio"
      />
      <div className="p-6">
        <SalesClient sales={sales} recipes={recipes} />
      </div>
    </div>
  )
}
