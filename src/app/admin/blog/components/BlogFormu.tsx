"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import RichTextEditor from '@/components/admin/rich-text-editor';
import ImageUpload from '@/components/admin/image-upload';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Language } from '@/generated/prisma/client';

// Slug oluşturma yardımcı fonksiyonu
const generateSlug = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Şema Tanımları
const blogBaseSchema = z.object({
  coverImageUrl: z.string().optional(),
  isPublished: z.boolean(),
});

const blogTranslationSchema = z.object({
  languageCode: z.string(),
  slug: z.string().min(1, "Slug zorunludur").refine(val => /^[a-z0-9-]+$/.test(val), {
    message: "Slug sadece küçük harfler, sayılar ve tire (-) içerebilir",
  }),
  title: z.string().min(1, "Başlık zorunludur"),
  fullDescription: z.string().min(1, "Açıklama zorunludur"),
  content: z.string().min(1, "İçerik zorunludur"),
  tocItems: z.any().optional(),
});

const blogFormSchema = blogBaseSchema; // Sadece genel ayarlar için

type BlogFormValues = z.infer<typeof blogFormSchema>;

interface BlogFormuProps {
  onSubmitSuccess: () => void;
  onCancel: () => void;
  blogIdToEdit: string | null;
  availableLanguages: Language[];
  activeLanguageCode: string;
}

