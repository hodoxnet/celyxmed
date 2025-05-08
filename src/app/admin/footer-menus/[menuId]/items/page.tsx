"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Tipler
interface FooterMenuTranslation {
  languageCode: string;
  title: string;
}

interface FooterMenuItemData {
  id: string;
  order: number;
  itemType: string;
  linkUrl?: string | null;
  blogPostId?: string | null;
  hizmetId?: string | null;
  openInNewTab: boolean;
  isActive: boolean;
  translations: FooterMenuTranslation[];
  footerMenuId: string;
}

interface FooterMenuData {
  id: string;
  name: string;
}

// MenuItemType enum'ı (API ile aynı olmalı)
enum MenuItemType {
  LINK = "LINK",
  BLOG_POST = "BLOG_POST",
  SERVICE_PAGE = "SERVICE_PAGE",
}

// Lookup verisi için tip
interface LookupItem {
  id: string;
  title: string;
}

// Aktif dil verisi için tip
interface ActiveLanguage {
  code: string;
  name: string;
}

const ItemTypes = [
  { value: MenuItemType.LINK, label: 'Normal Link' },
  { value: MenuItemType.BLOG_POST, label: 'Blog Yazısı' },
  { value: MenuItemType.SERVICE_PAGE, label: 'Hizmet Sayfası' },
];

