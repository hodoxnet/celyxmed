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

interface ExpertsSectionFormProps {
  form: UseFormReturn<HizmetFormValues>;
  loading: boolean;
  activeLang: string;
  diller: Language[]; // diller prop'u eklendi
}

export function ExpertsSectionForm({ form, loading, activeLang, diller }: ExpertsSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expertsSection.definition.items", // expertItems -> expertsSection.definition.items
  });

  const createTranslationsForAllLanguages = () => {
    const translations: Record<string, any> = {};
    diller.forEach(lang => {
      translations[lang.code] = {
        languageCode: lang.code,
        name: "",
        title: "",
        description: "",
        ctaText: "",
      };
    });
    return translations;
  };

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Uzmanlarla Tanışın Bölümü</h3>
      <FormField
        control={form.control}
        name={`expertsSection.translations.${activeLang}.title`} // expertsSectionTitle -> expertsSection.translations[activeLang].title
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Celyxmed'de Anne Estetiği Uzmanlarınızla Tanışın" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`expertsSection.translations.${activeLang}.tagline`} // expertsTagline -> expertsSection.translations[activeLang].tagline
        render={({ field }) => (
          <FormItem>
            <FormLabel>Etiket (Tagline)</FormLabel>
            <FormControl>
              <Input placeholder="Doktorumuz Çevrimiçi ve Konsültasyona Hazır" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Uzmanlar</FormLabel>
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
               <h4 className="text-md font-medium border-b pb-2">Uzman {index + 1}</h4>
               <FormField
                control={form.control}
                name={`expertsSection.definition.items.${index}.translations.${activeLang}.name`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">İsim *</FormLabel>
                    <FormControl>
                      <Input placeholder="Op. Dr. Kemal Aytuğlu" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`expertsSection.definition.items.${index}.translations.${activeLang}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Unvan *</FormLabel>
                    <FormControl>
                      <Input placeholder="Plastik, Rekonstrüktif ve Estetik Cerrahi Uzmanı" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`expertsSection.definition.items.${index}.translations.${activeLang}.description`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Açıklama *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Uzman açıklaması..." {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`expertsSection.definition.items.${index}.imageUrl`}
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
                name={`expertsSection.definition.items.${index}.imageAlt`}
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
               <FormField
                control={form.control}
                name={`expertsSection.definition.items.${index}.translations.${activeLang}.ctaText`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Buton Metni (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Çevrimiçi Danışma" {...field} value={field.value || ""} disabled={loading} />
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
            Uzman Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
