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
import { Checkbox } from "@/components/ui/checkbox";
import { Trash } from "lucide-react";

interface TocSectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function TocSectionForm({ form, loading }: TocSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tocItems",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">İçindekiler (TOC) & Sağ CTA</h3>
      <FormField
        control={form.control}
        name="tocTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>İçindekiler Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="İçindekiler" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tocAuthorInfo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Yazar/Güncelleme Bilgisi</FormLabel>
            <FormControl>
              <Input placeholder="Op. Dr. İsim Soyisim - Son Güncelleme: Tarih" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tocCtaDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sağ Sütun CTA Açıklaması *</FormLabel>
            <FormControl>
              <Textarea placeholder="Sağ sütunda görünecek kısa tanıtım/CTA metni..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* İçindekiler Öğeleri (Field Array) */}
      <div>
        <FormLabel>İçindekiler Öğeleri</FormLabel>
        <div className="space-y-4 mt-2">
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-4 border p-3 rounded-md">
              <span className="text-sm font-medium">{index + 1}.</span>
              <FormField
                control={form.control}
                name={`tocItems.${index}.text`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Madde metni..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`tocItems.${index}.isBold`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                    </FormControl>
                    <FormLabel className="text-sm !mt-0">Kalın</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`tocItems.${index}.level`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Seviye"
                        {...field}
                        onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} // Boşsa undefined yap
                        value={field.value ?? ''} // null/undefined ise boş göster
                        className="w-20"
                        disabled={loading}
                      />
                    </FormControl>
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
            onClick={() => append({ text: "", isBold: false, level: undefined, order: fields.length })} // order eklendi
            disabled={loading}
          >
            Öğe Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
