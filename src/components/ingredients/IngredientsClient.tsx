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
import { IngredientWithRelations } from '@/types/ingredient'

interface Category {
  id: string
  name: string
  color: string | null
}

interface IngredientsClientProps {
  ingredients: IngredientWithRelations[]
  categories: Category[]
}

export function IngredientsClient({
  ingredients,
  categories,
}: IngredientsClientProps) {
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] =
    useState<IngredientWithRelations | null>(null)

  const filtered = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(ingredient: IngredientWithRelations) {
    setEditingIngredient(ingredient)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingIngredient(null)
  }

  return (
    <div className="space-y-4">
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

      <IngredientTable ingredients={filtered} onEdit={handleEdit} />

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
