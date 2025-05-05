"use client";

import { Language } from "@/generated/prisma";
import { HizmetDetayForm } from "@/types/form-types";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Slug oluşturma yardımcı fonksiyonu (blog formundan alındı)
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
    .replace(/[^a-z0-9 -]/g, '') // Harf, rakam, boşluk ve tire dışındakileri kaldır
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap
    .replace(/^-+|-+$/g, ''); // Başta ve sondaki tireleri kaldır
};


interface BasicInfoSectionProps {
  form: HizmetDetayForm;
  diller: Language[];
  loading: boolean;
  isEditing: boolean;
}

export function BasicInfoSection({ form, diller, loading, isEditing }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Temel Bilgiler</h3>
      <FormField
        control={form.control}
        name="languageCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dil *</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isEditing || loading} // Düzenlemede dil değiştirilemez
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Bir dil seçin" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {diller.map((dil) => (
                  <SelectItem key={dil.code} value={dil.code}>
                    {dil.name} ({dil.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Bu hizmet detayının hangi dilde görüntüleneceğini seçin. Düzenleme modunda değiştirilemez.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Başlık *</FormLabel>
            <FormControl>
              <Input
                placeholder="Hizmet başlığı..."
                {...field}
                disabled={loading}
                onChange={(e) => {
                    field.onChange(e.target.value);
                    // Başlık değiştikçe slug'ı otomatik güncelle (eğer slug boşsa veya yeni ekleniyorsa)
                    if (!isEditing || !form.getValues("slug")) {
                        form.setValue("slug", generateSlug(e.target.value), { shouldValidate: true });
                    }
                }}
               />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL Slug *</FormLabel>
            <FormControl>
              <Input placeholder="hizmet-url-slug" {...field} disabled={loading} />
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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kısa Açıklama *</FormLabel>
            <FormControl>
              <Textarea placeholder="Hizmetin kısa bir özeti..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="breadcrumb"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Breadcrumb *</FormLabel>
            <FormControl>
              <Input placeholder="Anasayfa > Hizmetler > Hizmet Adı" {...field} disabled={loading} />
            </FormControl>
            <FormDescription>
              Sayfanın üst kısmında görünecek navigasyon yolu.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="published"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={loading}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Yayınla</FormLabel>
              <FormDescription>
                Bu hizmet detayını web sitesinde görünür yap.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
