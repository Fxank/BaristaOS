'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { recipeSchema } from '@/validations/recipe.schema'

const recipeInclude = {
  category: { select: { id: true, name: true, color: true } },
  variants: {
    orderBy: { size: 'asc' as const },
    include: {
      items: {
        include: {
          ingredient: {
            select: {
              id: true,
              name: true,
              baseUnit: true,
              purchasePrice: true,
              conversionFactor: true,
              wastePercentage: true,
            },
          },
        },
      },
    },
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeRecipe(recipe: any) {
  return {
    ...recipe,
    variants: recipe.variants.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (variant: any) => ({
        ...variant,
        salePrice: Number(variant.salePrice),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: variant.items.map((item: any) => ({
          ...item,
          quantity: Number(item.quantity),
          ingredient: {
            ...item.ingredient,
            purchasePrice: Number(item.ingredient.purchasePrice),
            conversionFactor: Number(item.ingredient.conversionFactor),
            wastePercentage: Number(item.ingredient.wastePercentage),
          },
        })),
      })
    ),
  }
}

export async function getRecipes() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: recipeInclude,
      orderBy: { name: 'asc' },
    })
    return { success: true, data: recipes.map(serializeRecipe) }
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return { success: false, error: 'No se pudieron cargar las recetas' }
  }
}

export async function getRecipeCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { type: 'RECIPE' },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: categories }
  } catch (error) {
    console.error('Error fetching recipe categories:', error)
    return { success: false, error: 'No se pudieron cargar las categorías' }
  }
}

export async function getIngredientsForRecipe() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        baseUnit: true,
        purchasePrice: true,
        conversionFactor: true,
        wastePercentage: true,
      },
      orderBy: { name: 'asc' },
    })
    return {
      success: true,
      data: ingredients.map((ing) => ({
        ...ing,
        purchasePrice: Number(ing.purchasePrice),
        conversionFactor: Number(ing.conversionFactor),
        wastePercentage: Number(ing.wastePercentage),
      })),
    }
  } catch (error) {
    console.error('Error fetching ingredients for recipe:', error)
    return { success: false, error: 'No se pudieron cargar los ingredientes' }
  }
}

export async function createRecipe(rawData: unknown) {
  try {
    const validated = recipeSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const data = validated.data

    const existing = await prisma.recipe.findFirst({
      where: { name: data.name },
    })

    if (existing) {
      return {
        success: false,
        error: 'Ya existe una receta con ese nombre',
        fieldErrors: { name: ['Ya existe una receta con ese nombre'] },
      }
    }

    const recipe = await prisma.recipe.create({
      data: {
        name: data.name,
        description: data.description || null,
        prepTimeMinutes: data.prepTimeMinutes || null,
        status: data.status,
        categoryId: data.categoryId || null,
        variants: {
          create: data.variants.map((variant) => ({
            size: variant.size,
            salePrice: variant.salePrice,
            items: {
              create: variant.items.map((item) => ({
                ingredientId: item.ingredientId,
                quantity: item.quantity,
              })),
            },
          })),
        },
      },
      include: recipeInclude,
    })

    revalidatePath('/recipes')
    revalidatePath('/')
    return { success: true, data: serializeRecipe(recipe) }
  } catch (error) {
    console.error('Error creating recipe:', error)
    return { success: false, error: 'No se pudo crear la receta' }
  }
}

export async function updateRecipe(id: string, rawData: unknown) {
  try {
    const validated = recipeSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const data = validated.data

    const existing = await prisma.recipe.findFirst({
      where: { name: data.name, NOT: { id } },
    })

    if (existing) {
      return {
        success: false,
        error: 'Ya existe una receta con ese nombre',
        fieldErrors: { name: ['Ya existe una receta con ese nombre'] },
      }
    }

    await prisma.recipeVariant.deleteMany({ where: { recipeId: id } })

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        prepTimeMinutes: data.prepTimeMinutes || null,
        status: data.status,
        categoryId: data.categoryId || null,
        variants: {
          create: data.variants.map((variant) => ({
            size: variant.size,
            salePrice: variant.salePrice,
            items: {
              create: variant.items.map((item) => ({
                ingredientId: item.ingredientId,
                quantity: item.quantity,
              })),
            },
          })),
        },
      },
      include: recipeInclude,
    })

    revalidatePath('/recipes')
    revalidatePath('/')
    return { success: true, data: serializeRecipe(recipe) }
  } catch (error) {
    console.error('Error updating recipe:', error)
    return { success: false, error: 'No se pudo actualizar la receta' }
  }
}

export async function deleteRecipe(id: string) {
  try {
    await prisma.recipe.update({
      where: { id },
      data: { status: 'INACTIVE' },
    })
    revalidatePath('/recipes')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return { success: false, error: 'No se pudo eliminar la receta' }
  }
}

export async function permanentDeleteRecipe(id: string) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!recipe) {
      return { success: false, error: 'Receta no encontrada' }
    }

    if (recipe.status !== 'INACTIVE') {
      return {
        success: false,
        error: 'Solo se pueden eliminar permanentemente recetas inactivas',
      }
    }

    await prisma.recipe.delete({ where: { id } })

    revalidatePath('/recipes')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error permanently deleting recipe:', error)
    return { success: false, error: 'No se pudo eliminar la receta' }
  }
}
