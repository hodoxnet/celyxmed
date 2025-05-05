"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { SubmitHandler } from 'react-hook-form'; // SubmitHandler tipini import et
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Trash2, Eye, Upload, Loader2, X } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, Controller } from "react-hook-form"; // Controller import edildi
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

// Şema tanımları
const blogBaseSchema = z.object({
  slug: z.string().min(1, "Slug zorunludur").refine(val => /^[a-z0-9-]+$/.test(val), {
    message: "Slug sadece küçük harfler, sayılar ve tire (-) içerebilir",
  }),
  coverImageUrl: z.string().optional(),
  isPublished: z.boolean(), // .default(false) kaldırıldı
});

const blogTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().min(1, "Başlık zorunludur"),
  fullDescription: z.string().min(1, "Açıklama zorunludur"),
  content: z.string().min(1, "İçerik zorunludur"),
  tocItems: z.any().optional(),
});

const blogFormSchema = blogBaseSchema.extend({
  translations: z.array(blogTranslationSchema),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

// Blog içerik form sayfası
export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNewBlog = id === 'ekle';

  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(isNewBlog ? false : true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<string>('');

  // Form için varsayılan değerleri açıkça tanımla
  const formDefaultValues: BlogFormValues = {
    slug: '',
    coverImageUrl: '',
    isPublished: false,
    translations: [],
  };

  // Form tanımla
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: formDefaultValues,
  });

  // Form değerlerini izle
  const formValues = useWatch({
    control: form.control,
  });

  // Dilleri getir
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error('Diller yüklenirken hata oluştu');
        const data = await response.json();
        setLanguages(data);
        
        // İlk aktif dili seç
        if (data.length > 0) {
          const defaultLang = data.find((l: any) => l.isDefault) || data[0];
          setActiveLanguage(defaultLang.code);
        }
      } catch (err) {
        console.error('Error fetching languages:', err);
        toast.error('Diller yüklenirken bir hata oluştu.');
      }
    };
    fetchLanguages();
  }, []);

  // Blog verilerini getir (Düzenleme modu için)
  useEffect(() => {
    // Yeni blog ekleme sayfasıysa veri çekmeye gerek yok ve loading'i false yap
    if (isNewBlog) {
      setIsLoading(false);
      return;
    }

    // Düzenleme modundaysa ve ID varsa veriyi çek
    if (id) {
      const fetchBlog = async () => {
        setIsLoading(true); // Veri çekme başlarken loading'i true yap
        try {
          const response = await fetch(`/api/admin/blogs/${id}`);
          if (!response.ok) {
             // Hata durumunda daha detaylı bilgi almaya çalış
             const errorData = await response.json().catch(() => ({ message: `Blog yüklenirken sunucu hatası (${response.status}) veya geçersiz JSON.` }));
             console.error(`API Error (${response.status}):`, errorData);
             throw new Error(errorData.message || `Blog yüklenirken hata oluştu (${response.status})`);
          }
          const data = await response.json();

          // Form değerlerini doldur (setValue kullanarak)
          form.setValue('slug', data.slug || '', { shouldValidate: true });
          form.setValue('coverImageUrl', data.coverImageUrl || '', { shouldValidate: true });
          form.setValue('isPublished', data.isPublished ?? false, { shouldValidate: true });
          // translations'ın her zaman bir dizi olduğundan emin ol
          form.setValue('translations', Array.isArray(data.translations) ? data.translations : [], { shouldValidate: true });

        } catch (err: any) { // Hata yakalama bloğu
          console.error('Error fetching blog:', err);
          toast.error(err.message || 'Blog yüklenirken bilinmeyen bir hata oluştu.');
        } finally {
          setIsLoading(false); // İşlem bitince (başarılı veya hatalı) loading'i false yap
        }
      };
      fetchBlog();
    } else {
      // ID yoksa (beklenmedik durum), loading'i false yap ve hata göster
      setIsLoading(false);
      toast.error("Blog ID'si bulunamadı.");
      router.push('/admin/blog'); // Hata durumunda listeye yönlendir
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewBlog, id]); // Bağımlılıklar: isNewBlog ve id değiştiğinde çalışır

  // Blog kaydet (SubmitHandler tipini kullan)
  const onSubmit: SubmitHandler<BlogFormValues> = async (values) => {
    setIsSaving(true);

    try {
      // Yeni blog mu yoksa güncelleme mi?
      const url = isNewBlog 
        ? '/api/admin/blogs' 
        : `/api/admin/blogs/${id}`;
      
      const method = isNewBlog ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Blog ${isNewBlog ? 'eklenirken' : 'güncellenirken'} bir hata oluştu`);
      }
      
      const result = await response.json();
      
      toast.success(`Blog başarıyla ${isNewBlog ? 'eklendi' : 'güncellendi'}`);
      
      // Başarılı işlemden sonra blog listesine yönlendir
      router.push('/admin/blog');
      
    } catch (err: any) {
      console.error(`Error ${isNewBlog ? 'creating' : 'updating'} blog:`, err);
      toast.error(err.message || `Blog ${isNewBlog ? 'eklenirken' : 'güncellenirken'} bir hata oluştu`);
    } finally {
      setIsSaving(false);
    }
  };

  // Bir dildeki çeviriyi al veya yeni oluştur
  const getOrCreateTranslation = (languageCode: string) => {
    const translations = form.getValues().translations || [];
    const existingTranslation = translations.find(t => t.languageCode === languageCode);
    
    if (existingTranslation) return existingTranslation;
    
    // Yeni çeviri oluştur
    const newTranslation = {
      languageCode,
      title: '',
      fullDescription: '',
      content: '',
      tocItems: null,
    };
    
    // Form değerlerine ekle
    form.setValue('translations', [...translations, newTranslation]);
    
    return newTranslation;
  };

  // Dil adını getir
  const getLanguageName = (code: string) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  // Şu anda aktif olan dildeki çeviriyi al
  const currentTranslation = activeLanguage
    ? form.getValues().translations?.find(t => t.languageCode === activeLanguage)
    : undefined;

  // Çevirisi olan dillerin listesini al
  const translatedLanguages = form.getValues().translations?.map(t => t.languageCode) || [];

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Geri
          </Button>
          <h1 className="text-3xl font-bold">{isNewBlog ? 'Yeni Blog Yazısı' : 'Blog Yazısını Düzenle'}</h1>
        </div>
        <div className="flex items-center space-x-2">
          {!isNewBlog && (
            <Button variant="outline" onClick={() => router.push(`/blog/${form.getValues().slug}`)}>
              <Eye className="mr-2 h-4 w-4" /> Önizleme
            </Button>
          )}
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSaving || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <Skeleton className="h-10 w-1/2 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sol panel - Genel Ayarlar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-lg border p-6 space-y-6">
                  <h2 className="text-xl font-semibold border-b pb-2">Genel Ayarlar</h2>
                  
                  {/* Slug */}
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="ornek-blog-yazisi" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL'de görünecek benzersiz tanımlayıcı.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Kapak Resmi */}
                  <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kapak Görseli</FormLabel>
                        <FormControl>
                          <ImageUpload 
                            onImageUploaded={(url) => {
                              form.setValue('coverImageUrl', url);
                            }}
                            showPreview={true}
                            initialImage={field.value}
                            buttonText="Kapak Görseli Yükle"
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Blog yazısının ana görseli. En az 1280x720px boyutunda yükleyiniz.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Yayın Durumu */}
                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Yayın Durumu</FormLabel>
                          <FormDescription>
                            Blog yazısını yayınlamak için etkinleştirin.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
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
                    onValueChange={(value) => {
                      // Geçerli dildeki çeviriyi al veya oluştur
                      getOrCreateTranslation(value);
                      setActiveLanguage(value);
                    }}
                  >
                    <div className="border-b mb-6">
                      <TabsList className="bg-transparent border-0 p-0 gap-4">
                        {languages.map((lang) => (
                          <TabsTrigger 
                            key={lang.code} 
                            value={lang.code}
                            className={`py-2 px-3 border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                              translatedLanguages.includes(lang.code) ? 'font-medium' : 'text-gray-500'
                            }`}
                          >
                            {lang.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                    {languages.map((lang, index) => (
                      <TabsContent key={lang.code} value={lang.code} forceMount className="m-0 data-[state=inactive]:hidden">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                              {lang.name} <span className="text-sm font-normal text-gray-500">({lang.code})</span>
                            </h2>
                            {/* Check based on index existence in the form state array */}
                            {form.getValues().translations?.[index] && (
                              <div className="flex items-center text-sm text-green-600">
                                <span>Çeviri var</span>
                              </div>
                            )}
                          </div>

                          {/* Başlık (Controller ile) */}
                          <div className="space-y-2">
                            <Label htmlFor={`translations.${index}.title`}>Başlık</Label>
                            <Controller
                              name={`translations.${index}.title`}
                              control={form.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  id={`translations.${index}.title`}
                                  placeholder={`${lang.name} başlık`}
                                />
                              )}
                            />
                            <FormMessage>{form.formState.errors.translations?.[index]?.title?.message}</FormMessage>
                          </div>

                          {/* Açıklama (Controller ile) */}
                          <div className="space-y-2">
                            <Label htmlFor={`translations.${index}.fullDescription`}>Açıklama</Label>
                            <Controller
                              name={`translations.${index}.fullDescription`}
                              control={form.control}
                              render={({ field }) => (
                                <Textarea
                                  {...field}
                                  id={`translations.${index}.fullDescription`}
                                  placeholder={`${lang.name} açıklama`}
                                  rows={4}
                                />
                              )}
                            />
                            <FormMessage>{form.formState.errors.translations?.[index]?.fullDescription?.message}</FormMessage>
                          </div>

                          {/* İçerik - Zengin Metin Düzenleyici (Controller ile) */}
                          <div className="space-y-2">
                            <Label htmlFor={`translations.${index}.content`}>İçerik</Label>
                            <Controller
                              name={`translations.${index}.content`}
                              control={form.control}
                              render={({ field }) => (
                                <div className="min-h-[400px]">
                                  <RichTextEditor
                                    value={field.value || ''} // Use value from Controller field
                                    onChange={(content) => {
                                      field.onChange(content); // Update RHF field state
                                      // Handle TOC update (simplified, can be extracted)
                                      const translations = [...form.getValues().translations];
                                      if (translations[index]) {
                                        translations[index].content = content;
                                        if (typeof window !== 'undefined') {
                                          try {
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(content, 'text/html');
                                            const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
                                            if (headings.length > 0) {
                                              const tocItems = Array.from(headings).map((heading) => {
                                                const text = heading.textContent || '';
                                                const id = heading.id || text.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
                                                return { id, text, level: parseInt(heading.tagName.substring(1)) };
                                              });
                                              translations[index].tocItems = tocItems;
                                            } else {
                                              translations[index].tocItems = [];
                                            }
                                          } catch (err) {
                                            console.error('TOC extraction error:', err);
                                            translations[index].tocItems = [];
                                          }
                                        }
                                        form.setValue('translations', translations, { shouldDirty: true, shouldTouch: true });
                                      }
                                    }}
                                    placeholder={`${lang.name} içerik`}
                                    toolbarId={`toolbar-${lang.code}`}
                                  />
                                </div>
                              )}
                            />
                             <FormMessage>{form.formState.errors.translations?.[index]?.content?.message}</FormMessage>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
