"use client";

"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs as ShadcnTabs, TabsContent as ShadcnTabsContent, TabsList as ShadcnTabsList, TabsTrigger as ShadcnTabsTrigger } from "@/components/ui/tabs"; // Shadcn UI Tabs için yeniden adlandırma
import { PlusCircle, Edit, Trash2, Save } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";

// Dil verisi tipi
interface Language {
  code: string;
  name: string;
}

// Sekme öğesi veri tipi
interface FeatureTabItem {
  id: string;
  value: string;
  order: number;
  isPublished: boolean;
  translations: Array<{
    languageCode: string;
    triggerText: string;
    heading: string;
    // Diğer çeviri alanları eklenebilir
  }>;
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


export default function FeatureTabsAdminPage() {
  const [items, setItems] = useState<FeatureTabItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [sectionDetails, setSectionDetails] = useState<SectionDetailsData | null>(null);
  const [loadingSection, setLoadingSection] = useState(true);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeLangTab, setActiveLangTab] = useState("");
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
      setLoadingItems(true);
      setLoadingSection(true);
      setError(null);
      try {
        // Dilleri çek
        const langResponse = await fetch('/api/languages');
        if (!langResponse.ok) throw new Error('Diller yüklenemedi.');
        const langData = await langResponse.json();
        const activeLanguages: Language[] = langData.filter((lang: any) => lang.isActive).map((lang: any) => ({ code: lang.code, name: lang.name }));
        setLanguages(activeLanguages);
        if (activeLanguages.length > 0) {
            setActiveLangTab(activeLanguages[0].code);
        }

        // Bölüm detaylarını çek
        const sectionResponse = await fetch('/api/admin/home-page-feature-tabs/section');
        if (!sectionResponse.ok) throw new Error('Bölüm detayları yüklenemedi.');
        const sectionData: SectionDetailsData = await sectionResponse.json();
        setSectionDetails(sectionData);
        // Formu doldur
        const formattedTranslations = activeLanguages.map(lang => {
            const existing = sectionData.translations.find(t => t.languageCode === lang.code);
            return {
                languageCode: lang.code,
                mainTitle: existing?.mainTitle || "",
                mainDescription: existing?.mainDescription || "",
            };
        });
        sectionForm.reset({ translations: formattedTranslations });
        setLoadingSection(false);

        // Sekme öğelerini çek
        const itemsResponse = await fetch('/api/admin/home-page-feature-tabs/items');
        if (!itemsResponse.ok) throw new Error('Sekme öğeleri yüklenemedi.');
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingItems(false);
        // setLoadingSection zaten yukarıda false yapılıyor
      }
    };
    fetchInitialData();
  }, [sectionForm]);


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
        // Veriyi yeniden çekmeye gerek yok, form zaten güncel
    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Güncelleme sırasında bir hata oluştu.");
    } finally {
        setIsSubmittingSection(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/home-page-feature-tabs/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Öğe silinirken bir hata oluştu.');
      }
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast.success("Öğe başarıyla silindi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silme işlemi sırasında bir hata oluştu.");
      console.error("Silme hatası:", err);
    }
  };

  if (loadingItems || loadingSection) return <p className="text-center py-10">Yükleniyor...</p>;
  // Error state'i burada gösterilmiyor, toast ile gösteriliyor. İstenirse eklenebilir.

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center"> {/* mb-6 kaldırıldı, genel space-y-8 kullanılacak */}
        <h1 className="text-3xl font-semibold">Özellik Sekmeleri Yönetimi</h1>
        <Button asChild>
          <Link href="/admin/home-page-feature-tabs/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Sekme Ekle
          </Link>
        </Button>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">Hata: {error}</p>}

      {/* Bölüm Detayları Formu */}
      <Card>
        <CardHeader>
          <CardTitle>Bölüm Genel Başlıkları</CardTitle>
        </CardHeader>
        <CardContent>
          {languages.length > 0 ? (
            <Form {...sectionForm}>
              <form onSubmit={sectionForm.handleSubmit(onSectionSubmit)} className="space-y-6">
                <ShadcnTabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
                  <div className="overflow-x-auto pb-2 mb-4">
                    <ShadcnTabsList className="inline-flex h-auto items-center justify-start rounded-lg bg-gray-100 p-1 dark:bg-gray-800 space-x-1 whitespace-nowrap">
                      {languages.map((lang) => (
                        <ShadcnTabsTrigger
                          key={lang.code}
                          value={lang.code}
                          className="px-3 py-1.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white rounded-md"
                        >
                          {lang.name}
                        </ShadcnTabsTrigger>
                      ))}
                    </ShadcnTabsList>
                  </div>
                  {sectionForm.watch('translations')?.map((_, index) => (
                    <ShadcnTabsContent key={languages[index].code} value={languages[index].code}>
                      <div className="space-y-4 pt-2">
                        <FormField
                          control={sectionForm.control}
                          name={`translations.${index}.mainTitle`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ana Başlık ({languages[index].name})</FormLabel>
                              <FormControl>
                                <Input placeholder={`Ana başlık (${languages[index].name})`} {...field} value={field.value || ''} />
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
                              <FormLabel>Ana Açıklama ({languages[index].name})</FormLabel>
                              <FormControl>
                                <Textarea placeholder={`Ana açıklama (${languages[index].name})`} {...field} value={field.value || ''} rows={3} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </ShadcnTabsContent>
                  ))}
                </ShadcnTabs>
                <Button type="submit" disabled={isSubmittingSection}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmittingSection ? "Kaydediliyor..." : "Genel Başlıkları Kaydet"}
                </Button>
              </form>
            </Form>
          ) : (
            <p>Aktif dil bulunamadı. Lütfen önce dil ayarlarından dil ekleyin.</p>
          )}
        </CardContent>
      </Card>
      
      {/* Sekme Öğeleri Listesi */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Sekme Öğeleri</h2>
      {items.length === 0 && !loadingItems && !error && (
        <p className="text-center text-gray-500 py-8">Henüz hiç özellik sekmesi eklenmemiş.</p>
      )}

      {items.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sıra</TableHead>
                <TableHead>Değer (Value)</TableHead>
                <TableHead>Başlık (TR)</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const trTranslation = item.translations.find(t => t.languageCode === 'tr');
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.order}</TableCell>
                    <TableCell className="font-medium">{item.value}</TableCell>
                    <TableCell>{trTranslation?.triggerText || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={item.isPublished ? 'default' : 'outline'}>
                        {item.isPublished ? 'Yayında' : 'Taslak'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild className="mr-2">
                        <Link href={`/admin/home-page-feature-tabs/${item.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
