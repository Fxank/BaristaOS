'use client'

import { useState } from 'react'
import { Plus, Search, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoyaltyCardGrid } from '@/components/loyalty/LoyaltyCardGrid'
import { NewLoyaltyCardModal } from '@/components/loyalty/NewLoyaltyCardModal'
import { LoyaltyCardDetailModal } from '@/components/loyalty/LoyaltyCardDetailModal'

interface LoyaltyCard {
  id: string
  name: string
  phone: string | null
  stamps: number
  totalRedeemed: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface LoyaltyClientProps {
  cards: LoyaltyCard[]
}

export function LoyaltyClient({ cards }: LoyaltyClientProps) {
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<LoyaltyCard | null>(null)

  const filtered = cards.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2 pr-4 pl-9 text-sm outline-none focus:ring-2"
          />
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva tarjeta
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <Star className="text-muted-foreground/50 mx-auto h-10 w-10" />
          <p className="text-muted-foreground mt-3 text-sm">
            {search
              ? 'No se encontraron clientes'
              : 'Sin tarjetas de lealtad todavía'}
          </p>
        </div>
      ) : (
        <LoyaltyCardGrid
          cards={filtered}
          onSelectCard={(card) => setSelectedCard(card as LoyaltyCard)}
        />
      )}

      <NewLoyaltyCardModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
      />

      {selectedCard && (
        <LoyaltyCardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  )
}
