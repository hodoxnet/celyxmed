"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Skeleton eklendi

interface BlogData {
  id: string;
  slug: string | null; // API'den null gelebilir
  title: string | null; // API'den null gelebilir
  fullDescription: string | null; // API'den null gelebilir
  coverImageUrl: string | null;
  publishedAt: string | null;
  languageCode: string;
}

const BlogPreview = () => {
  const locale = useLocale();
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/blogs/${locale}`);
        if (!response.ok) {
          throw new Error('Blog yazıları getirilemedi.');
        }
        const data: BlogData[] = await response.json();
        // Sadece ilk 3 blogu alalım (tasarımda genellikle sınırlı sayıda gösterilir)
        setBlogs(data.slice(0, 3));
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu.');
        console.error("Error fetching blogs for preview:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [locale]);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-1/2 mb-8 md:mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col overflow-hidden group p-0">
                <Skeleton className="relative w-full aspect-[16/10]" />
                <CardContent className="p-4 flex-grow">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-5 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Hata: {error}</p>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center md:text-left mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-800">
              Celyxmed Blog: Your Health Journey
            </h2>
          </div>
          <p className="text-center text-gray-500">Henüz gösterilecek blog yazısı bulunmuyor.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center md:text-left mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800">
            Celyxmed Blog: Your Health Journey
          </h2>
          {/* İsteğe bağlı olarak tüm blog sayfasına link eklenebilir */}
          {/* <Button variant="link" asChild className="mt-2">
            <Link href={`/${locale}/blog`}>View All Posts <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogs.map((post) => {
            // API'den gelen slug veya title null ise bu kartı render etme veya varsayılan değer ata
            if (!post.slug || !post.title) {
              // Veya bir placeholder kart gösterilebilir
              return null; 
            }
            const postLink = `/${locale}/blog/${post.slug}`;
            return (
              <Card key={post.id} className="flex flex-col overflow-hidden group p-0">
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                    <Link href={postLink} className="block absolute inset-0 z-10">
                       <span className="sr-only">Yazıyı oku: {post.title}</span>
                    </Link>
                    {post.coverImageUrl ? (
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title || 'Blog görseli'}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Görsel Yok</span>
                      </div>
                    )}
                </div>
                <CardContent className="p-4 flex-grow">
                  <Link href={postLink} className="block">
                    <CardTitle className="text-lg font-semibold mb-2 text-gray-800 hover:text-cyan-600 transition-colors">
                      {post.title}
                    </CardTitle>
                  </Link>
                  <CardDescription className="text-gray-600 text-sm line-clamp-3">
                    {post.fullDescription || 'Açıklama bulunmuyor.'}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button variant="link" asChild className="p-0 h-auto text-cyan-600 hover:text-cyan-700">
                    <Link href={postLink}>
                      Read More
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
