import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Check if we are in build time but DATABASE_URL is missing
    if (typeof window === 'undefined' && !process.env.DATABASE_URL) {
        console.warn('DATABASE_URL is missing. Deferred Prisma initialization.');
    }
    return new PrismaClient()
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Use a Proxy to defer actual Prisma initialization until the first query.
// This prevents build-time crashes when DATABASE_URL is not available.
const prismaProxy = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        if (prop === 'constructor') return PrismaClient;

        if (!globalThis.prisma) {
            globalThis.prisma = prismaClientSingleton()
        }
        return (globalThis.prisma as any)[prop]
    }
})

export default prismaProxy
