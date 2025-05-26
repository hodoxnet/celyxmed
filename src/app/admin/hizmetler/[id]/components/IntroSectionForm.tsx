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

interface IntroSectionFormProps {
  form: UseFormReturn<HizmetFormValues>;
  loading: boolean;
  activeLang: string;
}

export function IntroSectionForm({ form, loading, activeLang }: IntroSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `introSection.translations.${activeLang}.introLinks`,
  });

  // activeLang değiştiğinde, field array içindeki her bir link için
  // translations altında ilgili dilin objesinin var olduğundan emin ol.
  // Bu, formun başlangıç değerleri ayarlanırken veya dil değiştirildiğinde yapılabilir.
  // Şimdilik, getInitialFormValues'un bunu hallettiğini varsayıyoruz.

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Tedavi Tanıtım Alanı</h3>
      <FormField
        control={form.control}
        name={`introSection.definition.videoId`} // introVideoId -> introSection.definition.videoId
        render={({ field }) => (
          <FormItem>
            <FormLabel>Video ID (YouTube)</FormLabel>
            <FormControl>
              <Input placeholder="Örn: 2edpx39Iy8g" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`introSection.translations.${activeLang}.title`} // introTitle -> introSection.translations[activeLang].title
        render={({ field }) => (
          <FormItem>
            <FormLabel>Başlık *</FormLabel>
            <FormControl>
              <Input placeholder="Tanıtım başlığı..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`introSection.translations.${activeLang}.description`} // introDescription -> introSection.translations[activeLang].description
        render={({ field }) => (
          <FormItem>
            <FormLabel>Açıklama *</FormLabel>
            <FormControl>
              <Textarea placeholder="Tanıtım açıklaması..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <div className="grid grid-cols-2 gap-4">
         <FormField
            control={form.control}
            name={`introSection.translations.${activeLang}.primaryButtonText`}
            render={({ field }) => (
            <FormItem>
                <FormLabel>Birincil Buton Metni *</FormLabel>
                <FormControl>
                <Input placeholder="Ücretsiz Konsültasyon" {...field} value={field.value || ""} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
         <FormField
            control={form.control}
            name={`introSection.translations.${activeLang}.primaryButtonLink`}
            render={({ field }) => (
            <FormItem>
                <FormLabel>Birincil Buton Linki *</FormLabel>
                <FormControl>
                <Input placeholder="/iletisim veya #id" {...field} value={field.value || ""} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
       </div>
       <div className="grid grid-cols-2 gap-4">
         <FormField
            control={form.control}
            name={`introSection.translations.${activeLang}.secondaryButtonText`}
            render={({ field }) => (
            <FormItem>
                <FormLabel>İkincil Buton Metni *</FormLabel>
                <FormControl>
                <Input placeholder="Tedaviye Genel Bakış" {...field} value={field.value || ""} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
         <FormField
            control={form.control}
            name={`introSection.translations.${activeLang}.secondaryButtonLink`}
            render={({ field }) => (
            <FormItem>
                <FormLabel>İkincil Buton Linki *</FormLabel>
                <FormControl>
                <Input placeholder="#genel-bakis" {...field} value={field.value || ""} disabled={loading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
       </div>

      <div>
        <FormLabel>Tanıtım Linkleri (Sağ Sütun)</FormLabel>
        <div className="space-y-4 mt-2">
          {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-4 gap-4 items-center border p-3 rounded-md">
              <FormField
                control={form.control}
                name={`introSection.translations.${activeLang}.introLinks.${index}.number`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Sıra No (Metin) *</FormLabel>
                    <FormControl>
                      <Input placeholder="01" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`introSection.translations.${activeLang}.introLinks.${index}.text`}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                     <FormLabel className="text-xs">Link Metni *</FormLabel>
                    <FormControl>
                      <Input placeholder="Link metni..." {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`introSection.translations.${activeLang}.introLinks.${index}.targetId`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Hedef ID/URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="#id veya /link" {...field} value={field.value || ""} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end items-center">
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
            onClick={() => append({
              order: fields.length,
              targetId: "",
              number: "", // Doğrudan link öğesine ait
              text: ""   // Doğrudan link öğesine ait
            })}
            disabled={loading}
          >
            Link Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
