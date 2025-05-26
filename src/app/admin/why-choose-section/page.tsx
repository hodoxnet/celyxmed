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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Language } from '@/generated/prisma/client'; 

// Zod Şemaları - Aktif dil için şema (zorunlu alanlar)
const activeTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir"),
  youtubeVideoId: z.string().min(1, "Youtube video ID'si gereklidir"),
  title: z.string().min(1, "Başlık gereklidir"),
  description: z.string().min(1, "Açıklama gereklidir"),
  primaryButtonText: z.string().min(1, "Birincil buton metni gereklidir"),
  primaryButtonLink: z.string().min(1, "Birincil buton linki gereklidir").refine(
    val => val.startsWith('/') || val.startsWith('http'),
    { message: "Link / veya http(s):// ile başlamalıdır" }
  ),
  secondaryButtonText: z.string().min(1, "İkincil buton metni gereklidir"),
  secondaryButtonLink: z.string().min(1, "İkincil buton linki gereklidir").refine(
    val => val.startsWith('/') || val.startsWith('http'),
    { message: "Link / veya http(s):// ile başlamalıdır" }
  ),
});

// Diğer diller için daha esnek şema (opsiyonel alanlar)
const otherTranslationSchema = z.object({
  languageCode: z.string().min(1, "Dil kodu gereklidir"),
  youtubeVideoId: z.string().default(""),
  title: z.string().default(""),
  description: z.string().default(""),
  primaryButtonText: z.string().default(""),
  primaryButtonLink: z.string().default(""),
  secondaryButtonText: z.string().default(""),
  secondaryButtonLink: z.string().default(""),
});

