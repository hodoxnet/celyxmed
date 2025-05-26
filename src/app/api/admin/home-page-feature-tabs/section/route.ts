import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth';

// Zod şemaları
const SectionTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir."),
  mainTitle: z.string().optional(), // Başlık opsiyonel olabilir
  mainDescription: z.string().optional(), // Açıklama opsiyonel olabilir
});

const UpdateSectionSchema = z.object({
  translations: z.array(SectionTranslationSchema).min(1, "En az bir çeviri gereklidir."),
});

// Helper function to get or create the section
async function getOrCreateSection() {
  let section = await prisma.homePageFeaturesTabsSection.findUnique({
    where: { id: "main" },
    include: {
      translations: {
        orderBy: { languageCode: 'asc' },
      },
    },
  });

  if (!section) {
    section = await prisma.homePageFeaturesTabsSection.create({
      data: {
        id: "main",
        // Başlangıçta boş çevirilerle oluşturulabilir veya ilk PUT isteğinde eklenebilir
      },
      include: {
        translations: true,
      },
    });
  }
  return section;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const section = await getOrCreateSection();
    return NextResponse.json(section);
  } catch (error) {
    console.error('[ADMIN_FEATURE_TABS_SECTION_GET]', error);
    return NextResponse.json({ error: 'Bölüm bilgileri alınırken bir hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const body = await request.json();
    const validation = UpdateSectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { translations } = validation.data;

    const section = await getOrCreateSection(); // Var olanı al veya oluştur

    const updatedSection = await prisma.homePageFeaturesTabsSection.update({
      where: { id: "main" },
      data: {
        translations: {
          upsert: translations.map(t => ({
            where: { sectionId_languageCode: { sectionId: "main", languageCode: t.languageCode } },
            update: {
              mainTitle: t.mainTitle,
              mainDescription: t.mainDescription,
            },
            create: {
              languageCode: t.languageCode,
              mainTitle: t.mainTitle,
              mainDescription: t.mainDescription,
            },
          })),
        },
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('[ADMIN_FEATURE_TABS_SECTION_PUT]', error);
    return NextResponse.json({ error: 'Bölüm bilgileri güncellenirken bir hata oluştu.' }, { status: 500 });
  }
}
