'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  ShoppingCart,
  Package,
  BarChart3,
  Coffee,
  Menu,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navigation = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Ingredientes', href: '/ingredients', icon: FlaskConical },
  { label: 'Recetas', href: '/recipes', icon: BookOpen },
  { label: 'Ventas', href: '/sales', icon: ShoppingCart },
  { label: 'Inventario', href: '/inventory', icon: Package },
  { label: 'Reportes', href: '/reports', icon: BarChart3 },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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
  )
}

function SidebarLogo() {
  return (
    <div className="border-sidebar-border flex items-center gap-3 border-b px-6 py-5">
      <div className="bg-sidebar-primary flex h-9 w-9 items-center justify-center rounded-lg">
        <Coffee className="text-sidebar-primary-foreground h-5 w-5" />
      </div>
      <div>
        <p className="text-sidebar-foreground text-sm font-bold">BaristaOS</p>
        <p className="text-sidebar-muted text-xs">Sistema de gestión</p>
      </div>
    </div>
  )
}

function SidebarFooter() {
  return (
    <div className="border-sidebar-border border-t px-6 py-4">
      <p className="text-sidebar-muted text-xs">v0.1.0 — Desarrollo</p>
    </div>
  )
}

// Sidebar para desktop — siempre visible
export function DesktopSidebar() {
  return (
    <aside className="bg-sidebar hidden h-screen w-64 flex-col lg:flex">
      <SidebarLogo />
      <NavLinks />
      <SidebarFooter />
    </aside>
  )
}

// Header para móvil — con botón hamburguesa
export function MobileHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-sidebar border-sidebar-border flex items-center justify-between border-b px-4 py-3 lg:hidden">
      <div className="flex items-center gap-3">
        <div className="bg-sidebar-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <Coffee className="text-sidebar-primary-foreground h-4 w-4" />
        </div>
        <p className="text-sidebar-foreground text-sm font-bold">BaristaOS</p>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <button className="text-sidebar-foreground p-1">
              <Menu className="h-6 w-6" />
            </button>
          }
        />
        <SheetContent
          side="left"
          className="bg-sidebar border-sidebar-border w-64 p-0 [&>button]:text-white [&>button]:opacity-100"
        >
          <div className="flex h-full flex-col">
            <div className="border-sidebar-border flex items-center justify-between border-b px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="bg-sidebar-primary flex h-9 w-9 items-center justify-center rounded-lg">
                  <Coffee className="text-sidebar-primary-foreground h-5 w-5" />
                </div>
                <div>
                  <p className="text-sidebar-foreground text-sm font-bold">
                    BaristaOS
                  </p>
                  <p className="text-sidebar-muted text-xs">
                    Sistema de gestión
                  </p>
                </div>
              </div>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <SidebarFooter />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
