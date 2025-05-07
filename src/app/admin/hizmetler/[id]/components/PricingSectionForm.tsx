"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { HizmetFormValues } from "./hizmet-form"; // Varsayılan olarak hizmet-form'dan import edilecek
import { Language } from "@/generated/prisma"; // Language tipi import edildi

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
  form: UseFormReturn<HizmetFormValues>;
  loading: boolean;
  activeLang: string;
  diller: Language[]; // diller prop'u eklendi
}

export function PricingSectionForm({ form, loading, activeLang, diller }: PricingSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pricingSection.definition.packages", // pricingPackages -> pricingSection.definition.packages
  });

  const createTranslationsForAllLanguages = () => {
    const translations: Record<string, any> = {};
    diller.forEach(lang => {
      translations[lang.code] = {
        languageCode: lang.code,
        title: "",
        price: "",
        features: [],
      };
    });
    return translations;
  };

  // Özellik ekleme ve silme fonksiyonları için yardımcı
  const getFeaturesPath = (packageIndex: number) => `pricingSection.definition.packages.${packageIndex}.translations.${activeLang}.features` as const;

  return (
    <div className="space-y-4 p-6 border rounded-md">
      <h3 className="text-lg font-medium">Fiyatlandırma Bölümü</h3>
      <FormField
        control={form.control}
        name={`pricingSection.translations.${activeLang}.title`} // pricingTitle -> pricingSection.translations[activeLang].title
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Başlığı *</FormLabel>
            <FormControl>
              <Input placeholder="Fiyatlandırma & Paketler" {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`pricingSection.translations.${activeLang}.description`} // pricingDescription -> pricingSection.translations[activeLang].description
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bölüm Açıklaması</FormLabel>
            <FormControl>
              <Textarea placeholder="Fiyatlandırma bölümü açıklaması..." {...field} value={field.value || ""} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Fiyat Paketleri</FormLabel>
        <div className="space-y-6 mt-2">
          {fields.map((item, packageIndex) => {
            const featuresPath = getFeaturesPath(packageIndex);
            const currentFeaturesArray = form.watch(featuresPath) || [];

            return (
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
                  name={`pricingSection.definition.packages.${packageIndex}.translations.${activeLang}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Paket Başlığı *</FormLabel>
                      <FormControl>
                        <Input placeholder="Standart Paket" {...field} value={field.value || ""} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`pricingSection.definition.packages.${packageIndex}.translations.${activeLang}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Fiyat *</FormLabel>
                      <FormControl>
                        <Input placeholder="$6,000 - $8,000" {...field} value={field.value || ""} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`pricingSection.definition.packages.${packageIndex}.isFeatured`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 pt-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                      </FormControl>
                      <FormLabel className="text-sm !mt-0">Öne Çıkan Paket</FormLabel>
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel className="text-sm">Paket Özellikleri</FormLabel>
                  <div className="space-y-2 mt-1">
                    {Array.isArray(currentFeaturesArray) && currentFeaturesArray.map((featureItem, featureIndex) => (
                      <div key={`${item.id}-feature-${featureIndex}`} className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name={`${featuresPath}.${featureIndex}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Özellik..." {...field} value={field.value || ""} disabled={loading} />
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
                            const currentFeatures = form.getValues(featuresPath) || [];
                            const updatedFeatures = currentFeatures.filter((_, i) => i !== featureIndex);
                            form.setValue(featuresPath, updatedFeatures, { shouldValidate: true, shouldDirty: true });
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
                        const currentFeatures = form.getValues(featuresPath) || [];
                        form.setValue(featuresPath, [...currentFeatures, ""], { shouldValidate: true, shouldDirty: true });
                      }}
                      disabled={loading}
                    >
                      Özellik Ekle
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({
              isFeatured: false,
              order: fields.length,
              translations: createTranslationsForAllLanguages(),
            })}
            disabled={loading}
          >
            Paket Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
