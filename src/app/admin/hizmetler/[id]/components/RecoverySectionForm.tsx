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

interface RecoverySectionFormProps {
  form: UseFormReturn<HizmetFormValues>;
  loading: boolean;
  activeLang: string;
  diller: Language[]; // diller prop'u eklendi
}

export function RecoverySectionForm({ form, loading, activeLang, diller }: RecoverySectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "recoverySection.definition.items", // recoveryItems -> recoverySection.definition.items
  });

  const createTranslationsForAllLanguages = () => {
    const translations: Record<string, any> = {};
    diller.forEach(lang => {
      translations[lang.code] = {
        languageCode: lang.code,
        title: "",
        description: "",
      };
    });
    return translations;
  };

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">İyileşme Bilgisi Bölümü</h3>
      <FormField
        control={form.control}
        name={`recoverySection.translations.${activeLang}.title`} // recoveryTitle -> recoverySection.translations[activeLang].title
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Anne Estetiğinden Sonra Sizi Neler Bekler?" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`recoverySection.translations.${activeLang}.description`} // recoveryDescription -> recoverySection.translations[activeLang].description
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması</FormLabel>
            <FormControl>
              <Textarea placeholder="İyileşme bölümü açıklaması..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>İyileşme Öğeleri</FormLabel>
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
               <h4 className="text-md font-medium border-b pb-2">Öğe {index + 1}</h4>
               <FormField
                control={form.control}
                name={`recoverySection.definition.items.${index}.translations.${activeLang}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Başlık *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ameliyat Sonrası Yolculuğunuz" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`recoverySection.definition.items.${index}.translations.${activeLang}.description`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Açıklama *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Öğe açıklaması..." {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`recoverySection.definition.items.${index}.imageUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Resim *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        initialImage={field.value || ""} // null ise boş string
                        showPreview={true}
                        buttonText="Resim Yükle/Değiştir"
                        onImageUploaded={(imageUrl) => {
                          field.onChange(imageUrl);
                        }}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`recoverySection.definition.items.${index}.imageAlt`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Resim Alt Metni *</FormLabel>
                    <FormControl>
                      <Input placeholder="Resim açıklaması..." {...field} value={field.value || ""} disabled={loading} />
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
              imageUrl: null, // null olarak başlat
              imageAlt: "",
              order: fields.length,
              translations: createTranslationsForAllLanguages(),
            })}
            disabled={loading}
          >
            Öğe Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