// Dinamik şema oluşturucu - activeTabLanguage'e göre validasyon
const createDynamicSchema = (activeTabLanguage: string) => {
  return z.object({
    translations: z.array(
      z.union([
        // Aktif dil için zorunlu alanlar
        activeTranslationSchema.refine(
          data => data.languageCode !== activeTabLanguage ||
                 (data.youtubeVideoId && data.title && data.description &&
                  data.primaryButtonText && data.primaryButtonLink &&
                  data.secondaryButtonText && data.secondaryButtonLink),
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

// Genel form veri tipi
type WhyChooseSectionFormData = {
  translations: Array<{
    languageCode: string;
    youtubeVideoId: string;
    title: string;
    description: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  }>;
};

const WhyChooseSectionAdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>();
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

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
  } = useForm<WhyChooseSectionFormData>({
    resolver: activeTab ? getResolver(activeTab) : undefined,
    defaultValues: {
      translations: [],
    },
    mode: "onSubmit"
  });

  // Çeviriler için Field Array
  const { fields: translationsFields } = useFieldArray({
    control,
    name: "translations",
  });

  // Mevcut dilleri ve why-choose-section ayarlarını yükle
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Dilleri Getir
        const langRes = await fetch('/api/languages');
        const allLangs: Language[] = await langRes.json();
        const activeLanguages = allLangs.filter(lang => lang.isActive);
        setAvailableLanguages(activeLanguages);

        // Why Choose Section İçeriğini Getir
        const sectionRes = await fetch('/api/admin/why-choose-section');
        const sectionData: { translations: any[] } = await sectionRes.json();

        // Çevirileri İşle
        const processedTranslations = activeLanguages.map(lang => {
          const existingTranslation = sectionData?.translations?.find(t => t.languageCode === lang.code);
          return existingTranslation || {
            languageCode: lang.code,
            youtubeVideoId: '',
            title: '',
            description: '',
            primaryButtonText: '',
            primaryButtonLink: '',
            secondaryButtonText: '',
            secondaryButtonLink: '',
          };
        });

        const dataToReset: WhyChooseSectionFormData = { 
          translations: processedTranslations,
        };
        
        reset(dataToReset);

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

  // Form verilerini API'ye gönder
  const onSubmit = async (data: WhyChooseSectionFormData) => {
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

        if (!activeTabData.youtubeVideoId) {
          setFormErrors(prev => ({ ...prev, youtubeVideoId: "YouTube Video ID alanı zorunludur" }));
          hasError = true;
        }

        if (!activeTabData.title) {
          setFormErrors(prev => ({ ...prev, title: "Başlık alanı zorunludur" }));
          hasError = true;
        }

        if (!activeTabData.description) {
          setFormErrors(prev => ({ ...prev, description: "Açıklama alanı zorunludur" }));
          hasError = true;
        }

        if (!activeTabData.primaryButtonText) {
          setFormErrors(prev => ({ ...prev, primaryButtonText: "Birincil buton metni zorunludur" }));
          hasError = true;
        }

        if (!activeTabData.primaryButtonLink) {
          setFormErrors(prev => ({ ...prev, primaryButtonLink: "Birincil buton linki zorunludur" }));
          hasError = true;
        } else if (!activeTabData.primaryButtonLink.startsWith('/') && !activeTabData.primaryButtonLink.startsWith('http')) {
          setFormErrors(prev => ({ ...prev, primaryButtonLink: "Link / veya http(s):// ile başlamalıdır" }));
          hasError = true;
        }

        if (!activeTabData.secondaryButtonText) {
          setFormErrors(prev => ({ ...prev, secondaryButtonText: "İkincil buton metni zorunludur" }));
          hasError = true;
        }

        if (!activeTabData.secondaryButtonLink) {
          setFormErrors(prev => ({ ...prev, secondaryButtonLink: "İkincil buton linki zorunludur" }));
          hasError = true;
        } else if (!activeTabData.secondaryButtonLink.startsWith('/') && !activeTabData.secondaryButtonLink.startsWith('http')) {
          setFormErrors(prev => ({ ...prev, secondaryButtonLink: "Link / veya http(s):// ile başlamalıdır" }));
          hasError = true;
        }

        if (hasError) {
          toast.error(`Lütfen ${activeTab} dili için tüm alanları doğru şekilde doldurun`);
          setIsLoading(false);
          return;
        }
      }

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

      // Formu güncel veriyle resetle
      reset({
        translations: savedData.translations,
      });

    } catch (error: any) {
      toast.error(`Kaydetme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!initialDataLoaded && isLoading) {
    return <p className="p-6">Why Choose Section verileri yükleniyor...</p>;
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Neden Celyxmed Bölümü Yönetimi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader><CardTitle className="text-lg">Bölüm İçerikleri</CardTitle></CardHeader>
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
                          <Label htmlFor={`translations.${index}.youtubeVideoId`}>YouTube Video ID</Label>
                          <Controller
                            name={`translations.${index}.youtubeVideoId`}
                            control={control}
                            render={({ field }) => (
                              <div>
                                <Input
                                  {...field}
                                  placeholder="Örn: gm_x8mMJ6i0"
                                  className={item.languageCode === activeTab && formErrors.youtubeVideoId ? "border-red-500" : ""}
                                />
                                {field.value && (
                                  <div className="mt-2 aspect-video w-full max-w-lg">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${field.value}`}
                                      className="w-full h-full rounded-lg shadow-md"
                                      allowFullScreen
                                      title="Video Önizleme"
                                    ></iframe>
                                  </div>
                                )}
                                {item.languageCode === activeTab && formErrors.youtubeVideoId && (
                                  <p className="text-red-500 text-sm mt-1">{formErrors.youtubeVideoId}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`translations.${index}.title`}>Başlık</Label>
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
                          <Label htmlFor={`translations.${index}.description`}>Açıklama</Label>
                          <Controller
                            name={`translations.${index}.description`}
                            control={control}
                            render={({ field }) => (
                              <div>
                                <Textarea
                                  {...field}
                                  rows={4}
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
                            <Label htmlFor={`translations.${index}.primaryButtonText`}>Birincil Buton Metni</Label>
                            <Controller
                              name={`translations.${index}.primaryButtonText`}
                              control={control}
                              render={({ field }) => (
                                <div>
                                  <Input
                                    {...field}
                                    className={item.languageCode === activeTab && formErrors.primaryButtonText ? "border-red-500" : ""}
                                  />
                                  {item.languageCode === activeTab && formErrors.primaryButtonText && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.primaryButtonText}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.primaryButtonLink`}>Birincil Buton Linki</Label>
                            <Controller
                              name={`translations.${index}.primaryButtonLink`}
                              control={control}
                              render={({ field }) => (
                                <div>
                                  <Input
                                    {...field}
                                    placeholder="/link veya https://..."
                                    className={item.languageCode === activeTab && formErrors.primaryButtonLink ? "border-red-500" : ""}
                                  />
                                  {item.languageCode === activeTab && formErrors.primaryButtonLink && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.primaryButtonLink}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`translations.${index}.secondaryButtonText`}>İkincil Buton Metni</Label>
                            <Controller
                              name={`translations.${index}.secondaryButtonText`}
                              control={control}
                              render={({ field }) => (
                                <div>
                                  <Input
                                    {...field}
                                    className={item.languageCode === activeTab && formErrors.secondaryButtonText ? "border-red-500" : ""}
                                  />
                                  {item.languageCode === activeTab && formErrors.secondaryButtonText && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.secondaryButtonText}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.secondaryButtonLink`}>İkincil Buton Linki</Label>
                            <Controller
                              name={`translations.${index}.secondaryButtonLink`}
                              control={control}
                              render={({ field }) => (
                                <div>
                                  <Input
                                    {...field}
                                    placeholder="/link veya https://..."
                                    className={item.languageCode === activeTab && formErrors.secondaryButtonLink ? "border-red-500" : ""}
                                  />
                                  {item.languageCode === activeTab && formErrors.secondaryButtonLink && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.secondaryButtonLink}</p>
                                  )}
                                </div>
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
              {isLoading ? 'Kaydediliyor...' : 'Neden Celyxmed Bölümünü Kaydet'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhyChooseSectionAdminPage;