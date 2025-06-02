import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Tüm rota çevirilerini getir (Admin Only)
export const GET = withAdmin(async () => {
  try {
    const routeTranslations = await prisma.routeTranslation.findMany({
      orderBy: [
        { routeKey: 'asc' },
        { languageCode: 'asc' }
      ]
    });
    
    return NextResponse.json(routeTranslations);
  } catch (error) {
    console.error('Error fetching route translations:', error);
    return new NextResponse('An error occurred while fetching route translations', { status: 500 });
  }
});

// POST: Yeni rota çevirisi ekle (Admin Only)
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { routeKey, languageCode, translatedValue, useRootPath, customPath } = body;
    
    // Alanların doluluğunu kontrol et
    if (!routeKey || !languageCode || !translatedValue) {
      return new NextResponse('Route key, language code, and translated value are required', { status: 400 });
    }
    
    // Dil kodunun geçerliliğini kontrol et
    const language = await prisma.language.findUnique({
      where: { code: languageCode }
    });
    
    if (!language) {
      return new NextResponse(`Language with code ${languageCode} not found`, { status: 404 });
    }
    
    // Çevirinin daha önce eklenip eklenmediğini kontrol et
    const existingTranslation = await prisma.routeTranslation.findFirst({
      where: {
        routeKey,
        languageCode
      }
    });
    
    if (existingTranslation) {
      return new NextResponse(`Translation for route '${routeKey}' in language '${languageCode}' already exists`, { status: 409 });
    }
    
    // Yeni çeviriyi oluştur
    const routeTranslation = await prisma.routeTranslation.create({
      data: {
        routeKey,
        languageCode,
        translatedValue,
        useRootPath: useRootPath || false,
        customPath: customPath || null
      }
    });
    
    return NextResponse.json(routeTranslation, { status: 201 });
  } catch (error) {
    console.error('Error creating route translation:', error);
    return new NextResponse('An error occurred while creating the route translation', { status: 500 });
  }
});

// PUT: Mevcut rota çevirisini güncelle (Admin Only)
export const PUT = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { id, routeKey, languageCode, translatedValue, useRootPath, customPath } = body;
    
    // id'nin varlığını kontrol et
    if (!id) {
      return new NextResponse('Route translation ID is required', { status: 400 });
    }
    
    // Alanların doluluğunu kontrol et
    if (!routeKey || !languageCode || !translatedValue) {
      return new NextResponse('Route key, language code, and translated value are required', { status: 400 });
    }
    
    // Çevirinin var olup olmadığını kontrol et
    const existingTranslation = await prisma.routeTranslation.findUnique({
      where: { id }
    });
    
    if (!existingTranslation) {
      return new NextResponse(`Route translation with ID ${id} not found`, { status: 404 });
    }
    
    // Çeviriyi güncelle
    const updatedTranslation = await prisma.routeTranslation.update({
      where: { id },
      data: {
        routeKey,
        languageCode,
        translatedValue,
        useRootPath: useRootPath !== undefined ? useRootPath : existingTranslation.useRootPath,
        customPath: customPath !== undefined ? customPath : existingTranslation.customPath
      }
    });
    
    return NextResponse.json(updatedTranslation);
  } catch (error) {
    console.error('Error updating route translation:', error);
    return new NextResponse('An error occurred while updating the route translation', { status: 500 });
  }
});