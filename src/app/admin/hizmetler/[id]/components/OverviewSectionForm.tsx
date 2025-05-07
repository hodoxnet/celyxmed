"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { HizmetFormValues } from "./hizmet-form"; // Varsayılan olarak hizmet-form'dan import edilecek
import { Language } from "@/generated/prisma"; // Language tipi import edildi

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import ImageUpload from '@/components/admin/image-upload';

interface OverviewSectionFormProps {
  form: UseFormReturn<HizmetFormValues>;
  loading: boolean;
  activeLang: string;
  diller: Language[]; // diller prop'u eklendi
}

export function OverviewSectionForm({ form, loading, activeLang, diller }: OverviewSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "overviewSection.definition.tabs", // overviewTabs -> overviewSection.definition.tabs
  });

  const createTranslationsForAllLanguages = () => {
    const translations: Record<string, any> = {};
    diller.forEach(lang => {
      translations[lang.code] = {
        languageCode: lang.code,
        triggerText: "",
        title: "",
        content: "",
        buttonText: "Detaylar", // Default değer
        buttonLink: "",
      };
    });
    return translations;
  };

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Tedaviye Genel Bakış Bölümü</h3>
      <FormField
        control={form.control}
        name={`overviewSection.translations.${activeLang}.title`} // overviewTitle -> overviewSection.translations[activeLang].title
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Genel bakış bölüm başlığı..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`overviewSection.translations.${activeLang}.description`} // overviewDescription -> overviewSection.translations[activeLang].description
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması</FormLabel>
            <FormControl>
              <Textarea placeholder="Genel bakış bölüm açıklaması..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Genel Bakış Sekmeleri</FormLabel>
        <div className="space-y-6 mt-2">
          {fields.map((item, index) => (
            <div key={item.id} className="border p-4 rounded-md space-y-4 relative">
               <Button
                 type="button"
                 variant="destructive"
                 size="sm"
                 onClick={() => remove(index)}
                 disabled={loading}
                 className="absolute top-2 right-2"
               >
                 <Trash className="h-4 w-4" />
               </Button>
               <h4 className="text-md font-medium border-b pb-2">Sekme {index + 1}</h4>
              <FormField
                control={form.control}
                name={`overviewSection.definition.tabs.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Sekme Değeri (Benzersiz ID) *</FormLabel>
                    <FormControl>
                      <Input placeholder="örn: nedir, kimin-icin" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`overviewSection.definition.tabs.${index}.translations.${activeLang}.triggerText`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Sekme Başlığı (Tetikleyici Metin) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Bu Tedavi Nedir?" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`overviewSection.definition.tabs.${index}.translations.${activeLang}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">İçerik Başlığı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Sekme içerik başlığı..." {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`overviewSection.definition.tabs.${index}.translations.${activeLang}.content`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">İçerik *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Sekme içeriği..." {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`overviewSection.definition.tabs.${index}.imagePath`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Sekme Resmi</FormLabel>
                    <FormControl>
                      <ImageUpload
                        onImageUploaded={(url) => field.onChange(url)}
                        initialImage={field.value || ""}
                        showPreview={true}
                        buttonText="Sekme Resmi Yükle/Değiştir"
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch(`overviewSection.definition.tabs.${index}.imagePath`) && (
                <FormField
                  control={form.control}
                  name={`overviewSection.definition.tabs.${index}.imageAlt`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Resim Alt Metni</FormLabel>
                      <FormControl>
                        <Input placeholder="Resim açıklaması..." {...field} value={field.value || ""} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
               <FormField
                control={form.control}
                name={`overviewSection.definition.tabs.${index}.translations.${activeLang}.buttonText`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Buton Metni</FormLabel>
                    <FormControl>
                      <Input placeholder="Dönüşümünüzü Başlatın" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`overviewSection.definition.tabs.${index}.translations.${activeLang}.buttonLink`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Buton Linki (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="/iletisim veya https://..." {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({
                value: `tab-${fields.length + 1}`, // Benzersiz value
                imagePath: null,
                imageAlt: "",
                order: fields.length,
                translations: createTranslationsForAllLanguages(),
            })}
            disabled={loading}
          >
            Sekme Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
