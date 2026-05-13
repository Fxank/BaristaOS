import { Header } from '@/components/layout/Header'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { LowStockAlert } from '@/components/dashboard/LowStockAlert'
import { RecentSales } from '@/components/dashboard/RecentSales'
import { getDashboardStats } from '@/server/services/dashboard.service'
import {
  ShoppingCart,
  DollarSign,
  BookOpen,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div>
      <Header title="Dashboard" description="Resumen general de tu negocio" />
      <div className="space-y-6 p-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Ventas hoy"
            value={stats.salesToday}
            description="pedidos completados"
            icon={ShoppingCart}
          />
          <StatsCard
            title="Ingresos hoy"
            value={stats.revenueToday}
            description="ingresos del día"
            icon={DollarSign}
            isCurrency
          />
          <StatsCard
            title="Recetas activas"
            value={stats.activeRecipes}
            description={`de ${stats.totalIngredients} ingredientes`}
            icon={BookOpen}
          />
          <StatsCard
            title="Stock bajo"
            value={stats.lowStockCount}
            description={
              stats.lowStockCount === 0
                ? 'inventario saludable'
                : 'requieren atención'
            }
            icon={AlertTriangle}
            trend={stats.lowStockCount > 0 ? 'down' : 'neutral'}
          />
        </div>

        {/* Resumen del mes */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-foreground font-semibold">Resumen del mes</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-sm">Ventas totales</p>
              <p className="text-foreground mt-1 text-2xl font-bold">
                {stats.salesThisMonth}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Ingresos</p>
              <p className="text-foreground mt-1 text-2xl font-bold">
                {formatCurrency(stats.revenueThisMonth)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Ganancia neta</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.profitThisMonth)}
              </p>
            </div>
          </div>
        </div>

        {/* Alertas y ventas recientes */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LowStockAlert ingredients={stats.lowStockIngredients} />
          <RecentSales sales={stats.recentSales} />
        </div>
      </div>
    </div>
  )
}
