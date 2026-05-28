'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const restockSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  notes: z.string().optional(),
})

export async function getInventoryOverview() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, color: true } },
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true, type: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return {
      success: true,
      data: ingredients.map((ing) => ({
        ...ing,
        conversionFactor: Number(ing.conversionFactor),
        purchasePrice: Number(ing.purchasePrice),
        currentStock: Number(ing.currentStock),
        minimumStock: Number(ing.minimumStock),
        wastePercentage: Number(ing.wastePercentage),
      })),
    }
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return { success: false, error: 'No se pudo cargar el inventario' }
  }
}

export async function getStockMovements(ingredientId?: string) {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: ingredientId ? { ingredientId } : undefined,
      include: {
        ingredient: { select: { id: true, name: true, purchaseUnit: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return {
      success: true,
      data: movements.map((m) => ({
        ...m,
        quantity: Number(m.quantity),
      })),
    }
  } catch (error) {
    console.error('Error fetching movements:', error)
    return { success: false, error: 'No se pudieron cargar los movimientos' }
  }
}

export async function restockIngredient(rawData: unknown) {
  try {
    const validated = restockSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const data = validated.data

    await prisma.$transaction(async (tx) => {
      // Actualizar stock del ingrediente
      await tx.ingredient.update({
        where: { id: data.ingredientId },
        data: {
          currentStock: { increment: data.quantity },
          purchasePrice: data.price,
        },
      })

      // Registrar el movimiento
      await tx.stockMovement.create({
        data: {
          ingredientId: data.ingredientId,
          type: 'PURCHASE',
          quantity: data.quantity,
          reason: data.notes || `Reabastecimiento — $${data.price} por unidad`,
        },
      })
    })

    revalidatePath('/inventory')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error restocking ingredient:', error)
    return { success: false, error: 'No se pudo registrar el reabastecimiento' }
  }
}

export async function adjustStock(rawData: unknown) {
  try {
    const schema = z.object({
      ingredientId: z.string().min(1),
      quantity: z.number(),
      reason: z.string().min(1, 'El motivo es requerido'),
    })

    const validated = schema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const data = validated.data

    await prisma.$transaction(async (tx) => {
      await tx.ingredient.update({
        where: { id: data.ingredientId },
        data: { currentStock: { increment: data.quantity } },
      })

      await tx.stockMovement.create({
        data: {
          ingredientId: data.ingredientId,
          type: 'ADJUSTMENT',
          quantity: data.quantity,
          reason: data.reason,
        },
      })
    })

    revalidatePath('/inventory')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error adjusting stock:', error)
    return { success: false, error: 'No se pudo ajustar el stock' }
  }
}
