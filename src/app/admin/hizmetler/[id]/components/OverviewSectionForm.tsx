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

interface OverviewSectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function OverviewSectionForm({ form, loading }: OverviewSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "overviewTabs",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Tedaviye Genel Bakış Bölümü</h3>
      <FormField
        control={form.control}
        name="overviewTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Genel bakış bölüm başlığı..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="overviewDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması *</FormLabel>
            <FormControl>
              <Textarea placeholder="Genel bakış bölüm açıklaması..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Genel Bakış Tabları (Field Array) */}
      <div>
        <FormLabel>Genel Bakış Sekmeleri</FormLabel>
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
               <h4 className="text-md font-medium border-b pb-2">Sekme {index + 1}</h4>
              <FormField
                control={form.control}
                name={`overviewTabs.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Sekme Değeri (Benzersiz ID) *</FormLabel>
                    <FormControl>
                      <Input placeholder="örn: nedir, kimin-icin" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`overviewTabs.${index}.triggerText`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Sekme Başlığı (Tetikleyici Metin) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Bu Tedavi Nedir?" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`overviewTabs.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">İçerik Başlığı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Sekme içerik başlığı..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`overviewTabs.${index}.content`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">İçerik *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Sekme içeriği..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`overviewTabs.${index}.imageUrl`}
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
                name={`overviewTabs.${index}.imageAlt`}
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
               <FormField
                control={form.control}
                name={`overviewTabs.${index}.buttonText`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Buton Metni *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dönüşümünüzü Başlatın" {...field} disabled={loading} />
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
                value: "",
                triggerText: "",
                title: "",
                content: "",
                imageUrl: "",
                imageAlt: "",
                buttonText: "",
                order: fields.length
            })}
            disabled={loading}
          >
            Sekme Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
