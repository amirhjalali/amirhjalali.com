import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn'] : ['error'],
  // Connection pool configuration for better stability
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle graceful shutdown - Removed to prevent premature connection closure in workers
// The worker script handles its own disconnection logic
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.IS_WORKER) {
  // Only add this for production web server, not workers
  // process.on('beforeExit', async () => {
  //   await prisma.$disconnect()
  // })
}
