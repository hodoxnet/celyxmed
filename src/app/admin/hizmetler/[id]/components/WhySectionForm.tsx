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

interface WhySectionFormProps {
  form: UseFormReturn<HizmetFormValues>;
  loading: boolean;
  activeLang: string;
  diller: Language[]; // diller prop'u eklendi
}

export function WhySectionForm({ form, loading, activeLang, diller }: WhySectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "whySection.definition.items", // whyItems -> whySection.definition.items
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
      <h3 className="text-lg font-medium">Neden Celyxmed Bölümü</h3>
      <FormField
        control={form.control}
        name={`whySection.translations.${activeLang}.title`} // whyTitle -> whySection.translations[activeLang].title
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Neden Celyxmed'e Güvenmelisiniz?" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="whyBackgroundImageUrl" // Bu alan dil bağımsız ve ana form şemasında tanımlı
        render={({ field }) => (
          <FormItem>
            <FormLabel>Arka Plan Resmi</FormLabel>
            <FormControl>
              <ImageUpload
                initialImage={field.value || ""} // null ise boş string
                showPreview={true}
                buttonText="Arka Plan Resmi Yükle/Değiştir"
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

      <div>
        <FormLabel>Neden Öğeleri</FormLabel>
        <div className="space-y-4 mt-2">
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
                name={`whySection.definition.items.${index}.number`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Sıra No (Metin) *</FormLabel>
                    <FormControl>
                      <Input placeholder="01" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`whySection.definition.items.${index}.translations.${activeLang}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Başlık *</FormLabel>
                    <FormControl>
                      <Input placeholder="Öğe başlığı..." {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`whySection.definition.items.${index}.translations.${activeLang}.description`}
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
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({
              number: `${fields.length + 1 < 10 ? '0' : ''}${fields.length + 1}`, // Otomatik numara
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
