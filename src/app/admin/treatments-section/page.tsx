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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Language } from '@/generated/prisma/client';
import ImageUpload from '@/components/admin/image-upload';
import { Trash2, GripVertical, PlusCircle, Edit, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// --- Zod Şemaları ---

// 1. TreatmentSectionContent (Genel Bölüm İçeriği) Şemaları
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

// TreatmentSectionItem şemaları ve ilgili state'ler kaldırıldı.

const TreatmentsSectionAdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState<string | undefined>();
  // activeItemFormTab, treatmentItems, isItemDialogOpen, editingItemId state'leri kaldırıldı

  // Form 1: Genel Bölüm İçeriği (Değişiklik yok)
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

  const { fields: avatarFields, append: appendAvatar, remove: removeAvatar, move: moveAvatar } = useFieldArray({
    control: contentFormMethods.control,
    name: "avatars",
  });

  // itemFormMethods ve itemTranslationsFields kaldırıldı.

  // Veri Yükleme Fonksiyonu (Sadece Genel İçerik için)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const langRes = await fetch('/api/languages');
      const allLangs: Language[] = await langRes.json();
      const activeLanguages = allLangs.filter(lang => lang.isActive);
      setAvailableLanguages(activeLanguages);

      // Genel İçerik Verisi
      const contentRes = await fetch('/api/admin/treatments-section');
      const contentDataFromApi = await contentRes.json();
      
      const processedContentTranslations = activeLanguages.map(lang => {
        const existing = contentDataFromApi?.translations?.find((t: any) => t.languageCode === lang.code);
        return existing || { languageCode: lang.code };
      });
      contentFormMethods.reset({
        translations: processedContentTranslations,
        avatars: contentDataFromApi?.avatars || [],
      });

      if (activeLanguages.length > 0 && !activeContentTab) {
        const defaultLang = activeLanguages.find(lang => lang.isDefault);
        setActiveContentTab(defaultLang?.code || activeLanguages[0].code);
        // setActiveItemFormTab kaldırıldı
      }

      // Tedavi Kartları Verisi çekme kısmı kaldırıldı.

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setInitialDataLoaded(true);
    }
  }, [contentFormMethods, activeContentTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Genel İçerik Kaydetme (Değişiklik yok)
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
      contentFormMethods.reset({
        translations: savedContent.translations,
        avatars: savedContent.avatars,
      });
    } catch (error: any) {
      toast.error(`Kaydetme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // onItemSubmit, handleDeleteItem, openEditItemDialog, openNewItemDialog fonksiyonları kaldırıldı.

  if (!initialDataLoaded && isLoading) {
    return <p className="p-6">Ana Sayfa Tedavi Bölümü İçeriği yükleniyor...</p>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <FormProvider {...contentFormMethods}>
        <form onSubmit={contentFormMethods.handleSubmit(onContentSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ana Sayfa Tedavi Bölümü İçeriği</CardTitle>
              <CardDescription>Ana sayfadaki tedavi bölümünün genel başlık, açıklama, buton ve avatarlarını yönetin.</CardDescription>
            </CardHeader>
            <CardContent>
              {availableLanguages.length > 0 ? (
                <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className="mb-6">
                  <TabsList>
                    {availableLanguages.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code}>
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {contentTranslationsFields.map((item, index) => (
                    <TabsContent key={item.id} value={item.languageCode} className="space-y-4 pt-4">
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
                    </TabsContent>
                  ))}
                </Tabs>
              ) : <p>Aktif dil bulunamadı.</p>}

              <div className="space-y-2">
                <Label>Avatarlar</Label>
                {avatarFields.map((avatarField, index) => (
                  <div key={avatarField.id} className="flex items-center gap-2 p-2 border rounded">
                    <GripVertical className="cursor-move h-5 w-5 text-gray-400" />
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
            <DialogFooter className="p-6 pt-0">
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Kaydediliyor...' : 'Genel İçeriği Kaydet'}</Button>
            </DialogFooter>
          </Card>
        </form>
      </FormProvider>

      {/* Tedavi Kartları <Card> bölümü ve Dialog JSX'i kaldırıldı. */}
    </div>
  );
};

export default TreatmentsSectionAdminPage;
