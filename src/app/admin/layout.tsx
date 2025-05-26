"use client"; // Dosyayı Client Component olarak işaretle

// Bu dosya artık /admin rotaları için KÖK layout'tur.
// next-intl provider'ı BURADA KULLANILMAZ.

// import type { Metadata } from "next"; // Metadata Client Component'te kullanılamaz, kaldırıldı veya ayrı bir dosyaya taşınmalı
import { AdminLayout } from "@/components/admin/layout"; // Admin'in iç layout'u
// import { LoginLayoutContent } from "@/components/admin/login-layout-content"; // Login için ayrı içerik - KALDIRILDI (aynı dosyada tanımlı)
import { usePathname } from "next/navigation"; // Client tarafta path kontrolü için
import "../globals.css"; // Global stilleri import et

// Metadata Client Component'te kullanılamaz. 
// Eğer metadata gerekiyorsa, bu layout'u çağıran bir Server Component (örn. page.tsx) içinde tanımlanmalı
// veya generateMetadata fonksiyonu kullanılmalı. Şimdilik kaldırıyoruz.
// export const metadata: Metadata = {
//   title: "CelyxMed Admin Panel",
//   description: "CelyxMed Yönetim Paneli",
// };

// Artık tüm dosya client olduğu için ayrı wrapper'a gerek yok, doğrudan kullanabiliriz.
// function AdminRootLayoutClient({ children }: { children: React.ReactNode }) { ... }

// Login sayfası için basit bir layout içeriği (SessionProvider'ı içerebilir)
// Bu bileşeni ayrı bir dosyaya taşımak daha temiz olabilir, şimdilik burada.
function LoginLayoutContent({ children }: { children: React.ReactNode }) {
   // Login sayfası kendi SessionProvider'ını kullanıyorsa burası boş kalabilir.
   // Eğer kullanmıyorsa, SessionProvider buraya eklenebilir.
   // src/app/admin/login/layout.tsx'i kontrol edelim. Orada SessionProvider var.
   // Bu yüzden burası sadece children'ı render edebilir.
  return <>{children}</>;
}

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // usePathname artık doğrudan burada kullanılabilir
  const pathname = usePathname();

  // Login sayfası için farklı bir yapı kullan
  const content = pathname?.startsWith("/admin/login")
    ? <LoginLayoutContent>{children}</LoginLayoutContent>
    : <AdminLayout>{children}</AdminLayout>;

  return (
    <html lang="tr">
      <body className={`antialiased`}>
        {content}
      </body>
    </html>
  );
}
