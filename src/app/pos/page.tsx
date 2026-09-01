import { POSClient } from '@/components/pos/POSClient'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function POSPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <POSClient userName={session.user?.name ?? 'Usuario'} />
}
