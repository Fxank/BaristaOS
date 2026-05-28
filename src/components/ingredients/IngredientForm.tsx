'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createIngredient,
  updateIngredient,
} from '@/server/actions/ingredients'
import { IngredientWithRelations } from '@/types/ingredient'

const BASE_UNITS = ['ml', 'g', 'pieza', 'oz', 'l', 'kg']
const PURCHASE_UNITS = [
  'litro',
  'kg',
  'paquete',
  'caja',
  'pieza',
  'botella',
  'bolsa',
]

interface Category {
  id: string
  name: string
  color: string | null
}

interface IngredientFormProps {
  ingredient?: IngredientWithRelations | null
  categories: Category[]
  onSuccess: () => void
}

export function IngredientForm({
  ingredient,
  categories,
  onSuccess,
}: IngredientFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const [baseUnit, setBaseUnit] = useState(ingredient?.baseUnit ?? '')
  const [purchaseUnit, setPurchaseUnit] = useState(
    ingredient?.purchaseUnit ?? ''
  )
  const [categoryId, setCategoryId] = useState(ingredient?.category?.id ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get('name') as string,
      baseUnit,
      purchaseUnit,
      conversionFactor: Number(formData.get('conversionFactor')),
      purchasePrice: Number(formData.get('purchasePrice')),
      currentStock: Number(formData.get('currentStock')),
      minimumStock: Number(formData.get('minimumStock')),
      wastePercentage: Number(formData.get('wastePercentage')),
      categoryId: categoryId || undefined,
    }

    const result = ingredient
      ? await updateIngredient(ingredient.id, data)
      : await createIngredient(data)

    if (result.success) {
      onSuccess()
    } else {
      if ('fieldErrors' in result && result.fieldErrors) {
        setErrors(result.fieldErrors as Record<string, string[]>)
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Nombre del ingrediente</Label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={ingredient?.name ?? ''}
            placeholder="Ej: Leche entera"
            className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
          {errors.name && (
            <p className="text-destructive mt-1 text-xs">{errors.name[0]}</p>
          )}
        </div>

        <div>
          <Label>Unidad base (para recetas)</Label>
          <Select
            value={baseUnit}
            onValueChange={(val) => val && setBaseUnit(val)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecciona unidad" />
            </SelectTrigger>
            <SelectContent>
              {BASE_UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.baseUnit && (
            <p className="text-destructive mt-1 text-xs">
              {errors.baseUnit[0]}
            </p>
          )}
        </div>

        <div>
          <Label>Unidad de compra</Label>
          <Select
            value={purchaseUnit}
            onValueChange={(val) => val && setPurchaseUnit(val)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecciona unidad" />
            </SelectTrigger>
            <SelectContent>
              {PURCHASE_UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.purchaseUnit && (
            <p className="text-destructive mt-1 text-xs">
              {errors.purchaseUnit[0]}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="conversionFactor">Factor de conversión</Label>
          <input
            id="conversionFactor"
            name="conversionFactor"
            type="number"
            step="0.01"
            defaultValue={ingredient?.conversionFactor ?? 1000}
            placeholder="Ej: 1000"
            className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
          <p className="text-muted-foreground mt-1 text-xs">
            1 unidad de compra = ? unidades base
          </p>
          {errors.conversionFactor && (
            <p className="text-destructive mt-1 text-xs">
              {errors.conversionFactor[0]}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="purchasePrice">Precio de compra ($MXN)</Label>
          <input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            step="0.01"
            defaultValue={ingredient?.purchasePrice ?? ''}
            placeholder="Ej: 24.00"
            className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
          {errors.purchasePrice && (
            <p className="text-destructive mt-1 text-xs">
              {errors.purchasePrice[0]}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="currentStock">Stock actual</Label>
          <input
            id="currentStock"
            name="currentStock"
            type="number"
            step="0.01"
            defaultValue={ingredient?.currentStock ?? 0}
            placeholder="Ej: 10"
            className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
          {errors.currentStock && (
            <p className="text-destructive mt-1 text-xs">
              {errors.currentStock[0]}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="minimumStock">Stock mínimo (alerta)</Label>
          <input
            id="minimumStock"
            name="minimumStock"
            type="number"
            step="0.01"
            defaultValue={ingredient?.minimumStock ?? 0}
            placeholder="Ej: 2"
            className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
          {errors.minimumStock && (
            <p className="text-destructive mt-1 text-xs">
              {errors.minimumStock[0]}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="wastePercentage">Merma estimada (%)</Label>
          <input
            id="wastePercentage"
            name="wastePercentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            defaultValue={ingredient?.wastePercentage ?? 0}
            placeholder="Ej: 2"
            className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
          {errors.wastePercentage && (
            <p className="text-destructive mt-1 text-xs">
              {errors.wastePercentage[0]}
            </p>
          )}
        </div>

        <div>
          <Label>Categoría (opcional)</Label>
          <Select
            value={categoryId}
            onValueChange={(val) => setCategoryId(val ?? '')}
          >
            <SelectTrigger className="mt-1">
              <SelectValue>
                {categoryId
                  ? (categories.find((c) => c.id === categoryId)?.name ??
                    'Sin categoría')
                  : 'Sin categoría'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Guardando...'
            : ingredient
              ? 'Guardar cambios'
              : 'Crear ingrediente'}
        </Button>
      </div>
    </form>
  )
}
