"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Plus,
  Settings,
  BookOpen,
  PenTool,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import BlogListesi from "./components/BlogListesi";
import BlogFormu from "./components/BlogFormu";
import { Language } from "@/generated/prisma/client";

interface BlogModule {
  id: string;
  title: string;
  icon: React.ElementType;
  description?: string;
}

const modules: BlogModule[] = [
  { id: "blog-list", title: "Blog Listesi ve Yönetimi", icon: FileText, description: "Tüm blog yazılarını görüntüleyin ve yönetin" },
  { id: "blog-add", title: "Yeni Blog Yazısı", icon: Plus, description: "Blog içeriği, kapak görseli ve yayın durumu" },
];

export default function BlogYonetimiPage() {
  const searchParams = useSearchParams();
  const [selectedModule, setSelectedModule] = useState<BlogModule | null>(modules[0] || null);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [activeLanguageCode, setActiveLanguageCode] = useState<string>("");
  const [progress, setProgress] = useState(0);

  // Blog formu için state'ler
  const [blogFormView, setBlogFormView] = useState<'list' | 'form'>('list');
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogListRefreshTrigger, setBlogListRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoadingLanguages(true);
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error('Diller yüklenemedi.');
        const data = await response.json();
        const activeLangs = data.filter((lang: any) => lang.isActive);
        setAvailableLanguages(activeLangs);
        if (activeLangs.length > 0) {
          const defaultLang = activeLangs.find((lang: Language) => lang.isDefault);
          setActiveLanguageCode(defaultLang?.code || activeLangs[0].code);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Diller yüklenirken bir hata oluştu.');
      } finally {
        setLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

  // Query parameter'leri işle
  useEffect(() => {
    const moduleParam = searchParams.get('module');
    const editParam = searchParams.get('edit');
    
    if (moduleParam) {
      const module = modules.find(m => m.id === moduleParam);
      if (module) {
        setSelectedModule(module);
        if (moduleParam === 'blog-add') {
          setBlogFormView('form');
          setEditingBlogId(editParam);
        }
      }
    }
  }, [searchParams]);

  const handleModuleSelect = (module: BlogModule) => {
    setSelectedModule(module);
    if (module.id === 'blog-list') setBlogFormView('list');
    if (module.id === 'blog-add') {
      setEditingBlogId(null);
      setBlogFormView('form');
    }
  };

  const handleEditBlog = (blogId: string) => {
    setEditingBlogId(blogId);
    setBlogFormView('form');
    setSelectedModule(modules.find(m => m.id === 'blog-add') || modules[1]);
  };

  const handleAddNewBlog = () => {
    setEditingBlogId(null);
    setBlogFormView('form');
    setSelectedModule(modules.find(m => m.id === 'blog-add') || modules[1]);
  };

  const handleBlogFormSuccess = () => {
    setBlogFormView('list');
    setBlogListRefreshTrigger(p => p + 1);
    setSelectedModule(modules[0]);
  };

  const handleBlogFormCancel = () => {
    setBlogFormView('list');
    setEditingBlogId(null);
    setSelectedModule(modules[0]);
  };

  const renderModuleContent = () => {
    if (!selectedModule) {
      return (
        <Card className="flex items-center justify-center h-64">
          <div className="text-center p-6">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Blog Yönetimi</h3>
            <p className="text-muted-foreground">Düzenlemek için modül seçin</p>
          </div>
        </Card>
      );
    }
    
    if (loadingLanguages) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">Diller ve modül içeriği yükleniyor...</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (availableLanguages.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-2 text-red-600">
                <h3 className="font-medium">Aktif dil bulunamadı</h3>
              </div>
              <p className="text-sm text-red-600">Lütfen yönetim panelinden en az bir dili aktif hale getirin.</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (!activeLanguageCode) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">Aktif dil kodu ayarlanıyor...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const propsWithLang = { availableLanguages, activeLanguageCode };

    switch (selectedModule.id) {
      case 'blog-list':
        return (
          <BlogListesi
            onEditItem={handleEditBlog}
            onAddNewItem={handleAddNewBlog}
            refreshTrigger={blogListRefreshTrigger}
            {...propsWithLang}
          />
        );
      case 'blog-add':
        return (
          <BlogFormu
            onSubmitSuccess={handleBlogFormSuccess}
            onCancel={handleBlogFormCancel}
            blogIdToEdit={editingBlogId}
            {...propsWithLang}
          />
        );
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-700">`{selectedModule.title}` için yönetim arayüzü burada görünecek.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Blog Yönetimi</h2>
        <p className="text-muted-foreground">Blog yazılarını yönetin ve düzenleyin.</p>
      </div>
    
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{selectedModule?.title || "Blog Yönetimi"}</CardTitle>
              <CardDescription>
                {selectedModule?.description || "Lütfen düzenlemek istediğiniz modülü seçin"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* İlerleme çubuğu */}
            <div className="flex items-center">
              <Progress value={progress} className="w-full" />
              <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">
                %{progress}
              </span>
            </div>
            
            {/* Dil Seçimi - Sadece blog formu için */}
            {selectedModule?.id === 'blog-add' && availableLanguages.length > 0 && activeLanguageCode && (
              <Tabs value={activeLanguageCode} onValueChange={setActiveLanguageCode} className="w-full">
                <TabsList className="grid w-full grid-cols-none sm:grid-cols-auto sm:inline-flex">
                  {availableLanguages.map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code} className="px-4 py-2 text-sm">
                      {lang.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sol taraf - Modül listesi */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Modüller</CardTitle>
              <CardDescription className="text-sm">
                Düzenlemek için modül seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {modules.map((module) => {
                const IconComponent = module.icon;
                const isActive = selectedModule?.id === module.id;
                return (
                  <div 
                    key={module.id}
                    className={`rounded-lg border border-gray-200 shadow-sm overflow-hidden ${isActive ? 'ring-2 ring-primary' : ''} 
                      hover:border-primary/70 hover:bg-gray-50 cursor-pointer transition-all duration-200`}
                    onClick={() => handleModuleSelect(module)}
                  >
                    <div className="flex items-center p-3">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{module.title}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sağ taraf - İçerik alanı */}
        <div className="md:col-span-3">
          {renderModuleContent()}
        </div>
      </div>
    </div>
  );
}