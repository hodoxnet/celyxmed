'use client';

import React, { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
// Tabs importları kaldırıldı
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/image-upload";
import { Loader2, Save, Trash2 } from "lucide-react";
import { Language } from '@/generated/prisma/client';

// ConsultOnlineSection için form şeması
const consultOnlineSectionSchema = z.object({
  imageUrl: z.string().optional().nullable(),
  translations: z.array(
    z.object({
      languageCode: z.string(),
      tagText: z.string().optional().nullable(),
      title: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      avatarText: z.string().optional().nullable(),
      buttonText: z.string().optional().nullable(),
      buttonLink: z.string().optional().nullable().refine(val => !val || val.startsWith('/') || val.startsWith('http'), { message: "Link / veya http(s):// ile başlamalıdır" }),
    })
  ),
});

// Doktor Avatar form şeması
const doctorAvatarSchema = z.object({
  imageUrl: z.string(),
  altText: z.string().optional(),
  order: z.number(),
});

// Veri tipleri
type ConsultOnlineSectionForm = z.infer<typeof consultOnlineSectionSchema>;
type DoctorAvatar = z.infer<typeof doctorAvatarSchema> & { id: string };

interface OnlineKonsultasyonFormuProps {
    availableLanguages: Language[];
    activeLanguageCode: string; // Eklendi
}

export default function OnlineKonsultasyonFormu({ availableLanguages, activeLanguageCode }: OnlineKonsultasyonFormuProps) {
  const [isLoading, setIsLoading] = useState(true);
  // activeTab state'i kaldırıldı, activeLanguageCode prop'u kullanılacak
  const [doctorAvatars, setDoctorAvatars] = useState<DoctorAvatar[]>([]);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const form = useForm<ConsultOnlineSectionForm>({
    resolver: zodResolver(consultOnlineSectionSchema),
    defaultValues: {
      imageUrl: "",
      translations: [],
    },
  });

  const fetchData = useCallback(async () => {
    if (availableLanguages.length === 0) return;
    setIsLoading(true);
    try {
      const [sectionDataRes, avatarsRes] = await Promise.all([
        fetch("/api/admin/consult-online-section"),
        fetch("/api/admin/consult-online-section/doctor-avatars"),
      ]);

      const sectionData = await sectionDataRes.json();
      const avatarsData = await avatarsRes.json();

      const existingTranslations = availableLanguages.map((lang) => {
        const existingTrans = sectionData.translations?.find(
          (t: any) => t.languageCode === lang.code
        );
        return {
          languageCode: lang.code,
          tagText: existingTrans?.tagText || "",
          title: existingTrans?.title || "",
          description: existingTrans?.description || "",
          avatarText: existingTrans?.avatarText || "",
          buttonText: existingTrans?.buttonText || "",
          buttonLink: existingTrans?.buttonLink || "",
        };
      });

      form.reset({
        imageUrl: sectionData.imageUrl || "",
        translations: existingTranslations,
      });
      setDoctorAvatars(avatarsData.sort((a:DoctorAvatar,b:DoctorAvatar) => a.order - b.order));
    } catch (error) {
      toast.error("Veri yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [form, availableLanguages]); // activeTab kaldırıldı

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const onSubmit = async (data: ConsultOnlineSectionForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/consult-online-section", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Kaydedilemedi");
      toast.success("Bölüm başarıyla güncellendi!");
      const savedData = await response.json();
      form.reset({ 
          imageUrl: savedData.imageUrl || "",
          translations: savedData.translations || [],
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kaydetme hatası.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDoctorAvatar = async (imageUrl: string) => {
    if(!imageUrl) return;
    setAvatarLoading(true);
    try {
      const response = await fetch("/api/admin/consult-online-section/doctor-avatars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, altText: "Doctor", order: doctorAvatars.length }),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Avatar eklenemedi");
      const newAvatar = await response.json();
      setDoctorAvatars([...doctorAvatars, newAvatar].sort((a,b) => a.order - b.order));
      toast.success("Doktor avatarı eklendi!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Avatar ekleme hatası.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteDoctorAvatar = async (avatarId: string) => {
    if (!confirm("Bu doktor avatarını silmek istediğinizden emin misiniz?")) return;
    setAvatarLoading(true);
    try {
      const response = await fetch(`/api/admin/consult-online-section/doctor-avatars/${avatarId}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).message || "Avatar silinemedi");
      setDoctorAvatars(doctorAvatars.filter((avatar) => avatar.id !== avatarId));
      toast.success("Doktor avatarı silindi!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Avatar silme hatası.");
    } finally {
      setAvatarLoading(false);
    }
  };

  if (isLoading && availableLanguages.length === 0) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
   if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Ana Görsel</CardTitle></CardHeader>
            <CardContent>
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bölüm Ana Görseli</FormLabel>
                    <FormControl>
                      <ImageUpload initialImage={field.value || ""} onImageUploaded={(url) => field.onChange(url)} uploadFolder="consult_online" showPreview={true} buttonText="Görsel Yükle/Değiştir"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Doktor Avatarları</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {doctorAvatars.map((avatar) => (
                    <div key={avatar.id} className="relative border rounded-md p-2 group">
                      <img src={avatar.imageUrl} alt={avatar.altText || "Doctor"} className="w-full h-auto aspect-square rounded-full object-cover"/>
                      <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteDoctorAvatar(avatar.id)} disabled={avatarLoading}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border border-dashed rounded-md p-4">
                  <p className="text-sm text-gray-500 mb-2">Yeni doktor avatarı ekle:</p>
                  <ImageUpload initialImage="" onImageUploaded={handleAddDoctorAvatar} uploadFolder="doctor_avatars" showPreview={false} buttonText="Avatar Yükle"/>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>İçerik Çevirileri ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</CardTitle></CardHeader>
            <CardContent>
              {availableLanguages.length > 0 && form.watch('translations')?.map((_, index) => {
                if (form.watch(`translations.${index}.languageCode`) !== activeLanguageCode) return null;
                return (
                    <div key={index} className="space-y-4"> {/* key olarak index kullanıldı, field.id yok */}
                      <FormField control={form.control} name={`translations.${index}.tagText`} render={({ field }) => (<FormItem><FormLabel>Etiket Metni</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`translations.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Başlık</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`translations.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Açıklama</FormLabel><FormControl><Textarea rows={3} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`translations.${index}.avatarText`} render={({ field }) => (<FormItem><FormLabel>Avatar Metni</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`translations.${index}.buttonText`} render={({ field }) => (<FormItem><FormLabel>Buton Metni</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`translations.${index}.buttonLink`} render={({ field }) => (<FormItem><FormLabel>Buton Bağlantısı</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <input type="hidden" {...form.register(`translations.${index}.languageCode`)} value={activeLanguageCode} />
                    </div>
                );
              })}
              {availableLanguages.length === 0 && <p>Aktif dil bulunamadı.</p>}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || avatarLoading}>
                {isLoading || avatarLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Değişiklikleri Kaydet
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
