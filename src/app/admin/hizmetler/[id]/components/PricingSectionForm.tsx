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

interface PricingSectionFormProps {
  form: UseFormReturn<HizmetDetayFormValues>;
  loading: boolean;
}

export function PricingSectionForm({ form, loading }: PricingSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pricingPackages",
  });

  // Özellikler için iç içe field array yönetimi
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
      control: form.control,
      // name: `pricingPackages.${index}.features` // Bu dinamik olmalı, render içinde yönetilecek
      // Şimdilik bu şekilde bırakalım, render içinde index ile erişeceğiz.
      name: "pricingPackages" // Ana array'i izlemesi yeterli olabilir
  });


  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Fiyatlandırma Bölümü</h3>
      <FormField
        control={form.control}
        name="pricingTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Fiyatlandırma & Paketler" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="pricingDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması</FormLabel>
            <FormControl>
              <Textarea placeholder="Fiyatlandırma bölümü açıklaması..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Fiyat Paketleri (Field Array) */}
      <div>
        <FormLabel>Fiyat Paketleri</FormLabel>
        <div className="space-y-6 mt-2">
          {fields.map((item, packageIndex) => (
            <div key={item.id} className="border p-4 rounded-md space-y-4 relative">
               <Button
                 type="button"
                 variant="destructive"
                 size="sm"
                 onClick={() => remove(packageIndex)}
                 disabled={loading}
                 className="absolute top-2 right-2"
               >
                 <Trash className="h-4 w-4" />
               </Button>
               <h4 className="text-md font-medium border-b pb-2">Paket {packageIndex + 1}</h4>
               <FormField
                control={form.control}
                name={`pricingPackages.${packageIndex}.title`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Paket Başlığı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Standart Paket" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`pricingPackages.${packageIndex}.price`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-xs">Fiyat *</FormLabel>
                    <FormControl>
                      <Input placeholder="$6,000 - $8,000" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`pricingPackages.${packageIndex}.isFeatured`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 pt-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                    </FormControl>
                    <FormLabel className="text-sm !mt-0">Öne Çıkan Paket</FormLabel>
                  </FormItem>
                )}
              />

              {/* Paket Özellikleri (İç İçe Field Array) */}
              <div>
                 <FormLabel className="text-sm">Paket Özellikleri</FormLabel>
                 <div className="space-y-2 mt-1">
                    {(form.getValues(`pricingPackages.${packageIndex}.features`) || []).map((feature, featureIndex) => (
                         <div key={`${item.id}-feature-${featureIndex}`} className="flex items-center space-x-2">
                             <FormField
                                control={form.control}
                                name={`pricingPackages.${packageIndex}.features.${featureIndex}`}
                                render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                    <Input placeholder="Özellik..." {...field} disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    const currentFeatures = form.getValues(`pricingPackages.${packageIndex}.features`) || [];
                                    const updatedFeatures = currentFeatures.filter((_, i) => i !== featureIndex);
                                    form.setValue(`pricingPackages.${packageIndex}.features`, updatedFeatures, { shouldValidate: true, shouldDirty: true });
                                }}
                                disabled={loading}
                                className="text-muted-foreground hover:text-destructive"
                             >
                                 <Trash className="h-3 w-3" />
                             </Button>
                         </div>
                    ))}
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                             const currentFeatures = form.getValues(`pricingPackages.${packageIndex}.features`) || [];
                             form.setValue(`pricingPackages.${packageIndex}.features`, [...currentFeatures, ""], { shouldValidate: true, shouldDirty: true });
                        }}
                        disabled={loading}
                    >
                        Özellik Ekle
                    </Button>
                 </div>
              </div>
              {/* TODO: Sıralama için sürükle bırak eklenebilir */}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ title: "", price: "", features: [], isFeatured: false, order: fields.length })}
            disabled={loading}
          >
            Paket Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
