"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Image from 'next/image';

interface SliderTranslation {
  languageCode: string;
  title: string | null;
  description: string | null;
}

interface SliderItem {
  id: string;
  backgroundImageUrl: string | null;
  order: number | null;
  isActive: boolean;
  createdAt: string;
  title: string | null; // Ana dildeki başlık (listeleme için)
  hasTranslation?: boolean; // Mevcut dil için çevirisi var mı?
}

export default function AdminSlidersPage() {
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('tr'); // Varsayılan dil

  const fetchSliders = async (language: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/sliders?lang=${language}`);
      if (!response.ok) {
        throw new Error('Slider verileri getirilemedi.');
      }
      const data = await response.json();
      setSliders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast.error("Slider'lar getirilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Örnek olarak tarayıcı dilini veya varsayılan bir dili kullanabilirsiniz.
    // Şimdilik 'tr' olarak sabit bırakıyorum, dil seçici eklenebilir.
    fetchSliders(currentLanguage);
  }, [currentLanguage]);

  const handleDeleteSlider = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sliders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Slider silinirken bir hata oluştu.');
      }
      toast.success("Slider başarıyla silindi.");
      setSliders(sliders.filter(slider => slider.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;
  if (error) return <div className="p-6 text-red-500">Hata: {error}</div>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Slider Yönetimi</h1>
        <Button asChild>
          <Link href="/admin/sliders/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Slider Ekle
          </Link>
        </Button>
      </div>

      {/* Dil seçici eklenebilir */}
      {/* <div className="mb-4">
        <select value={currentLanguage} onChange={(e) => setCurrentLanguage(e.target.value)}>
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
          ... diğer diller
        </select>
      </div> */}

      {sliders.length === 0 ? (
        <p>Henüz slider eklenmemiş.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Görsel</TableHead>
                <TableHead>Başlık ({currentLanguage.toUpperCase()})</TableHead>
                <TableHead className="w-[100px] text-center">Sıra</TableHead>
                <TableHead className="w-[120px] text-center">Durum</TableHead>
                <TableHead className="w-[150px] text-center">Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sliders.map((slider) => (
                <TableRow key={slider.id}>
                  <TableCell>
                    {slider.backgroundImageUrl ? (
                      <Image
                        src={slider.backgroundImageUrl}
                        alt={slider.title || 'Slider görseli'}
                        width={60}
                        height={40}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-[60px] h-[40px] bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">Görsel Yok</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {slider.title || <span className="text-gray-400 italic">Başlık Yok</span>}
                    {!slider.hasTranslation && (
                       <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600">
                         Çeviri Eksik ({currentLanguage.toUpperCase()})
                       </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{slider.order}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={slider.isActive ? "default" : "destructive"}>
                      {slider.isActive ? <><Eye className="mr-1 h-3 w-3"/>Aktif</> : <><EyeOff className="mr-1 h-3 w-3"/>Pasif</>}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" asChild className="mr-2">
                      <Link href={`/admin/sliders/${slider.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu slider'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSlider(slider.id)}>
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
