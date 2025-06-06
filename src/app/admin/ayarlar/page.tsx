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
import ImageUpload from '@/components/admin/image-upload'; 
import Image from 'next/image'; 

// Zod şemaları (Sadece Genel Ayarlar için)
const generalSettingTranslationSchemaClient = z.object({
  languageCode: z.string().min(1),
  headerButtonText: z.string().optional().nullable(),
  headerButtonLink: z.string().optional().nullable(),
  socialYoutubeUrl: z.string().optional().nullable(),
  socialInstagramUrl: z.string().optional().nullable(),
  socialTiktokUrl: z.string().optional().nullable(),
  socialFacebookUrl: z.string().optional().nullable(),
  socialLinkedinUrl: z.string().optional().nullable(),
  copyrightText: z.string().optional().nullable(),
  stickyButtonText: z.string().optional().nullable(),
  stickyButtonLink: z.string().optional().nullable(),
});

const generalSettingSchemaClient = z.object({
  id: z.string().optional(), 
  faviconUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  emailAddress: z.string().email({ message: "Geçerli bir e-posta adresi girin." }).optional().nullable().or(z.literal('')),
  fullAddress: z.string().optional().nullable(),
  googleMapsEmbed: z.string().optional().nullable(),
  translations: z.array(generalSettingTranslationSchemaClient).optional(),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingSchemaClient>; 

const GeneralSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>();

  const {
    control,
    handleSubmit,
    register, // register eklendi (hidden input için)
    reset,
    formState: { errors },
  } = useForm<GeneralSettingsFormData>({ 
    resolver: zodResolver(generalSettingSchemaClient),
    defaultValues: {
      translations: [],
    },
  });

  const { fields: generalTranslationsFields } = useFieldArray({
    control,
    name: "translations",
  });

  // Mevcut dilleri ve ayarları yükle
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const langRes = await fetch('/api/languages');
        const allLangs: Language[] = await langRes.json();
        const activeLanguages = allLangs.filter(lang => lang.isActive);
        setAvailableLanguages(activeLanguages);

        const settingsRes = await fetch('/api/admin/general-settings');
        const settingsDataFromApi: GeneralSettingsFormData | null = await settingsRes.json(); 
        
        const processedGeneralTranslations = activeLanguages.map(lang => {
          const existingTranslation = settingsDataFromApi?.translations?.find(t => t.languageCode === lang.code);
          return existingTranslation || {
            languageCode: lang.code,
            headerButtonText: null,
            headerButtonLink: null,
            socialYoutubeUrl: null,
            socialInstagramUrl: null,
            socialTiktokUrl: null,
            socialFacebookUrl: null,
            socialLinkedinUrl: null,
            copyrightText: null,
            stickyButtonText: null,
            stickyButtonLink: null,
          };
        });

        const dataToReset: GeneralSettingsFormData = { 
          id: settingsDataFromApi?.id, 
          faviconUrl: settingsDataFromApi?.faviconUrl || null,
          logoUrl: settingsDataFromApi?.logoUrl || null,
          whatsappNumber: settingsDataFromApi?.whatsappNumber || null,
          phoneNumber: settingsDataFromApi?.phoneNumber || null,
          emailAddress: settingsDataFromApi?.emailAddress || null,
          fullAddress: settingsDataFromApi?.fullAddress || null,
          googleMapsEmbed: settingsDataFromApi?.googleMapsEmbed || null,
          translations: processedGeneralTranslations,
        };
        
        reset(dataToReset);

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
  }, [reset, activeTab]); // activeTab bağımlılığı eklendi

  // Form verilerini API'ye gönder
  const onSubmit = async (data: GeneralSettingsFormData) => { 
    setIsLoading(true);
    try {
      const generalSettingsPayload = {
        faviconUrl: data.faviconUrl,
        logoUrl: data.logoUrl,
        whatsappNumber: data.whatsappNumber,
        phoneNumber: data.phoneNumber,
        emailAddress: data.emailAddress,
        fullAddress: data.fullAddress,
        googleMapsEmbed: data.googleMapsEmbed,
        translations: data.translations,
      };
      const settingsResponse = await fetch('/api/admin/general-settings', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generalSettingsPayload),
      });
      if (!settingsResponse.ok) {
        const errorData = await settingsResponse.json();
        throw new Error(errorData.message || 'Genel ayarlar kaydedilemedi.');
      }
      const savedSettings = await settingsResponse.json();
      toast.success('Genel ayarlar başarıyla kaydedildi!');

      reset(savedSettings);

    } catch (error: any) {
      toast.error(`Kaydetme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!initialDataLoaded && isLoading) {
    return <p className="p-6">Ayarlar yükleniyor...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Genel Site Ayarları</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Sol Sütun: Temel Bilgiler */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Temel Bilgiler</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="faviconUrl">Favicon Yükle</Label>
                    <Controller
                      name="faviconUrl"
                      control={control}
                      render={({ field }) => (
                        <ImageUpload
                          initialImage={field.value || ''}
                          onImageUploaded={(url: string) => field.onChange(url)}
                          showPreview={true}
                          uploadFolder="genel" 
                        />
                      )}
                    />
                    {errors.faviconUrl && <p className="text-red-500 text-sm">{errors.faviconUrl.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="logoUrl">Logo Yükle</Label>
                    <Controller
                      name="logoUrl"
                      control={control}
                      render={({ field }) => (
                        <ImageUpload
                          initialImage={field.value || ''}
                          onImageUploaded={(url: string) => field.onChange(url)}
                          showPreview={true}
                          uploadFolder="genel" 
                        />
                      )}
                    />
                    {errors.logoUrl && <p className="text-red-500 text-sm">{errors.logoUrl.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="whatsappNumber">WhatsApp Numarası</Label>
                    <Controller name="whatsappNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                    {errors.whatsappNumber && <p className="text-red-500 text-sm">{errors.whatsappNumber.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Telefon Numarası</Label>
                    <Controller name="phoneNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                    {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="emailAddress">E-posta Adresi</Label>
                    <Controller name="emailAddress" control={control} render={({ field }) => <Input type="email" {...field} value={field.value || ''} />} />
                    {errors.emailAddress && <p className="text-red-500 text-sm">{errors.emailAddress.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="fullAddress">Açık Adres</Label>
                    <Controller name="fullAddress" control={control} render={({ field }) => <Textarea {...field} value={field.value || ''} />} />
                    {errors.fullAddress && <p className="text-red-500 text-sm">{errors.fullAddress.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="googleMapsEmbed">Google Maps Embed Kodu</Label>
                    <Controller name="googleMapsEmbed" control={control} render={({ field }) => <Textarea {...field} value={field.value || ''} placeholder='<iframe src="..."></iframe>' />} />
                    {errors.googleMapsEmbed && <p className="text-red-500 text-sm">{errors.googleMapsEmbed.message}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sağ Sütun: Dil Bazlı Ayarlar */}
            <div className="lg:col-span-2 space-y-6">
              {initialDataLoaded && availableLanguages.length > 0 ? (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Dil Bazlı Ayarlar</CardTitle></CardHeader>
                  <CardContent>
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      key={activeTab || 'no-tabs-yet'} 
                    >
                      <TabsList>
                        {availableLanguages.map((lang) => (
                          <TabsTrigger key={lang.code} value={lang.code}>
                            {lang.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {generalTranslationsFields.map((item, index) => ( 
                        <TabsContent key={item.id} value={item.languageCode} className="space-y-4 pt-4">
                          <input type="hidden" {...register(`translations.${index}.languageCode`)} />
                          <h3 className="font-semibold text-md mb-2">Header Butonu</h3>
                          <div>
                            <Label htmlFor={`translations.${index}.headerButtonText`}>Header Buton Metni</Label>
                            <Controller name={`translations.${index}.headerButtonText`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.headerButtonLink`}>Header Buton Linki</Label>
                            <Controller name={`translations.${index}.headerButtonLink`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>

                          <h3 className="font-semibold text-md mb-2 mt-6">Sosyal Medya Linkleri</h3>
                          <div>
                            <Label htmlFor={`translations.${index}.socialYoutubeUrl`}>YouTube Linki</Label>
                            <Controller name={`translations.${index}.socialYoutubeUrl`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.socialInstagramUrl`}>Instagram Linki</Label>
                            <Controller name={`translations.${index}.socialInstagramUrl`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.socialTiktokUrl`}>TikTok Linki</Label>
                            <Controller name={`translations.${index}.socialTiktokUrl`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.socialFacebookUrl`}>Facebook Linki</Label>
                            <Controller name={`translations.${index}.socialFacebookUrl`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.socialLinkedinUrl`}>LinkedIn Linki</Label>
                            <Controller name={`translations.${index}.socialLinkedinUrl`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>

                          <h3 className="font-semibold text-md mb-2 mt-6">Footer</h3>
                          <div>
                            <Label htmlFor={`translations.${index}.copyrightText`}>Copyright Metni</Label>
                            <Controller name={`translations.${index}.copyrightText`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>

                          <h3 className="font-semibold text-md mb-2 mt-6">Sticky İletişim Butonu</h3>
                          <div>
                            <Label htmlFor={`translations.${index}.stickyButtonText`}>Buton Metni</Label>
                            <Controller name={`translations.${index}.stickyButtonText`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>
                          <div>
                            <Label htmlFor={`translations.${index}.stickyButtonLink`}>Buton Linki</Label>
                            <Controller name={`translations.${index}.stickyButtonLink`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                 <p>Aktif dil bulunamadı.</p>
              )}
              
              {/* Hero Alanı Kartı kaldırıldı */}

            </div>
          </div> {/* Grid sonu */}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsPage;
