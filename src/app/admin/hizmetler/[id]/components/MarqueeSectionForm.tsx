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
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import ImageUpload from '@/components/admin/image-upload'; // ImageUpload import edildi

interface MarqueeSectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function MarqueeSectionForm({ form, loading }: MarqueeSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "marqueeImages",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Resim Marquee (Kaydırmalı Resimler)</h3>
      <div>
        <FormLabel>Marquee Resimleri</FormLabel>
        <div className="space-y-4 mt-2">
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-4 border p-3 rounded-md">
              <span className="text-sm font-medium">{index + 1}.</span>
              <FormField
                control={form.control}
                name={`marqueeImages.${index}.src`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                     <FormLabel className="text-xs">Resim *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        initialImage={field.value}
                        showPreview={true} // Küçük önizleme gösterelim
                        buttonText="Resim Yükle/Değiştir"
                        onImageUploaded={(imageUrl) => {
                          field.onChange(imageUrl); // Form state'ini güncelle
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
                name={`marqueeImages.${index}.alt`}
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
            onClick={() => append({ src: "", alt: "", order: fields.length })} // order eklendi
            disabled={loading}
          >
            Resim Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
