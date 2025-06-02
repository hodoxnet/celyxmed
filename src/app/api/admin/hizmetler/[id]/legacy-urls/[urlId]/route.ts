import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// DELETE: Legacy URL'yi sil
export const DELETE = withAdmin(async (req: Request, { params }: { params: Promise<{ id: string, urlId: string }> }) => {
  try {
    const { id: hizmetId, urlId } = await params;
    
    // Legacy URL'nin var olup olmadığını ve bu hizmete ait olup olmadığını kontrol et
    const existingLegacyUrl = await prisma.hizmetLegacyUrl.findFirst({
      where: { 
        id: urlId,
        hizmetId 
      }
    });

    if (!existingLegacyUrl) {
      return new NextResponse('Legacy URL not found', { status: 404 });
    }
    
    await prisma.hizmetLegacyUrl.delete({
      where: { id: urlId }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting legacy URL:', error);
    return new NextResponse('An error occurred while deleting the legacy URL', { status: 500 });
  }
});