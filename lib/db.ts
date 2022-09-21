import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = (globalThis as any)._prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  (globalThis as any)._prisma = prisma;
}

export default prisma;
