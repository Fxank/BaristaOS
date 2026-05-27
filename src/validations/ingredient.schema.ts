import { z } from 'zod'

export const ingredientSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),

  baseUnit: z.string().min(1, 'La unidad base es requerida'),

  purchaseUnit: z.string().min(1, 'La unidad de compra es requerida'),

  conversionFactor: z
    .number()
    .positive('El factor de conversión debe ser mayor a 0'),

  purchasePrice: z.number().positive('El precio debe ser mayor a 0'),

  currentStock: z.number().min(0, 'El stock no puede ser negativo'),

  minimumStock: z.number().min(0, 'El stock mínimo no puede ser negativo'),

  wastePercentage: z
    .number()
    .min(0, 'El porcentaje no puede ser negativo')
    .max(100, 'El porcentaje no puede superar 100'),

  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
})

export type IngredientSchema = z.infer<typeof ingredientSchema>