export default function FooterMenuItemsPage() {
  const params = useParams();
  const router = useRouter();
  const menuId = params.menuId as string;

  const [menuItems, setMenuItems] = useState<FooterMenuItemData[]>([]);
  const [footerMenu, setFooterMenu] = useState<FooterMenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLanguages, setActiveLanguages] = useState<ActiveLanguage[]>([]); // Aktif diller
  const [currentLanguage, setCurrentLanguage] = useState(''); // Başlangıçta boş

  // Lookup data states
  const [blogLookup, setBlogLookup] = useState<LookupItem[]>([]);
  const [hizmetLookup, setHizmetLookup] = useState<LookupItem[]>([]);
  const [isLookupLoading, setIsLookupLoading] = useState(false);

  // Dialog states
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FooterMenuItemData | null>(null);
  const [itemFormData, setItemFormData] = useState<Partial<FooterMenuItemData>>({
    itemType: MenuItemType.LINK,
    linkUrl: '',
    openInNewTab: false,
    isActive: true,
    translations: [], // Aktif dillere göre doldurulacak
  });

  // Aktif dilleri ve menü öğelerini çek
  const fetchData = useCallback(async () => {
    if (!menuId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Paralel fetch
      const [langRes, menuRes, itemsRes] = await Promise.all([
        fetch('/api/languages'),
        fetch(`/api/admin/footer-menus/${menuId}`),
        fetch(`/api/admin/footer-menus/${menuId}/items`)
      ]);

      // Dilleri işle
      if (!langRes.ok) throw new Error('Aktif diller getirilemedi.');
      const activeLangData: ActiveLanguage[] = await langRes.json();
      setActiveLanguages(activeLangData);
      if (activeLangData.length > 0 && !currentLanguage) {
        setCurrentLanguage(activeLangData[0].code);
      }

      // Menü detayını işle
      if (!menuRes.ok) throw new Error('Ana footer menü grubu bilgisi getirilemedi.');
      const menuData = await menuRes.json();
      setFooterMenu(menuData);

      // Menü öğelerini işle
      if (!itemsRes.ok) throw new Error('Footer menü öğeleri getirilemedi.');
      const itemsData = await itemsRes.json();
      setMenuItems(itemsData.sort((a: FooterMenuItemData, b: FooterMenuItemData) => a.order - b.order));

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Veri getirilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [menuId, currentLanguage]); // currentLanguage bağımlılığı kaldırılabilir

  useEffect(() => {
    fetchData(); // Verileri çek

    // Lookup verilerini çek
     const fetchLookups = async () => {
      setIsLookupLoading(true);
      try {
        const [blogRes, hizmetRes] = await Promise.all([
          fetch('/api/admin/blogs/lookup'),
          fetch('/api/admin/hizmetler/lookup')
        ]);
        if (!blogRes.ok || !hizmetRes.ok) {
          console.error("Lookup verileri getirilemedi.");
        }
        const blogData = await blogRes.ok ? await blogRes.json() : [];
        const hizmetData = await hizmetRes.ok ? await hizmetRes.json() : [];
        setBlogLookup(blogData);
        setHizmetLookup(hizmetData);
      } catch (err) {
        console.error("Lookup verileri getirilirken hata:", err);
      } finally {
        setIsLookupLoading(false);
      }
    };
    fetchLookups();

  }, [fetchData]); // fetchData'ya bağımlı

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setItemFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setItemFormData(prev => ({ ...prev, [name]: value }));
     if (name === 'itemType') {
      setItemFormData(prev => ({
        ...prev,
        linkUrl: value === MenuItemType.LINK ? prev.linkUrl || '' : '',
        blogPostId: value === MenuItemType.BLOG_POST ? prev.blogPostId || '' : '',
        hizmetId: value === MenuItemType.SERVICE_PAGE ? prev.hizmetId || '' : '',
      }));
    }
  };

  const handleTranslationChange = (langCode: string, value: string) => {
    setItemFormData(prev => {
       const currentTranslations = prev.translations || [];
       const existingIndex = currentTranslations.findIndex(t => t.languageCode === langCode);
       let newTranslations;
       if (existingIndex > -1) {
         newTranslations = [...currentTranslations];
         newTranslations[existingIndex] = { ...newTranslations[existingIndex], title: value };
       } else {
         newTranslations = [...currentTranslations, { languageCode: langCode, title: value }];
       }
       return { ...prev, translations: newTranslations };
    });
  };

  const openNewItemDialog = () => {
    setEditingItem(null);
    setItemFormData({
      itemType: MenuItemType.LINK,
      linkUrl: '',
      openInNewTab: false,
      isActive: true,
      translations: activeLanguages.map(lang => ({ languageCode: lang.code, title: '' })), // Aktif diller
      order: menuItems.length,
    });
    setIsItemDialogOpen(true);
  };

  const openEditItemDialog = (item: FooterMenuItemData) => {
    setEditingItem(item);
    setItemFormData({
      ...item,
      translations: activeLanguages.map(lang => { // Aktif diller
        const existingTrans = item.translations.find(t => t.languageCode === lang.code);
        return { languageCode: lang.code, title: existingTrans?.title || '' };
      }),
    });
    setIsItemDialogOpen(true);
  };

  const handleItemDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuId) return;

    const payload = {
      ...itemFormData,
      footerMenuId: menuId,
      translations: itemFormData.translations?.filter(t => t.title.trim() !== ''),
    };

    if (payload.itemType !== MenuItemType.BLOG_POST) payload.blogPostId = null;
    if (payload.itemType !== MenuItemType.SERVICE_PAGE) payload.hizmetId = null;
    if (payload.itemType !== MenuItemType.LINK) payload.linkUrl = null;

    const apiUrl = editingItem
      ? `/api/admin/footer-menu-items/${editingItem.id}`
      : `/api/admin/footer-menus/${menuId}/items`;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Menü öğesi kaydedilemedi.');
      }
      toast.success(`Menü öğesi başarıyla ${editingItem ? 'güncellendi' : 'oluşturuldu'}.`);
      setIsItemDialogOpen(false);
      fetchData(); // fetchData çağır
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Bu menü öğesini silmek istediğinizden emin misiniz?")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/footer-menu-items/${itemId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Menü öğesi silinemedi.');
      }
      toast.success("Menü öğesi başarıyla silindi.");
      fetchData(); // fetchData çağır
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Footer için sürükle-bırak genellikle gerekmez, basit tablo yeterli.

  if (isLoading) return <p className="text-center py-10">Yükleniyor...</p>;
  if (error) return <p className="text-center py-10 text-red-500">Hata: {error}</p>;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">
          Footer Menü Öğeleri: {footerMenu?.name || 'Yükleniyor...'}
        </h1>
        <Button onClick={openNewItemDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Yeni Menü Öğesi Ekle
        </Button>
      </div>
      <div className="mb-6">
          <Link href="/admin/footer-menus" className="text-sm text-blue-600 hover:underline">
              &larr; Footer Menü Gruplarına Geri Dön
          </Link>
      </div>

      {menuItems.length === 0 ? (
        <p>Bu menü grubu için henüz öğe eklenmemiş.</p>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sıra</TableHead>
                <TableHead>Başlık ({activeLanguages.find(d=>d.code === currentLanguage)?.name || currentLanguage})</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Aktif mi?</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => {
                 const translation = item.translations.find(t => t.languageCode === currentLanguage) || item.translations[0];
                 return (
                    <TableRow key={item.id}>
                        <TableCell>{item.order}</TableCell>
                        <TableCell>{translation?.title || 'Başlık Yok'}</TableCell>
                        <TableCell>{ItemTypes.find(it => it.value === item.itemType)?.label || item.itemType}</TableCell>
                        <TableCell>{item.isActive ? 'Evet' : 'Hayır'}</TableCell>
                        <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditItemDialog(item)}>
                            <Edit className="mr-1 h-4 w-4" /> Düzenle
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Sil
                        </Button>
                        </TableCell>
                    </TableRow>
                 );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* MenuItem Create/Edit Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Menü Öğesini Düzenle' : 'Yeni Menü Öğesi Ekle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemDialogSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div>
              <Label htmlFor="itemType">Öğe Tipi</Label>
              <Select
                name="itemType"
                value={itemFormData.itemType}
                onValueChange={(value) => handleSelectChange('itemType', value)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ItemTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {itemFormData.itemType === MenuItemType.LINK && (
              <div>
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input name="linkUrl" value={itemFormData.linkUrl || ''} onChange={handleInputChange} placeholder="https://example.com" />
              </div>
            )}
              {itemFormData.itemType === MenuItemType.BLOG_POST && (
                <div>
                  <Label htmlFor="blogPostId">Blog Yazısı Seç</Label>
                   <Select
                    name="blogPostId"
                    value={itemFormData.blogPostId || ''}
                    onValueChange={(value) => handleSelectChange('blogPostId', value)}
                    disabled={isLookupLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLookupLoading ? "Yükleniyor..." : "Blog Seçin"} />
                    </SelectTrigger>
                    <SelectContent>
                      {blogLookup.map(blog => (
                        <SelectItem key={blog.id} value={blog.id}>{blog.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {itemFormData.itemType === MenuItemType.SERVICE_PAGE && (
                <div>
                  <Label htmlFor="hizmetId">Hizmet Sayfası Seç</Label>
                  <Select
                    name="hizmetId"
                    value={itemFormData.hizmetId || ''}
                    onValueChange={(value) => handleSelectChange('hizmetId', value)}
                    disabled={isLookupLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLookupLoading ? "Yükleniyor..." : "Hizmet Seçin"} />
                    </SelectTrigger>
                    <SelectContent>
                      {hizmetLookup.map(hizmet => (
                        <SelectItem key={hizmet.id} value={hizmet.id}>{hizmet.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            <div className="space-y-2 pt-2">
              <Label>Çeviriler</Label>
              {activeLanguages.map(lang => ( // Aktif dilleri kullan
                <div key={lang.code}>
                  <Label htmlFor={`title-${lang.code}`} className="text-sm font-normal">{lang.name} Başlık</Label>
                  <Input
                    id={`title-${lang.code}`}
                    value={itemFormData.translations?.find(t => t.languageCode === lang.code)?.title || ''}
                    onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
                    placeholder={`${lang.name} için başlık`}
                  />
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="order">Sıra</Label>
              <Input name="order" type="number" value={itemFormData.order || 0} onChange={handleInputChange} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="openInNewTab" name="openInNewTab" checked={itemFormData.openInNewTab} onCheckedChange={(checked) => setItemFormData(prev => ({...prev, openInNewTab: checked}))} />
              <Label htmlFor="openInNewTab">Yeni Sekmede Aç</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" name="isActive" checked={itemFormData.isActive} onCheckedChange={(checked) => setItemFormData(prev => ({...prev, isActive: checked}))} />
              <Label htmlFor="isActive">Aktif mi?</Label>
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">İptal</Button></DialogClose>
              <Button type="submit">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
