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
import ImageUpload from '@/components/admin/image-upload';

interface ExpertsSectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function ExpertsSectionForm({ form, loading }: ExpertsSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expertItems",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Uzmanlarla Tanışın Bölümü</h3>
      <FormField
        control={form.control}
        name="expertsSectionTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Celyxmed'de Anne Estetiği Uzmanlarınızla Tanışın" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="expertsTagline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Etiket (Tagline)</FormLabel>
            <FormControl>
              <Input placeholder="Doktorumuz Çevrimiçi ve Konsültasyona Hazır" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Uzmanlar (Field Array) */}
      <div>
        <FormLabel>Uzmanlar</FormLabel>
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
               <h4 className="text-md font-medium border-b pb-2">Uzman {index + 1}</h4>
               <FormField
                control={form.control}
                name={`expertItems.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">İsim *</FormLabel>
                    <FormControl>
                      <Input placeholder="Op. Dr. Kemal Aytuğlu" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`expertItems.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Unvan *</FormLabel>
                    <FormControl>
                      <Input placeholder="Plastik, Rekonstrüktif ve Estetik Cerrahi Uzmanı" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`expertItems.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Açıklama *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Uzman açıklaması..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`expertItems.${index}.imageUrl`}
                render={({ field }) => (
                  <FormItem>
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
                name={`expertItems.${index}.imageAlt`}
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
                name={`expertItems.${index}.ctaText`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Buton Metni (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Çevrimiçi Danışma" {...field} disabled={loading} />
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
                name: "",
                title: "",
                description: "",
                imageUrl: "",
                imageAlt: "",
                ctaText: "",
                order: fields.length
            })}
            disabled={loading}
          >
            Uzman Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
