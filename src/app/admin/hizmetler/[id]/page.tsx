import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma"; // Veri çekmek için
import { HizmetDetayForm } from "./components/hizmet-detay-form"; // Formu import et
import { HizmetDetay, Language } from "@/generated/prisma"; // Language tipini de import et

export const metadata: Metadata = {
  // Dinamik olarak ayarlanabilir
  title: "Admin - Hizmet Detayı Yönetimi",
  description: "Yeni hizmet detayı ekleyin veya mevcut olanı düzenleyin.",
};

interface HizmetDetayPageProps {
  params: {
    id: string; // 'yeni' veya hizmet ID'si
  };
}

// Sunucu tarafında veri çekme (InitialDataType'ı döndürecek şekilde güncellendi)
// initialData tipini daha esnek hale getirelim (ilişkili alanlar opsiyonel olabilir)
type InitialDataType = Partial<HizmetDetay & {
    tocItems: any[];
    marqueeImages: any[];
    introLinks: any[];
    overviewTabs: any[];
    whyItems: any[];
    galleryImages: any[];
    testimonials: any[];
    steps: any[];
    recoveryItems: any[];
    ctaAvatars: any[];
    pricingPackages: any[];
    expertItems: any[];
    faqs: any[];
}> | null;

async function getHizmetDetay(id: string): Promise<InitialDataType> {
  if (id === 'yeni') {
    return null; // Yeni kayıt için veri yok
  }

  try {
    const hizmetDetay = await prisma.hizmetDetay.findUnique({
      where: { id },
      // İlişkili verileri getir, sıralama olmadan
      include: {
        tocItems: true,
        marqueeImages: true,
        introLinks: true,
        overviewTabs: true,
        whyItems: true,
        galleryImages: true,
        testimonials: true,
        steps: true,
        recoveryItems: true,
        ctaAvatars: true,
        pricingPackages: true,
        expertItems: true,
        faqs: true,
      },
    });
    return hizmetDetay;
  } catch (error) {
    console.error("Error fetching hizmet detay:", error);
    return null; // Hata durumunda null dön
  }
}

export default async function HizmetDetayPage({ params }: HizmetDetayPageProps) {
  const hizmetDetay = await getHizmetDetay(params.id);

  // ID 'yeni' değilse ve veri bulunamadıysa 404 göster
  if (params.id !== 'yeni' && !hizmetDetay) {
    notFound();
  }

  // TODO: Dilleri çekip forma göndermek gerekebilir (select için)
  const diller = await prisma.language.findMany({ where: { isActive: true } });

  const pageTitle = params.id === 'yeni' ? "Yeni Hizmet Detayı Ekle" : "Hizmet Detayını Düzenle";
  const pageDescription = params.id === 'yeni'
    ? "Yeni bir hizmet detayı oluşturun."
    : "Mevcut hizmet detayını düzenleyin.";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>

      {/*
        Buraya formu yönetecek Client Component gelecek.
        Başlangıç verisi olarak 'hizmetDetay' ve 'diller' prop'larını alacak.
        Örnek: <HizmetDetayForm initialData={hizmetDetay} diller={diller} />
        Buraya formu yönetecek Client Component gelecek.
        Başlangıç verisi olarak 'hizmetDetay' ve 'diller' prop'larını alacak.
      */}
      <HizmetDetayForm initialData={hizmetDetay} diller={diller} />
    </div>
  );
}
