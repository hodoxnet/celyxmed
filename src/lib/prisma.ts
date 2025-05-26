import { PrismaClient } from '@/generated/prisma/client';

// PrismaClient global nesnesini declare et (dev hot reload için)
declare global {
  var prisma: PrismaClient | undefined;
}

// Her sıcak yeniden yüklemede client yeniden oluşturmamak için
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
