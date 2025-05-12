"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FeatureTabItemForm, { FeatureTabItemFormValues, FeatureTabItemFormData } from '@/components/admin/home-page-feature-tabs/FeatureTabItemForm';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
}

export default function EditFeatureTabItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.itemId as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [initialData, setInitialData] = useState<FeatureTabItemFormData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) return;
      setLoadingData(true);
      try {
        // Önce dilleri çek
        const langResponse = await fetch('/api/languages');
        if (!langResponse.ok) throw new Error('Diller yüklenemedi.');
        const langData: Array<{ id: string; code: string; name: string; isActive: boolean; isDefault: boolean; createdAt: string; updatedAt: string; }> = await langResponse.json();
        const activeLanguages = langData.filter(lang => lang.isActive).map(lang => ({ code: lang.code, name: lang.name }));
        setLanguages(activeLanguages);

        // Sonra öğe verisini çek
        const itemResponse = await fetch(`/api/admin/home-page-feature-tabs/items/${itemId}`);
        if (!itemResponse.ok) {
          if (itemResponse.status === 404) {
            toast.error('Özellik sekmesi bulunamadı.');
            router.push('/admin/home-page-feature-tabs');
          } else {
            throw new Error('Özellik sekmesi verisi yüklenemedi.');
          }
          return;
        }
        const itemData: FeatureTabItemFormData = await itemResponse.json();
        
        // Gelen veriyi forma uygun hale getir (özellikle çeviriler için tüm dillerin olması)
        const formattedTranslations = activeLanguages.map(lang => {
            const existingTranslation = itemData.translations.find(t => t.languageCode === lang.code);
            return existingTranslation || {
                languageCode: lang.code,
                triggerText: "",
                tagText: "",
                heading: "",
                description: "",
                buttonText: "",
                buttonLink: "",
            };
        });

        setInitialData({ ...itemData, translations: formattedTranslations });

      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Veri yüklenirken bir hata oluştu.');
        console.error("Veri yükleme hatası:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [itemId, router]);

  const handleUpdateFeatureTabItem = async (data: FeatureTabItemFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/home-page-feature-tabs/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
         if (errorData.error && typeof errorData.error === 'object' && errorData.error._errors) {
            const zodErrors = Object.entries(errorData.error)
            .map(([key, value]) => `${key}: ${(value as any)._errors?.join(', ')}`)
            .join('\n');
          toast.error(`Güncelleme başarısız oldu:\n${zodErrors || 'Bilinmeyen bir hata oluştu.'}`);
        } else {
            toast.error(errorData.error || 'Özellik sekmesi güncellenirken bir hata oluştu.');
        }
        return false;
      }

      toast.success('Özellik sekmesi başarıyla güncellendi!');
      router.push('/admin/home-page-feature-tabs');
      router.refresh();
      return true;
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      toast.error('Bir şeyler ters gitti. Lütfen tekrar deneyin.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return <p className="text-center py-10">Veriler yükleniyor...</p>;
  }

  if (!initialData) {
    // Hata mesajı zaten useEffect içinde toast ile gösterildi veya yönlendirme yapıldı.
    // Bu durum normalde görünmemeli.
    return <p className="text-center py-10 text-red-500">Öğe verisi bulunamadı.</p>;
  }
  
  if (languages.length === 0 && !loadingData) {
     return <p className="text-center py-10 text-red-500">Aktif dil bulunamadı. Lütfen önce dil ekleyin.</p>;
  }


  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Özellik Sekmesini Düzenle</h1>
      </div>
      <FeatureTabItemForm
        initialData={initialData}
        onFormSubmit={handleUpdateFeatureTabItem}
        languages={languages}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
