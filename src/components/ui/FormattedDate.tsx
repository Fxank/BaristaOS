'use client'

import { formatDate } from '@/lib/utils'

interface FormattedDateProps {
  date: Date
  className?: string
}

export function FormattedDate({ date, className }: FormattedDateProps) {
  return <span className={className}>{formatDate(date)}</span>
}
