'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MixedLoadingSkeleton, FormLoadingSkeleton } from './LoadingSkeletons';
import { useForm, Controller, useFieldArray } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Tabs importları kaldırıldı
import { Language } from '@/generated/prisma/client'; 

// Zod Şemaları
const translationBaseSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir"),
  youtubeVideoId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  primaryButtonText: z.string().optional().nullable(),
  primaryButtonLink: z.string().optional().nullable().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }),
  secondaryButtonText: z.string().optional().nullable(),
  secondaryButtonLink: z.string().optional().nullable().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }),
});

// Genel form veri tipi
type WhyChooseSectionFormData = {
  translations: Array<z.infer<typeof translationBaseSchema>>;
};

interface NedenCelyxmedFormuProps {
    availableLanguages: Language[];
    activeLanguageCode: string; 
}

export default function NedenCelyxmedFormu({ availableLanguages, activeLanguageCode }: NedenCelyxmedFormuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  // activeTab state'i yerine activeLanguageCode prop'u kullanılacak
  
  // Dinamik validasyon için Zod şeması
  const whyChooseSectionSchema = z.object({
    translations: z.array(
      translationBaseSchema.superRefine((data, ctx) => {
        // Sadece aktif sekmedeki dil için zorunlu alan kontrolü yap
        if (data.languageCode === activeLanguageCode) { // activeTab yerine activeLanguageCode
          if (!data.youtubeVideoId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Youtube video ID'si gereklidir", path: ['youtubeVideoId'] });
          if (!data.title) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Başlık gereklidir", path: ['title'] });
          if (!data.description) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Açıklama gereklidir", path: ['description'] });
          if (!data.primaryButtonText) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Birincil buton metni gereklidir", path: ['primaryButtonText'] });
          if (!data.primaryButtonLink) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Birincil buton linki gereklidir", path: ['primaryButtonLink'] });
          if (!data.secondaryButtonText) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "İkincil buton metni gereklidir", path: ['secondaryButtonText'] });
          if (!data.secondaryButtonLink) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "İkincil buton linki gereklidir", path: ['secondaryButtonLink'] });
        }
      })
    ),
  });

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
    trigger, 
    watch, 
  } = useForm<WhyChooseSectionFormData>({
    resolver: zodResolver(whyChooseSectionSchema),
    defaultValues: {
      translations: [],
    },
    mode: "onChange" 
  });

  const { fields: translationsFields } = useFieldArray({
    control,
    name: "translations",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (availableLanguages.length === 0) return; // Diller yüklenmediyse fetch etme
      setIsLoading(true);
      try {
        const sectionRes = await fetch('/api/admin/why-choose-section');
        const sectionData: { translations: any[] } = await sectionRes.json();

        const processedTranslations = availableLanguages.map(lang => {
          const existingTranslation = sectionData?.translations?.find(t => t.languageCode === lang.code);
          return existingTranslation || {
            languageCode: lang.code, youtubeVideoId: '', title: '', description: '',
            primaryButtonText: '', primaryButtonLink: '', secondaryButtonText: '', secondaryButtonLink: '',
          };
        });
        
        reset({ translations: processedTranslations });
        
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
        setInitialDataLoaded(true);
      }
    };
    fetchData();
  }, [reset, availableLanguages]); // activeTab kaldırıldı


  const onSubmit = async (data: WhyChooseSectionFormData) => {
    setIsLoading(true);
    const isValid = await trigger();
    if (!isValid) {
        toast.error(`Lütfen aktif (${activeLanguageCode}) dildeki tüm zorunlu alanları doğru şekilde doldurun.`);
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/admin/why-choose-section', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Why Choose Section alanı kaydedilemedi.');
      }
      const savedData = await response.json();
      toast.success('Why Choose Section alanı başarıyla kaydedildi!');
      reset({ translations: savedData.translations });
    } catch (error: any) {
      toast.error(`Kaydetme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!initialDataLoaded && isLoading && availableLanguages.length === 0) {
    return <MixedLoadingSkeleton title="Diller ve veriler yükleniyor..." />;
  }
  if (!initialDataLoaded && isLoading) {
    return <FormLoadingSkeleton title="Neden Celyxmed bölümü verileri yükleniyor..." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neden Celyxmed Bölümü ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {availableLanguages.length > 0 && translationsFields.map((item, index) => {
            if (item.languageCode !== activeLanguageCode) return null; // Sadece aktif dilin formunu göster
            const currentLangErrors = errors.translations?.[index];
            return (
              <div key={item.id} className="space-y-4 pt-4">
                <input type="hidden" {...register(`translations.${index}.languageCode`)} />
                <div>
                  <Label htmlFor={`translations.${index}.youtubeVideoId`}>YouTube Video ID</Label>
                  <Controller name={`translations.${index}.youtubeVideoId`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} />
                  {currentLangErrors?.youtubeVideoId && <p className="text-red-500 text-sm mt-1">{currentLangErrors.youtubeVideoId.message}</p>}
                   {watch(`translations.${index}.youtubeVideoId`) && (
                       <div className="mt-2 aspect-video w-full max-w-md">
                           <iframe
                               src={`https://www.youtube.com/embed/${watch(`translations.${index}.youtubeVideoId`)}`}
                               className="w-full h-full rounded-lg shadow-md"
                               allowFullScreen
                               title="Video Önizleme"
                           ></iframe>
                       </div>
                   )}
                </div>
                <div>
                  <Label htmlFor={`translations.${index}.title`}>Başlık</Label>
                  <Controller name={`translations.${index}.title`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} />
                  {currentLangErrors?.title && <p className="text-red-500 text-sm mt-1">{currentLangErrors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`translations.${index}.description`}>Açıklama</Label>
                  <Controller name={`translations.${index}.description`} control={control} render={({ field }) => <Textarea {...field} value={field.value ?? ''} rows={4} />} />
                  {currentLangErrors?.description && <p className="text-red-500 text-sm mt-1">{currentLangErrors.description.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`translations.${index}.primaryButtonText`}>Birincil Buton Metni</Label>
                    <Controller name={`translations.${index}.primaryButtonText`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} />
                    {currentLangErrors?.primaryButtonText && <p className="text-red-500 text-sm mt-1">{currentLangErrors.primaryButtonText.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`translations.${index}.primaryButtonLink`}>Birincil Buton Linki</Label>
                    <Controller name={`translations.${index}.primaryButtonLink`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="/link veya https://..." />} />
                    {currentLangErrors?.primaryButtonLink && <p className="text-red-500 text-sm mt-1">{currentLangErrors.primaryButtonLink.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`translations.${index}.secondaryButtonText`}>İkincil Buton Metni</Label>
                    <Controller name={`translations.${index}.secondaryButtonText`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} />
                    {currentLangErrors?.secondaryButtonText && <p className="text-red-500 text-sm mt-1">{currentLangErrors.secondaryButtonText.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`translations.${index}.secondaryButtonLink`}>İkincil Buton Linki</Label>
                    <Controller name={`translations.${index}.secondaryButtonLink`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="/link veya https://..." />} />
                    {currentLangErrors?.secondaryButtonLink && <p className="text-red-500 text-sm mt-1">{currentLangErrors.secondaryButtonLink.message}</p>}
                  </div>
                </div>
              </div>
            );
          })}
          {availableLanguages.length === 0 && <p>Aktif dil bulunamadı.</p>}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Kaydediliyor...' : 'Bölümü Kaydet'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
