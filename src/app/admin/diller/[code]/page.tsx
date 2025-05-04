"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useParams ve useRouter import edildi
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Textarea eklendi
import { toast } from 'sonner';
import { ArrowLeft, PlusCircle, Trash2, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Skeleton eklendi

// Çeviri objesi tipi (key: string, value: string veya nested object)
type TranslationObject = { [key: string]: string | TranslationObject };

export default function EditTranslationsPage() {
  const params = useParams();
  const router = useRouter();
  const langCode = params.code as string; // URL'den dil kodunu al

  const [translations, setTranslations] = useState<TranslationObject>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState(''); // Filtreleme state'i

  // Veri çekme
  const fetchTranslations = useCallback(async () => {
    if (!langCode) return;
    setIsLoading(true); setError(null);
    try {
      const response = await fetch(`/api/admin/translations/${langCode}`);
      if (!response.ok) {
         // Dosya yoksa (API {} döndürürse) veya başka bir hata varsa
         const errorData = await response.json().catch(() => ({}));
         if (response.status === 404 || Object.keys(errorData).length === 0) {
            setTranslations({}); // Boş obje ata
            console.warn(`Translation file for ${langCode} not found or empty.`);
         } else {
            throw new Error(errorData.message || `API Hatası: ${response.status}`);
         }
      } else {
         setTranslations(await response.json());
      }
    } catch (err: any) {
      setError(err); toast.error(`Çeviriler yüklenirken hata: ${err.message}`);
    } finally { setIsLoading(false); }
  }, [langCode]);

  useEffect(() => { fetchTranslations(); }, [fetchTranslations]);

  // Değişiklikleri state'e yansıtma (nested objeler için)
  const handleInputChange = (keys: string[], value: string) => {
    setTranslations(prev => {
      const newTranslations = JSON.parse(JSON.stringify(prev)); // Deep copy
      let currentLevel = newTranslations;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!currentLevel[keys[i]] || typeof currentLevel[keys[i]] !== 'object') {
          currentLevel[keys[i]] = {}; // Eğer ara obje yoksa oluştur
        }
        currentLevel = currentLevel[keys[i]] as TranslationObject;
      }
      currentLevel[keys[keys.length - 1]] = value;
      return newTranslations;
    });
  };

  // Yeni anahtar ekleme
  const handleAddKey = (keys: string[]) => {
     const newKey = prompt("Yeni anahtar adını girin (örn: newKey veya nested.newKey):");
     if (!newKey || !newKey.trim()) return;

     const keyParts = newKey.trim().split('.');
     const fullPath = keys.concat(keyParts);

     setTranslations(prev => {
       const newTranslations = JSON.parse(JSON.stringify(prev));
       let currentLevel = newTranslations;
       for (let i = 0; i < fullPath.length - 1; i++) {
         const part = fullPath[i];
         if (!currentLevel[part] || typeof currentLevel[part] !== 'object') {
           currentLevel[part] = {};
         }
         currentLevel = currentLevel[part] as TranslationObject;
       }
       // Eğer anahtar zaten varsa üzerine yazma (veya kullanıcıya sor)
       if (currentLevel[fullPath[fullPath.length - 1]] === undefined) {
          currentLevel[fullPath[fullPath.length - 1]] = ""; // Başlangıçta boş değer
       } else {
          toast.warning(`Anahtar "${newKey}" zaten mevcut.`);
       }
       return newTranslations;
     });
  };

  // Anahtar silme
  const handleDeleteKey = (keys: string[]) => {
     if (!confirm(`'${keys.join('.')}' anahtarını silmek istediğinizden emin misiniz?`)) return;

     setTranslations(prev => {
       const newTranslations = JSON.parse(JSON.stringify(prev));
       let currentLevel = newTranslations;
       for (let i = 0; i < keys.length - 1; i++) {
         // Eğer ara yol yoksa bir şey yapma
         if (!currentLevel[keys[i]] || typeof currentLevel[keys[i]] !== 'object') return prev;
         currentLevel = currentLevel[keys[i]] as TranslationObject;
       }
       delete currentLevel[keys[keys.length - 1]];
       // Eğer üst obje boş kaldıysa onu da silmek gerekebilir (opsiyonel)
       return newTranslations;
     });
  };


  // Değişiklikleri kaydetme
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/translations/${langCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(translations),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'API Hatası');
      toast.success(`Çeviriler (${langCode}) başarıyla kaydedildi!`);
    } catch (err: any) {
      toast.error(`Kaydetme hatası: ${err.message}`);
    } finally { setIsSaving(false); }
  };

  // Çevirileri render eden recursive fonksiyon
  const renderTranslations = (obj: TranslationObject, currentPath: string[] = [], level = 0): React.ReactNode[] => {
    return Object.entries(obj)
      .filter(([key, value]) => {
         // Filtreleme mantığı (hem anahtar hem değerde arama)
         const fullKey = [...currentPath, key].join('.');
         const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
         return filter === '' || fullKey.toLowerCase().includes(filter.toLowerCase()) || stringValue.toLowerCase().includes(filter.toLowerCase());
      })
      .map(([key, value]) => {
      const fullPath = [...currentPath, key];
      const isNested = typeof value === 'object' && value !== null && !Array.isArray(value);

      return (
        <div key={fullPath.join('.')} className={`ml-${level * 4} mb-4 p-3 border rounded-md bg-white shadow-sm`}>
          <div className="flex justify-between items-center mb-2">
             <strong className="font-semibold text-gray-700">{key}</strong>
             <div className="flex items-center gap-2">
                {isNested && (
                   <Button variant="outline" size="sm" onClick={() => handleAddKey(fullPath)}>
                      <PlusCircle className="h-4 w-4" />
                   </Button>
                )}
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteKey(fullPath)}>
                   <Trash2 className="h-4 w-4" />
                </Button>
             </div>
          </div>
          {isNested
            ? <div className="mt-2 border-l-2 pl-3">{renderTranslations(value as TranslationObject, fullPath, level + 1)}</div>
            : (
              <Textarea
                value={value as string}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(fullPath, e.target.value)} // e parametresine tip eklendi
                className="w-full min-h-[60px] text-sm"
                rows={Math.max(1, (value as string).split('\n').length)} // Satır sayısına göre yüksekliği ayarla
              />
            )
          }
        </div>
      );
    });
  };

  if (!langCode) {
    return <div className="container mx-auto py-10 text-red-600">Dil kodu bulunamadı!</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
           <Button variant="outline" size="sm" onClick={() => router.push('/admin/diller')} className="mr-4">
             <ArrowLeft className="mr-2 h-4 w-4" /> Geri
           </Button>
           <h1 className="text-3xl font-bold inline-block align-middle">Çeviri Yönetimi: {langCode.toUpperCase()}</h1>
        </div>
        <Button onClick={handleSaveChanges} disabled={isLoading || isSaving}>
          <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>

       <div className="mb-4 flex gap-4">
          <Input
             placeholder="Anahtar veya değerde ara..."
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="max-w-sm"
             disabled={isLoading}
          />
          <Button variant="outline" onClick={() => handleAddKey([])} disabled={isLoading}>
             <PlusCircle className="mr-2 h-4 w-4" /> Kök Anahtar Ekle
          </Button>
       </div>


      {isLoading ? (
         <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
         </div>
      ) : error ? (
        <div className="text-red-600">Hata: {error.message}</div>
      ) : Object.keys(translations).length === 0 && filter === '' ? (
         <div className="text-center text-gray-500 py-10">Bu dil için henüz çeviri eklenmemiş.</div>
      ) : (
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
           {renderTranslations(translations)}
           {Object.keys(translations).length > 0 && renderTranslations(translations).length === 0 && filter !== '' && (
              <div className="text-center text-gray-500 py-5">Filtre ile eşleşen sonuç bulunamadı.</div>
           )}
        </div>
      )}
    </div>
  );
}
