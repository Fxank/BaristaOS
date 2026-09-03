'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/auth'

// Obtiene todas las recetas activas con todo lo necesario para el POS
export async function getPOSData() {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { status: { in: ['ACTIVE', 'SEASONAL'] } },
      include: {
        category: { select: { name: true, color: true } },
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
        id: recipe.id,
        name: recipe.name,
        status: recipe.status,
        categoryName: recipe.category?.name ?? null,
        categoryColor: recipe.category?.color ?? null,
        variants: recipe.variants.map((variant) => ({
          id: variant.id,
          size: variant.size,
          salePrice: Number(variant.salePrice),
          items: variant.items.map((item) => ({
            ingredientId: item.ingredient.id,
            ingredientName: item.ingredient.name,
            quantity: Number(item.quantity),
            purchasePrice: Number(item.ingredient.purchasePrice),
            conversionFactor: Number(item.ingredient.conversionFactor),
            wastePercentage: Number(item.ingredient.wastePercentage),
            baseUnit: item.ingredient.baseUnit,
            purchaseUnit: item.ingredient.purchaseUnit,
          })),
        })),
        optionGroups: recipe.optionGroups.map((group) => ({
          id: group.id,
          name: group.name,
          required: group.required,
          multiSelect: group.multiSelect,
          sortOrder: group.sortOrder,
          options: group.options.map((opt) => ({
            id: opt.id,
            name: opt.name,
            priceModifier: Number(opt.priceModifier),
            isDefault: opt.isDefault,
            sortOrder: opt.sortOrder,
            ingredients: opt.ingredients.map((ing) => ({
              ingredientId: ing.ingredient.id,
              ingredientName: ing.ingredient.name,
              quantity: Number(ing.quantity),
              purchasePrice: Number(ing.ingredient.purchasePrice),
              conversionFactor: Number(ing.ingredient.conversionFactor),
              wastePercentage: Number(ing.ingredient.wastePercentage),
              baseUnit: ing.ingredient.baseUnit,
              purchaseUnit: ing.ingredient.purchaseUnit,
            })),
          })),
        })),
      })),
    }
  } catch (error) {
    console.error('Error fetching POS data:', error)
    return { success: false, error: 'No se pudieron cargar los datos del POS' }
  }
}

const posSaleItemSchema = z.object({
  recipeId: z.string(),
  recipeName: z.string(),
  recipeVariantId: z.string(),
  variantSize: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
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

const posSaleSchema = z.object({
  localId: z.string(),
  channel: z.enum(['IN_STORE', 'TAKEOUT', 'DELIVERY']),
  notes: z.string().nullable().optional(),
  discount: z.number().min(0).default(0),
  createdAt: z
    .union([z.string(), z.date()])
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  items: z.array(posSaleItemSchema).min(1),
})

async function generateFolio(): Promise<string> {
  const lastSale = await prisma.sale.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { folio: true },
  })
  if (!lastSale) return 'VTA-0001'
  const lastNumber = parseInt(lastSale.folio.split('-')[1])
  return `VTA-${(lastNumber + 1).toString().padStart(4, '0')}`
}

// Sincroniza ventas pendientes con el servidor
export async function syncPendingSales(rawSales: unknown[]) {
  const session = await auth()
  if (!session) return { success: false, error: 'No autorizado' }

  const results = []

  for (const rawSale of rawSales) {
    try {
      const validated = posSaleSchema.safeParse(rawSale)
      if (!validated.success) {
        console.error(
          'Validation failed:',
          JSON.stringify(validated.error.flatten(), null, 2)
        )
        console.error('Raw sale:', JSON.stringify(rawSale, null, 2))
        results.push({
          localId: (rawSale as { localId: string }).localId,
          success: false,
        })
        continue
      }

      const data = validated.data

      // Verificar si ya fue sincronizada (por localId)
      const existing = await prisma.sale.findFirst({
        where: { notes: { contains: `[local:${data.localId}]` } },
      })

      if (existing) {
        results.push({
          localId: data.localId,
          success: true,
          folio: existing.folio,
        })
        continue
      }

      const folio = await generateFolio()

      const sale = await prisma.$transaction(async (tx) => {
        const newSale = await tx.sale.create({
          data: {
            folio,
            channel: data.channel,
            notes: data.notes
              ? `${data.notes} [local:${data.localId}]`
              : `[local:${data.localId}]`,
            discount: data.discount,
            status: 'COMPLETED',
            createdAt:
              data.createdAt instanceof Date
                ? data.createdAt
                : data.createdAt
                  ? new Date(data.createdAt)
                  : new Date(),
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
                  include: { items: { include: { ingredient: true } } },
                },
              },
            },
          },
        })

        // Descontar ingredientes base
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
                reason: `Venta ${folio} (sync offline)`,
              },
            })
          }

          // Descontar ingredientes de opciones
          for (const saleItemOption of saleItem.options) {
            const dbOption = await tx.recipeOption.findUnique({
              where: { id: saleItemOption.optionId },
              include: { ingredients: { include: { ingredient: true } } },
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
                  reason: `Venta ${folio} (sync offline) — opción: ${saleItemOption.optionName}`,
                },
              })
            }
          }
        }

        return newSale
      })

      revalidatePath('/sales')
      revalidatePath('/')
      results.push({ localId: data.localId, success: true, folio: sale.folio })
    } catch (error) {
      console.error('Error syncing sale:', JSON.stringify(error, null, 2))
      console.error('Sale data:', JSON.stringify(rawSale, null, 2))
      results.push({
        localId: (rawSale as { localId: string }).localId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return { success: true, results }
}
