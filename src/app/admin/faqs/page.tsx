"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner"; // Bildirimler için

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

const FaqsAdminPage = () => {
  const [faqs, setFaqs] = useState<FaqData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/faqs');
      if (!response.ok) {
        throw new Error(`Failed to fetch FAQs: ${response.statusText}`);
      }
      const data = await response.json();
      setFaqs(data);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error("SSS'ler getirilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleDeleteFaq = async () => {
    if (!faqToDelete) return;
    try {
      const response = await fetch(`/api/admin/faqs/${faqToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to delete FAQ: ${response.statusText}` }));
        throw new Error(errorData.message || `Failed to delete FAQ: ${response.statusText}`);
      }
      setFaqs(prevFaqs => prevFaqs.filter(faq => faq.id !== faqToDelete));
      toast.success("SSS başarıyla silindi.");
    } catch (err) {
      console.error("Error deleting FAQ:", err);
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
    return <div className="p-6">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Hata: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Sıkça Sorulan Sorular Yönetimi</h1>
        <Button asChild>
          <Link href="/admin/faqs/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni SSS Ekle
          </Link>
        </Button>
      </div>

      {faqs.length === 0 ? (
        <p>Henüz SSS eklenmemiş.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Sıra</TableHead>
                <TableHead>Soru (Varsayılan Dil)</TableHead>
                <TableHead className="w-[120px]">Durum</TableHead>
                <TableHead className="w-[150px]">Oluşturulma</TableHead>
                <TableHead className="w-[150px]">Güncellenme</TableHead>
                <TableHead className="w-[120px] text-right">Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq) => {
                const defaultTranslation = faq.translations.find(t => t.languageCode === 'tr') || faq.translations[0];
                return (
                  <TableRow key={faq.id}>
                    <TableCell>{faq.order}</TableCell>
                    <TableCell className="font-medium">
                      {defaultTranslation?.question || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={faq.isPublished ? "default" : "outline"}>
                        {faq.isPublished ? <><Eye className="mr-1 h-3 w-3" /> Yayınlandı</> : <><EyeOff className="mr-1 h-3 w-3" /> Taslak</>}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(faq.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(faq.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="mr-2">
                        <Link href={`/admin/faqs/${faq.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
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

export default FaqsAdminPage;
