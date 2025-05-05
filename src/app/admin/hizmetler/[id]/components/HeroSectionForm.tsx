"use client";

import { HizmetDetayForm } from "@/types/form-types";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import ImageUpload from '@/components/admin/image-upload'; // TODO: ImageUpload entegrasyonu

interface HeroSectionFormProps {
  form: HizmetDetayForm;
  loading: boolean;
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
            <FormLabel>Hero Resim URL *</FormLabel>
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
        name="heroImageAlt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hero Resim Alt Metni *</FormLabel>
            <FormControl>
              <Input placeholder="Resim açıklaması..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
