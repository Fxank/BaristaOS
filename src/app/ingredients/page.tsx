import { Header } from '@/components/layout/Header'
import { IngredientsClient } from '@/components/ingredients/IngredientsClient'
import {
  getIngredients,
  getIngredientCategories,
} from '@/server/actions/ingredients'

export default async function IngredientsPage() {
  const [ingredientsResult, categoriesResult] = await Promise.all([
    getIngredients(),
    getIngredientCategories(),
  ])

  const ingredients = ingredientsResult.success
    ? (ingredientsResult.data ?? [])
    : []
  const categories = categoriesResult.success
    ? (categoriesResult.data ?? [])
    : []

  return (
    <div>
      <Header
        title="Ingredientes"
        description="Administra los ingredientes de tu negocio"
      />
      <div className="p-6">
        <IngredientsClient ingredients={ingredients} categories={categories} />
      </div>
    </div>
  )
}
