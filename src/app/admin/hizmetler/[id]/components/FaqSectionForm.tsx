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
// import RichTextEditor from '@/components/admin/rich-text-editor'; // TODO: RichTextEditor entegrasyonu

interface FaqSectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function FaqSectionForm({ form, loading }: FaqSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Sıkça Sorulan Sorular (SSS) Bölümü</h3>
      <FormField
        control={form.control}
        name="faqSectionTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Anne Estetiği Hakkında Sıkça Sorulan Sorular" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="faqSectionDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması</FormLabel>
            <FormControl>
              <Textarea placeholder="SSS bölümü açıklaması..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* SSS Öğeleri (Field Array) */}
      <div>
        <FormLabel>SSS Öğeleri</FormLabel>
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
               <h4 className="text-md font-medium border-b pb-2">Soru {index + 1}</h4>
               <FormField
                control={form.control}
                name={`faqs.${index}.question`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Soru *</FormLabel>
                    <FormControl>
                      <Input placeholder="Soru metni..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`faqs.${index}.answer`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Cevap *</FormLabel>
                    <FormControl>
                      {/* TODO: RichTextEditor entegrasyonu */}
                      <Textarea placeholder="Cevap metni (HTML destekleyebilir)..." {...field} disabled={loading} rows={5} />
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
            onClick={() => append({ question: "", answer: "", order: fields.length })}
            disabled={loading}
          >
            Soru Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
