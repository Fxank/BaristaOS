import { z } from 'zod'

export const saleItemSchema = z.object({
  recipeId: z.string().min(1, 'La receta es requerida'),
  recipeVariantId: z.string().min(1, 'La variante es requerida'),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().positive('El precio debe ser mayor a 0'),
  unitCost: z.number().min(0),
})

export const saleSchema = z.object({
  channel: z.enum(['IN_STORE', 'TAKEOUT', 'DELIVERY']),
  notes: z.string().optional(),
  discount: z.number().min(0).default(0),
  items: z
    .array(saleItemSchema)
    .min(1, 'La venta debe tener al menos un producto'),
})

export type SaleSchema = z.infer<typeof saleSchema>
