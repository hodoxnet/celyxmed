"use client";

import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X } from "lucide-react";

// dnd kütüphanesi eksik - yorum satırı olarak bırakalım, opsiyonel olarak aşağıda import edebiliriz
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ImageUpload } from "@/components/admin/image-upload";

interface ImageItem {
  id?: string;
  src: string;
  alt: string;
  order: number;
}

interface MediaManagerProps {
  form: UseFormReturn<any>;
  loading: boolean;
}

export function MediaManager({ form, loading }: MediaManagerProps) {
  const [activeTab, setActiveTab] = useState("hero");

  // Ana görseller
  const heroImageUrl = form.watch("heroImageUrl");
  const whyBackgroundImageUrl = form.watch("whyBackgroundImageUrl");
  const ctaBackgroundImageUrl = form.watch("ctaBackgroundImageUrl");
  const ctaMainImageUrl = form.watch("ctaMainImageUrl");

  // Koleksiyon görselleri
  const marqueeImages = form.watch("marqueeImages") || [];
  const galleryImages = form.watch("galleryImages") || [];
  const ctaAvatars = form.watch("ctaAvatars") || [];

  // Görsel ekleme
  const handleAddImage = (fieldName: string, imageUrl: string) => {
    const currentImages = form.getValues(fieldName) || [];
    const newImage: ImageItem = {
      src: imageUrl,
      alt: "Lütfen açıklama ekleyin",
      order: currentImages.length
    };
    
    form.setValue(fieldName, [...currentImages, newImage], { shouldValidate: true });
  };

  // Görsel silme
  const handleRemoveImage = (fieldName: string, index: number) => {
    const currentImages = form.getValues(fieldName);
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    
    // Sıralamayı güncelle
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      order: idx
    }));
    
    form.setValue(fieldName, updatedImages, { shouldValidate: true });
  };

  // Görsel açıklamasını güncelleme
  const handleUpdateAlt = (fieldName: string, index: number, alt: string) => {
    const currentImages = form.getValues(fieldName);
    const newImages = [...currentImages];
    newImages[index] = {
      ...newImages[index],
      alt
    };
    
    form.setValue(fieldName, newImages, { shouldValidate: true });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">Görsel Yönetimi</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tüm görselleri tek bir yerden yönetin. Bu görseller tüm diller için ortak kullanılır.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="hero">Ana Görseller</TabsTrigger>
            <TabsTrigger value="marquee">Kayan Görseller</TabsTrigger>
            <TabsTrigger value="gallery">Galeri</TabsTrigger>
            <TabsTrigger value="avatars">Avatarlar</TabsTrigger>
          </TabsList>
          
          {/* Ana Görseller Sekmesi */}
          <TabsContent value="hero" className="space-y-4">
            <Accordion type="single" collapsible defaultValue="hero_image">
              <AccordionItem value="hero_image">
                <AccordionTrigger>Ana Sayfa Görseli</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="heroImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ana Görsel</FormLabel>
                            <FormControl>
                              <ImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="heroImageAlt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ana Görsel Açıklaması</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={loading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="why_background">
                <AccordionTrigger>Neden Biz Arkaplan Görseli</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="whyBackgroundImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="cta_images">
                <AccordionTrigger>CTA Görselleri</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="ctaBackgroundImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CTA Arkaplan Görseli</FormLabel>
                            <FormControl>
                              <ImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="ctaMainImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CTA Ana Görseli</FormLabel>
                            <FormControl>
                              <ImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="ctaMainImageAlt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CTA Ana Görsel Açıklaması</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={loading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* Kayan Görseller Sekmesi */}
          <TabsContent value="marquee">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Kayan Görseller</h4>
                <ImageUpload
                  onChange={(url) => handleAddImage("marqueeImages", url)}
                  value=""
                  disabled={loading}
                  buttonText="Görsel Ekle"
                />
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-4">
                {marqueeImages.length > 0 ? (
                  marqueeImages.map((image: ImageItem, index: number) => (
                    <div 
                      key={image.id || index}
                      className="flex items-center space-x-2 p-2 border rounded-md mb-2"
                    >
                      <div className="relative h-20 w-20 flex-shrink-0">
                        {image.src && (
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover rounded-md"
                          />
                        )}
                      </div>
                      <Input
                        value={image.alt}
                        onChange={(e) => handleUpdateAlt("marqueeImages", index, e.target.value)}
                        placeholder="Görsel açıklaması..."
                        className="flex-grow"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage("marqueeImages", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    Henüz kayan görsel eklenmemiş. Yukarıdaki "Görsel Ekle" butonunu kullanarak ekleyebilirsiniz.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Galeri Sekmesi */}
          <TabsContent value="gallery">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Galeri Görselleri</h4>
                <ImageUpload
                  onChange={(url) => handleAddImage("galleryImages", url)}
                  value=""
                  disabled={loading}
                  buttonText="Görsel Ekle"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-4">
                {galleryImages.length > 0 ? (
                  galleryImages.map((image: ImageItem, index: number) => (
                    <div
                      key={image.id || index}
                      className="flex flex-col space-y-2 p-2 border rounded-md"
                    >
                      <div className="relative h-40 w-full">
                        {image.src && (
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover rounded-md"
                          />
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          value={image.alt}
                          onChange={(e) => handleUpdateAlt("galleryImages", index, e.target.value)}
                          placeholder="Görsel açıklaması..."
                          className="flex-grow"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveImage("galleryImages", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground col-span-2">
                    Henüz galeri görseli eklenmemiş. Yukarıdaki "Görsel Ekle" butonunu kullanarak ekleyebilirsiniz.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Avatar Sekmesi */}
          <TabsContent value="avatars">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">CTA Avatar Görselleri</h4>
                <ImageUpload
                  onChange={(url) => handleAddImage("ctaAvatars", url)}
                  value=""
                  disabled={loading}
                  buttonText="Avatar Ekle"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-4">
                {ctaAvatars.length > 0 ? (
                  ctaAvatars.map((image: ImageItem, index: number) => (
                    <div
                      key={image.id || index}
                      className="flex flex-col space-y-2 p-2 border rounded-md"
                    >
                      <div className="relative h-24 w-24 mx-auto">
                        {image.src && (
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover rounded-full"
                          />
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          value={image.alt}
                          onChange={(e) => handleUpdateAlt("ctaAvatars", index, e.target.value)}
                          placeholder="Avatar açıklaması..."
                          className="flex-grow"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveImage("ctaAvatars", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground col-span-3">
                    Henüz avatar eklenmemiş. Yukarıdaki "Avatar Ekle" butonunu kullanarak ekleyebilirsiniz.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}