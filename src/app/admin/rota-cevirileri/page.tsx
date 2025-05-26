'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Panelde gösterilecek dil ve tip
interface LanguageOption {
  code: string;
  name: string;
}

// Rota çevirisi tipi
interface RouteTranslation {
  id?: string;
  routeKey: string;
  languageCode: string;
  translatedValue: string;
}

// Admin panelindeki rota çevirileri sayfası
export default function RoutesTranslationsPage() {
  const router = useRouter();
  
  // State'leri tanımla
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [translations, setTranslations] = useState<Record<string, RouteTranslation[]>>({});
  const [newRouteKey, setNewRouteKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Aktif dilleri al
        const langsResponse = await fetch('/api/admin/languages');
        const langsData = await langsResponse.json();
        
        // Sadece aktif dilleri kullan
        const activeLanguages = langsData.filter((lang: any) => lang.isActive);
        setLanguages(activeLanguages);
        
        // İlk aktif dil sekmesini seç
        if (activeLanguages.length > 0) {
          setActiveTab(activeLanguages[0].code);
        }
        
        // 2. Rota çevirilerini al
        const translationsResponse = await fetch('/api/admin/route-translations');
        const translationsData = await translationsResponse.json();
        
        // Çevirileri dil koduna göre grupla
        const translationsByLang: Record<string, RouteTranslation[]> = {};
        
        activeLanguages.forEach((lang: LanguageOption) => {
          // Her dil için boş bir dizi başlat
          translationsByLang[lang.code] = [];
        });
        
        // Çevirileri doğru dil gruplarına ekle
        translationsData.forEach((translation: RouteTranslation) => {
          const langCode = translation.languageCode;
          
          if (translationsByLang[langCode]) {
            translationsByLang[langCode].push(translation);
          }
        });
        
        setTranslations(translationsByLang);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        toast.error('Veriler yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Çeviri kaydet
  const handleSaveTranslation = async (translation: RouteTranslation) => {
    try {
      if (!translation.routeKey || !translation.translatedValue) {
        toast.error('Rota adı ve çevirisi zorunludur.');
        return;
      }
      
      // Veriyi kaydet
      const response = await fetch('/api/admin/route-translations', {
        method: translation.id ? 'PUT' : 'POST', // Varsa güncelle, yoksa oluştur
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(translation)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bir hata oluştu');
      }
      
      const savedTranslation = await response.json();
      
      // State'i güncelle
      setTranslations(prev => {
        const langTranslations = [...(prev[translation.languageCode] || [])];
        
        // Çeviri zaten varsa, güncelle
        const existingIndex = langTranslations.findIndex(t => 
          t.id === translation.id || (t.routeKey === translation.routeKey && t.languageCode === translation.languageCode));
        
        if (existingIndex >= 0) {
          langTranslations[existingIndex] = savedTranslation;
        } else {
          // Yoksa yeni çeviriyi ekle
          langTranslations.push(savedTranslation);
        }
        
        return {
          ...prev,
          [translation.languageCode]: langTranslations
        };
      });
      
      toast.success('Çeviri başarıyla kaydedildi.');
      
      // Yeni rota giriş alanını temizle
      if (!translation.id) {
        setNewRouteKey('');
      }
      
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      toast.error('Çeviri kaydedilemedi: ' + (error as Error).message);
    }
  };
  
  // Çeviri sil
  const handleDeleteTranslation = async (translation: RouteTranslation) => {
    try {
      if (!translation.id) return;
      
      const response = await fetch(`/api/admin/route-translations/${translation.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bir hata oluştu');
      }
      
      // State'i güncelle - silinen çeviriyi kaldır
      setTranslations(prev => {
        const langTranslations = prev[translation.languageCode] || [];
        const updatedTranslations = langTranslations.filter(t => t.id !== translation.id);
        
        return {
          ...prev,
          [translation.languageCode]: updatedTranslations
        };
      });
      
      toast.success('Çeviri başarıyla silindi.');
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Çeviri silinemedi: ' + (error as Error).message);
    }
  };
  
  // Çeviriyi güncelle
  const handleUpdateTranslation = (langCode: string, index: number, value: string) => {
    setTranslations(prev => {
      const langTranslations = [...(prev[langCode] || [])];
      
      if (index >= 0 && index < langTranslations.length) {
        // İlgili çeviriyi güncelle
        langTranslations[index] = {
          ...langTranslations[index],
          translatedValue: value
        };
      }
      
      return {
        ...prev,
        [langCode]: langTranslations
      };
    });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Rota Çevirileri</h1>
        <p>Yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rota Çevirileri</h1>
        <Button onClick={() => router.refresh()}>Yenile</Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Çeviriler Hakkında Bilgi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-2">
            Rota çevirileri, URL yollarının farklı dillerde nasıl görüneceğini belirler. 
            Örneğin, Türkçe'de &quot;hizmetler&quot; olan bir yol, İngilizce'de &quot;services&quot; olabilir.
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Rota Adı:</strong> URL yolunun temel adı (örn: &quot;hizmetler&quot;, &quot;blog&quot;, &quot;iletisim&quot;)
          </p>
          <p className="text-sm text-gray-600">
            <strong>Çeviri:</strong> Belirtilen dilde gösterilecek yol adı (örn: &quot;services&quot;, &quot;blog&quot;, &quot;contact&quot;)
          </p>
        </CardContent>
      </Card>
      
      {languages.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {languages.map(lang => (
              <TabsTrigger key={lang.code} value={lang.code}>
                {lang.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {languages.map(lang => (
            <TabsContent key={lang.code} value={lang.code}>
              <Card>
                <CardHeader>
                  <CardTitle>{lang.name} Rota Çevirileri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mevcut çeviriler */}
                    {translations[lang.code]?.map((translation, index) => (
                      <div key={translation.id || index} className="flex items-end gap-4">
                        <div className="flex-1">
                          <Label>Rota Adı</Label>
                          <Input 
                            value={translation.routeKey} 
                            onChange={() => {}} // Bu alan değiştirilemez
                            disabled
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Çeviri</Label>
                          <Input 
                            value={translation.translatedValue} 
                            onChange={(e) => handleUpdateTranslation(lang.code, index, e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleSaveTranslation(translation)}
                          >
                            Güncelle
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleDeleteTranslation(translation)}
                          >
                            Sil
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Yeni çeviri ekle */}
                    <div className="flex items-end gap-4 mt-8 pt-4 border-t">
                      <div className="flex-1">
                        <Label>Yeni Rota Adı</Label>
                        <Input 
                          value={newRouteKey} 
                          onChange={(e) => setNewRouteKey(e.target.value)}
                          placeholder="örn: hizmetler"
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Çeviri</Label>
                        <Input 
                          placeholder={`örn: ${lang.code === 'en' ? 'services' : 'çeviri'}`}
                          id={`new-translation-${lang.code}`}
                        />
                      </div>
                      <Button 
                        onClick={() => {
                          const translatedValue = (document.getElementById(`new-translation-${lang.code}`) as HTMLInputElement)?.value;
                          handleSaveTranslation({
                            routeKey: newRouteKey,
                            languageCode: lang.code,
                            translatedValue: translatedValue || ''
                          });
                        }}
                      >
                        Ekle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <p>Aktif dil bulunamadı. Lütfen önce dil ekleyin.</p>
      )}
    </div>
  );
}