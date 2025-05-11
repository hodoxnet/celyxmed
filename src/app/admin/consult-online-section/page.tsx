"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/image-upload";
import { Loader2, PlusCircle, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

// ConsultOnlineSection için form şeması
const consultOnlineSectionSchema = z.object({
  imageUrl: z.string().optional(),
  translations: z.array(
    z.object({
      languageCode: z.string(),
      tagText: z.string(),
      title: z.string(),
      description: z.string(),
      avatarText: z.string(),
      buttonText: z.string(),
      buttonLink: z.string(),
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

const ConsultOnlineSectionPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [languages, setLanguages] = useState<{ id: string; code: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [doctorAvatars, setDoctorAvatars] = useState<DoctorAvatar[]>([]);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Ana bölüm için form
  const form = useForm<ConsultOnlineSectionForm>({
    resolver: zodResolver(consultOnlineSectionSchema),
    defaultValues: {
      imageUrl: "",
      translations: [],
    },
  });

  // Verileri getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Dilleri ve mevcut verileri paralel olarak getir
        const [languagesRes, sectionDataRes, avatarsRes] = await Promise.all([
          fetch("/api/languages"),
          fetch("/api/admin/consult-online-section"),
          fetch("/api/admin/consult-online-section/doctor-avatars"),
        ]);

        const languagesData = await languagesRes.json();
        const sectionData = await sectionDataRes.json();
        const avatarsData = await avatarsRes.json();

        // Dilleri ayarla
        setLanguages(languagesData);
        if (languagesData.length > 0) {
          setActiveTab(languagesData[0].code);
        }

        // Mevcut çevirileri form verilerine ekle
        const existingTranslations = languagesData.map((lang) => {
          const existingTrans = sectionData.translations.find(
            (t: any) => t.languageCode === lang.code
          );

          return {
            languageCode: lang.code,
            tagText: existingTrans?.tagText || "Be Your Best",
            title: existingTrans?.title || "Consult with Our Doctors Online",
            description:
              existingTrans?.description ||
              "Get expert advice directly from our specialists. Book your free online consultation and discover the best treatment options tailored for you.",
            avatarText: existingTrans?.avatarText || "Choose Your Doctor, Ask Your Questions",
            buttonText: existingTrans?.buttonText || "Book Your Free Consultation Today",
            buttonLink: existingTrans?.buttonLink || "/contact",
          };
        });

        // Form verilerini güncelle
        form.reset({
          imageUrl: sectionData.imageUrl || "",
          translations: existingTranslations,
        });

        // Doktor avatarlarını ayarla
        setDoctorAvatars(avatarsData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load section data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [form]);

  // Ana formu gönder
  const onSubmit = async (data: ConsultOnlineSectionForm) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/consult-online-section", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      toast.success("Consult Online Section updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save section data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Yeni doktor avatarı ekle
  const handleAddDoctorAvatar = async (imageUrl: string) => {
    try {
      setAvatarLoading(true);
      const response = await fetch("/api/admin/consult-online-section/doctor-avatars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          altText: "Doctor",
          order: doctorAvatars.length,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add doctor avatar");
      }

      const newAvatar = await response.json();
      setDoctorAvatars([...doctorAvatars, newAvatar]);
      toast.success("Doctor avatar added successfully!");
    } catch (error) {
      console.error("Error adding doctor avatar:", error);
      toast.error("Failed to add doctor avatar.");
    } finally {
      setAvatarLoading(false);
    }
  };

  // Doktor avatarını sil
  const handleDeleteDoctorAvatar = async (avatarId: string) => {
    if (!confirm("Are you sure you want to delete this doctor avatar?")) {
      return;
    }

    try {
      setAvatarLoading(true);
      const response = await fetch(`/api/admin/consult-online-section/doctor-avatars/${avatarId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete doctor avatar");
      }

      setDoctorAvatars(doctorAvatars.filter((avatar) => avatar.id !== avatarId));
      toast.success("Doctor avatar deleted successfully!");
    } catch (error) {
      console.error("Error deleting doctor avatar:", error);
      toast.error("Failed to delete doctor avatar.");
    } finally {
      setAvatarLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Çevrimiçi Konsültasyon Bölümü</h1>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Değişiklikleri Kaydet
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ana Görsel</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ana Bölüm Görseli</FormLabel>
                    <FormControl>
                      <ImageUpload
                        initialImage={field.value || ""}
                        onImageUploaded={field.onChange}
                        uploadFolder="consult_online"
                        showPreview={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doktor Avatarları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctorAvatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="relative border rounded-md p-2 flex items-center"
                    >
                      <img
                        src={avatar.imageUrl}
                        alt={avatar.altText || "Doctor avatar"}
                        className="w-16 h-16 rounded-full object-cover mr-3"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Sıra: {avatar.order}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleDeleteDoctorAvatar(avatar.id)}
                        disabled={avatarLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="border border-dashed rounded-md p-4">
                    <p className="text-sm text-gray-500 mb-3">Yeni doktor avatarı ekle</p>
                    <ImageUpload
                      initialImage=""
                      onImageUploaded={handleAddDoctorAvatar}
                      uploadFolder="doctor_avatars"
                      showPreview={true}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İçerik Çevirileri</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  {languages.map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code}>
                      {lang.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {languages.map((lang, index) => (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`translations.${index}.tagText`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Etiket Metni</FormLabel>
                            <FormControl>
                              <Input placeholder="Be Your Best" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`translations.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Başlık</FormLabel>
                            <FormControl>
                              <Input placeholder="Consult with Our Doctors Online" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`translations.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Açıklama</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="Get expert advice directly from our specialists..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`translations.${index}.avatarText`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avatar Metni</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose Your Doctor, Ask Your Questions" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`translations.${index}.buttonText`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Buton Metni</FormLabel>
                              <FormControl>
                                <Input placeholder="Book Your Free Consultation Today" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`translations.${index}.buttonLink`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Buton Bağlantısı</FormLabel>
                              <FormControl>
                                <Input placeholder="/contact" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <input
                        type="hidden"
                        {...form.register(`translations.${index}.languageCode`)}
                        value={lang.code}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default ConsultOnlineSectionPage;