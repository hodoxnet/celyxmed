import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function adminAuthMiddleware(req: NextRequest) {
  console.log("[AdminAuth] Checking auth for admin route:", req.nextUrl.pathname);
  
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log("[AdminAuth] Token:", token ? "Mevcut" : "Yok");

    // Token yok veya role admin değilse
    if (!token || token.role !== "ADMIN") {
      console.log("[AdminAuth] Yetkisiz erişim, login sayfasına yönlendiriliyor");
      // İstek admin sayfalarına ise, login sayfasına yönlendir
      const url = new URL(`/tr/admin/login`, req.url);
      url.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(url);
    }

    console.log("[AdminAuth] Admin yetkisi doğrulandı, erişime izin verildi");
    return NextResponse.next();
  } catch (error) {
    console.error("[AdminAuth] Hata:", error);
    // Hata durumunda yine login sayfasına yönlendir
    const url = new URL(`/tr/admin/login`, req.url);
    return NextResponse.redirect(url);
  }
}

export function isAdminRoute(pathname: string): boolean {
  // /[locale]/admin/ ile başlayan ama /[locale]/admin/login olmayan tüm rotalar
  const isAdmin = pathname.includes("/admin/") && !pathname.includes("/admin/login");
  console.log(`[AdminAuth] ${pathname} admin rotası mı?`, isAdmin);
  return isAdmin;
}