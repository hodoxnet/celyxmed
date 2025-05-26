'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TableLoadingSkeleton } from './LoadingSkeletons';
import { PlusCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner"; 
import { Language } from '@/generated/prisma/client'; // Language tipini import et

interface FaqTranslationData {
  id: string;
  languageCode: string;
  question: string;
  answer: string;
}

interface FaqData {
  id: string;
  order: number;
  isPublished: boolean;
  translations: FaqTranslationData[];
  createdAt: string;
  updatedAt: string;
}

interface SSSListesiProps {
  onEditItem: (faqId: string) => void;
  onAddNewItem: () => void;
  availableLanguages: Language[]; 
  activeLanguageCode: string; // Eklendi
  refreshTrigger: number;
}

export default function SSSListesi({ onEditItem, onAddNewItem, availableLanguages, activeLanguageCode, refreshTrigger }: SSSListesiProps) {
  const [faqs, setFaqs] = useState<FaqData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/faqs'); // API endpoint'i doğru varsayılıyor
      if (!response.ok) {
        throw new Error(`SSS'ler getirilemedi: ${response.statusText}`);
      }
      const data = await response.json();
      setFaqs(data.sort((a: FaqData, b: FaqData) => a.order - b.order));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
      toast.error("SSS'ler getirilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs, refreshTrigger]);

  const handleDeleteFaq = async () => {
    if (!faqToDelete) return;
    try {
      const response = await fetch(`/api/admin/faqs/${faqToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `SSS silinemedi: ${response.statusText}` }));
        throw new Error(errorData.message || `SSS silinemedi: ${response.statusText}`);
      }
      setFaqs(prevFaqs => prevFaqs.filter(faq => faq.id !== faqToDelete));
      toast.success("SSS başarıyla silindi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "SSS silinirken bir hata oluştu.");
    } finally {
      setShowDeleteDialog(false);
      setFaqToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setFaqToDelete(id);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return <TableLoadingSkeleton title="SSS'ler yükleniyor..." />;
  }

  if (error) {
    return <div className="p-6 text-red-500 text-center">Hata: {error}</div>;
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Sıkça Sorulan Sorular ({availableLanguages.find(l => l.code === activeLanguageCode)?.name})</h2>
            <Button onClick={onAddNewItem}>
                <PlusCircle className="mr-2 h-5 w-5" /> Yeni SSS Ekle
            </Button>
        </div>

      {faqs.filter(faq => faq.translations.some(t => t.languageCode === activeLanguageCode && t.question && t.answer)).length === 0 ? (
        <p className="text-center py-4">Bu dil için henüz SSS eklenmemiş veya mevcut SSS'lerin bu dilde çevirisi bulunmuyor.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Sıra</TableHead>
                <TableHead>Soru</TableHead>
                <TableHead className="w-[120px]">Durum</TableHead>
                <TableHead className="w-[120px] text-right">Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs
                .filter(faq => faq.translations.some(t => t.languageCode === activeLanguageCode && t.question && t.answer)) // Aktif dile göre filtrele
                .map((faq) => {
                  // Filtrelenmiş olduğu için, aktif dilde çevirisi kesin var.
                  const displayTranslation = faq.translations.find(t => t.languageCode === activeLanguageCode)!;
                  return (
                    <TableRow key={faq.id}>
                      <TableCell>{faq.order}</TableCell>
                      <TableCell className="font-medium">
                        {displayTranslation.question}
                    </TableCell>
                    <TableCell>
                      <Badge variant={faq.isPublished ? "default" : "outline"}>
                        {faq.isPublished ? <><Eye className="mr-1 h-3 w-3" /> Yayınlandı</> : <><EyeOff className="mr-1 h-3 w-3" /> Taslak</>}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onEditItem(faq.id)} className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => openDeleteDialog(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>SSS Öğesini Silmek İstediğinizden Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Bu SSS öğesi ve tüm çevirileri kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFaqToDelete(null)}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFaq}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
