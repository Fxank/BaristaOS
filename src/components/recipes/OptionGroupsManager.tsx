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

interface OptionIngredientForm {
  ingredientId: string
  quantity: string
}

interface OptionForm {
  name: string
  priceModifier: string
  isDefault: boolean
  ingredients: OptionIngredientForm[]
}

interface GroupForm {
  name: string
  required: boolean
  multiSelect: boolean
  options: OptionForm[]
}

const emptyOptionIngredient = (): OptionIngredientForm => ({
  ingredientId: '',
  quantity: '',
})

const emptyOption = (): OptionForm => ({
  name: '',
  priceModifier: '0',
  isDefault: false,
  ingredients: [emptyOptionIngredient()],
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
        isDefault: opt.isDefault,
        ingredients:
          opt.ingredients.length > 0
            ? opt.ingredients.map((ing) => ({
                ingredientId: ing.ingredientId,
                quantity: ing.quantity.toString(),
              }))
            : [emptyOptionIngredient()],
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
    field: keyof Omit<OptionForm, 'ingredients'>,
    value: string | boolean
  ) {
    setForm({
      ...form,
      options: form.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    })
  }

  function addIngredientToOption(optionIndex: number) {
    setForm({
      ...form,
      options: form.options.map((opt, i) =>
        i === optionIndex
          ? {
              ...opt,
              ingredients: [...opt.ingredients, emptyOptionIngredient()],
            }
          : opt
      ),
    })
  }

  function removeIngredientFromOption(
    optionIndex: number,
    ingredientIndex: number
  ) {
    setForm({
      ...form,
      options: form.options.map((opt, i) =>
        i === optionIndex
          ? {
              ...opt,
              ingredients: opt.ingredients.filter(
                (_, j) => j !== ingredientIndex
              ),
            }
          : opt
      ),
    })
  }

  function updateOptionIngredient(
    optionIndex: number,
    ingredientIndex: number,
    field: keyof OptionIngredientForm,
    value: string
  ) {
    setForm({
      ...form,
      options: form.options.map((opt, i) =>
        i === optionIndex
          ? {
              ...opt,
              ingredients: opt.ingredients.map((ing, j) =>
                j === ingredientIndex ? { ...ing, [field]: value } : ing
              ),
            }
          : opt
      ),
    })
  }

  function getOptionCostPreview(opt: OptionForm): number {
    return opt.ingredients.reduce((total, ing) => {
      if (!ing.ingredientId || !ing.quantity) return total
      const ingredient = ingredients.find((i) => i.id === ing.ingredientId)
      if (!ingredient) return total
      const unitCost = ingredient.purchasePrice / ingredient.conversionFactor
      const costWithWaste = unitCost * (1 + ingredient.wastePercentage / 100)
      return total + costWithWaste * Number(ing.quantity)
    }, 0)
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
        isDefault: opt.isDefault,
        sortOrder: i,
        ingredients: opt.ingredients
          .filter((ing) => ing.ingredientId && ing.quantity)
          .map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: Number(ing.quantity),
          })),
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
              {group.options.map((opt) => {
                const cost = opt.ingredients.reduce((total, item) => {
                  const { purchasePrice, conversionFactor, wastePercentage } =
                    item.ingredient
                  const unitCost = purchasePrice / conversionFactor
                  const costWithWaste = unitCost * (1 + wastePercentage / 100)
                  return total + costWithWaste * item.quantity
                }, 0)

                return (
                  <div key={opt.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">
                        {opt.name}
                      </span>
                      <div className="flex items-center gap-3">
                        {cost > 0 && (
                          <span className="text-muted-foreground text-xs">
                            Costo: {formatCurrency(cost)}
                          </span>
                        )}
                        {opt.priceModifier > 0 && (
                          <span className="text-xs font-medium text-emerald-600">
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
                    {opt.ingredients.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {opt.ingredients.map((ing) => (
                          <p
                            key={ing.id}
                            className="text-muted-foreground text-xs"
                          >
                            · {ing.quantity} {ing.ingredient.baseUnit} de{' '}
                            {ing.ingredient.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {showForm && (
        <div className="border-border space-y-4 rounded-xl border p-4">
          <h4 className="text-foreground font-medium">
            {editingGroupId ? 'Editar grupo' : 'Nuevo grupo de opciones'}
          </h4>

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

          <div className="space-y-4">
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

            {form.options.map((opt, optionIndex) => {
              const costPreview = getOptionCostPreview(opt)

              return (
                <div
                  key={optionIndex}
                  className="bg-muted/30 space-y-3 rounded-lg p-4"
                >
                  {/* Fila 1: Nombre, Precio adicional, Default, Eliminar */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                      <Label>Nombre de la opción</Label>
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) =>
                          updateOption(optionIndex, 'name', e.target.value)
                        }
                        placeholder="Ej: Mango, Fresa, Chocolate"
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
                          updateOption(
                            optionIndex,
                            'priceModifier',
                            e.target.value
                          )
                        }
                        className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>¿Default?</Label>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={opt.isDefault}
                            onChange={(e) =>
                              updateOption(
                                optionIndex,
                                'isDefault',
                                e.target.checked
                              )
                            }
                            className="rounded"
                          />
                          <span className="text-muted-foreground text-sm">
                            Sí
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(optionIndex)}
                        disabled={form.options.length === 1}
                        className="text-destructive hover:text-destructive mb-0.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Ingredientes de la opción */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">
                        Ingredientes de esta opción
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addIngredientToOption(optionIndex)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Ingrediente
                      </Button>
                    </div>

                    {opt.ingredients.map((ing, ingIndex) => {
                      const selectedIng = ingredients.find(
                        (i) => i.id === ing.ingredientId
                      )

                      return (
                        <div
                          key={ingIndex}
                          className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_32px]"
                        >
                          <Select
                            value={ing.ingredientId}
                            onValueChange={(val) =>
                              updateOptionIngredient(
                                optionIndex,
                                ingIndex,
                                'ingredientId',
                                val ?? ''
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue>
                                {ing.ingredientId
                                  ? (ingredients.find(
                                      (i) => i.id === ing.ingredientId
                                    )?.name ?? 'Selecciona')
                                  : 'Selecciona ingrediente'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="w-75">
                              {ingredients.map((i) => (
                                <SelectItem key={i.id} value={i.id}>
                                  {i.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={ing.quantity}
                            onChange={(e) =>
                              updateOptionIngredient(
                                optionIndex,
                                ingIndex,
                                'quantity',
                                e.target.value
                              )
                            }
                            placeholder={
                              selectedIng ? selectedIng.baseUnit : 'Cantidad'
                            }
                            className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeIngredientFromOption(optionIndex, ingIndex)
                            }
                            disabled={opt.ingredients.length === 1}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Preview de costo */}
                  {costPreview > 0 && (
                    <p className="text-muted-foreground text-xs">
                      Costo de esta opción:{' '}
                      <span className="text-foreground font-medium">
                        {formatCurrency(costPreview)}
                      </span>
                      {Number(opt.priceModifier) > 0 && (
                        <span>
                          {' '}
                          · Precio adicional al cliente:{' '}
                          <span className="font-medium text-emerald-600">
                            +{formatCurrency(Number(opt.priceModifier))}
                          </span>
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

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
