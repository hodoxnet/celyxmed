'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Tabs importları kaldırıldı
import { Language } from '@/generated/prisma/client';
import ImageUpload from '@/components/admin/image-upload';
import { Trash2, GripVertical, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { DialogFooter } from '@/components/ui/dialog'; // Sadece DialogFooter kullanılıyor

// --- Zod Şemaları ---
const treatmentSectionContentTranslationSchema = z.object({
  languageCode: z.string().min(1),
  mainTitle: z.string().optional().nullable(),
  mainDescription: z.string().optional().nullable(),
  exploreButtonText: z.string().optional().nullable(),
  exploreButtonLink: z.string().optional().nullable().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }),
  avatarGroupText: z.string().optional().nullable(),
});

const treatmentSectionAvatarSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1, "Resim URL'si gereklidir"),
  altText: z.string().optional().nullable(),
  order: z.number().int().nonnegative(),
});

const treatmentSectionContentFormSchema = z.object({
  translations: z.array(treatmentSectionContentTranslationSchema),
  avatars: z.array(treatmentSectionAvatarSchema).optional(),
});
type TreatmentSectionContentFormData = z.infer<typeof treatmentSectionContentFormSchema>;

interface TedaviBolumuIcerigiFormuProps {
  activeLanguageCode: string;
  availableLanguages: Language[];
}

