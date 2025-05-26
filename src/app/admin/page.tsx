"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileText,
  Mail,
  Users,
  Eye,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Home,
  Briefcase
} from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import { ActivityList } from "@/components/admin/activity-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  blogCount: number;
  blogTrend: number;
  messageCount: number;
  messageTrend: number;
  userCount: number;
  hizmetCount: number;
  hizmetTrend: number;
  pageViews: number;
  pageViewsTrend: number;
}

interface RecentBlog {
  id: string;
  title: string;
  createdAt: string;
}

interface RecentMessage {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface Activity {
  id: number;
  title: string;
  time: string;
}

export default function AdminPage() {
  const { status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<RecentBlog[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Client-side authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Verileri yükle
  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      // İstatistikleri al
      const statsRes = await fetch('/api/admin/dashboard/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Son blogları al
      const blogsRes = await fetch('/api/admin/dashboard/recent-blogs');
      const blogsData = await blogsRes.json();
      setRecentBlogs(blogsData);

      // Son mesajları al (şimdilik statik)
      setRecentMessages([
        {
          id: '1',
          name: 'Ahmet Yılmaz',
          message: 'Hizmetleriniz hakkında bilgi almak istiyorum...',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'Ayşe Kaya',
          message: 'Randevu almak için sizinle iletişime geçmek istiyorum...',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ]);

      // Aktiviteleri oluştur
      const newActivities: Activity[] = [];
      
      // Son blogları aktiviteye ekle
      blogsData.slice(0, 3).forEach((blog: RecentBlog, index: number) => {
        newActivities.push({
          id: index + 1,
          title: `"${blog.title}" blog yazısı eklendi`,
          time: formatTimeAgo(blog.createdAt)
        });
      });

      setActivities(newActivities);
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} gün önce`;
    } else if (diffInHours > 0) {
      return `${diffInHours} saat önce`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} dakika önce`;
    }
  };

  // Yükleniyor durumu
  if (status === "loading" || loading) {
    return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
  }

  // Oturum yoksa gösterme
  if (status === "unauthenticated") {
    return null;
  }

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
          value={stats?.blogCount.toString() || "0"}
          icon={FileText}
          trend={stats?.blogTrend && stats.blogTrend > 0 ? "up" : stats?.blogTrend && stats.blogTrend < 0 ? "down" : "neutral"}
          trendValue={stats?.blogTrend ? `${Math.abs(stats.blogTrend)} yeni bu ay` : "Veri yok"}
        />
        <StatCard
          title="Toplam Hizmet"
          value={stats?.hizmetCount.toString() || "0"}
          icon={Briefcase}
          trend={stats?.hizmetTrend && stats.hizmetTrend > 0 ? "up" : "neutral"}
          trendValue={stats?.hizmetTrend ? `${stats.hizmetTrend} yeni` : "Değişiklik yok"}
        />
        <StatCard
          title="Sayfa Ziyaretleri"
          value={stats?.pageViews ? stats.pageViews.toLocaleString('tr-TR') : "0"}
          icon={Eye}
          trend={stats?.pageViewsTrend && stats.pageViewsTrend > 0 ? "up" : stats?.pageViewsTrend && stats.pageViewsTrend < 0 ? "down" : "neutral"}
          trendValue={stats?.pageViewsTrend ? `%${stats.pageViewsTrend} değişim` : "Veri yok"}
        />
        <StatCard
          title="Toplam Yönetici"
          value={stats?.userCount.toString() || "0"}
          icon={Users}
          trend="neutral"
          trendValue="Aktif kullanıcılar"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Site İstatistikleri</CardTitle>
            <CardDescription>
              Genel site performansı ve içerik özeti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Aktif Sayfalar</span>
                </div>
                <span className="text-2xl font-bold">7</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Yayınlanmış Bloglar</span>
                </div>
                <span className="text-2xl font-bold">{stats?.blogCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Aktif Hizmetler</span>
                </div>
                <span className="text-2xl font-bold">{stats?.hizmetCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Dil Seçenekleri</span>
                </div>
                <span className="text-2xl font-bold">7</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <ActivityList
          title="Son Aktiviteler"
          activities={activities}
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
                href="/admin/blog/yeni" 
                className="block rounded-lg border p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Yeni Blog Yazısı Ekle
              </a>
              <a 
                href="/admin/hizmetler/yeni" 
                className="block rounded-lg border p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Yeni Hizmet Ekle
              </a>
              <a 
                href="/admin/about-page/gallery" 
                className="block rounded-lg border p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Galeriye Resim Yükle
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Mesajlar</CardTitle>
            <CardDescription>İletişim formu mesajları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="border-b pb-2 last:border-0">
                  <h3 className="font-medium">{message.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {message.message}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {formatTimeAgo(message.createdAt)}
                  </div>
                </div>
              ))}
              {recentMessages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz mesaj yok
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Yayınlanan İçerikler</CardTitle>
            <CardDescription>Son eklenen blog yazıları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBlogs.map((blog) => (
                <div key={blog.id} className="border-b pb-2 last:border-0">
                  <h3 className="font-medium truncate">{blog.title}</h3>
                  <p className="text-sm text-muted-foreground">Blog yazısı</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {formatTimeAgo(blog.createdAt)}
                  </div>
                </div>
              ))}
              {recentBlogs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz blog yazısı yok
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}