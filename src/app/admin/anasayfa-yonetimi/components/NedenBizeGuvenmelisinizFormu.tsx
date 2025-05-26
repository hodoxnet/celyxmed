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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
// Tabs importları kaldırıldı
import { Language } from '@/generated/prisma/client';
import { PlusCircle, Trash2, MoveUp, MoveDown, Pencil } from 'lucide-react';
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
} from "@/components/ui/dialog";

// Zod Şemaları
const sectionTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir"),
  title: z.string().optional(), 
  subtitle: z.string().optional(), 
});

// Temel çeviri şeması - tüm diller için geçerli
const baseTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir"),
  title: z.string().optional(),
  description: z.string().optional(),
});

// Aktif dil için oluşturulacak özel şema
const createActiveLangTranslationSchema = (activeLang: string) => 
  baseTranslationSchema.superRefine((data, ctx) => {
    // Sadece aktif dil için kontrol yapılır
    if (data.languageCode === activeLang) {
      if (!data.title || data.title.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Başlık gereklidir",
          path: ["title"]
        });
      }
      
      if (!data.description || data.description.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom, 
          message: "Açıklama gereklidir",
          path: ["description"] 
        });
      }
    }
  });

// Temel trust point şeması
const baseTrustPointSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(1, "Numara gereklidir"),
  order: z.number().optional(),
  translations: z.array(baseTranslationSchema).nonempty("En az bir dilde çeviri gereklidir"),
});

