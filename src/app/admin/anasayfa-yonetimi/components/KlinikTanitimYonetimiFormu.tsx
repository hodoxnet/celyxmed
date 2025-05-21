'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MixedLoadingSkeleton } from './LoadingSkeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Tabs importları kaldırıldı
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

interface KlinikTanitimYonetimiFormuProps {
    availableLanguages: Language[];
    activeLanguageCode: string; 
}

export default function KlinikTanitimYonetimiFormu({ availableLanguages, activeLanguageCode }: KlinikTanitimYonetimiFormuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  // activeTab state'i yerine activeLanguageCode prop'u kullanılacak
  const [images, setImages] = useState<ImageData[]>([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  
  const [translationForms, setTranslationForms] = useState<Record<string, TranslationData>>({});
  const [imageForm, setImageForm] = useState<Partial<ImageData>>({
    imageUrl: '',
    altText: '',
    order: 0,
    isPublished: true
  });
  
  const [translationErrors, setTranslationErrors] = useState<Record<string, Record<string, string>>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  
  const fetchData = useCallback(async () => {
    if (availableLanguages.length === 0) return;
    setIsLoading(true);
    try {
      const contentRes = await fetch('/api/admin/clinic-showcase');
      const contentData = await contentRes.json();
      
      if (contentData && contentData.translations) {
        const translations: Record<string, TranslationData> = {};
        contentData.translations.forEach((t: any) => {
          translations[t.languageCode] = {
            languageCode: t.languageCode,
            title: t.title || '',
            description: t.description || '',
            buttonText: t.buttonText || '',
            buttonLink: t.buttonLink || '',
          };
        });
        availableLanguages.forEach(lang => {
          if (!translations[lang.code]) {
            translations[lang.code] = {
              languageCode: lang.code, title: '', description: '', buttonText: '', buttonLink: '',
            };
          }
        });
        setTranslationForms(translations);
      } else { 
        const initialTranslations: Record<string, TranslationData> = {};
        availableLanguages.forEach(lang => {
            initialTranslations[lang.code] = {
                languageCode: lang.code, title: '', description: '', buttonText: '', buttonLink: '',
            };
        });
        setTranslationForms(initialTranslations);
      }

      const imagesRes = await fetch('/api/admin/clinic-showcase/images');
      const imagesData = await imagesRes.json();
      setImages(imagesData.sort((a:ImageData, b:ImageData) => a.order - b.order));

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setInitialDataLoaded(true);
    }
  }, [availableLanguages]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleTranslationChange = (langCode: string, field: keyof TranslationData, value: string) => {
    setTranslationForms(prev => ({
      ...prev,
      [langCode]: { ...prev[langCode], [field]: value }
    }));
    if (translationErrors[langCode]?.[field]) {
      setTranslationErrors(prev => ({ ...prev, [langCode]: { ...prev[langCode], [field]: '' } }));
    }
  };
  
  const handleImageChange = (field: keyof ImageData, value: any) => {
    setImageForm(prev => ({ ...prev, [field]: value }));
    if (imageErrors[field]) {
      setImageErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContentSave = async () => {
    if (activeLanguageCode) {
      const currentForm = translationForms[activeLanguageCode];
      if (!currentForm) {
          toast.error(`Aktif dil (${activeLanguageCode}) için form bulunamadı.`);
          return;
      }
      const currentErrors = validateTranslationForm(currentForm);
      if (Object.keys(currentErrors).length > 0) {
        setTranslationErrors(prev => ({ ...prev, [activeLanguageCode]: currentErrors }));
        toast.error(`Lütfen aktif dil (${activeLanguageCode}) için form hatalarını düzeltin`);
        return;
      }
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/clinic-showcase', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translations: Object.values(translationForms) }),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'İçerik güncellenemedi.');
      toast.success('Klinik tanıtım içeriği başarıyla güncellendi!');
      fetchData();
    } catch (error: any) { toast.error(`Hata: ${error.message}`); } 
    finally { setIsLoading(false); }
  };

  const handleImageSave = async () => {
    const errors = validateImageForm(imageForm);
    if (Object.keys(errors).length > 0) {
      setImageErrors(errors);
      toast.error('Lütfen resim formu hatalarını düzeltin');
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
        body: JSON.stringify({...imageForm, order: imageForm.order ?? images.length }),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Resim işlenemedi.');
      toast.success(`Resim başarıyla ${editingImageId ? 'güncellendi' : 'eklendi'}!`);
      setIsImageDialogOpen(false);
      setEditingImageId(null);
      setImageForm({ imageUrl: '', altText: '', order: images.length, isPublished: true });
      fetchData();
    } catch (error: any) { toast.error(`Hata: ${error.message}`); } 
    finally { setIsLoading(false); }
  };
  
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Bu resmi silmek istediğinizden emin misiniz?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/clinic-showcase/images/${imageId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).message || 'Resim silinemedi.');
      toast.success('Resim başarıyla silindi!');
      fetchData();
    } catch (error: any) { toast.error(`Silme hatası: ${error.message}`); } 
    finally { setIsLoading(false); }
  };

  const handleMoveImage = async (imageId: string, direction: 'up' | 'down') => {
    const imageIndex = images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) return;
    const targetIndex = direction === 'up' ? imageIndex - 1 : imageIndex + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const newImages = [...images];
    [newImages[imageIndex], newImages[targetIndex]] = [newImages[targetIndex], newImages[imageIndex]];
    
    const updatedImagesWithOrder = newImages.map((img, index) => ({ ...img, order: index }));
    setImages(updatedImagesWithOrder); 
    try {
      await fetch(`/api/admin/clinic-showcase/images/order`, { // API endpoint'i sıralama için
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedImagesWithOrder.map(img => ({id: img.id, order: img.order}))),
      });
      toast.success(`Resim sırası güncellendi.`);
      // fetchData(); // API zaten güncel listeyi döndürüyorsa gereksiz olabilir
    } catch (error: any) { 
        toast.error(`Taşıma hatası: ${error.message}`); 
        fetchData(); // Hata durumunda sunucudan son halini çek
    }
  };

  const openEditImageDialog = (image: ImageData) => {
    setEditingImageId(image.id);
    setImageForm({ ...image });
    setIsImageDialogOpen(true);
  };

  const openNewImageDialog = () => {
    setEditingImageId(null);
    setImageForm({ imageUrl: '', altText: '', order: images.length, isPublished: true });
    setIsImageDialogOpen(true);
  };

  if (!initialDataLoaded && isLoading) {
    return <MixedLoadingSkeleton title="Klinik Tanıtım verileri yükleniyor..." />;
  }
  
  const currentTranslation = translationForms[activeLanguageCode] || { languageCode: activeLanguageCode, title: '', description: '', buttonText: '', buttonLink: ''};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Klinik Tanıtım İçeriği ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</CardTitle>
          <CardDescription>Ana sayfa klinik tanıtım bölümünün içeriğini düzenleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${activeLanguageCode}`}>Başlık</Label>
              <Input id={`title-${activeLanguageCode}`} value={currentTranslation.title} onChange={(e) => handleTranslationChange(activeLanguageCode, 'title', e.target.value)} />
              {translationErrors[activeLanguageCode]?.title && <p className="text-red-500 text-sm mt-1">{translationErrors[activeLanguageCode]?.title}</p>}
            </div>
            <div>
              <Label htmlFor={`description-${activeLanguageCode}`}>Açıklama</Label>
              <Textarea id={`description-${activeLanguageCode}`} value={currentTranslation.description} onChange={(e) => handleTranslationChange(activeLanguageCode, 'description', e.target.value)} rows={5}/>
              {translationErrors[activeLanguageCode]?.description && <p className="text-red-500 text-sm mt-1">{translationErrors[activeLanguageCode]?.description}</p>}
            </div>
            <div>
              <Label htmlFor={`buttonText-${activeLanguageCode}`}>Buton Metni</Label>
              <Input id={`buttonText-${activeLanguageCode}`} value={currentTranslation.buttonText} onChange={(e) => handleTranslationChange(activeLanguageCode, 'buttonText', e.target.value)} />
              {translationErrors[activeLanguageCode]?.buttonText && <p className="text-red-500 text-sm mt-1">{translationErrors[activeLanguageCode]?.buttonText}</p>}
            </div>
            <div>
              <Label htmlFor={`buttonLink-${activeLanguageCode}`}>Buton Link</Label>
              <Input id={`buttonLink-${activeLanguageCode}`} value={currentTranslation.buttonLink} onChange={(e) => handleTranslationChange(activeLanguageCode, 'buttonLink', e.target.value)} />
              {translationErrors[activeLanguageCode]?.buttonLink && <p className="text-red-500 text-sm mt-1">{translationErrors[activeLanguageCode]?.buttonLink}</p>}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleContentSave} disabled={isLoading} className="min-w-[150px]">
                {isLoading ? 'Kaydediliyor...' : 'İçeriği Kaydet'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <Table><TableHeader><TableRow><TableHead className="w-[80px]">Resim</TableHead><TableHead>Alt Metin</TableHead><TableHead className="w-[100px]">Sıra</TableHead><TableHead className="w-[120px]">Durum</TableHead><TableHead className="w-[180px] text-right">Eylemler</TableHead></TableRow></TableHeader>
              <TableBody>
                {images.map((image, index) => (
                  <TableRow key={image.id}>
                    <TableCell>{image.imageUrl && <Image src={image.imageUrl} alt={image.altText || 'Klinik Görseli'} width={60} height={45} className="rounded object-cover aspect-[4/3]" />}</TableCell>
                    <TableCell>{image.altText || '-'}</TableCell>
                    <TableCell>{image.order}</TableCell>
                    <TableCell><span className={`px-2 py-1 text-xs rounded-full ${image.isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{image.isPublished ? 'Yayında' : 'Taslak'}</span></TableCell>
                    <TableCell className="text-right">
                      {index > 0 && (<Button variant="ghost" size="icon" onClick={() => handleMoveImage(image.id, 'up')}><MoveUp className="h-4 w-4" /></Button>)}
                      {index < images.length - 1 && (<Button variant="ghost" size="icon" onClick={() => handleMoveImage(image.id, 'down')}><MoveDown className="h-4 w-4" /></Button>)}
                      <Button variant="ghost" size="icon" onClick={() => openEditImageDialog(image)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteImage(image.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (<p className="text-center py-4">Henüz resim eklenmemiş.</p>)}
        </CardContent>
      </Card>

      <Dialog open={isImageDialogOpen} onOpenChange={(open) => { if (!open) setImageErrors({}); setIsImageDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editingImageId ? 'Resmi Düzenle' : 'Yeni Resim Ekle'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="imageUrl-dialog">Resim</Label>
              <ImageUpload key={editingImageId || 'new-image-dialog'} initialImage={imageForm.imageUrl || ''} showPreview={true} onImageUploaded={(url) => handleImageChange('imageUrl', url)} uploadFolder="clinic_showcase" buttonText="Resim Yükle/Değiştir"/>
              {imageErrors.imageUrl && <p className="text-red-500 text-sm mt-1">{imageErrors.imageUrl}</p>}
            </div>
            <div><Label htmlFor="altText-dialog">Alt Metin (SEO için)</Label><Input id="altText-dialog" value={imageForm.altText || ''} onChange={(e) => handleImageChange('altText', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="order-dialog">Sıra</Label><Input id="order-dialog" type="number" value={imageForm.order || 0} onChange={(e) => handleImageChange('order', parseInt(e.target.value))} /></div>
              <div className="flex flex-col justify-end pt-5"><div className="flex items-center space-x-2"><Switch id="isPublished-dialog" checked={imageForm.isPublished !== undefined ? imageForm.isPublished : true} onCheckedChange={(checked) => handleImageChange('isPublished', checked)} /><Label htmlFor="isPublished-dialog">Yayında</Label></div></div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">İptal</Button></DialogClose>
              <Button onClick={handleImageSave} disabled={isLoading}>{isLoading ? (editingImageId ? 'Güncelleniyor...' : 'Kaydediliyor...') : (editingImageId ? 'Değişiklikleri Kaydet' : 'Resmi Ekle')}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
