import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    try {
        return new PrismaClient()
    } catch (e) {
        console.error('Prisma initialization failed:', e);
        return {} as PrismaClient; // Return dummy object to prevent top-level crash
    }
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Use a Proxy to defer actual Prisma initialization until the first query.
// This prevents build-time crashes when DATABASE_URL is not available.
const prismaProxy = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        // Prevent Vercel's build-time inspection from triggering initialization
        if (typeof prop === 'symbol' || prop === 'toJSON' || prop === '$$typeof') {
            return undefined;
        }

        if (prop === 'constructor') return PrismaClient;

        if (!globalThis.prisma) {
            globalThis.prisma = prismaClientSingleton()
        }
        return (globalThis.prisma as any)[prop]
    }
})

export default prismaProxy
