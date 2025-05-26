'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Language } from '@/generated/prisma/client';
import { PlusCircle, Trash2, MoveUp, MoveDown, Save, Pencil, XCircle, CheckCircle } from 'lucide-react';
import ImageUpload from '@/components/admin/image-upload';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Zod Şemaları - Aktif dil için şema (zorunlu alanlar)
const activeTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir"),
  title: z.string().min(1, "Başlık gereklidir"),
  subtitle: z.string().min(1, "Alt başlık gereklidir"),
});

// Diğer diller için daha esnek şema (opsiyonel alanlar)
const otherTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir"),
  title: z.string().default(""),
  subtitle: z.string().default(""),
});

// Dinamik şema oluşturucu - activeTabLanguage'e göre validasyon
const createDynamicSchema = (activeTabLanguage: string) => {
  return z.object({
    backgroundImage: z.string().optional(),
    translations: z.array(
      z.union([
        // Aktif dil için zorunlu alanlar
        activeTranslationSchema.refine(
          data => data.languageCode !== activeTabLanguage ||
                 (data.title && data.subtitle),
          {
            message: "Aktif dildeki tüm alanlar doldurulmalıdır",
            path: ["activeTab"] // Özel bir hata yolu
          }
        ),
        // Diğer diller için daha esnek validasyon
        otherTranslationSchema
      ])
    ),
  });
};

// Trust Point schema
const trustPointSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(1, "Numara gereklidir"),
  order: z.number().optional(),
  translations: z.array(z.object({
    languageCode: z.string().min(1, "Dil kodu gereklidir"),
    title: z.string().min(1, "Başlık gereklidir"),
    description: z.string().min(1, "Açıklama gereklidir"),
  })),
});

// Genel form veri tipi
type WhyTrustSectionFormData = {
  backgroundImage?: string;
  translations: Array<{
    languageCode: string;
    title: string;
    subtitle: string;
  }>;
};

// Trust Point tipi
type TrustPoint = {
  id: string;
  number: string;
  order: number;
  translations: Array<{
    languageCode: string;
    title: string;
    description: string;
  }>;
};

const WhyTrustSectionAdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>();
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Trust Points State
  const [trustPoints, setTrustPoints] = useState<TrustPoint[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTrustPoint, setSelectedTrustPoint] = useState<TrustPoint | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTrustPointId, setDeletingTrustPointId] = useState<string | null>(null);
  
  // Form için resolver oluşturucu
  const getResolver = useCallback((currentTab: string) => {
    return zodResolver(createDynamicSchema(currentTab));
  }, []);

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<WhyTrustSectionFormData>({
    resolver: activeTab ? getResolver(activeTab) : undefined,
    defaultValues: {
      backgroundImage: '',
      translations: [],
    },
    mode: "onSubmit"
  });

  // Trust Point form yönetimi
  const {
    control: trustPointControl,
    handleSubmit: handleTrustPointSubmit,
    reset: resetTrustPointForm,
    register: registerTrustPoint,
    formState: { errors: trustPointErrors },
  } = useForm({
    resolver: zodResolver(trustPointSchema),
    defaultValues: {
      id: '',
      number: '',
      translations: [] as { languageCode: string; title: string; description: string }[],
    }
  });

  // Çeviriler için Field Array
  const { fields: translationsFields } = useFieldArray({
    control,
    name: "translations",
  });

  // Trust Point çevirileri için Field Array
  const { fields: trustPointTranslationsFields, append: appendTrustPointTranslation } = useFieldArray({
    control: trustPointControl,
    name: "translations",
  });

  // Mevcut dilleri ve why-trust-section ayarlarını yükle
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Dilleri Getir
        const langRes = await fetch('/api/languages');
        const allLangs: Language[] = await langRes.json();
        const activeLanguages = allLangs.filter(lang => lang.isActive);
        setAvailableLanguages(activeLanguages);

        // Why Trust Section İçeriğini Getir
        const sectionRes = await fetch('/api/admin/why-trust-section');
        const sectionData: { backgroundImageUrl?: string, translations: any[], trustPoints: any[] } = await sectionRes.json();

        // Ana Bölüm Çevirilerini İşle
        const processedTranslations = activeLanguages.map(lang => {
          const existingTranslation = sectionData?.translations?.find(t => t.languageCode === lang.code);
          return existingTranslation || {
            languageCode: lang.code,
            title: '',
            subtitle: '',
          };
        });

        const dataToReset: WhyTrustSectionFormData = {
          backgroundImage: sectionData?.backgroundImage || '',
          translations: processedTranslations,
        };
        
        reset(dataToReset);

        // Trust Points'leri İşle
        if (sectionData?.trustPoints && Array.isArray(sectionData.trustPoints)) {
          setTrustPoints(sectionData.trustPoints);
        }

        // Aktif sekmeyi ayarla
        if (activeLanguages.length > 0 && !activeTab) { 
          const defaultLang = activeLanguages.find(lang => lang.isDefault);
          setActiveTab(defaultLang?.code || activeLanguages[0].code);
        }
        
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
        setInitialDataLoaded(true);
      }
    };
    fetchData();
  }, [reset, activeTab]);

  // Trust Point düzenleme formu için dil alanlarını hazırla
  useEffect(() => {
    if (selectedTrustPoint && isEditDialogOpen) {
      // Trust Point form'unu seçilen point ile doldur
      resetTrustPointForm({
        id: selectedTrustPoint.id,
        number: selectedTrustPoint.number,
        translations: selectedTrustPoint.translations,
      });
    } else if (isEditDialogOpen && availableLanguages.length > 0) {
      // Yeni Trust Point için tüm dillerde boş alanlar oluştur
      resetTrustPointForm({
        id: '',
        number: '',
        translations: availableLanguages.map(lang => ({
          languageCode: lang.code,
          title: '',
          description: '',
        })),
      });
    }
  }, [selectedTrustPoint, isEditDialogOpen, availableLanguages, resetTrustPointForm]);

  // Form verilerini API'ye gönder
  const onSubmit = async (data: WhyTrustSectionFormData) => {
    setIsLoading(true);
    setFormErrors({});

    try {
      // Sadece aktif tab için manual validasyon yapalım
      if (activeTab) {
        const activeTabIndex = data.translations.findIndex(t => t.languageCode === activeTab);

        if (activeTabIndex === -1) {
          throw new Error(`${activeTab} dili için veri bulunamadı`);
        }

        // Aktif dil verilerini kontrol et
        const activeTabData = data.translations[activeTabIndex];

        // Zorunlu alanları kontrol et
        let hasError = false;

        if (!activeTabData.title) {
          setFormErrors(prev => ({ ...prev, title: "Başlık alanı zorunludur" }));
          hasError = true;
        }

        if (!activeTabData.subtitle) {
          setFormErrors(prev => ({ ...prev, subtitle: "Alt başlık alanı zorunludur" }));
          hasError = true;
        }

        if (hasError) {
          toast.error(`Lütfen ${activeTab} dili için tüm alanları doğru şekilde doldurun`);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/admin/why-trust-section', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Why Trust Section alanı kaydedilemedi.');
      }

      const savedData = await response.json();
      toast.success('Why Trust Section alanı başarıyla kaydedildi!');

      // Formu güncel veriyle resetle
      reset({
        backgroundImage: savedData.backgroundImage,
        translations: savedData.translations,
      });

      // Trust Points state'ini de güncelle
      if (savedData.trustPoints) {
        setTrustPoints(savedData.trustPoints);
      }

    } catch (error: any) {
      toast.error(`Kaydetme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Trust Point kaydet
  const onSaveTrustPoint = async (data: any) => {
    try {
      setIsLoading(true);
      
      const isEditing = !!data.id;
      const endpoint = isEditing 
        ? `/api/admin/why-trust-section/trust-points/${data.id}` 
        : '/api/admin/why-trust-section/trust-points';
      
      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Trust point kaydedilemedi.');
      }

      const savedData = await response.json();
      
      // Trust Points listesini güncelle
      if (isEditing) {
        setTrustPoints(prev => prev.map(item => item.id === savedData.id ? savedData : item));
      } else {
        setTrustPoints(prev => [...prev, savedData]);
      }
      
      toast.success(`Trust point ${isEditing ? 'güncellendi' : 'eklendi'}!`);
      setIsEditDialogOpen(false);
      setSelectedTrustPoint(null);
      
    } catch (error: any) {
      toast.error(`Trust point kaydetme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Trust Point Sil
  const deleteTrustPoint = async () => {
    if (!deletingTrustPointId) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/why-trust-section/trust-points/${deletingTrustPointId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Trust point silinemedi.');
      }

      // Trust Points listesinden kaldır
      setTrustPoints(prev => prev.filter(item => item.id !== deletingTrustPointId));
      
      toast.success('Trust point başarıyla silindi!');
      
    } catch (error: any) {
      toast.error(`Trust point silme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setDeletingTrustPointId(null);
    }
  };

  // Trust Point sıralamasını değiştir
  const moveTrustPoint = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = trustPoints.findIndex(point => point.id === id);
    if (currentIndex === -1) return;
    
    const newTrustPoints = [...trustPoints];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Sınırları kontrol et
    if (targetIndex < 0 || targetIndex >= newTrustPoints.length) return;
    
    // Yer değiştir
    [newTrustPoints[currentIndex], newTrustPoints[targetIndex]] = 
    [newTrustPoints[targetIndex], newTrustPoints[currentIndex]];
    
    // Order değerlerini güncelle
    newTrustPoints.forEach((point, index) => {
      point.order = index;
    });
    
    setTrustPoints(newTrustPoints);
    
    // API'ye gönder
    try {
      await Promise.all(
        [currentIndex, targetIndex].map(idx => 
          fetch(`/api/admin/why-trust-section/trust-points/${newTrustPoints[idx].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...newTrustPoints[idx],
              order: idx,
            }),
          })
        )
      );
    } catch (error) {
      console.error('Error updating trust point order:', error);
      toast.error('Sıralama güncellenirken bir hata oluştu.');
    }
  };

  // Dil adını getir
  const getLanguageName = (code: string) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };
  
  if (!initialDataLoaded && isLoading) {
    return <p className="p-6">Why Trust Section verileri yükleniyor...</p>;
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Why Trust Celyxmed Bölümü Yönetimi</CardTitle>
          <CardDescription>
            Ana sayfa için "Your Health, Our Priority" bölümünü düzenle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader><CardTitle className="text-lg">Bölüm Genel Ayarları</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="backgroundImage">Arka Plan Görseli</Label>
                  <input type="hidden" {...register("backgroundImage")} />
                  <ImageUpload
                    onImageUploaded={(url) => setValue("backgroundImage", url)}
                    initialImage={watch("backgroundImage")}
                    showPreview={true}
                    buttonText="Arka Plan Görseli Yükle"
                    uploadFolder="why-trust-section"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Bölüm Başlıkları</CardTitle></CardHeader>
              <CardContent>
                {availableLanguages.length > 0 ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList>
                      {availableLanguages.map((lang) => (
                        <TabsTrigger key={lang.code} value={lang.code}>
                          {lang.name} İçerik
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {translationsFields.map((item, index) => (
                      <TabsContent key={item.id} value={item.languageCode} className="space-y-4 pt-4">
                        <input type="hidden" {...register(`translations.${index}.languageCode`)} />
                        
                        <div>
                          <Label htmlFor={`translations.${index}.title`}>Ana Başlık (Why Trust Celyxmed?)</Label>
                          <Controller
                            name={`translations.${index}.title`}
                            control={control}
                            render={({ field }) => (
                              <div>
                                <Input
                                  {...field}
                                  className={item.languageCode === activeTab && formErrors.title ? "border-red-500" : ""}
                                />
                                {item.languageCode === activeTab && formErrors.title && (
                                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`translations.${index}.subtitle`}>Alt Başlık (Your Health, Our Priority)</Label>
                          <Controller
                            name={`translations.${index}.subtitle`}
                            control={control}
                            render={({ field }) => (
                              <div>
                                <Input
                                  {...field}
                                  className={item.languageCode === activeTab && formErrors.subtitle ? "border-red-500" : ""}
                                />
                                {item.languageCode === activeTab && formErrors.subtitle && (
                                  <p className="text-red-500 text-sm mt-1">{formErrors.subtitle}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <p>Aktif dil bulunamadı.</p>
                )}
              </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Kaydediliyor...' : 'Bölüm Başlıklarını Kaydet'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Trust Points Bölümü */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between">
            <div>
              <CardTitle>Trust Points Yönetimi</CardTitle>
              <CardDescription>
                "Why Trust Celyxmed?" bölümünde gösterilen güven noktalarını düzenle
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                setSelectedTrustPoint(null);
                setIsEditDialogOpen(true);
              }}
              variant="outline" 
              className="mt-4 sm:mt-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Yeni Trust Point Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {trustPoints.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Numara</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead className="w-24 text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trustPoints.map((point, index) => {
                  // Aktif dildeki çeviriyi bul
                  const activeTranslation = point.translations.find(t => t.languageCode === activeTab);
                  const title = activeTranslation?.title || point.translations[0]?.title || 'Çeviri Yok';
                  
                  return (
                    <TableRow key={point.id}>
                      <TableCell className="font-mono text-center">{point.number}</TableCell>
                      <TableCell>
                        {title}
                        <div className="text-xs text-gray-500">
                          {!activeTranslation && `(${getLanguageName(point.translations[0]?.languageCode || '')} dilinde gösteriliyor)`}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => moveTrustPoint(point.id, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveTrustPoint(point.id, 'down')}
                            disabled={index === trustPoints.length - 1}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedTrustPoint(point);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setDeletingTrustPointId(point.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 border rounded-lg text-gray-500">
              Henüz trust point bulunmuyor. Eklemek için "Yeni Trust Point Ekle" butonunu kullanın.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trust Point Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTrustPoint ? 'Trust Point Düzenle' : 'Yeni Trust Point Ekle'}</DialogTitle>
            <DialogDescription>
              Güven noktası detaylarını ve farklı dillerdeki çevirilerini düzenleyin
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleTrustPointSubmit(onSaveTrustPoint)} className="space-y-6">
            {/* Hidden ID field */}
            <input type="hidden" {...registerTrustPoint('id')} />
            
            <div>
              <Label htmlFor="number">Numara (01, 02, vb.)</Label>
              <Input
                id="number"
                {...registerTrustPoint('number', { required: true })}
                placeholder="01"
                className="w-full sm:w-24"
              />
              {trustPointErrors.number && (
                <p className="text-red-500 text-sm mt-1">{trustPointErrors.number.message as string}</p>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Farklı Dillerdeki İçerikler</h3>
              
              <Tabs defaultValue={activeTab} className="mb-6">
                <TabsList>
                  {availableLanguages.map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code}>
                      {lang.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {/* Dil sekmeleri */}
                {availableLanguages.map((lang, langIndex) => {
                  // Bu dil için form alanını bul
                  const translationIndex = trustPointTranslationsFields.findIndex(
                    field => (field as any).languageCode === lang.code
                  );
                  
                  const fieldIndex = translationIndex >= 0 ? translationIndex : langIndex;
                  
                  return (
                    <TabsContent key={lang.code} value={lang.code} className="space-y-4 pt-4">
                      <input 
                        type="hidden" 
                        {...registerTrustPoint(`translations.${fieldIndex}.languageCode`)} 
                        value={lang.code}
                      />
                      
                      <div>
                        <Label htmlFor={`translations.${fieldIndex}.title`}>Başlık</Label>
                        <Input
                          id={`translations.${fieldIndex}.title`}
                          {...registerTrustPoint(`translations.${fieldIndex}.title`, { 
                            required: lang.isDefault || lang.code === activeTab
                          })}
                          placeholder="Örn: Experienced Specialists"
                        />
                        {trustPointErrors.translations?.[fieldIndex]?.title && (
                          <p className="text-red-500 text-sm mt-1">
                            {(trustPointErrors.translations[fieldIndex].title as any)?.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor={`translations.${fieldIndex}.description`}>Açıklama</Label>
                        <Textarea
                          id={`translations.${fieldIndex}.description`}
                          {...registerTrustPoint(`translations.${fieldIndex}.description`, { 
                            required: lang.isDefault || lang.code === activeTab
                          })}
                          placeholder="Trust point açıklaması"
                          rows={3}
                        />
                        {trustPointErrors.translations?.[fieldIndex]?.description && (
                          <p className="text-red-500 text-sm mt-1">
                            {(trustPointErrors.translations[fieldIndex].description as any)?.message}
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Kaydediliyor...' : 'Trust Point Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Trust Point Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trust Point'i silmek istediğinizden emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Trust point ve tüm çevirileri kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTrustPoint}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Siliniyor...' : 'Evet, Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WhyTrustSectionAdminPage;