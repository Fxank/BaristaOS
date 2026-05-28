import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, DollarSign, TrendingUp, Percent } from 'lucide-react'

interface SummaryCardsProps {
  data: {
    totalSales: number
    totalRevenue: number
    totalCost: number
    totalProfit: number
    averageMargin: number
  }
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Ventas totales',
      value: data.totalSales.toString(),
      description: 'pedidos completados',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Ingresos',
      value: formatCurrency(data.totalRevenue),
      description: 'ingresos del período',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Ganancia neta',
      value: formatCurrency(data.totalProfit),
      description: `costo: ${formatCurrency(data.totalCost)}`,
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      title: 'Margen promedio',
      value: `${data.averageMargin.toFixed(1)}%`,
      description: 'margen de ganancia',
      icon: Percent,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="border-border bg-card rounded-xl border p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm font-medium">
              {card.title}
            </p>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}
            >
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-foreground text-2xl font-bold">{card.value}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
