'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TableLoadingSkeleton } from './LoadingSkeletons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Language } from '@/generated/prisma/client';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TreatmentCardItem {
  id: string;
  imageUrl: string;
  order: number;
  isPublished: boolean;
  translations: Array<{
    languageCode: string;
    title?: string | null;
    description?: string | null;
    linkUrl?: string | null;
  }>;
}

interface TedaviKartlariListesiProps {
  onEditItem: (item: TreatmentCardItem) => void;
  onAddNewItem: () => void;
  availableLanguages: Language[]; 
  activeLanguageCode: string; // Eklendi
  refreshTrigger: number; 
}

export default function TedaviKartlariListesi({ 
  onEditItem, 
  onAddNewItem, 
  availableLanguages,
  activeLanguageCode, // Eklendi
  refreshTrigger
}: TedaviKartlariListesiProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [treatmentItems, setTreatmentItems] = useState<TreatmentCardItem[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const itemsRes = await fetch('/api/admin/treatment-cards');
      if (!itemsRes.ok) {
        const errorData = await itemsRes.json();
        throw new Error(errorData.message || 'Tedavi kartları yüklenemedi.');
      }
      const itemsDataFromApi = await itemsRes.json();
      setTreatmentItems(itemsDataFromApi);
    } catch (error) {
      console.error("Failed to fetch treatment cards:", error);
      toast.error(error instanceof Error ? error.message : 'Tedavi kartları yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setInitialDataLoaded(true);
    }
  }, [refreshTrigger]); // refreshTrigger bağımlılığı eklendi, fetchData'nın kendisi useCallback içinde olduğu için direkt useEffect'e eklenebilir.

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData'nın bağımlılığı refreshTrigger olduğu için bu useEffect de refreshTrigger değiştiğinde çalışır.

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Bu tedavi kartını silmek istediğinizden emin misiniz?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/treatment-cards/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tedavi kartı silinemedi.');
      }
      toast.success('Tedavi kartı başarıyla silindi!');
      fetchData(); 
    } catch (error: any) {
      toast.error(`Silme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialDataLoaded && isLoading) {
    return <TableLoadingSkeleton title="Tedavi Kartları yükleniyor..." />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tedavi Kartları</CardTitle>
          <CardDescription>Ana sayfada gösterilecek tedavi kartlarını yönetin.</CardDescription>
        </div>
        <Button onClick={onAddNewItem} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Yeni Kart Ekle</Button>
      </CardHeader>
      <CardContent>
        {treatmentItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Resim</TableHead>
                <TableHead>Başlık (Varsayılan Dil)</TableHead>
                <TableHead className="w-[100px]">Sıra</TableHead>
                <TableHead className="w-[120px]">Durum</TableHead>
                <TableHead className="w-[120px] text-right">Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatmentItems.sort((a,b) => a.order - b.order).map((item) => { // Sıralama eklendi
                const currentLangTranslation = item.translations.find(t => t.languageCode === activeLanguageCode);
                const fallbackTranslation = item.translations.find(t => t.languageCode === 'tr') || item.translations[0];
                const displayTranslation = currentLangTranslation || fallbackTranslation;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.imageUrl && <Image src={item.imageUrl} alt={displayTranslation?.title || 'Tedavi Kartı'} width={60} height={45} className="rounded object-cover aspect-[4/3]" />}
                    </TableCell>
                    <TableCell>{displayTranslation?.title || 'Çeviri Yok'}</TableCell>
                    <TableCell>{item.order}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isPublished ? 'Yayında' : 'Taslak'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEditItem(item)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-4">Henüz tedavi kartı eklenmemiş.</p>
        )}
      </CardContent>
    </Card>
  );
};
