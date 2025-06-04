"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function BlogEditRedirectPage() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    // Yeni blog yönetimi sayfasına yönlendir
    // Blog ID'sini query parameter olarak gönder ki edit modunda açılsın
    const blogId = params.id as string;
    
    if (blogId === 'ekle') {
      // Yeni blog ekleme
      router.replace('/admin/blog?module=blog-add');
    } else {
      // Mevcut blog düzenleme
      router.replace(`/admin/blog?module=blog-add&edit=${blogId}`);
    }
  }, [router, params.id]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Blog yönetimi sayfasına yönlendiriliyor...</p>
      </div>
    </div>
  );
}