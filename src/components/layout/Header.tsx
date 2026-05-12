import { formatDate } from '@/lib/utils'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const today = formatDate(new Date())

  return (
    <header className="border-border bg-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-sm">
              {description}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-foreground text-sm font-medium">☕ Buen día</p>
          <p className="text-muted-foreground text-xs">{today}</p>
        </div>
      </div>
    </header>
  )
}
