"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
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
import { toast } from "sonner";

// Tipler (API yanıtlarına göre)
interface ApiFooterMenuTranslation { // Ana menü grubu adı çevirisi için
  languageCode: string;
  name: string;
}

interface FooterMenuItem { // Bu tip daha detaylı olabilir, şimdilik basit tutuluyor
  id: string;
  // Diğer öğe detayları (gerekirse)
}

interface FooterMenu {
  id: string;
  // name: string; // Bu alan API'dan artık gelmeyecek, translations kullanılacak
  translations: ApiFooterMenuTranslation[]; // Ana menü grubunun kendi adının çevirileri
  order: number;
  isActive: boolean;
  items: FooterMenuItem[];
  createdAt: string;
  updatedAt: string;
}

export default function FooterMenusPage() {
  const [menus, setMenus] = useState<FooterMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<FooterMenu | null>(null);
  // const [menuName, setMenuName] = useState(''); // Yerine menuTranslations kullanılacak
  const [menuTranslations, setMenuTranslations] = useState<Record<string, string>>({});
  const [menuOrder, setMenuOrder] = useState(0);
  const [menuIsActive, setMenuIsActive] = useState(true);
  const [activeLanguages, setActiveLanguages] = useState<Array<{ code: string; name: string }>>([]);

  const fetchActiveLanguages = async () => {
    try {
      const response = await fetch('/api/languages?active=true');
      if (!response.ok) {
        throw new Error('Aktif diller getirilemedi.');
      }
      const data = await response.json();
      setActiveLanguages(data.languages || data);
    } catch (err: any) {
      toast.error(err.message || "Aktif diller yüklenirken bir hata oluştu.");
    }
  };

  const fetchFooterMenus = async () => {
    setIsLoading(true);
    try {
      // API'nin /api/admin/footer-menus olduğunu ve FooterMenu[] (translations dahil) döndürdüğünü varsayıyoruz.
      const response = await fetch('/api/admin/footer-menus');
      if (!response.ok) {
        throw new Error('Footer menüleri getirilemedi.');
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
    fetchFooterMenus();
    fetchActiveLanguages();
  }, []);

  const handleTranslationChange = (langCode: string, value: string) => {
    setMenuTranslations(prev => ({ ...prev, [langCode]: value }));
  };

  const handleMenuDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API endpoint'inin /api/menus/footer olduğunu varsayıyoruz.
    // Admin için /api/admin/menus/footer olabilir.
    const apiUrl = editingMenu
      ? `/api/menus/footer/${editingMenu.id}` // PUT için ID gerekebilir
      : '/api/menus/footer';
    const method = editingMenu ? 'PUT' : 'POST';

    const payload = {
      translations: menuTranslations,
      order: menuOrder,
      isActive: menuIsActive,
    };

    try {
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.errors?.[0]?.message || 'Footer menüsü kaydedilemedi.');
      }
      toast.success(`Footer menüsü başarıyla ${editingMenu ? 'güncellendi' : 'oluşturuldu'}.`);
      setIsMenuDialogOpen(false);
      setEditingMenu(null);
      fetchFooterMenus(); // Listeyi yenile
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openNewMenuDialog = () => {
    setEditingMenu(null);
    setMenuTranslations({});
    setMenuOrder(menus.reduce((max, menu) => Math.max(max, menu.order), -1) + 1); // En yüksek sıranın bir fazlası
    setMenuIsActive(true);
    setIsMenuDialogOpen(true);
  };

  const openEditMenuDialog = (menu: FooterMenu) => {
    setEditingMenu(menu);
    const initialTranslations: Record<string, string> = {};
    menu.translations.forEach(t => {
      initialTranslations[t.languageCode] = t.name;
    });
    setMenuTranslations(initialTranslations);
    setMenuOrder(menu.order);
    setMenuIsActive(menu.isActive);
    setIsMenuDialogOpen(true);
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm("Bu footer menü grubunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }
    try {
      // API endpoint'ini kontrol et
      const response = await fetch(`/api/menus/footer/${menuId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Footer menüsü silinemedi.');
      }
      toast.success("Footer menüsü başarıyla silindi.");
      fetchFooterMenus(); // Listeyi yenile
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  
  const getMenuDisplayName = (menu: FooterMenu) => {
    if (!menu.translations || menu.translations.length === 0) {
      console.warn(`FooterMenu ID ${menu.id} için translations dizisi bulunamadı veya boş.`);
      return `Grup ID: ${menu.id} (Çeviri Eksik)`;
    }
    const trTranslation = menu.translations.find(t => t.languageCode === 'tr');
    if (trTranslation && trTranslation.name) return trTranslation.name;

    const firstAvailableTranslation = menu.translations[0];
    if (firstAvailableTranslation && firstAvailableTranslation.name) return `${firstAvailableTranslation.name} (${firstAvailableTranslation.languageCode})`;
    
    return 'İsimsiz Grup';
  };

  if (isLoading && activeLanguages.length === 0) return <p className="text-center py-10">Yükleniyor...</p>;
  if (error) return <p className="text-center py-10 text-red-500">Hata: {error}</p>;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Footer Menü Yönetimi</h1>
        <Button onClick={openNewMenuDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Yeni Footer Menü Grubu Ekle
        </Button>
      </div>

      {menus.length === 0 && !isLoading ? (
        <p>Henüz footer menü grubu oluşturulmamış.</p>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grup Adı (Varsayılan Dil)</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead>Aktif mi?</TableHead>
                <TableHead>Öğe Sayısı</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.sort((a, b) => a.order - b.order).map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="font-medium">{getMenuDisplayName(menu)}</TableCell>
                  <TableCell>{menu.order}</TableCell>
                  <TableCell>{menu.isActive ? 'Evet' : 'Hayır'}</TableCell>
                  <TableCell>{menu.items?.length || 0}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* Linki /items alt yoluna yönlendir */}
                    <Link href={`/admin/footer-menus/${menu.id}/items`}> 
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

      {/* FooterMenu Create/Edit Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMenu ? 'Footer Menü Grubunu Düzenle' : 'Yeni Footer Menü Grubu Oluştur'}</DialogTitle>
            <DialogDescription>
              {editingMenu 
                ? `"${getMenuDisplayName(editingMenu)}" adlı footer menü grubunun detaylarını düzenleyin.` 
                : 'Yeni bir footer menü grubu (kolonu) oluşturun. Her aktif dil için grup adını girin.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMenuDialogSubmit}>
            <div className="grid gap-4 py-4">
              {activeLanguages.length > 0 ? (
                activeLanguages.map(lang => (
                  <div className="grid grid-cols-4 items-center gap-4" key={lang.code}>
                    <Label htmlFor={`menuName-${lang.code}`} className="text-right">
                      Grup Adı ({lang.name})
                    </Label>
                    <Input
                      id={`menuName-${lang.code}`}
                      value={menuTranslations[lang.code] || ''}
                      onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-4">Aktif dil bulunamadı veya yüklenemedi.</p>
              )}
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="menuOrder" className="text-right">
                  Sıra
                </Label>
                <Input
                  id="menuOrder"
                  type="number"
                  value={menuOrder}
                  onChange={(e) => setMenuOrder(parseInt(e.target.value, 10) || 0)}
                  className="col-span-3"
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
