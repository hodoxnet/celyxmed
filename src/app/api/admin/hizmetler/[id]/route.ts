import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import * as z from "zod";
import { Role } from '@/generated/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Prisma } from '@/generated/prisma'; // Prisma tiplerini import et

// --- Zod Şemaları (hizmet-form.tsx'den alındı, idealde ayrı dosyada olmalı) ---
const hizmetTocItemSchema = z.object({ id: z.string().optional(), text: z.string().min(1), isBold: z.boolean().default(false), level: z.number().optional().nullable(), order: z.number().default(0) });
const hizmetIntroLinkSchema = z.object({ id: z.string().optional(), targetId: z.string().min(1), number: z.string().min(1), text: z.string().min(1), order: z.number().default(0) });
const hizmetStepSchema = z.object({ id: z.string().optional(), title: z.string().min(1), description: z.string().min(1), linkText: z.string().optional().nullable(), order: z.number().default(0) });
const hizmetFaqItemSchema = z.object({ id: z.string().optional(), question: z.string().min(1), answer: z.string().min(1), order: z.number().default(0) });
const hizmetTranslationSchema = z.object({
  languageCode: z.string(), slug: z.string().min(1), title: z.string().min(1), description: z.string().min(1),
  tocTitle: z.string().default("İçindekiler"), tocAuthorInfo: z.string().default(""), tocCtaDescription: z.string().default(""), tocItems: z.array(hizmetTocItemSchema).default([]),
  introTitle: z.string().default(""), introDescription: z.string().default(""), introPrimaryButtonText: z.string().default(""), introPrimaryButtonLink: z.string().default(""), introSecondaryButtonText: z.string().default(""), introSecondaryButtonLink: z.string().default(""), introLinks: z.array(hizmetIntroLinkSchema).default([]),
  overviewSectionTitle: z.string().default("Genel Bakış"), overviewSectionDescription: z.string().default(""), whySectionTitle: z.string().default("Neden Biz?"), gallerySectionTitle: z.string().default("Galeri"), gallerySectionDescription: z.string().default(""), testimonialsSectionTitle: z.string().optional().nullable().default("Yorumlar"),
  stepsSectionTitle: z.string().default("Adımlar"), stepsSectionDescription: z.string().default(""), steps: z.array(hizmetStepSchema).default([]), recoverySectionTitle: z.string().default("İyileşme Süreci"), recoverySectionDescription: z.string().default(""),
  ctaTagline: z.string().optional().nullable().default(null), ctaTitle: z.string().default("Bize Ulaşın"), ctaDescription: z.string().default(""), ctaButtonText: z.string().default("Randevu Al"), ctaButtonLink: z.string().optional().nullable().default(null), ctaAvatarText: z.string().optional().nullable().default(null),
  pricingSectionTitle: z.string().default("Fiyatlandırma"), pricingSectionDescription: z.string().default(""), expertsSectionTitle: z.string().default("Uzmanlarımız"), expertsTagline: z.string().optional().nullable().default(null),
  faqSectionTitle: z.string().default("Sıkça Sorulan Sorular"), faqSectionDescription: z.string().default(""), faqs: z.array(hizmetFaqItemSchema).default([]),
  metaTitle: z.string().optional().nullable().default(null), metaDescription: z.string().optional().nullable().default(null), metaKeywords: z.string().optional().nullable().default(null),
});
const hizmetOverviewTabTranslationSchema = z.object({ languageCode: z.string(), triggerText: z.string().default(""), title: z.string().default(""), content: z.string().default(""), buttonText: z.string().default("Detaylar"), buttonLink: z.string().optional().nullable().default(null) }); // .min(1) kaldırıldı
const hizmetOverviewTabDefinitionSchema = z.object({ id: z.string().optional(), value: z.string().min(1), imagePath: z.string().optional().nullable().default(null), imageAlt: z.string().optional().nullable().default(null), order: z.number().default(0), translations: z.record(z.string(), hizmetOverviewTabTranslationSchema) });
const hizmetWhyItemTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default(""), description: z.string().default("") }); // .min(1) kaldırıldı
const hizmetWhyItemDefinitionSchema = z.object({ id: z.string().optional(), number: z.string().min(1), order: z.number().default(0), translations: z.record(z.string(), hizmetWhyItemTranslationSchema) });
const hizmetTestimonialTranslationSchema = z.object({ languageCode: z.string(), text: z.string().default(""), author: z.string().default(""), treatment: z.string().optional().nullable() }); // .min(1) kaldırıldı
const hizmetTestimonialDefinitionSchema = z.object({ id: z.string().optional(), stars: z.number().min(1).max(5).default(5), imageUrl: z.string().optional().nullable(), order: z.number().default(0), translations: z.record(z.string(), hizmetTestimonialTranslationSchema) });
const hizmetRecoveryItemTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default(""), description: z.string().default("") }); // .min(1) kaldırıldı
const hizmetRecoveryItemDefinitionSchema = z.object({ id: z.string().optional(), imageUrl: z.string().min(1), imageAlt: z.string().min(1), order: z.number().default(0), translations: z.record(z.string(), hizmetRecoveryItemTranslationSchema) });
const hizmetExpertItemTranslationSchema = z.object({ languageCode: z.string(), name: z.string().default(""), title: z.string().default(""), description: z.string().default(""), ctaText: z.string().optional().nullable() }); // .min(1) kaldırıldı
const hizmetExpertItemDefinitionSchema = z.object({ id: z.string().optional(), imageUrl: z.string().min(1), imageAlt: z.string().min(1), order: z.number().default(0), translations: z.record(z.string(), hizmetExpertItemTranslationSchema) });
const hizmetPricingPackageTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default(""), price: z.string().default(""), features: z.array(z.string()).default([]) }); // .min(1) kaldırıldı
const hizmetPricingPackageDefinitionSchema = z.object({ id: z.string().optional(), isFeatured: z.boolean().default(false), order: z.number().default(0), translations: z.record(z.string(), hizmetPricingPackageTranslationSchema) });
const hizmetFormSchema = z.object({
  id: z.string().optional(), published: z.boolean().default(false), heroImageUrl: z.string().optional().nullable().default(null), heroImageAlt: z.string().optional().nullable().default(null), whyBackgroundImageUrl: z.string().optional().nullable().default(null), ctaBackgroundImageUrl: z.string().optional().nullable().default(null), ctaMainImageUrl: z.string().optional().nullable().default(null), ctaMainImageAlt: z.string().optional().nullable().default(null), introVideoId: z.string().optional().nullable().default(null),
  marqueeImages: z.array(z.object({ id: z.string().optional(), src: z.string().min(1), alt: z.string().min(1), order: z.number().default(0) })).default([]), galleryImages: z.array(z.object({ id: z.string().optional(), src: z.string().min(1), alt: z.string().min(1), order: z.number().default(0) })).default([]), ctaAvatars: z.array(z.object({ id: z.string().optional(), src: z.string().min(1), alt: z.string().min(1), order: z.number().default(0) })).default([]),
  translations: z.record(z.string(), hizmetTranslationSchema),
  overviewTabDefinitions: z.array(hizmetOverviewTabDefinitionSchema).default([]), whyItemDefinitions: z.array(hizmetWhyItemDefinitionSchema).default([]), testimonialDefinitions: z.array(hizmetTestimonialDefinitionSchema).default([]), recoveryItemDefinitions: z.array(hizmetRecoveryItemDefinitionSchema).default([]), expertItemDefinitions: z.array(hizmetExpertItemDefinitionSchema).default([]), pricingPackageDefinitions: z.array(hizmetPricingPackageDefinitionSchema).default([]),
  activeLang: z.string(), // activeLang eklendi
});
// --- Şema kopyalama sonu ---

