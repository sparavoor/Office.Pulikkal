import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prismaProxy = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        if (!globalThis.prisma) {
            globalThis.prisma = prismaClientSingleton()
        }
        return (globalThis.prisma as any)[prop]
    }
})

export default prismaProxy
