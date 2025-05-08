"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, ArrowUpDown, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
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
import { DndProvider, useDrag, useDrop, DropTargetMonitor, DragSourceMonitor } from 'react-dnd'; // Tipleri import et
import { HTML5Backend } from 'react-dnd-html5-backend';

// Tipler (HeaderMenusPage'den kopyalanabilir veya ortak bir dosyaya taşınabilir)
interface HeaderMenuTranslation {
  languageCode: string;
  title: string;
  // Gerekirse dile özgü URL eklenebilir
}

interface HeaderMenuItemData {
  id: string;
  order: number;
  itemType: string;
  linkUrl?: string | null;
  blogPostId?: string | null;
  hizmetId?: string | null;
  openInNewTab: boolean;
  isActive: boolean;
  parentId?: string | null;
  translations: HeaderMenuTranslation[];
  children: HeaderMenuItemData[];
  headerMenuId: string; // Hangi ana menüye ait olduğu
}

interface HeaderMenuData {
  id: string;
  name: string;
}

// MenuItemType enum'ı (API ile aynı olmalı)
enum MenuItemType {
  LINK = "LINK",
  BLOG_POST = "BLOG_POST",
  SERVICE_PAGE = "SERVICE_PAGE",
}

// Dil seçenekleri (API'den de çekilebilir)
const DIL_KODLARI = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  // Projedeki diğer diller
];

const ItemTypes = [
  { value: MenuItemType.LINK, label: 'Normal Link' },
  { value: MenuItemType.BLOG_POST, label: 'Blog Yazısı' },
  { value: MenuItemType.SERVICE_PAGE, label: 'Hizmet Sayfası' },
];

// DND için tip
const DND_ITEM_TYPE = 'menuItem';

interface DraggableRowProps {
  item: HeaderMenuItemData;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number, item: HeaderMenuItemData) => void;
  onEdit: (item: HeaderMenuItemData) => void;
  onDelete: (itemId: string) => void;
  level?: number;
  currentLanguage: string;
}

