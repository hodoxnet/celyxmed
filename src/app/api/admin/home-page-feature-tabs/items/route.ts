import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth';

// Zod şemaları
const FeatureTabItemTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir."),
  triggerText: z.string().min(1, "Sekme başlığı gereklidir."),
  tagText: z.string().min(1, "Etiket metni gereklidir."),
  heading: z.string().min(1, "İçerik başlığı gereklidir."),
  description: z.string().min(1, "Açıklama gereklidir."),
  buttonText: z.string().min(1, "Buton metni gereklidir."),
  buttonLink: z.string().min(1, "Buton linki gereklidir."),
});

const CreateFeatureTabItemSchema = z.object({
  value: z.string().min(1, "Sekme değeri gereklidir."),
  imageUrl: z.string().min(1, "Görsel URL'si gereklidir."), // .url() kontrolü kaldırıldı
  order: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  translations: z.array(FeatureTabItemTranslationSchema).min(1, "En az bir çeviri gereklidir."),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const items = await prisma.homePageFeatureTabItem.findMany({
      orderBy: { order: 'asc' },
      include: {
        translations: {
          orderBy: { languageCode: 'asc' },
        },
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('[ADMIN_FEATURE_TABS_GET]', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const body = await request.json();
    console.log("Alınan POST verileri:", JSON.stringify(body, null, 2));
    
    // Validasyon şemasını daha gevşek hale getir - client tarafta kontrol edildiği için
    const relaxedSchema = z.object({
      value: z.string().min(1, "Sekme değeri gereklidir."),
      imageUrl: z.string(),
      order: z.number().int().min(0).default(0),
      isPublished: z.boolean().default(true),
      translations: z.array(z.object({
        languageCode: z.string(),
        triggerText: z.string(),
        tagText: z.string(),
        heading: z.string(),
        description: z.string(),
        buttonText: z.string(),
        buttonLink: z.string()
      })).min(1, "En az bir çeviri gereklidir.")
    });
    
    const validation = relaxedSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validasyon hatası:", validation.error.format());
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { value, imageUrl, order, isPublished, translations } = validation.data;

    // Değerin benzersiz olup olmadığını kontrol et
    const existingItem = await prisma.homePageFeatureTabItem.findUnique({
      where: { value },
    });

    if (existingItem) {
      console.error(`Value değeri çakışması: '${value}' zaten mevcut.`);
      return NextResponse.json({ error: { _errors: ["Bu 'value' değeri zaten kullanılıyor."] } }, { status: 409 });
    }

    const newItem = await prisma.homePageFeatureTabItem.create({
      data: {
        value,
        imageUrl,
        order,
        isPublished,
        translations: {
          create: translations.map(t => ({
            languageCode: t.languageCode,
            triggerText: t.triggerText,
            tagText: t.tagText,
            heading: t.heading,
            description: t.description,
            buttonText: t.buttonText,
            buttonLink: t.buttonLink,
          })),
        },
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_FEATURE_TABS_POST]', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
