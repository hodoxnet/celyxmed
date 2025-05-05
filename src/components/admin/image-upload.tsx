"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Loader2, X, Camera } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
  buttonText?: string;
  showPreview?: boolean;
  initialImage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded, 
  className,
  buttonText = "Resim Yükle",
  showPreview = false,
  initialImage = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dosya seçilince önizleme oluştur
  const createPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Sadece resim dosyalarına izin ver
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }
    
    // Dosya boyutunu kontrol et (10MB'dan küçük olmalı)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Dosya boyutu 10MB\'dan küçük olmalıdır');
      return;
    }
    
    // Önizleme oluştur (eğer gösterilecekse)
    if (showPreview) {
      createPreview(file);
    }
    
    setIsUploading(true);
    setUploadProgress(10); // Başlangıç değeri
    
    try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('file', file);
      
      // Yükleme animasyonu için simüle edilmiş ilerleme
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.floor(Math.random() * 10);
        });
      }, 300);
      
      // API'ye yükleme isteği gönder
      const response = await fetch('/api/admin/upload', {
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
      
      // Yüklenen resmin URL'sini callback ile bildir
      onImageUploaded(data.url);
      toast.success('Resim başarıyla yüklendi');
      
      // URL'i önizleme için kaydet
      if (showPreview && data.url) {
        setPreviewUrl(data.url);
      }
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Resim yüklenirken bir hata oluştu');
      setPreviewUrl('');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Input alanını sıfırla
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const handleClearImage = () => {
    setPreviewUrl('');
    onImageUploaded('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  return (
    <div className={`${className} space-y-2`}>
      {/* Resim önizleme alanı */}
      {showPreview && previewUrl && (
        <div className="relative rounded-md overflow-hidden border mb-2">
          <img 
            src={previewUrl} 
            alt="Yüklenen resim önizlemesi" 
            className="w-full h-auto object-cover max-h-48"
            onError={() => setPreviewUrl('')}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90 hover:opacity-100"
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
        <label htmlFor="image-upload" className="cursor-pointer flex-1">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 w-full"
            disabled={isUploading}
            asChild
          >
            <span>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Yükleniyor... {uploadProgress}%</span>
                </>
              ) : (
                <>
                  {previewUrl ? <Camera className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  <span>{previewUrl ? "Resmi Değiştir" : buttonText}</span>
                </>
              )}
            </span>
          </Button>
        </label>
        
        {previewUrl && !showPreview && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-10 w-10"
            onClick={handleClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <input
        type="file"
        id="image-upload"
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