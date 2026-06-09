'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { CHANNEL_LABELS } from '@/types/sale'

interface ChannelChartProps {
  salesByChannel: Record<string, number>
}

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b']

export function ChannelChart({ salesByChannel }: ChannelChartProps) {
  const data = Object.entries(salesByChannel).map(([channel, count]) => ({
    name: CHANNEL_LABELS[channel as keyof typeof CHANNEL_LABELS] ?? channel,
    value: count,
  }))

  return (
    <div className="border-border bg-card h-full rounded-xl border p-6 shadow-sm">
      <h2 className="text-foreground mb-4 font-semibold">Ventas por canal</h2>
      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Sin datos para mostrar
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `${Number(value)} venta${Number(value) !== 1 ? 's' : ''}`,
                'Cantidad',
              ]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
