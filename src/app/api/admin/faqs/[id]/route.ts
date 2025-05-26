import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

interface FaqRouteContext {
  params: Promise<{
    id: string;
  }>;
}

// Belirli bir SSS'yi ve çevirilerini getir (GET)
export async function GET(request: Request, context: FaqRouteContext) {
  const { id } = await context.params;
  try {
    const faq = await prisma.faq.findUnique({
      where: { id },
      include: {
        translations: {
          orderBy: {
            languageCode: 'asc',
          },
        },
      },
    });

    if (!faq) {
      return new NextResponse('FAQ not found', { status: 404 });
    }
    return NextResponse.json(faq);
  } catch (error) {
    console.error(`[ADMIN_FAQ_GET_BY_ID: ${id}]`, error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

// Belirli bir SSS'yi güncelle (PUT)
export async function PUT(request: Request, context: FaqRouteContext) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { order, isPublished, translations } = body;

    // Gerekli alanların kontrolü (translations için)
    if (translations !== undefined) {
      if (!Array.isArray(translations)) {
         return new NextResponse('If provided, translations must be an array.', { status: 400 });
      }
      for (const trans of translations) {
        if (!trans.languageCode || trans.question === undefined || trans.answer === undefined) {
          return new NextResponse(
            `Missing required fields in translation for languageCode: ${trans.languageCode || 'unknown'}. Question and answer are required.`,
            { status: 400 }
          );
        }
      }
    }

    const faqToUpdate = await prisma.faq.findUnique({ where: { id } });
    if (!faqToUpdate) {
      return new NextResponse('FAQ not found to update', { status: 404 });
    }

    const updatedFaq = await prisma.faq.update({
      where: { id },
      data: {
        order: order !== undefined ? order : faqToUpdate.order,
        isPublished: isPublished !== undefined ? isPublished : faqToUpdate.isPublished,
        translations: translations 
          ? {
              upsert: translations.map((t: { id?: string; languageCode: string; question: string; answer: string }) => ({
                where: { 
                  // Eğer çeviri ID'si varsa ve eşleşiyorsa onu kullan, yoksa faqId ve languageCode ile bul
                  id: t.id || undefined, 
                  faqId_languageCode: { faqId: id, languageCode: t.languageCode }
                },
                update: { question: t.question, answer: t.answer },
                create: { languageCode: t.languageCode, question: t.question, answer: t.answer },
              })),
            }
          : undefined,
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(updatedFaq);
  } catch (error) {
    console.error(`[ADMIN_FAQ_PUT: ${id}]`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new NextResponse('A translation for one of the languages might already exist for another FAQ or other unique constraint violated.', { status: 409 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}

// Belirli bir SSS'yi sil (DELETE)
export async function DELETE(request: Request, context: FaqRouteContext) {
  const { id } = await context.params;
  try {
    const faqToDelete = await prisma.faq.findUnique({ where: { id } });
    if (!faqToDelete) {
      return new NextResponse('FAQ not found to delete', { status: 404 });
    }

    // İlişkili çeviriler otomatik olarak silinecek (onDelete: Cascade sayesinde)
    await prisma.faq.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // Başarılı silme, içerik yok
  } catch (error) {
    console.error(`[ADMIN_FAQ_DELETE: ${id}]`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Örneğin, silinmeye çalışılan kayıt başka bir yerde kullanılıyorsa (ilişki hatası)
      if (error.code === 'P2014' || error.code === 'P2003') {
         return new NextResponse('This FAQ cannot be deleted as it is related to other records.', { status: 409 });
      }
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}
