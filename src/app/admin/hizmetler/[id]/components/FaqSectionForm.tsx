"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { HizmetFormValues } from "./hizmet-form"; // Varsayılan olarak hizmet-form'dan import edilecek

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
// import RichTextEditor from '@/components/admin/rich-text-editor'; // TODO: RichTextEditor entegrasyonu

interface FaqSectionFormProps {
  form: UseFormReturn<HizmetFormValues>;
  loading: boolean;
  activeLang: string; // activeLang prop'u eklendi
}

export function FaqSectionForm({ form, loading, activeLang }: FaqSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `faqSection.translations.${activeLang}.faqs`, // faqs -> faqSection.translations[activeLang].faqs
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Sıkça Sorulan Sorular (SSS) Bölümü</h3>
      <FormField
        control={form.control}
        name={`faqSection.translations.${activeLang}.title`} // faqSectionTitle -> faqSection.translations[activeLang].title
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Anne Estetiği Hakkında Sıkça Sorulan Sorular" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`faqSection.translations.${activeLang}.description`} // faqSectionDescription -> faqSection.translations[activeLang].description
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması</FormLabel>
            <FormControl>
              <Textarea placeholder="SSS bölümü açıklaması..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>SSS Öğeleri</FormLabel>
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
               <h4 className="text-md font-medium border-b pb-2">Soru {index + 1}</h4>
               <FormField
                control={form.control}
                name={`faqSection.translations.${activeLang}.faqs.${index}.question`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Soru *</FormLabel>
                    <FormControl>
                      <Input placeholder="Soru metni..." {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`faqSection.translations.${activeLang}.faqs.${index}.answer`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Cevap *</FormLabel>
                    <FormControl>
                      {/* TODO: RichTextEditor entegrasyonu */}
                      <Textarea placeholder="Cevap metni (HTML destekleyebilir)..." {...field} value={field.value || ""} disabled={loading} rows={5} />
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
              question: "", 
              answer: "", 
              order: fields.length 
            })}
            disabled={loading}
          >
            Soru Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
