"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from 'react'; // useEffect import edildi
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Loader2, X, Camera } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image'; // next/image import edildi

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
  buttonText?: string;
  showPreview?: boolean;
  initialImage?: string;
  uploadFolder?: string; // Hedef klasör prop'u eklendi
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  className,
  buttonText = "Resim Yükle",
  showPreview = false,
  initialImage = "",
  uploadFolder // Prop alındı
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // previewUrl state'i initialImage değiştiğinde güncellenmeli
  const [previewUrl, setPreviewUrl] = useState<string>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // initialImage prop'u değiştiğinde previewUrl'i güncelle
  useEffect(() => {
    setPreviewUrl(initialImage);
  }, [initialImage]);

  // Dosya seçilince Data URL önizlemesi oluştur
  const createPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Data URL'i geçici önizleme için kullan
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Dosya boyutu 10MB\'dan küçük olmalıdır');
      return;
    }

    // Geçici Data URL önizlemesi
    if (showPreview) {
      createPreview(file);
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.floor(Math.random() * 10);
        });
      }, 300);

      // API endpoint URL'ini dinamik yap
      const uploadUrl = uploadFolder 
        ? `/api/admin/upload?folder=${encodeURIComponent(uploadFolder)}` 
        : '/api/admin/upload'; // Folder yoksa varsayılan

      const response = await fetch(uploadUrl, { // Güncellenmiş URL kullanıldı
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Dosya yüklenirken bir hata oluştu');
      }

      setUploadProgress(100);
      const data = await response.json();

      onImageUploaded(data.url); // Yüklenen göreceli yolu bildir
      toast.success('Resim başarıyla yüklendi');

      // Başarılı yükleme sonrası sunucudan dönen göreceli yolu previewUrl olarak ayarla
      setPreviewUrl(data.url);

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Resim yüklenirken bir hata oluştu');
      setPreviewUrl(''); // Hata durumunda önizlemeyi temizle
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearImage = () => {
    setPreviewUrl('');
    onImageUploaded('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // previewUrl'in geçerli bir string olup olmadığını kontrol et
  const hasValidPreview = typeof previewUrl === 'string' && previewUrl.length > 0;

  return (
    <div className={`${className} space-y-2`}>
      {/* Resim önizleme alanı (next/image ile) */}
      {showPreview && hasValidPreview && (
        <div className="relative rounded-md overflow-hidden border mb-2 h-48 w-full"> {/* Sabit yükseklik ve genişlik belirlendi */}
          {previewUrl.startsWith('data:') ? (
            // Data URL ise img kullan
            <div className="w-full h-full relative">
              <img
                src={previewUrl}
                alt="Yüklenen resim önizlemesi"
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            // Normal URL ise next/image kullan
            <Image
              src={previewUrl} // Göreceli yol (/uploads/...) veya tam URL olabilir
              alt="Yüklenen resim önizlemesi"
              fill // Konteyneri doldur
              style={{ objectFit: 'cover' }} // Resmi kapla
              onError={() => {
                console.warn(`Önizleme yüklenemedi: ${previewUrl}`);
                setPreviewUrl(''); // Hata durumunda temizle
              }}
              unoptimized={previewUrl.startsWith('blob:')} // Blob URL ise optimizasyonu kapat
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90 hover:opacity-100 z-10" // z-index eklendi
            onClick={handleClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Yükleme ilerleme çubuğu */}
      {isUploading && (
        <Progress value={uploadProgress} className="h-1 mb-2" />
      )}

      {/* Yükleme butonu */}
      <div className="flex items-center gap-2">
        <label htmlFor={`image-upload-${fileInputRef.current?.id || 'default'}`} className="cursor-pointer flex-1"> {/* ID'yi dinamik yap */}
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 w-full"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()} // Butona tıklayınca input'u tetikle
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Yükleniyor... {uploadProgress}%</span>
              </>
            ) : (
              <>
                {hasValidPreview ? <Camera className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                <span>{hasValidPreview ? "Resmi Değiştir" : buttonText}</span>
              </>
            )}
          </Button>
        </label>

        {/* Bu buton artık gereksiz, önizleme üzerindeki X butonu var */}
        {/* {previewUrl && !showPreview && ( ... )} */}
      </div>

      <input
        type="file"
        id={`image-upload-${fileInputRef.current?.id || 'default'}`} // ID'yi dinamik yap
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
        ref={fileInputRef}
      />
    </div>
  );
};

export default ImageUpload;
