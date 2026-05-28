'use client'

import { useState } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SalesList } from '@/components/sales/SalesList'
import { NewSaleModal } from '@/components/sales/NewSaleModal'
import { SaleWithItems, RecipeForSale } from '@/types/sale'

interface SalesClientProps {
  sales: SaleWithItems[]
  recipes: RecipeForSale[]
}

export function SalesClient({ sales, recipes }: SalesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Barra de acciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-muted-foreground h-5 w-5" />
          <p className="text-muted-foreground text-sm">
            {sales.length} venta{sales.length !== 1 ? 's' : ''} registrada
            {sales.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva venta
        </Button>
      </div>

      {/* Lista de ventas */}
      <SalesList sales={sales} />

      {/* Modal nueva venta */}
      <NewSaleModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipes={recipes}
      />
    </div>
  )
}