interface Context {
  params: {
    id: string;
  };
}

// Yardımcı fonksiyon: Fiziksel dosyayı siler
async function deleteFile(relativePath: string | null | undefined) {
  if (!relativePath || !relativePath.startsWith('/uploads/')) {
    // console.warn(`Geçersiz veya boş dosya yolu: ${relativePath}`);
    return;
  }
  try {
    // Güvenlik: Path traversal önlemleri
    const baseUploadDir = join(process.cwd(), 'public');
    const filePath = join(baseUploadDir, relativePath);

    // Dosyanın public/uploads altında olduğundan emin ol
    if (!filePath.startsWith(baseUploadDir + '/uploads/')) {
         console.warn(`Güvenlik uyarısı: İzin verilmeyen dosya yolu silme girişimi engellendi: ${filePath}`);
         return;
    }

    await unlink(filePath);
    console.log(`Dosya silindi: ${filePath}`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error(`Dosya silme hatası (${relativePath}):`, error);
    }
  }
}

// GET: Belirli bir hizmeti ve tüm ilişkili verilerini getir (Yeni yapı)
export async function GET(req: Request, context: Context) {
  try {
    const { id } = context.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const hizmet = await prisma.hizmet.findUnique({
      where: { id },
      include: {
        translations: { include: { language: true, tocItems: true, introLinks: true, steps: true, faqs: true } },
        marqueeImages: { orderBy: { order: 'asc' } },
        galleryImages: { orderBy: { order: 'asc' } },
        ctaAvatars: { orderBy: { order: 'asc' } },
        overviewTabDefinitions: { include: { translations: { include: { language: true } } }, orderBy: { order: 'asc' } },
        whyItemDefinitions: { include: { translations: { include: { language: true } } }, orderBy: { order: 'asc' } },
        testimonialDefinitions: { include: { translations: { include: { language: true } } }, orderBy: { order: 'asc' } },
        recoveryItemDefinitions: { include: { translations: { include: { language: true } } }, orderBy: { order: 'asc' } },
        expertItemDefinitions: { include: { translations: { include: { language: true } } }, orderBy: { order: 'asc' } },
        pricingPackageDefinitions: { include: { translations: { include: { language: true } } }, orderBy: { order: 'asc' } },
      },
    });

    if (!hizmet) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(hizmet);

  } catch (error) {
    console.error(`[GET /api/admin/hizmetler/${context.params.id}] Error:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


// PATCH: Belirli bir hizmeti güncelle (Yeni yapı)
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = context.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const validationResult = hizmetFormSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation Errors:", validationResult.error.flatten().fieldErrors);
      const errors = Object.entries(validationResult.error.flatten().fieldErrors)
        .map(([key, value]) => `${key}: ${value.join(', ')}`)
        .join('; ');
      return new NextResponse(JSON.stringify({ message: `Doğrulama hatası: ${errors}` }), { status: 400 });
    }

    const data = validationResult.data;

    // Mevcut hizmet verisini çek
    const currentHizmet = await prisma.hizmet.findUnique({
      where: { id },
      include: {
        marqueeImages: true,
        galleryImages: true,
        ctaAvatars: true,
        overviewTabDefinitions: { include: { translations: true } },
        whyItemDefinitions: { include: { translations: true } },
        testimonialDefinitions: { include: { translations: true } },
        recoveryItemDefinitions: { include: { translations: true } },
        expertItemDefinitions: { include: { translations: true } },
        pricingPackageDefinitions: { include: { translations: true } },
        translations: { include: { tocItems: true, introLinks: true, steps: true, faqs: true } },
      },
    });

    if (!currentHizmet) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Transaction başlat
    const updatedHizmet = await prisma.$transaction(async (tx) => {
      const deletePromises: Promise<void>[] = [];

      // 1. Ana Hizmet Alanlarını Güncelle
      const vData = validationResult.data;

      // İlişkili verileri vData'dan çıkar
      const {
        translations,
        marqueeImages,
        galleryImages,
        ctaAvatars,
        overviewTabDefinitions,
        whyItemDefinitions,
        testimonialDefinitions,
        recoveryItemDefinitions,
        expertItemDefinitions,
        pricingPackageDefinitions,
        // Diğer ana alanlar burada DEĞİL, aşağıda mainHizmetData'da ele alınıyor
      } = vData;


      const mainHizmetData = {
        published: vData.published,
        heroImageUrl: vData.heroImageUrl,
        heroImageAlt: vData.heroImageAlt,
        whyBackgroundImageUrl: vData.whyBackgroundImageUrl,
        ctaBackgroundImageUrl: vData.ctaBackgroundImageUrl,
        ctaMainImageUrl: vData.ctaMainImageUrl,
        ctaMainImageAlt: vData.ctaMainImageAlt,
        introVideoId: vData.introVideoId === "" ? null : vData.introVideoId,
      };

      // Değişen ana resimleri sil
      if (currentHizmet.heroImageUrl && currentHizmet.heroImageUrl !== mainHizmetData.heroImageUrl) deletePromises.push(deleteFile(currentHizmet.heroImageUrl));
      if (currentHizmet.whyBackgroundImageUrl && currentHizmet.whyBackgroundImageUrl !== mainHizmetData.whyBackgroundImageUrl) deletePromises.push(deleteFile(currentHizmet.whyBackgroundImageUrl));
      if (currentHizmet.ctaBackgroundImageUrl && currentHizmet.ctaBackgroundImageUrl !== mainHizmetData.ctaBackgroundImageUrl) deletePromises.push(deleteFile(currentHizmet.ctaBackgroundImageUrl));
      if (currentHizmet.ctaMainImageUrl && currentHizmet.ctaMainImageUrl !== mainHizmetData.ctaMainImageUrl) deletePromises.push(deleteFile(currentHizmet.ctaMainImageUrl));

      await tx.hizmet.update({
        where: { id },
        data: mainHizmetData, // Sadece ana hizmet alanlarını içerir
      });

      // 2. Dil Bağımsız Koleksiyonları Güncelle (Sil & Yeniden Oluştur)
      const updateCollection = async (collectionName: keyof typeof tx, currentItems: { id: string, src?: string, imageUrl?: string }[], newItems: any[]) => {
        const currentIds = new Set(currentItems.map(item => item.id));
        const newIds = new Set(newItems.map(item => item.id).filter(Boolean)); // Yeni eklenenlerin ID'si olmaz

        // Silinecekleri bul
        const idsToDelete = [...currentIds].filter(id => !newIds.has(id));
        if (idsToDelete.length > 0) {
          // @ts-ignore
          await tx[collectionName].deleteMany({ where: { hizmetId: id, id: { in: idsToDelete } } });
          // İlişkili dosyaları sil
          currentItems.filter(item => idsToDelete.includes(item.id)).forEach(item => deletePromises.push(deleteFile(item.src || item.imageUrl)));
        }

        // Güncellenecek ve eklenecekleri işle (Upsert)
        for (const item of newItems) {
          const data = { ...item, hizmetId: id };
          delete data.id; // ID'yi data'dan çıkar
          // @ts-ignore
          await tx[collectionName].upsert({
            where: { id: item.id || "" }, // ID yoksa create tetiklenir
            update: data,
            create: data,
          });
        }
      };

      await updateCollection('hizmetMarqueeImage', currentHizmet.marqueeImages, marqueeImages);
      await updateCollection('hizmetGalleryImage', currentHizmet.galleryImages, galleryImages);
      await updateCollection('hizmetCtaAvatar', currentHizmet.ctaAvatars, ctaAvatars);


      // 3. Çevirileri Güncelle/Oluştur - Sadece aktif dil için
      const currentTranslationMap = new Map(currentHizmet.translations.map(t => [t.languageCode, t]));
      // Sadece activeLang için işlem yap
      const activeLangCode = data.activeLang;
      
      console.log(`[DEBUG] TRANSLATIONS: Processing ONLY translations for active language: ${activeLangCode}`);
      
      if (translations[activeLangCode]) {
          const newTranslationData = translations[activeLangCode];
          const { tocItems = [], introLinks = [], steps = [], faqs = [], ...mainTranslationData } = newTranslationData;
          const currentTranslation = currentTranslationMap.get(activeLangCode);

          const translationPayload = {
            ...mainTranslationData,
            hizmetId: id,
            languageCode: activeLangCode,
          };

          console.log(`[DEBUG] TRANSLATIONS: Payload for ${activeLangCode}:`, JSON.stringify({
            title: translationPayload.title, 
            description: translationPayload.description
          }));

          if (currentTranslation) {
            // Güncelle - SADECE aktif dil için
            console.log(`[DEBUG] Updating ONLY ${activeLangCode} translation, id: ${currentTranslation.id}`);
            await tx.hizmetTranslation.update({
              where: { id: currentTranslation.id },
              data: translationPayload,
            });
            // İlişkili listeleri güncelle (Sil & Yeniden Oluştur) - SADECE aktif dil için
            await tx.hizmetTocItem.deleteMany({ where: { hizmetTranslationId: currentTranslation.id } });
            if (tocItems.length > 0) await tx.hizmetTocItem.createMany({ data: tocItems.map((item: any) => ({ ...item, id: undefined, hizmetTranslationId: currentTranslation.id })) });
            await tx.hizmetIntroLink.deleteMany({ where: { hizmetTranslationId: currentTranslation.id } });
            if (introLinks.length > 0) await tx.hizmetIntroLink.createMany({ data: introLinks.map((item: any) => ({ ...item, id: undefined, hizmetTranslationId: currentTranslation.id })) });
            await tx.hizmetStep.deleteMany({ where: { hizmetTranslationId: currentTranslation.id } });
            if (steps.length > 0) await tx.hizmetStep.createMany({ data: steps.map((item: any) => ({ ...item, id: undefined, hizmetTranslationId: currentTranslation.id })) });
            await tx.hizmetFaqItem.deleteMany({ where: { hizmetTranslationId: currentTranslation.id } });
            if (faqs.length > 0) await tx.hizmetFaqItem.createMany({ data: faqs.map((item: any) => ({ ...item, id: undefined, hizmetTranslationId: currentTranslation.id })) });

          } else {
            // Oluştur - SADECE aktif dil için
            console.log(`[DEBUG] Creating NEW translation for ${activeLangCode}`);
            await tx.hizmetTranslation.create({
              data: {
                ...translationPayload,
                tocItems: { createMany: { data: tocItems.map((item: any) => ({ ...item, id: undefined })) } },
                introLinks: { createMany: { data: introLinks.map((item: any) => ({ ...item, id: undefined })) } },
                steps: { createMany: { data: steps.map((item: any) => ({ ...item, id: undefined })) } },
                faqs: { createMany: { data: faqs.map((item: any) => ({ ...item, id: undefined })) } },
              },
            });
          }
      } else {
           console.warn(`[WARN] No translation data found in payload for activeLang: ${activeLangCode}`);
      }
      
      // DİĞER DİLLER İÇİN HERHANGİ BİR İŞLEM YAPILMIYOR

      // 4. Definition/Translation Çiftlerini Güncelle/Oluştur/Sil
      const updateDefinitionCollection = async (
        collectionName: string, // örn: "overviewTabDefinitions"
        definitionModelName: keyof typeof tx, // örn: "hizmetOverviewTabDefinition"
        translationModelName: keyof typeof tx, // örn: "hizmetOverviewTabTranslation"
        currentDefinitions: any[],
        newDefinitions: any[]
      ) => {
          interface DefTranslation {
            id: string;
            languageCode: string;
            [key: string]: any;
          }
          const currentDefMap = new Map(currentDefinitions.map(def => [def.id, def]));
          const newDefIds = new Set(newDefinitions.map(def => def.id).filter(Boolean));

          // Silinecek Definition'ları bul
          const defsToDelete = currentDefinitions.filter(def => !newDefIds.has(def.id));
          if (defsToDelete.length > 0) {
              const idsToDelete = defsToDelete.map(def => def.id);
              // Önce ilişkili çevirileri sil (veya cascade delete varsa gerekmeyebilir)
              // @ts-ignore
              await tx[translationModelName].deleteMany({ where: { definitionId: { in: idsToDelete } } });
              // Sonra definition'ları sil
              // @ts-ignore
              await tx[definitionModelName].deleteMany({ where: { id: { in: idsToDelete } } });
              // İlişkili dosyaları sil
              defsToDelete.forEach(def => deletePromises.push(deleteFile(def.imagePath || def.imageUrl)));
          }

          // Güncellenecek/Eklenecek Definition'ları işle
          for (const newDefData of newDefinitions) {
              const { translations: newDefTranslations, ...mainDefData } = newDefData;
              const definitionPayload = { ...mainDefData, hizmetId: id };
              const currentDef = newDefData.id ? currentDefMap.get(newDefData.id) : null;

              let upsertedDefId: string;

              if (currentDef) {
                  // Definition Güncelle - Sadece dil bağımsız alanları güncelle
                  console.log(`[DEBUG] Updating existing definition (${definitionModelName}) with id: ${currentDef.id}:`, JSON.stringify(definitionPayload));
                  // @ts-ignore
                  const updatedDef = await tx[definitionModelName].update({
                      where: { id: currentDef.id },
                      data: definitionPayload,
                  });
                  upsertedDefId = updatedDef.id;
                  // Eski resmi sil (eğer değiştiyse)
                  if (currentDef.imagePath && currentDef.imagePath !== definitionPayload.imagePath) deletePromises.push(deleteFile(currentDef.imagePath));
                  if (currentDef.imageUrl && currentDef.imageUrl !== definitionPayload.imageUrl) deletePromises.push(deleteFile(currentDef.imageUrl));

              } else {
                  // Definition Oluştur
                  console.log(`[DEBUG] Creating NEW definition (${definitionModelName}):`, JSON.stringify(definitionPayload));
                  // @ts-ignore
                  const createdDef = await tx[definitionModelName].create({
                      data: definitionPayload,
                  });
                  upsertedDefId = createdDef.id;
              }

              // Definition'a bağlı çevirileri güncelle/oluştur
              const currentDefTranslationMap = new Map<string, DefTranslation>(
                currentDef?.translations?.map((t: any) => [t.languageCode, t as DefTranslation]) || []
              );
              
              // Sadece activeLang için işlem yap
              const activeLangCode = data.activeLang;
              
              // ÖNEMLİ: Yalnızca active language için işlem yapıyoruz
              // Diğer dillerin (EN, DE, RU) çevirileri korunacak, sadece aktif dil değiştirilecek
              if (newDefTranslations[activeLangCode]) {
                  console.log(`[DEBUG] ONLY processing translation for language: ${activeLangCode}`);
                  
                  const translationPayload = {
                      ...newDefTranslations[activeLangCode],
                      definitionId: upsertedDefId,
                      languageCode: activeLangCode,
                  };
                  
                  const currentDefTranslation: DefTranslation | undefined = currentDefTranslationMap.get(activeLangCode);
                  console.log(`[DEBUG] ${activeLangCode} translation for defId: ${upsertedDefId}. Found existing: ${!!currentDefTranslation}`);
                  
                  if (currentDefTranslation && currentDefTranslation.id) {
                      console.log(`[DEBUG] Updating ONLY ${activeLangCode} translation, ID: ${currentDefTranslation.id}`);
                      
                      // Sadece bu dil için çeviriyi güncelle - diğer diller değişmez
                      // @ts-ignore
                      await tx[translationModelName].update({
                          where: { id: currentDefTranslation.id },
                          data: translationPayload,
                      });
                  } else {
                      console.log(`[DEBUG] Creating NEW ${activeLangCode} translation for defId: ${upsertedDefId}`);
                      
                      // Sadece bu dil için yeni çeviri oluştur
                      // @ts-ignore
                      await tx[translationModelName].create({
                          data: translationPayload,
                      });
                  }
              } else {
                   console.warn(`[WARN] No translation data found for lang ${activeLangCode} on defId: ${upsertedDefId}`);
              }
              
              // UYARI: DİĞER DİLLER İÇİN KESİNLİKLE HİÇBİR İŞLEM YAPILMAYACAK
          }
      };

      await updateDefinitionCollection('overviewTabDefinitions', 'hizmetOverviewTabDefinition', 'hizmetOverviewTabTranslation', currentHizmet.overviewTabDefinitions, overviewTabDefinitions);
      await updateDefinitionCollection('whyItemDefinitions', 'hizmetWhyItemDefinition', 'hizmetWhyItemTranslation', currentHizmet.whyItemDefinitions, whyItemDefinitions);
      await updateDefinitionCollection('testimonialDefinitions', 'hizmetTestimonialDefinition', 'hizmetTestimonialTranslation', currentHizmet.testimonialDefinitions, testimonialDefinitions);
      await updateDefinitionCollection('recoveryItemDefinitions', 'hizmetRecoveryItemDefinition', 'hizmetRecoveryItemTranslation', currentHizmet.recoveryItemDefinitions, recoveryItemDefinitions);
      await updateDefinitionCollection('expertItemDefinitions', 'hizmetExpertItemDefinition', 'hizmetExpertItemTranslation', currentHizmet.expertItemDefinitions, expertItemDefinitions);
      await updateDefinitionCollection('pricingPackageDefinitions', 'hizmetPricingPackageDefinition', 'hizmetPricingPackageTranslation', currentHizmet.pricingPackageDefinitions, pricingPackageDefinitions);


      // Dosya silme işlemlerini bekle
      await Promise.allSettled(deletePromises);

      // Güncellenmiş hizmeti (ilişkileriyle birlikte) döndür
      // @ts-ignore - include yapısı karmaşık olduğu için ignore
      return tx.hizmet.findUnique({ where: { id }, include: Prisma.validator<Prisma.HizmetInclude>()({
          translations: { include: { language: true, tocItems: true, introLinks: true, steps: true, faqs: true } },
          marqueeImages: true, galleryImages: true, ctaAvatars: true,
          overviewTabDefinitions: { include: { translations: { include: { language: true } } } },
          whyItemDefinitions: { include: { translations: { include: { language: true } } } },
          testimonialDefinitions: { include: { translations: { include: { language: true } } } },
          recoveryItemDefinitions: { include: { translations: { include: { language: true } } } },
          expertItemDefinitions: { include: { translations: { include: { language: true } } } },
          pricingPackageDefinitions: { include: { translations: { include: { language: true } } } },
        })
      });
    }); // Transaction sonu

    // DEBUG: Güncelleme sonrası veriyi tekrar çek ve tüm diller için logla
    // Bu, hangi değerlerin değiştiğini ve hangilerinin korunduğunu görmemizi sağlar
    const finalData = await prisma.hizmet.findUnique({
        where: { id },
        include: {
            overviewTabDefinitions: { include: { translations: true } },
            whyItemDefinitions: { include: { translations: true } },
            expertItemDefinitions: { include: { translations: true } },
            // Diğer definition yapıları için de aynısını yapabiliriz
        }
    });
    
    // Sonuç kontrolü ve loglama - bu kısımları try/catch içine alalım
    try {
        // Aktif dil (güncellenen) ve İngilizce dil (korunması gereken) için karşılaştırmalı loglar 
        console.log(`\n[DEBUG RESULTS] *** Active Language (${data.activeLang}) and English translations AFTER update ***`);
        
        // Why Items bölümü için her iki dil kontrolü (null kontrolü yaparak)
        if (finalData?.whyItemDefinitions) {
            console.log("[DEBUG RESULTS] Why Items Active Language Translation:", 
                JSON.stringify(finalData.whyItemDefinitions.map(def => 
                    def.translations.find(t => t.languageCode === data.activeLang)) || [], null, 2));
            console.log("[DEBUG RESULTS] Why Items English Translation:", 
                JSON.stringify(finalData.whyItemDefinitions.map(def => 
                    def.translations.find(t => t.languageCode === 'en')) || [], null, 2));
        }
        
        // Overview Tabs bölümü için her iki dil kontrolü (null kontrolü yaparak)
        if (finalData?.overviewTabDefinitions) {
            console.log("[DEBUG RESULTS] Overview Tabs Active Language Translation:", 
                JSON.stringify(finalData.overviewTabDefinitions.map(def => 
                    def.translations.find(t => t.languageCode === data.activeLang)) || [], null, 2));
            console.log("[DEBUG RESULTS] Overview Tabs English Translation:", 
                JSON.stringify(finalData.overviewTabDefinitions.map(def => 
                    def.translations.find(t => t.languageCode === 'en')) || [], null, 2));
        }
        
        // Uzmanlar bölümü için her iki dil kontrolü (null kontrolü yaparak)
        if (finalData?.expertItemDefinitions) {
            console.log("[DEBUG RESULTS] Expert Items Active Language Translation:", 
                JSON.stringify(finalData.expertItemDefinitions.map(def => 
                    def.translations.find(t => t.languageCode === data.activeLang)) || [], null, 2));
            console.log("[DEBUG RESULTS] Expert Items English Translation:", 
                JSON.stringify(finalData.expertItemDefinitions.map(def => 
                    def.translations.find(t => t.languageCode === 'en')) || [], null, 2));
        }
    } catch (logError) {
        console.error("Error in logging results:", logError);
        // Loglama hatası oluşsa bile API yanıtını etkilemesin
    }


    return NextResponse.json(updatedHizmet);

  } catch (error) {
    console.error(`[PATCH /api/admin/hizmetler/${context.params.id}] Error:`, error);
    if (error instanceof z.ZodError) {
       return new NextResponse(JSON.stringify({ message: "Doğrulama hatası", errors: error.flatten().fieldErrors }), { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { // Unique constraint violation
        const target = (error.meta as any)?.target || [];
        let message = 'Benzersizlik kısıtlaması ihlal edildi.';
        if (target.includes('slug') && target.includes('languageCode')) {
            message = 'Bu dil için belirtilen slug zaten kullanılıyor.';
        }
        return new NextResponse(JSON.stringify({ message }), { status: 409 });
      }
      if (error.code === 'P2025') { // Record to update not found
        return new NextResponse('Not Found', { status: 404 });
      }
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


// DELETE: Belirli bir hizmeti sil (Yeni yapı)
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = context.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Silmeden önce hizmeti ve ilişkili resim yollarını al
    const hizmetToSil = await prisma.hizmet.findUnique({
      where: { id },
      include: {
        marqueeImages: { select: { src: true } },
        galleryImages: { select: { src: true } },
        ctaAvatars: { select: { src: true } },
        overviewTabDefinitions: { select: { imagePath: true } },
        recoveryItemDefinitions: { select: { imageUrl: true } },
        expertItemDefinitions: { select: { imageUrl: true } },
        testimonialDefinitions: { select: { imageUrl: true } },
      }
    });

    if (!hizmetToSil) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // İlişkili fiziksel dosyaları sil
    const deletePromises: Promise<void>[] = [];
    deletePromises.push(deleteFile(hizmetToSil.heroImageUrl));
    deletePromises.push(deleteFile(hizmetToSil.whyBackgroundImageUrl));
    deletePromises.push(deleteFile(hizmetToSil.ctaBackgroundImageUrl));
    deletePromises.push(deleteFile(hizmetToSil.ctaMainImageUrl));
    hizmetToSil.marqueeImages?.forEach(item => deletePromises.push(deleteFile(item.src)));
    hizmetToSil.galleryImages?.forEach(item => deletePromises.push(deleteFile(item.src)));
    hizmetToSil.ctaAvatars?.forEach(item => deletePromises.push(deleteFile(item.src)));
    hizmetToSil.overviewTabDefinitions?.forEach(item => deletePromises.push(deleteFile(item.imagePath)));
    hizmetToSil.recoveryItemDefinitions?.forEach(item => deletePromises.push(deleteFile(item.imageUrl)));
    hizmetToSil.expertItemDefinitions?.forEach(item => deletePromises.push(deleteFile(item.imageUrl)));
    hizmetToSil.testimonialDefinitions?.forEach(item => deletePromises.push(deleteFile(item.imageUrl)));

    await Promise.allSettled(deletePromises);

    // Veritabanı kaydını sil (ilişkili kayıtlar cascade ile silinmeli)
    await prisma.hizmet.delete({ where: { id } });

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error) {
    console.error(`[DELETE /api/admin/hizmetler/${context.params.id}] Error:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return new NextResponse('Not Found', { status: 404 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
