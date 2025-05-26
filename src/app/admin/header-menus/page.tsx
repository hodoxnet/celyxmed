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

// Tipleri API yanıtlarına göre tanımla
interface ApiHeaderMenuTranslation { // Ana menü adı çevirisi için
  languageCode: string;
  name: string;
}

interface HeaderMenuItemTranslation { // Menü öğesi başlığı çevirisi için
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
  translations: HeaderMenuItemTranslation[]; // Öğelerin çevirileri
  children: HeaderMenuItem[]; // Alt öğeler
  // blogPostId, hizmetId gibi alanlar da olabilir
}

interface HeaderMenu {
  id: string;
  // name: string; // Bu alan API'dan artık gelmeyecek, translations kullanılacak
  translations: ApiHeaderMenuTranslation[]; // Ana menünün kendi adının çevirileri
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
  // const [menuName, setMenuName] = useState(''); // Yerine menuTranslations kullanılacak
  const [menuTranslations, setMenuTranslations] = useState<Record<string, string>>({});
  const [menuIsActive, setMenuIsActive] = useState(true);
  const [activeLanguages, setActiveLanguages] = useState<Array<{ code: string; name: string }>>([]);

  const fetchActiveLanguages = async () => {
    try {
      // Bu endpoint'in aktif dilleri { code: string, name: string }[] formatında döndürdüğünü varsayıyoruz.
      // Admin API'leri genellikle /api/admin/ altında olur, bu yüzden /api/admin/languages olabilir.
      // Şimdilik /api/languages kullanıyoruz, gerekirse güncellenir.
      const response = await fetch('/api/languages?active=true'); // Sadece aktif dilleri çekmek için bir query param eklenebilir
      if (!response.ok) {
        throw new Error('Aktif diller getirilemedi.');
      }
      const data = await response.json();
      setActiveLanguages(data.languages || data); // API yanıtına göre data.languages veya data olabilir
    } catch (err: any) {
      toast.error(err.message || "Aktif diller yüklenirken bir hata oluştu.");
    }
  };

  const fetchHeaderMenus = async () => {
    setIsLoading(true);
    try {
      // API'nin /api/admin/header-menus olduğunu varsayıyoruz, bu endpoint'in
      // HeaderMenu[] döndürdüğünü ve her HeaderMenu'nün translations içerdiğini varsayıyoruz.
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
    fetchActiveLanguages(); // Aktif dilleri çek
  }, []);

  const handleTranslationChange = (langCode: string, value: string) => {
    setMenuTranslations(prev => ({ ...prev, [langCode]: value }));
  };

  const handleMenuDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API endpoint'inin /api/menus/header olduğunu varsayıyoruz (admin değil, genel API)
    // Eğer admin için ayrı bir endpoint varsa (örn: /api/admin/menus/header), o kullanılmalı.
    // Şimdilik /api/menus/header kullanıyoruz.
    const apiUrl = editingMenu 
      ? `/api/menus/header/${editingMenu.id}` // PUT için ID gerekebilir, API tasarımına bağlı
      : '/api/menus/header';
    const method = editingMenu ? 'PUT' : 'POST';

    // Frontend'den gönderilecek body'nin API'ın POST ve PUT metodlarının beklediği formatta olması gerekir.
    // API'mız `translations: Record<string, string>` ve `isActive: boolean` bekliyor.
    const payload = {
      translations: menuTranslations,
      isActive: menuIsActive,
    };
    
    // Düzenleme modunda, eğer API sadece değişen alanları kabul ediyorsa, payload'ı ona göre ayarlamak gerekebilir.
    // Şimdilik tüm alanları gönderiyoruz.

