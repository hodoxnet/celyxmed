"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FeatureTabItemForm, { FeatureTabItemFormValues } from '@/components/admin/home-page-feature-tabs/FeatureTabItemForm';
import { toast } from 'sonner';
import { prisma } from '@/lib/prisma'; // Bu doğrudan client tarafında kullanılamaz, API üzerinden dil listesi çekilmeli

interface Language {
  code: string;
  name: string;
}

export default function NewFeatureTabItemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoadingLanguages(true);
        const response = await fetch('/api/languages'); // Aktif dilleri çeken API endpoint'i
        if (!response.ok) {
          throw new Error('Diller yüklenemedi.');
        }
        const data = await response.json();
        setLanguages(data.filter((lang: any) => lang.isActive).map((lang: any) => ({ code: lang.code, name: lang.name })));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Diller yüklenirken bir hata oluştu.');
        console.error("Dil yükleme hatası:", error);
      } finally {
        setLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

  const handleCreateFeatureTabItem = async (data: FeatureTabItemFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/home-page-feature-tabs/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Zod hatalarını daha iyi göstermek için
        if (errorData.error && typeof errorData.error === 'object' && errorData.error._errors) {
            const zodErrors = Object.entries(errorData.error)
            .map(([key, value]) => `${key}: ${(value as any)._errors?.join(', ')}`)
            .join('\n');
          toast.error(`Kaydetme başarısız oldu:\n${zodErrors || 'Bilinmeyen bir hata oluştu.'}`);
        } else {
            toast.error(errorData.error || 'Yeni özellik sekmesi oluşturulurken bir hata oluştu.');
        }
        return false;
      }

      toast.success('Özellik sekmesi başarıyla oluşturuldu!');
      router.push('/admin/home-page-feature-tabs');
      router.refresh(); // Sayfanın yenilenmesini tetikle (isteğe bağlı)
      return true;
    } catch (error) {
      console.error("Oluşturma hatası:", error);
      toast.error('Bir şeyler ters gitti. Lütfen tekrar deneyin.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingLanguages) {
    return <p className="text-center py-10">Diller yükleniyor...</p>;
  }

  if (languages.length === 0) {
    return <p className="text-center py-10 text-red-500">Aktif dil bulunamadı. Lütfen önce dil ekleyin.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Yeni Özellik Sekmesi Ekle</h1>
      </div>
      <FeatureTabItemForm
        onFormSubmit={handleCreateFeatureTabItem}
        languages={languages}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
