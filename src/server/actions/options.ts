'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const optionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  priceModifier: z.number().min(0).default(0),
  quantity: z.number().min(0).default(0),
  ingredientId: z.string().optional(),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().default(0),
})

const optionGroupSchema = z.object({
  name: z.string().min(1, 'El nombre del grupo es requerido'),
  required: z.boolean().default(true),
  multiSelect: z.boolean().default(false),
  sortOrder: z.number().default(0),
  options: z
    .array(optionSchema)
    .min(1, 'El grupo debe tener al menos una opción'),
})

export async function getRecipeOptionGroups(recipeId: string) {
  try {
    const groups = await prisma.recipeOptionGroup.findMany({
      where: { recipeId },
      include: {
        options: {
          where: { isActive: true },
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
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return {
      success: true,
      data: groups.map((group) => ({
        ...group,
        options: group.options.map((opt) => ({
          ...opt,
          priceModifier: Number(opt.priceModifier),
          quantity: Number(opt.quantity),
          ingredient: opt.ingredient
            ? {
                ...opt.ingredient,
                purchasePrice: Number(opt.ingredient.purchasePrice),
                conversionFactor: Number(opt.ingredient.conversionFactor),
                wastePercentage: Number(opt.ingredient.wastePercentage),
              }
            : null,
        })),
      })),
    }
  } catch (error) {
    console.error('Error fetching option groups:', error)
    return {
      success: false,
      error: 'No se pudieron cargar los grupos de opciones',
    }
  }
}

export async function createOptionGroup(recipeId: string, rawData: unknown) {
  try {
    const validated = optionGroupSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const data = validated.data

    await prisma.recipeOptionGroup.create({
      data: {
        recipeId,
        name: data.name,
        required: data.required,
        multiSelect: data.multiSelect,
        sortOrder: data.sortOrder,
        options: {
          create: data.options.map((opt) => ({
            name: opt.name,
            priceModifier: opt.priceModifier,
            quantity: opt.quantity,
            ingredientId: opt.ingredientId || null,
            isDefault: opt.isDefault,
            sortOrder: opt.sortOrder,
          })),
        },
      },
    })

    revalidatePath('/recipes')
    return { success: true }
  } catch (error) {
    console.error('Error creating option group:', error)
    return { success: false, error: 'No se pudo crear el grupo de opciones' }
  }
}

export async function updateOptionGroup(groupId: string, rawData: unknown) {
  try {
    const validated = optionGroupSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const data = validated.data

    // Eliminamos las opciones existentes y recreamos
    await prisma.recipeOption.deleteMany({ where: { groupId } })

    await prisma.recipeOptionGroup.update({
      where: { id: groupId },
      data: {
        name: data.name,
        required: data.required,
        multiSelect: data.multiSelect,
        sortOrder: data.sortOrder,
        options: {
          create: data.options.map((opt) => ({
            name: opt.name,
            priceModifier: opt.priceModifier,
            quantity: opt.quantity,
            ingredientId: opt.ingredientId || null,
            isDefault: opt.isDefault,
            sortOrder: opt.sortOrder,
          })),
        },
      },
    })

    revalidatePath('/recipes')
    return { success: true }
  } catch (error) {
    console.error('Error updating option group:', error)
    return {
      success: false,
      error: 'No se pudo actualizar el grupo de opciones',
    }
  }
}

export async function deleteOptionGroup(groupId: string) {
  try {
    await prisma.recipeOptionGroup.delete({ where: { id: groupId } })
    revalidatePath('/recipes')
    return { success: true }
  } catch (error) {
    console.error('Error deleting option group:', error)
    return { success: false, error: 'No se pudo eliminar el grupo de opciones' }
  }
}