    try {
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.errors?.[0]?.message || 'Header menüsü kaydedilemedi.');
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
    setMenuTranslations({}); // Çevirileri sıfırla
    setMenuIsActive(true);
    setIsMenuDialogOpen(true);
  };

  const openEditMenuDialog = (menu: HeaderMenu) => {
    setEditingMenu(menu);
    // Mevcut çevirileri forma yükle
    const initialTranslations: Record<string, string> = {};
    menu.translations.forEach(t => {
      initialTranslations[t.languageCode] = t.name;
    });
    setMenuTranslations(initialTranslations);
    setMenuIsActive(menu.isActive);
    setIsMenuDialogOpen(true);
  };
  
  const handleDeleteMenu = async (menuId: string) => {
    // Silme API endpoint'inin /api/menus/header/:id olduğunu varsayıyoruz.
    // Admin için /api/admin/menus/header/:id olabilir.
    if (!confirm("Bu header menüsünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }
    try {
      // API endpoint'ini kontrol et
      const response = await fetch(`/api/menus/header/${menuId}`, { method: 'DELETE' });
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

  const getMenuDisplayName = (menu: HeaderMenu) => {
    // menu.translations var mı ve boş değil mi diye kontrol et
    if (!menu.translations || menu.translations.length === 0) {
      // Eğer admin panelinde menü adı doğrudan düzenlenmiyorsa ve sadece çevirilerle yönetiliyorsa,
      // bu durum genellikle bir veri tutarsızlığına veya API'dan eksik veri gelmesine işaret eder.
      // Eski 'name' alanı artık olmadığı için bir fallback göstermek zor.
      // Belki menu.id veya genel bir uyarı gösterilebilir.
      // Şimdilik, API'dan gelen verinin her zaman translations içereceğini varsayarak,
      // bu kontrolü daha çok bir güvenlik önlemi olarak ekliyoruz.
      // Eğer /api/admin/header-menus endpoint'i translations'ı içermiyorsa, asıl sorun oradadır.
      console.warn(`HeaderMenu ID ${menu.id} için translations dizisi bulunamadı veya boş.`);
      return `Menü ID: ${menu.id} (Çeviri Eksik)`; 
    }
    // Varsayılan dil olarak 'tr' veya ilk bulunan çeviriyi göster
    const trTranslation = menu.translations.find(t => t.languageCode === 'tr');
    if (trTranslation && trTranslation.name) return trTranslation.name;
    
    const firstAvailableTranslation = menu.translations[0];
    if (firstAvailableTranslation && firstAvailableTranslation.name) return `${firstAvailableTranslation.name} (${firstAvailableTranslation.languageCode})`;
    
    return 'İsimsiz Menü';
  };


  if (isLoading && activeLanguages.length === 0) return <p className="text-center py-10">Yükleniyor...</p>;
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

      {menus.length === 0 && !isLoading ? ( // isLoading kontrolü eklendi
        <p>Henüz header menüsü oluşturulmamış.</p>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Menü Adı (Varsayılan Dil)</TableHead>
                <TableHead>Aktif mi?</TableHead>
                <TableHead>Öğe Sayısı</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="font-medium">{getMenuDisplayName(menu)}</TableCell>
                  <TableCell>{menu.isActive ? 'Evet' : 'Hayır'}</TableCell>
                  <TableCell>{menu.items?.length || 0}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* Öğeleri yönetme linki, /items alt yoluna gitmeli */}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMenu ? 'Header Menüsünü Düzenle' : 'Yeni Header Menüsü Oluştur'}</DialogTitle>
            <DialogDescription>
              {editingMenu 
                ? `"${getMenuDisplayName(editingMenu)}" adlı header menüsünün detaylarını düzenleyin.` 
                : 'Yeni bir header menüsü tanımı oluşturun. Her aktif dil için menü adını girin.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMenuDialogSubmit}>
            <div className="grid gap-4 py-4">
              {activeLanguages.length > 0 ? (
                activeLanguages.map(lang => (
                  <div className="grid grid-cols-4 items-center gap-4" key={lang.code}>
                    <Label htmlFor={`menuName-${lang.code}`} className="text-right">
                      Menü Adı ({lang.name})
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
