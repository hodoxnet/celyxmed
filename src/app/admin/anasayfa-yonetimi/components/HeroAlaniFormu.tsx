'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MixedLoadingSkeleton } from './LoadingSkeletons';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Language } from '@/generated/prisma/client';
import ImageUpload from '@/components/admin/image-upload';
// Tabs importları kaldırıldı, merkezi dil seçici kullanılacak
import { Trash2 } from 'lucide-react'; // GripVertical kaldırıldı, bu bileşende kullanılmıyor gibi
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

// Zod Şemaları (Sadece Hero için gerekli olanlar)
const heroContentTranslationSchemaClient = z.object({
  languageCode: z.string().min(1),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  button1Text: z.string().optional().nullable(),
  button1Link: z.string().optional().nullable().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }),
  button2Text: z.string().optional().nullable(),
  button2Link: z.string().optional().nullable().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }),
});

const heroBackgroundImageSchemaClient = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1, "Resim URL'si gereklidir"),
  order: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

// Ana Şema (Sadece Hero alanları)
const heroSchemaClient = z.object({
  heroContentTranslations: z.array(heroContentTranslationSchemaClient).optional(),
  heroImages: z.array(heroBackgroundImageSchemaClient).optional(),
});

type HeroFormData = z.infer<typeof heroSchemaClient>;

interface HeroAlaniFormuProps {
  activeLanguageCode: string;
  availableLanguages: Language[]; // Bu prop ana sayfadan gelecek
}

