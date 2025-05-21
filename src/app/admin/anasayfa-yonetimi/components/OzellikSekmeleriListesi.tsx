'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { Language } from '@/generated/prisma/client'; // Language importu eklendi

// Sekme öğesi veri tipi
interface FeatureTabItem {
  id: string;
  value: string;
  order: number;
  isPublished: boolean;
  translations: Array<{
    languageCode: string;
    triggerText: string;
    heading: string;
  }>;
}

interface OzellikSekmeleriListesiProps {
  onEditItem: (itemId: string) => void;
  onAddNewItem: () => void;
  activeLanguageCode: string; // Eklendi
  availableLanguages: Language[]; // Eklendi (gerçi bu listede direkt kullanılmıyor ama tutarlılık için eklenebilir veya kaldırılabilir)
}

export default function OzellikSekmeleriListesi({ onEditItem, onAddNewItem, activeLanguageCode, availableLanguages }: OzellikSekmeleriListesiProps) {
  const [items, setItems] = useState<FeatureTabItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      setError(null);
      try {
        const itemsResponse = await fetch('/api/admin/home-page-feature-tabs/items');
        if (!itemsResponse.ok) throw new Error('Sekme öğeleri yüklenemedi.');
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/home-page-feature-tabs/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Öğe silinirken bir hata oluştu.');
      }
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast.success("Öğe başarıyla silindi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silme işlemi sırasında bir hata oluştu.");
      console.error("Silme hatası:", err);
    }
  };

  if (loadingItems) return <p className="text-center py-10">Sekme öğeleri yükleniyor...</p>;
  if (error) return <p className="text-red-500 bg-red-100 p-3 rounded-md">Hata: {error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sekme Öğeleri</h2>
        <Button onClick={onAddNewItem}>
          <PlusCircle className="mr-2 h-5 w-5" /> Yeni Sekme Ekle
        </Button>
      </div>

      {items.length === 0 && !loadingItems && !error && (
        <p className="text-center text-gray-500 py-8">Henüz hiç özellik sekmesi eklenmemiş.</p>
      )}

      {items.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sıra</TableHead>
                <TableHead>Değer (Value)</TableHead>
                <TableHead>Başlık (TR)</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.sort((a, b) => a.order - b.order).map((item) => { // Sıralama eklendi
                const currentLangTranslation = item.translations.find(t => t.languageCode === activeLanguageCode);
                const fallbackTranslation = item.translations.find(t => t.languageCode === 'tr') || item.translations[0];
                const displayTranslation = currentLangTranslation || fallbackTranslation;
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.order}</TableCell>
                    <TableCell className="font-medium">{item.value}</TableCell>
                    <TableCell>{displayTranslation?.triggerText || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={item.isPublished ? "default" : "outline"}>
                        {item.isPublished ? 'Yayında' : 'Taslak'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEditItem(item.id)} className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
