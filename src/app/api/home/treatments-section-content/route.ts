import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { TreatmentSectionContentTranslation } from '@/generated/prisma/client';

const TREATMENT_SECTION_CONTENT_ID = "main";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') || 'tr'; // Varsayılan dil tr

    const content = await prisma.treatmentSectionContent.findUnique({
      where: { id: TREATMENT_SECTION_CONTENT_ID },
      include: {
        translations: {
          where: { languageCode: lang },
        },
        avatars: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    let foundTranslation: TreatmentSectionContentTranslation | null = null;

    if (content.translations.length > 0) {
        foundTranslation = content.translations[0];
    } else {
        // İstenen dilde çeviri yoksa, varsayılan dildeki çeviriyi bulmaya çalış
        const defaultLanguage = await prisma.language.findFirst({ where: { isDefault: true } });
        if (defaultLanguage) {
            const defaultDbTranslation = await prisma.treatmentSectionContentTranslation.findFirst({
                where: {
                    treatmentSectionContentId: TREATMENT_SECTION_CONTENT_ID,
                    languageCode: defaultLanguage.code,
                }
            });
            if (defaultDbTranslation) {
                foundTranslation = defaultDbTranslation;
            }
        }
    }

    // JSON yanıtında kullanılacak çeviri nesnesi. Her zaman bir obje olacak.
    const responseTranslation: TreatmentSectionContentTranslation = foundTranslation
      ? foundTranslation
      : {
          id: `fallback-${TREATMENT_SECTION_CONTENT_ID}-${lang}-${Date.now()}`,
          languageCode: lang,
          treatmentSectionContentId: TREATMENT_SECTION_CONTENT_ID,
          mainTitle: '', 
          mainDescription: '',
          exploreButtonText: '',
          exploreButtonLink: '',
          avatarGroupText: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

    return NextResponse.json({
      id: content.id,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      translation: responseTranslation,
      avatars: content.avatars,
    });

  } catch (error) {
    console.error("Error fetching treatments section content for home:", error);
    return NextResponse.json({ message: 'İçerik getirilirken bir hata oluştu.' }, { status: 500 });
  }
}
