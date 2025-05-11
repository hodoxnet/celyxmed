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
import { PlusCircle, Trash2, MoveUp, MoveDown, Pencil, XCircle, CheckCircle, Star } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Zod Şemaları - Aktif dil için şema (zorunlu alanlar)
const activeTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir"),
  title: z.string().min(1, "Başlık gereklidir"),
  description: z.string().min(1, "Açıklama gereklidir"),
  consultButtonText: z.string().optional(),
  consultButtonLink: z.string().optional(),
  discoverButtonText: z.string().optional(),
  discoverButtonLink: z.string().optional()
});

// Diğer diller için daha esnek şema (opsiyonel alanlar)
const otherTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir"),
  title: z.string().default(""),
  description: z.string().default(""),
  consultButtonText: z.string().optional(),
  consultButtonLink: z.string().optional(),
  discoverButtonText: z.string().optional(),
  discoverButtonLink: z.string().optional()
});

// Dinamik şema oluşturucu - activeTabLanguage'e göre validasyon
const createDynamicSchema = (activeTabLanguage: string) => {
  return z.object({
    translations: z.array(
      z.union([
        // Aktif dil için zorunlu alanlar
        activeTranslationSchema.refine(
          data => data.languageCode !== activeTabLanguage ||
                 (data.title && data.description),
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

// Testimonial schema
const testimonialSchema = z.object({
  id: z.string().optional(),
  stars: z.number().min(1).max(5),
  imageUrl: z.string().optional(),
  translations: z.array(z.object({
    languageCode: z.string().min(1, "Dil kodu gereklidir"),
    text: z.string().min(1, "Yorum metni gereklidir"),
    author: z.string().min(1, "Yazar adı gereklidir"),
    treatment: z.string().min(1, "Tedavi adı gereklidir"),
  })),
});

// Genel form veri tipi
type SuccessStoriesSectionFormData = {
  translations: Array<{
    languageCode: string;
    title: string;
    description: string;
    consultButtonText?: string;
    consultButtonLink?: string;
    discoverButtonText?: string;
    discoverButtonLink?: string;
  }>;
};

// Galeri Resim tipi
type GalleryImage = {
  id: string;
  imageUrl: string;
  altText?: string | null;
  order: number;
};

// Testimonial tipi
type Testimonial = {
  id: string;
  stars: number;
  imageUrl?: string | null;
  order: number;
  translations: Array<{
    languageCode: string;
    text: string;
    author: string;
    treatment: string;
  }>;
};

const SuccessStoriesSectionAdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>();
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Galeri Resimleri State
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  
  // Testimonials State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);
  
  // Form için resolver oluşturucu
  const getResolver = useCallback((currentTab: string) => {
    return zodResolver(createDynamicSchema(currentTab));
  }, []);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<SuccessStoriesSectionFormData>({
    resolver: activeTab ? getResolver(activeTab) : undefined,
    defaultValues: {
      translations: [],
    },
    mode: "onSubmit"
  });

  // Testimonial form yönetimi
  const {
    control: testimonialControl,
    handleSubmit: handleTestimonialSubmit,
    reset: resetTestimonialForm,
    register: registerTestimonial,
    formState: { errors: testimonialErrors },
  } = useForm({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      id: '',
      stars: 5,
      imageUrl: '',
      translations: [] as { languageCode: string; text: string; author: string; treatment: string }[],
    }
  });

  // Çeviriler için Field Array
  const { fields: translationsFields } = useFieldArray({
    control,
    name: "translations",
  });

  // Testimonial çevirileri için Field Array
  const { fields: testimonialTranslationsFields, append: appendTestimonialTranslation } = useFieldArray({
    control: testimonialControl,
    name: "translations",
  });

  // Mevcut dilleri ve success-stories-section ayarlarını yükle
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Dilleri Getir
        const langRes = await fetch('/api/languages');
        const allLangs: Language[] = await langRes.json();
        const activeLanguages = allLangs.filter(lang => lang.isActive);
        setAvailableLanguages(activeLanguages);

        // Success Stories Section İçeriğini Getir
        const sectionRes = await fetch('/api/admin/success-stories-section');
        const sectionData: { 
          translations: any[],
          galleryImages: GalleryImage[],
          testimonials: Testimonial[]
        } = await sectionRes.json();

        // Ana Bölüm Çevirilerini İşle
        const processedTranslations = activeLanguages.map(lang => {
          const existingTranslation = sectionData?.translations?.find(t => t.languageCode === lang.code);
          return existingTranslation || {
            languageCode: lang.code,
            title: '',
            description: '',
            consultButtonText: 'Book Your Free Consultation',
            consultButtonLink: '/contact',
            discoverButtonText: 'Discover Success Stories',
            discoverButtonLink: '/success-stories',
          };
        });

        const dataToReset: SuccessStoriesSectionFormData = { 
          translations: processedTranslations,
        };
        
        reset(dataToReset);

        // Galeri Resimleri ve Testimonials'ları set et
        if (sectionData?.galleryImages && Array.isArray(sectionData.galleryImages)) {
          setGalleryImages(sectionData.galleryImages);
        }
        
        if (sectionData?.testimonials && Array.isArray(sectionData.testimonials)) {
          setTestimonials(sectionData.testimonials);
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

  // Testimonial düzenleme formu için dil alanlarını hazırla
  useEffect(() => {
    if (selectedTestimonial && isEditDialogOpen) {
      // Testimonial form'unu seçilen testimonial ile doldur
      resetTestimonialForm({
        id: selectedTestimonial.id,
        stars: selectedTestimonial.stars,
        imageUrl: selectedTestimonial.imageUrl || '',
        translations: selectedTestimonial.translations,
      });
    } else if (isEditDialogOpen && availableLanguages.length > 0) {
      // Yeni Testimonial için tüm dillerde boş alanlar oluştur
      resetTestimonialForm({
        id: '',
        stars: 5,
        imageUrl: '',
        translations: availableLanguages.map(lang => ({
          languageCode: lang.code,
          text: '',
          author: '',
          treatment: '',
        })),
      });
    }
  }, [selectedTestimonial, isEditDialogOpen, availableLanguages, resetTestimonialForm]);

  // Form verilerini API'ye gönder
  const onSubmit = async (data: SuccessStoriesSectionFormData) => {
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

        if (!activeTabData.description) {
          setFormErrors(prev => ({ ...prev, description: "Açıklama alanı zorunludur" }));
          hasError = true;
        }

        if (hasError) {
          toast.error(`Lütfen ${activeTab} dili için tüm alanları doğru şekilde doldurun`);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/admin/success-stories-section', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Success Stories Section alanı kaydedilemedi.');
      }

      const savedData = await response.json();
      toast.success('Success Stories Section alanı başarıyla kaydedildi!');

      // Formu güncel veriyle resetle
      reset({
        translations: savedData.translations,
      });

      // Galeri Resimleri ve Testimonials state'ini güncelle
      if (savedData.galleryImages) {
        setGalleryImages(savedData.galleryImages);
      }
      
      if (savedData.testimonials) {
        setTestimonials(savedData.testimonials);
      }

    } catch (error: any) {
      toast.error(`Kaydetme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Yeni galeri resmi yükle
  const handleImageUpload = async (imageUrl: string) => {
    if (!imageUrl) return;
    
    try {
      setIsUploadingImage(true);
      
      const response = await fetch('/api/admin/success-stories-section/gallery-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl,
          altText: 'Success story image'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Galeri resmi eklenemedi.');
      }

      const newImage = await response.json();
      setGalleryImages(prev => [...prev, newImage]);
      toast.success('Galeri resmi başarıyla eklendi!');
      
    } catch (error: any) {
      toast.error(`Resim yükleme hatası: ${error.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  // Galeri resmi sil
  const deleteGalleryImage = async () => {
    if (!deletingImageId) return;
    
    try {
      setIsDeletingImage(true);
      
      const response = await fetch(`/api/admin/success-stories-section/gallery-images/${deletingImageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Galeri resmi silinemedi.');
      }

      setGalleryImages(prev => prev.filter(img => img.id !== deletingImageId));
      toast.success('Galeri resmi başarıyla silindi!');
      
    } catch (error: any) {
      toast.error(`Resim silme hatası: ${error.message}`);
    } finally {
      setIsDeletingImage(false);
      setDeletingImageId(null);
    }
  };
  
  // Galeri resimleri sıralama değiştir
  const moveGalleryImage = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = galleryImages.findIndex(img => img.id === id);
    if (currentIndex === -1) return;
    
    const newGalleryImages = [...galleryImages];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Sınırları kontrol et
    if (targetIndex < 0 || targetIndex >= newGalleryImages.length) return;
    
    // Yer değiştir
    [newGalleryImages[currentIndex], newGalleryImages[targetIndex]] = 
    [newGalleryImages[targetIndex], newGalleryImages[currentIndex]];
    
    // Order değerlerini güncelle
    newGalleryImages.forEach((img, index) => {
      img.order = index;
    });
    
    setGalleryImages(newGalleryImages);
    
    // API'ye gönder
    try {
      await Promise.all(
        [currentIndex, targetIndex].map(idx => 
          fetch(`/api/admin/success-stories-section/gallery-images/${newGalleryImages[idx].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...newGalleryImages[idx],
              order: idx,
            }),
          })
        )
      );
    } catch (error) {
      console.error('Error updating gallery image order:', error);
      toast.error('Sıralama güncellenirken bir hata oluştu.');
    }
  };

  // Testimonial kaydet
  const onSaveTestimonial = async (data: any) => {
    try {
      setIsLoading(true);
      
      const isEditing = !!data.id;
      const endpoint = isEditing 
        ? `/api/admin/success-stories-section/testimonials/${data.id}` 
        : '/api/admin/success-stories-section/testimonials';
      
      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Testimonial kaydedilemedi.');
      }

      const savedData = await response.json();
      
      // Testimonials listesini güncelle
      if (isEditing) {
        setTestimonials(prev => prev.map(item => item.id === savedData.id ? savedData : item));
      } else {
        setTestimonials(prev => [...prev, savedData]);
      }
      
      toast.success(`Testimonial ${isEditing ? 'güncellendi' : 'eklendi'}!`);
      setIsEditDialogOpen(false);
      setSelectedTestimonial(null);
      
    } catch (error: any) {
      toast.error(`Testimonial kaydetme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Testimonial Sil
  const deleteTestimonial = async () => {
    if (!deletingTestimonialId) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/success-stories-section/testimonials/${deletingTestimonialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Testimonial silinemedi.');
      }

      // Testimonials listesinden kaldır
      setTestimonials(prev => prev.filter(item => item.id !== deletingTestimonialId));
      
      toast.success('Testimonial başarıyla silindi!');
      
    } catch (error: any) {
      toast.error(`Testimonial silme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setDeletingTestimonialId(null);
    }
  };

  // Testimonial sıralamasını değiştir
  const moveTestimonial = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = testimonials.findIndex(t => t.id === id);
    if (currentIndex === -1) return;
    
    const newTestimonials = [...testimonials];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Sınırları kontrol et
    if (targetIndex < 0 || targetIndex >= newTestimonials.length) return;
    
    // Yer değiştir
    [newTestimonials[currentIndex], newTestimonials[targetIndex]] = 
    [newTestimonials[targetIndex], newTestimonials[currentIndex]];
    
    // Order değerlerini güncelle
    newTestimonials.forEach((t, index) => {
      t.order = index;
    });
    
    setTestimonials(newTestimonials);
    
    // API'ye gönder
    try {
      await Promise.all(
        [currentIndex, targetIndex].map(idx => 
          fetch(`/api/admin/success-stories-section/testimonials/${newTestimonials[idx].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...newTestimonials[idx],
              order: idx,
            }),
          })
        )
      );
    } catch (error) {
      console.error('Error updating testimonial order:', error);
      toast.error('Sıralama güncellenirken bir hata oluştu.');
    }
  };

  // Dil adını getir
  const getLanguageName = (code: string) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };
  
  if (!initialDataLoaded && isLoading) {
    return <p className="p-6">Success Stories Section verileri yükleniyor...</p>;
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Başarı Hikayeleri Bölümü Yönetimi</CardTitle>
          <CardDescription>
            Ana sayfa için "10,000+ Successful Treatments, Your Health in Trusted Hands" bölümünü düzenle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader><CardTitle className="text-lg">Bölüm Metinleri</CardTitle></CardHeader>
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
                          <Label htmlFor={`translations.${index}.title`}>Ana Başlık</Label>
                          <Controller
                            name={`translations.${index}.title`}
                            control={control}
                            render={({ field }) => (
                              <div>
                                <Input
                                  {...field}
                                  placeholder="10,000+ Successful Treatments, Your Health in Trusted Hands"
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
                          <Label htmlFor={`translations.${index}.description`}>Açıklama</Label>
                          <Controller
                            name={`translations.${index}.description`}
                            control={control}
                            render={({ field }) => (
                              <div>
                                <Textarea
                                  {...field}
                                  rows={4}
                                  placeholder="Thousands of patients have trusted Celyxmed for life-changing treatments..."
                                  className={item.languageCode === activeTab && formErrors.description ? "border-red-500" : ""}
                                />
                                {item.languageCode === activeTab && formErrors.description && (
                                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`translations.${index}.consultButtonText`}>Konsültasyon Buton Metni</Label>
                            <Controller
                              name={`translations.${index}.consultButtonText`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="Book Your Free Consultation"
                                />
                              )}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.consultButtonLink`}>Konsültasyon Buton Linki</Label>
                            <Controller
                              name={`translations.${index}.consultButtonLink`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="/contact"
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`translations.${index}.discoverButtonText`}>Keşfet Buton Metni</Label>
                            <Controller
                              name={`translations.${index}.discoverButtonText`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="Discover Success Stories"
                                />
                              )}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.discoverButtonLink`}>Keşfet Buton Linki</Label>
                            <Controller
                              name={`translations.${index}.discoverButtonLink`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="/success-stories"
                                />
                              )}
                            />
                          </div>
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
              {isLoading ? 'Kaydediliyor...' : 'Bölüm Metinlerini Kaydet'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Galeri Resimleri Bölümü */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between">
            <div>
              <CardTitle>Galeri Görselleri Yönetimi</CardTitle>
              <CardDescription>
                Başarı Hikayeleri otomatik kaydırmalı galeri görselleri
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mb-6">
              <Label htmlFor="galleryImageUpload">Yeni Görsel Ekle</Label>
              <div className="mt-2">
                <ImageUpload
                  onImageUploaded={handleImageUpload}
                  buttonText="Galeri Görseli Yükle"
                  uploadFolder="success-stories"
                  showPreview={false}
                />
              </div>
            </div>

            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((image, index) => (
                  <div key={image.id} className="relative group border rounded-lg overflow-hidden">
                    <div className="aspect-[3/4] relative">
                      <img
                        src={image.imageUrl}
                        alt={image.altText || `Galeri görsel ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-white hover:bg-black/30"
                        onClick={() => moveGalleryImage(image.id, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-black/30"
                        onClick={() => moveGalleryImage(image.id, 'down')}
                        disabled={index === galleryImages.length - 1}
                      >
                        <MoveDown className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-white hover:bg-red-500/80"
                        onClick={() => {
                          setDeletingImageId(image.id);
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg text-gray-500">
                Henüz galeri görseli bulunmuyor. Eklemek için yukarıdaki "Galeri Görseli Yükle" butonunu kullanın.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Bölümü */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between">
            <div>
              <CardTitle>Hasta Yorumları Yönetimi</CardTitle>
              <CardDescription>
                Başarı Hikayeleri bölümünde görüntülenen hasta yorumları
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                setSelectedTestimonial(null);
                setIsEditDialogOpen(true);
              }}
              variant="outline" 
              className="mt-4 sm:mt-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Yeni Yorum Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testimonials.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">Yıldız</TableHead>
                  <TableHead>Hasta</TableHead>
                  <TableHead className="hidden md:table-cell">Tedavi</TableHead>
                  <TableHead className="w-24 text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial, index) => {
                  // Aktif dildeki çeviriyi bul
                  const activeTranslation = testimonial.translations.find(t => t.languageCode === activeTab);
                  const author = activeTranslation?.author || testimonial.translations[0]?.author || 'Çeviri Yok';
                  const treatment = activeTranslation?.treatment || testimonial.translations[0]?.treatment || '';
                  
                  return (
                    <TableRow key={testimonial.id}>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {[...Array(testimonial.stars)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {testimonial.imageUrl && (
                            <div className="h-10 w-10 rounded-full overflow-hidden">
                              <img
                                src={testimonial.imageUrl}
                                alt={author}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{author}</div>
                            {!activeTranslation && (
                              <div className="text-xs text-gray-500">
                                ({getLanguageName(testimonial.translations[0]?.languageCode || '')})
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {treatment}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => moveTestimonial(testimonial.id, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveTestimonial(testimonial.id, 'down')}
                            disabled={index === testimonials.length - 1}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedTestimonial(testimonial);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setDeletingTestimonialId(testimonial.id);
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
              Henüz hasta yorumu bulunmuyor. Eklemek için "Yeni Yorum Ekle" butonunu kullanın.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resim Silme Alert Dialog */}
      <AlertDialog open={!!deletingImageId} onOpenChange={(open) => !open && setDeletingImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Görseli silmek istediğinizden emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Görsel kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingImage}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteGalleryImage}
              disabled={isDeletingImage}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingImage ? 'Siliniyor...' : 'Evet, Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Testimonial Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>{selectedTestimonial ? 'Yorumu Düzenle' : 'Yeni Yorum Ekle'}</DialogTitle>
            <DialogDescription>
              Hasta yorumu detaylarını ve farklı dillerdeki çevirilerini düzenleyin
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTestimonialSubmit(onSaveTestimonial)} className="space-y-4">
            {/* Hidden ID field */}
            <input type="hidden" {...registerTestimonial('id')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stars" className="text-base font-medium mb-1 block">Yıldız Sayısı</Label>
                <Controller
                  name="stars"
                  control={testimonialControl}
                  render={({ field }) => (
                    <div className="flex items-center mt-1 border rounded-md p-3 bg-gray-50">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              field.value >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                />
                <p className="text-gray-500 text-xs mt-1">Yorum için 1-5 arası yıldız sayısı seçin</p>
              </div>

              <div>
                <Label htmlFor="imageUrl" className="text-base font-medium mb-1 block">Hasta Fotoğrafı</Label>
                <Controller
                  name="imageUrl"
                  control={testimonialControl}
                  render={({ field }) => (
                    <div className="border rounded-md p-3 bg-gray-50">
                      {field.value ? (
                        <div className="relative mb-2 mx-auto">
                          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white shadow-md mb-2">
                            <img
                              src={field.value}
                              alt="Hasta fotoğrafı"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => field.onChange("")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            <XCircle className="h-6 w-6" />
                          </button>
                        </div>
                      ) : null}
                      <ImageUpload
                        onImageUploaded={(url) => field.onChange(url)}
                        initialImage={field.value}
                        showPreview={false}
                        buttonText={field.value ? "Fotoğrafı Değiştir" : "Fotoğraf Yükle"}
                        uploadFolder="success-stories/avatars"
                        className="w-full"
                      />
                      <p className="text-gray-500 text-xs mt-1 text-center">Fotoğraf yüklemek isteğe bağlıdır</p>
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <h3 className="text-base font-medium flex items-center">
                <span>Farklı Dillerdeki İçerikler</span>
                <div className="relative ml-2 group">
                  <div className="cursor-help text-blue-500 hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-64 p-2 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Her dil için yorum içeriğini ayrı ayrı düzenleyebilirsiniz. En az bir dil için içerik girmelisiniz.
                  </div>
                </div>
              </h3>

              <div className="border rounded-lg overflow-hidden">
                <Tabs defaultValue={activeTab} className="w-full">
                  <TabsList className="w-full flex justify-start overflow-x-auto p-0 bg-gray-100 border-b">
                    {availableLanguages.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code} className="flex-1">
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Dil sekmeleri */}
                  {availableLanguages.map((lang, langIndex) => {
                    // Bu dil için form alanını bul
                    const translationIndex = testimonialTranslationsFields.findIndex(
                      field => (field as any).languageCode === lang.code
                    );

                    const fieldIndex = translationIndex >= 0 ? translationIndex : langIndex;

                    return (
                      <TabsContent key={lang.code} value={lang.code} className="p-4 space-y-4">
                        <input
                          type="hidden"
                          {...registerTestimonial(`translations.${fieldIndex}.languageCode`)}
                          value={lang.code}
                        />

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`translations.${fieldIndex}.text`} className="font-medium">
                              Yorum Metni <span className="text-red-500">*</span>
                            </Label>
                            <span className="text-xs text-gray-500">Hastanın yorumunu girin</span>
                          </div>
                          <Controller
                            name={`translations.${fieldIndex}.text`}
                            control={testimonialControl}
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                rows={2}
                                placeholder="Celyxmed'de aldığım tedavi hakkındaki düşüncelerim..."
                                className={testimonialErrors.translations?.[fieldIndex]?.text ? "border-red-500 focus-visible:ring-red-500" : ""}
                              />
                            )}
                          />
                          {testimonialErrors.translations?.[fieldIndex]?.text && (
                            <p className="text-red-500 text-sm">
                              {(testimonialErrors.translations[fieldIndex].text as any)?.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`translations.${fieldIndex}.author`} className="font-medium">
                                Hasta Adı ve Ülkesi <span className="text-red-500">*</span>
                              </Label>
                              <span className="text-xs text-gray-500">Hasta adı ve ülke emoji</span>
                            </div>
                            <Controller
                              name={`translations.${fieldIndex}.author`}
                              control={testimonialControl}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="Emily A. (United Kingdom 🇬🇧)"
                                  className={testimonialErrors.translations?.[fieldIndex]?.author ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                              )}
                            />
                            {testimonialErrors.translations?.[fieldIndex]?.author && (
                              <p className="text-red-500 text-sm">
                                {(testimonialErrors.translations[fieldIndex].author as any)?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`translations.${fieldIndex}.treatment`} className="font-medium">
                                Tedavi Adı <span className="text-red-500">*</span>
                              </Label>
                              <span className="text-xs text-gray-500">Hastanın aldığı tedavi</span>
                            </div>
                            <Controller
                              name={`translations.${fieldIndex}.treatment`}
                              control={testimonialControl}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="Saç Ekimi / Hair Transplant"
                                  className={testimonialErrors.translations?.[fieldIndex]?.treatment ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                              )}
                            />
                            {testimonialErrors.translations?.[fieldIndex]?.treatment && (
                              <p className="text-red-500 text-sm">
                                {(testimonialErrors.translations[fieldIndex].treatment as any)?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <span className="text-red-500">*</span> işaretli alanlar zorunludur
                          </div>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>
            </div>

            <DialogFooter className="mt-4 flex gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 md:flex-none"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 md:flex-none gap-1"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Yorumu Kaydet
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Testimonial Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yorumu silmek istediğinizden emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Yorum ve tüm çevirileri kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTestimonial}
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

export default SuccessStoriesSectionAdminPage;