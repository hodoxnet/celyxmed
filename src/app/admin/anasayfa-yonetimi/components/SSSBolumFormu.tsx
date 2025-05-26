'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormLoadingSkeleton } from './LoadingSkeletons';
import { Language } from '@/generated/prisma/client';

const sssFormSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().optional(),
});

type SSSFormValues = z.infer<typeof sssFormSchema>;

interface SSSBolumFormuProps {
  availableLanguages: Language[];
  activeLanguageCode: string;
}

export default function SSSBolumFormu({
  availableLanguages,
  activeLanguageCode,
}: SSSBolumFormuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<SSSFormValues>({
    resolver: zodResolver(sssFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const response = await fetch('/api/admin/faq-section');
        if (response.ok) {
          const data = await response.json();
          const translation = data.translations?.find(
            (t: any) => t.languageCode === activeLanguageCode
          );
          
          if (translation) {
            form.reset({
              title: translation.title || '',
              description: translation.description || '',
            });
          }
        }
      } catch (error) {
        console.error('Veri getirme hatası:', error);
      } finally {
        setIsFetching(false);
      }
    };

    if (activeLanguageCode) {
      fetchData();
    }
  }, [activeLanguageCode, form]);

  const onSubmit = async (data: SSSFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/faq-section', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageCode: activeLanguageCode,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Güncelleme başarısız');
      }

      toast.success('SSS bölüm ayarları güncellendi!');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <FormLoadingSkeleton title="SSS bölüm ayarları yükleniyor..." />;
  }

  const currentLanguage = availableLanguages.find(
    (lang) => lang.code === activeLanguageCode
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>SSS Bölümü Ayarları ({currentLanguage?.name})</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Bölüm Başlığı</Label>
              <Input
                id="title"
                {...form.register('title')}
                className="mt-1"
                placeholder="Sıkça Sorulan Sorular"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                className="mt-1"
                placeholder="SSS bölümü için açıklama metni"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}