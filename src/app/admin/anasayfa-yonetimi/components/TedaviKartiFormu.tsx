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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Tabs importları kaldırıldı
import { Language } from '@/generated/prisma/client';
import ImageUpload from '@/components/admin/image-upload';
import { Switch } from '@/components/ui/switch';

// Zod Şemaları
const treatmentSectionItemTranslationSchema = z.object({
  languageCode: z.string().min(1),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }),
});

const treatmentSectionItemFormSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1, "Resim URL'si gereklidir"),
  order: z.number().int().nonnegative().optional(),
  isPublished: z.boolean().optional(),
  translations: z.array(treatmentSectionItemTranslationSchema),
});
type TreatmentSectionItemFormData = z.infer<typeof treatmentSectionItemFormSchema>;

interface TedaviKartiFormuProps {
  availableLanguages: Language[];
  activeLanguageCode: string; // Eklendi
  onSubmitSuccess: () => void;
  onCancel: () => void;
  itemToEdit?: TreatmentCardItem | null; 
}

interface TreatmentCardItem { 
    id: string;
    imageUrl: string;
    order: number;
    isPublished: boolean;
    translations: Array<{
        languageCode: string;
        title?: string | null;
        description?: string | null;
        linkUrl?: string | null;
    }>;
}


export default function TedaviKartiFormu({
  availableLanguages,
  activeLanguageCode, // Eklendi
  onSubmitSuccess,
  onCancel,
  itemToEdit,
}: TedaviKartiFormuProps) {
  const [isLoading, setIsLoading] = useState(false);
  // activeItemFormTab state'i kaldırıldı
  
  const itemFormMethods = useForm<TreatmentSectionItemFormData>({
    resolver: zodResolver(treatmentSectionItemFormSchema),
    defaultValues: {
      imageUrl: '',
      order: 0,
      isPublished: true,
      translations: [],
    },
  });
  
  const { fields: itemTranslationsFields } = useFieldArray({
     control: itemFormMethods.control,
     name: "translations",
  });

  useEffect(() => {
    if (itemToEdit) {
      const itemTranslations = availableLanguages.map(lang => {
          const translations = Array.isArray(itemToEdit.translations) ? itemToEdit.translations : [];
          const existingTranslation = translations.find((t: any) => t.languageCode === lang.code);
          return {
              languageCode: lang.code,
              title: existingTranslation?.title || '',
              description: existingTranslation?.description || '',
              linkUrl: existingTranslation?.linkUrl || '',
          };
      });
      itemFormMethods.reset({
        id: itemToEdit.id,
        imageUrl: itemToEdit.imageUrl || '',
        order: itemToEdit.order,
        isPublished: itemToEdit.isPublished,
        translations: itemTranslations,
      });
    } else {
      const newTranslations = availableLanguages.map(lang => ({
        languageCode: lang.code,
        title: '',
        description: '',
        linkUrl: '',
      }));
      itemFormMethods.reset({
        imageUrl: '',
        order: 0, 
        isPublished: true,
        translations: newTranslations,
      });
    }
  }, [itemToEdit, availableLanguages, itemFormMethods]);


  const onItemSubmit = async (data: TreatmentSectionItemFormData) => {
    setIsLoading(true);
    const method = itemToEdit ? 'PUT' : 'POST';
    const url = itemToEdit ? `/api/admin/treatment-cards/${itemToEdit.id}` : '/api/admin/treatment-cards';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tedavi kartı işlenemedi.');
      }
      toast.success(`Tedavi kartı başarıyla ${itemToEdit ? 'güncellendi' : 'oluşturuldu'}!`);
      onSubmitSuccess(); 
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...itemFormMethods}>
      <form onSubmit={itemFormMethods.handleSubmit(onItemSubmit)} className="space-y-4 py-4">
        <Card>
            <CardHeader>
                <CardTitle>{itemToEdit ? 'Tedavi Kartını Düzenle' : 'Yeni Tedavi Kartı Ekle'} ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="itemImageUrl">Resim URL</Label>
                    <Controller
                        name="imageUrl"
                        control={itemFormMethods.control}
                        render={({ field }) => (
                            <ImageUpload
                            key={itemToEdit?.id || 'new-item-treatment-card'}
                            initialImage={field.value}
                            showPreview={true}
                            onImageUploaded={(url) => {
                                field.onChange(url);
                                itemFormMethods.setValue('imageUrl', url, {shouldDirty: true, shouldValidate: true});
                            }}
                            uploadFolder="treatment_cards"
                            buttonText="Resim Yükle/Değiştir"
                            />
                        )}
                    />
                    {itemFormMethods.formState.errors.imageUrl && <p className="text-red-500 text-sm mt-1">{itemFormMethods.formState.errors.imageUrl.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="itemOrder">Sıra</Label>
                        <Input id="itemOrder" type="number" {...itemFormMethods.register('order', { valueAsNumber: true })} />
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="flex items-center space-x-2 pt-5">
                            <Controller
                                name="isPublished"
                                control={itemFormMethods.control}
                                render={({ field }) => (
                                    <Switch id="itemIsPublished" checked={field.value ?? true} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor="itemIsPublished">Yayında</Label>
                        </div>
                    </div>
                </div>

                {/* İçerideki Tabs kaldırıldı */}
                {itemTranslationsFields.map((field, index) => {
                    // Sadece aktif dilin formunu göster
                    if (itemFormMethods.watch(`translations.${index}.languageCode`) !== activeLanguageCode) return null;
                    return (
                        <div key={field.id} className="space-y-3 pt-3 border-t mt-4">
                        <input type="hidden" {...itemFormMethods.register(`translations.${index}.languageCode`)} value={activeLanguageCode} />
                        <div>
                            <Label htmlFor={`itemTranslations.${index}.title`}>Başlık</Label>
                            <Input {...itemFormMethods.register(`translations.${index}.title`)} />
                            {itemFormMethods.formState.errors.translations?.[index]?.title && <p className="text-red-500 text-sm mt-1">{itemFormMethods.formState.errors.translations?.[index]?.title?.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor={`itemTranslations.${index}.description`}>Açıklama</Label>
                            <Textarea {...itemFormMethods.register(`translations.${index}.description`)} />
                            {itemFormMethods.formState.errors.translations?.[index]?.description && <p className="text-red-500 text-sm mt-1">{itemFormMethods.formState.errors.translations?.[index]?.description?.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor={`itemTranslations.${index}.linkUrl`}>Link URL</Label>
                            <Input {...itemFormMethods.register(`translations.${index}.linkUrl`)} placeholder="/veya https://..." />
                            {itemFormMethods.formState.errors.translations?.[index]?.linkUrl && <p className="text-red-500 text-sm mt-1">{itemFormMethods.formState.errors.translations?.[index]?.linkUrl?.message}</p>}
                        </div>
                        </div>
                    );
                })}
                 {availableLanguages.length === 0 && <p>Aktif dil bulunamadı.</p>}
            </CardContent>
        </Card>
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? (itemToEdit ? 'Güncelleniyor...' : 'Kaydediliyor...') : (itemToEdit ? 'Değişiklikleri Kaydet' : 'Kartı Oluştur')}</Button>
        </div>
      </form>
    </FormProvider>
  );
};
