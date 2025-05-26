"use client";

import { UseFormReturn } from "react-hook-form";
import { HizmetFormValues } from "./hizmet-form"; // Varsayılan olarak hizmet-form'dan import edilecek

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SeoSectionFormProps {
  form: UseFormReturn<HizmetFormValues>;
  loading: boolean;
  activeLang: string; // activeLang prop'u eklendi
}

export function SeoSectionForm({ form, loading, activeLang }: SeoSectionFormProps) {
  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">SEO Meta Alanları</h3>
      <FormField
        control={form.control}
        name={`seoSection.translations.${activeLang}.metaTitle`} // metaTitle -> seoSection.translations[activeLang].metaTitle
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Başlık</FormLabel>
            <FormControl>
              <Input placeholder="Sayfa başlığı (SEO için)..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
             <FormDescription>
              Arama motoru sonuçlarında görünecek başlık. Genellikle ana başlıkla aynı veya benzer olur.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`seoSection.translations.${activeLang}.metaDescription`} // metaDescription -> seoSection.translations[activeLang].metaDescription
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Açıklama</FormLabel>
            <FormControl>
              <Textarea placeholder="Sayfa açıklaması (SEO için)..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
             <FormDescription>
              Arama motoru sonuçlarında görünecek kısa açıklama (genellikle 150-160 karakter).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name={`seoSection.translations.${activeLang}.metaKeywords`} // metaKeywords -> seoSection.translations[activeLang].metaKeywords
        render={({ field }) => (
          <FormItem>
            <FormLabel>Anahtar Kelimeler</FormLabel>
            <FormControl>
              <Input placeholder="kelime1, kelime2, kelime3" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
             <FormDescription>
              Sayfayla ilgili anahtar kelimeler (virgülle ayrılmış). SEO değeri eskisi kadar yüksek olmasa da kullanılabilir.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
