'use client'

import { Wifi, WifiOff, RefreshCw, Coffee, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface POSStatusBarProps {
  userName: string
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSync: Date | null
  onSync: () => void
}

export function POSStatusBar({
  userName,
  isOnline,
  isSyncing,
  pendingCount,
  onSync,
}: Omit<POSStatusBarProps, 'lastSync'> & { lastSync: Date | null }) {
  return (
    <div className="bg-sidebar flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <Coffee className="text-sidebar-primary h-4 w-4" />
        <span className="text-sidebar-foreground text-sm font-bold">
          BaristaOS POS
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-emerald-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
          <span
            className={`text-xs font-medium ${
              isOnline ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isOnline ? 'En línea' : 'Sin conexión'}
          </span>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
              {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={onSync}
              disabled={!isOnline || isSyncing}
              className="text-sidebar-muted hover:text-sidebar-foreground disabled:opacity-50"
              title="Sincronizar ahora"
            >
              <RefreshCw
                className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        )}

        <span className="text-sidebar-muted text-xs">{userName}</span>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sidebar-muted hover:text-sidebar-foreground"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
