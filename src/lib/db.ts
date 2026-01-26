import { PrismaClient } from '@/generated/prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const createPrismaClient = () => new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate())

type PrismaClientWithAccelerate = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClientWithAccelerate
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if(process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
