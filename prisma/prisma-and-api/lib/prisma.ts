import { PrismaClient } from "@prisma/client"

/**
 * Next.js dev server melakukan hot-reload berkali-kali, dan tiap reload
 * berpotensi membuat instance PrismaClient baru jika tidak di-cache.
 * Pola ini menyimpan satu instance global agar tidak membuka koneksi
 * database berlebihan selama development.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
