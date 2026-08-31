import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

export type UserRole = 'OWNER' | 'CASHIER'

const users = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@barista.os',
    password: process.env.OWNER_PASSWORD ?? 'admin123',
    role: 'OWNER' as UserRole,
  },
  {
    id: '2',
    name: 'Cajero',
    email: 'cajero@barista.os',
    password: process.env.CASHIER_PASSWORD ?? 'cajero123',
    role: 'CASHIER' as UserRole,
  },
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(1),
          })
          .safeParse(credentials)

        if (!parsed.success) return null

        const user = users.find(
          (u) =>
            u.email === parsed.data.email && u.password === parsed.data.password
        )

        if (!user) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    session({ session, token }) {
      if (token.role) {
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
