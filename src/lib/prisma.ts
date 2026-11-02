import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

type PrismaClientType = InstanceType<typeof PrismaClient>;

/**
 * Cria o cliente do Prisma.
 *
 * A criação é **preguiçosa**: o cliente só é instanciado quando a primeira
 * consulta é feita. Isso permite compilar a aplicação (build do Next.js) sem
 * um banco de dados disponível no momento do build.
 */
function createPrismaClient(): PrismaClientType {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não está definida.");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter }) as PrismaClientType;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientType;
};

function getClient(): PrismaClientType {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/** Cliente do Prisma (instanciado sob demanda). */
export const prisma = new Proxy({} as PrismaClientType, {
  get(_target, property) {
    if (typeof property === "symbol") return undefined;
    const client = getClient() as unknown as Record<string | symbol, unknown>;
    return client[property];
  },
});