export default function HeroAlaniFormu({ activeLanguageCode, availableLanguages }: HeroAlaniFormuProps) {
  const [isLoading, setIsLoading] = useState(false);
  // availableLanguages ve activeTab (artık activeLanguageCode) prop olarak geliyor
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HeroFormData>({
    resolver: zodResolver(heroSchemaClient),
    defaultValues: {
      heroContentTranslations: [],
      heroImages: [],
    },
  });

  const { fields: heroTranslationsFields } = useFieldArray({
    control,
    name: "heroContentTranslations",
  });

  const { fields: heroImageFields, append: appendHeroImage, remove: removeHeroImage } = useFieldArray({ // move kaldırıldı, bu bileşende kullanılmıyor gibi
    control,
    name: "heroImages",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!activeLanguageCode || availableLanguages.length === 0) return; // Diller veya aktif dil kodu yoksa fetch etme
      setIsLoading(true);
      try {
        // Diller zaten prop olarak geliyor
        const heroRes = await fetch('/api/admin/hero-content');
        const heroDataFromApi: { translations: any[], images: any[] } | null = await heroRes.json();

        const processedHeroTranslations = availableLanguages.map(lang => {
          const existingTranslation = heroDataFromApi?.translations?.find(t => t.languageCode === lang.code);
          return existingTranslation || {
            languageCode: lang.code, title: null, description: null,
            button1Text: null, button1Link: null, button2Text: null, button2Link: null,
          };
        });

        const processedHeroImages = heroDataFromApi?.images || [];
        const dataToReset: HeroFormData = {
          heroContentTranslations: processedHeroTranslations,
          heroImages: processedHeroImages,
        };
        reset(dataToReset);

      } catch (error) {
        console.error("Failed to fetch hero data:", error);
        toast.error('Hero verileri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
        setInitialDataLoaded(true);
      }
    };
    fetchData();
  }, [reset, activeLanguageCode, availableLanguages]); // Bağımlılıklar güncellendi

  const onSubmit = async (data: HeroFormData) => {
    setIsLoading(true);
    try {
      const heroContentPayload = {
        translations: data.heroContentTranslations,
        images: data.heroImages,
      };
      const heroResponse = await fetch('/api/admin/hero-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroContentPayload),
      });
       if (!heroResponse.ok) {
        const errorData = await heroResponse.json();
        throw new Error(errorData.message || 'Hero alanı kaydedilemedi.');
      }
      const savedHeroContent = await heroResponse.json();
      toast.success('Ana sayfa hero alanı başarıyla kaydedildi!');

      reset({
        heroContentTranslations: savedHeroContent.translations,
        heroImages: savedHeroContent.images,
      });

    } catch (error: any) {
      toast.error(`Kaydetme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialDataLoaded && isLoading) {
    return <MixedLoadingSkeleton title="Hero alanı verileri yükleniyor..." />;
  }

  // Formun dışındaki Card ve başlık kaldırıldı, bu ana sayfada sağlanacak.
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle className="text-lg">Metin İçerikleri ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</CardTitle></CardHeader>
          <CardContent>
            {heroTranslationsFields.map((item, index) => {
              if (item.languageCode !== activeLanguageCode) return null; // Sadece aktif dilin formunu göster
              return (
                <div key={item.id} className="space-y-4 pt-4">
                  <input type="hidden" {...register(`heroContentTranslations.${index}.languageCode`)} />
                  <div>
                    <Label htmlFor={`heroContentTranslations.${index}.title`}>Başlık</Label>
                    <Controller name={`heroContentTranslations.${index}.title`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                  </div>
                  <div>
                    <Label htmlFor={`heroContentTranslations.${index}.description`}>Açıklama</Label>
                    <Controller name={`heroContentTranslations.${index}.description`} control={control} render={({ field }) => <Textarea {...field} value={field.value || ''} />} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`heroContentTranslations.${index}.button1Text`}>Buton 1 Metni</Label>
                      <Controller name={`heroContentTranslations.${index}.button1Text`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                    </div>
                    <div>
                      <Label htmlFor={`heroContentTranslations.${index}.button1Link`}>Buton 1 Linki</Label>
                      <Controller name={`heroContentTranslations.${index}.button1Link`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="/link veya https://..." />} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`heroContentTranslations.${index}.button2Text`}>Buton 2 Metni</Label>
                      <Controller name={`heroContentTranslations.${index}.button2Text`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                    </div>
                    <div>
                      <Label htmlFor={`heroContentTranslations.${index}.button2Link`}>Buton 2 Linki</Label>
                      <Controller name={`heroContentTranslations.${index}.button2Link`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="/link veya https://..." />} />
                    </div>
                  </div>
                </div>
              );
            })}
            {availableLanguages.length === 0 && <p>Aktif dil bulunamadı.</p>}
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="text-lg">Arka Plan Resimleri</CardTitle></CardHeader>
            <CardContent>
            <div>
              <div className="space-y-4">
                {heroImageFields.map((imageField, index) => (
                  <div key={imageField.id} className="flex items-center gap-4 p-3 border rounded">
                      <input type="hidden" {...register(`heroImages.${index}.order`)} value={index} />
                      <div className="w-20 h-12 relative flex-shrink-0">
                        <Controller
                          name={`heroImages.${index}.imageUrl`}
                          control={control}
                          render={({ field }) => (
                            field.value ? (
                              <Image src={field.value} alt={`Hero Resmi ${index + 1}`} fill style={{ objectFit: 'cover' }} className="rounded" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">Resim Yok</div>
                            )
                          )}
                        />
                      </div>
                      <div className="flex-grow">
                        <Controller
                          name={`heroImages.${index}.imageUrl`}
                          control={control}
                          render={({ field }) => (
                            <ImageUpload
                              initialImage={field.value || ''}
                              onImageUploaded={(url) => {
                                setValue(`heroImages.${index}.imageUrl`, url, { shouldDirty: true });
                              }}
                              showPreview={false}
                              buttonText="Resmi Değiştir"
                              className="w-full"
                              uploadFolder="hero"
                            />
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Controller
                          name={`heroImages.${index}.isActive`}
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-label="Resim Aktif mi?"
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeHeroImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => appendHeroImage({ imageUrl: '', order: heroImageFields.length, isActive: true })}
              >
                Yeni Resim Ekle
              </Button>
                {errors.heroImages && <p className="text-red-500 text-sm mt-1">{errors.heroImages.message || errors.heroImages.root?.message}</p>}
            </div>
            </CardContent>
        </Card>

      <Button type="submit" disabled={isLoading} className="mt-8"> {/* mt-8 eklendi */}
        {isLoading ? 'Kaydediliyor...' : 'Hero Alanını Kaydet'}
      </Button>
    </form>
  );
}
