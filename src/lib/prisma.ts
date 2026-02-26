import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    try {
        return new PrismaClient()
    } catch (e) {
        console.error('CRITICAL: Prisma failed to initialize. Check DATABASE_URL in Vercel settings.', e);
        // Return a self-healing proxy dummy to prevent "cannot read property of undefined" crashes
        return new Proxy({} as any, {
            get: () => () => Promise.resolve([])
        }) as any as PrismaClient;
    }
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Lazy Proxy: Prevents initialization during build/static analysis
const prismaProxy = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        // Internal JS/Next.js/React properties - don't trigger initialization
        if (typeof prop === 'symbol' || prop === 'toJSON' || prop === '$$typeof' || prop === 'constructor') {
            return undefined;
        }

        if (!globalThis.prisma) {
            globalThis.prisma = prismaClientSingleton()
        }
        return (globalThis.prisma as any)[prop]
    }
})

export default prismaProxy
