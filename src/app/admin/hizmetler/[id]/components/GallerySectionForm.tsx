"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, // Eklendi
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash } from "lucide-react";
import ImageUpload from '@/components/admin/image-upload';

interface GallerySectionFormProps {
  form: UseFormReturn<any>; // Şimdilik any
  loading: boolean;
  activeLang: string; // Aktif dili ekle
}

export function GallerySectionForm({ form, loading, activeLang }: GallerySectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "galleryImages", // Bu dil bağımsız, aynı kalıyor
  });

  // Dile özgü alan adları
  const titleFieldName = `gallerySection.translations.${activeLang}.title` as const;
  const descriptionFieldName = `gallerySection.translations.${activeLang}.description` as const;

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Galeri Bölümü ({activeLang.toUpperCase()})</h3>
        
        {/* Modül durumu kontrolleri */}
        <div className="flex items-center space-x-4">
          <FormField
            control={form.control}
            name="moduleStates.gallerySection.isActive"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox 
                    checked={field.value !== false} 
                    onCheckedChange={field.onChange} 
                    disabled={loading} 
                  />
                </FormControl>
                <FormLabel className="text-sm !mt-0">Aktif</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </div>
      <FormField
        control={form.control}
        name={titleFieldName} // Güncellendi
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı ({activeLang.toUpperCase()}) *</FormLabel>
            <FormControl>
              <Input placeholder={`Galeri bölüm başlığı (${activeLang.toUpperCase()})...`} {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={descriptionFieldName} // Güncellendi
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması ({activeLang.toUpperCase()}) *</FormLabel>
            <FormControl>
              <Textarea placeholder={`Galeri bölüm açıklaması (${activeLang.toUpperCase()})...`} {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Galeri Resimleri (Field Array - Dil Bağımsız) */}
      <div>
        <FormLabel>Galeri Resimleri</FormLabel>
        <FormDescription>Bu resimler tüm diller için ortaktır.</FormDescription>
        <div className="space-y-4 mt-2">
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-4 border p-3 rounded-md">
              <span className="text-sm font-medium">{index + 1}.</span>
              <FormField
                control={form.control}
                name={`galleryImages.${index}.src`} // Alan adı aynı kalıyor
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Resim *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        initialImage={field.value}
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
                name={`galleryImages.${index}.alt`} // Alan adı aynı kalıyor
                render={({ field }) => (
                  <FormItem className="flex-1">
                     <FormLabel className="text-xs">Alt Metin *</FormLabel>
                    <FormControl>
                      <Input placeholder="Resim açıklaması..." {...field} disabled={loading} />
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
            Resim Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
