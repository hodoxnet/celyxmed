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

interface WhySectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function WhySectionForm({ form, loading }: WhySectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "whyItems",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Neden Celyxmed Bölümü</h3>
      <FormField
        control={form.control}
        name="whyTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Neden Celyxmed'e Güvenmelisiniz?" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="whyBackgroundImageUrl"
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

      {/* Neden Öğeleri (Field Array) */}
      <div>
        <FormLabel>Neden Öğeleri</FormLabel>
        <div className="space-y-4 mt-2">
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
               <h4 className="text-md font-medium border-b pb-2">Öğe {index + 1}</h4>
              <FormField
                control={form.control}
                name={`whyItems.${index}.number`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Sıra No *</FormLabel>
                    <FormControl>
                      <Input placeholder="01" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`whyItems.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Başlık *</FormLabel>
                    <FormControl>
                      <Input placeholder="Öğe başlığı..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`whyItems.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Açıklama *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Öğe açıklaması..." {...field} disabled={loading} />
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
            onClick={() => append({ number: "", title: "", description: "", order: fields.length })}
            disabled={loading}
          >
            Öğe Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
