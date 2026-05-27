'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { ingredientSchema } from '@/validations/ingredient.schema'
import { Ingredient } from '@/generated/prisma'

// Serializa un ingrediente convirtiendo todos los Decimal a number
function serializeIngredient(
  ing: Ingredient & {
    category: { id: string; name: string; color: string | null } | null
    supplier: { id: string; name: string } | null
  }
) {
  return {
    ...ing,
    conversionFactor: Number(ing.conversionFactor),
    purchasePrice: Number(ing.purchasePrice),
    currentStock: Number(ing.currentStock),
    minimumStock: Number(ing.minimumStock),
    wastePercentage: Number(ing.wastePercentage),
  }
}

export async function getIngredients() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, color: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: ingredients.map(serializeIngredient) }
  } catch (error) {
    console.error('Error fetching ingredients:', error)
    return { success: false, error: 'No se pudieron cargar los ingredientes' }
  }
}

export async function getIngredientCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { type: 'INGREDIENT' },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: categories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, error: 'No se pudieron cargar las categorías' }
  }
}

export async function createIngredient(rawData: unknown) {
  try {
    const validated = ingredientSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const data = validated.data
    const ingredient = await prisma.ingredient.create({
      data: {
        name: data.name,
        baseUnit: data.baseUnit,
        purchaseUnit: data.purchaseUnit,
        conversionFactor: data.conversionFactor,
        purchasePrice: data.purchasePrice,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock,
        wastePercentage: data.wastePercentage,
        categoryId: data.categoryId || null,
        supplierId: data.supplierId || null,
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
        supplier: { select: { id: true, name: true } },
      },
    })

    revalidatePath('/ingredients')
    revalidatePath('/')
    return { success: true, data: serializeIngredient(ingredient) }
  } catch (error) {
    console.error('Error creating ingredient:', error)
    return { success: false, error: 'No se pudo crear el ingrediente' }
  }
}

export async function updateIngredient(id: string, rawData: unknown) {
  try {
    const validated = ingredientSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const data = validated.data
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name: data.name,
        baseUnit: data.baseUnit,
        purchaseUnit: data.purchaseUnit,
        conversionFactor: data.conversionFactor,
        purchasePrice: data.purchasePrice,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock,
        wastePercentage: data.wastePercentage,
        categoryId: data.categoryId || null,
        supplierId: data.supplierId || null,
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
        supplier: { select: { id: true, name: true } },
      },
    })

    revalidatePath('/ingredients')
    revalidatePath('/')
    return { success: true, data: serializeIngredient(ingredient) }
  } catch (error) {
    console.error('Error updating ingredient:', error)
    return { success: false, error: 'No se pudo actualizar el ingrediente' }
  }
}

export async function deleteIngredient(id: string) {
  try {
    await prisma.ingredient.update({
      where: { id },
      data: { isActive: false },
    })
    revalidatePath('/ingredients')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting ingredient:', error)
    return { success: false, error: 'No se pudo eliminar el ingrediente' }
  }
}
