"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash, ArrowLeft, MoveUp, MoveDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AboutPageGalleryAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [newImage, setNewImage] = useState({
    imageUrl: "",
    altText: "",
  });

  // Galeri resimlerini getir
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/about-page/gallery");
        
        if (response.ok) {
          const data = await response.json();
          setGalleryImages(data);
        } else {
          console.error("Galeri resimleri alınamadı");
          toast.error("Galeri resimleri yüklenemedi!");
        }
      } catch (error) {
        console.error("Galeri resimleri yüklenirken hata:", error);
        toast.error("Galeri resimleri yüklenirken bir hata oluştu!");
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  // Yeni resim ekle
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

  // Resim sil
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

  // Resim sırasını değiştir
  const handleReorder = async (id: string, direction: "up" | "down") => {
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
            <h2 className="text-3xl font-bold tracking-tight">Hakkımızda Sayfası Galeri</h2>
            <p className="text-sm text-muted-foreground">
              Hakkımızda sayfası galeri resimlerini yönetin.
            </p>
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
      
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
                endpoint="aboutPageGallery"
                value={newImage.imageUrl}
                onChange={(url) => setNewImage({ ...newImage, imageUrl: url })}
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
                              onClick={() => handleReorder(image.id, "up")}
                              disabled={image.order === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReorder(image.id, "down")}
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
}