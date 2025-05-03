"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FileText,
  Mail,
  Users,
  Eye,
  Clock
} from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import { ActivityList } from "@/components/admin/activity-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
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

  const recentActivities = [
    { id: 1, title: "İletişim formu mesajı alındı", time: "1 saat önce" },
    { id: 2, title: "Yeni blog yazısı eklendi", time: "3 saat önce" },
    { id: 3, title: "Ana sayfa içeriği güncellendi", time: "5 saat önce" },
    { id: 4, title: "Galeri'ye yeni resim yüklendi", time: "9 saat önce" },
    { id: 5, title: "Hizmetler sayfası güncellendi", time: "1 gün önce" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Hoş geldiniz, CelyxMed Admin Paneline genel bakış.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Blog Yazısı"
          value="24"
          icon={FileText}
          trend="up"
          trendValue="3 yeni bu ay"
        />
        <StatCard
          title="İletişim Mesajları"
          value="12"
          icon={Mail}
          trend="up"
          trendValue="5 yeni bu hafta"
        />
        <StatCard
          title="Sayfa Ziyaretleri"
          value="2,345"
          icon={Eye}
          trend="up"
          trendValue="%12 artış"
        />
        <StatCard
          title="Toplam Kullanıcı"
          value="3"
          icon={Users}
          trend="neutral"
          trendValue="Değişiklik yok"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ziyaretçi İstatistikleri</CardTitle>
            <CardDescription>
              Son 30 günlük ziyaretçi aktivitesi
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex justify-center items-center">
            <p className="text-muted-foreground">Grafik burada görüntülenecek</p>
          </CardContent>
        </Card>

        <ActivityList
          title="Son Aktiviteler"
          activities={recentActivities}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>Sık kullanılan işlemlere hızlı erişim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a 
                href="/tr/admin/blog/yeni" 
                className="block rounded-lg border p-3 text-center hover:bg-gray-50"
              >
                Yeni Blog Yazısı Ekle
              </a>
              <a 
                href="/tr/admin/sayfalar/yeni" 
                className="block rounded-lg border p-3 text-center hover:bg-gray-50"
              >
                Yeni Sayfa Oluştur
              </a>
              <a 
                href="/tr/admin/galeri/yukle" 
                className="block rounded-lg border p-3 text-center hover:bg-gray-50"
              >
                Galeriye Resim Yükle
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yanıtlanmamış Mesajlar</CardTitle>
            <CardDescription>Son gelen iletişim formu mesajları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-medium">Ahmet Yılmaz</h3>
                <p className="text-sm text-muted-foreground truncate">
                  Hizmetleriniz hakkında bilgi almak istiyorum...
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> 2 saat önce
                </div>
              </div>
              <div className="border-b pb-2">
                <h3 className="font-medium">Ayşe Kaya</h3>
                <p className="text-sm text-muted-foreground truncate">
                  Randevu almak için sizinle iletişime geçmek istiyorum...
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> 4 saat önce
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Yayınlanan İçerikler</CardTitle>
            <CardDescription>Son eklenen blog yazıları ve sayfalar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-medium">Sağlıklı Yaşam İpuçları</h3>
                <p className="text-sm text-muted-foreground">Blog yazısı</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> 1 gün önce
                </div>
              </div>
              <div className="border-b pb-2">
                <h3 className="font-medium">Hakkımızda</h3>
                <p className="text-sm text-muted-foreground">Sayfa içeriği</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> 3 gün önce
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
