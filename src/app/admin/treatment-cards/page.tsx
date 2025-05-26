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
import { Trash2, PlusCircle, Edit } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Zod Şemaları (Sadece Tedavi Kartları için)
const treatmentSectionItemTranslationSchema = z.object({
  languageCode: z.string().min(1),
  title: z.string().optional().nullable(), // .min(1) kaldırıldı, optional ve nullable eklendi
  description: z.string().optional().nullable(), // .min(1) kaldırıldı, optional ve nullable eklendi
  linkUrl: z.string().optional().nullable().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }), // .min(1) kaldırıldı, refine güncellendi
});

const treatmentSectionItemFormSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1, "Resim URL'si gereklidir"), // Resim URL'si zorunlu kalmalı
  order: z.number().int().nonnegative().optional(),
  isPublished: z.boolean().optional(),
  translations: z.array(treatmentSectionItemTranslationSchema),
});
type TreatmentSectionItemFormData = z.infer<typeof treatmentSectionItemFormSchema>;

const TreatmentCardsAdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [activeItemFormTab, setActiveItemFormTab] = useState<string | undefined>();
  const [treatmentItems, setTreatmentItems] = useState<any[]>([]);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const langRes = await fetch('/api/languages');
      const allLangs: Language[] = await langRes.json();
      const activeLanguages = allLangs.filter(lang => lang.isActive);
      setAvailableLanguages(activeLanguages);

      if (activeLanguages.length > 0 && !activeItemFormTab) {
        const defaultLang = activeLanguages.find(lang => lang.isDefault);
        setActiveItemFormTab(defaultLang?.code || activeLanguages[0].code);
      }

      const itemsRes = await fetch('/api/admin/treatment-cards'); // API yolu güncellendi
      const itemsDataFromApi = await itemsRes.json();
      setTreatmentItems(itemsDataFromApi);

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setInitialDataLoaded(true);
    }
  }, []); // Bağımlılık dizisi boşaltıldı

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Bu useEffect fetchData'yı sadece mount'ta çağırır

  // activeItemFormTab'ı ayarlamak için yeni useEffect
  useEffect(() => {
    if (availableLanguages.length > 0 && !activeItemFormTab) {
      const defaultLang = availableLanguages.find(lang => lang.isDefault);
      setActiveItemFormTab(defaultLang?.code || availableLanguages[0].code);
    }
  }, [availableLanguages, activeItemFormTab]); // availableLanguages veya activeItemFormTab değiştiğinde çalışır

  const onItemSubmit = async (data: TreatmentSectionItemFormData) => {
    setIsLoading(true);
    const method = editingItemId ? 'PUT' : 'POST';
    const url = editingItemId ? `/api/admin/treatment-cards/${editingItemId}` : '/api/admin/treatment-cards'; // API yolu güncellendi

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
      toast.success(`Tedavi kartı başarıyla ${editingItemId ? 'güncellendi' : 'oluşturuldu'}!`);
      setIsItemDialogOpen(false);
      setEditingItemId(null);
      itemFormMethods.reset({ 
        imageUrl: '', order: 0, isPublished: true, translations: availableLanguages.map(l => ({languageCode: l.code, title: '', description: '', linkUrl: ''}))
      });
      fetchData(); 
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Bu tedavi kartını silmek istediğinizden emin misiniz?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/treatment-cards/${itemId}`, { // API yolu güncellendi
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tedavi kartı silinemedi.');
      }
      toast.success('Tedavi kartı başarıyla silindi!');
      fetchData(); 
    } catch (error: any) {
      toast.error(`Silme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditItemDialog = (item: any) => {
    setEditingItemId(item.id);
    // Mevcut çevirileri almak için translations dizisini kullan
    // Eğer her bir dil için çeviri yoksa boş değerlerle oluştur
    const itemTranslations = availableLanguages.map(lang => {
        // translations dizisi varsa kullan, yoksa boş dizi olarak kabul et
        const translations = Array.isArray(item.translations) ? item.translations : [];
        const existingTranslation = translations.find((t: any) => t.languageCode === lang.code);

        return {
            languageCode: lang.code,
            title: existingTranslation?.title || '',
            description: existingTranslation?.description || '',
            linkUrl: existingTranslation?.linkUrl || '',
        };
    });

    itemFormMethods.reset({
      id: item.id,
      imageUrl: item.imageUrl || '', // Ensure imageUrl is always a string
      order: item.order,
      isPublished: item.isPublished,
      translations: itemTranslations,
    });

    if (availableLanguages.length > 0) {
        const defaultLang = availableLanguages.find(lang => lang.isDefault);
        setActiveItemFormTab(defaultLang?.code || availableLanguages[0].code);
    }
    setIsItemDialogOpen(true);
  };

  const openNewItemDialog = () => {
    setEditingItemId(null);
    const newTranslations = availableLanguages.map(lang => ({
      languageCode: lang.code,
      title: '',
      description: '',
      linkUrl: '',
    }));
    itemFormMethods.reset({
      imageUrl: '',
      order: treatmentItems.length > 0 ? Math.max(...treatmentItems.map(i => i.order)) + 1 : 0,
      isPublished: true,
      translations: newTranslations,
    });
     if (availableLanguages.length > 0) {
        const defaultLang = availableLanguages.find(lang => lang.isDefault);
        setActiveItemFormTab(defaultLang?.code || availableLanguages[0].code);
    }
    setIsItemDialogOpen(true);
  };

  if (!initialDataLoaded && isLoading) {
    return <p className="p-6">Tedavi Kartları verileri yükleniyor...</p>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tedavi Kartları Yönetimi</CardTitle>
            <CardDescription>Ana sayfada gösterilecek tedavi kartlarını yönetin.</CardDescription>
          </div>
          <Button onClick={openNewItemDialog} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Yeni Kart Ekle</Button>
        </CardHeader>
        <CardContent>
          {treatmentItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Resim</TableHead>
                  <TableHead>Başlık (Varsayılan Dil)</TableHead>
                  <TableHead className="w-[100px]">Sıra</TableHead>
                  <TableHead className="w-[120px]">Durum</TableHead>
                  <TableHead className="w-[120px] text-right">Eylemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatmentItems.map((item) => {
                  // Varsayılan dili veya ilk dili bul
                  const defaultLangCode = availableLanguages.find(l => l.isDefault)?.code || 'tr';

                  // item.translations dizisi olup olmadığını kontrol et
                  const translations = Array.isArray(item.translations) ? item.translations : [];

                  // Önce varsayılan dildeki çeviriyi bul, yoksa ilk çeviriyi al
                  const defaultTranslation = translations.find((t:any) => t.languageCode === defaultLangCode) || translations[0];

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.imageUrl && <Image src={item.imageUrl} alt={defaultTranslation?.title || 'Tedavi Kartı'} width={60} height={45} className="rounded object-cover aspect-[4/3]" />}
                      </TableCell>
                      <TableCell>{defaultTranslation?.title || 'Çeviri Yok'}</TableCell>
                      <TableCell>{item.order}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.isPublished ? 'Yayında' : 'Taslak'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditItemDialog(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p>Henüz tedavi kartı eklenmemiş.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItemId ? 'Tedavi Kartını Düzenle' : 'Yeni Tedavi Kartı Ekle'}</DialogTitle>
          </DialogHeader>
          <FormProvider {...itemFormMethods}>
            <form onSubmit={itemFormMethods.handleSubmit(onItemSubmit)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="itemImageUrl">Resim URL</Label>
                 <Controller
                    name="imageUrl"
                    control={itemFormMethods.control}
                    render={({ field }) => (
                        <ImageUpload
                        key={editingItemId || 'new-item'} // Key prop'u eklendi
                        initialImage={field.value}
                        showPreview={true} // Önizleme özelliği etkinleştirildi
                        onImageUploaded={(url) => {
                            field.onChange(url); // Controller'ın onChange'i çağrıldı
                            itemFormMethods.setValue('imageUrl', url, {shouldDirty: true, shouldValidate: true}); // Ekstra seçenekler için setValue korunabilir
                        }}
                        uploadFolder="treatment_cards" // Klasör adı güncellendi
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
                    <div className="flex items-center space-x-2">
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

              {availableLanguages.length > 0 && (
                <Tabs value={activeItemFormTab} onValueChange={setActiveItemFormTab}>
                  <TabsList>
                    {availableLanguages.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code}>{lang.name}</TabsTrigger>
                    ))}
                  </TabsList>
                  {itemTranslationsFields.map((field, index) => (
                    <TabsContent key={field.id} value={availableLanguages[index]?.code} className="space-y-3 pt-3">
                       <input type="hidden" {...itemFormMethods.register(`translations.${index}.languageCode`)} value={availableLanguages[index]?.code} />
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
                    </TabsContent>
                  ))}
                </Tabs>
              )}
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">İptal</Button></DialogClose>
                <Button type="submit" disabled={isLoading}>{isLoading ? (editingItemId ? 'Güncelleniyor...' : 'Kaydediliyor...') : (editingItemId ? 'Değişiklikleri Kaydet' : 'Kartı Oluştur')}</Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreatmentCardsAdminPage;
