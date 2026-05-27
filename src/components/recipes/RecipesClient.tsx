'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { RecipeForm } from '@/components/recipes/RecipeForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RecipeWithRelations } from '@/types/recipe'

interface Category {
  id: string
  name: string
  color: string | null
}

interface Ingredient {
  id: string
  name: string
  baseUnit: string
  purchasePrice: number
  conversionFactor: number
  wastePercentage: number
}

interface RecipesClientProps {
  recipes: RecipeWithRelations[]
  categories: Category[]
  ingredients: Ingredient[]
}

export function RecipesClient({
  recipes,
  categories,
  ingredients,
}: RecipesClientProps) {
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] =
    useState<RecipeWithRelations | null>(null)

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = showInactive ? true : r.status !== 'INACTIVE'
    return matchesSearch && matchesStatus
  })

  function handleEdit(recipe: RecipeWithRelations) {
    setEditingRecipe(recipe)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingRecipe(null)
  }

  return (
    <div className="space-y-4">
      {/* Barra de acciones */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar receta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2 pr-4 pl-9 text-sm outline-none focus:ring-2"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowInactive(!showInactive)}
            className={`rounded-lg border px-3 py-2 text-xs whitespace-nowrap transition-colors ${
              showInactive
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-input hover:text-foreground'
            }`}
          >
            {showInactive ? 'Ocultando inactivas' : 'Ver inactivas'}
          </button>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva receta
        </Button>
      </div>

      {/* Grid de tarjetas */}
      {filtered.length === 0 ? (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <p className="text-muted-foreground">No se encontraron recetas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Modal del formulario */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-h-[90vh] w-[90vw]! max-w-4xl! overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecipe ? 'Editar receta' : 'Nueva receta'}
            </DialogTitle>
          </DialogHeader>
          <RecipeForm
            recipe={editingRecipe}
            categories={categories}
            ingredients={ingredients}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
