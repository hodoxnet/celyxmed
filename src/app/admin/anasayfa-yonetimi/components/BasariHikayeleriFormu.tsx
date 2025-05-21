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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Language } from '@/generated/prisma/client';
import { PlusCircle, Trash2, MoveUp, MoveDown, Pencil, Star } from 'lucide-react'; // CheckCircle, XCircle kaldırıldı
import ImageUpload from '@/components/admin/image-upload';
import Image from 'next/image'; // next/image importu eklendi
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent, // İsim çakışmasını önlemek için yeniden adlandırıldı
} from "@/components/ui/alert-dialog"; // AlertDialog importları eklendi

// Zod Şemaları
const sectionTranslationSchema = z.object({
  languageCode: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  consultButtonText: z.string().optional(),
  consultButtonLink: z.string().optional().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }).nullable(),
  discoverButtonText: z.string().optional(),
  discoverButtonLink: z.string().optional().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }).nullable(),
});

// Temel çeviri şeması
const baseTestimonialTranslationSchema = z.object({
    languageCode: z.string().min(1),
    text: z.string().optional(),
    author: z.string().optional(),
    treatment: z.string().optional(),
});

// Temel yorum şeması
const baseTestimonialSchema = z.object({
  id: z.string().optional(),
  stars: z.number().min(1).max(5),
  imageUrl: z.string().optional().nullable(),
  order: z.number().optional(),
  translations: z.array(baseTestimonialTranslationSchema).min(1, "En az bir dilde yorum çevirisi gereklidir."),
});

