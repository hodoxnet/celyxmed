"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, useMemo } from "react";
import { FormLoadingSkeleton } from "./LoadingSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Tabs importları kaldırıldı
import ImageUpload from "@/components/admin/image-upload";
import { toast } from "sonner";

// Dil verisi tipi
interface Language {
  code: string;
  name: string;
}

// Form veri tipi
export interface FeatureTabItemFormData {
  id?: string;
  value: string;
  imageUrl: string;
  order: number;
  isPublished: boolean;
  translations: Array<{
    languageCode: string;
    triggerText: string;
    tagText: string;
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  }>;
}

// Temel çeviri şeması - validasyon olmadan
const BaseTranslationSchema = z.object({
  languageCode: z.string(),
  triggerText: z.string(),
  tagText: z.string(),
  heading: z.string(),
  description: z.string(),
  buttonText: z.string(),
  buttonLink: z.string(),
});

// Çeviri koleksiyonu için aktif dil şeması
const createFeatureTabSchema = (activeLanguageCode: string) => {
  return z.object({
    value: z.string().min(1, "Sekme için benzersiz bir değer (value) gereklidir."),
    imageUrl: z.string().min(1, "Görsel URL'si gereklidir."),
    order: z.coerce.number().int().min(0),
    isPublished: z.boolean(),
    translations: z.array(BaseTranslationSchema).superRefine((data, ctx) => {
      // Aktif dil çevirisini bul
      const activeTranslation = data.find(t => t.languageCode === activeLanguageCode);
      
      if (!activeTranslation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${activeLanguageCode} dilinde çeviri gereklidir`,
          path: []
        });
        return;
      }
      
      // Sadece aktif dil için boş kontrolleri yap
      if (!activeTranslation.triggerText || activeTranslation.triggerText.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sekme başlığı gereklidir.",
          path: [data.indexOf(activeTranslation), 'triggerText']
        });
      }
      
      if (!activeTranslation.tagText || activeTranslation.tagText.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Etiket metni gereklidir.",
          path: [data.indexOf(activeTranslation), 'tagText']
        });
      }
      
      if (!activeTranslation.heading || activeTranslation.heading.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "İçerik başlığı gereklidir.",
          path: [data.indexOf(activeTranslation), 'heading']
        });
      }
      
      if (!activeTranslation.description || activeTranslation.description.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Açıklama gereklidir.",
          path: [data.indexOf(activeTranslation), 'description']
        });
      }
      
      if (!activeTranslation.buttonText || activeTranslation.buttonText.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Buton metni gereklidir.",
          path: [data.indexOf(activeTranslation), 'buttonText']
        });
      }
      
      if (!activeTranslation.buttonLink || activeTranslation.buttonLink.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Buton linki gereklidir.",
          path: [data.indexOf(activeTranslation), 'buttonLink']
        });
      }
    }),
  });
};

// Statik schema yerine dinamik schema kullanacağız
type FeatureTabItemFormValues = z.infer<ReturnType<typeof createFeatureTabSchema>>;

// Artık dinamik schema kullanıyoruz, bu satır kaldırıldı

interface OzellikSekmesiFormuProps {
  initialData?: FeatureTabItemFormData | null;
  languages: Language[];
  activeLanguageCode: string; // Eklendi
  onSubmitSuccess: () => void;
  onCancel: () => void;
  itemIdToEdit?: string | null;
}

export default function OzellikSekmesiFormu({
  initialData: passedInitialData,
  languages,
  activeLanguageCode, // Eklendi
  onSubmitSuccess,
  onCancel,
  itemIdToEdit,
}: OzellikSekmesiFormuProps) {
  // activeLangTab state'i kaldırıldı, activeLanguageCode prop'u kullanılacak
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalInitialData, setInternalInitialData] = useState(passedInitialData);
  const [isLoadingData, setIsLoadingData] = useState(false);


  const defaultTranslations = useMemo(() => languages.map(lang => ({
    languageCode: lang.code,
    triggerText: "",
    tagText: "",
    heading: "",
    description: "",
    buttonText: "",
    buttonLink: "",
  })), [languages]); // languages bağımlılığı eklendi

  const form = useForm<FeatureTabItemFormValues>({
    resolver: zodResolver(createFeatureTabSchema(activeLanguageCode)),
    defaultValues: {
        value: "",
        imageUrl: "",
        order: 0,
        isPublished: true,
        translations: defaultTranslations,
      },
  });
  
  // Form durumunu debug etmek için
  const formState = form.formState;
  useEffect(() => {
    console.log("Form durumu:", {
      isDirty: formState.isDirty,
      isValid: formState.isValid,
      errors: formState.errors
    });
  }, [formState.isDirty, formState.isValid, formState.errors]);
  
  // Aktif dil değiştiğinde resolver'i güncelle
  useEffect(() => {
    form.clearErrors();
    form.setFocus(`translations.${languages.findIndex(l => l.code === activeLanguageCode)}.triggerText`);
  }, [activeLanguageCode, form, languages]);

  const { fields } = useFieldArray({ // append, remove burada kullanılmayacak, form.reset ile yönetilecek
    control: form.control,
    name: "translations",
  });

  useEffect(() => {
    const loadDataForEdit = async () => {
      if (itemIdToEdit) {
        setIsLoadingData(true);
        try {
          const response = await fetch(`/api/admin/home-page-feature-tabs/items/${itemIdToEdit}`);
          if (!response.ok) {
            throw new Error('Sekme verisi yüklenemedi.');
          }
          const data: FeatureTabItemFormData = await response.json();
          setInternalInitialData(data);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Veri yüklenirken hata.');
          console.error("Düzenleme için veri yükleme hatası:", error);
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setInternalInitialData(null); // Yeni ekleme modu için initialData'yı sıfırla
      }
    };
    loadDataForEdit();
  }, [itemIdToEdit]);


  useEffect(() => {
    if (internalInitialData) {
      form.reset({
        ...internalInitialData,
        order: internalInitialData.order ?? 0,
        isPublished: internalInitialData.isPublished ?? true,
        translations: languages.map(lang => {
            const existingTranslation = internalInitialData.translations.find(t => t.languageCode === lang.code);
            return existingTranslation || defaultTranslations.find(dt => dt.languageCode === lang.code)!;
          }),
      });
    } else {
        form.reset({ // Yeni kayıt için formu sıfırla
            value: "",
            imageUrl: "",
            order: 0,
            isPublished: true,
            translations: defaultTranslations,
        });
    }
  }, [internalInitialData, languages, defaultTranslations]); // form.reset dependency kaldırıldı


  const onSubmitApi = async (data: z.infer<ReturnType<typeof createFeatureTabSchema>>) => {
    setIsSubmitting(true);
    const method = internalInitialData?.id ? 'PUT' : 'POST';
    const url = internalInitialData?.id
      ? `/api/admin/home-page-feature-tabs/items/${internalInitialData.id}`
      : '/api/admin/home-page-feature-tabs/items';

    try {
      // Aktif dil çevirisini kontrol et
      const activeTranslation = data.translations.find(t => t.languageCode === activeLanguageCode);
      if (!activeTranslation || 
          !activeTranslation.triggerText || 
          !activeTranslation.tagText || 
          !activeTranslation.heading || 
          !activeTranslation.description || 
          !activeTranslation.buttonText || 
          !activeTranslation.buttonLink) {
        toast.error(`Lütfen ${activeLanguageCode} dilindeki tüm alanları doldurun.`);
        setIsSubmitting(false);
        return;
      }

      console.log("Form verileri gönderiliyor:", JSON.stringify(data, null, 2));
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log("API yanıtı:", responseData);

      if (!response.ok) {
        if (responseData.error && typeof responseData.error === 'object' && responseData.error._errors) {
            const zodErrors = Object.entries(responseData.error)
            .map(([key, value]) => `${key}: ${(value as any)._errors?.join(', ')}`)
            .join('\n');
          toast.error(`Kaydetme başarısız oldu:\n${zodErrors || 'Bilinmeyen bir hata oluştu.'}`);
        } else {
            toast.error(responseData.error || 'İşlem sırasında bir hata oluştu.');
        }
        return;
      }

      toast.success(internalInitialData?.id ? 'Özellik sekmesi başarıyla güncellendi!' : 'Özellik sekmesi başarıyla oluşturuldu!');
      onSubmitSuccess(); // Ana bileşene başarı bilgisini gönder
    } catch (error) {
      console.error("Form gönderme hatası:", error);
      toast.error('Bir şeyler ters gitti. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingData) {
    return <FormLoadingSkeleton title="Sekme verileri yükleniyor..." rows={5} />;
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{internalInitialData?.id ? "Özellik Sekmesini Düzenle" : "Yeni Özellik Sekmesi Ekle"}</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={(e) => {
    e.preventDefault();
    // Önce manuel kontrol yap
    const formData = form.getValues();
    const activeTranslation = formData.translations.find(t => t.languageCode === activeLanguageCode);
    
    if (!activeTranslation || 
        !activeTranslation.triggerText || 
        !activeTranslation.tagText || 
        !activeTranslation.heading || 
        !activeTranslation.description || 
        !activeTranslation.buttonText || 
        !activeTranslation.buttonLink) {
      toast.error(`Lütfen ${activeLanguageCode} dilindeki tüm alanları doldurun.`);
      return;
    }
    
    // Form geçerliyse normal onSubmit işlemeye devam et
    form.handleSubmit(onSubmitApi)(e);
}} className="space-y-8">
                <Card>
                <CardHeader>
                    <CardTitle>Temel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Değer (Value)</FormLabel>
                        <FormControl>
                            <Input placeholder="benzersiz-sekme-degeri" {...field} />
                        </FormControl>
                        <FormDescription>
                            Sekme için benzersiz bir tanımlayıcı (URL dostu, örn: modern-care).
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Görsel</FormLabel>
                        <FormControl>
                            <ImageUpload
                                initialImage={field.value}
                                onImageUploaded={(url: string) => field.onChange(url || "")}
                                showPreview={true}
                                uploadFolder="home_feature_tabs"
                                buttonText="Görsel Yükle/Değiştir"
                            />
                        </FormControl>
                        <FormDescription>Sekmede gösterilecek ana görsel.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Sıralama</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>Sekmelerin gösterim sırası (küçükten büyüğe).</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Yayın Durumu</FormLabel>
                            <FormDescription>
                            Bu sekme öğesi sitede yayınlansın mı?
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                </CardContent>
                </Card>

                <Card>
                <CardHeader>
                    <CardTitle>Çeviriler ({languages.find(l => l.code === activeLanguageCode)?.name})</CardTitle>
                </CardHeader>
                <CardContent>
                    {fields.map((item, index) => {
                         // Sadece aktif dilin formunu göster
                        if (form.watch(`translations.${index}.languageCode`) !== activeLanguageCode) return null;
                        return (
                            <div key={item.id} className="space-y-6 pt-4">
                                <FormField control={form.control} name={`translations.${index}.triggerText`} render={({ field: f }) => (<FormItem><FormLabel>Sekme Başlığı (Trigger)</FormLabel><FormControl><Input placeholder="Modern Bakım" {...f} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`translations.${index}.tagText`} render={({ field: f }) => (<FormItem><FormLabel>Etiket Metni</FormLabel><FormControl><Input placeholder="Gelişmiş Klinik. Güvenilir Bakım." {...f} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`translations.${index}.heading`} render={({ field: f }) => (<FormItem><FormLabel>İçerik Ana Başlığı</FormLabel><FormControl><Input placeholder="Son Teknoloji Kliniklerde..." {...f} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`translations.${index}.description`} render={({ field: f }) => (<FormItem><FormLabel>Açıklama</FormLabel><FormControl><Textarea placeholder="Detaylı açıklama..." {...f} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`translations.${index}.buttonText`} render={({ field: f }) => (<FormItem><FormLabel>Buton Metni</FormLabel><FormControl><Input placeholder="Kliniğimizi Keşfedin" {...f} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`translations.${index}.buttonLink`} render={({ field: f }) => (<FormItem><FormLabel>Buton Linki</FormLabel><FormControl><Input placeholder="/klinigimiz" {...f} /></FormControl><FormDescription>Örn: /hizmetler/sac-ekimi</FormDescription><FormMessage /></FormItem>)} />
                            </div>
                        );
                    })}
                     {languages.length === 0 && <p>Aktif dil bulunamadı.</p>}
                </CardContent>
                </Card>

                <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting || isLoadingData}>
                    {isSubmitting ? "Kaydediliyor..." : (internalInitialData?.id ? "Değişiklikleri Kaydet" : "Yeni Sekme Oluştur")}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isLoadingData}>
                    İptal
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
