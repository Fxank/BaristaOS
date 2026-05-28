'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { saleSchema } from '@/validations/sale.schema'

// Genera el folio de venta: VTA-0001, VTA-0002, etc.
async function generateFolio(): Promise<string> {
  const lastSale = await prisma.sale.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { folio: true },
  })

  if (!lastSale) return 'VTA-0001'

  const lastNumber = parseInt(lastSale.folio.split('-')[1])
  const nextNumber = lastNumber + 1
  return `VTA-${nextNumber.toString().padStart(4, '0')}`
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
      where: { status: 'ACTIVE' },
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

    // Creamos la venta y descontamos el inventario en una transacción
    // Una transacción garantiza que si algo falla, nada se guarda
    // Es decir: o todo funciona o nada cambia — nunca un estado intermedio
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Crear la venta
      const newSale = await tx.sale.create({
        data: {
          folio,
          channel: data.channel,
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
            })),
          },
        },
        include: {
          items: {
            include: {
              recipe: { select: { id: true, name: true } },
              recipeVariant: {
                include: {
                  items: {
                    include: {
                      ingredient: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      // 2. Descontar ingredientes del inventario por cada item vendido
      for (const saleItem of newSale.items) {
        for (const recipeItem of saleItem.recipeVariant.items) {
          const ingredient = recipeItem.ingredient
          const quantityUsed = Number(recipeItem.quantity) * saleItem.quantity

          // Convertir de baseUnit a purchaseUnit para descontar el stock
          const stockToDeduct =
            quantityUsed / Number(ingredient.conversionFactor)

          // Actualizar el stock del ingrediente
          await tx.ingredient.update({
            where: { id: ingredient.id },
            data: {
              currentStock: {
                decrement: stockToDeduct,
              },
            },
          })

          // Registrar el movimiento en el historial
          await tx.stockMovement.create({
            data: {
              ingredientId: ingredient.id,
              type: 'SALE_USE',
              quantity: -stockToDeduct,
              reason: `Venta ${folio}`,
            },
          })
        }
      }

      return newSale
    })

    revalidatePath('/sales')
    revalidatePath('/inventory')
    revalidatePath('/')

    return { success: true, data: { folio: sale.folio } }
  } catch (error) {
    console.error('Error creating sale:', error)
    return { success: false, error: 'No se pudo registrar la venta' }
  }
}
