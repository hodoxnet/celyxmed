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
import ImageUpload from '@/components/admin/image-upload';

interface CtaSectionFormProps {
  form: UseFormReturn<HizmetFormValues>;
  loading: boolean;
  activeLang: string; // activeLang prop'u eklendi
}

export function CtaSectionForm({ form, loading, activeLang }: CtaSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ctaAvatars", // Bu alan dil bağımsız ve ana form şemasında tanımlı
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Ana CTA Bölümü</h3>
      <FormField
        control={form.control}
        name={`ctaSection.translations.${activeLang}.tagline`} // ctaTagline -> ctaSection.translations[activeLang].tagline
        render={({ field }) => (
          <FormItem>
            <FormLabel>Etiket (Tagline)</FormLabel>
            <FormControl>
              <Input placeholder="Be Your Best" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`ctaSection.translations.${activeLang}.title`} // ctaTitle -> ctaSection.translations[activeLang].title
        render={({ field }) => (
          <FormItem>
            <FormLabel>Başlık *</FormLabel>
            <FormControl>
              <Input placeholder="Doktorlarımıza Online Danışın" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`ctaSection.translations.${activeLang}.description`} // ctaDescription -> ctaSection.translations[activeLang].description
        render={({ field }) => (
          <FormItem>
            <FormLabel>Açıklama *</FormLabel>
            <FormControl>
              <Textarea placeholder="CTA açıklaması..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
            control={form.control}
            name={`ctaSection.translations.${activeLang}.buttonText`} // ctaButtonText -> ctaSection.translations[activeLang].buttonText
            render={({ field }) => (
            <FormItem>
                <FormLabel>Buton Metni *</FormLabel>
                <FormControl>
                <Input placeholder="Ücretsiz Konsültasyonunuzu Bugün Yaptırın" {...field} value={field.value || ""} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name={`ctaSection.translations.${activeLang}.buttonLink`} // ctaButtonLink -> ctaSection.translations[activeLang].buttonLink
            render={({ field }) => (
            <FormItem>
                <FormLabel>Buton Linki</FormLabel>
                <FormControl>
                <Input placeholder="/iletisim" {...field} value={field.value || ""} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
      </div>
       <FormField
        control={form.control}
        name={`ctaSection.translations.${activeLang}.avatarText`} // ctaAvatarText -> ctaSection.translations[activeLang].avatarText
        render={({ field }) => (
          <FormItem>
            <FormLabel>Avatar Metni</FormLabel>
            <FormControl>
              <Input placeholder="Doktorunuzu Seçin, Sorularınızı Sorun" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="ctaBackgroundImageUrl" // Dil bağımsız, ana form şemasında
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
       <FormField
        control={form.control}
        name="ctaMainImageUrl" // Dil bağımsız, ana form şemasında
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ana Resim</FormLabel>
            <FormControl>
              <ImageUpload
                initialImage={field.value || ""} // null ise boş string
                showPreview={true}
                buttonText="Ana Resmi Yükle/Değiştir"
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
        name="ctaMainImageAlt" // Dil bağımsız, ana form şemasında
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ana Resim Alt Metni</FormLabel>
            <FormControl>
              <Input placeholder="Resim açıklaması..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>CTA Avatarları (Dil Bağımsız)</FormLabel>
        <div className="space-y-4 mt-2">
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-4 border p-3 rounded-md">
              <span className="text-sm font-medium">{index + 1}.</span>
              <FormField
                control={form.control}
                name={`ctaAvatars.${index}.src`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                     <FormLabel className="text-xs">Avatar URL *</FormLabel>
                    <FormControl>
                       <ImageUpload
                        initialImage={field.value || ""}
                        showPreview={true}
                        buttonText="Avatar Yükle"
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
                name={`ctaAvatars.${index}.alt`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                     <FormLabel className="text-xs">Alt Metin *</FormLabel>
                    <FormControl>
                      <Input placeholder="Avatar açıklaması..." {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} disabled={loading}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ src: "", alt: "", order: fields.length })}
            disabled={loading}
          >
            Avatar Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
