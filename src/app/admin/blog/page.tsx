"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Globe, 
  Search,
  Check,
  X,
  ArrowUpDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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

// Blog tipi
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [languages, setLanguages] = useState<{code: string, name: string}[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('tr'); // Varsayılan dil
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortField, setSortField] = useState<'createdAt' | 'publishedAt' | 'title'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const router = useRouter();

  // Dilleri getir
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error('Diller yüklenirken hata oluştu');
        const data = await response.json();
        setLanguages(data);
      } catch (err) {
        console.error('Error fetching languages:', err);
        toast.error('Diller yüklenirken bir hata oluştu.');
      }
    };
    fetchLanguages();
  }, []);

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
  }, [selectedLanguage]);

  // Blog silme fonksiyonu
  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/blogs/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Blog silinirken bir hata oluştu');
      
      // Silinen blogu listeden kaldır
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
      blog.slug.toLowerCase().includes(searchLower)
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
      setSortDirection('desc'); // Yeni alan seçildiğinde varsayılan olarak desc
    }
  };

  // Dil adını getir
  const getLanguageName = (code: string) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Blog Yazıları</h1>
        <Button onClick={() => router.push('/admin/blog/ekle')}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Blog Yazısı Ekle
        </Button>
      </div>

      {/* Filtreler ve Arama */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
              {languages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Blog Listesi */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-[150px] h-[80px]">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-7 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="w-[100px] flex-shrink-0">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" onClick={() => router.refresh()} className="mt-4">
            Yenile
          </Button>
        </div>
      ) : sortedBlogs.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Aramanızla eşleşen blog bulunamadı.' : 'Henüz blog yazısı bulunmuyor.'}
          </p>
          {searchTerm && (
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Aramayı Temizle
            </Button>
          )}
        </div>
      ) : (
        <div>
          {/* Tablo başlıkları */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100 rounded-t-lg font-medium text-sm">
            <div className="col-span-6" onClick={() => toggleSort('title')}>
              <div className="flex items-center cursor-pointer">
                <span>Başlık</span>
                {sortField === 'title' && (
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </div>
            <div className="col-span-2" onClick={() => toggleSort('publishedAt')}>
              <div className="flex items-center cursor-pointer">
                <span>Durum</span>
                {sortField === 'publishedAt' && (
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </div>
            <div className="col-span-2" onClick={() => toggleSort('createdAt')}>
              <div className="flex items-center cursor-pointer">
                <span>Tarih</span>
                {sortField === 'createdAt' && (
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </div>
            <div className="col-span-2 text-right">İşlemler</div>
          </div>

          {/* Blog satırları */}
          <div className="rounded-b-lg border">
            {sortedBlogs.map((blog) => (
              <div
                key={blog.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 items-center"
              >
                {/* Blog kapak resmi ve başlık (mobilde görünecek) */}
                <div className="md:col-span-6 flex items-center gap-4">
                  {blog.coverImageUrl ? (
                    <div className="w-[80px] h-[60px] bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={blog.coverImageUrl}
                        alt={blog.title || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-[80px] h-[60px] bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400 text-sm">Görsel Yok</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {blog.title || <span className="text-red-500 italic">Çeviri yok</span>}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{blog.slug}</p>
                    {!blog.hasTranslation && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        <Globe className="mr-1 h-3 w-3" />
                        {getLanguageName(selectedLanguage)} çevirisi eksik
                      </span>
                    )}
                  </div>
                </div>

                {/* Durum (yayın durumu) */}
                <div className="md:col-span-2 flex items-center">
                  {blog.isPublished ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <Check className="mr-1 h-3 w-3" />
                      Yayında
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      <X className="mr-1 h-3 w-3" />
                      Taslak
                    </span>
                  )}
                </div>

                {/* Tarih */}
                <div className="md:col-span-2 text-sm text-gray-500">
                  {blog.publishedAt ? (
                    <span title={`Yayın: ${new Date(blog.publishedAt).toLocaleString('tr-TR')}`}>
                      {format(new Date(blog.publishedAt), 'dd MMM yyyy', { locale: tr })}
                    </span>
                  ) : (
                    <span title={`Oluşturma: ${new Date(blog.createdAt).toLocaleString('tr-TR')}`}>
                      {format(new Date(blog.createdAt), 'dd MMM yyyy', { locale: tr })}
                    </span>
                  )}
                </div>

                {/* İşlemler */}
                <div className="md:col-span-2 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menüyü aç</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                          <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Blog İşlemleri</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/admin/blog/${blog.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/blog/${blog.slug}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Önizleme
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
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
}