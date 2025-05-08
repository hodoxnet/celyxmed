"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from '@/components/admin/image-upload'; // Resim yükleme bileşeni
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch'; // Switch bileşeni eklendi

// Dil verisi tipi
interface Language {
  code: string;
  name: string;
}

// Form doğrulama şeması
const translationSchema = z.object({
  languageCode: z.string(),
  title: z.string().min(1, "Başlık gereklidir"),
  description: z.string().optional(),
  button1Text: z.string().optional(),
  button1Link: z.string().optional().refine(val => !val || val.startsWith('/') || val.startsWith('http'), {
    message: "Link / ile veya http(s):// ile başlamalıdır",
  }),
  button2Text: z.string().optional(),
  button2Link: z.string().optional().refine(val => !val || val.startsWith('/') || val.startsWith('http'), {
    message: "Link / ile veya http(s):// ile başlamalıdır",
  }),
});

const sliderSchema = z.object({
  backgroundImageUrl: z.string().optional().nullable(),
  order: z.number().int().nonnegative(), 
  isActive: z.boolean(), // .default(true) kaldırıldı
  translations: z.array(translationSchema).min(1, "En az bir çeviri gereklidir"),
});

type SliderFormData = z.infer<typeof sliderSchema>;

export default function SliderFormPage() {
  const params = useParams();
  const router = useRouter();
  const sliderId = params.id === 'new' ? null : params.id as string;

  const [loading, setLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SliderFormData>({
    resolver: zodResolver(sliderSchema),
    defaultValues: {
      backgroundImageUrl: null,
      order: 0, // Net bir başlangıç değeri
      isActive: true,
      translations: [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "translations",
  });

  const watchedTranslations = watch("translations");

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await fetch('/api/languages'); // Aktif dilleri getiren API endpoint'i
      if (!response.ok) throw new Error('Diller getirilemedi.');
      const data = await response.json();
      setAvailableLanguages(data.filter((lang: Language) => lang.code)); // Sadece code alanı olanları al
    } catch (error) {
      toast.error('Aktif diller getirilirken bir hata oluştu.');
      console.error(error);
    }
  }, []);

  const fetchSliderData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/sliders/${id}`);
      if (!response.ok) throw new Error('Slider verisi getirilemedi.');
      const data = await response.json();
      reset({
        backgroundImageUrl: data.backgroundImageUrl || null,
        order: data.order ?? 0, // data.order null/undefined ise 0 ata
        isActive: data.isActive === undefined ? true : data.isActive,
        translations: data.translations || [],
      });
    } catch (error) {
      toast.error('Slider verileri getirilirken bir hata oluştu.');
      console.error(error);
    } finally {
      setLoading(false);
      setInitialDataLoaded(true);
    }
  }, [reset]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    if (sliderId) {
      fetchSliderData(sliderId); // Bu fonksiyon içinde setLoading(false) ve setInitialDataLoaded(true) var
    } else {
      // Yeni slider oluşturma durumu
      if (availableLanguages.length > 0) {
        if (fields.length === 0) { // Henüz çeviri alanı eklenmemişse
          const defaultTranslations = availableLanguages.map(lang => ({
            languageCode: lang.code,
            title: '',
            description: '',
            button1Text: '',
            button1Link: '',
            button2Text: '',
            button2Link: '',
          }));
          setValue("translations", defaultTranslations, { shouldValidate: false, shouldDirty: false });
        }
        setInitialDataLoaded(true); // Diller yüklendikten ve varsayılan çeviriler ayarlandıktan sonra
      } else if (!sliderId && availableLanguages.length === 0) {
        // Diller henüz yüklenmediyse ama yeni formdaysak, yine de formu gösterebiliriz
        // ancak çeviri sekmeleri boş olacaktır. Diller gelince dolacak.
        // Ya da burada da bir yükleniyor durumu gösterilebilir. Şimdilik initialDataLoaded'ı true yapıyoruz.
        setInitialDataLoaded(true); 
      }
    }
  }, [sliderId, fetchSliderData, availableLanguages, setValue, fields.length]); // watchedTranslations ve initialDataLoaded bağımlılıklardan çıkarıldı


  const onSubmit = async (data: SliderFormData) => {
    setLoading(true);
    // API'ye göndermeden önce boş string'leri null yapalım (opsiyonel alanlar için)
    const processedData = {
      ...data,
      backgroundImageUrl: data.backgroundImageUrl === '' ? null : data.backgroundImageUrl,
      translations: data.translations.map(t => ({
        ...t,
        description: t.description === '' ? null : t.description,
        button1Text: t.button1Text === '' ? null : t.button1Text,
        button1Link: t.button1Link === '' ? null : t.button1Link,
        button2Text: t.button2Text === '' ? null : t.button2Text,
        button2Link: t.button2Link === '' ? null : t.button2Link,
      }))
    };

    try {
      const response = await fetch(sliderId ? `/api/admin/sliders/${sliderId}` : '/api/admin/sliders', {
        method: sliderId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (sliderId ? 'Slider güncellenirken bir hata oluştu.' : 'Slider oluşturulurken bir hata oluştu.'));
      }

      toast.success(sliderId ? 'Slider başarıyla güncellendi.' : 'Slider başarıyla oluşturuldu.');
      router.push('/admin/sliders');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Veri yüklenene kadar veya diller gelene kadar yükleniyor göster
  if ((sliderId && !initialDataLoaded) || (!sliderId && availableLanguages.length === 0 && fields.length === 0)) {
    return <div className="p-6">Yükleniyor...</div>;
  }


  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {sliderId ? 'Slider Düzenle' : 'Yeni Slider Ekle'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Genel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backgroundImageUrl">Arka Plan Görseli</Label>
              <Controller
                name="backgroundImageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    initialImage={field.value || ''} // value yerine initialImage
                    onImageUploaded={(url) => field.onChange(url)} // onChange yerine onImageUploaded
                    showPreview={true}
                  />
                )}
              />
              {errors.backgroundImageUrl && <p className="text-red-500 text-sm mt-1">{errors.backgroundImageUrl.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Sıra</Label>
                <Input id="order" type="number" {...register('order')} />
                {errors.order && <p className="text-red-500 text-sm mt-1">{errors.order.message}</p>}
              </div>
              <div className="flex items-center space-x-2 pt-6">
                 <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="isActive"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
                <Label htmlFor="isActive">Aktif mi?</Label>
                {errors.isActive && <p className="text-red-500 text-sm mt-1">{errors.isActive.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Çeviriler</CardTitle>
          </CardHeader>
          <CardContent>
            {availableLanguages.length > 0 ? (
              <Tabs defaultValue={availableLanguages[0]?.code || 'tr'} className="w-full">
                <TabsList>
                  {availableLanguages.map((lang, index) => (
                    <TabsTrigger key={lang.code} value={lang.code}>
                      {lang.name}
                       {errors.translations?.[index] && <span className="ml-2 text-red-500">*</span>}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {fields.map((field, index) => {
                  const lang = availableLanguages.find(l => l.code === watchedTranslations[index]?.languageCode);
                  return (
                    <TabsContent key={field.id} value={lang?.code || ''}>
                      <div className="space-y-4 p-1">
                        <input type="hidden" {...register(`translations.${index}.languageCode`)} value={lang?.code} />
                        <div>
                          <Label htmlFor={`translations.${index}.title`}>Başlık ({lang?.name})</Label>
                          <Input id={`translations.${index}.title`} {...register(`translations.${index}.title`)} />
                          {errors.translations?.[index]?.title && <p className="text-red-500 text-sm mt-1">{errors.translations?.[index]?.title?.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor={`translations.${index}.description`}>Açıklama ({lang?.name})</Label>
                          <Textarea id={`translations.${index}.description`} {...register(`translations.${index}.description`)} />
                          {errors.translations?.[index]?.description && <p className="text-red-500 text-sm mt-1">{errors.translations?.[index]?.description?.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`translations.${index}.button1Text`}>Buton 1 Metni ({lang?.name})</Label>
                            <Input id={`translations.${index}.button1Text`} {...register(`translations.${index}.button1Text`)} />
                            {errors.translations?.[index]?.button1Text && <p className="text-red-500 text-sm mt-1">{errors.translations?.[index]?.button1Text?.message}</p>}
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.button1Link`}>Buton 1 Linki ({lang?.name})</Label>
                            <Input id={`translations.${index}.button1Link`} {...register(`translations.${index}.button1Link`)} placeholder="/ornek-sayfa veya https://..." />
                            {errors.translations?.[index]?.button1Link && <p className="text-red-500 text-sm mt-1">{errors.translations?.[index]?.button1Link?.message}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`translations.${index}.button2Text`}>Buton 2 Metni ({lang?.name})</Label>
                            <Input id={`translations.${index}.button2Text`} {...register(`translations.${index}.button2Text`)} />
                            {errors.translations?.[index]?.button2Text && <p className="text-red-500 text-sm mt-1">{errors.translations?.[index]?.button2Text?.message}</p>}
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.button2Link`}>Buton 2 Linki ({lang?.name})</Label>
                            <Input id={`translations.${index}.button2Link`} {...register(`translations.${index}.button2Link`)} placeholder="/diger-sayfa veya https://..." />
                            {errors.translations?.[index]?.button2Link && <p className="text-red-500 text-sm mt-1">{errors.translations?.[index]?.button2Link?.message}</p>}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            ) : (
              <p>Kullanılabilir dil bulunamadı. Lütfen önce dil ekleyin.</p>
            )}
             {errors.translations?.root && <p className="text-red-500 text-sm mt-1">{errors.translations.root.message}</p>}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/sliders')} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (sliderId ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (sliderId ? 'Slider\'ı Güncelle' : 'Slider Oluştur')}
          </Button>
        </div>
      </form>
    </div>
  );
}
