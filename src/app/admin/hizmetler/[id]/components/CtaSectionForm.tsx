"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { HizmetDetayFormValues } from "@/lib/validators/admin";

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
// import ImageUpload from '@/components/admin/image-upload'; // TODO: ImageUpload entegrasyonu

interface CtaSectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function CtaSectionForm({ form, loading }: CtaSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ctaAvatars",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Ana CTA Bölümü</h3>
      <FormField
        control={form.control}
        name="ctaTagline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Etiket (Tagline)</FormLabel>
            <FormControl>
              <Input placeholder="Be Your Best" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="ctaTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Başlık *</FormLabel>
            <FormControl>
              <Input placeholder="Doktorlarımıza Online Danışın" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="ctaDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Açıklama *</FormLabel>
            <FormControl>
              <Textarea placeholder="CTA açıklaması..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
            control={form.control}
            name="ctaButtonText"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Buton Metni *</FormLabel>
                <FormControl>
                <Input placeholder="Ücretsiz Konsültasyonunuzu Bugün Yaptırın" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="ctaButtonLink"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Buton Linki</FormLabel>
                <FormControl>
                <Input placeholder="/iletisim" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
      </div>
       <FormField
        control={form.control}
        name="ctaAvatarText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Avatar Metni</FormLabel>
            <FormControl>
              <Input placeholder="Doktorunuzu Seçin, Sorularınızı Sorun" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="ctaBackgroundImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Arka Plan Resim URL</FormLabel>
            <FormControl>
              {/* TODO: Image Upload bileşeni entegre edilebilir */}
              <Input placeholder="https://..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="ctaMainImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ana Resim URL</FormLabel>
            <FormControl>
              {/* TODO: Image Upload bileşeni entegre edilebilir */}
              <Input placeholder="https://..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="ctaMainImageAlt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ana Resim Alt Metni</FormLabel>
            <FormControl>
              <Input placeholder="Resim açıklaması..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* CTA Avatarları (Field Array) */}
      <div>
        <FormLabel>CTA Avatarları</FormLabel>
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
                      {/* TODO: Image Upload bileşeni entegre edilebilir */}
                      <Input placeholder="https://..." {...field} disabled={loading} />
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
                      <Input placeholder="Avatar açıklaması..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* TODO: Sıralama için sürükle bırak eklenebilir */}
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
