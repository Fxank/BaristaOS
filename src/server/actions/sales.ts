'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const saleItemSchema = z.object({
  recipeId: z.string().min(1, 'La receta es requerida'),
  recipeVariantId: z.string().min(1, 'La variante es requerida'),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().positive('El precio debe ser mayor a 0'),
  unitCost: z.number().min(0),
  selectedOptions: z
    .array(
      z.object({
        optionId: z.string(),
        optionName: z.string(),
        priceModifier: z.number(),
      })
    )
    .default([]),
})

const saleSchema = z.object({
  channel: z.enum(['IN_STORE', 'TAKEOUT', 'DELIVERY']),
  paymentMethod: z.enum(['CASH', 'TRANSFER']).default('CASH'),
  loyaltyPhone: z.string().optional(),
  notes: z.string().optional(),
  discount: z.number().min(0).default(0),
  items: z
    .array(saleItemSchema)
    .min(1, 'La venta debe tener al menos un producto'),
})

async function generateFolio(): Promise<string> {
  const sales = await prisma.sale.findMany({
    select: { folio: true },
  })

  if (sales.length === 0) return 'VTA-0001'

  const numbers = sales
    .map((s) => {
      const match = s.folio.match(/VTA-(\d+)/)
      return match ? parseInt(match[1]) : 0
    })
    .filter((n) => n > 0)

  if (numbers.length === 0) return 'VTA-0001'

  const maxNumber = Math.max(...numbers)
  return `VTA-${(maxNumber + 1).toString().padStart(4, '0')}`
}

