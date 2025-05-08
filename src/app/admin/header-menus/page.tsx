"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner"; // Assuming sonner is used for toasts

// Tipleri API yanıtlarına göre tanımla (şimdilik genel)
interface HeaderMenuTranslation {
  languageCode: string;
  title: string;
}

interface HeaderMenuItem {
  id: string;
  order: number;
  itemType: string; // MenuItemType enum
  linkUrl?: string | null;
  openInNewTab: boolean;
  isActive: boolean;
  parentId?: string | null;
  translations: HeaderMenuTranslation[];
  children: HeaderMenuItem[]; // Alt öğeler
  // blogPostId, hizmetId gibi alanlar da olabilir
}

interface HeaderMenu {
  id: string;
  name: string;
  isActive: boolean;
  items: HeaderMenuItem[];
  createdAt: string;
  updatedAt: string;
}

// MenuItemType enum'ını manuel olarak tanımla (API ile aynı olmalı)
enum MenuItemType {
  LINK = "LINK",
  BLOG_POST = "BLOG_POST",
  SERVICE_PAGE = "SERVICE_PAGE",
}


export default function HeaderMenusPage() {
  const [menus, setMenus] = useState<HeaderMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states for creating/editing HeaderMenu (ana menü tanımı)
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<HeaderMenu | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuIsActive, setMenuIsActive] = useState(true);

  const fetchHeaderMenus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/header-menus');
      if (!response.ok) {
        throw new Error('Header menüleri getirilemedi.');
      }
      const data = await response.json();
      setMenus(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeaderMenus();
  }, []);

  const handleMenuDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = editingMenu 
      ? `/api/admin/header-menus/${editingMenu.id}` 
      : '/api/admin/header-menus';
    const method = editingMenu ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: menuName, isActive: menuIsActive }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Header menüsü kaydedilemedi.');
      }
      toast.success(`Header menüsü başarıyla ${editingMenu ? 'güncellendi' : 'oluşturuldu'}.`);
      setIsMenuDialogOpen(false);
      setEditingMenu(null);
      fetchHeaderMenus(); // Listeyi yenile
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openNewMenuDialog = () => {
    setEditingMenu(null);
    setMenuName('');
    setMenuIsActive(true);
    setIsMenuDialogOpen(true);
  };

  const openEditMenuDialog = (menu: HeaderMenu) => {
    setEditingMenu(menu);
    setMenuName(menu.name);
    setMenuIsActive(menu.isActive);
    setIsMenuDialogOpen(true);
  };
  
  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm("Bu header menüsünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/header-menus/${menuId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Header menüsü silinemedi.');
      }
      toast.success("Header menüsü başarıyla silindi.");
      fetchHeaderMenus(); // Listeyi yenile
    } catch (err: any) {
      toast.error(err.message);
    }
  };


  if (isLoading) return <p className="text-center py-10">Yükleniyor...</p>;
  if (error) return <p className="text-center py-10 text-red-500">Hata: {error}</p>;

  // Genellikle tek bir "Ana Header Menüsü" olur.
  // Eğer hiç menü yoksa veya birden fazla menü yönetimi isteniyorsa bu listeleme ve ekleme mantığı geçerlidir.
  // Eğer her zaman tek bir menü olacaksa, arayüz doğrudan o menünün öğelerini yönetmeye odaklanabilir.
  // Şimdilik genel bir yapı sunulmuştur.

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Header Menü Yönetimi</h1>
        <Button onClick={openNewMenuDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Yeni Header Menüsü Ekle
        </Button>
      </div>

      {menus.length === 0 ? (
        <p>Henüz header menüsü oluşturulmamış.</p>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Menü Adı</TableHead>
                <TableHead>Aktif mi?</TableHead>
                <TableHead>Öğe Sayısı</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="font-medium">{menu.name}</TableCell>
                  <TableCell>{menu.isActive ? 'Evet' : 'Hayır'}</TableCell>
                  <TableCell>{menu.items?.length || 0}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/header-menus/${menu.id}/items`}>
                       <Button variant="outline" size="sm">
                         <Eye className="mr-1 h-4 w-4" /> Öğeleri Yönet
                       </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => openEditMenuDialog(menu)}>
                      <Edit className="mr-1 h-4 w-4" /> Düzenle
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteMenu(menu.id)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Sil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* HeaderMenu Create/Edit Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingMenu ? 'Header Menüsünü Düzenle' : 'Yeni Header Menüsü Oluştur'}</DialogTitle>
            <DialogDescription>
              {editingMenu ? `"${editingMenu.name}" adlı header menüsünün detaylarını düzenleyin.` : 'Yeni bir header menüsü tanımı oluşturun.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMenuDialogSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="menuName" className="text-right">
                  Menü Adı
                </Label>
                <Input
                  id="menuName"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="menuIsActive" className="text-right">
                  Aktif mi?
                </Label>
                <div className="col-span-3">
                    <Switch
                        id="menuIsActive"
                        checked={menuIsActive}
                        onCheckedChange={setMenuIsActive}
                    />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">İptal</Button>
              </DialogClose>
              <Button type="submit">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
