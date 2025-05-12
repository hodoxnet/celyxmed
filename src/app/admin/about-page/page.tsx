"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AboutPageAdmin() {
  const defaultLocale = "tr"; // Varsayılan dil olarak Türkçe
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>(defaultLocale);
  const [aboutPage, setAboutPage] = useState<any>({
    id: "main",
    heroImageUrl: "",
    galleryImages: [],
    careItems: [],
    doctors: [],
    translations: {}
  });

  // Form değişikliklerini işle
  const handleTranslationChange = (lang: string, field: string, value: string) => {
    setAboutPage(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...(prev.translations[lang] || {}),
          [field]: value
        }
      }
    }));
  };

  // Hero görseli güncelle
  const handleHeroImageChange = (url: string) => {
    setAboutPage(prev => ({
      ...prev,
      heroImageUrl: url
    }));
  };

  // API'den dilleri getir
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch("/api/languages");
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setLanguages(data);
        }
      } catch (error) {
        console.error("Diller yüklenirken hata oluştu:", error);
        toast.error("Diller yüklenemedi!");
      }
    };

    fetchLanguages();
  }, []);

  // API'den Hakkımızda sayfası verilerini getir
  useEffect(() => {
    const fetchAboutPage = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/about-page");

        if (response.ok) {
          const data = await response.json();

          // Verileri düzenle
          const translationsByLang: any = {};

          if (data.translations) {
            data.translations.forEach((translation: any) => {
              // İlişki verilerini temizle
              const { language, ...translationData } = translation;
              translationsByLang[translation.languageCode] = translationData;
            });
          }

          setAboutPage({
            ...data,
            translations: translationsByLang
          });
        } else {
          // Veri yoksa varsayılan yapı
          console.log("Hakkımızda sayfası verileri bulunamadı, yeni bir kayıt oluşturulacak.");
        }
      } catch (error) {
        console.error("Hakkımızda sayfası verileri yüklenirken hata oluştu:", error);
        toast.error("Veriler yüklenemedi!");
      } finally {
        setLoading(false);
      }
    };

    fetchAboutPage();
  }, []);

  // Formu kaydet
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const translationsArray = Object.entries(aboutPage.translations).map(([langCode, data]) => ({
        languageCode: langCode,
        ...data
      }));

      const payload = {
        ...aboutPage,
        translations: translationsArray
      };

      const response = await fetch("/api/admin/about-page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success("Hakkımızda sayfası başarıyla kaydedildi!");
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error("API hatası:", errorData);
        throw new Error(errorData.message || errorData.error || "Kayıt sırasında bir hata oluştu.");
      }
    } catch (error: any) {
      console.error("Kayıt sırasında hata:", error);
      toast.error(error.message || "Kayıt başarısız!");
    } finally {
      setLoading(false);
    }
  };

  const getEmptyTranslation = () => {
    return {
      // Hero bölümü
      heroTitle: "",
      heroDescription: "",
      heroPrimaryButtonText: "",
      heroPrimaryButtonLink: "",
      heroSecondaryButtonText: "",
      heroSecondaryButtonLink: "",

      // JCI bölümü
      jciTitle: "",
      jciPrimaryButtonText: "",
      jciPrimaryButtonLink: "",
      jciSecondaryButtonText: "",
      jciSecondaryButtonLink: "",

      // Doktor bölümü
      doctorsTitle: "Uzman Doktorlarımız, Güvenilir Bakım Ekibiniz",
      doctorsDescription: "Celyxmed'de doktorlarımız uzmanlardan daha fazlasıdır - kendilerini kişiselleştirilmiş bakım sağlamaya ve hayat değiştiren sonuçlar elde etmeye adamış, alanlarında lider kişilerdir. Yılların deneyimiyle, sağlık yolculuğunuzun en iyi ellerde olmasını sağlarlar.",
    };
  };

  // Galeri, bakım öğeleri ve doktorlar için yönetim arayüzleri ayrı sayfalar/bölümler olarak eklenecek

  return (
    <div className="flex-1 space-y-4 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hakkımızda Sayfası</h2>
          <p className="text-sm text-muted-foreground">
            Hakkımızda sayfası içeriğini düzenleyin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Hero Görseli</CardTitle>
              <CardDescription>
                Hakkımızda sayfasının üst bölümünde görüntülenecek arka plan görseli
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                endpoint="aboutPageHero"
                value={aboutPage.heroImageUrl}
                onChange={handleHeroImageChange}
              />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex justify-start overflow-x-auto">
              {languages.map((lang) => (
                <TabsTrigger 
                  key={lang.code} 
                  value={lang.code}
                  disabled={!lang.isActive}
                  className="min-w-20"
                >
                  {lang.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {languages.map((lang) => {
              const translation = aboutPage.translations[lang.code] || getEmptyTranslation();
              
              return (
                <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hero Bölümü Metinleri ({lang.name})</CardTitle>
                      <CardDescription>
                        Hakkımızda sayfası üst bölümünde yer alan metinler
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`heroTitle-${lang.code}`}>Başlık</Label>
                        <Input
                          id={`heroTitle-${lang.code}`}
                          value={translation.heroTitle || ""}
                          onChange={(e) => handleTranslationChange(lang.code, "heroTitle", e.target.value)}
                          placeholder="Sağlık ve Güzellik Alanında Güvenilir Ortağınız"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`heroDescription-${lang.code}`}>Açıklama</Label>
                        <Textarea
                          id={`heroDescription-${lang.code}`}
                          value={translation.heroDescription || ""}
                          onChange={(e) => handleTranslationChange(lang.code, "heroDescription", e.target.value)}
                          placeholder="Celyxmed, hasta öncelikli bir yaklaşımla kişiselleştirilmiş sağlık çözümleri sunmaya kendini adamıştır..."
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`heroPrimaryButtonText-${lang.code}`}>Ana Buton Metni</Label>
                          <Input
                            id={`heroPrimaryButtonText-${lang.code}`}
                            value={translation.heroPrimaryButtonText || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "heroPrimaryButtonText", e.target.value)}
                            placeholder="Kliniğimizi Keşfedin"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`heroPrimaryButtonLink-${lang.code}`}>Ana Buton Bağlantısı</Label>
                          <Input
                            id={`heroPrimaryButtonLink-${lang.code}`}
                            value={translation.heroPrimaryButtonLink || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "heroPrimaryButtonLink", e.target.value)}
                            placeholder="#klinik"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`heroSecondaryButtonText-${lang.code}`}>İkincil Buton Metni</Label>
                          <Input
                            id={`heroSecondaryButtonText-${lang.code}`}
                            value={translation.heroSecondaryButtonText || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "heroSecondaryButtonText", e.target.value)}
                            placeholder="Doktorlarımızla Tanışın"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`heroSecondaryButtonLink-${lang.code}`}>İkincil Buton Bağlantısı</Label>
                          <Input
                            id={`heroSecondaryButtonLink-${lang.code}`}
                            value={translation.heroSecondaryButtonLink || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "heroSecondaryButtonLink", e.target.value)}
                            placeholder="#doktorlar"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>JCI Akreditasyon Bölümü ({lang.name})</CardTitle>
                      <CardDescription>
                        JCI akreditasyon bölümü metinleri
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`jciTitle-${lang.code}`}>Başlık</Label>
                        <Textarea
                          id={`jciTitle-${lang.code}`}
                          value={translation.jciTitle || ""}
                          onChange={(e) => handleTranslationChange(lang.code, "jciTitle", e.target.value)}
                          placeholder="Celyxmed ile dünya standartlarında sağlık hizmetini deneyimleyin..."
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`jciPrimaryButtonText-${lang.code}`}>Ana Buton Metni</Label>
                          <Input
                            id={`jciPrimaryButtonText-${lang.code}`}
                            value={translation.jciPrimaryButtonText || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "jciPrimaryButtonText", e.target.value)}
                            placeholder="Kliniğimizi Keşfedin"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`jciPrimaryButtonLink-${lang.code}`}>Ana Buton Bağlantısı</Label>
                          <Input
                            id={`jciPrimaryButtonLink-${lang.code}`}
                            value={translation.jciPrimaryButtonLink || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "jciPrimaryButtonLink", e.target.value)}
                            placeholder="#klinik"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`jciSecondaryButtonText-${lang.code}`}>İkincil Buton Metni</Label>
                          <Input
                            id={`jciSecondaryButtonText-${lang.code}`}
                            value={translation.jciSecondaryButtonText || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "jciSecondaryButtonText", e.target.value)}
                            placeholder="Doktorlarımızla Tanışın"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`jciSecondaryButtonLink-${lang.code}`}>İkincil Buton Bağlantısı</Label>
                          <Input
                            id={`jciSecondaryButtonLink-${lang.code}`}
                            value={translation.jciSecondaryButtonLink || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "jciSecondaryButtonLink", e.target.value)}
                            placeholder="#doktorlar"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Doktorlar Bölümü ({lang.name})</CardTitle>
                      <CardDescription>
                        Doktorlar bölümü başlığı ve açıklaması
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`doctorsTitle-${lang.code}`}>Başlık</Label>
                        <Input
                          id={`doctorsTitle-${lang.code}`}
                          value={translation.doctorsTitle || ""}
                          onChange={(e) => handleTranslationChange(lang.code, "doctorsTitle", e.target.value)}
                          placeholder="Uzman Doktorlarımız, Güvenilir Bakım Ekibiniz"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`doctorsDescription-${lang.code}`}>Açıklama</Label>
                        <Textarea
                          id={`doctorsDescription-${lang.code}`}
                          value={translation.doctorsDescription || ""}
                          onChange={(e) => handleTranslationChange(lang.code, "doctorsDescription", e.target.value)}
                          placeholder="Celyxmed'de doktorlarımız uzmanlardan daha fazlasıdır..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Klinik Galeri Resimleri</CardTitle>
            <CardDescription>
              Klinik galeri resimleri yönetimi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/admin/about-page/gallery")}
              variant="outline"
              className="w-full"
            >
              Galeri Yönetimi
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Kapsamlı Bakım Öğeleri</CardTitle>
            <CardDescription>
              Kapsamlı bakım bölümü içerik yönetimi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/admin/about-page/care-items")}
              variant="outline"
              className="w-full"
            >
              Kapsamlı Bakım Yönetimi
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Doktorlar</CardTitle>
            <CardDescription>
              Doktor bilgileri yönetimi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/admin/about-page/doctors")}
              variant="outline"
              className="w-full"
            >
              Doktor Yönetimi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}