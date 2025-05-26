"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { SubmitHandler, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Trash2, Eye, Upload, Loader2, X } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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

// --- Şema Tanımları (Çoklu Slug) ---
const blogBaseSchema = z.object({
  // slug kaldırıldı
  coverImageUrl: z.string().optional(),
  isPublished: z.boolean(),
});

const blogTranslationSchema = z.object({
  languageCode: z.string(),
  slug: z.string().min(1, "Slug zorunludur").refine(val => /^[a-z0-9-]+$/.test(val), { // Slug burada
    message: "Slug sadece küçük harfler, sayılar ve tire (-) içerebilir",
  }),
  title: z.string().min(1, "Başlık zorunludur"),
  fullDescription: z.string().min(1, "Açıklama zorunludur"),
  content: z.string().min(1, "İçerik zorunludur"),
  tocItems: z.any().optional(),
});

const blogFormSchema = blogBaseSchema.extend({
  translations: z.array(blogTranslationSchema), // min(1) kaldırıldı, filtreleyeceğiz
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNewBlog = id === 'ekle';

  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<string>('');

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
        // slug kaldırıldı
        coverImageUrl: '',
        isPublished: false,
        translations: [],
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "translations",
    keyName: "fieldId"
  });

  // Dil verilerini getir
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error('Diller yüklenirken hata oluştu');
        const data = await response.json();
        setLanguages(data);
        if (data.length > 0) {
          const defaultLang = data.find((l: any) => l.isDefault) || data[0];
          setActiveLanguage(defaultLang.code);
          if (isNewBlog) {
            const existing = form.getValues().translations.find(t => t.languageCode === defaultLang.code);
            if (!existing) {
                // append'e slug eklendi
                append({ languageCode: defaultLang.code, slug: '', title: '', fullDescription: '', content: '', tocItems: null });
            }
            setIsLoading(false);
          }
        } else {
            setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching languages:', err);
        toast.error('Diller yüklenirken bir hata oluştu.');
        setIsLoading(false);
      }
    };
    fetchLanguages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewBlog, append]);

  // Blog verilerini getir (düzenleme modu)
  useEffect(() => {
    if (isNewBlog || languages.length === 0 || !id || id === 'ekle') {
        return;
    }
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/admin/blogs/${id}`);
        if (!response.ok) {
           const errorData = await response.json().catch(() => ({ message: `Blog yüklenirken sunucu hatası (${response.status}) veya geçersiz JSON.` }));
           throw new Error(errorData.message || `Blog yüklenirken hata oluştu (${response.status})`);
        }
        const data = await response.json();
        form.reset({
            // slug kaldırıldı
            coverImageUrl: data.coverImageUrl || '',
            isPublished: data.isPublished ?? false,
            translations: Array.isArray(data.translations) ? data.translations : []
        });
        if (data.translations && data.translations.length > 0) {
            const firstTranslationLang = data.translations[0].languageCode;
            if (languages.some(l => l.code === firstTranslationLang)) setActiveLanguage(firstTranslationLang);
            else if (languages.length > 0) setActiveLanguage(languages[0].code);
        } else if (languages.length > 0) setActiveLanguage(languages[0].code);
      } catch (err: any) {
        console.error('Error fetching blog:', err);
        toast.error(err.message || 'Blog yüklenirken bilinmeyen bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, languages, form.reset]);


  // Form gönderildiğinde çalışacak fonksiyon
  const onSubmit: SubmitHandler<BlogFormValues> = async (values) => {
    // Sadece başlığı VE slug'ı dolu olan çevirileri filtrele
    const filteredTranslations = values.translations?.filter(
      (t) => t.title?.trim() !== '' && typeof t.slug === 'string' && t.slug.trim() !== ''
    ) || [];

    if (filteredTranslations.length === 0) {
      toast.error("Lütfen en az bir dil için başlık ve slug alanlarını doldurun.");
      if (languages.length > 0) setActiveLanguage(languages[0].code);
      return;
    }

    const finalValues = {
      ...values, // Ana slug yok
      translations: filteredTranslations,
    };

    setIsSaving(true);
    try {
      const url = isNewBlog ? '/api/admin/blogs' : `/api/admin/blogs/${id}`;
      const method = isNewBlog ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalValues), // Çoklu slug içeren veriyi gönder
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Sunucu hatası (${response.status}) veya geçersiz JSON yanıtı.` }));
        throw new Error(errorData.message || `Blog ${isNewBlog ? 'eklenirken' : 'güncellenirken'} bir hata oluştu`);
      }
      await response.json();
      toast.success(`Blog başarıyla ${isNewBlog ? 'eklendi' : 'güncellendi'}`);
      router.push('/admin/blog');
    } catch (err: any) {
      console.error(`Error ${isNewBlog ? 'creating' : 'updating'} blog:`, err);
      toast.error(err.message || `Blog ${isNewBlog ? 'eklenirken' : 'güncellenirken'} bir hata oluştu`);
    } finally {
      setIsSaving(false);
    }
  };

  // Sekme değiştiğinde çeviri objesini oluşturan/getiren fonksiyon
  const handleTabChange = (languageCode: string) => {
    setActiveLanguage(languageCode);
    const currentTranslations = form.getValues().translations || [];
    const existingTranslation = currentTranslations.find(t => t.languageCode === languageCode);
    if (!existingTranslation) {
        // append'e slug eklendi
        append({ languageCode, slug: '', title: '', fullDescription: '', content: '', tocItems: null });
    }
  };

  const getLanguageName = (code: string) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  const translatedLanguages = fields.map(field => field.languageCode);

  return (
    <div className="container mx-auto py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={() => router.push('/admin/blog')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Geri
              </Button>
              <h1 className="text-3xl font-bold">{isNewBlog ? 'Yeni Blog Yazısı' : 'Blog Yazısını Düzenle'}</h1>
            </div>
            <div className="flex items-center space-x-2">
              {!isNewBlog && activeLanguage && ( // Önizleme butonu aktif dilin slug'ını kullanacak
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const activeFieldIndex = fields.findIndex(f => f.languageCode === activeLanguage);
                    const currentSlug = activeFieldIndex !== -1 ? form.getValues().translations[activeFieldIndex]?.slug : undefined;
                    if (currentSlug) {
                      router.push(`/blog/${currentSlug}`); // TODO: Locale ekle
                    } else {
                      toast.info("Bu dil için geçerli bir slug bulunamadı.");
                    }
                  }}
                  disabled={!fields.some(f => f.languageCode === activeLanguage && form.getValues().translations[fields.findIndex(field => field.languageCode === f.languageCode)]?.slug)}
                >
                  <Eye className="mr-2 h-4 w-4" /> Önizleme ({getLanguageName(activeLanguage)})
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSaving || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>

          {isLoading ? (
             <div className="space-y-6"> {/* Skeleton */} </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sol panel - Genel Ayarlar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-lg border p-6 space-y-6">
                  <h2 className="text-xl font-semibold border-b pb-2">Genel Ayarlar</h2>
                  {/* Slug Alanı Kaldırıldı */}
                  <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kapak Görseli</FormLabel>
                        <FormControl>
                          <ImageUpload
                            onImageUploaded={(url) => form.setValue('coverImageUrl', url, { shouldValidate: true, shouldDirty: true })}
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
                </div>
              </div>

              {/* Sağ panel - Dil sekmeleri */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg border p-6">
                  <Tabs
                    value={activeLanguage}
                    onValueChange={handleTabChange}
                  >
                    <div className="border-b mb-6">
                      <TabsList className="bg-transparent border-0 p-0 gap-4">
                        {languages.map((lang) => (
                          <TabsTrigger
                            key={lang.code}
                            value={lang.code}
                            className={`py-2 px-3 border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                              fields.some(f => f.languageCode === lang.code) ? 'font-medium' : 'text-gray-500'
                            }`}
                          >
                            {lang.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                    {fields.map((field, index) => {
                      const lang = languages.find(l => l.code === field.languageCode);
                      if (!lang) return null;
                      return (
                        <TabsContent key={field.fieldId} value={field.languageCode} forceMount className="m-0 data-[state=inactive]:hidden">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h2 className="text-xl font-semibold">
                                {lang.name} <span className="text-sm font-normal text-gray-500">({lang.code})</span>
                              </h2>
                            </div>
                            <FormField
                              control={form.control}
                              name={`translations.${index}.title`}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>Başlık</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...formField}
                                      placeholder={`${lang.name} başlık`}
                                      onChange={(e) => {
                                        const titleValue = e.target.value;
                                        formField.onChange(titleValue);
                                        const newSlug = generateSlug(titleValue);
                                        form.setValue(`translations.${index}.slug`, newSlug, { shouldValidate: true, shouldDirty: true });
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             {/* Slug Alanı Geri Eklendi */}
                             <FormField
                              control={form.control}
                              name={`translations.${index}.slug`}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>Slug</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...formField}
                                      placeholder={`${lang.name} için otomatik oluşturulan slug`}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Başlığa göre otomatik oluşturulur. Gerekirse düzenleyebilirsiniz.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`translations.${index}.fullDescription`}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>Açıklama</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...formField}
                                      placeholder={`${lang.name} açıklama`}
                                      rows={4}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`translations.${index}.content`}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>İçerik</FormLabel>
                                  <FormControl>
                                    <div className="min-h-[400px]">
                                      <RichTextEditor
                                        value={formField.value || ''}
                                        onChange={(content) => {
                                          formField.onChange(content);
                                          // TOC update logic
                                          const translations = [...form.getValues().translations];
                                          if (translations[index]) {
                                            translations[index].content = content;
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
                                                translations[index].tocItems = tocItems.length > 0 ? tocItems : [];
                                              } catch (err) {
                                                console.error('TOC extraction error:', err);
                                                if (translations[index]) translations[index].tocItems = [];
                                              }
                                            }
                                            form.setValue('translations', translations, { shouldDirty: true, shouldTouch: true });
                                          }
                                        }}
                                        placeholder={`${lang.name} içerik`}
                                        toolbarId={`toolbar-${lang.code}`}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
