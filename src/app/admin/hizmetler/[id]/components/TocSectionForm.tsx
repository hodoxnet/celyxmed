"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { useState, useEffect, useRef } from "react";

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
import { Trash, AlertCircle } from "lucide-react";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface TocSectionFormProps {
  form: UseFormReturn<any>; // Şimdilik any
  loading: boolean;
  activeLang: string; // Aktif dili ekle
}

// Her dil için TOC öğelerini izole edebilmek için dil bazlı cache
interface LanguageTocCache {
  [langCode: string]: {
    items: any[];
    lastUpdated: number;
  }
}

export function TocSectionForm({ form, loading, activeLang }: TocSectionFormProps) {
  // Dile özgü alan adları - dil değişiminde otomatik olarak güncellenir
  const tocItemsFieldName = `tocSection.translations.${activeLang}.tocItems` as const;
  const tocTitleFieldName = `tocSection.translations.${activeLang}.tocTitle` as const;
  const tocAuthorInfoFieldName = `tocSection.translations.${activeLang}.tocAuthorInfo` as const;
  const tocCtaDescriptionFieldName = `tocSection.translations.${activeLang}.tocCtaDescription` as const;

  // Dil değişikliğini izlemek için referans ve mevcut dil
  const previousLangRef = useRef<string>(activeLang);
  const [isLanguageSwitch, setIsLanguageSwitch] = useState<boolean>(false);
  
  // Her dil için ayrı bir öğe listesi cache'i tutacağız
  const tocItemsCacheRef = useRef<LanguageTocCache>({});
  
  // useFieldArray'i dil bazlı yapılandır
  const { 
    fields, 
    append, 
    remove, 
    replace 
  } = useFieldArray({
    control: form.control,
    name: tocItemsFieldName,
  });

  // Derin klonlama yardımcı fonksiyonu
  const deepClone = <T extends object>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  };

  // Dil değişiminde yapılacak işlemler
  useEffect(() => {
    const prevLang = previousLangRef.current;
    
    // Eğer dil değiştiyse
    if (activeLang !== prevLang) {
      console.log(`[TOC] Dil değişimi algılandı: ${prevLang} -> ${activeLang}`);
      setIsLanguageSwitch(true);
      
      try {
        // 1. Önceki dildeki öğeleri cache'e kaydet
        const prevTocItems = form.getValues(`tocSection.translations.${prevLang}.tocItems`) || [];
        
        // Önceki öğeler varsa cache'e kaydet
        if (prevTocItems && prevTocItems.length > 0) {
          tocItemsCacheRef.current[prevLang] = {
            items: deepClone(prevTocItems),
            lastUpdated: Date.now()
          };
          console.log(`[TOC] ${prevLang} dilindeki ${prevTocItems.length} öğe cache'e kaydedildi.`);
        }
        
        // 2. Yeni dildeki öğeleri form değerlerinden al
        const currentTocItems = form.getValues(tocItemsFieldName) || [];
        console.log(`[TOC] ${activeLang} dilinde ${currentTocItems.length} öğe bulundu.`);
        
        // 3. fields dizisini doğru dile özgü öğelerle yenile
        // Bu, görünümü yeni dilin öğeleriyle tamamen günceller
        if (currentTocItems && Array.isArray(currentTocItems)) {
          replace(currentTocItems);
        } else {
          // Eğer yoksa boş bir dizi ile başlat
          replace([]);
        }
      } catch (error) {
        console.error("[TOC] Dil değişimi sırasında hata:", error);
        // Hata durumunda da dil değişimini işle
        replace([]);
      }
      
      // 4. Referansı güncelle
      previousLangRef.current = activeLang;
      
      // 5. Bir süre sonra dil değişikliği durumunu kapat
      setTimeout(() => {
        setIsLanguageSwitch(false);
      }, 1000);
    }
  }, [activeLang, form, replace, tocItemsFieldName]);

  // Öğe ekleme işlevi - sadece aktif dile ekler
  const handleAppendItem = () => {
    // Yeni bir öğe oluştur
    const newItem = { 
      text: "", 
      isBold: false, 
      level: undefined, 
      order: fields.length 
    };
    
    // Öğeyi sadece mevcut dil için ekle
    append(newItem);
    
    // Dil bazlı TOC cache'ini güncelle
    const currentItems = form.getValues(tocItemsFieldName) || [];
    
    // Cache'i güncelle
    tocItemsCacheRef.current[activeLang] = {
      items: deepClone([...currentItems, newItem]),
      lastUpdated: Date.now()
    };
    
    console.log(`[TOC] ${activeLang} diline yeni öğe eklendi. Toplam: ${currentItems.length + 1}`);
  };
  
  // Öğe silme işlevi - sadece aktif dilden siler
  const handleRemoveItem = (index: number) => {
    // Öğeyi sil
    remove(index);
    
    // Dil bazlı TOC cache'ini güncelle
    setTimeout(() => {
      const updatedItems = form.getValues(tocItemsFieldName) || [];
      
      // Cache'i güncelle
      tocItemsCacheRef.current[activeLang] = {
        items: deepClone(updatedItems),
        lastUpdated: Date.now()
      };
      
      console.log(`[TOC] ${activeLang} dilinden öğe silindi. Kalan: ${updatedItems.length}`);
    }, 100);
  };
  
  return (
    <div className="space-y-4 p-6 border rounded-md">
      {/* Dil değişikliği sırasında uyarı göster */}
      {isLanguageSwitch && (
        <Alert className="mb-4 bg-muted/80">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Dil değişikliği</AlertTitle>
          <AlertDescription>
            {activeLang.toUpperCase()} diline ait içerik öğelerini görüntülüyorsunuz. Bu öğeler diğer dillerden bağımsızdır.
          </AlertDescription>
        </Alert>
      )}
    
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">İçindekiler (TOC) & Sağ CTA ({activeLang.toUpperCase()})</h3>
        
        {/* Modül durumu kontrolleri */}
        <div className="flex items-center space-x-4">
          <FormField
            control={form.control}
            name="moduleStates.tocSection.isActive"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox 
                    checked={field.value !== false} 
                    onCheckedChange={field.onChange} 
                    disabled={loading} 
                  />
                </FormControl>
                <FormLabel className="text-sm !mt-0">Aktif</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </div>
      <FormField
        control={form.control}
        name={tocTitleFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>İçindekiler Başlığı ({activeLang.toUpperCase()}) *</FormLabel>
            <FormControl>
              <Input placeholder="İçindekiler" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={tocAuthorInfoFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Yazar/Güncelleme Bilgisi ({activeLang.toUpperCase()})</FormLabel>
            <FormControl>
              <Input placeholder="Op. Dr. İsim Soyisim - Son Güncelleme: Tarih" {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={tocCtaDescriptionFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sağ Sütun CTA Açıklaması ({activeLang.toUpperCase()}) *</FormLabel>
            <FormControl>
              <Textarea placeholder="Sağ sütunda görünecek kısa tanıtım/CTA metni..." {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* İçindekiler Öğeleri - tamamen dile izole edilmiş */}
      <div>
        <div className="flex justify-between items-center">
          <FormLabel>İçindekiler Öğeleri ({activeLang.toUpperCase()})</FormLabel>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {fields.length} öğe
          </span>
        </div>
        
        <div className="space-y-4 mt-2">
          {/* Öğeler listesi */}
          {fields.map((item, index) => (
            <div 
              key={item.id} 
              className="flex items-center space-x-4 border p-3 rounded-md hover:border-primary/30 hover:bg-accent/30 transition-colors"
            >
              <span className="text-sm font-medium">{index + 1}.</span>
              <FormField
                control={form.control}
                name={`${tocItemsFieldName}.${index}.text`}
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
                name={`${tocItemsFieldName}.${index}.isBold`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                        disabled={loading} 
                      />
                    </FormControl>
                    <FormLabel className="text-sm !mt-0">Kalın</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${tocItemsFieldName}.${index}.level`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Seviye"
                        {...field}
                        onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                        value={field.value ?? ''}
                        className="w-20"
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button 
                type="button" 
                variant="destructive" 
                size="sm" 
                onClick={() => handleRemoveItem(index)} 
                disabled={loading}
                title="Öğeyi sil"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {/* Boş durum */}
          {fields.length === 0 && (
            <div className="text-center text-muted-foreground p-4 border border-dashed rounded-md mt-4">
              <p>Henüz {activeLang.toUpperCase()} dili için içindekiler öğesi eklenmemiş.</p>
            </div>
          )}
          
          {/* Öğe ekleme butonu */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAppendItem}
            disabled={loading}
            className="mt-2"
          >
            Öğe Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
