import { cn, formatCurrency } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  isCurrency?: boolean
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend = 'neutral',
  isCurrency = false,
  className,
}: StatsCardProps) {
  const displayValue = isCurrency ? formatCurrency(Number(value)) : value

  return (
    <div
      className={cn(
        'border-border bg-card rounded-xl border p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
          <Icon className="text-primary h-4 w-4" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-foreground text-2xl font-bold">{displayValue}</p>
        {description && (
          <p
            className={cn('mt-1 text-xs', {
              'text-emerald-600': trend === 'up',
              'text-red-500': trend === 'down',
              'text-muted-foreground': trend === 'neutral',
            })}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
