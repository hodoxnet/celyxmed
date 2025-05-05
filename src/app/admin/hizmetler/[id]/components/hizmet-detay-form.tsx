"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form"; // SubmitHandler import edildi
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { HizmetDetay, Language } from "@/generated/prisma";
import { hizmetDetayFormSchema, HizmetDetayFormValues } from "@/lib/validators/admin"; // HizmetDetayFormValues importu geri eklendi
import { ensureArray } from "@/lib/utils";
import { HizmetDetayForm as HizmetDetayFormType } from "@/types/form-types";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator"; // Import yolu düzeltildi

// Alt form bölümü bileşenlerini import et
import { BasicInfoSection } from "./BasicInfoSection";
import { HeroSectionForm } from "./HeroSectionForm";
import { TocSectionForm } from "./TocSectionForm";
import { MarqueeSectionForm } from "./MarqueeSectionForm";
import { IntroSectionForm } from "./IntroSectionForm";
import { OverviewSectionForm } from "./OverviewSectionForm";
import { WhySectionForm } from "./WhySectionForm";
import { GallerySectionForm } from "./GallerySectionForm";
import { TestimonialsSectionForm } from "./TestimonialsSectionForm";
import { StepsSectionForm } from "./StepsSectionForm";
import { RecoverySectionForm } from "./RecoverySectionForm";
import { CtaSectionForm } from "./CtaSectionForm";
import { PricingSectionForm } from "./PricingSectionForm";
import { ExpertsSectionForm } from "./ExpertsSectionForm";
import { FaqSectionForm } from "./FaqSectionForm";
import { SeoSectionForm } from "./SeoSectionForm";


// HizmetDetayFormValues tipini kullanarak ilişkili alanlara varsayılan değerler ekliyoruz
type InitialDataType = Partial<HizmetDetay & {
    tocItems: Array<{
      id?: string;
      text: string;
      isBold?: boolean;
      level?: number;
      order?: number;
    }>;
    marqueeImages: Array<{
      id?: string;
      src: string;
      alt: string;
      order?: number;
    }>;
    introLinks: Array<{
      id?: string;
      targetId: string;
      number: string;
      text: string;
      order?: number;
    }>;
    overviewTabs: Array<{
      id?: string;
      value: string;
      triggerText: string;
      title: string;
      content: string;
      imageUrl: string;
      imageAlt: string;
      buttonText: string;
      order?: number;
    }>;
    whyItems: Array<{
      id?: string;
      number: string;
      title: string;
      description: string;
      order?: number;
    }>;
    galleryImages: Array<{
      id?: string;
      src: string;
      alt: string;
      order?: number;
    }>;
    testimonials: Array<{
      id?: string;
      stars?: number;
      text: string;
      author: string;
      treatment?: string;
      imageUrl?: string;
      order?: number;
    }>;
    steps: Array<{
      id?: string;
      title: string;
      description: string;
      linkText?: string;
      order?: number;
    }>;
    recoveryItems: Array<{
      id?: string;
      title: string;
      description: string;
      imageUrl: string;
      imageAlt: string;
      order?: number;
    }>;
    ctaAvatars: Array<{
      id?: string;
      src: string;
      alt: string;
      order?: number;
    }>;
    pricingPackages: Array<{
      id?: string;
      title: string;
      price: string;
      features: string[];
      isFeatured?: boolean;
      order?: number;
    }>;
    expertItems: Array<{
      id?: string;
      name: string;
      title: string;
      description: string;
      imageUrl: string;
      imageAlt: string;
      ctaText?: string;
      order?: number;
    }>;
    faqs: Array<{
      id?: string;
      question: string;
      answer: string;
      order?: number;
    }>;
}> | null;


interface HizmetDetayFormProps {
  initialData: InitialDataType;
  diller: Language[];
}

