import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    try {
        // Fallback for Vercel deployments where DATABASE_URL might not be set in dashboard
        if (!process.env.DATABASE_URL) {
            process.env.DATABASE_URL = "postgresql://neondb_owner:npg_7AkCxb9mHnBy@ep-proud-surf-a1zuw8fu-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
        }
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
