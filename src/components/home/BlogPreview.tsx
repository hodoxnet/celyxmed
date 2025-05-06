"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button'; // "Read More" için
import { ArrowRight } from 'lucide-react'; // Ok ikonu için

// Örnek blog yazısı verileri (index.html'den)
const blogPosts = [
  {
    title: "Does Every Person Have Wisdom Teeth? Functions & Removals",
    description: "Does every person have wisdom teeth is a frequently asked question in dental health, especially as more individuals experience issues related to these third molars...", // Kısaltılmış açıklama
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a584113632/67e6eaa71d18c683d18cda0d_ChatGPT%20Image%2028%20Mar%202025%2021_29_55.png",
    link: "/blog/wisdom-teeth-functions-removal"
  },
  {
    title: "Difference Between Gynecomastia vs Fat: What Do I Have",
    description: "Gynecomastia vs fat is a common concern for men experiencing noticeable changes in their chest appearance. While both conditions can cause chest enlargement...", // Kısaltılmış açıklama
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a584113632/67e6e769ce9e9613983aac03_28%20Mar%202025%2021_16_03.png",
    link: "/blog/difference-gynecomastia-vs-fat"
  },
  {
    title: "Did You Realize Alexander Garnacho's New Teeth?",
    description: "Garnacho teeth have recently become a topic of interest as Alexander Garnacho debuts a noticeably brighter and more refined smile...", // Kısaltılmış açıklama
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a584113632/67e6e476c302efba8bc1fcf2_alexander-garnacho-new-teeth.png",
    link: "/blog/alexander-garnacho-new-teeth"
  }
];

const BlogPreview = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center md:text-left mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800">
            Celyxmed Blog: Your Health Journey
          </h2>
          {/* İsteğe bağlı olarak tüm blog sayfasına link eklenebilir */}
          {/* <Button variant="link" asChild className="mt-2">
            <Link href="/blog">View All Posts <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogPosts.map((post) => (
            <Card key={post.title} className="flex flex-col overflow-hidden group p-0"> {/* Kartın kendi padding'ini sıfırla */}
              {/* CardHeader kaldırıldı, resim container'ı doğrudan Card içine alındı */}
              {/* Resim container'ı için aspect ratio ve overflow hidden */}
              <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <Link href={post.link} className="block absolute inset-0 z-10">
                     <span className="sr-only">Yazıyı oku: {post.title}</span>
                  </Link>
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill // layout="fill" yerine fill prop'u
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive boyutlar için sizes prop'u
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
              </div>
              {/* CardHeader kaldırıldı */}
              <CardContent className="p-4 flex-grow">
                <Link href={post.link} className="block">
                  <CardTitle className="text-lg font-semibold mb-2 text-gray-800 hover:text-cyan-600 transition-colors">
                    {post.title}
                  </CardTitle>
                </Link>
                <CardDescription className="text-gray-600 text-sm line-clamp-3"> {/* Açıklamayı 3 satırla sınırla */}
                  {post.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="link" asChild className="p-0 h-auto text-cyan-600 hover:text-cyan-700">
                  <Link href={post.link}>
                    Read More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
