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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Shadcn Tabs
import ImageUpload from "@/components/admin/image-upload"; // Varsayılan ImageUpload bileşeni

// Dil verisi tipi
interface Language {
  code: string;
  name: string;
}

// Form veri tipi (API'den gelen veya gönderilecek)
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

// Zod şemaları
const TranslationSchema = z.object({
  languageCode: z.string(),
  triggerText: z.string().min(1, "Sekme başlığı gereklidir."),
  tagText: z.string().min(1, "Etiket metni gereklidir."),
  heading: z.string().min(1, "İçerik başlığı gereklidir."),
  description: z.string().min(1, "Açıklama gereklidir."),
  buttonText: z.string().min(1, "Buton metni gereklidir."),
  buttonLink: z.string().min(1, "Buton linki gereklidir."),
});

export const featureTabItemFormSchema = z.object({
  value: z.string().min(1, "Sekme için benzersiz bir değer (value) gereklidir."),
  imageUrl: z.string().min(1, "Görsel URL'si gereklidir."), // .url() kontrolü geçici olarak kaldırıldı
  order: z.coerce.number().int().min(0), // .default(0) kaldırıldı
  isPublished: z.boolean(), // .default(true) kaldırıldı
  translations: z.array(TranslationSchema).min(1, "En az bir dilde çeviri eklenmelidir."),
});

export type FeatureTabItemFormValues = z.infer<typeof featureTabItemFormSchema>; // Export edildi

interface FeatureTabItemFormProps {
  initialData?: FeatureTabItemFormData | null;
  languages: Language[]; // Aktif dillerin listesi
  onFormSubmit: (data: FeatureTabItemFormValues) => Promise<boolean>; // Promise<boolean> dönecek şekilde güncellendi
  isSubmitting: boolean;
}

export default function FeatureTabItemForm({
  initialData,
  languages,
  onFormSubmit,
  isSubmitting,
}: FeatureTabItemFormProps) {
  const router = useRouter();
  const [activeLangTab, setActiveLangTab] = useState(languages[0]?.code || "");

  const defaultTranslations = languages.map(lang => ({
    languageCode: lang.code,
    triggerText: "",
    tagText: "",
    heading: "",
    description: "",
    buttonText: "",
    buttonLink: "",
  }));

  const form = useForm<FeatureTabItemFormValues>({
    resolver: zodResolver(featureTabItemFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          order: initialData.order ?? 0,
          isPublished: initialData.isPublished ?? true,
          translations: languages.map(lang => {
            const existingTranslation = initialData.translations.find(t => t.languageCode === lang.code);
            return existingTranslation || defaultTranslations.find(dt => dt.languageCode === lang.code)!;
          }),
        }
      : {
          value: "",
          imageUrl: "",
          order: 0,
          isPublished: true,
          translations: defaultTranslations,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "translations",
  });

  // Eğer initialData değişirse formu resetle (düzenleme sayfasında veri yüklendiğinde)
   useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        order: initialData.order ?? 0,
        isPublished: initialData.isPublished ?? true,
        translations: languages.map(lang => {
            const existingTranslation = initialData.translations.find(t => t.languageCode === lang.code);
            return existingTranslation || defaultTranslations.find(dt => dt.languageCode === lang.code)!;
          }),
      });
    }
  }, [initialData, form, languages, defaultTranslations]);


  const onSubmit = async (data: FeatureTabItemFormValues) => {
    const success = await onFormSubmit(data);
    if (success) {
        // Yönlendirme veya başka bir işlem burada yapılabilir.
        // Şimdilik sadece toast mesajı gösteriliyor.
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  <FormLabel>Görsel URL</FormLabel>
                  <FormControl>
                    <ImageUpload
                        initialImage={field.value} // initialImage prop'unu kullanalım
                        onImageUploaded={(url: string) => field.onChange(url || "")} // Zorunlu olan onImageUploaded prop'unu kullanalım
                        showPreview={true}
                        // value={field.value} // value yerine initialImage kullanılıyor
                        // onChange={(url: string) => field.onChange(url || "")} // onChange yerine onImageUploaded kullanılıyor
                        // uploadFolder="home_feature_tabs" // İsteğe bağlı
                    />
                  </FormControl>
                  <FormDescription>Sekmede gösterilecek ana görsel. Yeni resim yükleyebilir veya mevcut URL'yi kullanabilirsiniz.</FormDescription>
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
            <CardTitle>Çeviriler</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
              <div className="overflow-x-auto pb-2 mb-4"> {/* Yatay kaydırma için sarmalayıcı div */}
                <TabsList className="inline-flex h-auto items-center justify-start rounded-lg bg-gray-100 p-1 dark:bg-gray-800 space-x-1 whitespace-nowrap">
                  {languages.map((lang) => (
                    <TabsTrigger 
                      key={lang.code} 
                      value={lang.code}
                      className="px-3 py-1.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white rounded-md"
                    >
                      {lang.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {fields.map((field, index) => (
                <TabsContent key={field.id} value={form.watch(`translations.${index}.languageCode`)}>
                  <div className="space-y-6 pt-4">
                    <FormField
                      control={form.control}
                      name={`translations.${index}.triggerText`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Sekme Başlığı (Trigger)</FormLabel>
                          <FormControl>
                            <Input placeholder="Modern Bakım" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`translations.${index}.tagText`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Etiket Metni</FormLabel>
                          <FormControl>
                            <Input placeholder="Gelişmiş Klinik. Güvenilir Bakım." {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`translations.${index}.heading`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>İçerik Ana Başlığı</FormLabel>
                          <FormControl>
                            <Input placeholder="Son Teknoloji Kliniklerde Dünya Standartlarında Sağlık Hizmeti" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`translations.${index}.description`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Açıklama</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Detaylı açıklama..." {...f} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`translations.${index}.buttonText`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Buton Metni</FormLabel>
                          <FormControl>
                            <Input placeholder="Kliniğimizi Keşfedin" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`translations.${index}.buttonLink`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Buton Linki</FormLabel>
                          <FormControl>
                            <Input placeholder="/klinigimiz" {...f} />
                          </FormControl>
                          <FormDescription>Örn: /hizmetler/sac-ekimi veya https://dis-link.com</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kaydediliyor..." : (initialData ? "Değişiklikleri Kaydet" : "Yeni Sekme Oluştur")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="ml-2" disabled={isSubmitting}>
          İptal
        </Button>
      </form>
    </Form>
  );
}