export default function TedaviBolumuIcerigiFormu({ activeLanguageCode, availableLanguages }: TedaviBolumuIcerigiFormuProps) {
  const [isLoading, setIsLoading] = useState(false);
  // availableLanguages ve activeContentTab (artık activeLanguageCode) prop olarak geliyor
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const contentFormMethods = useForm<TreatmentSectionContentFormData>({
    resolver: zodResolver(treatmentSectionContentFormSchema),
    defaultValues: {
      translations: [],
      avatars: [],
    },
  });

  const { fields: contentTranslationsFields } = useFieldArray({
    control: contentFormMethods.control,
    name: "translations",
  });

  const { fields: avatarFields, append: appendAvatar, remove: removeAvatar } = useFieldArray({ // move kaldırıldı
    control: contentFormMethods.control,
    name: "avatars",
  });

  const fetchData = useCallback(async () => {
    if (availableLanguages.length === 0 || !activeLanguageCode) return;
    setIsLoading(true);
    try {
      // Diller prop olarak geliyor
      const contentRes = await fetch('/api/admin/treatments-section');
      const contentDataFromApi = await contentRes.json();
      if (!contentRes.ok) throw new Error(contentDataFromApi.message || 'Bölüm içeriği yüklenemedi.');
      
      const processedContentTranslations = availableLanguages.map((lang: Language) => {
        const existing = contentDataFromApi?.translations?.find((t: any) => t.languageCode === lang.code);
        return existing || { 
          languageCode: lang.code, mainTitle: "", mainDescription: "",
          exploreButtonText: "", exploreButtonLink: "", avatarGroupText: ""
        };
      });
      contentFormMethods.reset({
        translations: processedContentTranslations,
        avatars: contentDataFromApi?.avatars || [],
      });

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error(error instanceof Error ? error.message : 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setInitialDataLoaded(true);
    }
  }, [contentFormMethods, availableLanguages, activeLanguageCode]); // Bağımlılıklar güncellendi

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData'nın bağımlılıkları değiştiği için bu hook da güncellenecek

  const onContentSubmit = async (data: TreatmentSectionContentFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/treatments-section', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Genel içerik kaydedilemedi.');
      }
      const savedContent = await response.json();
      toast.success('Genel bölüm içeriği başarıyla kaydedildi!');
      contentFormMethods.reset({ // Formu güncel veriyle resetle
        translations: savedContent.translations,
        avatars: savedContent.avatars,
      });
    } catch (error: any) {
      toast.error(`Kaydetme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialDataLoaded && isLoading) {
    return <p className="p-6">Tedavi Bölümü İçeriği yükleniyor...</p>;
  }

  return (
    // FormProvider ana bileşende (AnasayfaYonetimiPage) yönetilecekse buradan kaldırılabilir.
    // Şimdilik burada bırakıyorum, tek başına çalışabilmesi için.
    <FormProvider {...contentFormMethods}> 
      <form onSubmit={contentFormMethods.handleSubmit(onContentSubmit)} className="space-y-6">
        <Card>
          {/* CardHeader ana sayfada sağlanacak, buradan kaldırılabilir veya tutulabilir. Şimdilik tutuyorum. */}
          {/* <CardHeader>
            <CardTitle>Ana Sayfa Tedavi Bölümü İçeriği</CardTitle>
            <CardDescription>Ana sayfadaki tedavi bölümünün genel başlık, açıklama, buton ve avatarlarını yönetin.</CardDescription>
          </CardHeader> */}
          <CardContent className="pt-6">
            {availableLanguages.length > 0 && activeLanguageCode ? (
              contentTranslationsFields.map((item, index) => {
                if (item.languageCode !== activeLanguageCode) return null;
                return (
                  <div key={item.id} className="space-y-4 pt-4">
                    <input type="hidden" {...contentFormMethods.register(`translations.${index}.languageCode`)} />
                    <div>
                      <Label htmlFor={`translations.${index}.mainTitle`}>Ana Başlık</Label>
                      <Input {...contentFormMethods.register(`translations.${index}.mainTitle`)} />
                    </div>
                    <div>
                      <Label htmlFor={`translations.${index}.mainDescription`}>Ana Açıklama</Label>
                      <Textarea {...contentFormMethods.register(`translations.${index}.mainDescription`)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`translations.${index}.exploreButtonText`}>Keşfet Butonu Metni</Label>
                        <Input {...contentFormMethods.register(`translations.${index}.exploreButtonText`)} />
                      </div>
                      <div>
                        <Label htmlFor={`translations.${index}.exploreButtonLink`}>Keşfet Butonu Linki</Label>
                        <Input {...contentFormMethods.register(`translations.${index}.exploreButtonLink`)} placeholder="/link veya https://..." />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`translations.${index}.avatarGroupText`}>Avatar Grubu Alt Metni</Label>
                      <Input {...contentFormMethods.register(`translations.${index}.avatarGroupText`)} />
                    </div>
                  </div>
                );
              })
            ) : <p>Aktif dil bulunamadı veya seçilmedi.</p>}

            <div className="space-y-2">
              <Label>Avatarlar</Label>
              {avatarFields.map((avatarField, index) => (
                <div key={avatarField.id} className="flex items-center gap-2 p-2 border rounded">
                  {/* <GripVertical className="cursor-move h-5 w-5 text-gray-400" /> */} {/* Sürükle bırak fonksiyonelliği yoksa kaldırılabilir */}
                  <div className="w-16 h-16 relative flex-shrink-0">
                      <Controller
                        name={`avatars.${index}.imageUrl`}
                        control={contentFormMethods.control}
                        render={({ field }) => field.value ? <Image src={field.value} alt={`Avatar ${index + 1}`} fill style={{ objectFit: 'cover' }} className="rounded-full" /> : <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">Resim Yok</div>}
                      />
                  </div>
                  <div className="flex-grow space-y-1">
                      <Controller
                        name={`avatars.${index}.imageUrl`}
                        control={contentFormMethods.control}
                        render={({ field }) => <ImageUpload initialImage={field.value || ''} onImageUploaded={(url) => contentFormMethods.setValue(`avatars.${index}.imageUrl`, url, { shouldDirty: true })} uploadFolder="treatments_section/avatars" buttonText="Değiştir" showPreview={false} />}
                      />
                      <Controller
                          name={`avatars.${index}.altText`}
                          control={contentFormMethods.control}
                          render={({ field }) => <Input {...field} placeholder="Avatar Alt Metni (SEO)" value={field.value ?? ''} />}
                      />
                  </div>
                  <input type="hidden" {...contentFormMethods.register(`avatars.${index}.order`)} value={index} />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeAvatar(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendAvatar({ imageUrl: '', altText: '', order: avatarFields.length })}><PlusCircle className="mr-2 h-4 w-4"/>Avatar Ekle</Button>
            </div>
          </CardContent>
          <DialogFooter className="p-6 pt-0 mt-4"> {/* mt-4 eklendi */}
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Kaydediliyor...' : 'Genel İçeriği Kaydet'}</Button>
          </DialogFooter>
        </Card>
      </form>
    </FormProvider>
  );
};
