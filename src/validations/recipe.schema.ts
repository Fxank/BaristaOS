import { z } from 'zod'

export const recipeItemSchema = z.object({
  ingredientId: z.string().min(1, 'Selecciona un ingrediente'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
})

export const recipeVariantSchema = z.object({
  size: z.string().min(1, 'El tamaño es requerido'),
  salePrice: z.number().positive('El precio debe ser mayor a 0'),
  items: z
    .array(recipeItemSchema)
    .min(1, 'La variante debe tener al menos un ingrediente'),
})

export const recipeSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  description: z.string().optional(),
  prepTimeMinutes: z.number().positive().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SEASONAL']),
  categoryId: z.string().optional(),
  variants: z
    .array(recipeVariantSchema)
    .min(1, 'La receta debe tener al menos una variante'),
})

export type RecipeSchema = z.infer<typeof recipeSchema>
