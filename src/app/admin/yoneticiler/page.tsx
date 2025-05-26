"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { toast } from "sonner"; // Sonner'ı import et
import { YoneticiForm } from '@/components/admin/yonetici-form'; // Formu import et
import { AdminFormValues } from '@/lib/validators/admin';

// Yönetici verisi tipi
export type Admin = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export default function YoneticilerPage() {
  const [data, setData] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Form gönderim durumu

  // Dialog state'leri
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null); // Düzenlenecek yönetici
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null); // Silinecek yönetici ID'si

  // Veri çekme fonksiyonu (useCallback ile optimize edildi)
  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/yoneticiler');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API hatası: ${response.status}`);
      }
      const admins: Admin[] = await response.json();
      setData(admins);
    } catch (err) {
      console.error("Yönetici verisi çekme hatası:", err);
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      setError(new Error(errorMessage));
      toast.error(`Yöneticiler yüklenirken hata: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []); // Bağımlılık yok, sadece bir kere oluşturulur

  // Component mount olduğunda veriyi çek
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]); // fetchAdmins değiştiğinde tekrar çalışır (ama değişmeyecek)

  // Form gönderim işlemi (Ekleme/Güncelleme)
  const handleFormSubmit = async (values: AdminFormValues) => {
    setIsSubmitting(true);
    const url = editingAdmin
      ? `/api/admin/yoneticiler/${editingAdmin.id}`
      : '/api/admin/yoneticiler';
    const method = editingAdmin ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API hatası: ${response.status}`);
      }

      toast.success(`Yönetici başarıyla ${editingAdmin ? 'güncellendi' : 'eklendi'}!`);
      setIsFormOpen(false); // Dialog'u kapat
      setEditingAdmin(null); // Düzenleme modunu sıfırla
      await fetchAdmins(); // Tabloyu yenile
    } catch (err) {
      console.error("Form gönderme hatası:", err);
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      toast.error(`Hata: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Silme işlemi
  const handleDeleteAdmin = async () => {
    if (!deletingAdminId) return;
    setIsSubmitting(true); // Butonları disable etmek için kullanılabilir

    try {
      const response = await fetch(`/api/admin/yoneticiler/${deletingAdminId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API hatası: ${response.status}`);
      }

      toast.success("Yönetici başarıyla silindi!");
      setDeletingAdminId(null); // Silme onayını kapat
      await fetchAdmins(); // Tabloyu yenile
    } catch (err) {
      console.error("Silme hatası:", err);
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      toast.error(`Silme hatası: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setDeletingAdminId(null); // Her durumda ID'yi sıfırla
    }
  };

  // DataTable için sütun tanımları
  const columns: ColumnDef<Admin>[] = [
    {
      accessorKey: "name",
      header: "İsim",
      cell: ({ row }) => row.getValue("name") || "-",
    },
    {
      accessorKey: "email",
      header: "E-posta",
    },
    {
      accessorKey: "createdAt",
      header: "Oluşturulma Tarihi",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: "actions",
      header: () => <div className="text-right">İşlemler</div>,
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Menüyü aç</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setEditingAdmin(admin);
                    setIsFormOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                  onClick={() => setDeletingAdminId(admin.id)} // Silme onayı için ID'yi set et
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-10">
      {/* Ekleme/Düzenleme Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingAdmin(null); // Kapanınca düzenleme modunu sıfırla
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAdmin ? 'Yönetici Düzenle' : 'Yeni Yönetici Ekle'}</DialogTitle>
            <DialogDescription>
              {editingAdmin ? 'Yönetici bilgilerini güncelleyin.' : 'Yeni bir yönetici eklemek için formu doldurun.'}
            </DialogDescription>
          </DialogHeader>
          <YoneticiForm
            initialData={editingAdmin}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Silme Onay Dialog */}
      <AlertDialog open={!!deletingAdminId} onOpenChange={(open) => { if (!open) setDeletingAdminId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu yöneticiyi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingAdminId(null)} disabled={isSubmitting}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAdmin} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sayfa Başlığı ve Ekle Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Yönetici Yönetimi</h1>
        <Button onClick={() => { setEditingAdmin(null); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Yeni Yönetici Ekle
        </Button>
      </div>

      {/* Veri Tablosu */}
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        filterColumnId="email"
        filterPlaceholder="E-postaya göre filtrele..."
      />
    </div>
  );
}
