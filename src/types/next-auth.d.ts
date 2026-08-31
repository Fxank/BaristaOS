import { UserRole } from '@/auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      role: UserRole
    } & DefaultSession['user']
  }
}
