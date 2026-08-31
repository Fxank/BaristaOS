import type { Metadata } from 'next'
import { DesktopSidebar, MobileHeader } from '@/components/layout/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'BaristaOS — Sistema de gestión',
  description: 'Sistema de gestión para negocios de bebidas preparadas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div className="flex h-screen overflow-hidden">
          <DesktopSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <MobileHeader />
            <main className="bg-background flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
