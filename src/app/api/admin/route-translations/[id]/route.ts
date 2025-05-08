import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

interface Context {
  params: {
    id: string;
  };
}

// GET: Belirli bir rota çevirisini getir (Admin Only)
export const GET = withAdmin(async (req: Request, context: Context) => {
  try {
    const { id } = context.params;
    
    const routeTranslation = await prisma.routeTranslation.findUnique({
      where: { id }
    });
    
    if (!routeTranslation) {
      return new NextResponse(`Route translation with ID ${id} not found`, { status: 404 });
    }
    
    return NextResponse.json(routeTranslation);
  } catch (error) {
    console.error(`Error fetching route translation ${context.params.id}:`, error);
    return new NextResponse('An error occurred while fetching the route translation', { status: 500 });
  }
});

// DELETE: Belirli bir rota çevirisini sil (Admin Only)
export const DELETE = withAdmin(async (req: Request, context: Context) => {
  try {
    const { id } = context.params;
    
    // Çevirinin var olup olmadığını kontrol et
    const routeTranslation = await prisma.routeTranslation.findUnique({
      where: { id }
    });
    
    if (!routeTranslation) {
      return new NextResponse(`Route translation with ID ${id} not found`, { status: 404 });
    }
    
    // Çeviriyi sil
    await prisma.routeTranslation.delete({
      where: { id }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting route translation ${context.params.id}:`, error);
    return new NextResponse('An error occurred while deleting the route translation', { status: 500 });
  }
});