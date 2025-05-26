"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Users,
  ListCheck,
  PanelLeft,
  LayoutDashboard,
  Info,
  ScanLine,
  Award,
  Trash,
  MoveUp,
  MoveDown,
  Plus,
  ArrowLeft
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Language } from "@/generated/prisma/client";

// LoadingSkeletons.tsx dosyasından bileşenleri içe aktar
import { MixedLoadingSkeleton, TableLoadingSkeleton, FormLoadingSkeleton, GalleryLoadingSkeleton } from "./components/LoadingSkeletons";

interface AboutPageModule {
  id: string;
  title: string;
  icon: React.ElementType;
  description?: string;
}

const modules: AboutPageModule[] = [
  { id: "general", title: "Genel Ayarlar", icon: LayoutDashboard, description: "Hakkımızda sayfası genel ayarlarını düzenleyin" },
  { id: "hero", title: "Hero Bölümü", icon: PanelLeft, description: "Hakkımızda sayfası hero bölümü içerik ve görsellerini düzenleyin" },
  { id: "jci", title: "JCI Akreditasyon Bölümü", icon: Award, description: "JCI Akreditasyon bölümü içeriğini düzenleyin" },
  { id: "doctors", title: "Doktorlar Bölümü", icon: Users, description: "Doktor bilgilerini ve içeriğini düzenleyin" },
  { id: "gallery", title: "Galeri Yönetimi", icon: ImageIcon, description: "Klinik galeri resimlerini yönetin" },
  { id: "care-items", title: "Kapsamlı Bakım Öğeleri", icon: ListCheck, description: "Kapsamlı bakım bölümü içeriklerini düzenleyin" },
];