export function HizmetDetayForm({ initialData, diller }: HizmetDetayFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isEditing = !!initialData?.id; // ID varlığına göre kontrol
  const actionButtonText = isEditing ? "Değişiklikleri Kaydet" : "Oluştur";
  const toastMessageSuccess = isEditing ? "Hizmet detayı güncellendi." : "Hizmet detayı oluşturuldu.";
  const toastMessageError = isEditing ? "Hizmet detayı güncellenirken bir hata oluştu." : "Hizmet detayı oluşturulurken bir hata oluştu.";

  // Form varsayılan değerlerini Zod şemasına tam uygun şekilde tanımla
  const defaultValues: HizmetDetayFormValues = {
    languageCode: initialData?.languageCode ?? (diller.find(d => d.isDefault)?.code || diller[0]?.code || ""),
    slug: initialData?.slug ?? "",
    breadcrumb: initialData?.breadcrumb ?? "",
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    published: initialData?.published ?? false, // boolean olmalı
    heroImageUrl: initialData?.heroImageUrl ?? "",
    heroImageAlt: initialData?.heroImageAlt ?? "",
    tocTitle: initialData?.tocTitle ?? "İçindekiler",
    tocAuthorInfo: initialData?.tocAuthorInfo ?? '',
    tocItems: ensureArray(initialData?.tocItems).map(item => ({
      id: item.id,
      text: item.text,
      isBold: item.isBold ?? false,
      level: item.level,
      order: item.order ?? 0,
    })),
    tocCtaDescription: initialData?.tocCtaDescription ?? "",
    marqueeImages: ensureArray(initialData?.marqueeImages).map(item => ({
      id: item.id,
      src: item.src,
      alt: item.alt,
      order: item.order ?? 0,
    })),
    introVideoId: initialData?.introVideoId ?? '',
    introTitle: initialData?.introTitle ?? "",
    introDescription: initialData?.introDescription ?? "",
    introPrimaryButtonText: initialData?.introPrimaryButtonText ?? "",
    introPrimaryButtonLink: initialData?.introPrimaryButtonLink ?? "",
    introSecondaryButtonText: initialData?.introSecondaryButtonText ?? "",
    introSecondaryButtonLink: initialData?.introSecondaryButtonLink ?? "",
    introLinks: ensureArray(initialData?.introLinks).map(item => ({
      id: item.id,
      targetId: item.targetId,
      number: item.number,
      text: item.text,
      order: item.order ?? 0,
    })),
    overviewTitle: initialData?.overviewTitle ?? "",
    overviewDescription: initialData?.overviewDescription ?? "",
    overviewTabs: ensureArray(initialData?.overviewTabs).length 
      ? ensureArray(initialData?.overviewTabs).map(tab => ({
          id: tab.id,
          value: tab.value,
          triggerText: tab.triggerText,
          title: tab.title,
          content: tab.content,
          imageUrl: tab.imageUrl,
          imageAlt: tab.imageAlt,
          buttonText: tab.buttonText,
          order: tab.order ?? 0
        }))
      : [{ 
          id: '', 
          value: '', 
          triggerText: '', 
          title: '', 
          content: '', 
          imageUrl: '', 
          imageAlt: '', 
          buttonText: '', 
          order: 0 
        }],
    whyTitle: initialData?.whyTitle ?? "",
    whyBackgroundImageUrl: initialData?.whyBackgroundImageUrl ?? '',
    whyItems: ensureArray(initialData?.whyItems).length 
      ? ensureArray(initialData.whyItems).map(item => ({
          id: item.id,
          number: item.number,
          title: item.title,
          description: item.description,
          order: item.order ?? 0
        }))
      : [{ 
          id: '', 
          number: '', 
          title: '', 
          description: '', 
          order: 0 
        }],
    galleryTitle: initialData?.galleryTitle ?? "",
    galleryDescription: initialData?.galleryDescription ?? "",
    galleryImages: ensureArray(initialData?.galleryImages).map(item => ({
      id: item.id,
      src: item.src,
      alt: item.alt,
      order: item.order ?? 0,
    })),
    testimonialsSectionTitle: initialData?.testimonialsSectionTitle ?? '',
    testimonials: ensureArray(initialData?.testimonials).map(item => ({
      id: item.id,
      stars: item.stars ?? 5,
      text: item.text,
      author: item.author,
      treatment: item.treatment,
      imageUrl: item.imageUrl,
      order: item.order ?? 0,
    })),
    stepsTitle: initialData?.stepsTitle ?? "",
    stepsDescription: initialData?.stepsDescription ?? '',
    steps: ensureArray(initialData?.steps).length 
      ? ensureArray(initialData?.steps).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          linkText: item.linkText,
          order: item.order ?? 0
        }))
      : [{ 
          id: '', 
          title: '', 
          description: '', 
          linkText: '', 
          order: 0 
        }],
    recoveryTitle: initialData?.recoveryTitle ?? "",
    recoveryDescription: initialData?.recoveryDescription ?? '',
    recoveryItems: ensureArray(initialData?.recoveryItems).length 
      ? ensureArray(initialData?.recoveryItems).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          imageAlt: item.imageAlt,
          order: item.order ?? 0
        }))
      : [{ 
          id: '', 
          title: '', 
          description: '', 
          imageUrl: '', 
          imageAlt: '', 
          order: 0 
        }],
    ctaTagline: initialData?.ctaTagline ?? '',
    ctaTitle: initialData?.ctaTitle ?? "",
    ctaDescription: initialData?.ctaDescription ?? "",
    ctaButtonText: initialData?.ctaButtonText ?? "",
    ctaButtonLink: initialData?.ctaButtonLink ?? '',
    ctaAvatars: ensureArray(initialData?.ctaAvatars).map(item => ({
      id: item.id,
      src: item.src,
      alt: item.alt,
      order: item.order ?? 0,
    })),
    ctaAvatarText: initialData?.ctaAvatarText ?? '',
    ctaBackgroundImageUrl: initialData?.ctaBackgroundImageUrl ?? '',
    ctaMainImageUrl: initialData?.ctaMainImageUrl ?? '',
    ctaMainImageAlt: initialData?.ctaMainImageAlt ?? '',
    pricingTitle: initialData?.pricingTitle ?? "",
    pricingDescription: initialData?.pricingDescription ?? '',
    pricingPackages: ensureArray(initialData?.pricingPackages).map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      features: item.features,
      isFeatured: item.isFeatured ?? false,
      order: item.order ?? 0,
    })),
    expertsSectionTitle: initialData?.expertsSectionTitle ?? "",
    expertsTagline: initialData?.expertsTagline ?? '',
    expertItems: ensureArray(initialData?.expertItems).map(item => ({
      id: item.id,
      name: item.name,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt,
      ctaText: item.ctaText,
      order: item.order ?? 0,
    })),
    faqSectionTitle: initialData?.faqSectionTitle ?? "",
    faqSectionDescription: initialData?.faqSectionDescription ?? '',
    faqs: ensureArray(initialData?.faqs).map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      order: item.order ?? 0,
    })),
    metaTitle: initialData?.metaTitle ?? '',
    metaDescription: initialData?.metaDescription ?? '',
    metaKeywords: initialData?.metaKeywords ?? '',
  };

  // Creating the form with shared type
  const form: HizmetDetayFormType = useForm<HizmetDetayFormValues>({
    resolver: zodResolver(hizmetDetayFormSchema),
    defaultValues,
  });


  const onSubmit: SubmitHandler<HizmetDetayFormValues> = async (values) => {
    setLoading(true);
    try {
      const url = isEditing && initialData?.id
        ? `/api/admin/hizmetler/${initialData.id}`
        : '/api/admin/hizmetler';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Sunucu hatası (${response.status}) veya geçersiz JSON yanıtı.` }));
        throw new Error(errorData.message || `İşlem sırasında bir hata oluştu (${response.status})`);
      }

      toast.success(toastMessageSuccess);
      router.push('/admin/hizmetler');
      router.refresh();
    } catch (error: unknown) {
      console.error("Form submit error:", error);
      toast.error(error instanceof Error ? error.message : toastMessageError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Bölüm Bileşenleri */}
        <BasicInfoSection form={form} diller={diller} loading={loading} isEditing={isEditing} />
        <Separator />
        <HeroSectionForm form={form} loading={loading} />
        <Separator />
        <TocSectionForm form={form} loading={loading} />
        <Separator />
        <MarqueeSectionForm form={form} loading={loading} />
        <Separator />
        <IntroSectionForm form={form} loading={loading} />
        <Separator />
        <OverviewSectionForm form={form} loading={loading} />
        <Separator />
        <WhySectionForm form={form} loading={loading} />
        <Separator />
        <GallerySectionForm form={form} loading={loading} />
        <Separator />
        <TestimonialsSectionForm form={form} loading={loading} />
        <Separator />
        <StepsSectionForm form={form} loading={loading} />
        <Separator />
        <RecoverySectionForm form={form} loading={loading} />
        <Separator />
        <CtaSectionForm form={form} loading={loading} />
        <Separator />
        <PricingSectionForm form={form} loading={loading} />
        <Separator />
        <ExpertsSectionForm form={form} loading={loading} />
        <Separator />
        <FaqSectionForm form={form} loading={loading} />
        <Separator />
        <SeoSectionForm form={form} loading={loading} />

        <Button type="submit" disabled={loading}>
          {actionButtonText}
        </Button>
      </form>
    </Form>
  );
}
