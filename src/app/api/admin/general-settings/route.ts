import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Zod şemaları
const generalSettingTranslationSchema = z.object({
  languageCode: z.string().min(1),
  headerButtonText: z.string().optional().nullable(),
  headerButtonLink: z.string().optional().nullable(),
  socialYoutubeUrl: z.string().optional().nullable(),
  socialInstagramUrl: z.string().optional().nullable(),
  socialTiktokUrl: z.string().optional().nullable(),
  socialFacebookUrl: z.string().optional().nullable(),
  socialLinkedinUrl: z.string().optional().nullable(),
  copyrightText: z.string().optional().nullable(),
  stickyButtonText: z.string().optional().nullable(),
  stickyButtonLink: z.string().optional().nullable(),
});

const generalSettingSchema = z.object({
  faviconUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  emailAddress: z.string().optional().nullable(),
  fullAddress: z.string().optional().nullable(),
  googleMapsEmbed: z.string().optional().nullable(),
  translations: z.array(generalSettingTranslationSchema).optional(),
});

export async function GET() {
  console.log("API: GET /api/admin/general-settings called");
  try {
    console.log("API: Checking session...");
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error("API: No session found.");
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      console.error("API: User is not ADMIN. Role:", session.user.role);
      return NextResponse.json({ error: 'Forbidden - User is not ADMIN' }, { status: 403 });
    }
    console.log("API: Session valid, user is ADMIN. Fetching settings...");

    const settings = await prisma.generalSetting.findFirst({
      include: {
        translations: true,
      },
    });
    console.log("API: Settings fetched:", settings ? `ID: ${settings.id}` : "No settings found");

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('API: Error fetching general settings:', error);
    console.error('API: Error name:', error.name);
    console.error('API: Error message:', error.message);
    console.error('API: Error stack:', error.stack);
    if (error.code) { // Prisma-specific error code
      console.error('API: Prisma error code:', error.code);
    }
    return NextResponse.json({ error: 'Failed to fetch general settings', details: error.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = generalSettingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { translations, ...mainSettingsData } = validation.data;

    // Genellikle tek bir ayar seti olacağı için upsert kullanıyoruz.
    // Eğer birden fazla ayar profili olacaksa, bu mantık değişebilir.
    // Şimdilik, her zaman ilk kaydı bulup güncelleyeceğiz veya yoksa oluşturacağız.
    let existingSettings = await prisma.generalSetting.findFirst();
    let settingsId: string;

    if (existingSettings) {
      settingsId = existingSettings.id;
      await prisma.generalSetting.update({
        where: { id: settingsId },
        data: mainSettingsData,
      });
    } else {
      const newSettings = await prisma.generalSetting.create({
        data: mainSettingsData,
      });
      settingsId = newSettings.id;
    }

    // Çevirileri işle
    if (translations && translations.length > 0) {
      for (const trans of translations) {
        await prisma.generalSettingTranslation.upsert({
          where: {
            generalSettingId_languageCode: {
              generalSettingId: settingsId,
              languageCode: trans.languageCode,
            },
          },
          update: {
            headerButtonText: trans.headerButtonText,
            headerButtonLink: trans.headerButtonLink,
            socialYoutubeUrl: trans.socialYoutubeUrl,
            socialInstagramUrl: trans.socialInstagramUrl,
            socialTiktokUrl: trans.socialTiktokUrl,
            socialFacebookUrl: trans.socialFacebookUrl,
            socialLinkedinUrl: trans.socialLinkedinUrl,
            copyrightText: trans.copyrightText,
            stickyButtonText: trans.stickyButtonText,
            stickyButtonLink: trans.stickyButtonLink,
          },
          create: {
            generalSettingId: settingsId,
            languageCode: trans.languageCode,
            headerButtonText: trans.headerButtonText,
            headerButtonLink: trans.headerButtonLink,
            socialYoutubeUrl: trans.socialYoutubeUrl,
            socialInstagramUrl: trans.socialInstagramUrl,
            socialTiktokUrl: trans.socialTiktokUrl,
            socialFacebookUrl: trans.socialFacebookUrl,
            socialLinkedinUrl: trans.socialLinkedinUrl,
            copyrightText: trans.copyrightText,
            stickyButtonText: trans.stickyButtonText,
            stickyButtonLink: trans.stickyButtonLink,
          },
        });
      }
    }
    
    // Güncellenmiş/oluşturulmuş ayarları döndür
    const updatedSettings = await prisma.generalSetting.findUnique({
        where: { id: settingsId },
        include: {
            translations: true,
        }
    });

    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error) {
    console.error('Error saving general settings:', error);
    // @ts-ignore
    if (error.code === 'P2002') { // Unique constraint failed
      return NextResponse.json({ error: 'Unique constraint violation.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to save general settings' }, { status: 500 });
  }
}
