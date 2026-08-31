'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    // Redirigir según rol — el middleware se encarga del resto
    router.push('/')
    router.refresh()
  }

  return (
    <div className="border-sidebar-border bg-sidebar-accent rounded-2xl border p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-sidebar-foreground">Correo</Label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            className="border-sidebar-border bg-sidebar text-sidebar-foreground placeholder:text-sidebar-muted focus:ring-sidebar-primary mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
        <div>
          <Label className="text-sidebar-foreground">Contraseña</Label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="border-sidebar-border bg-sidebar text-sidebar-foreground placeholder:text-sidebar-muted focus:ring-sidebar-primary mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </div>
  )
}
