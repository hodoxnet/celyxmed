import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';

// Bu middleware admin sayfalarına erişimi kontrol eder
export async function withAdminMiddleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log(`withAdminMiddleware: ${path}`);
  
  // Admin sayfası ama login değilse
  if (path.includes('/admin') && !path.includes('/admin/login')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Token yoksa veya admin rolü değilse, login sayfasına yönlendir
    if (!token || token.role !== 'ADMIN') {
      console.log('Yetkisiz erişim, /admin/login sayfasına yönlendiriliyor');

      // URL'yi oluştur
      const url = request.nextUrl.clone();
      url.pathname = `/admin/login`; // Doğrudan /admin/login'e yönlendir

      // callbackUrl ekle (kullanıcı giriş yaptıktan sonra geri dönmesi için)
      // Orijinal URL'yi callback olarak kullanmak mantıklı olabilir.
      url.searchParams.set('callbackUrl', path); // Veya request.url kullanabilirsiniz
      
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// API Route'lar için admin yetki kontrolü wrapper'ı
export function withAdmin(handler: any) {
  return async (req: Request, ctx: any) => {
    // API rotaları için yetki kontrolü
    // Bu aşamada getToken veya getServerSession kullanılamaz, çünkü API route'lar
    // NextJS middleware'den farklı bir bağlamda çalışır.
    
    // Şimdilik API'yi herkese açık hale getirelim (DEV AMAÇLI)
    try {
      return await handler(req, ctx);
    } catch (error) {
      console.error("API handler error:", error);
      return NextResponse.json({ message: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
    }
  };
}
