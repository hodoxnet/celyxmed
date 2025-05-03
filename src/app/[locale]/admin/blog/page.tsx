"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileText, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlogPage() {
  const { status } = useSession();
  const router = useRouter();

  // Client-side authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/tr/admin/login");
    }
  }, [status, router]);

  // Yükleniyor durumu
  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
  }

  // Oturum yoksa gösterme
  if (status === "unauthenticated") {
    return null;
  }

  // Örnek blog yazıları
  const blogPosts = [
    {
      id: 1,
      title: "Sağlıklı Yaşam İpuçları",
      excerpt: "Günlük hayatınızda uygulayabileceğiniz basit ama etkili sağlıklı yaşam ipuçları.",
      publishDate: "15 Nisan 2025",
      author: "Dr. Ahmet Yılmaz",
      status: "Yayında"
    },
    {
      id: 2,
      title: "Modern Tıp Teknolojileri",
      excerpt: "Modern tıpta kullanılan yeni teknolojiler ve hastaların tedavisindeki etkileri.",
      publishDate: "10 Nisan 2025",
      author: "Dr. Ayşe Kaya",
      status: "Yayında"
    },
    {
      id: 3,
      title: "Beslenme ve Egzersiz",
      excerpt: "Doğru beslenme ve egzersiz alışkanlıklarının sağlığınız üzerindeki olumlu etkileri.",
      publishDate: "5 Nisan 2025",
      author: "Dr. Mehmet Öz",
      status: "Taslak"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Yönetimi</h1>
          <p className="text-muted-foreground">
            Blog yazılarını yönetin, düzenleyin ve yenilerini ekleyin.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Yeni Blog Yazısı
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Yazıları</CardTitle>
          <CardDescription>
            Toplam {blogPosts.length} blog yazısı bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 bg-gray-100 p-4 font-medium">
              <div className="col-span-5">Başlık</div>
              <div className="col-span-3">Yazar</div>
              <div className="col-span-2">Tarih</div>
              <div className="col-span-1">Durum</div>
              <div className="col-span-1">İşlemler</div>
            </div>
            {blogPosts.map((post) => (
              <div key={post.id} className="grid grid-cols-12 gap-4 border-t p-4">
                <div className="col-span-5">
                  <div className="font-medium">{post.title}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {post.excerpt}
                  </div>
                </div>
                <div className="col-span-3 flex items-center">
                  {post.author}
                </div>
                <div className="col-span-2 flex items-center">
                  {post.publishDate}
                </div>
                <div className="col-span-1 flex items-center">
                  <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                    post.status === "Yayında" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {post.status}
                  </span>
                </div>
                <div className="col-span-1 flex items-center space-x-2">
                  <Button variant="ghost" size="icon" title="Görüntüle">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Düzenle">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Sil">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> İstatistikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Toplam Blog Yazısı</dt>
                <dd className="text-sm font-medium">{blogPosts.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Yayında</dt>
                <dd className="text-sm font-medium">
                  {blogPosts.filter(post => post.status === "Yayında").length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Taslak</dt>
                <dd className="text-sm font-medium">
                  {blogPosts.filter(post => post.status === "Taslak").length}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}