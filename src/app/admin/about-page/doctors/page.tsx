"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash, ArrowLeft, MoveUp, MoveDown, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/image-upload";

export default function AboutPageDoctorsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("tr");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    translations: {} as Record<string, { name: string; title: string; description: string; profileUrl?: string }>,
  });

  // Dilleri ve doktorları getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Dilleri getir
        const langResponse = await fetch("/api/languages");
        if (langResponse.ok) {
          const langData = await langResponse.json();
          setLanguages(langData);
          
          // Varsayılan olarak ilk aktif dili seç
          const firstActiveLanguage = langData.find((lang: any) => lang.isActive)?.code || "tr";
          setActiveTab(firstActiveLanguage);
        }
        
        // Doktorları getir
        const doctorsResponse = await fetch("/api/admin/about-page");
        if (doctorsResponse.ok) {
          const data = await doctorsResponse.json();
          if (data.doctors && Array.isArray(data.doctors)) {
            setDoctors(data.doctors);
          }
        }
      } catch (error) {
        console.error("Veriler yüklenirken hata:", error);
        toast.error("Veriler yüklenemedi!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Form verilerini değiştir
  const handleFormChange = (lang: string, field: string, value: string) => {
    setFormData(prev => ({
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

  // Görsel URL'sini değiştir
  const handleImageChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }));
  };

  // Yeni doktor ekle
  const handleAddDoctor = async () => {
    if (!formData.imageUrl) {
      toast.error("Lütfen bir doktor fotoğrafı ekleyin!");
      return;
    }

    try {
      setLoading(true);
      
      // Çevirileri diziye dönüştür
      const translationsArray = Object.entries(formData.translations).map(([langCode, data]) => ({
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
          imageUrl: formData.imageUrl,
          order: doctors.length,
          translations: translationsArray
        }),
      });

      if (response.ok) {
        const newDoctor = await response.json();
        setDoctors([...doctors, newDoctor]);
        toast.success("Doktor başarıyla eklendi!");
        setIsAddDialogOpen(false);
        resetForm();
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

  // Doktor güncelle
  const handleUpdateDoctor = async () => {
    if (!currentDoctor) return;
    
    try {
      setLoading(true);
      
      // Çevirileri diziye dönüştür
      const translationsArray = Object.entries(formData.translations).map(([langCode, data]) => ({
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
          imageUrl: formData.imageUrl,
          order: currentDoctor.order,
          translations: translationsArray
        }),
      });

      if (response.ok) {
        const updatedDoctor = await response.json();
        setDoctors(doctors.map(doctor => doctor.id === currentDoctor.id ? updatedDoctor : doctor));
        toast.success("Doktor başarıyla güncellendi!");
        setIsEditDialogOpen(false);
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

  // Doktor sil
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

  // Sıralama değiştir
  const handleReorder = async (id: string, direction: "up" | "down") => {
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

  // Düzenleme formunu başlat
  const startEdit = (doctor: any) => {
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
    
    setFormData({
      imageUrl: doctor.imageUrl,
      translations
    });
    setIsEditDialogOpen(true);
  };

  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      imageUrl: "",
      translations: {}
    });
    setCurrentDoctor(null);
  };

  return (
    <div className="flex-1 space-y-4 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost"
            onClick={() => router.push("/admin/about-page")}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Geri
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Doktorlar</h2>
            <p className="text-sm text-muted-foreground">
              Hakkımızda sayfasındaki doktorları yönetin.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Yeni Doktor Ekle
        </Button>
      </div>
      
      <Separator className="my-6" />
      
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Doktorlar</CardTitle>
          <CardDescription>
            Mevcut doktorları görüntüleyin ve düzenleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      (trans: any) => trans.languageCode === activeTab
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
                              onClick={() => handleReorder(doctor.id, "up")}
                              disabled={doctor.order === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReorder(doctor.id, "down")}
                              disabled={doctor.order === doctors.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(doctor)}
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

      {/* Görüntüleme Dili Seçimi */}
      <div className="mt-4 flex justify-end">
        <div className="space-y-1">
          <Label>Görüntüleme Dili</Label>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {languages
                .filter(lang => lang.isActive)
                .map((lang) => (
                  <TabsTrigger key={lang.code} value={lang.code}>
                    {lang.name}
                  </TabsTrigger>
                ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Yeni Doktor Ekleme Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                endpoint="aboutPageDoctor"
                value={formData.imageUrl}
                onChange={handleImageChange}
              />
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="w-full flex justify-start overflow-x-auto">
              {languages
                .filter(lang => lang.isActive)
                .map((lang) => (
                  <TabsTrigger 
                    key={lang.code} 
                    value={lang.code}
                    className="min-w-20"
                  >
                    {lang.name}
                  </TabsTrigger>
                ))}
            </TabsList>
            
            {languages
              .filter(lang => lang.isActive)
              .map((lang) => {
                const langData = formData.translations[lang.code] || { name: "", title: "", description: "", profileUrl: "" };
                
                return (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${lang.code}`}>Ad Soyad</Label>
                      <Input
                        id={`name-${lang.code}`}
                        value={langData.name}
                        onChange={(e) => handleFormChange(lang.code, "name", e.target.value)}
                        placeholder="Dr. Ahmet Yılmaz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`title-${lang.code}`}>Unvan/Uzmanlık</Label>
                      <Input
                        id={`title-${lang.code}`}
                        value={langData.title}
                        onChange={(e) => handleFormChange(lang.code, "title", e.target.value)}
                        placeholder="Plastik, Rekonstrüktif ve Estetik Cerrahi Uzmanı"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${lang.code}`}>Kısa Tanıtım</Label>
                      <Textarea
                        id={`description-${lang.code}`}
                        value={langData.description}
                        onChange={(e) => handleFormChange(lang.code, "description", e.target.value)}
                        placeholder="20 yılı aşkın deneyimiyle..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`profileUrl-${lang.code}`}>Profil Sayfası URL (Opsiyonel)</Label>
                      <Input
                        id={`profileUrl-${lang.code}`}
                        value={langData.profileUrl || ""}
                        onChange={(e) => handleFormChange(lang.code, "profileUrl", e.target.value)}
                        placeholder="/doktorlarimiz/ahmet-yilmaz"
                      />
                    </div>
                  </TabsContent>
                );
              })}
          </Tabs>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              İptal
            </Button>
            <Button 
              onClick={handleAddDoctor}
              disabled={loading || !formData.imageUrl}
            >
              {loading ? "Ekleniyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Doktor Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                endpoint="aboutPageDoctor"
                value={formData.imageUrl}
                onChange={handleImageChange}
              />
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="w-full flex justify-start overflow-x-auto">
              {languages
                .filter(lang => lang.isActive)
                .map((lang) => (
                  <TabsTrigger 
                    key={lang.code} 
                    value={lang.code}
                    className="min-w-20"
                  >
                    {lang.name}
                  </TabsTrigger>
                ))}
            </TabsList>
            
            {languages
              .filter(lang => lang.isActive)
              .map((lang) => {
                const langData = formData.translations[lang.code] || { name: "", title: "", description: "", profileUrl: "" };
                
                return (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name-${lang.code}`}>Ad Soyad</Label>
                      <Input
                        id={`edit-name-${lang.code}`}
                        value={langData.name}
                        onChange={(e) => handleFormChange(lang.code, "name", e.target.value)}
                        placeholder="Dr. Ahmet Yılmaz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-title-${lang.code}`}>Unvan/Uzmanlık</Label>
                      <Input
                        id={`edit-title-${lang.code}`}
                        value={langData.title}
                        onChange={(e) => handleFormChange(lang.code, "title", e.target.value)}
                        placeholder="Plastik, Rekonstrüktif ve Estetik Cerrahi Uzmanı"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-description-${lang.code}`}>Kısa Tanıtım</Label>
                      <Textarea
                        id={`edit-description-${lang.code}`}
                        value={langData.description}
                        onChange={(e) => handleFormChange(lang.code, "description", e.target.value)}
                        placeholder="20 yılı aşkın deneyimiyle..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-profileUrl-${lang.code}`}>Profil Sayfası URL (Opsiyonel)</Label>
                      <Input
                        id={`edit-profileUrl-${lang.code}`}
                        value={langData.profileUrl || ""}
                        onChange={(e) => handleFormChange(lang.code, "profileUrl", e.target.value)}
                        placeholder="/doktorlarimiz/ahmet-yilmaz"
                      />
                    </div>
                  </TabsContent>
                );
              })}
          </Tabs>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              İptal
            </Button>
            <Button 
              onClick={handleUpdateDoctor}
              disabled={loading || !formData.imageUrl}
            >
              {loading ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}