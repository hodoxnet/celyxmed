"use client";

import { Language } from "@/generated/prisma";
import { UseFormReturn } from "react-hook-form";
import React, { useEffect } from "react"; // useEffect import edildi

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Slug oluşturma yardımcı fonksiyonu
const generateSlug = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface BasicInfoSectionProps {
  form: UseFormReturn<any>; // Şimdilik any
  activeLang: string;
  loading: boolean;
  isEditing: boolean;
}

export function BasicInfoSection({ form, activeLang, loading, isEditing }: BasicInfoSectionProps) {
  const titleFieldName = `basicInfoSection.translations.${activeLang}.title` as const;
  const slugFieldName = `basicInfoSection.translations.${activeLang}.slug` as const;
  const descriptionFieldName = `basicInfoSection.translations.${activeLang}.description` as const;

  const watchedTitle = form.watch(titleFieldName);

  useEffect(() => {
    // watchedTitle tanımsız değilse ve (düzenleme modunda değilsek VEYA slug alanı boşsa)
    // o zaman slug'ı otomatik oluştur.
    // form.getValues(slugFieldName) çağrısı, slug'ın kullanıcı tarafından manuel olarak düzenlenip düzenlenmediğini kontrol eder.
    // Eğer düzenleme modundaysak ve slug zaten doluysa (kullanıcı manuel girmiş olabilir), otomatik güncelleme yapmayız.
    if (watchedTitle !== undefined && (!isEditing || !form.getValues(slugFieldName))) {
      form.setValue(slugFieldName, generateSlug(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, form, slugFieldName, isEditing, activeLang]); // activeLang eklendi çünkü slugFieldName ona bağlı

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Temel Bilgiler ({activeLang.toUpperCase()})</h3>
      <FormField
        control={form.control}
        name={titleFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Başlık ({activeLang.toUpperCase()}) *</FormLabel>
            <FormControl>
              <Input
                placeholder={`Hizmet başlığı (${activeLang.toUpperCase()})...`}
                {...field}
                disabled={loading}
                // onChange içindeki slug güncelleme mantığı useEffect'e taşındı
               />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={slugFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL Slug ({activeLang.toUpperCase()}) *</FormLabel>
            <FormControl>
              <Input placeholder={`hizmet-url-slug-${activeLang}`} {...field} disabled={loading} />
            </FormControl>
            <FormDescription>
              URL'de görünecek kısa ad. Başlığa göre otomatik oluşturulur, gerekirse düzenleyebilirsiniz. Sadece küçük harf, rakam ve tire kullanın. Dil ile birlikte benzersiz olmalıdır.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={descriptionFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kısa Açıklama ({activeLang.toUpperCase()}) *</FormLabel>
            <FormControl>
              <Textarea placeholder={`Hizmetin kısa bir özeti (${activeLang.toUpperCase()})...`} {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Yayınla alanı kaldırıldı, ana forma taşındı */}
    </div>
  );
}
