import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
      console.log('Yetkisiz erişim, login sayfasına yönlendiriliyor');
      
      // URL'yi oluştur
      const url = request.nextUrl.clone();
      
      // Dil kodunu koru
      const locale = path.split('/')[1];
      url.pathname = `/${locale}/admin/login`;
      
      // callbackUrl'e yönlendir
      url.searchParams.set('callbackUrl', request.url);
      
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}