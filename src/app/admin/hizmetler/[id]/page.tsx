import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
// Form importu ve tipi güncellenecek, şimdilik HizmetForm olarak adlandırıyoruz
import { HizmetForm } from "./components/hizmet-form"; // Güncellenecek dosya adı
import { Language, Hizmet } from "@/generated/prisma"; // Hizmet tipini import et

export const metadata: Metadata = {
  title: "Admin - Hizmet Yönetimi",
  description: "Yeni hizmet ekleyin veya mevcut olanı düzenleyin.",
};

interface HizmetPageProps {
  params: Promise<{
    id: string; // 'yeni' veya hizmet ID'si
  }>;
}

// Hizmet ve ilişkili tüm çevirilerini, definition'larını ve onların çevirilerini getirecek tip
// Bu tip HizmetForm bileşeninde daha detaylı tanımlanacak. Şimdilik any kullanabiliriz.
export type HizmetWithTranslationsAndRelations = Hizmet & {
  translations: any[]; // Detaylandırılacak
  marqueeImages: any[];
  galleryImages: any[];
  ctaAvatars: any[];
  overviewTabDefinitions: (any & { translations: any[] })[];
  whyItemDefinitions: (any & { translations:any[] })[];
  testimonialDefinitions: (any & { translations: any[] })[];
  recoveryItemDefinitions: (any & { translations: any[] })[];
  expertItemDefinitions: (any & { translations: any[] })[];
  pricingPackageDefinitions: (any & { translations: any[] })[];
};


async function getHizmetData(id: string): Promise<HizmetWithTranslationsAndRelations | null> {
  if (id === 'yeni') {
    return null; // Yeni kayıt için veri yok
  }

  try {
    const hizmet = await prisma.hizmet.findUnique({
      where: { id },
      include: {
        translations: { // Tüm dillerdeki çevirileri getir
          include: {
            language: true, // Dil bilgisini de al
            tocItems: { orderBy: { order: 'asc' } },
            introLinks: { orderBy: { order: 'asc' } },
            steps: { orderBy: { order: 'asc' } },
            faqs: { orderBy: { order: 'asc' } },
          }
        },
        marqueeImages: { orderBy: { order: 'asc' } },
        galleryImages: { orderBy: { order: 'asc' } },
        ctaAvatars: { orderBy: { order: 'asc' } },
        overviewTabDefinitions: {
          orderBy: { order: 'asc' },
          include: { translations: { include: { language: true } } }
        },
        whyItemDefinitions: {
          orderBy: { order: 'asc' },
          include: { translations: { include: { language: true } } }
        },
        testimonialDefinitions: {
          orderBy: { order: 'asc' },
          include: { translations: { include: { language: true } } }
        },
        recoveryItemDefinitions: {
          orderBy: { order: 'asc' },
          include: { translations: { include: { language: true } } }
        },
        expertItemDefinitions: {
          orderBy: { order: 'asc' },
          include: { translations: { include: { language: true } } }
        },
        pricingPackageDefinitions: {
          orderBy: { order: 'asc' },
          include: { translations: { include: { language: true } } }
        },
      },
    });
    return hizmet as HizmetWithTranslationsAndRelations;
  } catch (error) {
    console.error("Error fetching hizmet data:", error);
    return null;
  }
}

export default async function HizmetPage({ params }: HizmetPageProps) {
  // Next.js 15.3 için params'ı await etmeliyiz
  const { id: paramId } = await params;
  
  // ID güvenli bir şekilde alındı, şimdi hizmet verilerini yükleyebiliriz
  const hizmetData = await getHizmetData(paramId);

  if (paramId !== 'yeni' && !hizmetData) {
    notFound();
  }

  const diller = await prisma.language.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });

  const pageTitle = paramId === 'yeni' ? "Yeni Hizmet Ekle" : "Hizmeti Düzenle";
  const pageDescription = paramId === 'yeni'
    ? "Yeni bir hizmet ve çevirilerini oluşturun."
    : "Mevcut hizmeti ve çevirilerini düzenleyin.";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>
      <HizmetForm initialData={hizmetData} diller={diller} />
    </div>
  );
}
