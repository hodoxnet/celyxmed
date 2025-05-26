'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Language } from '@/generated/prisma/client';
import ImageUpload from '@/components/admin/image-upload';
import { Trash2, PlusCircle, Edit, MoveUp, MoveDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Form için çeviri tipi
interface TranslationData {
  languageCode: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

// Resim tipi
interface ImageData {
  id: string;
  imageUrl: string;
  altText?: string;
  order: number;
  isPublished: boolean;
}

// İçerik formu için basit validasyon
const validateTranslationForm = (data: TranslationData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.title) errors.title = "Başlık gereklidir";
  if (!data.description) errors.description = "Açıklama gereklidir";
  if (!data.buttonText) errors.buttonText = "Buton metni gereklidir";
  
  if (!data.buttonLink) {
    errors.buttonLink = "Buton linki gereklidir";
  } else if (!data.buttonLink.startsWith('/') && !data.buttonLink.startsWith('http')) {
    errors.buttonLink = "Link / veya http(s):// ile başlamalıdır";
  }
  
  return errors;
};

// Resim formu için validasyon
const validateImageForm = (data: Partial<ImageData>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.imageUrl) errors.imageUrl = "Resim URL'si gereklidir";
  
  return errors;
};

const ClinicShowcaseAdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>();
  const [images, setImages] = useState<ImageData[]>([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  
  // Form verileri (bu daha sade ve doğrudan bir yaklaşım)
  const [translationForms, setTranslationForms] = useState<Record<string, TranslationData>>({});
  const [imageForm, setImageForm] = useState<Partial<ImageData>>({
    imageUrl: '',
    altText: '',
    order: 0,
    isPublished: true
  });
  
  // Form hataları
  const [translationErrors, setTranslationErrors] = useState<Record<string, Record<string, string>>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  
  // Verileri getir
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Dilleri getir
      const langRes = await fetch('/api/languages');
      const allLangs: Language[] = await langRes.json();
      const activeLanguages = allLangs.filter(lang => lang.isActive);
      setAvailableLanguages(activeLanguages);

      if (activeLanguages.length > 0 && !activeTab) {
        const defaultLang = activeLanguages.find(lang => lang.isDefault);
        setActiveTab(defaultLang?.code || activeLanguages[0].code);
      }

      // Ana içeriği getir
      const contentRes = await fetch('/api/admin/clinic-showcase');
      const contentData = await contentRes.json();
      
      // Çevirileri ve formları hazırla
      if (contentData && contentData.translations) {
        const translations: Record<string, TranslationData> = {};
        
        // Mevcut çevirileri ekle
        contentData.translations.forEach((t: any) => {
          translations[t.languageCode] = {
            languageCode: t.languageCode,
            title: t.title || '',
            description: t.description || '',
            buttonText: t.buttonText || '',
            buttonLink: t.buttonLink || '',
          };
        });
        
        // Eksik dilleri varsayılan değerlerle ekle
        activeLanguages.forEach(lang => {
          if (!translations[lang.code]) {
            translations[lang.code] = {
              languageCode: lang.code,
              title: '',
              description: '',
              buttonText: '',
              buttonLink: '',
            };
          }
        });
        
        setTranslationForms(translations);
      }

      // Resimleri getir
      const imagesRes = await fetch('/api/admin/clinic-showcase/images');
      const imagesData = await imagesRes.json();
      setImages(imagesData);

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setInitialDataLoaded(true);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // activeTab'ı ayarla
  useEffect(() => {
    if (availableLanguages.length > 0 && !activeTab) {
      const defaultLang = availableLanguages.find(lang => lang.isDefault);
      setActiveTab(defaultLang?.code || availableLanguages[0].code);
    }
  }, [availableLanguages, activeTab]);

  // Form değişiklikleri
  const handleTranslationChange = (langCode: string, field: keyof TranslationData, value: string) => {
    setTranslationForms(prev => ({
      ...prev,
      [langCode]: {
        ...prev[langCode],
        [field]: value
      }
    }));
    
    // Hataları gerçek zamanlı olarak temizle
    if (translationErrors[langCode]?.[field]) {
      setTranslationErrors(prev => ({
        ...prev,
        [langCode]: {
          ...prev[langCode],
          [field]: '' // Hatayı temizle
        }
      }));
    }
  };
  
  const handleImageChange = (field: keyof ImageData, value: any) => {
    setImageForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Hataları gerçek zamanlı olarak temizle
    if (imageErrors[field]) {
      setImageErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Ana içeriği kaydet
  const handleContentSave = async () => {
    // Mevcut dil için validasyon
    if (activeTab) {
      const currentForm = translationForms[activeTab];
      const currentErrors = validateTranslationForm(currentForm);
      
      if (Object.keys(currentErrors).length > 0) {
        setTranslationErrors(prev => ({
          ...prev,
          [activeTab]: currentErrors
        }));
        toast.error('Lütfen form hatalarını düzeltin');
        return;
      }
    }
    
    setIsLoading(true);
    try {
      // Tüm dillerin formlarını gönder
      const response = await fetch('/api/admin/clinic-showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translations: Object.values(translationForms)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'İçerik güncellenemedi.');
      }
      
      toast.success('Klinik tanıtım içeriği başarıyla güncellendi!');
      fetchData();
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Resim ekle veya güncelle
  const handleImageSave = async () => {
    // Validasyon
    const errors = validateImageForm(imageForm);
    if (Object.keys(errors).length > 0) {
      setImageErrors(errors);
      toast.error('Lütfen form hatalarını düzeltin');
      return;
    }
    
    setIsLoading(true);
    const method = editingImageId ? 'PUT' : 'POST';
    const url = editingImageId 
      ? `/api/admin/clinic-showcase/images/${editingImageId}` 
      : '/api/admin/clinic-showcase/images';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageForm),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Resim işlenemedi.');
      }
      
      toast.success(`Resim başarıyla ${editingImageId ? 'güncellendi' : 'eklendi'}!`);
      setIsImageDialogOpen(false);
      setEditingImageId(null);
      setImageForm({
        imageUrl: '',
        altText: '',
        order: images.length,
        isPublished: true 
      });
      fetchData();
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resim silme
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Bu resmi silmek istediğinizden emin misiniz?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/clinic-showcase/images/${imageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Resim silinemedi.');
      }
      
      toast.success('Resim başarıyla silindi!');
      fetchData();
    } catch (error: any) {
      toast.error(`Silme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sıra değiştirme işlemleri
  const handleMoveImage = async (imageId: string, direction: 'up' | 'down') => {
    const imageIndex = images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) return;

    const targetIndex = direction === 'up' ? imageIndex - 1 : imageIndex + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const imageToMove = images[imageIndex];
    const targetImage = images[targetIndex];

    // Sıra numaralarını değiştir
    try {
      await fetch(`/api/admin/clinic-showcase/images/${imageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: targetImage.order }),
      });

      await fetch(`/api/admin/clinic-showcase/images/${targetImage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: imageToMove.order }),
      });

      toast.success(`Resim ${direction === 'up' ? 'yukarı' : 'aşağı'} taşındı.`);
      fetchData();
    } catch (error: any) {
      toast.error(`Taşıma hatası: ${error.message}`);
    }
  };

  // Resim düzenleme modunu aç
  const openEditImageDialog = (image: ImageData) => {
    setEditingImageId(image.id);
    setImageForm({
      id: image.id,
      imageUrl: image.imageUrl || '',
      altText: image.altText || '',
      order: image.order,
      isPublished: image.isPublished,
    });
    setIsImageDialogOpen(true);
  };

  // Yeni resim ekleme modunu aç
  const openNewImageDialog = () => {
    setEditingImageId(null);
    setImageForm({
      imageUrl: '',
      altText: '',
      order: images.length,
      isPublished: true,
    });
    setIsImageDialogOpen(true);
  };

  if (!initialDataLoaded && isLoading) {
    return <p className="p-6">Klinik Tanıtım verileri yükleniyor...</p>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Ana İçerik Düzenleme Kartı */}
      <Card>
        <CardHeader>
          <CardTitle>Klinik Tanıtım İçeriği</CardTitle>
          <CardDescription>Ana sayfa klinik tanıtım bölümünün içeriğini düzenleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {availableLanguages.length > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  {availableLanguages.map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code}>{lang.name}</TabsTrigger>
                  ))}
                </TabsList>
                
                {availableLanguages.map((lang) => (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-4 pt-3">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
                      <p className="text-sm text-yellow-700">
                        <strong>Not:</strong> Her dil için içeriği ayrı ayrı düzenleyebilir ve tek "İçeriği Kaydet" butonu ile tüm dillerdeki değişiklikleri kaydedebilirsiniz.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor={`title-${lang.code}`}>Başlık</Label>
                      <Input 
                        id={`title-${lang.code}`}
                        value={translationForms[lang.code]?.title || ''}
                        onChange={(e) => handleTranslationChange(lang.code, 'title', e.target.value)}
                        placeholder="State-of-the-Art Clinic in Istanbul" 
                      />
                      {translationErrors[lang.code]?.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {translationErrors[lang.code]?.title}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`description-${lang.code}`}>Açıklama</Label>
                      <Textarea 
                        id={`description-${lang.code}`}
                        value={translationForms[lang.code]?.description || ''}
                        onChange={(e) => handleTranslationChange(lang.code, 'description', e.target.value)}
                        placeholder="Our modern clinic in Ataşehir, Istanbul, is designed to provide the highest standards of safety, hygiene, and comfort..." 
                        rows={5}
                      />
                      {translationErrors[lang.code]?.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {translationErrors[lang.code]?.description}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`buttonText-${lang.code}`}>Buton Metni</Label>
                      <Input 
                        id={`buttonText-${lang.code}`}
                        value={translationForms[lang.code]?.buttonText || ''}
                        onChange={(e) => handleTranslationChange(lang.code, 'buttonText', e.target.value)}
                        placeholder="Explore Our Clinic" 
                      />
                      {translationErrors[lang.code]?.buttonText && (
                        <p className="text-red-500 text-sm mt-1">
                          {translationErrors[lang.code]?.buttonText}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`buttonLink-${lang.code}`}>Buton Link</Label>
                      <Input 
                        id={`buttonLink-${lang.code}`}
                        value={translationForms[lang.code]?.buttonLink || ''}
                        onChange={(e) => handleTranslationChange(lang.code, 'buttonLink', e.target.value)}
                        placeholder="/klinigimiz" 
                      />
                      {translationErrors[lang.code]?.buttonLink && (
                        <p className="text-red-500 text-sm mt-1">
                          {translationErrors[lang.code]?.buttonLink}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
            
            <div className="flex justify-end">
              <Button 
                onClick={handleContentSave}
                disabled={isLoading}
                className="min-w-[150px]"
              >
                {isLoading ? 'Kaydediliyor...' : 'İçeriği Kaydet'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resim Yönetimi Kartı */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Klinik Tanıtım Resimleri</CardTitle>
            <CardDescription>Sağda görünecek resimleri yönetin.</CardDescription>
          </div>
          <Button onClick={openNewImageDialog} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Yeni Resim Ekle</Button>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Resim</TableHead>
                  <TableHead>Alt Metin</TableHead>
                  <TableHead className="w-[100px]">Sıra</TableHead>
                  <TableHead className="w-[120px]">Durum</TableHead>
                  <TableHead className="w-[180px] text-right">Eylemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((image, index) => (
                  <TableRow key={image.id}>
                    <TableCell>
                      {image.imageUrl && <Image src={image.imageUrl} alt={image.altText || 'Klinik Görseli'} width={60} height={45} className="rounded object-cover aspect-[4/3]" />}
                    </TableCell>
                    <TableCell>{image.altText || '-'}</TableCell>
                    <TableCell>{image.order}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${image.isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {image.isPublished ? 'Yayında' : 'Taslak'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {index > 0 && (
                        <Button variant="ghost" size="icon" onClick={() => handleMoveImage(image.id, 'up')}><MoveUp className="h-4 w-4" /></Button>
                      )}
                      {index < images.length - 1 && (
                        <Button variant="ghost" size="icon" onClick={() => handleMoveImage(image.id, 'down')}><MoveDown className="h-4 w-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEditImageDialog(image)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteImage(image.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Henüz resim eklenmemiş.</p>
          )}
        </CardContent>
      </Card>

      {/* Resim Ekle/Düzenle Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setImageErrors({});
        }
        setIsImageDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingImageId ? 'Resmi Düzenle' : 'Yeni Resim Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="imageUrl">Resim URL</Label>
              <ImageUpload
                key={editingImageId || 'new-image'}
                initialImage={imageForm.imageUrl || ''}
                showPreview={true}
                onImageUploaded={(url) => handleImageChange('imageUrl', url)}
                uploadFolder="clinic_showcase"
              />
              {imageErrors.imageUrl && (
                <p className="text-red-500 text-sm mt-1">{imageErrors.imageUrl}</p>
              )}
            </div>

            <div>
              <Label htmlFor="altText">Alt Metin (SEO için)</Label>
              <Input 
                id="altText"
                value={imageForm.altText || ''}
                onChange={(e) => handleImageChange('altText', e.target.value)}
                placeholder="Celyxmed Kliniği Resepsiyonu" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Sıra</Label>
                <Input 
                  id="order" 
                  type="number"
                  value={imageForm.order || 0}
                  onChange={(e) => handleImageChange('order', parseInt(e.target.value))}
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isPublished" 
                    checked={imageForm.isPublished !== undefined ? imageForm.isPublished : true}
                    onCheckedChange={(checked) => handleImageChange('isPublished', checked)}
                  />
                  <Label htmlFor="isPublished">Yayında</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">İptal</Button></DialogClose>
              <Button onClick={handleImageSave} disabled={isLoading}>
                {isLoading ? (editingImageId ? 'Güncelleniyor...' : 'Kaydediliyor...') : (editingImageId ? 'Değişiklikleri Kaydet' : 'Resmi Ekle')}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicShowcaseAdminPage;