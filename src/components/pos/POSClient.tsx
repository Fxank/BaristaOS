'use client'

import { useState, useEffect } from 'react'
import { usePOSSync } from '@/hooks/usePOSSync'
import { POSMenu } from '@/components/pos/POSMenu'
import { POSCart } from '@/components/pos/POSCart'
import { POSStatusBar } from '@/components/pos/POSStatusBar'
import { LocalRecipe, LocalVariant, LocalOption } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

export interface CartItem {
  localId: string
  recipeId: string
  recipeName: string
  recipeVariantId: string
  variantSize: string
  quantity: number
  unitPrice: number
  unitCost: number
  selectedOptions: {
    optionId: string
    optionName: string
    priceModifier: number
  }[]
  optionNames: string[]
}

interface POSClientProps {
  userName: string
}

export function POSClient({ userName }: POSClientProps) {
  const {
    recipes,
    isOnline,
    isSyncing,
    pendingCount,
    lastSync,
    sync,
    saveSaleLocally,
  } = usePOSSync()

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<LocalRecipe | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<LocalVariant | null>(
    null
  )
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({})
  const [successMessage, setSuccessMessage] = useState('')
  const [view, setView] = useState<'menu' | 'cart'>('menu')

  // Mantener useEffect para futuras funcionalidades
  useEffect(() => {}, [])

  // Mantener LocalOption para uso futuro en cálculos
  const _unusedOption: LocalOption | null = null
  void _unusedOption

  function calculateOptionsCost(
    recipe: LocalRecipe,
    options: Record<string, string>
  ): number {
    return recipe.optionGroups.reduce((total, group) => {
      const selectedIds = (options[group.id] ?? '').split(',').filter(Boolean)
      return (
        total +
        selectedIds.reduce((sum, optId) => {
          const opt = group.options.find((o) => o.id === optId)
          if (!opt) return sum
          const optCost = opt.ingredients.reduce((c, ing) => {
            const unitCost = ing.purchasePrice / ing.conversionFactor
            return c + unitCost * (1 + ing.wastePercentage / 100) * ing.quantity
          }, 0)
          return sum + optCost
        }, 0)
      )
    }, 0)
  }

  function calculateOptionsPrice(
    recipe: LocalRecipe,
    options: Record<string, string>
  ): number {
    return recipe.optionGroups.reduce((total, group) => {
      const selectedIds = (options[group.id] ?? '').split(',').filter(Boolean)
      return (
        total +
        selectedIds.reduce((sum, optId) => {
          const opt = group.options.find((o) => o.id === optId)
          return sum + (opt?.priceModifier ?? 0)
        }, 0)
      )
    }, 0)
  }

  function getRequiredGroupsFilled(
    recipe: LocalRecipe,
    options: Record<string, string>
  ): boolean {
    return recipe.optionGroups
      .filter((g) => g.required)
      .every((g) => {
        const selected = options[g.id]
        return selected && selected.length > 0
      })
  }

  function handleSelectRecipe(recipe: LocalRecipe) {
    setSelectedRecipe(recipe)
    setSelectedVariant(null)
    const defaults: Record<string, string> = {}
    recipe.optionGroups.forEach((group) => {
      const defaultOpt = group.options.find((o) => o.isDefault)
      if (defaultOpt) defaults[group.id] = defaultOpt.id
    })
    setSelectedOptions(defaults)
  }

  function handleSelectVariant(variant: LocalVariant) {
    setSelectedVariant(variant)
  }

  function handleBackToRecipes() {
    setSelectedRecipe(null)
    setSelectedVariant(null)
    setSelectedOptions({})
  }

  function handleBackToVariants() {
    setSelectedVariant(null)
  }

  function handleOptionChange(
    groupId: string,
    optionId: string,
    multiSelect: boolean
  ) {
    setSelectedOptions((prev: Record<string, string>) => {
      if (multiSelect) {
        const current = prev[groupId] ?? ''
        const ids = current ? current.split(',') : []
        const exists = ids.includes(optionId)
        const updated = exists
          ? ids.filter((id: string) => id !== optionId)
          : [...ids, optionId]
        return { ...prev, [groupId]: updated.join(',') }
      } else {
        if (prev[groupId] === optionId) return { ...prev, [groupId]: '' }
        return { ...prev, [groupId]: optionId }
      }
    })
  }

  function handleAddToCart() {
    if (!selectedRecipe || !selectedVariant) return
    if (!getRequiredGroupsFilled(selectedRecipe, selectedOptions)) return

    const baseCost = selectedVariant.items.reduce((total, item) => {
      const unitCost = item.purchasePrice / item.conversionFactor
      return total + unitCost * (1 + item.wastePercentage / 100) * item.quantity
    }, 0)

    const optionsCost = calculateOptionsCost(selectedRecipe, selectedOptions)
    const optionsPrice = calculateOptionsPrice(selectedRecipe, selectedOptions)
    const unitPrice = selectedVariant.salePrice + optionsPrice
    const unitCost = baseCost + optionsCost

    const chosenOptions: CartItem['selectedOptions'] = []
    const optionNames: string[] = []

    selectedRecipe.optionGroups.forEach((group) => {
      const selectedIds = (selectedOptions[group.id] ?? '')
        .split(',')
        .filter(Boolean)
      selectedIds.forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId)
        if (opt) {
          chosenOptions.push({
            optionId: opt.id,
            optionName: opt.name,
            priceModifier: opt.priceModifier,
          })
          optionNames.push(opt.name)
        }
      })
    })

    const newItem: CartItem = {
      localId: crypto.randomUUID(),
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.name,
      recipeVariantId: selectedVariant.id,
      variantSize: selectedVariant.size,
      quantity: 1,
      unitPrice,
      unitCost,
      selectedOptions: chosenOptions,
      optionNames,
    }

    setCart((prev) => [...prev, newItem])
    setSelectedRecipe(null)
    setSelectedVariant(null)
    setSelectedOptions({})
    setView('cart')
  }

  function handleUpdateQuantity(localId: string, quantity: number) {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item.localId !== localId))
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.localId === localId ? { ...item, quantity } : item
        )
      )
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) return

    await saveSaleLocally({
      localId: crypto.randomUUID(),
      createdAt: new Date(),
      channel: 'IN_STORE',
      notes: null,
      discount: 0,
      items: cart.map((item) => ({
        recipeId: item.recipeId,
        recipeName: item.recipeName,
        recipeVariantId: item.recipeVariantId,
        variantSize: item.variantSize,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: item.unitCost,
        selectedOptions: item.selectedOptions,
      })),
    })

    const total = cart.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    )
    setSuccessMessage(`✅ Venta registrada — ${formatCurrency(total)}`)
    setCart([])
    setView('menu')

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-background flex h-screen flex-col">
      <POSStatusBar
        userName={userName}
        isOnline={isOnline}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
        lastSync={lastSync}
        onSync={sync}
      />

      {successMessage && (
        <div className="bg-emerald-500 px-4 py-3 text-center text-sm font-medium text-white">
          {successMessage}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Vista móvil */}
        <div className="flex flex-1 flex-col lg:hidden">
          <div className="border-border flex border-b">
            <button
              onClick={() => setView('menu')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                view === 'menu'
                  ? 'border-primary text-primary border-b-2'
                  : 'text-muted-foreground'
              }`}
            >
              Menú
            </button>
            <button
              onClick={() => setView('cart')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                view === 'cart'
                  ? 'border-primary text-primary border-b-2'
                  : 'text-muted-foreground'
              }`}
            >
              Carrito
              {cartCount > 0 && (
                <span className="bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {view === 'menu' ? (
              <POSMenu
                recipes={recipes}
                selectedRecipe={selectedRecipe}
                selectedVariant={selectedVariant}
                selectedOptions={selectedOptions}
                onSelectRecipe={handleSelectRecipe}
                onSelectVariant={handleSelectVariant}
                onOptionChange={handleOptionChange}
                onAddToCart={handleAddToCart}
                onBackToRecipes={handleBackToRecipes}
                onBackToVariants={handleBackToVariants}
                canAdd={
                  !!selectedVariant &&
                  (selectedRecipe
                    ? getRequiredGroupsFilled(selectedRecipe, selectedOptions)
                    : false)
                }
              />
            ) : (
              <POSCart
                cart={cart}
                total={cartTotal}
                onUpdateQuantity={handleUpdateQuantity}
                onCheckout={handleCheckout}
              />
            )}
          </div>
        </div>

        {/* Vista desktop */}
        <div className="hidden flex-1 lg:flex">
          <div className="border-border flex-1 overflow-y-auto border-r">
            <POSMenu
              recipes={recipes}
              selectedRecipe={selectedRecipe}
              selectedVariant={selectedVariant}
              selectedOptions={selectedOptions}
              onSelectRecipe={handleSelectRecipe}
              onSelectVariant={handleSelectVariant}
              onOptionChange={handleOptionChange}
              onAddToCart={handleAddToCart}
              onBackToRecipes={handleBackToRecipes}
              onBackToVariants={handleBackToVariants}
              canAdd={
                !!selectedVariant &&
                (selectedRecipe
                  ? getRequiredGroupsFilled(selectedRecipe, selectedOptions)
                  : false)
              }
            />
          </div>
          <div className="w-80 overflow-y-auto">
            <POSCart
              cart={cart}
              total={cartTotal}
              onUpdateQuantity={handleUpdateQuantity}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
