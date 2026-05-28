'use server'

import { prisma } from '@/lib/prisma'

export type ReportPeriod = 'week' | 'month' | 'year'

type DayData = { date: string; revenue: number; profit: number; count: number }
type ProductData = {
  recipeName: string
  variantSize: string
  quantity: number
  revenue: number
  profit: number
}

function getPeriodDates(period: ReportPeriod): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  let start: Date

  if (period === 'week') {
    start = new Date(now)
    start.setDate(now.getDate() - 7)
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    start = new Date(now.getFullYear(), 0, 1)
  }

  return { start, end }
}

export async function getReportData(period: ReportPeriod = 'month') {
  try {
    const { start, end } = getPeriodDates(period)

    const sales = await prisma.sale.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      include: {
        items: {
          include: {
            recipe: { select: { id: true, name: true } },
            recipeVariant: { select: { id: true, size: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Ventas por día para la gráfica
    const salesByDayMap: Record<string, DayData> = {}

    for (const sale of sales) {
      const day = sale.createdAt.toISOString().split('T')[0]

      if (!salesByDayMap[day]) {
        salesByDayMap[day] = { date: day, revenue: 0, profit: 0, count: 0 }
      }

      const saleRevenue = sale.items.reduce(
        (total, item) => total + Number(item.unitPrice) * item.quantity,
        0
      )
      const saleProfit = sale.items.reduce(
        (total, item) =>
          total +
          (Number(item.unitPrice) - Number(item.unitCost)) * item.quantity,
        0
      )

      salesByDayMap[day].revenue += saleRevenue - Number(sale.discount)
      salesByDayMap[day].profit += saleProfit
      salesByDayMap[day].count += 1
    }

    // Top productos más vendidos
    const productSalesMap: Record<string, ProductData> = {}

    for (const sale of sales) {
      for (const item of sale.items) {
        const key = `${item.recipe.id}-${item.recipeVariant.id}`

        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            recipeName: item.recipe.name,
            variantSize: item.recipeVariant.size,
            quantity: 0,
            revenue: 0,
            profit: 0,
          }
        }

        productSalesMap[key].quantity += item.quantity
        productSalesMap[key].revenue += Number(item.unitPrice) * item.quantity
        productSalesMap[key].profit +=
          (Number(item.unitPrice) - Number(item.unitCost)) * item.quantity
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Totales generales
    const totalRevenue = sales.reduce((total, sale) => {
      const saleRevenue = sale.items.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0
      )
      return total + saleRevenue - Number(sale.discount)
    }, 0)

    const totalCost = sales.reduce((total, sale) => {
      return (
        total +
        sale.items.reduce(
          (sum, item) => sum + Number(item.unitCost) * item.quantity,
          0
        )
      )
    }, 0)

    const totalProfit = totalRevenue - totalCost
    const averageMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    // Canal de ventas
    const salesByChannel: Record<string, number> = {}
    for (const sale of sales) {
      if (!salesByChannel[sale.channel]) salesByChannel[sale.channel] = 0
      salesByChannel[sale.channel] += 1
    }

    return {
      success: true,
      data: {
        period,
        totalSales: sales.length,
        totalRevenue,
        totalCost,
        totalProfit,
        averageMargin,
        salesByDay: Object.values(salesByDayMap),
        topProducts,
        salesByChannel,
      },
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return { success: false, error: 'No se pudo generar el reporte' }
  }
}
