import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Hizmetin legacy URL'lerini getir
export const GET = withAdmin(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: hizmetId } = await params;
    
    const legacyUrls = await prisma.hizmetLegacyUrl.findMany({
      where: { hizmetId },
      orderBy: [
        { languageCode: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json(legacyUrls);
  } catch (error) {
    console.error('Error fetching legacy URLs:', error);
    return new NextResponse('An error occurred while fetching legacy URLs', { status: 500 });
  }
});

// POST: Yeni legacy URL ekle
export const POST = withAdmin(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: hizmetId } = await params;
    const body = await req.json();
    const { languageCode, legacySlug, isActive } = body;
    
    if (!languageCode || !legacySlug) {
      return new NextResponse('Language code and legacy slug are required', { status: 400 });
    }

    // Hizmetin var olup olmadığını kontrol et
    const hizmet = await prisma.hizmet.findUnique({
      where: { id: hizmetId }
    });

    if (!hizmet) {
      return new NextResponse('Service not found', { status: 404 });
    }

    // Legacy slug'ın benzersiz olup olmadığını kontrol et
    const existingLegacyUrl = await prisma.hizmetLegacyUrl.findUnique({
      where: { legacySlug }
    });

    if (existingLegacyUrl) {
      return new NextResponse('Legacy slug already exists', { status: 409 });
    }

    // Bu hizmet için bu dilde zaten legacy URL var mı kontrol et
    const existingLegacyUrlForLang = await prisma.hizmetLegacyUrl.findUnique({
      where: { 
        hizmetId_languageCode: {
          hizmetId,
          languageCode
        }
      }
    });

    if (existingLegacyUrlForLang) {
      return new NextResponse('Legacy URL for this language already exists', { status: 409 });
    }
    
    const legacyUrl = await prisma.hizmetLegacyUrl.create({
      data: {
        hizmetId,
        languageCode,
        legacySlug,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    return NextResponse.json(legacyUrl, { status: 201 });
  } catch (error) {
    console.error('Error creating legacy URL:', error);
    return new NextResponse('An error occurred while creating the legacy URL', { status: 500 });
  }
});

// PUT: Mevcut legacy URL'yi güncelle
export const PUT = withAdmin(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: hizmetId } = await params;
    const body = await req.json();
    const { id, languageCode, legacySlug, isActive } = body;
    
    if (!id) {
      return new NextResponse('Legacy URL ID is required', { status: 400 });
    }

    if (!languageCode || !legacySlug) {
      return new NextResponse('Language code and legacy slug are required', { status: 400 });
    }

    // Legacy URL'nin var olup olmadığını ve bu hizmete ait olup olmadığını kontrol et
    const existingLegacyUrl = await prisma.hizmetLegacyUrl.findFirst({
      where: { 
        id,
        hizmetId 
      }
    });

    if (!existingLegacyUrl) {
      return new NextResponse('Legacy URL not found', { status: 404 });
    }

    // Eğer legacy slug değişiyorsa, yenisinin benzersiz olup olmadığını kontrol et
    if (existingLegacyUrl.legacySlug !== legacySlug) {
      const slugExists = await prisma.hizmetLegacyUrl.findFirst({
        where: { 
          legacySlug,
          id: { not: id }
        }
      });

      if (slugExists) {
        return new NextResponse('Legacy slug already exists', { status: 409 });
      }
    }
    
    const updatedLegacyUrl = await prisma.hizmetLegacyUrl.update({
      where: { id },
      data: {
        languageCode,
        legacySlug,
        isActive: isActive !== undefined ? isActive : existingLegacyUrl.isActive
      }
    });
    
    return NextResponse.json(updatedLegacyUrl);
  } catch (error) {
    console.error('Error updating legacy URL:', error);
    return new NextResponse('An error occurred while updating the legacy URL', { status: 500 });
  }
});