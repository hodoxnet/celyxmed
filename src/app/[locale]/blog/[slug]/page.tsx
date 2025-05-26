import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

// Client Component'ı dinamik olarak import ediyoruz
const BlogDetailContent = dynamic(() => import('./BlogDetailContent'), { 
  ssr: true,
  loading: () => (
    <div className="container mx-auto px-4 min-h-[50vh] flex justify-center items-center">
      <p>Yükleniyor...</p>
    </div>
  )
});

// Metadata tipi
type Props = {
  params: Promise<{ locale: string; slug: string }>
}

// Dinamik metadata oluşturma
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale, slug } = await params;

  // Varsayılan meta değerlerini belirle
  let title = 'Blog';
  let description = '';
  let siteName = 'Celyxmed';

  try {
    // Ana site adını parent'dan al
    const parentMetadata = await parent;
    siteName = parentMetadata.title?.absolute || 'Celyxmed';

    // Blog verisini getir
    const blogTranslation = await prisma.blogTranslation.findFirst({
      where: {
        slug: slug,
        languageCode: locale,
      },
      include: {
        blog: {
          select: {
            isPublished: true,
          },
        },
      },
    });

    // Blog varsa ve yayınlandıysa metadata'yı ayarla
    if (blogTranslation && blogTranslation.blog.isPublished) {
      title = blogTranslation.title;
      description = blogTranslation.fullDescription;
    }
  } catch (error) {
    console.error("Error fetching blog metadata:", error);
  }

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      siteName: siteName,
      locale: locale,
      type: 'article',
    },
  };
}

// Blog sayfasının ana bileşeni
export default async function BlogDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  
  // Veritabanında blog kaydını kontrol et
  const blogTranslation = await prisma.blogTranslation.findFirst({
    where: {
      slug: slug,
      languageCode: locale,
    },
    include: {
      blog: {
        select: {
          id: true,
          isPublished: true,
        },
      },
    },
  });

  // Blog bulunamazsa veya yayınlanmamışsa 404 döndür
  if (!blogTranslation || !blogTranslation.blog.isPublished) {
    return notFound();
  }

  // Client bileşene blog ID'sini ve locale'yi gönder
  return (
    <main className="pb-8 pt-56">
      <BlogDetailContent blogId={blogTranslation.blog.id} locale={locale} slug={slug} />
    </main>
  );
}