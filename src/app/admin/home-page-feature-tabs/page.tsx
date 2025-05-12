"use client";

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

// Örnek veri tipi, API'den gelen veriye göre güncellenecek
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
  // Diğer alanlar eklenebilir
}

export default function FeatureTabsAdminPage() {
  const [items, setItems] = useState<FeatureTabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/home-page-feature-tabs/items');
        if (!response.ok) {
          throw new Error('Veriler yüklenirken bir hata oluştu.');
        }
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleDelete = async (itemId: string) => {
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

  if (loading) return <p className="text-center py-10">Yükleniyor...</p>;
  // Error state'i burada gösterilmiyor, toast ile gösteriliyor. İstenirse eklenebilir.

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Özellik Sekmeleri Yönetimi</h1>
        <Button asChild>
          <Link href="/admin/home-page-feature-tabs/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Sekme Ekle
          </Link>
        </Button>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">Hata: {error}</p>}

      {items.length === 0 && !loading && !error && (
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
              {items.map((item) => {
                const trTranslation = item.translations.find(t => t.languageCode === 'tr');
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.order}</TableCell>
                    <TableCell className="font-medium">{item.value}</TableCell>
                    <TableCell>{trTranslation?.triggerText || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={item.isPublished ? 'default' : 'outline'}>
                        {item.isPublished ? 'Yayında' : 'Taslak'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild className="mr-2">
                        <Link href={`/admin/home-page-feature-tabs/${item.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
