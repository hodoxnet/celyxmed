"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  MapPin,
  AlertCircle
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/generated/prisma/client";

interface ContactPageModule {
  id: string;
  title: string;
  icon: React.ElementType;
  description?: string;
}

const modules: ContactPageModule[] = [
  { id: "general", title: "Genel Ayarlar", icon: LayoutDashboard, description: "İletişim sayfası genel ayarlarını düzenleyin" },
  { id: "form", title: "Form İçerikleri", icon: MessageSquare, description: "İletişim formu başlık, açıklama ve etiketlerini düzenleyin" },
  { id: "advisor", title: "Danışman Bilgi Bölümü", icon: Users, description: "Sol taraftaki sağlık danışmanı bilgi bölümünü düzenleyin" },
  { id: "contact-info", title: "İletişim Bilgileri", icon: MapPin, description: "Harita altındaki iletişim bilgilerini düzenleyin" },
  { id: "messages", title: "Sistem Mesajları", icon: AlertCircle, description: "Başarı, hata ve uyarı mesajlarını düzenleyin" },
];

export default function ContactPageAdmin() {
  const defaultLocale = "tr"; // Varsayılan dil olarak Türkçe
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeLanguageCode, setActiveLanguageCode] = useState<string>(defaultLocale);
  const [selectedModule, setSelectedModule] = useState<ContactPageModule | null>(modules[0] || null);
  
  const [contactPage, setContactPage] = useState<any>({
    id: "main",
    heroImageUrl: "",
    translations: {}
  });

  // Dilleri yükle
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch("/api/languages");
        const data = await response.json();
        setLanguages(data);
      } catch (error) {
        console.error("Diller yüklenirken hata:", error);
      }
    };

    fetchLanguages();
  }, []);

  // Contact page verilerini yükle
  useEffect(() => {
    const fetchContactPage = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/contact-page?lang=${activeLanguageCode}`);
        if (response.ok) {
          const data = await response.json();
          setContactPage((prev: any) => ({
            ...prev,
            ...data,
            translations: {
              ...prev.translations,
              [activeLanguageCode]: data
            }
          }));
        }
      } catch (error) {
        console.error("Contact page verisi yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeLanguageCode) {
      fetchContactPage();
    }
  }, [activeLanguageCode]);

  const handleTranslationChange = (field: string, value: string) => {
    setContactPage((prev: any) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeLanguageCode]: {
          ...prev.translations[activeLanguageCode],
          [field]: value
        }
      }
    }));
  };

  const handleImageChange = (field: string, value: string) => {
    setContactPage((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Modül seçimi
  const handleModuleSelect = (module: ContactPageModule) => {
    setSelectedModule(module);
  };

  // Boş çeviri objesi
  const getEmptyTranslation = () => ({
    formTitle: "",
    formDescription: "",
    nameLabel: "",
    namePlaceholder: "",
    contactMethodLabel: "",
    phoneLabel: "",
    phonePlaceholder: "",
    emailLabel: "",
    emailPlaceholder: "",
    messageLabel: "",
    messagePlaceholder: "",
    submitButtonText: "",
    privacyCheckboxText: "",
    onlineIndicatorText: "",
    advisorTitle: "",
    advisorDescription: "",
    mapTitle: "",
    addressTitle: "",
    addressText: "",
    phoneTitle: "",
    phoneText: "",
    emailTitle: "",
    emailText: "",
    workingHoursTitle: "",
    workingHoursText: "",
    successMessage: "",
    errorMessage: "",
    privacyErrorMessage: ""
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/contact-page", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          heroImageUrl: contactPage.heroImageUrl,
          translations: contactPage.translations,
        }),
      });

      if (response.ok) {
        toast.success("İletişim sayfası başarıyla güncellendi!");
      } else {
        toast.error("Kaydetme sırasında bir hata oluştu");
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast.error("Kaydetme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Modül içeriklerini render et
  const renderModuleContent = () => {
    if (loading) return <div className="flex items-center justify-center h-64"><div className="text-center">Yükleniyor...</div></div>;
    if (languages.length === 0) return (
      <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-medium">Aktif dil bulunamadı</h3>
        </div>
        <p className="text-sm text-red-600">Lütfen yönetim panelinden en az bir dili aktif hale getirin.</p>
      </div>
    );
    
    if (!selectedModule) return <div className="flex items-center justify-center h-64"><div className="text-center">Lütfen bir modül seçin</div></div>;

    // Her modüle özel içerik
    switch(selectedModule.id) {
      case 'general':
        return renderGeneralSettings();
      case 'form':
        return renderFormSettings();
      case 'advisor':
        return renderAdvisorSettings();
      case 'contact-info':
        return renderContactInfoSettings();
      case 'messages':
        return renderMessagesSettings();
      default:
        return (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium mb-2">Bu modül henüz hazır değil</h3>
            <p className="text-muted-foreground">Bu modül için içerik yakında eklenecek.</p>
          </div>
        );
    }
  };

  // Genel Ayarlar Bölümü
  const renderGeneralSettings = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Genel Ayarlar</CardTitle>
            <CardDescription>
              İletişim sayfası genel ayarlarını düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="heroImage">Ana Görsel</Label>
              <p className="text-sm text-muted-foreground mb-3">
                İletişim sayfasında kullanılacak ana görseli yükleyin
              </p>
              <ImageUpload
                value={contactPage.heroImageUrl || ""}
                onChange={(value) => handleImageChange("heroImageUrl", value)}
                onImageUploaded={(value) => handleImageChange("heroImageUrl", value)}
                showPreview={true}
                folder="contact"
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Form İçerikleri Bölümü
  const renderFormSettings = () => {
    const translation = contactPage.translations[activeLanguageCode] || getEmptyTranslation();
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Başlık ve Açıklama</CardTitle>
            <CardDescription>
              {activeLanguageCode.toUpperCase()} dilinde form başlık ve açıklama metinlerini düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formTitle">Form Başlığı</Label>
              <Input
                id="formTitle"
                value={translation.formTitle || ""}
                onChange={(e) => handleTranslationChange("formTitle", e.target.value)}
                placeholder="Bize ulaşın"
              />
            </div>
            <div>
              <Label htmlFor="formDescription">Form Açıklaması</Label>
              <Textarea
                id="formDescription"
                value={translation.formDescription || ""}
                onChange={(e) => handleTranslationChange("formDescription", e.target.value)}
                placeholder="Size 24 saat içinde mümkün olan en kısa sürede geri dönmek için elimizden geleni yapacağız!"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Alan Etiketleri</CardTitle>
            <CardDescription>
              {activeLanguageCode.toUpperCase()} dilinde form alanlarının etiket ve placeholder metinlerini düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nameLabel">İsim Etiketi</Label>
                <Input
                  id="nameLabel"
                  value={translation.nameLabel || ""}
                  onChange={(e) => handleTranslationChange("nameLabel", e.target.value)}
                  placeholder="İsim Soyisim"
                />
              </div>
              <div>
                <Label htmlFor="namePlaceholder">İsim Placeholder</Label>
                <Input
                  id="namePlaceholder"
                  value={translation.namePlaceholder || ""}
                  onChange={(e) => handleTranslationChange("namePlaceholder", e.target.value)}
                  placeholder="İsim Soyisim"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneLabel">Telefon Etiketi</Label>
                <Input
                  id="phoneLabel"
                  value={translation.phoneLabel || ""}
                  onChange={(e) => handleTranslationChange("phoneLabel", e.target.value)}
                  placeholder="Telefon"
                />
              </div>
              <div>
                <Label htmlFor="phonePlaceholder">Telefon Placeholder</Label>
                <Input
                  id="phonePlaceholder"
                  value={translation.phonePlaceholder || ""}
                  onChange={(e) => handleTranslationChange("phonePlaceholder", e.target.value)}
                  placeholder="5XX XXX XX XX"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emailLabel">E-posta Etiketi</Label>
                <Input
                  id="emailLabel"
                  value={translation.emailLabel || ""}
                  onChange={(e) => handleTranslationChange("emailLabel", e.target.value)}
                  placeholder="E-posta"
                />
              </div>
              <div>
                <Label htmlFor="emailPlaceholder">E-posta Placeholder</Label>
                <Input
                  id="emailPlaceholder"
                  value={translation.emailPlaceholder || ""}
                  onChange={(e) => handleTranslationChange("emailPlaceholder", e.target.value)}
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contactMethodLabel">İletişim Türü Etiketi</Label>
              <Input
                id="contactMethodLabel"
                value={translation.contactMethodLabel || ""}
                onChange={(e) => handleTranslationChange("contactMethodLabel", e.target.value)}
                placeholder="İletişim Türü"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="messageLabel">Mesaj Etiketi</Label>
                <Input
                  id="messageLabel"
                  value={translation.messageLabel || ""}
                  onChange={(e) => handleTranslationChange("messageLabel", e.target.value)}
                  placeholder="Mesajınız"
                />
              </div>
              <div>
                <Label htmlFor="messagePlaceholder">Mesaj Placeholder</Label>
                <Input
                  id="messagePlaceholder"
                  value={translation.messagePlaceholder || ""}
                  onChange={(e) => handleTranslationChange("messagePlaceholder", e.target.value)}
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="submitButtonText">Gönder Butonu Metni</Label>
              <Input
                id="submitButtonText"
                value={translation.submitButtonText || ""}
                onChange={(e) => handleTranslationChange("submitButtonText", e.target.value)}
                placeholder="Mesaj Gönder"
              />
            </div>

            <div>
              <Label htmlFor="privacyCheckboxText">Gizlilik Onay Metni</Label>
              <Textarea
                id="privacyCheckboxText"
                value={translation.privacyCheckboxText || ""}
                onChange={(e) => handleTranslationChange("privacyCheckboxText", e.target.value)}
                placeholder="Gizlilik politikasını kabul ediyorum"
                rows={2}
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Danışman Bilgi Bölümü
  const renderAdvisorSettings = () => {
    const translation = contactPage.translations[activeLanguageCode] || getEmptyTranslation();
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sağlık Danışmanı Bölümü</CardTitle>
            <CardDescription>
              {activeLanguageCode.toUpperCase()} dilinde sol taraftaki danışman bilgi bölümü metinlerini düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="onlineIndicatorText">Çevrimiçi Gösterge Metni</Label>
              <Input
                id="onlineIndicatorText"
                value={translation.onlineIndicatorText || ""}
                onChange={(e) => handleTranslationChange("onlineIndicatorText", e.target.value)}
                placeholder="Sağlık Danışmanlarımız Çevrimiçi"
              />
            </div>
            <div>
              <Label htmlFor="advisorTitle">Danışman Başlığı</Label>
              <Textarea
                id="advisorTitle"
                value={translation.advisorTitle || ""}
                onChange={(e) => handleTranslationChange("advisorTitle", e.target.value)}
                placeholder="Sağlık Danışmanlarımız Çevrimiçi ve Size Yardımcı Olmaya Hazır"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="advisorDescription">Danışman Açıklaması</Label>
              <Textarea
                id="advisorDescription"
                value={translation.advisorDescription || ""}
                onChange={(e) => handleTranslationChange("advisorDescription", e.target.value)}
                placeholder="Uzman ekibimiz, sağlık yolculuğunuzda size rehberlik etmek için burada..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // İletişim Bilgileri Bölümü
  const renderContactInfoSettings = () => {
    const translation = contactPage.translations[activeLanguageCode] || getEmptyTranslation();
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
            <CardDescription>
              {activeLanguageCode.toUpperCase()} dilinde harita ve iletişim bilgileri bölümünü düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mapTitle">Harita Başlığı</Label>
              <Input
                id="mapTitle"
                value={translation.mapTitle || ""}
                onChange={(e) => handleTranslationChange("mapTitle", e.target.value)}
                placeholder="Bize Ulaşın"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addressTitle">Adres Başlığı</Label>
                <Input
                  id="addressTitle"
                  value={translation.addressTitle || ""}
                  onChange={(e) => handleTranslationChange("addressTitle", e.target.value)}
                  placeholder="Adres"
                />
              </div>
              <div>
                <Label htmlFor="addressText">Adres Metni</Label>
                <Textarea
                  id="addressText"
                  value={translation.addressText || ""}
                  onChange={(e) => handleTranslationChange("addressText", e.target.value)}
                  placeholder="Ataşehir, İstanbul"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneTitle">Telefon Başlığı</Label>
                <Input
                  id="phoneTitle"
                  value={translation.phoneTitle || ""}
                  onChange={(e) => handleTranslationChange("phoneTitle", e.target.value)}
                  placeholder="Telefon"
                />
              </div>
              <div>
                <Label htmlFor="phoneText">Telefon Numarası</Label>
                <Input
                  id="phoneText"
                  value={translation.phoneText || ""}
                  onChange={(e) => handleTranslationChange("phoneText", e.target.value)}
                  placeholder="+90 XXX XXX XX XX"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emailTitle">E-posta Başlığı</Label>
                <Input
                  id="emailTitle"
                  value={translation.emailTitle || ""}
                  onChange={(e) => handleTranslationChange("emailTitle", e.target.value)}
                  placeholder="E-posta"
                />
              </div>
              <div>
                <Label htmlFor="emailText">E-posta Adresi</Label>
                <Input
                  id="emailText"
                  value={translation.emailText || ""}
                  onChange={(e) => handleTranslationChange("emailText", e.target.value)}
                  placeholder="info@celyxmed.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workingHoursTitle">Çalışma Saatleri Başlığı</Label>
                <Input
                  id="workingHoursTitle"
                  value={translation.workingHoursTitle || ""}
                  onChange={(e) => handleTranslationChange("workingHoursTitle", e.target.value)}
                  placeholder="Çalışma Saatleri"
                />
              </div>
              <div>
                <Label htmlFor="workingHoursText">Çalışma Saatleri</Label>
                <Textarea
                  id="workingHoursText"
                  value={translation.workingHoursText || ""}
                  onChange={(e) => handleTranslationChange("workingHoursText", e.target.value)}
                  placeholder="Pazartesi - Cumartesi: 09:00 - 18:00"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Sistem Mesajları Bölümü
  const renderMessagesSettings = () => {
    const translation = contactPage.translations[activeLanguageCode] || getEmptyTranslation();
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sistem Mesajları</CardTitle>
            <CardDescription>
              {activeLanguageCode.toUpperCase()} dilinde sistem mesajlarını düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="successMessage">Başarı Mesajı</Label>
              <Textarea
                id="successMessage"
                value={translation.successMessage || ""}
                onChange={(e) => handleTranslationChange("successMessage", e.target.value)}
                placeholder="Mesajınız başarıyla gönderildi! Size 24 saat içinde geri dönüş yapacağız."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="errorMessage">Hata Mesajı</Label>
              <Textarea
                id="errorMessage"
                value={translation.errorMessage || ""}
                onChange={(e) => handleTranslationChange("errorMessage", e.target.value)}
                placeholder="Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="privacyErrorMessage">Gizlilik Hatası Mesajı</Label>
              <Input
                id="privacyErrorMessage"
                value={translation.privacyErrorMessage || ""}
                onChange={(e) => handleTranslationChange("privacyErrorMessage", e.target.value)}
                placeholder="Gizlilik politikasını kabul etmelisiniz"
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">İletişim Sayfası Yönetimi</h2>
        <p className="text-muted-foreground">İletişim sayfası bölümlerini düzenleyin ve yönetin.</p>
      </div>
    
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{selectedModule?.title || "İletişim Sayfası Yönetimi"}</CardTitle>
              <CardDescription>
                {selectedModule?.description || "Lütfen düzenlemek istediğiniz modülü seçin"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Dil Seçimi */}
            {languages.length > 0 && activeLanguageCode && (
              <Tabs value={activeLanguageCode} onValueChange={setActiveLanguageCode} className="w-full">
                <TabsList className="grid w-full grid-cols-none sm:grid-cols-auto sm:inline-flex">
                  {languages.map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code} className="px-4 py-2 text-sm">
                      {lang.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sol taraf - Modül listesi */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Modüller</CardTitle>
              <CardDescription className="text-sm">
                Düzenlemek istediğiniz bölümü seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {modules.map((module) => {
                const IconComponent = module.icon;
                const isActive = selectedModule?.id === module.id;
                
                return (
                  <div 
                    key={module.id}
                    className={`rounded-lg border border-gray-200 shadow-sm overflow-hidden ${isActive ? 'ring-2 ring-primary' : ''} 
                      hover:border-primary/70 hover:bg-gray-50 cursor-pointer transition-all duration-200`}
                    onClick={() => handleModuleSelect(module)}
                  >
                    <div className="flex items-center p-3">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{module.title}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sağ taraf - İçerik alanı */}
        <div className="md:col-span-3">
          {!selectedModule ? (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center p-6">
                <h3 className="text-lg font-medium mb-2">Modül Düzenleme</h3>
                <p className="text-muted-foreground">Düzenlemek için sol menüden bir modül seçin</p>
              </div>
            </Card>
          ) : (
            renderModuleContent()
          )}
        </div>
      </div>
    </div>
  );
}