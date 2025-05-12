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
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AboutPageCareItemsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [careItems, setCareItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("tr");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    translations: {} as Record<string, { title: string; description: string }>,
  });

  // Dilleri ve bakım öğelerini getir
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
        
        // Bakım öğelerini getir
        const careItemsResponse = await fetch("/api/admin/about-page");
        if (careItemsResponse.ok) {
          const data = await careItemsResponse.json();
          if (data.careItems && Array.isArray(data.careItems)) {
            setCareItems(data.careItems);
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

  // Yeni bakım öğesi ekle
  const handleAddCareItem = async () => {
    try {
      setLoading(true);
      
      // Çevirileri diziye dönüştür
      const translationsArray = Object.entries(formData.translations).map(([langCode, data]) => ({
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
        setIsAddDialogOpen(false);
        resetForm();
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

  // Bakım öğesi güncelle
  const handleUpdateCareItem = async () => {
    if (!currentItem) return;
    
    try {
      setLoading(true);
      
      // Çevirileri diziye dönüştür
      const translationsArray = Object.entries(formData.translations).map(([langCode, data]) => ({
        languageCode: langCode,
        ...data
      }));
      
      // API isteği oluştur
      const response = await fetch(`/api/admin/about-page/care-items/${currentItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: currentItem.order,
          translations: translationsArray
        }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setCareItems(careItems.map(item => item.id === currentItem.id ? updatedItem : item));
        toast.success("Bakım öğesi başarıyla güncellendi!");
        setIsEditDialogOpen(false);
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

  // Bakım öğesi sil
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

  // Sıralama değiştir
  const handleReorder = async (id: string, direction: "up" | "down") => {
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

  // Düzenleme formunu başlat
  const startEdit = (item: any) => {
    setCurrentItem(item);
    
    // Form verilerini ayarla
    const translations: Record<string, any> = {};
    item.translations.forEach((trans: any) => {
      translations[trans.languageCode] = {
        title: trans.title,
        description: trans.description
      };
    });
    
    setFormData({ translations });
    setIsEditDialogOpen(true);
  };

  // Formu sıfırla
  const resetForm = () => {
    setFormData({ translations: {} });
    setCurrentItem(null);
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
            <h2 className="text-3xl font-bold tracking-tight">Kapsamlı Bakım Öğeleri</h2>
            <p className="text-sm text-muted-foreground">
              Hakkımızda sayfasındaki kapsamlı bakım bölümü öğelerini yönetin.
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
          Yeni Öğe Ekle
        </Button>
      </div>
      
      <Separator className="my-6" />
      
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Kapsamlı Bakım Öğeleri</CardTitle>
          <CardDescription>
            Mevcut kapsamlı bakım öğelerini görüntüleyin ve düzenleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      (trans: any) => trans.languageCode === activeTab
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
                              onClick={() => handleReorder(item.id, "up")}
                              disabled={item.order === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReorder(item.id, "down")}
                              disabled={item.order === careItems.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(item)}
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

      {/* Yeni Öğe Ekleme Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Kapsamlı Bakım Öğesi Ekle</DialogTitle>
            <DialogDescription>
              Hakkımızda sayfası için yeni bir kapsamlı bakım öğesi ekleyin. Tüm dillerde içerik eklemek zorunda değilsiniz.
            </DialogDescription>
          </DialogHeader>
          
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
                const langData = formData.translations[lang.code] || { title: "", description: "" };
                
                return (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`title-${lang.code}`}>Başlık</Label>
                      <Input
                        id={`title-${lang.code}`}
                        value={langData.title}
                        onChange={(e) => handleFormChange(lang.code, "title", e.target.value)}
                        placeholder="Varıştan İyileşmeye Kadar Kapsamlı Bakım"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${lang.code}`}>Açıklama</Label>
                      <Textarea
                        id={`description-${lang.code}`}
                        value={langData.description}
                        onChange={(e) => handleFormChange(lang.code, "description", e.target.value)}
                        placeholder="İlk konsültasyonunuzdan tedavi sonrası iyileşme sürecine kadar her adımda yanınızdayız..."
                        rows={4}
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
              onClick={handleAddCareItem}
              disabled={loading}
            >
              {loading ? "Ekleniyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Öğe Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Kapsamlı Bakım Öğesini Düzenle</DialogTitle>
            <DialogDescription>
              Seçilen kapsamlı bakım öğesini düzenleyin. Tüm dillerde içerik eklemek zorunda değilsiniz.
            </DialogDescription>
          </DialogHeader>
          
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
                const langData = formData.translations[lang.code] || { title: "", description: "" };
                
                return (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-title-${lang.code}`}>Başlık</Label>
                      <Input
                        id={`edit-title-${lang.code}`}
                        value={langData.title}
                        onChange={(e) => handleFormChange(lang.code, "title", e.target.value)}
                        placeholder="Varıştan İyileşmeye Kadar Kapsamlı Bakım"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-description-${lang.code}`}>Açıklama</Label>
                      <Textarea
                        id={`edit-description-${lang.code}`}
                        value={langData.description}
                        onChange={(e) => handleFormChange(lang.code, "description", e.target.value)}
                        placeholder="İlk konsültasyonunuzdan tedavi sonrası iyileşme sürecine kadar her adımda yanınızdayız..."
                        rows={4}
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
}