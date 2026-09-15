'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createLoyaltyCard } from '@/server/actions/loyalty'

interface NewLoyaltyCardModalProps {
  open: boolean
  onClose: () => void
}

export function NewLoyaltyCardModal({
  open,
  onClose,
}: NewLoyaltyCardModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createLoyaltyCard({
      name,
      phone: phone || undefined,
    })

    if (result.success) {
      setName('')
      setPhone('')
      onClose()
    } else {
      setError(result.error ?? 'Error al crear la tarjeta')
    }

    setLoading(false)
  }

  function handleClose() {
    setName('')
    setPhone('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva tarjeta de lealtad</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nombre del cliente</Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María García"
              required
              className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div>
            <Label>Teléfono</Label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 5551234567"
              required
              className="border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Necesario para identificar al cliente
            </p>
          </div>
          {error && (
            <p className="text-destructive rounded-lg bg-red-50 px-4 py-3 text-sm">
              {error}
            </p>
          )}

          <div className="border-border flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name || !phone}>
              {loading ? 'Creando...' : 'Crear tarjeta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
