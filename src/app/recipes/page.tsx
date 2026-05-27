import { Header } from '@/components/layout/Header'
import { RecipesClient } from '@/components/recipes/RecipesClient'
import {
  getRecipes,
  getRecipeCategories,
  getIngredientsForRecipe,
} from '@/server/actions/recipes'

export default async function RecipesPage() {
  const [recipesResult, categoriesResult, ingredientsResult] =
    await Promise.all([
      getRecipes(),
      getRecipeCategories(),
      getIngredientsForRecipe(),
    ])

  const recipes = recipesResult.success ? (recipesResult.data ?? []) : []
  const categories = categoriesResult.success
    ? (categoriesResult.data ?? [])
    : []
  const ingredients = ingredientsResult.success
    ? (ingredientsResult.data ?? [])
    : []

  return (
    <div>
      <Header title="Recetas" description="Administra las bebidas de tu menú" />
      <div className="p-6">
        <RecipesClient
          recipes={recipes}
          categories={categories}
          ingredients={ingredients}
        />
      </div>
    </div>
  )
}
