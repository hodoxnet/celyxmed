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

interface RecoverySectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function RecoverySectionForm({ form, loading }: RecoverySectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "recoveryItems",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">İyileşme Bilgisi Bölümü</h3>
      <FormField
        control={form.control}
        name="recoveryTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Anne Estetiğinden Sonra Sizi Neler Bekler?" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="recoveryDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması</FormLabel>
            <FormControl>
              <Textarea placeholder="İyileşme bölümü açıklaması..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* İyileşme Öğeleri (Field Array) */}
      <div>
        <FormLabel>İyileşme Öğeleri</FormLabel>
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
               <h4 className="text-md font-medium border-b pb-2">Öğe {index + 1}</h4>
               <FormField
                control={form.control}
                name={`recoveryItems.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Başlık *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ameliyat Sonrası Yolculuğunuz" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`recoveryItems.${index}.description`}
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
               <FormField
                control={form.control}
                name={`recoveryItems.${index}.imageUrl`}
                render={({ field }) => (
                  <FormItem>
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
                name={`recoveryItems.${index}.imageAlt`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Resim Alt Metni *</FormLabel>
                    <FormControl>
                      <Input placeholder="Resim açıklaması..." {...field} disabled={loading} />
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
            onClick={() => append({ title: "", description: "", imageUrl: "", imageAlt: "", order: fields.length })}
            disabled={loading}
          >
            Öğe Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
