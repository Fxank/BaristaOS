'use client'

import { Star } from 'lucide-react'

const STAMPS_FOR_REWARD = 10

interface LoyaltyCard {
  id: string
  name: string
  phone: string | null
  stamps: number
  totalRedeemed: number
}

interface LoyaltyCardGridProps {
  cards: LoyaltyCard[]
  onSelectCard: (card: LoyaltyCard) => void
}

export function LoyaltyCardGrid({ cards, onSelectCard }: LoyaltyCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const stampsOnCurrentCard = card.stamps % STAMPS_FOR_REWARD
        const canRedeem =
          card.stamps > 0 && card.stamps % STAMPS_FOR_REWARD === 0
        const stampsLeft = canRedeem
          ? 0
          : STAMPS_FOR_REWARD - stampsOnCurrentCard

        return (
          <button
            key={card.id}
            onClick={() => onSelectCard(card)}
            className="border-border bg-card hover:bg-muted/30 rounded-xl border p-5 text-left shadow-sm transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-foreground font-semibold">{card.name}</p>
                {card.phone && (
                  <p className="text-muted-foreground text-sm">{card.phone}</p>
                )}
              </div>
              {canRedeem && (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                  🎉 Canje disponible
                </span>
              )}
            </div>

            {/* Grid de sellos */}
            <div className="mt-4 grid grid-cols-5 gap-1.5">
              {Array.from({ length: STAMPS_FOR_REWARD }).map((_, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                    i < stampsOnCurrentCard
                      ? 'border-amber-400 bg-amber-400'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  {i < stampsOnCurrentCard && (
                    <Star className="h-4 w-4 fill-white text-white" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {canRedeem
                  ? '¡Bebida gratis lista para canjear!'
                  : `${stampsLeft} sello${stampsLeft !== 1 ? 's' : ''} para bebida gratis`}
              </span>
              {card.totalRedeemed > 0 && (
                <span className="text-muted-foreground">
                  {card.totalRedeemed} canje
                  {card.totalRedeemed !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
