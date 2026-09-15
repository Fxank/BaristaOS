'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const STAMPS_FOR_REWARD = 10
const MIN_PURCHASE_FOR_STAMP = 50

const loyaltyCardSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
})

export async function getLoyaltyCards() {
  try {
    const cards = await prisma.loyaltyCard.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: cards }
  } catch (error) {
    console.error('Error fetching loyalty cards:', error)
    return { success: false, error: 'No se pudieron cargar las tarjetas' }
  }
}

export async function searchLoyaltyCard(query: string) {
  try {
    const cards = await prisma.loyaltyCard.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
        ],
      },
      take: 5,
    })
    return { success: true, data: cards }
  } catch (error) {
    console.error('Error searching loyalty cards:', error)
    return { success: false, error: 'Error al buscar' }
  }
}

export async function createLoyaltyCard(rawData: unknown) {
  try {
    const validated = loyaltyCardSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const data = validated.data

    // Verificar si ya existe con ese teléfono
    if (data.phone) {
      const existing = await prisma.loyaltyCard.findUnique({
        where: { phone: data.phone },
      })
      if (existing) {
        return {
          success: false,
          error: 'Ya existe una tarjeta con ese número de teléfono',
        }
      }
    }

    const card = await prisma.loyaltyCard.create({
      data: {
        name: data.name,
        phone: data.phone,
        stamps: 0,
      },
    })

    revalidatePath('/loyalty')
    return { success: true, data: card }
  } catch (error) {
    console.error('Error creating loyalty card:', error)
    return { success: false, error: 'No se pudo crear la tarjeta' }
  }
}

export async function addStamp(cardId: string, purchaseTotal: number) {
  try {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: cardId },
    })

    if (!card) return { success: false, error: 'Tarjeta no encontrada' }
    if (!card.isActive) return { success: false, error: 'Tarjeta inactiva' }

    if (purchaseTotal < MIN_PURCHASE_FOR_STAMP) {
      return {
        success: false,
        error: `La compra debe ser de mínimo $${MIN_PURCHASE_FOR_STAMP} para ganar sello`,
      }
    }

    const stampsBefore = card.stamps
    const stampsAfter = card.stamps + 1

    await prisma.$transaction(async (tx) => {
      await tx.loyaltyCard.update({
        where: { id: cardId },
        data: { stamps: stampsAfter },
      })

      await tx.loyaltyRedemption.create({
        data: {
          cardId,
          stampsBefore,
          stampsAfter,
          type: 'STAMP_ADDED',
          notes: `Compra de ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(purchaseTotal)}`,
        },
      })
    })

    revalidatePath('/loyalty')

    const newTotal = stampsAfter
    const stampsLeft = STAMPS_FOR_REWARD - (newTotal % STAMPS_FOR_REWARD)

    return {
      success: true,
      data: {
        stamps: newTotal,
        stampsLeft: stampsLeft === STAMPS_FOR_REWARD ? 0 : stampsLeft,
        canRedeem: newTotal % STAMPS_FOR_REWARD === 0,
      },
    }
  } catch (error) {
    console.error('Error adding stamp:', error)
    return { success: false, error: 'No se pudo agregar el sello' }
  }
}

export async function redeemReward(cardId: string) {
  try {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: cardId },
    })

    if (!card) return { success: false, error: 'Tarjeta no encontrada' }

    if (card.stamps < STAMPS_FOR_REWARD) {
      return {
        success: false,
        error: `Faltan ${STAMPS_FOR_REWARD - card.stamps} sellos para el canje`,
      }
    }

    const stampsBefore = card.stamps
    const stampsAfter = card.stamps - STAMPS_FOR_REWARD

    await prisma.$transaction(async (tx) => {
      await tx.loyaltyCard.update({
        where: { id: cardId },
        data: {
          stamps: stampsAfter,
          totalRedeemed: { increment: 1 },
        },
      })

      await tx.loyaltyRedemption.create({
        data: {
          cardId,
          stampsBefore,
          stampsAfter,
          type: 'REWARD_CLAIMED',
          notes: 'Bebida gratis canjeada',
        },
      })
    })

    revalidatePath('/loyalty')
    return { success: true, data: { stampsAfter } }
  } catch (error) {
    console.error('Error redeeming reward:', error)
    return { success: false, error: 'No se pudo canjear el premio' }
  }
}

export async function getLoyaltyCardDetail(cardId: string) {
  try {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: cardId },
      include: {
        redemptions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!card) return { success: false, error: 'Tarjeta no encontrada' }
    return { success: true, data: card }
  } catch (error) {
    console.error('Error fetching card detail:', error)
    return { success: false, error: 'No se pudo cargar la tarjeta' }
  }
}