// Aktif dil için zorunlu alanları kontrol eden şema oluşturucu fonksiyon
const createTestimonialSchema = (activeLang: string) => {
  return baseTestimonialSchema.superRefine((data, ctx) => {
    // Aktif dilde çeviri var mı kontrol et
    const activeLangTranslation = data.translations.find(t => t.languageCode === activeLang);
    
    if (!activeLangTranslation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${activeLang} dilinde çeviri gereklidir`,
        path: ["translations"]
      });
      return;
    }
    
    // Aktif dildeki alanların doluluğunu kontrol et
    if (!activeLangTranslation.text || activeLangTranslation.text.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Yorum metni gereklidir",
        path: ["translations", data.translations.indexOf(activeLangTranslation), "text"]
      });
    }
    
    if (!activeLangTranslation.author || activeLangTranslation.author.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Yazar adı gereklidir",
        path: ["translations", data.translations.indexOf(activeLangTranslation), "author"]
      });
    }
    
    if (!activeLangTranslation.treatment || activeLangTranslation.treatment.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tedavi adı gereklidir",
        path: ["translations", data.translations.indexOf(activeLangTranslation), "treatment"]
      });
    }
  });
};

type SuccessStoriesSectionFormData = {
  translations: Array<z.infer<typeof sectionTranslationSchema>>;
};
type TestimonialFormData = z.infer<typeof baseTestimonialSchema>;
type GalleryImage = { id: string; imageUrl: string; altText?: string | null; order: number; };
type Testimonial = TestimonialFormData & { id: string; order: number; };

interface BasariHikayeleriFormuProps {
    availableLanguages: Language[];
    activeLanguageCode: string; 
}

export default function BasariHikayeleriFormu({ availableLanguages, activeLanguageCode }: BasariHikayeleriFormuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  // activeTab state'i ana bölüm için activeLanguageCode prop'u ile değiştirilecek
  
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  // isUploadingImage kaldırıldı, ImageUpload kendi loading state'ini yönetebilir
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null); // Bu AlertDialog için kullanılacak
  const [isDeleteImageAlertOpen, setIsDeleteImageAlertOpen] = useState(false);


  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);
  const [isDeleteTestimonialAlertOpen, setIsDeleteTestimonialAlertOpen] = useState(false);


  const sectionFormSchema = z.object({
    translations: z.array(
        sectionTranslationSchema.superRefine((data,ctx) => {
            if(data.languageCode === activeLanguageCode) { // activeTab yerine activeLanguageCode
                if(!data.title) ctx.addIssue({code: z.ZodIssueCode.custom, message: "Başlık gereklidir", path: ['title']});
                if(!data.description) ctx.addIssue({code: z.ZodIssueCode.custom, message: "Açıklama gereklidir", path: ['description']});
            }
        })
    )
  });
  
  const { control, handleSubmit, register, reset, formState: { errors }, trigger: triggerSectionForm } = useForm<SuccessStoriesSectionFormData>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: { translations: [] },
    mode: "onChange"
  });
  const { fields: translationsFields } = useFieldArray({ control, name: "translations" });

  const getTestimonialFormResolver = useCallback((activeCode: string) => {
    return zodResolver(createTestimonialSchema(activeCode));
  }, []);

  const testimonialFormMethods = useForm<TestimonialFormData>({
    resolver: getTestimonialFormResolver(activeLanguageCode),
    defaultValues: { stars: 5, imageUrl: '', translations: [] },
    mode: "onSubmit"
  });
  const { fields: testimonialTFields } = useFieldArray({ control: testimonialFormMethods.control, name: "translations" });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const sectionRes = await fetch('/api/admin/success-stories-section');
      const sectionData = await sectionRes.json();
      if (!sectionRes.ok) throw new Error(sectionData.message || "Bölüm verileri yüklenemedi");

      const processedTranslations = availableLanguages.map(lang => {
        const existing = sectionData?.translations?.find((t:any) => t.languageCode === lang.code);
        return existing || { languageCode: lang.code, title: '', description: '', consultButtonText: '', consultButtonLink: '', discoverButtonText: '', discoverButtonLink: '' };
      });
      reset({ translations: processedTranslations });
      setGalleryImages(sectionData?.galleryImages?.sort((a:GalleryImage,b:GalleryImage) => a.order - b.order) || []);
      setTestimonials(sectionData?.testimonials?.sort((a:Testimonial,b:Testimonial) => a.order - b.order) || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Veri yükleme hatası.');
    } finally {
      setIsLoading(false);
      setInitialDataLoaded(true);
    }
  }, [availableLanguages, reset]); // activeTab kaldırıldı

  useEffect(() => { if (availableLanguages.length > 0) fetchData(); }, [fetchData, availableLanguages]);
  
  // Aktif dil değiştiğinde form doğrulama şemasını güncelle
  useEffect(() => {
    // Form doğrulama şemasını güncelle
    testimonialFormMethods.reset(
      testimonialFormMethods.getValues(), 
      { 
        resolver: getTestimonialFormResolver(activeLanguageCode) 
      }
    );
  }, [activeLanguageCode, getTestimonialFormResolver, testimonialFormMethods]);

  const onSectionSubmit = async (data: SuccessStoriesSectionFormData) => {
    setIsLoading(true);
    const isValid = await triggerSectionForm();
    if(!isValid){
        toast.error(`Lütfen aktif (${activeLanguageCode}) dildeki zorunlu alanları doldurun.`);
        setIsLoading(false);
        return;
    }
    try {
      const response = await fetch('/api/admin/success-stories-section', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translations: data.translations }),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Bölüm metinleri kaydedilemedi.');
      toast.success('Bölüm metinleri başarıyla kaydedildi!');
      const savedData = await response.json();
      reset({ translations: savedData.translations });
    } catch (error: any) { toast.error(`Hata: ${error.message}`); } 
    finally { setIsLoading(false); }
  };

  const handleGalleryImageUpload = async (imageUrl: string) => {
    if (!imageUrl) return;
    setIsLoading(true); // Genel isLoading kullanılabilir veya ayrı bir state
    try {
      const response = await fetch('/api/admin/success-stories-section/gallery-images', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, altText: 'Başarı hikayesi galerisi', order: galleryImages.length }),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Galeri resmi eklenemedi.');
      toast.success('Galeri resmi eklendi!');
      fetchData(); 
    } catch (error: any) { toast.error(`Hata: ${error.message}`); }
    finally { setIsLoading(false); }
  };

  const handleDeleteGalleryImage = async () => {
    if (!deletingImageId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/success-stories-section/gallery-images/${deletingImageId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).message || 'Galeri resmi silinemedi.');
      toast.success('Galeri resmi silindi!');
      fetchData();
    } catch (error: any) { toast.error(`Hata: ${error.message}`); }
    finally { 
        setIsLoading(false); 
        setDeletingImageId(null);
        setIsDeleteImageAlertOpen(false);
    }
  };
  
  const handleMoveGalleryImage = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = galleryImages.findIndex(img => img.id === id);
    const newImages = [...galleryImages];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[currentIndex], newImages[targetIndex]] = [newImages[targetIndex], newImages[currentIndex]];
    const updatedImagesWithOrder = newImages.map((img, index) => ({ ...img, order: index }));
    setGalleryImages(updatedImagesWithOrder); // Optimistic update
    try {
        await fetch('/api/admin/success-stories-section/gallery-images/order', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedImagesWithOrder.map(img => ({ id: img.id, order: img.order }))),
        });
        toast.success("Galeri sıralaması güncellendi.");
    } catch (error) {
        toast.error("Galeri sıralaması güncellenirken hata.");
        fetchData(); 
    }
  };

  const openNewTestimonialDialog = () => {
    setEditingTestimonial(null);
    // Güncel resolver ile formu sıfırla
    testimonialFormMethods.reset({
        stars: 5, 
        imageUrl: '',
        translations: availableLanguages.map(lang => ({ 
          languageCode: lang.code, 
          text: lang.code === activeLanguageCode ? '' : undefined, 
          author: lang.code === activeLanguageCode ? '' : undefined,
          treatment: lang.code === activeLanguageCode ? '' : undefined
        }))
    }, {
      resolver: getTestimonialFormResolver(activeLanguageCode)
    });
    setIsTestimonialDialogOpen(true);
  };

  const openEditTestimonialDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    // Düzenleme için mevcut çevirileri hazırla, eksik dilleri boş olarak ekle
    testimonialFormMethods.reset({
        id: testimonial.id, 
        stars: testimonial.stars, 
        imageUrl: testimonial.imageUrl || '',
        translations: availableLanguages.map(lang => {
            const existing = testimonial.translations.find(t => t.languageCode === lang.code);
            if (existing) {
                return existing;
            } else {
                // Aktif dil ve diğer diller için farklı varsayılan değerler
                return { 
                    languageCode: lang.code, 
                    text: lang.code === activeLanguageCode ? '' : undefined, 
                    author: lang.code === activeLanguageCode ? '' : undefined,
                    treatment: lang.code === activeLanguageCode ? '' : undefined
                };
            }
        })
    }, {
        resolver: getTestimonialFormResolver(activeLanguageCode)
    });
    setIsTestimonialDialogOpen(true);
  };

  const onTestimonialFormSubmit = async (data: TestimonialFormData) => {
    console.log("Form submit edildi. Veriler:", data);
    
    // Aktif dildeki çeviriyi kontrol et
    const activeTranslation = data.translations.find(t => t.languageCode === activeLanguageCode);
    if (!activeTranslation || !activeTranslation.text || !activeTranslation.author || !activeTranslation.treatment) {
      toast.error(`Lütfen en az ${activeLanguageCode} dilindeki tüm alanları doldurun.`);
      return;
    }
    
    setIsLoading(true);
    const method = editingTestimonial ? 'PUT' : 'POST';
    const url = editingTestimonial 
        ? `/api/admin/success-stories-section/testimonials/${editingTestimonial.id}` 
        : '/api/admin/success-stories-section/testimonials';
    
    try {
        const payload = { ...data, order: editingTestimonial?.order ?? testimonials.length };
        console.log("API'ye gönderilen payload:", payload);
        
        const response = await fetch(url, { 
          method, 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
        
        const responseData = await response.json();
        console.log("API yanıtı:", responseData);
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Yorum işlenemedi.');
        }
        
        toast.success(`Yorum başarıyla ${editingTestimonial ? 'güncellendi' : 'eklendi'}!`);
        setIsTestimonialDialogOpen(false);
        fetchData();
    } catch (error: any) { 
        console.error("API hata detayı:", error);
        toast.error(`Hata: ${error.message}`); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const onDeleteTestimonial = async () => {
    if (!deletingTestimonialId) return;
    setIsLoading(true);
    try {
        const response = await fetch(`/api/admin/success-stories-section/testimonials/${deletingTestimonialId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error((await response.json()).message || 'Yorum silinemedi.');
        toast.success('Yorum başarıyla silindi!');
        fetchData();
    } catch (error: any) { toast.error(`Silme Hatası: ${error.message}`); }
    finally { 
        setIsLoading(false); 
        setDeletingTestimonialId(null);
        setIsDeleteTestimonialAlertOpen(false);
    }
  };

  const handleMoveTestimonial = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = testimonials.findIndex(t => t.id === id);
    const newTestimonials = [...testimonials];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= newTestimonials.length) return;
    [newTestimonials[currentIndex], newTestimonials[targetIndex]] = [newTestimonials[targetIndex], newTestimonials[currentIndex]];
    const updatedTestimonialsWithOrder = newTestimonials.map((t, index) => ({ ...t, order: index }));
    setTestimonials(updatedTestimonialsWithOrder);
     try {
        await fetch('/api/admin/success-stories-section/testimonials/order', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTestimonialsWithOrder.map(t => ({ id: t.id, order: t.order }))),
        });
        toast.success("Yorum sıralaması güncellendi.");
    } catch (error) {
        toast.error("Yorum sıralaması güncellenirken hata.");
        fetchData();
    }
  };

  if (!initialDataLoaded && isLoading) return <MixedLoadingSkeleton title="Başarı hikayeleri yükleniyor..." />;

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSectionSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Bölüm Metinleri ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</CardTitle></CardHeader>
          <CardContent>
            {availableLanguages.length > 0 && translationsFields.map((item, index) => {
                if (item.languageCode !== activeLanguageCode) return null;
                const currentLangErrors = errors.translations?.[index];
                return (
                <div key={item.id} className="space-y-4 pt-4">
                    <input type="hidden" {...register(`translations.${index}.languageCode`)} />
                    <div><Label>Ana Başlık</Label><Controller name={`translations.${index}.title`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} />
                    {currentLangErrors?.title && <p className="text-red-500 text-sm mt-1">{currentLangErrors.title.message}</p>}</div>
                    <div><Label>Açıklama</Label><Controller name={`translations.${index}.description`} control={control} render={({ field }) => <Textarea {...field} value={field.value ?? ''} rows={3} />} />
                    {currentLangErrors?.description && <p className="text-red-500 text-sm mt-1">{currentLangErrors.description.message}</p>}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Konsültasyon Buton Metni</Label><Controller name={`translations.${index}.consultButtonText`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} /></div>
                        <div><Label>Konsültasyon Buton Linki</Label><Controller name={`translations.${index}.consultButtonLink`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Keşfet Buton Metni</Label><Controller name={`translations.${index}.discoverButtonText`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} /></div>
                        <div><Label>Keşfet Buton Linki</Label><Controller name={`translations.${index}.discoverButtonLink`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} />} /></div>
                    </div>
                </div>
            )})}
            {availableLanguages.length === 0 && <p>Aktif dil bulunamadı.</p>}
          </CardContent>
          <CardFooter><Button type="submit" disabled={isLoading}>{isLoading ? 'Kaydediliyor...' : 'Bölüm Metinlerini Kaydet'}</Button></CardFooter>
        </Card>
      </form>

      <Card>
        <CardHeader><CardTitle>Galeri Görselleri</CardTitle><CardDescription>Otomatik kayan galeri için görseller.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Yeni Görsel Yükle</Label><ImageUpload onImageUploaded={handleGalleryImageUpload} uploadFolder="success-stories" buttonText="Görsel Yükle" /></div>
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <div key={img.id} className="relative group border rounded aspect-square">
                  <Image src={img.imageUrl} alt={img.altText || `Galeri ${idx+1}`} fill className="object-cover rounded"/>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                    <Button variant="ghost" size="icon" onClick={() => handleMoveGalleryImage(img.id, 'up')} disabled={idx === 0} className="text-white hover:bg-white/20"><MoveUp size={18}/></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleMoveGalleryImage(img.id, 'down')} disabled={idx === galleryImages.length -1} className="text-white hover:bg-white/20"><MoveDown size={18}/></Button>
                    <Button variant="ghost" size="icon" onClick={() => {setDeletingImageId(img.id); setIsDeleteImageAlertOpen(true);}} className="text-red-400 hover:bg-red-500/30 hover:text-red-500"><Trash2 size={18}/></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-center py-4">Galeri için görsel bulunmuyor.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Hasta Yorumları</CardTitle><CardDescription>Bölümde gösterilecek yorumlar.</CardDescription></div>
            <Button onClick={openNewTestimonialDialog} size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Yeni Yorum Ekle</Button>
        </CardHeader>
        <CardContent>
            {testimonials.length > 0 ? (
                <Table><TableHeader><TableRow><TableHead className="w-12 text-center">★</TableHead><TableHead>Hasta</TableHead><TableHead className="hidden md:table-cell">Tedavi</TableHead><TableHead className="w-32 text-right">İşlemler</TableHead></TableRow></TableHeader>
                <TableBody>
                    {testimonials.map((item, idx) => {
                        const title = item.translations.find(t => t.languageCode === activeLanguageCode)?.author || item.translations[0]?.author || 'N/A';
                        const treatment = item.translations.find(t => t.languageCode === activeLanguageCode)?.treatment || item.translations[0]?.treatment || 'N/A';
                        return(
                        <TableRow key={item.id}>
                            <TableCell className="text-center font-semibold">{item.stars}</TableCell>
                            <TableCell><div className="flex items-center gap-2">{item.imageUrl && <Image src={item.imageUrl} alt={title} width={32} height={32} className="rounded-full object-cover w-8 h-8"/>} {title}</div></TableCell>
                            <TableCell className="hidden md:table-cell">{treatment}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleMoveTestimonial(item.id, 'up')} disabled={idx === 0}><MoveUp size={16}/></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleMoveTestimonial(item.id, 'down')} disabled={idx === testimonials.length -1}><MoveDown size={16}/></Button>
                                <Button variant="ghost" size="icon" onClick={() => openEditTestimonialDialog(item)}><Pencil size={16}/></Button>
                                <Button variant="ghost" size="icon" onClick={() => {setDeletingTestimonialId(item.id); setIsDeleteTestimonialAlertOpen(true);}}><Trash2 size={16} className="text-red-500"/></Button>
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
                </Table>
            ): <p className="text-center py-4">Henüz yorum eklenmemiş.</p>}
        </CardContent>
      </Card>

      <Dialog open={isTestimonialDialogOpen} onOpenChange={(open) => {
          if (!isLoading) setIsTestimonialDialogOpen(open);
        }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingTestimonial ? 'Yorumu Düzenle' : 'Yeni Yorum Ekle'}</DialogTitle>
            <DialogDescription>
              Tüm bilgileri doldurarak kaydedin. {availableLanguages.find(l => l.code === activeLanguageCode)?.name} dilindeki içerik zorunludur.
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={testimonialFormMethods.handleSubmit(onTestimonialFormSubmit, (errors) => {
              console.log("Form doğrulama hataları:", errors);
              toast.error("Formu doğru şekilde doldurun");
            })} 
            className="space-y-6 py-4"
          >
            <input type="hidden" {...testimonialFormMethods.register('id')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
                <div>
                  <Label className="font-semibold">Yıldız Sayısı</Label>
                  <Controller 
                    name="stars" 
                    control={testimonialFormMethods.control} 
                    render={({field}) => (
                      <div className="flex mt-2">
                        {[1,2,3,4,5].map(s => 
                          <Star 
                            key={s} 
                            onClick={() => field.onChange(s)} 
                            className={`h-6 w-6 cursor-pointer ${field.value >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        )}
                      </div>
                    )}
                  />
                </div>
                <div>
                  <Label className="font-semibold">Hasta Fotoğrafı</Label>
                  <Controller 
                    name="imageUrl" 
                    control={testimonialFormMethods.control} 
                    render={({field}) => 
                      <ImageUpload 
                        initialImage={field.value || undefined} 
                        onImageUploaded={(url) => field.onChange(url)} 
                        uploadFolder="success-stories/avatars" 
                        buttonText="Fotoğraf Yükle/Değiştir"
                      />
                    }
                  />
                </div>
            </div>
            
            <div className="border p-4 rounded-md">
              <h3 className="text-md font-semibold text-gray-800 mb-4">
                İçerik - {availableLanguages.find(l => l.code === activeLanguageCode)?.name}
              </h3>
              
              {testimonialTFields.map((field, index) => {
                  const langCode = testimonialFormMethods.watch(`translations.${index}.languageCode`);
                  if (langCode !== activeLanguageCode) return null; 
                  
                  const currentLangErrors = testimonialFormMethods.formState.errors.translations?.[index];
                  
                  return (
                    <div key={field.id} className="space-y-4">
                      <input 
                        type="hidden" 
                        {...testimonialFormMethods.register(`translations.${index}.languageCode`)} 
                      />
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                          Yorum Metni *
                        </Label>
                        <Textarea 
                          {...testimonialFormMethods.register(`translations.${index}.text`, {
                            required: "Yorum metni gereklidir"
                          })} 
                          rows={3}
                          placeholder="Hastanın yorumunu yazın"
                          className={currentLangErrors?.text ? "border-red-500" : ""}
                        />
                        {currentLangErrors?.text && 
                          <p className="text-red-500 text-sm mt-1">{currentLangErrors.text.message}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-1">
                            Hasta Adı *
                          </Label>
                          <Input 
                            {...testimonialFormMethods.register(`translations.${index}.author`, {
                              required: "Hasta adı gereklidir"
                            })} 
                            placeholder="Hasta adı"
                            className={currentLangErrors?.author ? "border-red-500" : ""}
                          />
                          {currentLangErrors?.author && 
                            <p className="text-red-500 text-sm mt-1">{currentLangErrors.author.message}</p>}
                        </div>
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-1">
                            Tedavi Adı *
                          </Label>
                          <Input 
                            {...testimonialFormMethods.register(`translations.${index}.treatment`, {
                              required: "Tedavi adı gereklidir"
                            })} 
                            placeholder="Tedavi adı"
                            className={currentLangErrors?.treatment ? "border-red-500" : ""}
                          />
                          {currentLangErrors?.treatment && 
                            <p className="text-red-500 text-sm mt-1">{currentLangErrors.treatment.message}</p>}
                        </div>
                      </div>
                    </div>
                  );
              })}
            </div>
            
            <DialogFooter className="mt-6 space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsTestimonialDialogOpen(false)}
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

      <AlertDialog open={isDeleteImageAlertOpen} onOpenChange={setIsDeleteImageAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitleComponent>Görseli silmek istediğinizden emin misiniz?</AlertDialogTitleComponent><AlertDialogDescription>Bu işlem geri alınamaz.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setDeletingImageId(null)}>İptal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteGalleryImage} disabled={isLoading} className="bg-red-600 hover:bg-red-700">Sil</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isDeleteTestimonialAlertOpen} onOpenChange={setIsDeleteTestimonialAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitleComponent>Yorumu silmek istediğinizden emin misiniz?</AlertDialogTitleComponent><AlertDialogDescription>Bu işlem geri alınamaz.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setDeletingTestimonialId(null)}>İptal</AlertDialogCancel><AlertDialogAction onClick={onDeleteTestimonial} disabled={isLoading} className="bg-red-600 hover:bg-red-700">Sil</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
