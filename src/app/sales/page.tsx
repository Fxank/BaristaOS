import { Header } from '@/components/layout/Header'
import { SalesClient } from '@/components/sales/SalesClient'
import { getSales, getRecipesForSale } from '@/server/actions/sales'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function SalesPage() {
  const [salesResult, recipesResult, session] = await Promise.all([
    getSales(),
    getRecipesForSale(),
    auth(),
  ])

  const sales = salesResult.success ? (salesResult.data ?? []) : []
  const recipes = recipesResult.success ? (recipesResult.data ?? []) : []
  const isOwner = session?.user?.role === 'OWNER'

  return (
    <div>
      <Header
        title="Ventas"
        description="Registra y consulta las ventas del negocio"
      />
      <div className="p-6">
        <SalesClient sales={sales} recipes={recipes} showCosts={isOwner} />
      </div>
    </div>
  )
}
