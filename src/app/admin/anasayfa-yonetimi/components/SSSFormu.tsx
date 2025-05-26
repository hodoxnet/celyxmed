'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FormLoadingSkeleton, MixedLoadingSkeleton } from './LoadingSkeletons';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Language } from '@/generated/prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Form için çeviri şeması
const faqTranslationSchema = z.object({ // Bu şema tek bir çeviri için kullanılacak
  languageCode: z.string().min(1, "Dil kodu gerekli"),
  question: z.string().min(1, "Soru gerekli"),
  answer: z.string().min(1, "Cevap gerekli"),
  id: z.string().optional(), 
});

// Ana SSS formu şeması
const faqFormSchema = z.object({
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
  translations: z.array(faqTranslationSchema).min(1, "En az bir çeviri eklenmeli"),
});

type FaqFormValues = z.infer<typeof faqFormSchema>;

interface SSSFormuProps {
  availableLanguages: Language[];
  activeLanguageCode: string; // Eklendi
  onSubmitSuccess: () => void;
  onCancel: () => void;
  faqIdToEdit?: string | null;
}

export default function SSSFormu({
  availableLanguages,
  activeLanguageCode, // Eklendi
  onSubmitSuccess,
  onCancel,
  faqIdToEdit,
}: SSSFormuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState("Yeni SSS Ekle");

  // Form şeması artık tek bir çeviriye odaklanacak, translations dizisi olmayacak
  // Ancak API'ye gönderirken ve API'den alırken translations dizisini yönetmemiz gerekecek.
  // Bu nedenle, formun state'i ile API'nin beklediği yapı arasında bir dönüşüm yapacağız.
  const singleTranslationFaqFormSchema = z.object({
    order: z.coerce.number().int().min(0),
    isPublished: z.boolean(),
    question: z.string().min(1, "Soru gerekli"),
    answer: z.string().min(1, "Cevap gerekli"),
  });
  type SingleTranslationFaqFormValues = z.infer<typeof singleTranslationFaqFormSchema>;

  const form = useForm<SingleTranslationFaqFormValues>({ // Form tipi güncellendi
    resolver: zodResolver(singleTranslationFaqFormSchema),
    defaultValues: {
      order: 0,
      isPublished: true,
      question: '',
      answer: '',
    },
  });

  // useFieldArray kaldırıldı

  const fetchData = useCallback(async () => {
    if (faqIdToEdit) {
      setIsLoading(true);
      setPageTitle("SSS Düzenle");
      try {
        const faqResponse = await fetch(`/api/admin/faqs/${faqIdToEdit}`);
        if (!faqResponse.ok) throw new Error('SSS verisi getirilemedi');
        const faqData = await faqResponse.json();
        
        const currentLangTranslation = faqData.translations.find((t: any) => t.languageCode === activeLanguageCode) || { question: '', answer: ''};
        
        form.reset({
          order: faqData.order,
          isPublished: faqData.isPublished,
          question: currentLangTranslation.question,
          answer: currentLangTranslation.answer,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Veri getirilirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setPageTitle("Yeni SSS Ekle");
      form.reset({ // Formu aktif dil için sıfırla
        order: 0, 
        isPublished: true,
        question: '',
        answer: '',
      });
    }
  }, [faqIdToEdit, form, activeLanguageCode]); // availableLanguages kaldırıldı, activeLanguageCode eklendi

  useEffect(() => {
    if(activeLanguageCode){ 
        fetchData();
    }
  }, [fetchData, activeLanguageCode]); // availableLanguages kaldırıldı, activeLanguageCode eklendi

  const onSubmit = async (formData: SingleTranslationFaqFormValues) => {
    setIsLoading(true);
    try {
      const apiUrl = faqIdToEdit ? `/api/admin/faqs/${faqIdToEdit}` : '/api/admin/faqs';
      const method = faqIdToEdit ? 'PUT' : 'POST';

      // API'ye göndermeden önce veriyi dönüştür
      let payload: FaqFormValues; // Bu tip ana SSS formu şemasından geliyor (translations dizisi ile)

      if (faqIdToEdit) {
        // Düzenleme: Mevcut SSS'nin diğer dillerdeki çevirilerini koru
        const existingFaqResponse = await fetch(`/api/admin/faqs/${faqIdToEdit}`);
        if (!existingFaqResponse.ok) throw new Error('Mevcut SSS verisi alınamadı.');
        const existingFaqData = await existingFaqResponse.json();
        
        const updatedTranslations = existingFaqData.translations.map((t: any) => {
          if (t.languageCode === activeLanguageCode) {
            return { ...t, question: formData.question, answer: formData.answer };
          }
          return t;
        });
        // Eğer aktif dil için çeviri yoksa, yeni çeviriyi ekle
        if (!updatedTranslations.some((t:any) => t.languageCode === activeLanguageCode)) {
            updatedTranslations.push({
                languageCode: activeLanguageCode,
                question: formData.question,
                answer: formData.answer,
            });
        }
        payload = {
          order: formData.order,
          isPublished: formData.isPublished,
          translations: updatedTranslations,
        };

      } else {
        // Yeni ekleme: Sadece aktif dil için çeviri oluştur
        payload = {
          order: formData.order,
          isPublished: formData.isPublished,
          translations: [{
            languageCode: activeLanguageCode,
            question: formData.question,
            answer: formData.answer,
          }],
        };
      }

      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `İşlem başarısız: ${response.statusText}` }));
        throw new Error(errorData.message || `İşlem başarısız: ${response.statusText}`);
      }
      toast.success(`SSS başarıyla ${faqIdToEdit ? 'güncellendi' : 'oluşturuldu'}!`);
      onSubmitSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  // handleAddTranslation kaldırıldı
  
  if (isLoading && !activeLanguageCode) { // Aktif dil kodu bekleniyor
    return <MixedLoadingSkeleton title="Aktif dil ayarlanıyor veya SSS verileri yükleniyor..." />;
  }
   if (isLoading) { // Sadece yükleme durumu
    return <FormLoadingSkeleton title="SSS verileri yükleniyor..." />;
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{pageTitle} ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4 p-6 border rounded-md">
                <h2 className="text-lg font-medium">Genel Bilgiler</h2>
                <div>
                    <Label htmlFor="order">Sıra</Label>
                    <Input id="order" type="number" {...form.register('order')} className="mt-1"/>
                    {form.formState.errors.order && <p className="text-sm text-red-500 mt-1">{form.formState.errors.order.message}</p>}
                </div>
                <div className="flex items-center space-x-2">
                    <Controller control={form.control} name="isPublished" render={({ field }) => ( <Checkbox id="isPublished" checked={field.value} onCheckedChange={field.onChange} /> )}/>
                    <Label htmlFor="isPublished" className="cursor-pointer">Yayınlandı</Label>
                </div>
                </div>

                {/* Çeviriler bölümü kaldırıldı, sadece aktif dil için alanlar gösterilecek */}
                <div className="p-6 border rounded-md space-y-4">
                    <h2 className="text-lg font-medium">İçerik ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</h2>
                    <div>
                        <Label htmlFor="question">Soru</Label>
                        <Input id="question" {...form.register('question')} className="mt-1" placeholder="Sıkça sorulan soru"/>
                        {form.formState.errors.question && <p className="text-sm text-red-500 mt-1">{form.formState.errors.question.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="answer">Cevap</Label>
                        <Textarea id="answer" {...form.register('answer')} className="mt-1" placeholder="Sorunun cevabı" rows={5}/>
                        {form.formState.errors.answer && <p className="text-sm text-red-500 mt-1">{form.formState.errors.answer.message}</p>}
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>İptal</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? (faqIdToEdit ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (faqIdToEdit ? 'Değişiklikleri Kaydet' : 'SSS Oluştur')}</Button>
                </div>
            </form>
        </CardContent>
    </Card>
  );
};
