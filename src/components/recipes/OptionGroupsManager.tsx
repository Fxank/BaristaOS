'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { RecipeOptionGroupWithOptions } from '@/types/recipe'
import {
  createOptionGroup,
  updateOptionGroup,
  deleteOptionGroup,
} from '@/server/actions/options'

interface Ingredient {
  id: string
  name: string
  baseUnit: string
  purchasePrice: number
  conversionFactor: number
  wastePercentage: number
}

interface OptionGroupsManagerProps {
  recipeId: string
  optionGroups: RecipeOptionGroupWithOptions[]
  ingredients: Ingredient[]
}

interface OptionForm {
  name: string
  priceModifier: string
  quantity: string
  ingredientId: string
  isDefault: boolean
}

interface GroupForm {
  name: string
  required: boolean
  multiSelect: boolean
  options: OptionForm[]
}

const emptyOption = (): OptionForm => ({
  name: '',
  priceModifier: '0',
  quantity: '0',
  ingredientId: '',
  isDefault: false,
})

const emptyGroup = (): GroupForm => ({
  name: '',
  required: true,
  multiSelect: false,
  options: [emptyOption()],
})

export function OptionGroupsManager({
  recipeId,
  optionGroups,
  ingredients,
}: OptionGroupsManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [form, setForm] = useState<GroupForm>(emptyGroup())
  const [loading, setLoading] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  function toggleGroup(groupId: string) {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    )
  }

  function handleEditGroup(group: RecipeOptionGroupWithOptions) {
    setEditingGroupId(group.id)
    setForm({
      name: group.name,
      required: group.required,
      multiSelect: group.multiSelect,
      options: group.options.map((opt) => ({
        name: opt.name,
        priceModifier: opt.priceModifier.toString(),
        quantity: opt.quantity.toString(),
        ingredientId: opt.ingredientId ?? '',
        isDefault: opt.isDefault,
      })),
    })
    setShowForm(true)
  }

  function addOption() {
    setForm({ ...form, options: [...form.options, emptyOption()] })
  }

  function removeOption(index: number) {
    setForm({
      ...form,
      options: form.options.filter((_, i) => i !== index),
    })
  }

  function updateOption(
    index: number,
    field: keyof OptionForm,
    value: string | boolean
  ) {
    setForm({
      ...form,
      options: form.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    })
  }

  function getOptionCostPreview(opt: OptionForm): number {
    if (!opt.ingredientId || !opt.quantity) return 0
    const ing = ingredients.find((i) => i.id === opt.ingredientId)
    if (!ing) return 0
    const unitCost = ing.purchasePrice / ing.conversionFactor
    const costWithWaste = unitCost * (1 + ing.wastePercentage / 100)
    return costWithWaste * Number(opt.quantity)
  }

  async function handleSubmit() {
    setLoading(true)

    const data = {
      name: form.name,
      required: form.required,
      multiSelect: form.multiSelect,
      sortOrder: 0,
      options: form.options.map((opt, i) => ({
        name: opt.name,
        priceModifier: Number(opt.priceModifier) || 0,
        quantity: Number(opt.quantity) || 0,
        ingredientId: opt.ingredientId || undefined,
        isDefault: opt.isDefault,
        sortOrder: i,
      })),
    }

    const result = editingGroupId
      ? await updateOptionGroup(editingGroupId, data)
      : await createOptionGroup(recipeId, data)

    if (result.success) {
      setShowForm(false)
      setEditingGroupId(null)
      setForm(emptyGroup())
    }

    setLoading(false)
  }

  async function handleDeleteGroup(groupId: string) {
    if (!confirm('¿Eliminar este grupo de opciones?')) return
    await deleteOptionGroup(groupId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Grupos de opciones
        </h3>
        {!showForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingGroupId(null)
              setForm(emptyGroup())
              setShowForm(true)
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar grupo
          </Button>
        )}
      </div>

      {/* Lista de grupos existentes */}
      {optionGroups.length === 0 && !showForm && (
        <div className="border-border rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Sin grupos de opciones — agrega uno si la bebida tiene
            personalizaciones
          </p>
        </div>
      )}

      {optionGroups.map((group) => (
        <div
          key={group.id}
          className="border-border overflow-hidden rounded-xl border"
        >
          <div className="bg-muted/30 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                {expandedGroups.includes(group.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              <div>
                <p className="text-foreground font-medium">{group.name}</p>
                <p className="text-muted-foreground text-xs">
                  {group.required ? 'Obligatorio' : 'Opcional'} ·{' '}
                  {group.multiSelect ? 'Selección múltiple' : 'Selección única'}{' '}
                  · {group.options.length} opciones
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleEditGroup(group)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteGroup(group.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {expandedGroups.includes(group.id) && (
            <div className="divide-border divide-y px-4 py-2">
              {group.options.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-foreground">{opt.name}</span>
                  <div className="text-muted-foreground flex items-center gap-4">
                    {opt.ingredient && (
                      <span>
                        {opt.quantity} {opt.ingredient.baseUnit} de{' '}
                        {opt.ingredient.name}
                      </span>
                    )}
                    {opt.priceModifier > 0 && (
                      <span className="font-medium text-emerald-600">
                        +{formatCurrency(opt.priceModifier)}
                      </span>
                    )}
                    {opt.isDefault && (
                      <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Formulario de grupo */}
      {showForm && (
        <div className="border-border space-y-4 rounded-xl border p-4">
          <h4 className="text-foreground font-medium">
            {editingGroupId ? 'Editar grupo' : 'Nuevo grupo de opciones'}
          </h4>

          {/* Nombre y configuración del grupo */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Nombre del grupo</Label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Sabor, Perla, Extras"
                className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
            <div className="flex items-end gap-6 sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.required}
                  onChange={(e) =>
                    setForm({ ...form, required: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-foreground">Obligatorio</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.multiSelect}
                  onChange={(e) =>
                    setForm({ ...form, multiSelect: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-foreground">Selección múltiple</span>
              </label>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Opciones</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="mr-1 h-3 w-3" />
                Agregar opción
              </Button>
            </div>

            {form.options.map((opt, index) => {
              const costPreview = getOptionCostPreview(opt)
              const selectedIng = ingredients.find(
                (i) => i.id === opt.ingredientId
              )

              return (
                <div
                  key={index}
                  className="bg-muted/30 space-y-3 rounded-lg p-3"
                >
                  {/* Fila 1: Nombre e Ingrediente */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Nombre de la opción</Label>
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) =>
                          updateOption(index, 'name', e.target.value)
                        }
                        placeholder="Ej: Mango, Fresa, Crema batida"
                        className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                      />
                    </div>
                    <div>
                      <Label>Ingrediente asociado</Label>
                      <Select
                        value={opt.ingredientId}
                        onValueChange={(val) =>
                          updateOption(index, 'ingredientId', val ?? '')
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue>
                            {opt.ingredientId
                              ? (ingredients.find(
                                  (i) => i.id === opt.ingredientId
                                )?.name ?? 'Ninguno')
                              : 'Ninguno (sin descuento)'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-75">
                          {ingredients.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id}>
                              {ing.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fila 2: Cantidad, Precio adicional y Eliminar */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <Label>
                        Cantidad{' '}
                        {selectedIng ? `(${selectedIng.baseUnit})` : ''}
                      </Label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={opt.quantity}
                        onChange={(e) =>
                          updateOption(index, 'quantity', e.target.value)
                        }
                        className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                      />
                    </div>
                    <div>
                      <Label>Precio adicional ($)</Label>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={opt.priceModifier}
                        onChange={(e) =>
                          updateOption(index, 'priceModifier', e.target.value)
                        }
                        className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>¿Por defecto?</Label>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`default-${index}`}
                            checked={opt.isDefault}
                            onChange={(e) =>
                              updateOption(index, 'isDefault', e.target.checked)
                            }
                            className="rounded"
                          />
                          <label
                            htmlFor={`default-${index}`}
                            className="text-muted-foreground cursor-pointer text-sm"
                          >
                            Marcar default
                          </label>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        disabled={form.options.length === 1}
                        className="text-destructive hover:text-destructive mb-0.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Preview de costo */}
                  {costPreview > 0 && (
                    <p className="text-muted-foreground text-xs">
                      Costo de esta opción:{' '}
                      <span className="text-foreground font-medium">
                        {formatCurrency(costPreview)}
                      </span>{' '}
                      — el precio adicional es lo que cobras extra al cliente
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setEditingGroupId(null)
                setForm(emptyGroup())
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !form.name}
            >
              {loading
                ? 'Guardando...'
                : editingGroupId
                  ? 'Guardar cambios'
                  : 'Crear grupo'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
