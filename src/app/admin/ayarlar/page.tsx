'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form'; // useWatch eklendi
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
import { Trash2, GripVertical } from 'lucide-react'; // İkonlar eklendi
import { Switch } from '@/components/ui/switch'; // Switch eklendi
import Image from 'next/image'; // Image importu eklendi

// Zod şemaları (API ile aynı olmalı, gerekirse import edilebilir)

// Hero Alanı Çevirisi Şeması
const heroContentTranslationSchemaClient = z.object({
  languageCode: z.string().min(1),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  button1Text: z.string().optional().nullable(),
  button1Link: z.string().optional().nullable().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }),
  button2Text: z.string().optional().nullable(),
  button2Link: z.string().optional().nullable().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }),
});

// Hero Alanı Resim Şeması
const heroBackgroundImageSchemaClient = z.object({
  id: z.string().optional(), // Mevcut resimler için ID
  imageUrl: z.string().min(1, "Resim URL'si gereklidir"),
  order: z.number().int().nonnegative(), // .default(0) kaldırıldı
  isActive: z.boolean(), // .default(true) kaldırıldı
});

// Genel Ayarlar Çevirisi Şeması
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
  // Yeni Hero Alanı alanları
  heroContentTranslations: z.array(heroContentTranslationSchemaClient).optional(),
  heroImages: z.array(heroBackgroundImageSchemaClient).optional(),
});

