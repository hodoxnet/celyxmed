"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox"; // Checkbox eklendi
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Trash2, Edit, FileJson, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from "sonner";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // Switch eklendi
import Link from 'next/link'; // Link eklendi

// Prisma'dan gelen Language tipi
import type { Language } from '@/generated/prisma';

// Form için Zod şeması
const languageFormSchema = z.object({
  name: z.string().min(2, { message: "Dil adı en az 2 karakter olmalıdır." }),
  code: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, { message: "Kod formatı 'en' veya 'en-US' gibi olmalıdır." }),
  menuLabel: z.string().min(1, { message: "Menü etiketi zorunludur." }),
  flagCode: z.string().min(2).max(2, { message: "Bayrak kodu 2 karakter olmalıdır (örn: tr, gb)." }),
  // .default() kaldırıldı, varsayılan değerler useForm'da ayarlanacak
  isActive: z.boolean(), 
  isDefault: z.boolean(),
});
type LanguageFormValues = z.infer<typeof languageFormSchema>; // Bu tip artık { name: string; code: string; isActive: boolean; isDefault: boolean; } olacak

export default function DillerPage() {
  const [data, setData] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [deletingLanguageId, setDeletingLanguageId] = useState<string | null>(null);

  // useForm'a LanguageFormValues tipini veriyoruz
  const form = useForm<LanguageFormValues>({
    resolver: zodResolver(languageFormSchema),
    // Varsayılan değerleri burada net olarak boolean atıyoruz
    defaultValues: { 
      name: "", 
      code: "", 
      menuLabel: "",
      flagCode: "",
      isActive: true, 
      isDefault: false 
    },
  });

  // Veri çekme
  const fetchLanguages = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await fetch('/api/admin/languages');
      if (!response.ok) throw new Error((await response.json()).message || 'API Hatası');
      setData(await response.json());
    } catch (err: any) {
      setError(err); toast.error(`Diller yüklenirken hata: ${err.message}`);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchLanguages(); }, [fetchLanguages]);

  // Form gönderimi (Ekle/Güncelle)
  const handleFormSubmit = async (values: LanguageFormValues) => {
    setIsSubmitting(true);
    const url = editingLanguage ? `/api/admin/languages/${editingLanguage.id}` : '/api/admin/languages';
    const method = editingLanguage ? 'PUT' : 'POST';

    // Düzenleme modunda kodu gönderme (kod değiştirilemez varsayımı)
    const dataToSend: any = { ...values };
    if (editingLanguage) {
      delete dataToSend.code;
    }

    // Debug için form değerleri ve gönderilen veriyi konsola yazdır
    console.log("Form değerleri:", values);
    console.log("Gönderilen veri:", dataToSend);
    console.log("isDefault değeri (tip):", typeof dataToSend.isDefault);

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'API Hatası');

      const responseData = await response.json();
      console.log("API Yanıtı:", responseData);

      toast.success(`Dil başarıyla ${editingLanguage ? 'güncellendi' : 'eklendi'}!`);
      setIsFormOpen(false); setEditingLanguage(null); form.reset();
      await fetchLanguages();
    } catch (err: any) {
      toast.error(`Hata: ${err.message}`);
    } finally { setIsSubmitting(false); }
  };

  // Silme işlemi
  const handleDeleteLanguage = async () => {
    if (!deletingLanguageId) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/languages/${deletingLanguageId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).message || 'API Hatası');
      toast.success("Dil başarıyla silindi!");
      setDeletingLanguageId(null);
      await fetchLanguages();
    } catch (err: any) {
      toast.error(`Silme hatası: ${err.message}`);
    } finally { setIsSubmitting(false); setDeletingLanguageId(null); }
  };

  // Varsayılan dil değiştirme işlemi
  const handleSetDefaultLanguage = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/admin/languages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) throw new Error((await response.json()).message || 'API Hatası');

      toast.success(`${name} varsayılan dil olarak ayarlandı!`);
      await fetchLanguages();
    } catch (err: any) {
      toast.error(`Varsayılan dil değiştirme hatası: ${err.message}`);
    }
  };

  // Formu düzenleme için doldur
  const openEditDialog = (language: Language) => {
    setEditingLanguage(language);
    // form.reset ile değerleri LanguageFormValues tipine uygun atıyoruz
    console.log("Düzenleme için gelen dil verisi:", language);
    console.log("isDefault değeri (tip):", typeof language.isDefault);

    form.reset({
      name: language.name,
      code: language.code,
      menuLabel: language.menuLabel || language.name,
      flagCode: language.flagCode || language.code,
      isActive: language.isActive, // Prisma'dan gelen boolean
      isDefault: language.isDefault, // Prisma'dan gelen boolean
    });
    setIsFormOpen(true);
  };

  // Yeni ekleme dialoğunu aç
   const openNewDialog = () => {
    setEditingLanguage(null);
    // Formu sıfırlarken de defaultValues'a uygun tiplerle sıfırlıyoruz
    form.reset({ 
      name: "", 
      code: "", 
      menuLabel: "",
      flagCode: "",
      isActive: true, 
      isDefault: false 
    }); 
    setIsFormOpen(true);
  };

  // DataTable sütunları
  const columns: ColumnDef<Language>[] = [
    { accessorKey: "name", header: "Dil Adı" },
    { accessorKey: "code", header: "Kod" },
    {
      accessorKey: "isActive", header: "Aktif",
      cell: ({ row }) => <Checkbox checked={row.getValue("isActive")} disabled />,
    },
    {
      accessorKey: "isDefault",
      header: "Varsayılan",
      cell: ({ row }) => {
        const isDefault = row.getValue("isDefault");
        if (isDefault) {
          return (
            <div className="flex items-center">
              <ToggleRight className="w-5 h-5 mr-1 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Varsayılan</span>
            </div>
          );
        }
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSetDefaultLanguage(row.original.id, row.original.name)}
          >
            <ToggleLeft className="w-4 h-4 mr-1" />
            Varsayılan Yap
          </Button>
        );
      },
    },
    {
      id: "translations", header: "Çeviriler",
      cell: ({ row }) => (
        <Link href={`/admin/diller/${row.original.code}`} passHref>
           <Button variant="outline" size="sm">
             <FileJson className="mr-2 h-4 w-4" /> Düzenle
           </Button>
        </Link>
      ),
    },
    {
      id: "actions", header: () => <div className="text-right">İşlemler</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openEditDialog(row.original)}><Edit className="mr-2 h-4 w-4" />Düzenle</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => setDeletingLanguageId(row.original.id)} disabled={row.original.isDefault}>
                <Trash2 className="mr-2 h-4 w-4" />Sil {row.original.isDefault && '(Varsayılan)'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-10">
      {/* Ekleme/Düzenleme Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) { setEditingLanguage(null); form.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLanguage ? 'Dil Düzenle' : 'Yeni Dil Ekle'}</DialogTitle>
            <DialogDescription>{editingLanguage ? 'Dil bilgilerini güncelleyin.' : 'Yeni bir dil ekleyin.'}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Dil Adı</FormLabel><FormControl><Input placeholder="Örn: Türkçe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Dil Kodu</FormLabel><FormControl><Input placeholder="örn: tr, en-US" {...field} disabled={!!editingLanguage} /></FormControl><FormDescription>Küçük harf, 2 veya 5 karakter (örn: en, en-US). Değiştirilemez.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="menuLabel" render={({ field }) => (<FormItem><FormLabel>Menü Etiketi</FormLabel><FormControl><Input placeholder="Örn: Dil, Language, Sprache" {...field} /></FormControl><FormDescription>Navbar'da gösterilecek metin (her dilin kendi dilinde)</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="flagCode" render={({ field }) => (<FormItem><FormLabel>Bayrak Kodu</FormLabel><FormControl><Input placeholder="Örn: tr, gb, de" {...field} /></FormControl><FormDescription>ISO 3166-1 alpha-2 ülke kodu (2 karakter)</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="isActive" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Aktif Mi?</FormLabel><FormDescription>Bu dil sitede kullanılsın mı?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="isDefault" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Varsayılan Dil Mi?</FormLabel><FormDescription>Siteye ilk girişte bu dil mi gösterilsin?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">İptal</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Kaydediliyor...' : (editingLanguage ? 'Güncelle' : 'Ekle')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Silme Onay Dialog */}
      <AlertDialog open={!!deletingLanguageId} onOpenChange={(open) => { if (!open) setDeletingLanguageId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Emin misiniz?</AlertDialogTitle><AlertDialogDescription>Bu dili kalıcı olarak silmek istediğinizden emin misiniz? İlgili çeviri dosyası da silinecektir. Bu işlem geri alınamaz.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingLanguageId(null)} disabled={isSubmitting}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLanguage} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">{isSubmitting ? 'Siliniyor...' : 'Sil'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sayfa Başlığı ve Ekle Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dil Yönetimi</h1>
        <Button onClick={openNewDialog}><PlusCircle className="mr-2 h-4 w-4" /> Yeni Dil Ekle</Button>
      </div>

      {/* Veri Tablosu */}
      <DataTable columns={columns} data={data} isLoading={isLoading} error={error} />
    </div>
  );
}