// Bu fonksiyon aktif dil kodu için dinamik bir trustPointSchema oluşturur
const createTrustPointSchema = (activeLang: string) => {
  return baseTrustPointSchema.superRefine((data, ctx) => {
    // Aktif dildeki çeviriyi bul
    const activeLangTranslation = data.translations.find(t => t.languageCode === activeLang);
    
    // Aktif dilde çeviri yoksa veya başlık/açıklama eksikse hata ver
    if (!activeLangTranslation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${activeLang} dilinde çeviri gereklidir`,
        path: ["translations"]
      });
      return;
    }
    
    if (!activeLangTranslation.title || activeLangTranslation.title.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Başlık gereklidir",
        path: ["translations", data.translations.indexOf(activeLangTranslation), "title"]
      });
    }
    
    if (!activeLangTranslation.description || activeLangTranslation.description.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Açıklama gereklidir",
        path: ["translations", data.translations.indexOf(activeLangTranslation), "description"]
      });
    }
  });
};

type WhyTrustSectionFormData = {
  backgroundImage?: string;
  translations: Array<z.infer<typeof sectionTranslationSchema>>;
};

// Tip tanımları
type TrustPointFormData = z.infer<typeof baseTrustPointSchema>;
type TrustPoint = TrustPointFormData & { id: string; order: number };


interface NedenBizeGuvenmelisinizFormuProps {
    availableLanguages: Language[];
    activeLanguageCode: string; 
}

export default function NedenBizeGuvenmelisinizFormu({ availableLanguages, activeLanguageCode }: NedenBizeGuvenmelisinizFormuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  // activeTab state'i yerine activeLanguageCode prop'u kullanılacak
  
  const [trustPoints, setTrustPoints] = useState<TrustPoint[]>([]);
  const [isTrustPointDialogOpen, setIsTrustPointDialogOpen] = useState(false);
  const [editingTrustPoint, setEditingTrustPoint] = useState<TrustPoint | null>(null);
  
  const sectionFormSchema = z.object({
    backgroundImage: z.string().optional(), 
    translations: z.array(
        sectionTranslationSchema.superRefine((data, ctx) => {
        if (data.languageCode === activeLanguageCode) { // activeTab yerine activeLanguageCode
          if (!data.title) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Başlık gereklidir", path: ['title'] });
          if (!data.subtitle) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Alt başlık gereklidir", path: ['subtitle'] });
        }
      })
    ),
  });

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
    watch,
    trigger: triggerSectionForm,
  } = useForm<WhyTrustSectionFormData>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: { backgroundImage: undefined, translations: [] }, 
    mode: "onChange"
  });

  const { fields: translationsFields } = useFieldArray({ control, name: "translations" });

  const getFormResolver = useCallback((activeCode: string) => {
    return zodResolver(createTrustPointSchema(activeCode));
  }, []);

  const trustPointFormMethods = useForm<TrustPointFormData>({
    resolver: getFormResolver(activeLanguageCode),
    defaultValues: { number: '', translations: [] },
    mode: "onSubmit"
  });
  const { fields: tpTranslationsFields } = useFieldArray({ control: trustPointFormMethods.control, name: "translations" });


  const fetchData = useCallback(async () => {
    if (availableLanguages.length === 0) return;
    setIsLoading(true);
    try {
      const sectionRes = await fetch('/api/admin/why-trust-section');
      const sectionData: { backgroundImageUrl?: string, translations: any[], trustPoints: TrustPoint[] } = await sectionRes.json();

      const processedTranslations = availableLanguages.map(lang => {
        const existing = sectionData?.translations?.find(t => t.languageCode === lang.code);
        return existing || { languageCode: lang.code, title: '', subtitle: '' };
      });
      reset({ backgroundImage: sectionData?.backgroundImageUrl || undefined, translations: processedTranslations }); 
      setTrustPoints(sectionData?.trustPoints?.sort((a,b) => a.order - b.order) || []);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setInitialDataLoaded(true);
    }
  }, [availableLanguages, reset]); // activeTab kaldırıldı

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const onSectionSubmit = async (data: WhyTrustSectionFormData) => {
    setIsLoading(true);
    const isValid = await triggerSectionForm();
    if(!isValid) {
        toast.error(`Lütfen aktif (${activeLanguageCode}) dildeki tüm zorunlu alanları doldurun.`);
        setIsLoading(false);
        return;
    }
    try {
      const response = await fetch('/api/admin/why-trust-section', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backgroundImageUrl: data.backgroundImage, translations: data.translations }),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Bölüm kaydedilemedi.');
      toast.success('Bölüm başarıyla kaydedildi!');
      const savedData = await response.json();
      reset({ backgroundImage: savedData.backgroundImageUrl, translations: savedData.translations });
    } catch (error: any) { toast.error(`Kaydetme hatası: ${error.message}`); } 
    finally { setIsLoading(false); }
  };

  // Doğrulama şemasını aktif dil koduna göre güncelle
  useEffect(() => {
    // Form doğrulama şemasını güncelle
    trustPointFormMethods.reset(
      trustPointFormMethods.getValues(), 
      { 
        resolver: getFormResolver(activeLanguageCode) 
      }
    );
  }, [activeLanguageCode, getFormResolver]);

  const openNewTrustPointDialog = () => {
    setEditingTrustPoint(null);
    // Güncel resolver ile formu sıfırla
    trustPointFormMethods.reset({
        number: '',
        translations: availableLanguages.map(lang => ({ 
          languageCode: lang.code, 
          title: lang.code === activeLanguageCode ? '' : undefined, 
          description: lang.code === activeLanguageCode ? '' : undefined
        }))
    }, {
      resolver: getFormResolver(activeLanguageCode)
    });
    setIsTrustPointDialogOpen(true);
  };

  const openEditTrustPointDialog = (point: TrustPoint) => {
    setEditingTrustPoint(point);
    // Düzenleme için mevcut çevirileri hazırla, eksik dilleri boş olarak ekle
    trustPointFormMethods.reset({
        id: point.id,
        number: point.number,
        translations: availableLanguages.map(lang => {
            const existing = point.translations.find(t => t.languageCode === lang.code);
            if (existing) {
                return existing;
            } else {
                // Aktif dil ve diğer diller için farklı varsayılan değerler
                return { 
                    languageCode: lang.code, 
                    title: lang.code === activeLanguageCode ? '' : undefined, 
                    description: lang.code === activeLanguageCode ? '' : undefined 
                };
            }
        })
    }, {
        resolver: getFormResolver(activeLanguageCode)
    });
    setIsTrustPointDialogOpen(true);
  };

  const onTrustPointFormSubmit = async (data: TrustPointFormData) => {
    console.log("Form submit edildi. Veriler:", data);
    
    // Yeni eklemede veya düzenlemede her dil için içerik kontrolü
    const activeTranslation = data.translations.find(t => t.languageCode === activeLanguageCode);
    if (!activeTranslation || !activeTranslation.title || !activeTranslation.description) {
      toast.error(`Lütfen en az ${activeLanguageCode} dilindeki tüm alanları doldurun.`);
      return;
    }
    
    setIsLoading(true);
    const method = editingTrustPoint ? 'PUT' : 'POST';
    const url = editingTrustPoint 
        ? `/api/admin/why-trust-section/trust-points/${editingTrustPoint.id}` 
        : '/api/admin/why-trust-section/trust-points';
    
    try {
        const payload = { ...data, order: editingTrustPoint?.order ?? trustPoints.length };
        console.log("API'ye gönderilen payload:", payload);
        
        const response = await fetch(url, { 
          method, 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
        
        const responseData = await response.json();
        console.log("API yanıtı:", responseData);
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Güven noktası işlenemedi.');
        }
        
        toast.success(`Güven noktası başarıyla ${editingTrustPoint ? 'güncellendi' : 'eklendi'}!`);
        setIsTrustPointDialogOpen(false);
        fetchData(); 
    } catch (error: any) { 
        console.error("API hata detayı:", error);
        toast.error(`Hata: ${error.message}`); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const onDeleteTrustPoint = async (id: string) => {
    if(!confirm("Bu güven noktasını silmek istediğinizden emin misiniz?")) return;
    setIsLoading(true);
    try {
        const response = await fetch(`/api/admin/why-trust-section/trust-points/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error((await response.json()).message || 'Güven noktası silinemedi.');
        toast.success('Güven noktası başarıyla silindi!');
        fetchData(); 
    } catch (error: any) { toast.error(`Silme Hatası: ${error.message}`); }
    finally { setIsLoading(false); }
  };
  
  const handleMoveTrustPoint = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = trustPoints.findIndex(p => p.id === id);
    if (currentIndex === -1) return;
    const newPoints = [...trustPoints];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= newPoints.length) return;
    
    [newPoints[currentIndex], newPoints[targetIndex]] = [newPoints[targetIndex], newPoints[currentIndex]];
    
    const updatedPointsWithOrder = newPoints.map((p, index) => ({ ...p, order: index }));
    setTrustPoints(updatedPointsWithOrder);

    try {
        await fetch('/api/admin/why-trust-section/trust-points/order', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedPointsWithOrder.map(p => ({ id: p.id, order: p.order }))),
        });
        toast.success("Sıralama güncellendi.");
    } catch (error) {
        toast.error("Sıralama güncellenirken hata oluştu.");
        fetchData();
    }
  };


  if (!initialDataLoaded && isLoading) return <MixedLoadingSkeleton title="Neden Bize Güvenmelisiniz verileri yükleniyor..." />;

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSectionSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Bölüm Genel Ayarları ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backgroundImage">Arka Plan Görseli</Label>
              <Controller name="backgroundImage" control={control} render={({ field }) => 
                <ImageUpload onImageUploaded={(url) => field.onChange(url)} initialImage={field.value} uploadFolder="why-trust-section" buttonText="Görsel Yükle/Değiştir"/>
              }/>
            </div>
            {availableLanguages.length > 0 && translationsFields.map((item, index) => {
                if (item.languageCode !== activeLanguageCode) return null; // Sadece aktif dilin formunu göster
                const currentLangErrors = errors.translations?.[index];
                return (
                    <div key={item.id} className="space-y-4 pt-4">
                    <input type="hidden" {...register(`translations.${index}.languageCode`)} />
                    <div>
                        <Label htmlFor={`translations.${index}.title`}>Ana Başlık</Label>
                        <Controller name={`translations.${index}.title`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} />
                        {currentLangErrors?.title && <p className="text-red-500 text-sm mt-1">{currentLangErrors.title.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor={`translations.${index}.subtitle`}>Alt Başlık</Label>
                        <Controller name={`translations.${index}.subtitle`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} />
                        {currentLangErrors?.subtitle && <p className="text-red-500 text-sm mt-1">{currentLangErrors.subtitle.message}</p>}
                    </div>
                    </div>
                );
            })}
            {availableLanguages.length === 0 && <p>Aktif dil bulunamadı.</p>}
          </CardContent>
          <CardFooter><Button type="submit" disabled={isLoading}>{isLoading ? 'Kaydediliyor...' : 'Genel Ayarları Kaydet'}</Button></CardFooter>
        </Card>
      </form>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Güven Noktaları</CardTitle><CardDescription>Bölümde listelenecek güven noktaları.</CardDescription></div>
          <Button onClick={openNewTrustPointDialog} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Yeni Ekle</Button>
        </CardHeader>
        <CardContent>
          {trustPoints.length > 0 ? (
            <Table><TableHeader><TableRow><TableHead className="w-16">No.</TableHead><TableHead>Başlık ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</TableHead><TableHead className="w-32 text-right">İşlemler</TableHead></TableRow></TableHeader>
              <TableBody>
                {trustPoints.map((point, index) => {
                  const displayTranslation = point.translations.find(t => t.languageCode === activeLanguageCode) || point.translations[0];
                  return (
                    <TableRow key={point.id}>
                      <TableCell className="font-mono">{point.number}</TableCell>
                      <TableCell>{displayTranslation?.title || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleMoveTrustPoint(point.id, 'up')} disabled={index === 0}><MoveUp className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleMoveTrustPoint(point.id, 'down')} disabled={index === trustPoints.length - 1}><MoveDown className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditTrustPointDialog(point)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteTrustPoint(point.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : <p className="text-center py-4">Henüz güven noktası eklenmemiş.</p>}
        </CardContent>
      </Card>

      <Dialog open={isTrustPointDialogOpen} onOpenChange={(open) => {
          if (!isLoading) setIsTrustPointDialogOpen(open);
        }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTrustPoint ? 'Güven Noktasını Düzenle' : 'Yeni Güven Noktası Ekle'}</DialogTitle>
            <DialogDescription>
              Tüm bilgileri doldurarak kaydedin. {availableLanguages.find(l => l.code === activeLanguageCode)?.name} dilindeki içerik zorunludur.
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={trustPointFormMethods.handleSubmit(onTrustPointFormSubmit, (errors) => {
              console.log("Form doğrulama hataları:", errors);
              toast.error("Formu doğru şekilde doldurun");
            })} 
            className="space-y-6 py-4"
          >
            <input type="hidden" {...trustPointFormMethods.register('id')} />
            <div className="border p-4 rounded-md bg-gray-50">
              <Label htmlFor="tp-number" className="font-semibold">Numara</Label>
              <Input 
                id="tp-number" 
                {...trustPointFormMethods.register('number')} 
                placeholder="01, 02, vb."
                className="mt-1" 
              />
              {trustPointFormMethods.formState.errors.number && 
                <p className="text-red-500 text-sm mt-1">{trustPointFormMethods.formState.errors.number.message}</p>}
            </div>
            
            <div className="border p-4 rounded-md">
              <h3 className="text-md font-semibold text-gray-800 mb-4">
                İçerik - {availableLanguages.find(l => l.code === activeLanguageCode)?.name}
              </h3>
              
              {tpTranslationsFields.map((field, index) => {
                const langCode = trustPointFormMethods.watch(`translations.${index}.languageCode`);
                if (langCode !== activeLanguageCode) return null;
                
                const currentLangErrors = trustPointFormMethods.formState.errors.translations?.[index];
                
                return (
                  <div key={field.id} className="space-y-4">
                    <input 
                      type="hidden" 
                      {...trustPointFormMethods.register(`translations.${index}.languageCode`)} 
                    />
                    <div>
                      <Label htmlFor={`tp-title-${langCode}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Başlık *
                      </Label>
                      <Input 
                        id={`tp-title-${langCode}`} 
                        {...trustPointFormMethods.register(`translations.${index}.title`, {
                          required: "Başlık zorunludur"
                        })} 
                        placeholder="Güven noktası başlığı"
                        className={currentLangErrors?.title ? "border-red-500" : ""}
                      />
                      {currentLangErrors?.title && 
                        <p className="text-red-500 text-sm mt-1">{currentLangErrors.title.message}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor={`tp-desc-${langCode}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama *
                      </Label>
                      <Textarea 
                        id={`tp-desc-${langCode}`} 
                        {...trustPointFormMethods.register(`translations.${index}.description`, {
                          required: "Açıklama zorunludur"
                        })} 
                        rows={3}
                        placeholder="Güven noktası açıklaması"
                        className={currentLangErrors?.description ? "border-red-500" : ""}
                      />
                      {currentLangErrors?.description && 
                        <p className="text-red-500 text-sm mt-1">{currentLangErrors.description.message}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <DialogFooter className="mt-6 space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsTrustPointDialogOpen(false)}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
