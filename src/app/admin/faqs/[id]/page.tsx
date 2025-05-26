"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Textarea eklendi
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dil verisi tipi (API'den gelecek)
interface LanguageData {
  code: string;
  name: string;
}

// Form için çeviri şeması
const faqTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gerekli"),
  question: z.string().min(1, "Soru gerekli"),
  answer: z.string().min(1, "Cevap gerekli"),
  id: z.string().optional(), // Mevcut çevirileri güncellemek için
});

// Ana SSS formu şeması
const faqFormSchema = z.object({
  order: z.coerce.number().int().min(0), // .default(0) kaldırıldı, formda varsayılan değer sağlanacak
  isPublished: z.boolean(),             // .default(true) kaldırıldı, formda varsayılan değer sağlanacak
  translations: z.array(faqTranslationSchema).min(1, "En az bir çeviri eklenmeli"),
});

type FaqFormValues = z.infer<typeof faqFormSchema>;

const FaqFormPage = () => {
  const router = useRouter();
  const params = useParams();
  const faqId = params.id === 'new' ? null : params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageData[]>([]);
  const [pageTitle, setPageTitle] = useState("Yeni SSS Ekle");

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      order: 0,
      isPublished: true,
      translations: [],
    } as FaqFormValues, // Açık tip ataması
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "translations",
  });

  // Dilleri ve mevcut SSS verisini çek
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Dilleri çek
      const langResponse = await fetch('/api/languages?active=true'); // Sadece aktif dilleri alabiliriz
      if (!langResponse.ok) throw new Error('Diller getirilemedi');
      const langData = await langResponse.json();
      setAvailableLanguages(langData);

      if (faqId) {
        setPageTitle("SSS Düzenle");
        const faqResponse = await fetch(`/api/admin/faqs/${faqId}`);
        if (!faqResponse.ok) throw new Error('SSS verisi getirilemedi');
        const faqData = await faqResponse.json();
        form.reset({
          order: faqData.order,
          isPublished: faqData.isPublished,
          translations: faqData.translations.map((t: any) => ({
            id: t.id, // Mevcut çeviri ID'si
            languageCode: t.languageCode,
            question: t.question,
            answer: t.answer,
          })),
        });
      } else {
        // Yeni SSS için varsayılan olarak aktif dilleri ekle
        form.setValue('translations', langData.map((lang: LanguageData) => ({
          languageCode: lang.code,
          question: '',
          answer: '',
        })));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Veri getirilirken bir hata oluştu.");
      console.error("Fetch data error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [faqId, form]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data: FaqFormValues) => {
    setIsLoading(true);
    try {
      const apiUrl = faqId ? `/api/admin/faqs/${faqId}` : '/api/admin/faqs';
      const method = faqId ? 'PUT' : 'POST';

      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `İşlem başarısız: ${response.statusText}` }));
        throw new Error(errorData.message || `İşlem başarısız: ${response.statusText}`);
      }

      toast.success(`SSS başarıyla ${faqId ? 'güncellendi' : 'oluşturuldu'}!`);
      router.push('/admin/faqs');
      router.refresh(); // Sayfanın yenilenmesini tetikle (opsiyonel)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu.");
      console.error("Submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTranslation = () => {
    const existingLangCodes = fields.map(f => f.languageCode);
    const nextLang = availableLanguages.find(lang => !existingLangCodes.includes(lang.code));
    if (nextLang) {
      append({ languageCode: nextLang.code, question: '', answer: '' });
    } else {
      toast.info("Tüm diller için çeviri zaten eklenmiş veya kullanılabilir dil yok.");
    }
  };
  
  if (isLoading && !form.formState.isDirty && !fields.length) { // İlk yükleme için daha iyi bir kontrol
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <Button variant="outline" size="sm" onClick={() => router.push('/admin/faqs')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> SSS Listesine Dön
      </Button>
      <h1 className="text-2xl font-semibold mb-6">{pageTitle}</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Genel Ayarlar */}
        <div className="space-y-4 p-6 border rounded-md">
          <h2 className="text-lg font-medium">Genel Bilgiler</h2>
          <div>
            <Label htmlFor="order">Sıra</Label>
            <Input
              id="order"
              type="number"
              {...form.register('order')}
              className="mt-1"
            />
            {form.formState.errors.order && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.order.message}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <Checkbox
                  id="isPublished"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="isPublished" className="cursor-pointer">
              Yayınlandı
            </Label>
          </div>
        </div>

        {/* Çeviriler */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Çeviriler</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="p-6 border rounded-md space-y-4 relative">
              <div className="flex justify-between items-center">
                <Controller
                  control={form.control}
                  name={`translations.${index}.languageCode`}
                  render={({ field: selectField }) => (
                    <Select
                      onValueChange={selectField.onChange}
                      defaultValue={selectField.value}
                      value={selectField.value}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Dil Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code} disabled={fields.some(f => f.languageCode === lang.code && f.languageCode !== selectField.value)}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {fields.length > 1 && (
                   <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 absolute top-4 right-4"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
               {form.formState.errors.translations?.[index]?.languageCode && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.translations?.[index]?.languageCode?.message}</p>
              )}

              <div>
                <Label htmlFor={`translations.${index}.question`}>Soru</Label>
                <Input
                  id={`translations.${index}.question`}
                  {...form.register(`translations.${index}.question`)}
                  className="mt-1"
                  placeholder="Sıkça sorulan soru"
                />
                {form.formState.errors.translations?.[index]?.question && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.translations?.[index]?.question?.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor={`translations.${index}.answer`}>Cevap</Label>
                <Textarea
                  id={`translations.${index}.answer`}
                  {...form.register(`translations.${index}.answer`)}
                  className="mt-1"
                  placeholder="Sorunun cevabı (HTML destekler)"
                  rows={5}
                />
                {form.formState.errors.translations?.[index]?.answer && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.translations?.[index]?.answer?.message}</p>
                )}
              </div>
            </div>
          ))}
          {form.formState.errors.translations && !form.formState.errors.translations.root && !Array.isArray(form.formState.errors.translations) && (
             <p className="text-sm text-red-500 mt-1">{form.formState.errors.translations.message}</p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTranslation}
            disabled={fields.length >= availableLanguages.length}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Çeviri Ekle
          </Button>
        </div>

        <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/faqs')} disabled={isLoading}>
                İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? (faqId ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (faqId ? 'Değişiklikleri Kaydet' : 'SSS Oluştur')}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default FaqFormPage;
