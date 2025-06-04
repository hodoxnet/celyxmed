'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Globe, 
  Search,
  Check,
  X,
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Language } from '@/generated/prisma/client';

interface BlogTranslation {
  id: string;
  title: string;
  fullDescription: string;
  languageCode: string;
}

interface Blog {
  id: string;
  slug: string;
  coverImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  title: string | null;
  fullDescription: string | null;
  hasTranslation: boolean;
  languageCode: string;
}

interface BlogListesiProps {
  onEditItem: (blogId: string) => void;
  onAddNewItem: () => void;
  availableLanguages: Language[];
  activeLanguageCode: string;
  refreshTrigger: number;
}

export default function BlogListesi({ 
  onEditItem, 
  onAddNewItem, 
  availableLanguages, 
  activeLanguageCode,
  refreshTrigger 
}: BlogListesiProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(activeLanguageCode);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortField, setSortField] = useState<'createdAt' | 'publishedAt' | 'title'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Blogları getir
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/blogs?lang=${selectedLanguage}`);
        if (!response.ok) throw new Error('Bloglar yüklenirken hata oluştu');
        const data = await response.json();
        setBlogs(data);
      } catch (err: any) {
        console.error('Error fetching blogs:', err);
        setError(err.message || 'Bloglar yüklenirken bir hata oluştu.');
        toast.error('Bloglar yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, [selectedLanguage, refreshTrigger]);

  // Blog silme fonksiyonu
  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/blogs/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Blog silinirken bir hata oluştu');
      
      setBlogs(prev => prev.filter(blog => blog.id !== deleteId));
      toast.success('Blog başarıyla silindi');
    } catch (err) {
      console.error('Error deleting blog:', err);
      toast.error('Blog silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Arama ve filtreleme
  const filteredBlogs = blogs.filter(blog => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (blog.title?.toLowerCase().includes(searchLower) || false) ||
      (blog.fullDescription?.toLowerCase().includes(searchLower) || false) ||
      (blog.slug?.toLowerCase().includes(searchLower) || false)
    );
  });

  // Sıralama
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (sortField === 'title') {
      const titleA = a.title || '';
      const titleB = b.title || '';
      return sortDirection === 'asc' 
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA);
    } else {
      const dateA = a[sortField] ? new Date(a[sortField] as string).getTime() : 0;
      const dateB = b[sortField] ? new Date(b[sortField] as string).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  // Sıralama değiştirme fonksiyonu
  const toggleSort = (field: 'createdAt' | 'publishedAt' | 'title') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Dil adını getir
  const getLanguageName = (code: string) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Blog Yazıları</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tüm blog yazılarınızı görüntüleyin ve yönetin
            </p>
          </div>
          <Button onClick={onAddNewItem}>
            <Plus className="mr-2 h-4 w-4" /> Yeni Blog Yazısı
          </Button>
        </div>

        {/* Filtreler ve Arama */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Blog ara..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Dil Seçin" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-16 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
              Yenile
            </Button>
          </div>
        ) : sortedBlogs.length === 0 ? (
          <div className="text-center py-10 border rounded-lg">
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Aramanızla eşleşen blog bulunamadı.' : 'Henüz blog yazısı bulunmuyor.'}
            </p>
            {searchTerm ? (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Aramayı Temizle
              </Button>
            ) : (
              <Button onClick={onAddNewItem}>
                <Plus className="mr-2 h-4 w-4" /> İlk Blog Yazınızı Ekleyin
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <button
                      onClick={() => toggleSort('title')}
                      className="flex items-center hover:text-primary"
                    >
                      Başlık
                      {sortField === 'title' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('publishedAt')}
                      className="flex items-center hover:text-primary"
                    >
                      Durum
                      {sortField === 'publishedAt' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('createdAt')}
                      className="flex items-center hover:text-primary"
                    >
                      Tarih
                      {sortField === 'createdAt' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBlogs.map((blog) => (
                  <TableRow key={blog.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {blog.coverImageUrl ? (
                          <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={blog.coverImageUrl}
                              alt={blog.title || ''}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-400 text-xs">Görsel Yok</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {blog.title || <span className="text-red-500 italic">Çeviri yok</span>}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{blog.slug}</p>
                          {!blog.hasTranslation && (
                            <Badge variant="outline" className="mt-1">
                              <Globe className="mr-1 h-3 w-3" />
                              {getLanguageName(selectedLanguage)} çevirisi eksik
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {blog.isPublished ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Check className="mr-1 h-3 w-3" />
                          Yayında
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <X className="mr-1 h-3 w-3" />
                          Taslak
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {blog.publishedAt ? (
                        <span title={`Yayın: ${new Date(blog.publishedAt).toLocaleString('tr-TR')}`}>
                          {format(new Date(blog.publishedAt), 'dd MMM yyyy', { locale: tr })}
                        </span>
                      ) : (
                        <span title={`Oluşturma: ${new Date(blog.createdAt).toLocaleString('tr-TR')}`}>
                          {format(new Date(blog.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menüyü aç</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Blog İşlemleri</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEditItem(blog.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteId(blog.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Silme Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Blog yazısını silmek istediğinizden emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem geri alınamaz. Blog yazısı ve ilişkili tüm çeviriler kalıcı olarak silinecektir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}