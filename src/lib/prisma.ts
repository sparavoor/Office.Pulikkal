import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const prismaClientSingleton = () => {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error('CRITICAL: Turso credentials missing. Falling back to dummy client.');
        return new Proxy({} as any, {
            get: () => () => Promise.resolve([])
        }) as any as PrismaClient;
    }

    try {
        const adapter = new PrismaLibSql({
            url: url,
            authToken: authToken,
        })
        return new PrismaClient({ adapter })
    } catch (e) {
        console.error('CRITICAL: Prisma failed to initialize with Turso.', e);
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
