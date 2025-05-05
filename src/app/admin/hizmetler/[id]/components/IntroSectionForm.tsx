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

interface IntroSectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function IntroSectionForm({ form, loading }: IntroSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "introLinks",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Tedavi Tanıtım Alanı</h3>
      <FormField
        control={form.control}
        name="introVideoId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Video ID (YouTube)</FormLabel>
            <FormControl>
              <Input placeholder="Örn: 2edpx39Iy8g" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="introTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Başlık *</FormLabel>
            <FormControl>
              <Input placeholder="Tanıtım başlığı..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="introDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Açıklama *</FormLabel>
            <FormControl>
              <Textarea placeholder="Tanıtım açıklaması..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <div className="grid grid-cols-2 gap-4">
         <FormField
            control={form.control}
            name="introPrimaryButtonText"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Birincil Buton Metni *</FormLabel>
                <FormControl>
                <Input placeholder="Ücretsiz Konsültasyon" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
         <FormField
            control={form.control}
            name="introPrimaryButtonLink"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Birincil Buton Linki *</FormLabel>
                <FormControl>
                <Input placeholder="/iletisim veya #id" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
       </div>
       <div className="grid grid-cols-2 gap-4">
         <FormField
            control={form.control}
            name="introSecondaryButtonText"
            render={({ field }) => (
            <FormItem>
                <FormLabel>İkincil Buton Metni *</FormLabel>
                <FormControl>
                <Input placeholder="Tedaviye Genel Bakış" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
         <FormField
            control={form.control}
            name="introSecondaryButtonLink"
            render={({ field }) => (
            <FormItem>
                <FormLabel>İkincil Buton Linki *</FormLabel>
                <FormControl>
                <Input placeholder="#genel-bakis" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
       </div>


      {/* Tanıtım Linkleri (Field Array) */}
      <div>
        <FormLabel>Tanıtım Linkleri (Sağ Sütun)</FormLabel>
        <div className="space-y-4 mt-2">
          {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-4 gap-4 items-center border p-3 rounded-md">
              <FormField
                control={form.control}
                name={`introLinks.${index}.number`}
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
                name={`introLinks.${index}.text`}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                     <FormLabel className="text-xs">Link Metni *</FormLabel>
                    <FormControl>
                      <Input placeholder="Link metni..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`introLinks.${index}.targetId`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Hedef ID/URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="#id veya /link" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end items-center">
                 {/* TODO: Sıralama için sürükle bırak eklenebilir */}
                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} disabled={loading}>
                    <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ number: "", text: "", targetId: "", order: fields.length })} // order eklendi
            disabled={loading}
          >
            Link Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
