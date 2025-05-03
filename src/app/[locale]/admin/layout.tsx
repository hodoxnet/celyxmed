"use client";

import { AdminLayout } from "@/components/admin/layout";
import { usePathname } from "next/navigation";

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Login sayfasında default yapıyı kullan (sidebar olmadan)
  if (pathname?.includes("/admin/login")) {
    return <>{children}</>;
  }
  
  // Diğer admin sayfalarında admin layout'u kullan
  return <AdminLayout>{children}</AdminLayout>;
}
