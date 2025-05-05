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

interface GallerySectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function GallerySectionForm({ form, loading }: GallerySectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "galleryImages",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Galeri Bölümü</h3>
      <FormField
        control={form.control}
        name="galleryTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Galeri bölüm başlığı..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="galleryDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması *</FormLabel>
            <FormControl>
              <Textarea placeholder="Galeri bölüm açıklaması..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Galeri Resimleri (Field Array) */}
      <div>
        <FormLabel>Galeri Resimleri</FormLabel>
        <div className="space-y-4 mt-2">
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-4 border p-3 rounded-md">
              <span className="text-sm font-medium">{index + 1}.</span>
              <FormField
                control={form.control}
                name={`galleryImages.${index}.src`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                     <FormLabel className="text-xs">Resim URL *</FormLabel>
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
                name={`galleryImages.${index}.alt`}
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
            Resim Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
