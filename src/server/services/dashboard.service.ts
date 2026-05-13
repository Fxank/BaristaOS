import { prisma } from '@/lib/prisma'

export async function getDashboardStats() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Ejecutamos todas las consultas en paralelo para mayor velocidad
  const [
    salesToday,
    salesThisMonth,
    activeRecipes,
    totalIngredients,
    lowStockIngredients,
    recentSales,
  ] = await Promise.all([
    // Ventas de hoy
    prisma.sale.findMany({
      where: {
        createdAt: { gte: startOfDay },
        status: 'COMPLETED',
      },
      include: { items: true },
    }),

    // Ventas del mes
    prisma.sale.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'COMPLETED',
      },
      include: { items: true },
    }),

    // Recetas activas
    prisma.recipe.count({
      where: { status: 'ACTIVE' },
    }),

    // Total ingredientes activos
    prisma.ingredient.count({
      where: { isActive: true },
    }),

    // Ingredientes con stock bajo
    prisma.ingredient.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        currentStock: true,
        minimumStock: true,
        baseUnit: true,
        purchaseUnit: true,
      },
    }),

    // Últimas 5 ventas
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'COMPLETED' },
      include: {
        items: {
          include: {
            recipe: { select: { name: true } },
            recipeVariant: { select: { size: true } },
          },
        },
      },
    }),
  ])

  // Calcular ingresos de hoy
  const revenueToday = salesToday.reduce((total, sale) => {
    const saleTotal = sale.items.reduce((sum, item) => {
      return sum + Number(item.unitPrice) * item.quantity
    }, 0)
    return total + saleTotal - Number(sale.discount)
  }, 0)

  // Calcular ingresos del mes
  const revenueThisMonth = salesThisMonth.reduce((total, sale) => {
    const saleTotal = sale.items.reduce((sum, item) => {
      return sum + Number(item.unitPrice) * item.quantity
    }, 0)
    return total + saleTotal - Number(sale.discount)
  }, 0)

  // Calcular ganancia del mes
  const profitThisMonth = salesThisMonth.reduce((total, sale) => {
    const saleProfit = sale.items.reduce((sum, item) => {
      const profit =
        (Number(item.unitPrice) - Number(item.unitCost)) * item.quantity
      return sum + profit
    }, 0)
    return total + saleProfit
  }, 0)

  // Filtrar ingredientes con stock bajo
  const lowStock = lowStockIngredients.filter(
    (ing) => Number(ing.currentStock) <= Number(ing.minimumStock)
  )

  return {
    salesToday: salesToday.length,
    revenueToday,
    salesThisMonth: salesThisMonth.length,
    revenueThisMonth,
    profitThisMonth,
    activeRecipes,
    totalIngredients,
    lowStockCount: lowStock.length,
    lowStockIngredients: lowStock,
    recentSales,
  }
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>
