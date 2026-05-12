'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  ShoppingCart,
  Package,
  BarChart3,
  Coffee,
} from 'lucide-react'

const navigation = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Ingredientes',
    href: '/ingredients',
    icon: FlaskConical,
  },
  {
    label: 'Recetas',
    href: '/recipes',
    icon: BookOpen,
  },
  {
    label: 'Ventas',
    href: '/sales',
    icon: ShoppingCart,
  },
  {
    label: 'Inventario',
    href: '/inventory',
    icon: Package,
  },
  {
    label: 'Reportes',
    href: '/reports',
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-sidebar flex h-screen w-64 flex-col">
      {/* Logo */}
      <div className="border-sidebar-border flex items-center gap-3 border-b px-6 py-5">
        <div className="bg-sidebar-primary flex h-9 w-9 items-center justify-center rounded-lg">
          <Coffee className="text-sidebar-primary-foreground h-5 w-5" />
        </div>
        <div>
          <p className="text-sidebar-foreground text-sm font-bold">BaristaOS</p>
          <p className="text-sidebar-muted text-xs">Sistema de gestión</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="border-sidebar-border border-t px-6 py-4">
        <p className="text-sidebar-muted text-xs">v0.1.0 — Desarrollo</p>
      </div>
    </aside>
  )
}
