import { formatDate } from '@/lib/utils'
import { auth } from '@/auth'
import { signOut } from '@/auth'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  title: string
  description?: string
}

export async function Header({ title, description }: HeaderProps) {
  const session = await auth()
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
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-foreground text-sm font-medium">
              {session?.user?.name ?? 'Usuario'}
            </p>
            <p className="text-muted-foreground text-xs">{today}</p>
          </div>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button
              type="submit"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