const DraggableMenuItemRow: React.FC<DraggableRowProps> = ({ item, index, moveRow, onEdit, onDelete, level = 0, currentLanguage }) => {
  const ref = React.useRef<HTMLTableRowElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    collect: (monitor: DropTargetMonitor) => { // monitor tipini ekle
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(draggedItem: any, monitor: DropTargetMonitor) { // monitor tipini ekle
      if (!ref.current) return;
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex && draggedItem.parentId === item.parentId) return; // Aynı seviyede ve aynı öğe ise bir şey yapma
      
      // Sadece aynı seviyedeki (aynı parentId'ye sahip) öğeler arasında sürüklemeye izin ver
      if (draggedItem.parentId === item.parentId) {
        moveRow(dragIndex, hoverIndex, draggedItem.original);
        draggedItem.index = hoverIndex; // Sürüklenen öğenin index'ini güncelle
      }
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_ITEM_TYPE,
    item: () => ({ original: item, index, parentId: item.parentId }), // sürüklenen öğenin orijinal verisini ve parentId'sini ekle
    collect: (monitor: DragSourceMonitor) => ({ // monitor tipini ekle
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref)); // drag handle için preview'ı drop target'a bağla

  const opacity = isDragging ? 0.4 : 1;
  const translation = item.translations.find(t => t.languageCode === currentLanguage) || item.translations[0];

  return (
    <TableRow ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      <TableCell style={{ paddingLeft: `${level * 20 + 10}px` }}>
        <div className="flex items-center">
          {/* TypeScript hatasını geçici olarak çözmek için 'as any' kullanıldı */}
          <span ref={drag as any} className="cursor-move mr-2 p-1"> <GripVertical size={16} /> </span>
          {translation?.title || 'Başlık Yok'}
        </div>
      </TableCell>
      <TableCell>{ItemTypes.find(it => it.value === item.itemType)?.label || item.itemType}</TableCell>
      <TableCell>{item.isActive ? 'Evet' : 'Hayır'}</TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
          <Edit className="mr-1 h-4 w-4" /> Düzenle
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
          <Trash2 className="mr-1 h-4 w-4" /> Sil
        </Button>
      </TableCell>
    </TableRow>
  );
};


export default function HeaderMenuItemsPage() {
  const params = useParams();
  const router = useRouter();
  const menuId = params.menuId as string;

  const [menuItems, setMenuItems] = useState<HeaderMenuItemData[]>([]);
  const [headerMenu, setHeaderMenu] = useState<HeaderMenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(DIL_KODLARI[0].code); // Varsayılan dil

  // Dialog states
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeaderMenuItemData | null>(null);
  const [itemFormData, setItemFormData] = useState<Partial<HeaderMenuItemData>>({
    itemType: MenuItemType.LINK,
    linkUrl: '',
    openInNewTab: false,
    isActive: true,
    translations: DIL_KODLARI.map(lang => ({ languageCode: lang.code, title: '' })),
    parentId: null, // Ana seviye için null
  });

  const fetchMenuItems = useCallback(async () => {
    if (!menuId) return;
    setIsLoading(true);
    try {
      // Önce ana menü bilgisini al
      const menuResponse = await fetch(`/api/admin/header-menus/${menuId}`);
      if (!menuResponse.ok) throw new Error('Ana header menü bilgisi getirilemedi.');
      const menuData = await menuResponse.json();
      setHeaderMenu(menuData);

      // Sonra menü öğelerini al
      const itemsResponse = await fetch(`/api/admin/header-menus/${menuId}/items`);
      if (!itemsResponse.ok) throw new Error('Header menü öğeleri getirilemedi.');
      const itemsData = await itemsResponse.json();
      
      // API'den gelen veriyi parentId'ye göre gruplayıp iç içe yapı oluştur
      const buildHierarchy = (items: HeaderMenuItemData[], parentId: string | null = null): HeaderMenuItemData[] => {
        return items
          .filter(item => item.parentId === parentId)
          .map(item => ({ ...item, children: buildHierarchy(items, item.id) }))
          .sort((a,b) => a.order - b.order);
      };
      setMenuItems(buildHierarchy(itemsData));

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Veri getirilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

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
    setItemFormData(prev => ({
      ...prev,
      translations: prev.translations?.map(t =>
        t.languageCode === langCode ? { ...t, title: value } : t
      ) || [],
    }));
  };
  
  const openNewItemDialog = (parentId: string | null = null) => {
    setEditingItem(null);
    setItemFormData({
      itemType: MenuItemType.LINK,
      linkUrl: '',
      openInNewTab: false,
      isActive: true,
      translations: DIL_KODLARI.map(lang => ({ languageCode: lang.code, title: '' })),
      parentId: parentId,
      order: parentId ? (menuItems.find(i=>i.id === parentId)?.children?.length || 0) : (menuItems.filter(i=>!i.parentId).length || 0)
    });
    setIsItemDialogOpen(true);
  };

  const openEditItemDialog = (item: HeaderMenuItemData) => {
    setEditingItem(item);
    setItemFormData({
      ...item,
      translations: DIL_KODLARI.map(lang => {
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
      headerMenuId: menuId, // Bu öğenin hangi ana menüye ait olduğunu belirt
      translations: itemFormData.translations?.filter(t => t.title.trim() !== ''), // Sadece dolu başlıkları gönder
    };

    // itemType'a göre gereksiz ID'leri null yap
    if (payload.itemType !== MenuItemType.BLOG_POST) payload.blogPostId = null;
    if (payload.itemType !== MenuItemType.SERVICE_PAGE) payload.hizmetId = null;
    if (payload.itemType !== MenuItemType.LINK) payload.linkUrl = null;


    const apiUrl = editingItem
      ? `/api/admin/header-menu-items/${editingItem.id}`
      : `/api/admin/header-menus/${menuId}/items`;
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
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Bu menü öğesini silmek istediğinizden emin misiniz? Alt öğeleri de silinecektir.")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/header-menu-items/${itemId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Menü öğesi silinemedi.');
      }
      toast.success("Menü öğesi başarıyla silindi.");
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number, draggedItemOriginal: HeaderMenuItemData) => {
      // Bu fonksiyon, öğelerin sıralamasını güncellemek için API çağrısı yapmalı.
      // Şimdilik sadece state'i güncelliyoruz, idealde backend'e order bilgisi gönderilmeli.
      console.log("Move row", dragIndex, hoverIndex, draggedItemOriginal);
      
      setMenuItems((prevItems) => {
        const newItems = [...prevItems]; // Ana listeyi kopyala
        
        // Sürüklenen öğeyi ve hedef öğeyi bulmak için daha karmaşık bir mantık gerekebilir
        // Eğer iç içe listeler varsa, doğru listeyi bulup güncellemek lazım.
        // Bu örnek şimdilik sadece en üst seviye için çalışır.
        // Gerçek bir implementasyon için, öğenin parentId'sine göre doğru alt listeyi bulup
        // o liste içinde sıralama yapılmalı.

        // Basit bir üst seviye sıralama (parentId'si aynı olanlar için)
        const itemsToReorder = newItems.filter(item => item.parentId === draggedItemOriginal.parentId);
        const otherItems = newItems.filter(item => item.parentId !== draggedItemOriginal.parentId);

        if (itemsToReorder.length > 1) {
            const [movedItem] = itemsToReorder.splice(dragIndex, 1);
            itemsToReorder.splice(hoverIndex, 0, movedItem);
        }
        
        // Sıralanmış öğeleri ve diğerlerini birleştir
        const finalItems = [...otherItems, ...itemsToReorder].sort((a,b) => (a.parentId || "").localeCompare(b.parentId || "") || a.order - b.order);
        // TODO: API'ye yeni sıralamayı kaydetmek için çağrı yapılmalı.
        // Örneğin: await api.updateItemOrder(movedItem.id, hoverIndex, parentId);
        return finalItems; // Bu state güncellemesi DND için yeterli olmayabilir, daha sofistike bir state yönetimi gerekebilir.
                           // Özellikle iç içe yapılarda.
      });
    },
    [] // menuItems bağımlılığı sorun yaratabilir, dikkatli olunmalı.
  );

  const renderMenuItems = (items: HeaderMenuItemData[], level = 0): JSX.Element[] => {
    return items.map((item, index) => (
      <React.Fragment key={item.id}>
        <DraggableMenuItemRow
          item={item}
          index={index} // Bu index, mevcut 'items' listesindeki index olmalı
          moveRow={moveRow}
          onEdit={openEditItemDialog}
          onDelete={handleDeleteItem}
          level={level}
          currentLanguage={currentLanguage}
        />
        {item.children && item.children.length > 0 && (
          renderMenuItems(item.children, level + 1)
        )}
      </React.Fragment>
    ));
  };


  if (isLoading) return <p className="text-center py-10">Yükleniyor...</p>;
  if (error) return <p className="text-center py-10 text-red-500">Hata: {error}</p>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">
            Header Menü Öğeleri: {headerMenu?.name || 'Yükleniyor...'}
          </h1>
          <Button onClick={() => openNewItemDialog(null)}>
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Ana Menü Öğesi Ekle
          </Button>
        </div>
        <div className="mb-6">
            <Link href="/admin/header-menus" className="text-sm text-blue-600 hover:underline">
                &larr; Header Menü Listesine Geri Dön
            </Link>
        </div>
        
        {/* Dil seçimi eklenebilir */}
        {/* <div className="mb-4">
            <Label htmlFor="languageSelect">Görüntüleme Dili:</Label>
            <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                <SelectTrigger id="languageSelect" className="w-[180px]">
                    <SelectValue placeholder="Dil Seçin" />
                </SelectTrigger>
                <SelectContent>
                    {DIL_KODLARI.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div> */}


        {menuItems.length === 0 ? (
          <p>Bu menü için henüz öğe eklenmemiş.</p>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık ({DIL_KODLARI.find(d=>d.code === currentLanguage)?.name})</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Aktif mi?</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderMenuItems(menuItems.filter(item => !item.parentId))}
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
                  <Label htmlFor="blogPostId">Blog Yazısı ID</Label>
                  <Input name="blogPostId" value={itemFormData.blogPostId || ''} onChange={handleInputChange} placeholder="Blog ID'si" />
                  {/* Burada idealde bir blog seçici component olurdu */}
                </div>
              )}
              {itemFormData.itemType === MenuItemType.SERVICE_PAGE && (
                <div>
                  <Label htmlFor="hizmetId">Hizmet Sayfası ID</Label>
                  <Input name="hizmetId" value={itemFormData.hizmetId || ''} onChange={handleInputChange} placeholder="Hizmet ID'si" />
                  {/* Burada idealde bir hizmet seçici component olurdu */}
                </div>
              )}
              
              {/* ParentId seçimi (sadece ana seviyeye eklenmiyorsa) */}
              {/* Bu kısım daha da geliştirilebilir, mevcut öğelerden seçtirmek gibi */}
              {/* <div>
                <Label htmlFor="parentId">Üst Menü Öğesi (Boş bırakılırsa ana öğe olur)</Label>
                <Input name="parentId" value={itemFormData.parentId || ''} onChange={handleInputChange} placeholder="Üst öğe ID'si (opsiyonel)" />
              </div> */}


              <div className="space-y-2 pt-2">
                <Label>Çeviriler</Label>
                {DIL_KODLARI.map(lang => (
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
    </DndProvider>
  );
}
