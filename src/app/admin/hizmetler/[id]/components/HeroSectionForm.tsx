"use client";

// import { HizmetDetayForm } from "@/types/form-types"; // Eski tip
import { UseFormReturn } from "react-hook-form"; // Yeni tip
import { handleNullValue } from "@/lib/utils";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUpload from '@/components/admin/image-upload';

interface HeroSectionFormProps {
  form: UseFormReturn<any>; // Şimdilik any
  loading: boolean;
  activeLang: string;
}

export function HeroSectionForm({ form, loading }: HeroSectionFormProps) {
  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Hero Alanı</h3>
      <FormField
        control={form.control}
        name="heroImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hero Resmi *</FormLabel>
            <FormControl>
              <ImageUpload
                initialImage={field.value || ""} // null ise boş string kullan
                showPreview={true}
                buttonText="Hero Resmi Yükle/Değiştir"
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
        name="heroImageAlt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hero Resim Alt Metni *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Resim açıklaması..." 
                value={handleNullValue(field.value)} 
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                disabled={loading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
