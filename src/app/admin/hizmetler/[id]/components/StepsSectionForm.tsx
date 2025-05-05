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

interface StepsSectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function StepsSectionForm({ form, loading }: StepsSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Prosedür Adımları Bölümü</h3>
      <FormField
        control={form.control}
        name="stepsTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Anne Estetiği Nasıl Yapılır?" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="stepsDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması</FormLabel>
            <FormControl>
              <Textarea placeholder="Adımlar bölümü açıklaması..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Adımlar (Field Array) */}
      <div>
        <FormLabel>Adımlar</FormLabel>
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
               <h4 className="text-md font-medium border-b pb-2">Adım {index + 1}</h4>
               <FormField
                control={form.control}
                name={`steps.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Adım Başlığı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ameliyat Öncesi Konsültasyon" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`steps.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Adım Açıklaması *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Adım açıklaması..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`steps.${index}.linkText`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Link Metni (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Online Randevu Alın" {...field} disabled={loading} />
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
            onClick={() => append({ title: "", description: "", linkText: "", order: fields.length })}
            disabled={loading}
          >
            Adım Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
