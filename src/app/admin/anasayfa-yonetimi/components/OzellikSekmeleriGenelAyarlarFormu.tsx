'use client';

import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// ShadcnTabs importları kaldırıldı
import { Save } from 'lucide-react';
import { toast } from "sonner";

// Dil verisi tipi
interface Language {
  code: string;
  name: string;
}

// Bölüm detayları çeviri şeması
const SectionTranslationSchema = z.object({
  languageCode: z.string(),
  mainTitle: z.string().optional(),
  mainDescription: z.string().optional(),
});

// Bölüm detayları form şeması
const sectionDetailsFormSchema = z.object({
  translations: z.array(SectionTranslationSchema).min(1),
});

type SectionDetailsFormValues = z.infer<typeof sectionDetailsFormSchema>;

// Bölüm detayları veri tipi (API'den gelen)
interface SectionDetailsData {
    id: string;
    translations: Array<{
        languageCode: string;
        mainTitle?: string | null;
        mainDescription?: string | null;
    }>;
}

interface OzellikSekmeleriGenelAyarlarFormuProps {
  activeLanguageCode: string;
  availableLanguages: Language[];
}

export default function OzellikSekmeleriGenelAyarlarFormu({ activeLanguageCode, availableLanguages }: OzellikSekmeleriGenelAyarlarFormuProps) {
  const [loadingSection, setLoadingSection] = useState(true);
  // languages ve activeLangTab prop'lardan gelecek
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionForm = useForm<SectionDetailsFormValues>({
    resolver: zodResolver(sectionDetailsFormSchema),
    defaultValues: {
      translations: [],
    },
  });

 useEffect(() => {
    const fetchInitialData = async () => {
      if (availableLanguages.length === 0 || !activeLanguageCode) return;
      setLoadingSection(true);
      setError(null);
      try {
        // Diller prop olarak geliyor
        const sectionResponse = await fetch('/api/admin/home-page-feature-tabs/section');
        if (!sectionResponse.ok) throw new Error('Bölüm detayları yüklenemedi.');
        const sectionData: SectionDetailsData = await sectionResponse.json();
        
        const formattedTranslations = availableLanguages.map(lang => {
            const existing = sectionData.translations.find(t => t.languageCode === lang.code);
            return {
                languageCode: lang.code,
                mainTitle: existing?.mainTitle || "",
                mainDescription: existing?.mainDescription || "",
            };
        });
        sectionForm.reset({ translations: formattedTranslations });
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingSection(false);
      }
    };
    fetchInitialData();
  }, [sectionForm, availableLanguages, activeLanguageCode]); // Bağımlılıklar güncellendi


  const onSectionSubmit = async (data: SectionDetailsFormValues) => {
    setIsSubmittingSection(true);
    try {
        const response = await fetch('/api/admin/home-page-feature-tabs/section', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Bölüm detayları güncellenirken bir hata oluştu.");
        }
        toast.success("Bölüm detayları başarıyla güncellendi!");
    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Güncelleme sırasında bir hata oluştu.");
    } finally {
        setIsSubmittingSection(false);
    }
  };

  if (loadingSection) return <p className="text-center py-10">Genel ayarlar yükleniyor...</p>;
  if (error) return <p className="text-red-500 bg-red-100 p-3 rounded-md">Hata: {error}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bölüm Genel Başlıkları ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</CardTitle>
      </CardHeader>
      <CardContent>
        {availableLanguages.length > 0 && activeLanguageCode ? (
          <Form {...sectionForm}>
            <form onSubmit={sectionForm.handleSubmit(onSectionSubmit)} className="space-y-6">
              {sectionForm.watch('translations')?.map((_, index) => {
                if (sectionForm.watch(`translations.${index}.languageCode`) !== activeLanguageCode) return null;
                return (
                  <div key={index} className="space-y-4 pt-2">
                    <FormField
                      control={sectionForm.control}
                      name={`translations.${index}.mainTitle`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ana Başlık</FormLabel>
                          <FormControl>
                            <Input placeholder="Ana başlık" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sectionForm.control}
                      name={`translations.${index}.mainDescription`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ana Açıklama</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ana açıklama" {...field} value={field.value || ''} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                );
              })}
              <Button type="submit" disabled={isSubmittingSection}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmittingSection ? "Kaydediliyor..." : "Genel Başlıkları Kaydet"}
              </Button>
            </form>
          </Form>
        ) : (
          <p>Aktif dil bulunamadı veya seçilmedi.</p>
        )}
      </CardContent>
    </Card>
  );
}