export default function BlogFormu({ 
  onSubmitSuccess, 
  onCancel, 
  blogIdToEdit, 
  availableLanguages, 
  activeLanguageCode 
}: BlogFormuProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<string>(activeLanguageCode);
  const isNewBlog = !blogIdToEdit;

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      coverImageUrl: '',
      isPublished: false,
    },
    mode: 'onBlur',
  });

  // Manual translations yönetimi
  const [translations, setTranslations] = useState<any[]>([]);

  // Blog verilerini getir (düzenleme modu)
  useEffect(() => {
    if (isNewBlog) {
      // Yeni blog için varsayılan dil çevirisini ekle
      if (availableLanguages.length > 0) {
        const defaultLang = availableLanguages.find((l: any) => l.isDefault) || availableLanguages[0];
        setActiveLanguage(defaultLang.code);
        setTranslations([{
          languageCode: defaultLang.code, 
          slug: '', 
          title: '', 
          fullDescription: '', 
          content: '', 
          tocItems: null 
        }]);
      }
      setIsLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/admin/blogs/${blogIdToEdit}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            message: `Blog yüklenirken sunucu hatası (${response.status}) veya geçersiz JSON.` 
          }));
          throw new Error(errorData.message || `Blog yüklenirken hata oluştu (${response.status})`);
        }
        const data = await response.json();
        form.reset({
          coverImageUrl: data.coverImageUrl || '',
          isPublished: data.isPublished ?? false,
        });
        
        // Translations state'ini güncelle
        setTranslations(Array.isArray(data.translations) ? data.translations : []);
        
        if (data.translations && data.translations.length > 0) {
          const firstTranslationLang = data.translations[0].languageCode;
          if (availableLanguages.some(l => l.code === firstTranslationLang)) {
            setActiveLanguage(firstTranslationLang);
          } else if (availableLanguages.length > 0) {
            setActiveLanguage(availableLanguages[0].code);
          }
        } else if (availableLanguages.length > 0) {
          setActiveLanguage(availableLanguages[0].code);
        }
      } catch (err: any) {
        console.error('Error fetching blog:', err);
        toast.error(err.message || 'Blog yüklenirken bilinmeyen bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    if (availableLanguages.length > 0) {
      fetchBlog();
    }
  }, [blogIdToEdit, availableLanguages, form, isNewBlog]);

  // Aktif dil için kaydetme fonksiyonu
  const saveActiveLanguage = async () => {
    const values = form.getValues();
    const activeTranslation = translations.find(t => t.languageCode === activeLanguage);
    
    if (!activeTranslation) {
      toast.error("Aktif dil bulunamadı.");
      return;
    }

    // Sadece aktif dil için validation
    if (!activeTranslation?.title?.trim() || !activeTranslation?.slug?.trim()) {
      toast.error(`${getLanguageName(activeLanguage)} dili için başlık ve slug zorunludur.`);
      return;
    }

    const finalValues = {
      coverImageUrl: values.coverImageUrl,
      isPublished: values.isPublished,
      translations: [activeTranslation], // Sadece aktif dili gönder
    };

    setIsSaving(true);
    try {
      const url = isNewBlog ? '/api/admin/blogs' : `/api/admin/blogs/${blogIdToEdit}`;
      const method = isNewBlog ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalValues),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `Sunucu hatası (${response.status}) veya geçersiz JSON yanıtı.` 
        }));
        throw new Error(errorData.message || `${getLanguageName(activeLanguage)} çevirisi ${isNewBlog ? 'eklenirken' : 'güncellenirken'} bir hata oluştu`);
      }
      const result = await response.json();
      toast.success(`${getLanguageName(activeLanguage)} çevirisi başarıyla ${isNewBlog ? 'eklendi' : 'güncellendi'}`);
      
      // İlk kayıt sonrası edit moduna geç
      if (isNewBlog && result?.id) {
        // Blog ID'yi güncelle
        window.history.replaceState(null, '', `/admin/blog?module=blog-add&edit=${result.id}`);
      }
    } catch (err: any) {
      console.error(`Error ${isNewBlog ? 'creating' : 'updating'} blog translation:`, err);
      toast.error(err.message || `${getLanguageName(activeLanguage)} çevirisi ${isNewBlog ? 'eklenirken' : 'güncellenirken'} bir hata oluştu`);
    } finally {
      setIsSaving(false);
    }
  };

  // Aktif dil değiştiğinde çeviri objesini oluşturan/getiren fonksiyon
  useEffect(() => {
    if (!activeLanguageCode) return;
    
    setActiveLanguage(activeLanguageCode);
    const existingTranslation = translations.find(t => t.languageCode === activeLanguageCode);
    if (!existingTranslation) {
      // Sadece yoksa ekle, var olanları değiştirme
      const newTranslation = { 
        languageCode: activeLanguageCode, 
        slug: '', 
        title: '', 
        fullDescription: '', 
        content: '', 
        tocItems: null 
      };
      setTranslations(prev => [...prev, newTranslation]);
    }
  }, [activeLanguageCode]);

  const getLanguageName = (code: string) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Geri
            </Button>
            <CardTitle>{isNewBlog ? 'Yeni Blog Yazısı' : 'Blog Yazısını Düzenle'}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={saveActiveLanguage}
              disabled={isSaving || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Kaydediliyor...' : `${getLanguageName(activeLanguage)} Kaydet`}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sol panel - Genel Ayarlar */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Genel Ayarlar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="coverImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kapak Görseli</FormLabel>
                          <FormControl>
                            <ImageUpload
                              onImageUploaded={(url) => form.setValue('coverImageUrl', url, { 
                                shouldValidate: true, 
                                shouldDirty: true 
                              })}
                              showPreview={true}
                              initialImage={field.value}
                              buttonText="Kapak Görseli Yükle"
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            Blog yazısının ana görseli.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Yayın Durumu</FormLabel>
                            <FormDescription>
                              Blog yazısını hemen yayınla
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sağ panel - Aktif dil içeriği */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {getLanguageName(activeLanguage)} İçeriği
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(() => {
                      const activeTranslation = translations.find(t => t.languageCode === activeLanguage);
                      if (!activeTranslation) return null;
                      
                      // Helper fonksiyon: Aktif çeviriyi güncelle
                      const updateActiveTranslation = (field: string, value: any) => {
                        setTranslations(prev => prev.map(t => 
                          t.languageCode === activeLanguage 
                            ? { ...t, [field]: value }
                            : t
                        ));
                      };
                      
                      return (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Başlık</label>
                            <Input
                              value={activeTranslation.title || ''}
                              placeholder={`${getLanguageName(activeLanguage)} başlık`}
                              onChange={(e) => {
                                const titleValue = e.target.value;
                                updateActiveTranslation('title', titleValue);
                                const newSlug = generateSlug(titleValue);
                                updateActiveTranslation('slug', newSlug);
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Slug</label>
                            <Input
                              value={activeTranslation.slug || ''}
                              placeholder={`${getLanguageName(activeLanguage)} için otomatik oluşturulan slug`}
                              onChange={(e) => {
                                updateActiveTranslation('slug', e.target.value);
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Başlığa göre otomatik oluşturulur. Gerekirse düzenleyebilirsiniz.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Açıklama</label>
                            <Textarea
                              value={activeTranslation.fullDescription || ''}
                              placeholder={`${getLanguageName(activeLanguage)} açıklama`}
                              rows={4}
                              onChange={(e) => {
                                updateActiveTranslation('fullDescription', e.target.value);
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">İçerik</label>
                            <div className="min-h-[400px]">
                              <RichTextEditor
                                value={activeTranslation.content || ''}
                                onChange={(content) => {
                                  updateActiveTranslation('content', content);
                                  // TOC update logic
                                  if (typeof window !== 'undefined') {
                                    try {
                                      const parser = new DOMParser();
                                      const doc = parser.parseFromString(content, 'text/html');
                                      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
                                      const tocItems = Array.from(headings).map((heading) => {
                                        const text = heading.textContent || '';
                                        const id = heading.id || generateSlug(text);
                                        return { id, text, level: parseInt(heading.tagName.substring(1)) };
                                      });
                                      updateActiveTranslation('tocItems', tocItems.length > 0 ? tocItems : []);
                                    } catch (err) {
                                      console.error('TOC extraction error:', err);
                                      updateActiveTranslation('tocItems', []);
                                    }
                                  }
                                }}
                                placeholder={`${getLanguageName(activeLanguage)} içerik`}
                                toolbarId={`toolbar-${activeLanguage}`}
                              />
                            </div>
                          </div>
                          
                          {/* Aktif dil kaydet butonu */}
                          <div className="pt-6 border-t">
                            <Button
                              onClick={saveActiveLanguage}
                              disabled={isSaving || isLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                              {isSaving ? 'Kaydediliyor...' : `${getLanguageName(activeLanguage)} Kaydet`}
                            </Button>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}