'use client'

import { useState, useTransition } from 'react'
import { SummaryCards } from '@/components/reports/SummaryCards'
import { RevenueChart } from '@/components/reports/RevenueChart'
import { TopProductsTable } from '@/components/reports/TopProductsTable'
import { ChannelChart } from '@/components/reports/ChannelChart'
import { getReportData, ReportPeriod } from '@/server/actions/reports'

interface ReportData {
  period: string
  totalSales: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  averageMargin: number
  salesByDay: { date: string; revenue: number; profit: number; count: number }[]
  topProducts: {
    recipeName: string
    variantSize: string
    quantity: number
    revenue: number
    profit: number
  }[]
  salesByChannel: Record<string, number>
}

interface ReportsClientProps {
  initialData: ReportData | null
}

const PERIODS = [
  { value: 'week', label: 'Últimos 7 días' },
  { value: 'month', label: 'Este mes' },
  { value: 'year', label: 'Este año' },
]

export function ReportsClient({ initialData }: ReportsClientProps) {
  const [data, setData] = useState<ReportData | null>(initialData)
  const [period, setPeriod] = useState<ReportPeriod>('month')
  const [isPending, startTransition] = useTransition()

  function handlePeriodChange(newPeriod: ReportPeriod) {
    setPeriod(newPeriod)
    startTransition(async () => {
      const result = await getReportData(newPeriod)
      if (result.success && result.data) {
        setData(result.data)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Período:</span>
        <div className="border-border bg-muted/30 flex gap-1 rounded-lg border p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value as ReportPeriod)}
              disabled={isPending}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {isPending && (
          <span className="text-muted-foreground text-xs">Cargando...</span>
        )}
      </div>

      {!data ? (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <p className="text-muted-foreground">
            No hay datos para el período seleccionado
          </p>
        </div>
      ) : (
        <>
          <SummaryCards data={data} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart salesByDay={data.salesByDay} />
            </div>
            <div>
              <ChannelChart salesByChannel={data.salesByChannel} />
            </div>
          </div>

          <TopProductsTable products={data.topProducts} />
        </>
      )}
    </div>
  )
}