export default function AboutPageAdmin() {
  const defaultLocale = "tr"; // Varsayılan dil olarak Türkçe
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [activeLanguageCode, setActiveLanguageCode] = useState<string>(defaultLocale);
  const [selectedModule, setSelectedModule] = useState<AboutPageModule | null>(modules[0] || null);
  const [progress, setProgress] = useState(0); // İlerleme durumu için
  
  // Doctors modülü için state'ler
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isAddDoctorDialogOpen, setIsAddDoctorDialogOpen] = useState(false);
  const [isEditDoctorDialogOpen, setIsEditDoctorDialogOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);
  const [doctorFormData, setDoctorFormData] = useState({
    imageUrl: "",
    translations: {} as Record<string, { name: string; title: string; description: string; profileUrl?: string }>,
  });
  
  // Gallery modülü için state'ler
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [newImage, setNewImage] = useState({
    imageUrl: "",
    altText: "",
  });
  
  // Care Items modülü için state'ler
  const [careItems, setCareItems] = useState<any[]>([]);
  const [isAddCareItemDialogOpen, setIsAddCareItemDialogOpen] = useState(false);
  const [isEditCareItemDialogOpen, setIsEditCareItemDialogOpen] = useState(false);
  const [currentCareItem, setCurrentCareItem] = useState<any>(null);
  const [careItemFormData, setCareItemFormData] = useState({
    translations: {} as Record<string, { title: string; description: string }>,
  });
  
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

  // Modül seçimi
  const handleModuleSelect = (module: AboutPageModule) => {
    setSelectedModule(module);
  };

  // API'den dilleri getir
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/languages");
        
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            const activeLangs = data.filter((lang: any) => lang.isActive);
            setLanguages(activeLangs);
            
            // Varsayılan dil kodunu ayarla
            if (activeLangs.length > 0) {
              const defaultLang = activeLangs.find((lang: any) => lang.isDefault);
              setActiveLanguageCode(defaultLang?.code || activeLangs[0].code);
            }
          }
        } else {
          throw new Error("Diller yüklenemedi!");
        }
      } catch (error) {
        console.error("Diller yüklenirken hata oluştu:", error);
        toast.error("Diller yüklenemedi!");
      } finally {
        setLoading(false);
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
          
          // Doktorları, galeri görsellerini ve bakım öğelerini ayarla
          if (data.doctors && Array.isArray(data.doctors)) {
            setDoctors(data.doctors);
          }
          
          if (data.galleryImages && Array.isArray(data.galleryImages)) {
            setGalleryImages(data.galleryImages);
          }
          
          if (data.careItems && Array.isArray(data.careItems)) {
            setCareItems(data.careItems);
          }
          
          // İlerleme durumunu hesapla
          if (data.translations && data.translations.length > 0) {
            calculateProgress(translationsByLang);
          }
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

  // İlerleme durumunu hesapla (doldurulmuş alanların yüzdesi)
  const calculateProgress = (translationsByLang: any) => {
    if (!activeLanguageCode || !translationsByLang[activeLanguageCode]) {
      setProgress(0);
      return;
    }

    const translation = translationsByLang[activeLanguageCode];
    const totalFields = Object.keys(getEmptyTranslation()).length;
    let filledFields = 0;

    // Dolu alanları say
    Object.keys(translation).forEach(key => {
      if (translation[key] && translation[key].trim() !== "") {
        filledFields++;
      }
    });

    // Görsellerin varlığını kontrol et
    if (aboutPage.heroImageUrl) filledFields++;

    const calculatedProgress = Math.round((filledFields / (totalFields + 1)) * 100);
    setProgress(calculatedProgress);
  };

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
  
  // Doktor işlemleri için fonksiyonlar
  const handleDoctorFormChange = (lang: string, field: string, value: string) => {
    setDoctorFormData(prev => ({
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

  const handleDoctorImageChange = (url: string) => {
    setDoctorFormData(prev => ({
      ...prev,
      imageUrl: url
    }));
  };

  const handleAddDoctor = async () => {
    if (!doctorFormData.imageUrl) {
      toast.error("Lütfen bir doktor fotoğrafı ekleyin!");
      return;
    }

    try {
      setLoading(true);
      
      // Çevirileri diziye dönüştür
      const translationsArray = Object.entries(doctorFormData.translations).map(([langCode, data]) => ({
        languageCode: langCode,
        ...data
      }));
      
      // API isteği oluştur
      const response = await fetch("/api/admin/about-page/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: doctorFormData.imageUrl,
          order: doctors.length,
          translations: translationsArray
        }),
      });

      if (response.ok) {
        const newDoctor = await response.json();
        setDoctors([...doctors, newDoctor]);
        toast.success("Doktor başarıyla eklendi!");
        setIsAddDoctorDialogOpen(false);
        resetDoctorForm();
      } else {
        console.error("Doktor eklenemedi");
        toast.error("Doktor eklenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Doktor eklenirken hata:", error);
      toast.error("Doktor eklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDoctor = async () => {
    if (!currentDoctor) return;
    
    try {
      setLoading(true);
      
      // Çevirileri diziye dönüştür
      const translationsArray = Object.entries(doctorFormData.translations).map(([langCode, data]) => ({
        languageCode: langCode,
        ...data
      }));
      
      // API isteği oluştur
      const response = await fetch(`/api/admin/about-page/doctors/${currentDoctor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: doctorFormData.imageUrl,
          order: currentDoctor.order,
          translations: translationsArray
        }),
      });

      if (response.ok) {
        const updatedDoctor = await response.json();
        setDoctors(doctors.map(doctor => doctor.id === currentDoctor.id ? updatedDoctor : doctor));
        toast.success("Doktor başarıyla güncellendi!");
        setIsEditDoctorDialogOpen(false);
      } else {
        console.error("Doktor güncellenemedi");
        toast.error("Doktor güncellenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Doktor güncellenirken hata:", error);
      toast.error("Doktor güncellenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm("Bu doktoru silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/about-page/doctors/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDoctors(doctors.filter(doctor => doctor.id !== id));
        toast.success("Doktor başarıyla silindi!");
      } else {
        console.error("Doktor silinemedi");
        toast.error("Doktor silinirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Doktor silinirken hata:", error);
      toast.error("Doktor silinirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleReorderDoctor = async (id: string, direction: "up" | "down") => {
    const currentIndex = doctors.findIndex(doctor => doctor.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(doctors.length - 1, currentIndex + 1);

    if (currentIndex === newIndex) return;

    const reorderedDoctors = [...doctors];
    const [movedDoctor] = reorderedDoctors.splice(currentIndex, 1);
    reorderedDoctors.splice(newIndex, 0, movedDoctor);

    // Sıra numaralarını güncelle
    const updatedDoctors = reorderedDoctors.map((doctor, idx) => ({
      ...doctor,
      order: idx,
    }));

    setDoctors(updatedDoctors);

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/about-page/doctors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...movedDoctor,
          order: newIndex,
        }),
      });

      if (!response.ok) {
        console.error("Doktor sırası güncellenemedi");
        toast.error("Doktor sırası güncellenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Doktor sırası güncellenirken hata:", error);
      toast.error("Doktor sırası güncellenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const startEditDoctor = (doctor: any) => {
    setCurrentDoctor(doctor);
    
    // Form verilerini ayarla
    const translations: Record<string, any> = {};
    doctor.translations.forEach((trans: any) => {
      translations[trans.languageCode] = {
        name: trans.name,
        title: trans.title,
        description: trans.description,
        profileUrl: trans.profileUrl
      };
    });
    
    setDoctorFormData({
      imageUrl: doctor.imageUrl,
      translations
    });
    setIsEditDoctorDialogOpen(true);
  };

  const resetDoctorForm = () => {
    setDoctorFormData({
      imageUrl: "",
      translations: {}
    });
    setCurrentDoctor(null);
  };
  
  // Galeri işlemleri için fonksiyonlar
  const handleAddImage = async () => {
    if (!newImage.imageUrl) {
      toast.error("Lütfen bir resim yükleyin!");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/about-page/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newImage,
          order: galleryImages.length,
        }),
      });

      if (response.ok) {
        const addedImage = await response.json();
        setGalleryImages([...galleryImages, addedImage]);
        setNewImage({
          imageUrl: "",
          altText: "",
        });
        toast.success("Resim başarıyla eklendi!");
      } else {
        console.error("Resim eklenemedi");
        toast.error("Resim eklenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Resim eklenirken hata:", error);
      toast.error("Resim eklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Bu resmi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/about-page/gallery/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setGalleryImages(galleryImages.filter(img => img.id !== id));
        toast.success("Resim başarıyla silindi!");
      } else {
        console.error("Resim silinemedi");
        toast.error("Resim silinirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Resim silinirken hata:", error);
      toast.error("Resim silinirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleReorderImage = async (id: string, direction: "up" | "down") => {
    const currentIndex = galleryImages.findIndex(img => img.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(galleryImages.length - 1, currentIndex + 1);

    if (currentIndex === newIndex) return;

    const reorderedImages = [...galleryImages];
    const [movedImage] = reorderedImages.splice(currentIndex, 1);
    reorderedImages.splice(newIndex, 0, movedImage);

    // Sıra numaralarını güncelle
    const updatedImages = reorderedImages.map((img, idx) => ({
      ...img,
      order: idx,
    }));

    setGalleryImages(updatedImages);

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/about-page/gallery/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...movedImage,
          order: newIndex,
        }),
      });

      if (!response.ok) {
        console.error("Resim sırası güncellenemedi");
        toast.error("Resim sırası güncellenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Resim sırası güncellenirken hata:", error);
      toast.error("Resim sırası güncellenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };
  
  // Bakım Öğeleri işlemleri için fonksiyonlar
  const handleCareItemFormChange = (lang: string, field: string, value: string) => {
    setCareItemFormData(prev => ({
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

  const handleAddCareItem = async () => {
    try {
      setLoading(true);
      
      // Çevirileri diziye dönüştür
      const translationsArray = Object.entries(careItemFormData.translations).map(([langCode, data]) => ({
        languageCode: langCode,
        ...data
      }));
      
      // API isteği oluştur
      const response = await fetch("/api/admin/about-page/care-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: careItems.length,
          translations: translationsArray
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setCareItems([...careItems, newItem]);
        toast.success("Bakım öğesi başarıyla eklendi!");
        setIsAddCareItemDialogOpen(false);
        resetCareItemForm();
      } else {
        console.error("Bakım öğesi eklenemedi");
        toast.error("Bakım öğesi eklenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Bakım öğesi eklenirken hata:", error);
      toast.error("Bakım öğesi eklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCareItem = async () => {
    if (!currentCareItem) return;
    
    try {
      setLoading(true);
      
      // Çevirileri diziye dönüştür
      const translationsArray = Object.entries(careItemFormData.translations).map(([langCode, data]) => ({
        languageCode: langCode,
        ...data
      }));
      
      // API isteği oluştur
      const response = await fetch(`/api/admin/about-page/care-items/${currentCareItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: currentCareItem.order,
          translations: translationsArray
        }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setCareItems(careItems.map(item => item.id === currentCareItem.id ? updatedItem : item));
        toast.success("Bakım öğesi başarıyla güncellendi!");
        setIsEditCareItemDialogOpen(false);
      } else {
        console.error("Bakım öğesi güncellenemedi");
        toast.error("Bakım öğesi güncellenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Bakım öğesi güncellenirken hata:", error);
      toast.error("Bakım öğesi güncellenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCareItem = async (id: string) => {
    if (!confirm("Bu bakım öğesini silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/about-page/care-items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCareItems(careItems.filter(item => item.id !== id));
        toast.success("Bakım öğesi başarıyla silindi!");
      } else {
        console.error("Bakım öğesi silinemedi");
        toast.error("Bakım öğesi silinirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Bakım öğesi silinirken hata:", error);
      toast.error("Bakım öğesi silinirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleReorderCareItem = async (id: string, direction: "up" | "down") => {
    const currentIndex = careItems.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(careItems.length - 1, currentIndex + 1);

    if (currentIndex === newIndex) return;

    const reorderedItems = [...careItems];
    const [movedItem] = reorderedItems.splice(currentIndex, 1);
    reorderedItems.splice(newIndex, 0, movedItem);

    // Sıra numaralarını güncelle
    const updatedItems = reorderedItems.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    setCareItems(updatedItems);

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/about-page/care-items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...movedItem,
          order: newIndex,
        }),
      });

      if (!response.ok) {
        console.error("Bakım öğesi sırası güncellenemedi");
        toast.error("Bakım öğesi sırası güncellenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Bakım öğesi sırası güncellenirken hata:", error);
      toast.error("Bakım öğesi sırası güncellenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const startEditCareItem = (item: any) => {
    setCurrentCareItem(item);
    
    // Form verilerini ayarla
    const translations: Record<string, any> = {};
    item.translations.forEach((trans: any) => {
      translations[trans.languageCode] = {
        title: trans.title,
        description: trans.description
      };
    });
    
    setCareItemFormData({ translations });
    setIsEditCareItemDialogOpen(true);
  };

  const resetCareItemForm = () => {
    setCareItemFormData({ translations: {} });
    setCurrentCareItem(null);
  };
  
  // Modül içeriğini render et
  const renderModuleContent = () => {
    if (loading) return <MixedLoadingSkeleton title="Veriler yükleniyor..." />;
    if (languages.length === 0) return (
      <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <h3 className="font-medium">Aktif dil bulunamadı</h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">Lütfen yönetim panelinden en az bir dili aktif hale getirin.</p>
      </div>
    );
    
    if (!selectedModule) return <MixedLoadingSkeleton title="Lütfen bir modül seçin" />;

    // Her modüle özel içerik
    switch(selectedModule.id) {
      case 'general':
        return renderGeneralSettings();
      case 'hero':
        return renderHeroSection();
      case 'jci':
        return renderJciSection();
      case 'doctors':
        return renderDoctorsSection();
      case 'gallery':
        return renderGallerySection();
      case 'care-items':
        return renderCareItemsSection();
      default:
        return (
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold mb-2">Modül bulunamadı</h3>
            <p className="text-muted-foreground mb-4">Seçilen modül için içerik bulunamadı.</p>
          </div>
        );
    }
  };

  // Genel Ayarlar
  const renderGeneralSettings = () => {
    const translation = aboutPage.translations[activeLanguageCode] || getEmptyTranslation();
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Genel Ayarlar</CardTitle>
            <CardDescription>
              Hakkımızda sayfası için genel ayarlar ve bilgiler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Doktor Bölümü Metinleri</CardTitle>
                  <CardDescription>
                    Doktorlar bölümü başlığı ve açıklaması
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`doctorsTitle-${activeLanguageCode}`}>Başlık</Label>
                    <Input
                      id={`doctorsTitle-${activeLanguageCode}`}
                      value={translation.doctorsTitle || ""}
                      onChange={(e) => handleTranslationChange(activeLanguageCode, "doctorsTitle", e.target.value)}
                      placeholder="Uzman Doktorlarımız, Güvenilir Bakım Ekibiniz"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`doctorsDescription-${activeLanguageCode}`}>Açıklama</Label>
                    <Textarea
                      id={`doctorsDescription-${activeLanguageCode}`}
                      value={translation.doctorsDescription || ""}
                      onChange={(e) => handleTranslationChange(activeLanguageCode, "doctorsDescription", e.target.value)}
                      placeholder="Celyxmed'de doktorlarımız uzmanlardan daha fazlasıdır..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Hero Bölümü
  const renderHeroSection = () => {
    const translation = aboutPage.translations[activeLanguageCode] || getEmptyTranslation();
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hero Bölümü</CardTitle>
            <CardDescription>
              Hakkımızda sayfası hero bölümü ayarları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hero Görseli</h3>
                  <ImageUpload
                    endpoint="aboutPageHero"
                    value={aboutPage.heroImageUrl}
                    onChange={handleHeroImageChange}
                  />
                </div>
              </div>
              
              <div className="col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`heroTitle-${activeLanguageCode}`}>Başlık</Label>
                  <Input
                    id={`heroTitle-${activeLanguageCode}`}
                    value={translation.heroTitle || ""}
                    onChange={(e) => handleTranslationChange(activeLanguageCode, "heroTitle", e.target.value)}
                    placeholder="Sağlık ve Güzellik Alanında Güvenilir Ortağınız"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`heroDescription-${activeLanguageCode}`}>Açıklama</Label>
                  <Textarea
                    id={`heroDescription-${activeLanguageCode}`}
                    value={translation.heroDescription || ""}
                    onChange={(e) => handleTranslationChange(activeLanguageCode, "heroDescription", e.target.value)}
                    placeholder="Celyxmed, hasta öncelikli bir yaklaşımla kişiselleştirilmiş sağlık çözümleri sunmaya kendini adamıştır..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`heroPrimaryButtonText-${activeLanguageCode}`}>Ana Buton Metni</Label>
                    <Input
                      id={`heroPrimaryButtonText-${activeLanguageCode}`}
                      value={translation.heroPrimaryButtonText || ""}
                      onChange={(e) => handleTranslationChange(activeLanguageCode, "heroPrimaryButtonText", e.target.value)}
                      placeholder="Kliniğimizi Keşfedin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`heroPrimaryButtonLink-${activeLanguageCode}`}>Ana Buton Bağlantısı</Label>
                    <Input
                      id={`heroPrimaryButtonLink-${activeLanguageCode}`}
                      value={translation.heroPrimaryButtonLink || ""}
                      onChange={(e) => handleTranslationChange(activeLanguageCode, "heroPrimaryButtonLink", e.target.value)}
                      placeholder="#klinik"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`heroSecondaryButtonText-${activeLanguageCode}`}>İkincil Buton Metni</Label>
                    <Input
                      id={`heroSecondaryButtonText-${activeLanguageCode}`}
                      value={translation.heroSecondaryButtonText || ""}
                      onChange={(e) => handleTranslationChange(activeLanguageCode, "heroSecondaryButtonText", e.target.value)}
                      placeholder="Doktorlarımızla Tanışın"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`heroSecondaryButtonLink-${activeLanguageCode}`}>İkincil Buton Bağlantısı</Label>
                    <Input
                      id={`heroSecondaryButtonLink-${activeLanguageCode}`}
                      value={translation.heroSecondaryButtonLink || ""}
                      onChange={(e) => handleTranslationChange(activeLanguageCode, "heroSecondaryButtonLink", e.target.value)}
                      placeholder="#doktorlar"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // JCI Bölümü
  const renderJciSection = () => {
    const translation = aboutPage.translations[activeLanguageCode] || getEmptyTranslation();
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>JCI Akreditasyon Bölümü</CardTitle>
            <CardDescription>
              JCI akreditasyon bölümü içerik ve ayarları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`jciTitle-${activeLanguageCode}`}>Başlık</Label>
                <Textarea
                  id={`jciTitle-${activeLanguageCode}`}
                  value={translation.jciTitle || ""}
                  onChange={(e) => handleTranslationChange(activeLanguageCode, "jciTitle", e.target.value)}
                  placeholder="Celyxmed ile dünya standartlarında sağlık hizmetini deneyimleyin..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`jciPrimaryButtonText-${activeLanguageCode}`}>Ana Buton Metni</Label>
                  <Input
                    id={`jciPrimaryButtonText-${activeLanguageCode}`}
                    value={translation.jciPrimaryButtonText || ""}
                    onChange={(e) => handleTranslationChange(activeLanguageCode, "jciPrimaryButtonText", e.target.value)}
                    placeholder="Kliniğimizi Keşfedin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`jciPrimaryButtonLink-${activeLanguageCode}`}>Ana Buton Bağlantısı</Label>
                  <Input
                    id={`jciPrimaryButtonLink-${activeLanguageCode}`}
                    value={translation.jciPrimaryButtonLink || ""}
                    onChange={(e) => handleTranslationChange(activeLanguageCode, "jciPrimaryButtonLink", e.target.value)}
                    placeholder="#klinik"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`jciSecondaryButtonText-${activeLanguageCode}`}>İkincil Buton Metni</Label>
                  <Input
                    id={`jciSecondaryButtonText-${activeLanguageCode}`}
                    value={translation.jciSecondaryButtonText || ""}
                    onChange={(e) => handleTranslationChange(activeLanguageCode, "jciSecondaryButtonText", e.target.value)}
                    placeholder="Doktorlarımızla Tanışın"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`jciSecondaryButtonLink-${activeLanguageCode}`}>İkincil Buton Bağlantısı</Label>
                  <Input
                    id={`jciSecondaryButtonLink-${activeLanguageCode}`}
                    value={translation.jciSecondaryButtonLink || ""}
                    onChange={(e) => handleTranslationChange(activeLanguageCode, "jciSecondaryButtonLink", e.target.value)}
                    placeholder="#doktorlar"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Doktorlar Bölümü
  const renderDoctorsSection = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Doktorlar Yönetimi</CardTitle>
            <CardDescription>
              Hakkımızda sayfasındaki doktorları yönetin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div></div>
              <Button 
                onClick={() => {
                  resetDoctorForm();
                  setIsAddDoctorDialogOpen(true);
                }}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Yeni Doktor Ekle
              </Button>
            </div>
            
            {doctors.length === 0 ? (
              <div className="text-center p-4 border rounded-md">
                <p className="text-muted-foreground">Henüz doktor yok. Yeni bir doktor ekleyin.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fotoğraf</TableHead>
                    <TableHead>Ad</TableHead>
                    <TableHead>Unvan</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Sıra</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors
                    .sort((a, b) => a.order - b.order)
                    .map((doctor) => {
                      // Aktif dildeki çeviriyi bul
                      const translation = doctor.translations?.find(
                        (trans: any) => trans.languageCode === activeLanguageCode
                      );
                      
                      return (
                        <TableRow key={doctor.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img
                                src={doctor.imageUrl}
                                alt={translation?.name || "Doktor"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {translation?.name || "-"}
                          </TableCell>
                          <TableCell>
                            {translation?.title || "-"}
                          </TableCell>
                          <TableCell>
                            {translation?.description 
                              ? translation.description.substring(0, 30) + (translation.description.length > 30 ? "..." : "") 
                              : "-"}
                          </TableCell>
                          <TableCell>{doctor.order + 1}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReorderDoctor(doctor.id, "up")}
                                disabled={doctor.order === 0}
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReorderDoctor(doctor.id, "down")}
                                disabled={doctor.order === doctors.length - 1}
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditDoctor(doctor)}
                              >
                                Düzenle
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDoctor(doctor.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Yeni Doktor Ekleme Dialog */}
        <Dialog open={isAddDoctorDialogOpen} onOpenChange={setIsAddDoctorDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Yeni Doktor Ekle</DialogTitle>
              <DialogDescription>
                Hakkımızda sayfası için yeni bir doktor ekleyin. Tüm dillerde içerik eklemek zorunda değilsiniz.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Doktor Fotoğrafı</Label>
                <ImageUpload
                  folder="doctor_avatars"
                  value={doctorFormData.imageUrl}
                  onChange={handleDoctorImageChange}
                  showPreview={true}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {(() => {
                const langData = doctorFormData.translations[activeLanguageCode] || { name: "", title: "", description: "", profileUrl: "" };
                
                return (
                  <>
                    <div className="flex items-center justify-start space-x-2 mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Şu anda düzenlenen dil:</p>
                      <Badge variant="outline" className="text-sm font-medium">
                        {languages.find(lang => lang.code === activeLanguageCode)?.name || activeLanguageCode}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`name-${activeLanguageCode}`}>Ad Soyad</Label>
                      <Input
                        id={`name-${activeLanguageCode}`}
                        value={langData.name}
                        onChange={(e) => handleDoctorFormChange(activeLanguageCode, "name", e.target.value)}
                        placeholder="Dr. Ahmet Yılmaz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`title-${activeLanguageCode}`}>Unvan/Uzmanlık</Label>
                      <Input
                        id={`title-${activeLanguageCode}`}
                        value={langData.title}
                        onChange={(e) => handleDoctorFormChange(activeLanguageCode, "title", e.target.value)}
                        placeholder="Plastik, Rekonstrüktif ve Estetik Cerrahi Uzmanı"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${activeLanguageCode}`}>Kısa Tanıtım</Label>
                      <Textarea
                        id={`description-${activeLanguageCode}`}
                        value={langData.description}
                        onChange={(e) => handleDoctorFormChange(activeLanguageCode, "description", e.target.value)}
                        placeholder="20 yılı aşkın deneyimiyle..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`profileUrl-${activeLanguageCode}`}>Profil Sayfası URL (Opsiyonel)</Label>
                      <Input
                        id={`profileUrl-${activeLanguageCode}`}
                        value={langData.profileUrl || ""}
                        onChange={(e) => handleDoctorFormChange(activeLanguageCode, "profileUrl", e.target.value)}
                        placeholder="/doktorlarimiz/ahmet-yilmaz"
                      />
                    </div>
                  </>
                );
              })()}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDoctorDialogOpen(false);
                  resetDoctorForm();
                }}
              >
                İptal
              </Button>
              <Button 
                onClick={handleAddDoctor}
                disabled={loading || !doctorFormData.imageUrl}
              >
                {loading ? "Ekleniyor..." : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Doktor Düzenleme Dialog */}
        <Dialog open={isEditDoctorDialogOpen} onOpenChange={setIsEditDoctorDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Doktoru Düzenle</DialogTitle>
              <DialogDescription>
                Seçilen doktoru düzenleyin. Tüm dillerde içerik eklemek zorunda değilsiniz.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="edit-imageUrl">Doktor Fotoğrafı</Label>
                <ImageUpload
                  folder="doctor_avatars"
                  value={doctorFormData.imageUrl}
                  onChange={handleDoctorImageChange}
                  showPreview={true}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {(() => {
                const langData = doctorFormData.translations[activeLanguageCode] || { name: "", title: "", description: "", profileUrl: "" };
                
                return (
                  <>
                    <div className="flex items-center justify-start space-x-2 mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Şu anda düzenlenen dil:</p>
                      <Badge variant="outline" className="text-sm font-medium">
                        {languages.find(lang => lang.code === activeLanguageCode)?.name || activeLanguageCode}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name-${activeLanguageCode}`}>Ad Soyad</Label>
                      <Input
                        id={`edit-name-${activeLanguageCode}`}
                        value={langData.name}
                        onChange={(e) => handleDoctorFormChange(activeLanguageCode, "name", e.target.value)}
                        placeholder="Dr. Ahmet Yılmaz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-title-${activeLanguageCode}`}>Unvan/Uzmanlık</Label>
                      <Input
                        id={`edit-title-${activeLanguageCode}`}
                        value={langData.title}
                        onChange={(e) => handleDoctorFormChange(activeLanguageCode, "title", e.target.value)}
                        placeholder="Plastik, Rekonstrüktif ve Estetik Cerrahi Uzmanı"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-description-${activeLanguageCode}`}>Kısa Tanıtım</Label>
                      <Textarea
                        id={`edit-description-${activeLanguageCode}`}
                        value={langData.description}
                        onChange={(e) => handleDoctorFormChange(activeLanguageCode, "description", e.target.value)}
                        placeholder="20 yılı aşkın deneyimiyle..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-profileUrl-${activeLanguageCode}`}>Profil Sayfası URL (Opsiyonel)</Label>
                      <Input
                        id={`edit-profileUrl-${activeLanguageCode}`}
                        value={langData.profileUrl || ""}
                        onChange={(e) => handleDoctorFormChange(activeLanguageCode, "profileUrl", e.target.value)}
                        placeholder="/doktorlarimiz/ahmet-yilmaz"
                      />
                    </div>
                  </>
                );
              })()}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDoctorDialogOpen(false);
                  resetDoctorForm();
                }}
              >
                İptal
              </Button>
              <Button 
                onClick={handleUpdateDoctor}
                disabled={loading || !doctorFormData.imageUrl}
              >
                {loading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  
  // Galeri Bölümü
  const renderGallerySection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Resim Ekle</CardTitle>
              <CardDescription>
                Galeriye yeni bir resim eklemek için aşağıdaki formu doldurun.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Resim</Label>
                <ImageUpload
                  folder="clinic_showcase"
                  value={newImage.imageUrl}
                  onChange={(url) => setNewImage({ ...newImage, imageUrl: url })}
                  showPreview={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altText">Alternatif Metin (SEO için)</Label>
                <Input
                  id="altText"
                  value={newImage.altText}
                  onChange={(e) => setNewImage({ ...newImage, altText: e.target.value })}
                  placeholder="Celyxmed Klinik İç Görünüm"
                />
              </div>
              <Button
                onClick={handleAddImage}
                disabled={loading || !newImage.imageUrl}
                className="w-full"
              >
                {loading ? "Ekleniyor..." : "Resim Ekle"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mevcut Resimler</CardTitle>
              <CardDescription>
                Mevcut galeri resimlerini görüntüleyin ve düzenleyin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {galleryImages.length === 0 ? (
                <div className="text-center p-4 border rounded-md">
                  <p className="text-muted-foreground">Henüz galeri resmi yok. Yeni bir resim ekleyin.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resim</TableHead>
                      <TableHead>Alt Metin</TableHead>
                      <TableHead>Sıra</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {galleryImages
                      .sort((a, b) => a.order - b.order)
                      .map((image) => (
                        <TableRow key={image.id}>
                          <TableCell>
                            <div className="w-20 h-12 rounded-md overflow-hidden">
                              <img
                                src={image.imageUrl}
                                alt={image.altText || "Galeri Resmi"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell>{image.altText || "-"}</TableCell>
                          <TableCell>{image.order + 1}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReorderImage(image.id, "up")}
                                disabled={image.order === 0}
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReorderImage(image.id, "down")}
                                disabled={image.order === galleryImages.length - 1}
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteImage(image.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Bakım Öğeleri Bölümü
  const renderCareItemsSection = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Kapsamlı Bakım Öğeleri</CardTitle>
            <CardDescription>
              Hakkımızda sayfasındaki kapsamlı bakım bölümü öğelerini yönetin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div></div>
              <Button 
                onClick={() => {
                  resetCareItemForm();
                  setIsAddCareItemDialogOpen(true);
                }}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Yeni Öğe Ekle
              </Button>
            </div>
            
            {careItems.length === 0 ? (
              <div className="text-center p-4 border rounded-md">
                <p className="text-muted-foreground">Henüz kapsamlı bakım öğesi yok. Yeni bir öğe ekleyin.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Sıra</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {careItems
                    .sort((a, b) => a.order - b.order)
                    .map((item) => {
                      // Aktif dildeki çeviriyi bul
                      const translation = item.translations?.find(
                        (trans: any) => trans.languageCode === activeLanguageCode
                      );
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {translation?.title || "-"}
                          </TableCell>
                          <TableCell>
                            {translation?.description 
                              ? translation.description.substring(0, 50) + (translation.description.length > 50 ? "..." : "") 
                              : "-"}
                          </TableCell>
                          <TableCell>{item.order + 1}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReorderCareItem(item.id, "up")}
                                disabled={item.order === 0}
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReorderCareItem(item.id, "down")}
                                disabled={item.order === careItems.length - 1}
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditCareItem(item)}
                              >
                                Düzenle
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCareItem(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Yeni Öğe Ekleme Dialog */}
        <Dialog open={isAddCareItemDialogOpen} onOpenChange={setIsAddCareItemDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Yeni Kapsamlı Bakım Öğesi Ekle</DialogTitle>
              <DialogDescription>
                Hakkımızda sayfası için yeni bir kapsamlı bakım öğesi ekleyin. Tüm dillerde içerik eklemek zorunda değilsiniz.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {(() => {
                const langData = careItemFormData.translations[activeLanguageCode] || { title: "", description: "" };
                
                return (
                  <>
                    <div className="flex items-center justify-start space-x-2 mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Şu anda düzenlenen dil:</p>
                      <Badge variant="outline" className="text-sm font-medium">
                        {languages.find(lang => lang.code === activeLanguageCode)?.name || activeLanguageCode}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`title-${activeLanguageCode}`}>Başlık</Label>
                      <Input
                        id={`title-${activeLanguageCode}`}
                        value={langData.title}
                        onChange={(e) => handleCareItemFormChange(activeLanguageCode, "title", e.target.value)}
                        placeholder="Varıştan İyileşmeye Kadar Kapsamlı Bakım"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${activeLanguageCode}`}>Açıklama</Label>
                      <Textarea
                        id={`description-${activeLanguageCode}`}
                        value={langData.description}
                        onChange={(e) => handleCareItemFormChange(activeLanguageCode, "description", e.target.value)}
                        placeholder="İlk konsültasyonunuzdan tedavi sonrası iyileşme sürecine kadar her adımda yanınızdayız..."
                        rows={4}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddCareItemDialogOpen(false);
                  resetCareItemForm();
                }}
              >
                İptal
              </Button>
              <Button 
                onClick={handleAddCareItem}
                disabled={loading}
              >
                {loading ? "Ekleniyor..." : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Öğe Düzenleme Dialog */}
        <Dialog open={isEditCareItemDialogOpen} onOpenChange={setIsEditCareItemDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Kapsamlı Bakım Öğesini Düzenle</DialogTitle>
              <DialogDescription>
                Seçilen kapsamlı bakım öğesini düzenleyin. Tüm dillerde içerik eklemek zorunda değilsiniz.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {(() => {
                const langData = careItemFormData.translations[activeLanguageCode] || { title: "", description: "" };
                
                return (
                  <>
                    <div className="flex items-center justify-start space-x-2 mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Şu anda düzenlenen dil:</p>
                      <Badge variant="outline" className="text-sm font-medium">
                        {languages.find(lang => lang.code === activeLanguageCode)?.name || activeLanguageCode}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`edit-title-${activeLanguageCode}`}>Başlık</Label>
                      <Input
                        id={`edit-title-${activeLanguageCode}`}
                        value={langData.title}
                        onChange={(e) => handleCareItemFormChange(activeLanguageCode, "title", e.target.value)}
                        placeholder="Varıştan İyileşmeye Kadar Kapsamlı Bakım"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-description-${activeLanguageCode}`}>Açıklama</Label>
                      <Textarea
                        id={`edit-description-${activeLanguageCode}`}
                        value={langData.description}
                        onChange={(e) => handleCareItemFormChange(activeLanguageCode, "description", e.target.value)}
                        placeholder="İlk konsültasyonunuzdan tedavi sonrası iyileşme sürecine kadar her adımda yanınızdayız..."
                        rows={4}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditCareItemDialogOpen(false);
                  resetCareItemForm();
                }}
              >
                İptal
              </Button>
              <Button 
                onClick={handleUpdateCareItem}
                disabled={loading}
              >
                {loading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hakkımızda Sayfası Yönetimi</h2>
        <p className="text-muted-foreground">Hakkımızda sayfası bölümlerini düzenleyin ve yönetin.</p>
      </div>
    
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{selectedModule?.title || "Hakkımızda Sayfası Yönetimi"}</CardTitle>
              <CardDescription>
                {selectedModule?.description || "Lütfen düzenlemek istediğiniz modülü seçin"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* İlerleme çubuğu */}
            <div className="flex items-center">
              <Progress value={progress} className="w-full" />
              <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">
                %{progress}
              </span>
            </div>
            
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
                Düzenlemek için modül seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
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