import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Combina clases de Tailwind de manera inteligente
// Uso: cn('text-red-500', condition && 'font-bold')
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea números como moneda mexicana
// Uso: formatCurrency(65) → "$65.00"
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(num)
}

// Formatea fechas de manera legible
// Uso: formatDate(new Date()) → "12 de mayo de 2026"
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Calcula el margen de ganancia en porcentaje
// Uso: calculateMargin(65, 18.5) → 71.5
export function calculateMargin(salePrice: number, cost: number): number {
  if (salePrice === 0) return 0
  return ((salePrice - cost) / salePrice) * 100
}

// Calcula el costo unitario de un ingrediente
// Uso: calculateUnitCost(320, 1000) → 0.32 (costo por gramo)
export function calculateUnitCost(
  purchasePrice: number,
  conversionFactor: number
): number {
  if (conversionFactor === 0) return 0
  return purchasePrice / conversionFactor
}