// Form Veri Tipi (GeneralSettingsFormData yerine daha genel bir isim)
type SettingsFormData = z.infer<typeof generalSettingSchemaClient>; 

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
  } = useForm<SettingsFormData>({ // Tip güncellendi
    resolver: zodResolver(generalSettingSchemaClient),
    defaultValues: {
      translations: [],
      heroContentTranslations: [], // Yeni default
      heroImages: [], // Yeni default
    },
  });

  // Genel Ayarlar Çevirileri için Field Array
  const { fields: generalTranslationsFields } = useFieldArray({
    control,
    name: "translations",
  });

  // Hero İçerik Çevirileri için Field Array
  const { fields: heroTranslationsFields } = useFieldArray({
    control,
    name: "heroContentTranslations",
  });

  // Hero Resimleri için Field Array
  const { fields: heroImageFields, append: appendHeroImage, remove: removeHeroImage, move: moveHeroImage } = useFieldArray({
    control,
    name: "heroImages",
  });


  // Form state'ini izlemek için (opsiyonel, debug için kalabilir)
  // const watchedTranslations = useWatch({ control, name: 'translations' });
  // const watchedHeroTranslations = useWatch({ control, name: 'heroContentTranslations' });
  // const watchedHeroImages = useWatch({ control, name: 'heroImages' });
  // console.log("Render - General Fields length:", generalTranslationsFields.length);
  // console.log("Render - Hero Trans Fields length:", heroTranslationsFields.length);
  // console.log("Render - Hero Image Fields length:", heroImageFields.length);
  console.log("Render - Active Tab:", activeTab);
  console.log("Render - Available Languages:", availableLanguages.length);
  console.log("Render - Initial Data Loaded:", initialDataLoaded);


  // Mevcut dilleri ve ayarları yükle
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const langRes = await fetch('/api/languages');
        const allLangs: Language[] = await langRes.json();
        const activeLanguages = allLangs.filter(lang => lang.isActive);
        setAvailableLanguages(activeLanguages);

        // Genel Ayarları Getir
        const settingsRes = await fetch('/api/admin/general-settings');
        const settingsDataFromApi: SettingsFormData | null = await settingsRes.json(); // Tip güncellendi
        
        // Hero İçeriğini Getir
        const heroRes = await fetch('/api/admin/hero-content');
        const heroDataFromApi: { translations: any[], images: any[] } | null = await heroRes.json();

        // Genel Ayarlar Çevirilerini İşle
        const processedGeneralTranslations = activeLanguages.map(lang => {
          const existingTranslation = settingsDataFromApi?.translations?.find(t => t.languageCode === lang.code);
          return existingTranslation || {
            languageCode: lang.code,
            // Diğer genel ayar çeviri alanları için varsayılanlar...
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

        // Hero İçerik Çevirilerini İşle
        const processedHeroTranslations = activeLanguages.map(lang => {
          const existingTranslation = heroDataFromApi?.translations?.find(t => t.languageCode === lang.code);
          return existingTranslation || {
            languageCode: lang.code,
            title: null,
            description: null,
            button1Text: null,
            button1Link: null,
            button2Text: null,
            button2Link: null,
          };
        });

        // Hero Resimlerini İşle (API'den geldiği gibi alalım)
        const processedHeroImages = heroDataFromApi?.images || [];


        const dataToReset: SettingsFormData = { // Tip güncellendi
          // Genel Ayarlar
          id: settingsDataFromApi?.id, // Bu ID aslında gereksiz olabilir formda
          faviconUrl: settingsDataFromApi?.faviconUrl || null,
          logoUrl: settingsDataFromApi?.logoUrl || null,
          whatsappNumber: settingsDataFromApi?.whatsappNumber || null,
          phoneNumber: settingsDataFromApi?.phoneNumber || null,
          emailAddress: settingsDataFromApi?.emailAddress || null,
          fullAddress: settingsDataFromApi?.fullAddress || null,
          googleMapsEmbed: settingsDataFromApi?.googleMapsEmbed || null,
          translations: processedGeneralTranslations,
          // Hero Alanı
          heroContentTranslations: processedHeroTranslations,
          heroImages: processedHeroImages,
        };
        
        reset(dataToReset);
        // console.log("useEffect - Reset called with data:", dataToReset);

        // Aktif sekmeyi ayarla (Genel Ayarlar ve Hero için ayrı sekmeler olacak)
        if (activeLanguages.length > 0 && !activeTab) { // Sadece başlangıçta ayarla
             const defaultLang = activeLanguages.find(lang => lang.isDefault);
             setActiveTab(defaultLang?.code || activeLanguages[0].code);
             // console.log("useEffect - Setting active tab:", defaultLang?.code || activeLanguages[0].code);
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

  // Form verilerini API'lere gönder
  const onSubmit = async (data: SettingsFormData) => { // Tip güncellendi
    setIsLoading(true);
    try {
      // 1. Genel Ayarları Kaydet
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
        method: 'POST', // Bu API PUT olmalıydı ama mevcut kod POST kullanıyor, şimdilik bırakalım
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generalSettingsPayload),
      });
      if (!settingsResponse.ok) {
        const errorData = await settingsResponse.json();
        throw new Error(errorData.message || 'Genel ayarlar kaydedilemedi.');
      }
      const savedSettings = await settingsResponse.json();
      toast.success('Genel ayarlar başarıyla kaydedildi!');

      // 2. Hero İçeriğini Kaydet
      const heroContentPayload = {
        translations: data.heroContentTranslations,
        images: data.heroImages,
      };
      const heroResponse = await fetch('/api/admin/hero-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroContentPayload),
      });
       if (!heroResponse.ok) {
        const errorData = await heroResponse.json();
        throw new Error(errorData.message || 'Hero alanı kaydedilemedi.');
      }
      const savedHeroContent = await heroResponse.json();
      toast.success('Ana sayfa hero alanı başarıyla kaydedildi!');

      // Formu birleştirilmiş son veriyle güncelle (dikkatli olmalı)
      reset({
        ...savedSettings, // Genel ayarlar
        heroContentTranslations: savedHeroContent.translations, // Hero çevirileri
        heroImages: savedHeroContent.images, // Hero resimleri
      });

    } catch (error: any) {
      toast.error(`Kaydetme hatası: ${error.message}`);
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
                          uploadFolder="genel" // Klasör belirtildi
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
                          uploadFolder="genel" // Klasör belirtildi
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
              {initialDataLoaded && availableLanguages.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Dil Bazlı Ayarlar</CardTitle></CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  key={activeTab || 'no-tabs-yet'} // Basit key
                >
                  <TabsList>
                    {availableLanguages.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code}>
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {generalTranslationsFields.map((item, index) => ( // fields -> generalTranslationsFields
                    <TabsContent key={item.id} value={item.languageCode} className="space-y-4 pt-4">
                      {/* item tipini belirtmek daha iyi olurdu ama şimdilik any kalabilir */}
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
              
              {/* Yeni Kart: Ana Sayfa Hero Alanı */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Ana Sayfa Hero Alanı</CardTitle></CardHeader>
                <CardContent>
                  {/* Hero Alanı Dil Bazlı Metinler */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList>
                      {availableLanguages.map((lang) => (
                        <TabsTrigger key={lang.code} value={lang.code}>
                          {lang.name} İçerik
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {heroTranslationsFields.map((item, index) => (
                      <TabsContent key={item.id} value={item.languageCode} className="space-y-4 pt-4">
                        <input type="hidden" {...control.register(`heroContentTranslations.${index}.languageCode`)} />
                        <div>
                          <Label htmlFor={`heroContentTranslations.${index}.title`}>Başlık</Label>
                          <Controller name={`heroContentTranslations.${index}.title`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                        </div>
                        <div>
                          <Label htmlFor={`heroContentTranslations.${index}.description`}>Açıklama</Label>
                          <Controller name={`heroContentTranslations.${index}.description`} control={control} render={({ field }) => <Textarea {...field} value={field.value || ''} />} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`heroContentTranslations.${index}.button1Text`}>Buton 1 Metni</Label>
                            <Controller name={`heroContentTranslations.${index}.button1Text`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>
                          <div>
                            <Label htmlFor={`heroContentTranslations.${index}.button1Link`}>Buton 1 Linki</Label>
                            <Controller name={`heroContentTranslations.${index}.button1Link`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="/link veya https://..." />} />
                          </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`heroContentTranslations.${index}.button2Text`}>Buton 2 Metni</Label>
                            <Controller name={`heroContentTranslations.${index}.button2Text`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                          </div>
                          <div>
                            <Label htmlFor={`heroContentTranslations.${index}.button2Link`}>Buton 2 Linki</Label>
                            <Controller name={`heroContentTranslations.${index}.button2Link`} control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="/link veya https://..." />} />
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  {/* Hero Alanı Arka Plan Resimleri */}
                  <div>
                    <h3 className="font-semibold text-md mb-4">Arka Plan Resimleri</h3>
                    <div className="space-y-4">
                      {heroImageFields.map((imageField, index) => (
                        <div key={imageField.id} className="flex items-center gap-4 p-3 border rounded">
                           {/* Sıralama için sürükle ikonu (fonksiyonellik eklenmedi) */}
                           {/* <GripVertical className="cursor-grab text-gray-400" />  */}
                           
                           <input type="hidden" {...control.register(`heroImages.${index}.order`)} value={index} /> {/* Sırayı indekse göre ayarla */}

                           <div className="w-20 h-12 relative flex-shrink-0">
                             <Controller
                                name={`heroImages.${index}.imageUrl`}
                                control={control}
                                render={({ field }) => (
                                  field.value ? (
                                    <Image src={field.value} alt={`Hero Resmi ${index + 1}`} fill style={{ objectFit: 'cover' }} className="rounded" /> // layout="fill" objectFit="cover" yerine fill ve style
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">Resim Yok</div>
                                  )
                                )}
                              />
                           </div>
                           
                           <div className="flex-grow">
                             {/* Resim URL'sini göstermek yerine doğrudan yükleme/değiştirme butonu daha iyi olabilir */}
                             <Controller
                                name={`heroImages.${index}.imageUrl`}
                                control={control}
                                render={({ field }) => (
                                  <ImageUpload
                                    initialImage={field.value || ''}
                                    onImageUploaded={(url) => {
                                      setValue(`heroImages.${index}.imageUrl`, url, { shouldDirty: true });
                                    }}
                                    showPreview={false} // Önizleme yukarıda zaten var
                                    buttonText="Resmi Değiştir"
                                    className="w-full"
                                    uploadFolder="hero" // Klasör belirtildi
                                  />
                                )}
                              />
                           </div>

                           <div className="flex items-center gap-2 flex-shrink-0">
                             <Controller
                                name={`heroImages.${index}.isActive`}
                                control={control}
                                render={({ field }) => (
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    aria-label="Resim Aktif mi?"
                                  />
                                )}
                              />
                             <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeHeroImage(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => appendHeroImage({ imageUrl: '', order: heroImageFields.length, isActive: true })}
                    >
                      Yeni Resim Ekle
                    </Button>
                     {errors.heroImages && <p className="text-red-500 text-sm mt-1">{errors.heroImages.message || errors.heroImages.root?.message}</p>}
                  </div>

                </CardContent>
              </Card>

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
