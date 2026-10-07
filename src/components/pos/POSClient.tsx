'use client'

import { useState, useEffect } from 'react'
import { usePOSSync } from '@/hooks/usePOSSync'
import { POSMenu } from '@/components/pos/POSMenu'
import { POSCart } from '@/components/pos/POSCart'
import { POSStatusBar } from '@/components/pos/POSStatusBar'
import { LocalRecipe, LocalVariant, LocalOption } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { findOrCreateLoyaltyCard } from '@/server/actions/loyalty'
import { redeemReward } from '@/server/actions/loyalty'
import { Star, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    clearPending,
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
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>(
    'CASH'
  )
  const [loyaltyPhone, setLoyaltyPhone] = useState('')
  const [loyaltyStatus, setLoyaltyStatus] = useState<
    'idle' | 'not-found' | 'found' | 'creating'
  >('idle')
  const [newClientName, setNewClientName] = useState('')
  const [loyaltyResult, setLoyaltyResult] = useState<{
    name: string
    stamps: number
    stampsOnCard: number
    canRedeem: boolean
    cardId: string
  } | null>(null)

  const [lastSale, setLastSale] = useState<{
    total: number
    items: { name: string; size: string; quantity: number; price: number }[]
    paymentMethod: string
  } | null>(null)

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

  async function handleLoyaltyPhoneChange(phone: string) {
    setLoyaltyPhone(phone)
    setLoyaltyStatus('idle')

    if (phone.length >= 10) {
      const result = await findOrCreateLoyaltyCard(phone)
      if (result.success && result.data) {
        setLoyaltyStatus('found')
        // Verificar si ya tiene canje disponible
        const card = result.data
        const stampsOnCard = card.stamps % 10
        const canRedeem = card.stamps >= 10
        if (canRedeem) {
          setLoyaltyResult({
            name: card.name,
            stamps: card.stamps,
            stampsOnCard,
            canRedeem: true,
            cardId: card.id,
          })
        }
      } else if ('notFound' in result && result.notFound) {
        setLoyaltyStatus('not-found')
      }
    }
  }

  async function handleConfirmNewClient() {
    if (!newClientName || !loyaltyPhone) return
    setLoyaltyStatus('creating')

    const result = await findOrCreateLoyaltyCard(loyaltyPhone, newClientName)
    if (result.success) {
      setLoyaltyStatus('found')
      setNewClientName('')
    } else {
      setLoyaltyStatus('idle')
    }
  }

  function handleCancelNewClient() {
    setLoyaltyStatus('idle')
    setLoyaltyPhone('')
    setNewClientName('')
  }

  async function handleCheckout() {
    if (cart.length === 0) return

    const saleData = {
      localId: crypto.randomUUID(),
      createdAt: new Date(),
      channel: 'IN_STORE' as const,
      paymentMethod,
      loyaltyPhone: loyaltyStatus === 'found' ? loyaltyPhone : null,
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
    }

    // Guardar ticket antes de limpiar carrito
    const ticketItems = cart.map((item) => ({
      name: item.recipeName,
      size: item.variantSize,
      quantity: item.quantity,
      price: item.unitPrice,
    }))
    const ticketTotal = cart.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    )

    await saveSaleLocally(saleData)

    // Mostrar ticket
    setLastSale({
      total: ticketTotal,
      items: ticketItems,
      paymentMethod,
    })

    // Lealtad
    if (loyaltyStatus === 'found' && loyaltyPhone && navigator.onLine) {
      try {
        const { getLoyaltyCardByPhone } =
          await import('@/server/actions/loyalty')
        const result = await getLoyaltyCardByPhone(loyaltyPhone)
        if (result.success && result.data) {
          const card = result.data
          const stampsOnCard = card.stamps % 10
          const canRedeem = card.stamps >= 10
          setLoyaltyResult({
            name: card.name,
            stamps: card.stamps,
            stampsOnCard,
            canRedeem,
            cardId: card.id,
          })
        }
      } catch (e) {
        console.error('Error fetching loyalty result:', e)
      }
    }

    setCart([])
    setLoyaltyPhone('')
    setLoyaltyStatus('idle')
    setNewClientName('')
    setView('menu')
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
        onClearPending={clearPending ?? (() => {})}
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
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                loyaltyPhone={loyaltyPhone}
                onLoyaltyPhoneChange={handleLoyaltyPhoneChange}
                loyaltyStatus={loyaltyStatus}
                newClientName={newClientName}
                onNewClientNameChange={setNewClientName}
                onConfirmNewClient={handleConfirmNewClient}
                onCancelNewClient={handleCancelNewClient}
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
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              loyaltyPhone={loyaltyPhone}
              onLoyaltyPhoneChange={handleLoyaltyPhoneChange}
              loyaltyStatus={loyaltyStatus}
              newClientName={newClientName}
              onNewClientNameChange={setNewClientName}
              onConfirmNewClient={handleConfirmNewClient}
              onCancelNewClient={handleCancelNewClient}
            />
          </div>
        </div>
      </div>

      {/* Ticket de confirmación */}
      {lastSale && !loyaltyResult && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="bg-card border-border w-full max-w-sm space-y-4 rounded-2xl border p-5">
            <div className="text-center">
              <p className="text-2xl">✅</p>
              <p className="text-foreground mt-1 text-lg font-bold">
                Venta registrada
              </p>
              <p className="text-muted-foreground text-sm">
                {lastSale.paymentMethod === 'CASH'
                  ? '💵 Efectivo'
                  : '📱 Transferencia'}
              </p>
            </div>

            <div className="border-border divide-border divide-y rounded-xl border">
              {lastSale.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {item.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-foreground text-sm font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-border flex items-center justify-between border-t pt-3">
              <span className="text-foreground font-bold">Total</span>
              <span className="text-foreground text-xl font-bold">
                {formatCurrency(lastSale.total)}
              </span>
            </div>

            <Button className="w-full" onClick={() => setLastSale(null)}>
              Nueva venta
            </Button>
          </div>
        </div>
      )}

      {/* Modal de resultado de lealtad */}
      {loyaltyResult && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="bg-card border-border w-full max-w-sm space-y-4 rounded-2xl border p-5">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <p className="text-foreground font-semibold">
                Lealtad — {loyaltyResult.name}
              </p>
            </div>

            {/* Grid de sellos */}
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    i < loyaltyResult.stampsOnCard
                      ? 'border-amber-400 bg-amber-400'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  {i < loyaltyResult.stampsOnCard && (
                    <Star className="h-4 w-4 fill-white text-white" />
                  )}
                </div>
              ))}
            </div>

            {loyaltyResult.canRedeem ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-600">
                  🎉 ¡{loyaltyResult.name} tiene una bebida gratis!
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLoyaltyResult(null)}
                    className="flex-1"
                  >
                    Guardar para después
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      await redeemReward(loyaltyResult.cardId)
                      setLoyaltyResult(null)
                      setSuccessMessage('🎁 ¡Bebida gratis canjeada!')
                      setTimeout(() => setSuccessMessage(''), 3000)
                    }}
                    className="flex-1 bg-amber-500 text-white hover:bg-amber-600"
                  >
                    <Gift className="mr-1 h-4 w-4" />
                    Canjear ahora
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  {10 - loyaltyResult.stampsOnCard} sello
                  {10 - loyaltyResult.stampsOnCard !== 1 ? 's' : ''} para bebida
                  gratis
                </p>
                <Button
                  size="sm"
                  onClick={() => setLoyaltyResult(null)}
                  className="w-full"
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
