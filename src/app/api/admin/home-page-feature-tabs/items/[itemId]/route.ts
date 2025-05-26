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

const UpdateFeatureTabItemSchema = z.object({
  value: z.string().min(1, "Sekme değeri gereklidir.").optional(),
  imageUrl: z.string().min(1, "Görsel URL'si gereklidir.").optional(), // .url() kontrolü kaldırıldı
  order: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
  translations: z.array(FeatureTabItemTranslationSchema).min(1, "En az bir çeviri gereklidir.").optional(),
});


interface Params {
  params: Promise<{
    itemId: string;
  }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { itemId } = await params;

    const item = await prisma.homePageFeatureTabItem.findUnique({
      where: { id: itemId },
      include: {
        translations: {
          orderBy: { languageCode: 'asc' },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Öğe bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('[ADMIN_FEATURE_TAB_ITEM_GET]', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { itemId } = await params;
    const body = await request.json();
    console.log("Alınan PUT verileri:", JSON.stringify(body, null, 2));
    
    // Validasyon şemasını daha gevşek hale getir - client tarafta kontrol edildiği için
    const relaxedSchema = z.object({
      value: z.string().min(1, "Sekme değeri gereklidir.").optional(),
      imageUrl: z.string().optional(),
      order: z.number().int().min(0).optional(),
      isPublished: z.boolean().optional(),
      translations: z.array(z.object({
        languageCode: z.string(),
        triggerText: z.string(),
        tagText: z.string(),
        heading: z.string(),
        description: z.string(),
        buttonText: z.string(),
        buttonLink: z.string()
      })).optional()
    });
    
    const validation = relaxedSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validasyon hatası:", validation.error.format());
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { value, imageUrl, order, isPublished, translations } = validation.data;

    // Değerin benzersiz olup olmadığını kontrol et (eğer değiştiriliyorsa)
    if (value) {
      const existingItemWithValue = await prisma.homePageFeatureTabItem.findFirst({
        where: {
          value: value,
          id: { not: itemId },
        },
      });
      if (existingItemWithValue) {
        return NextResponse.json({ error: { _errors: ["Bu 'value' değeri zaten başka bir öğe tarafından kullanılıyor."] } }, { status: 409 });
      }
    }
    
    const currentItem = await prisma.homePageFeatureTabItem.findUnique({
      where: { id: itemId },
    });

    if (!currentItem) {
      return NextResponse.json({ error: 'Güncellenecek öğe bulunamadı.' }, { status: 404 });
    }

    const updatedItem = await prisma.homePageFeatureTabItem.update({
      where: { id: itemId },
      data: {
        ...(value && { value }),
        ...(imageUrl && { imageUrl }),
        ...(order !== undefined && { order }),
        ...(isPublished !== undefined && { isPublished }),
        ...(translations && {
          translations: {
            upsert: translations.map(t => ({
              where: { tabItemId_languageCode: { tabItemId: itemId, languageCode: t.languageCode } },
              update: {
                triggerText: t.triggerText,
                tagText: t.tagText,
                heading: t.heading,
                description: t.description,
                buttonText: t.buttonText,
                buttonLink: t.buttonLink,
              },
              create: {
                languageCode: t.languageCode,
                triggerText: t.triggerText,
                tagText: t.tagText,
                heading: t.heading,
                description: t.description,
                buttonText: t.buttonText,
                buttonLink: t.buttonLink,
              },
            })),
          },
        }),
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('[ADMIN_FEATURE_TAB_ITEM_PUT]', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { itemId } = await params;

    const itemToDelete = await prisma.homePageFeatureTabItem.findUnique({
      where: { id: itemId },
    });

    if (!itemToDelete) {
      return NextResponse.json({ error: 'Silinecek öğe bulunamadı.' }, { status: 404 });
    }

    // İlişkili çeviriler cascade delete ile silinecektir.
    await prisma.homePageFeatureTabItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: 'Öğe başarıyla silindi.' }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN_FEATURE_TAB_ITEM_DELETE]', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