export async function getSales() {
  try {
    const sales = await prisma.sale.findMany({
      where: { status: 'COMPLETED' },
      include: {
        items: {
          include: {
            recipe: { select: { id: true, name: true } },
            recipeVariant: { select: { id: true, size: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return {
      success: true,
      data: sales.map((sale) => ({
        ...sale,
        discount: Number(sale.discount),
        items: sale.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          unitCost: Number(item.unitCost),
        })),
      })),
    }
  } catch (error) {
    console.error('Error fetching sales:', error)
    return { success: false, error: 'No se pudieron cargar las ventas' }
  }
}

export async function getRecipesForSale() {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { status: { in: ['ACTIVE', 'SEASONAL'] } },
      include: {
        category: { select: { id: true, name: true, color: true } },
        variants: {
          include: {
            items: {
              include: {
                ingredient: {
                  select: {
                    id: true,
                    name: true,
                    purchasePrice: true,
                    conversionFactor: true,
                    wastePercentage: true,
                    currentStock: true,
                    baseUnit: true,
                    purchaseUnit: true,
                  },
                },
              },
            },
          },
        },
        optionGroups: {
          orderBy: { sortOrder: 'asc' as const },
          include: {
            options: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' as const },
              include: {
                ingredients: {
                  include: {
                    ingredient: {
                      select: {
                        id: true,
                        name: true,
                        purchasePrice: true,
                        conversionFactor: true,
                        wastePercentage: true,
                        currentStock: true,
                        baseUnit: true,
                        purchaseUnit: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return {
      success: true,
      data: recipes.map((recipe) => ({
        ...recipe,
        variants: recipe.variants.map((variant) => ({
          ...variant,
          salePrice: Number(variant.salePrice),
          items: variant.items.map((item) => ({
            ...item,
            quantity: Number(item.quantity),
            ingredient: {
              ...item.ingredient,
              purchasePrice: Number(item.ingredient.purchasePrice),
              conversionFactor: Number(item.ingredient.conversionFactor),
              wastePercentage: Number(item.ingredient.wastePercentage),
              currentStock: Number(item.ingredient.currentStock),
            },
          })),
        })),
        optionGroups: recipe.optionGroups.map((group) => ({
          ...group,
          options: group.options.map((opt) => ({
            ...opt,
            priceModifier: Number(opt.priceModifier),
            ingredients: opt.ingredients.map((item) => ({
              ...item,
              quantity: Number(item.quantity),
              ingredient: {
                ...item.ingredient,
                purchasePrice: Number(item.ingredient.purchasePrice),
                conversionFactor: Number(item.ingredient.conversionFactor),
                wastePercentage: Number(item.ingredient.wastePercentage),
                currentStock: Number(item.ingredient.currentStock),
              },
            })),
          })),
        })),
      })),
    }
  } catch (error) {
    console.error('Error fetching recipes for sale:', error)
    return { success: false, error: 'No se pudieron cargar las recetas' }
  }
}

export async function createSale(rawData: unknown) {
  try {
    const validated = saleSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const data = validated.data
    const folio = await generateFolio()

    const sale = await prisma.$transaction(async (tx) => {
      // 1. Crear la venta
      const newSale = await tx.sale.create({
        data: {
          folio,
          channel: data.channel,
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
          discount: data.discount,
          status: 'COMPLETED',
          items: {
            create: data.items.map((item) => ({
              recipeId: item.recipeId,
              recipeVariantId: item.recipeVariantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unitCost: item.unitCost,
              options: {
                create: item.selectedOptions.map((so) => ({
                  optionId: so.optionId,
                  optionName: so.optionName,
                  priceModifier: so.priceModifier,
                })),
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              options: true,
              recipeVariant: {
                include: {
                  items: {
                    include: { ingredient: true },
                  },
                },
              },
            },
          },
        },
      })

      // 2. Descontar ingredientes base
      for (const saleItem of newSale.items) {
        for (const recipeItem of saleItem.recipeVariant.items) {
          const ingredient = recipeItem.ingredient
          const quantityUsed = Number(recipeItem.quantity) * saleItem.quantity
          const stockToDeduct =
            quantityUsed / Number(ingredient.conversionFactor)

          await tx.ingredient.update({
            where: { id: ingredient.id },
            data: { currentStock: { decrement: stockToDeduct } },
          })

          await tx.stockMovement.create({
            data: {
              ingredientId: ingredient.id,
              type: 'SALE_USE',
              quantity: -stockToDeduct,
              reason: `Venta ${folio}`,
            },
          })
        }

        // 3. Descontar ingredientes de opciones seleccionadas
        for (const saleItemOption of saleItem.options) {
          const dbOption = await tx.recipeOption.findUnique({
            where: { id: saleItemOption.optionId },
            include: {
              ingredients: {
                include: { ingredient: true },
              },
            },
          })

          if (!dbOption) continue

          for (const optIngredient of dbOption.ingredients) {
            const ingredient = optIngredient.ingredient
            const quantityUsed =
              Number(optIngredient.quantity) * saleItem.quantity
            const stockToDeduct =
              quantityUsed / Number(ingredient.conversionFactor)

            await tx.ingredient.update({
              where: { id: ingredient.id },
              data: { currentStock: { decrement: stockToDeduct } },
            })

            await tx.stockMovement.create({
              data: {
                ingredientId: ingredient.id,
                type: 'SALE_USE',
                quantity: -stockToDeduct,
                reason: `Venta ${folio} — opción: ${saleItemOption.optionName}`,
              },
            })
          }
        }
      }

      // Agregar sellos de lealtad automáticamente
      if (data.loyaltyPhone) {
        const loyaltyCard = await tx.loyaltyCard.findUnique({
          where: { phone: data.loyaltyPhone },
        })

        if (loyaltyCard) {
          const MIN_FOR_STAMP = 50
          const stampsToAdd = data.items
            .filter((item) => item.unitPrice >= MIN_FOR_STAMP)
            .reduce((total, item) => total + item.quantity, 0)

          if (stampsToAdd > 0) {
            const stampsBefore = loyaltyCard.stamps
            const stampsAfter = loyaltyCard.stamps + stampsToAdd

            await tx.loyaltyCard.update({
              where: { id: loyaltyCard.id },
              data: { stamps: stampsAfter },
            })

            await tx.loyaltyRedemption.create({
              data: {
                cardId: loyaltyCard.id,
                stampsBefore,
                stampsAfter,
                type: 'STAMP_ADDED',
                notes: `Venta ${folio} — ${stampsToAdd} sello${stampsToAdd !== 1 ? 's' : ''} automático${stampsToAdd !== 1 ? 's' : ''}`,
              },
            })
          }
        }
      }

      return newSale
    })

    revalidatePath('/sales')
    revalidatePath('/inventory')
    revalidatePath('/')

    return {
      success: true,
      data: {
        folio: sale.folio,
        loyaltyResult: data.loyaltyPhone
          ? await (async () => {
              const card = await prisma.loyaltyCard.findUnique({
                where: { phone: data.loyaltyPhone! },
              })
              if (!card) return null
              const stampsOnCard = card.stamps % 10
              const canRedeem = card.stamps >= 10
              return {
                name: card.name,
                stamps: card.stamps,
                stampsOnCard,
                canRedeem,
                cardId: card.id,
              }
            })()
          : null,
      },
    }
  } catch (error) {
    console.error('Error creating sale:', error)
    return { success: false, error: 'No se pudo registrar la venta' }
  }
}
