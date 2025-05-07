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
import { Trash, Star } from "lucide-react";
import ImageUpload from '@/components/admin/image-upload';

interface TestimonialsSectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function TestimonialsSectionForm({ form, loading }: TestimonialsSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testimonials",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Yorumlar Bölümü</h3>
      <FormField
        control={form.control}
        name="testimonialsSectionTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı</FormLabel>
            <FormControl>
              <Input placeholder="Mutlu Hastalarımızdan Yorumlar" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Yorumlar (Field Array) */}
      <div>
        <FormLabel>Yorumlar</FormLabel>
        <div className="space-y-6 mt-2">
          {fields.map((item, index) => (
            <div key={item.id} className="border p-4 rounded-md space-y-4 relative">
               <Button
                 type="button"
                 variant="destructive"
                 size="sm"
                 onClick={() => remove(index)}
                 disabled={loading}
                 className="absolute top-2 right-2"
               >
                 <Trash className="h-4 w-4" />
               </Button>
               <h4 className="text-md font-medium border-b pb-2">Yorum {index + 1}</h4>
               <FormField
                control={form.control}
                name={`testimonials.${index}.author`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Yazar *</FormLabel>
                    <FormControl>
                      <Input placeholder="Olivia R. (Amerika Birleşik Devletleri 🇺🇸)" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`testimonials.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Yorum Metni *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Yorum içeriği..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`testimonials.${index}.treatment`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Tedavi (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Türkiye'de Anne Estetiği Ameliyatı" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`testimonials.${index}.imageUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Yazar Resmi (Opsiyonel)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        initialImage={field.value}
                        showPreview={true}
                        buttonText="Yazar Resmi Yükle/Değiştir"
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
                name={`testimonials.${index}.stars`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Yıldız Sayısı (1-5)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="5"
                        {...field}
                        onChange={event => field.onChange(event.target.value === '' ? 5 : +event.target.value)} // Boşsa 5 yap
                        value={field.value ?? 5} // null/undefined ise 5 göster
                        disabled={loading}
                        className="w-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* TODO: Sıralama için sürükle bırak eklenebilir */}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({
                stars: 5,
                text: "",
                author: "",
                treatment: "",
                imageUrl: "",
                order: fields.length
            })}
            disabled={loading}
          >
            Yorum Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
