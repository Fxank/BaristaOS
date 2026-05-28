import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(num)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

export function calculateMargin(salePrice: number, cost: number): number {
  if (salePrice === 0) return 0
  return ((salePrice - cost) / salePrice) * 100
}

export function calculateUnitCost(
  purchasePrice: number,
  conversionFactor: number
): number {
  if (conversionFactor === 0) return 0
  return purchasePrice / conversionFactor
}
