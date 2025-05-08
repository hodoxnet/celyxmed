'use client';

import React, { useEffect, useState } from 'react';
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
import { Language } from '@/generated/prisma/client'; // Prisma'dan Language tipini import ediyoruz
import ImageUpload from '@/components/admin/image-upload'; // Mevcut ImageUpload componentini kullanacağız

// Zod şemaları (API ile aynı olmalı, gerekirse import edilebilir)
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
  id: z.string().optional(), // ID alanı formda olmayacak ama veriyle gelebilir
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
    reset,
    setValue,
    formState: { errors },
  } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingSchemaClient),
    defaultValues: {
      translations: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
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
        
        // Her aktif dil için bir çeviri nesnesi olduğundan emin olalım
        const processedTranslations = activeLanguages.map(lang => {
          const existingTranslation = settingsDataFromApi?.translations?.find(t => t.languageCode === lang.code);
          return existingTranslation || {
            languageCode: lang.code,
            headerButtonText: '',
            headerButtonLink: '',
            socialYoutubeUrl: '',
            socialInstagramUrl: '',
            socialTiktokUrl: '',
            socialFacebookUrl: '',
            socialLinkedinUrl: '',
            copyrightText: '',
            stickyButtonText: '',
            stickyButtonLink: '',
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
          translations: processedTranslations,
        };
        
        reset(dataToReset);

        // Aktif sekmeyi ayarla
        if (activeLanguages.length > 0) {
          const defaultLang = activeLanguages.find(lang => lang.isDefault);
          if (defaultLang) {
            setActiveTab(defaultLang.code);
          } else {
            // processedTranslations'daki ilk dilin kodunu kullan (fields henüz güncellenmemiş olabilir)
            setActiveTab(processedTranslations.length > 0 ? processedTranslations[0].languageCode : activeLanguages[0].code);
          }
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
  }, [reset]);

  // Form verilerini API'ye gönder
  const onSubmit = async (data: GeneralSettingsFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/general-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ayarlar kaydedilemedi.');
      }
      toast.success('Genel ayarlar başarıyla kaydedildi!');
      const savedData = await response.json();
      reset(savedData); // Formu sunucudan gelen son veriyle güncelle
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!initialDataLoaded && isLoading) {
    return <p>Ayarlar yükleniyor...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Genel Site Ayarları</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Dile Özgü Alanlar (Tabs içinde) */}
          {initialDataLoaded && availableLanguages.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Dil Bazlı Ayarlar</CardTitle></CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  key={activeTab || 'no-tabs'} // activeTab değiştiğinde yeniden render'ı tetikle
                >
                  <TabsList>
                    {availableLanguages.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code}>
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {fields.map((item, index) => (
                    <TabsContent key={item.id} value={item.languageCode} className="space-y-4 pt-4">
                      <input type="hidden" {...control.register(`translations.${index}.languageCode`)} />
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
          )}

          {/* Dil Bağımsız Alanlar */}
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

          {/* Dile Özgü Alanlar (Tabs içinde) */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Dil Bazlı Ayarlar</CardTitle></CardHeader>
            <CardContent>
              <Tabs 
                defaultValue={
                  fields.length > 0 
                    ? availableLanguages.find(lang => lang.isDefault)?.code || fields[0]?.languageCode 
                    : undefined
                }
              >
                <TabsList>
                  {availableLanguages.map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code}>
                      {lang.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {fields.map((item, index) => (
                  <TabsContent key={item.id} value={item.languageCode} className="space-y-4 pt-4">
                    <input type="hidden" {...control.register(`translations.${index}.languageCode`)} />
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsPage;
