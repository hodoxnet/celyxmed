"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { HizmetFormValues } from "./hizmet-form"; // Varsayılan olarak hizmet-form'dan import edilecek

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
  form: UseFormReturn<HizmetFormValues>;
  loading: boolean;
  activeLang: string; // activeLang prop'u eklendi
}

export function StepsSectionForm({ form, loading, activeLang }: StepsSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `stepsSection.translations.${activeLang}.steps`, // steps -> stepsSection.translations[activeLang].steps
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Prosedür Adımları Bölümü</h3>
      <FormField
        control={form.control}
        name={`stepsSection.translations.${activeLang}.title`} // stepsTitle -> stepsSection.translations[activeLang].title
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Anne Estetiği Nasıl Yapılır?" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`stepsSection.translations.${activeLang}.description`} // stepsDescription -> stepsSection.translations[activeLang].description
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması</FormLabel>
            <FormControl>
              <Textarea placeholder="Adımlar bölümü açıklaması..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
                name={`stepsSection.translations.${activeLang}.steps.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Adım Başlığı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ameliyat Öncesi Konsültasyon" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`stepsSection.translations.${activeLang}.steps.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Adım Açıklaması *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Adım açıklaması..." {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`stepsSection.translations.${activeLang}.steps.${index}.linkText`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Link Metni (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Online Randevu Alın" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ 
              title: "", 
              description: "", 
              linkText: "", 
              order: fields.length 
            })}
            disabled={loading}
          >
            Adım Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
