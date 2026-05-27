'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IngredientTable } from '@/components/ingredients/IngredientTable'
import { IngredientForm } from '@/components/ingredients/IngredientForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Category {
  id: string
  name: string
  color: string | null
}

interface Ingredient {
  id: string
  name: string
  baseUnit: string
  purchaseUnit: string
  conversionFactor: unknown
  purchasePrice: unknown
  currentStock: unknown
  minimumStock: unknown
  wastePercentage: unknown
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  category: Category | null
  supplier: { id: string; name: string } | null
}

interface IngredientsClientProps {
  ingredients: Ingredient[]
  categories: Category[]
}

export function IngredientsClient({
  ingredients,
  categories,
}: IngredientsClientProps) {
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  )

  const filtered = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(ingredient: Ingredient) {
    setEditingIngredient(ingredient)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingIngredient(null)
  }

  return (
    <div className="space-y-4">
      {/* Barra de acciones */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ingrediente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2 pr-4 pl-9 text-sm outline-none focus:ring-2"
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo ingrediente
        </Button>
      </div>

      {/* Tabla */}
      <IngredientTable ingredients={filtered} onEdit={handleEdit} />

      {/* Modal del formulario */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}
            </DialogTitle>
          </DialogHeader>
          <IngredientForm
            ingredient={editingIngredient}
            categories={categories}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
