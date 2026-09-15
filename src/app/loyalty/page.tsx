import { Header } from '@/components/layout/Header'
import { LoyaltyClient } from '@/components/loyalty/LoyaltyClient'
import { getLoyaltyCards } from '@/server/actions/loyalty'

export const dynamic = 'force-dynamic'

export default async function LoyaltyPage() {
  const result = await getLoyaltyCards()
  const cards = result.success ? (result.data ?? []) : []

  return (
    <div>
      <Header
        title="Lealtad"
        description="Administra las tarjetas de lealtad de tus clientes"
      />
      <div className="p-6">
        <LoyaltyClient cards={cards} />
      </div>
    </div>
  )
}
