import { PrismaClient } from '@/generated/prisma'

// PrismaClient es adjuntado al objeto global en desarrollo
// para evitar crear múltiples instancias por hot-reload de Next.js
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
