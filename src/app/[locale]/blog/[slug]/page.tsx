"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import WhyTrustSection from '@/components/home/WhyTrustSection';
import ClinicShowcase from '@/components/home/ClinicShowcase';
import BlogPreview from '@/components/home/BlogPreview';
import { useParams } from 'next/navigation';

// Blog veri tipi tanımı
interface BlogData {
  id: string;
  slug: string;
  title: string;
  fullDescription: string;
  content: string;
  tocItems: TocItem[] | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  languageCode: string;
}

// İçindekiler öğesi tipi tanımı
interface TocItem {
  id: string;
  text: string;
  isBold?: boolean;
  level?: number;
}

const BlogDetailPage = () => {
  const [tocOpen, setTocOpen] = useState(true);
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const { locale, slug } = params;

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/blogs/${locale}/${slug}`);
        
        if (!response.ok) {
          throw new Error('Blog yazısı bulunamadı');
        }
        
        const data = await response.json();
        setBlogData(data);
        setError(null);
      } catch (err) {
        console.error('Blog yazısı yüklenirken bir hata oluştu:', err);
        setError('Blog yazısı yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (locale && slug) {
      fetchBlogData();
    }
  }, [locale, slug]);

  // Yükleme durumu
  if (loading) {
    return (
      <main className="pb-8 pt-56">
        <div className="container mx-auto px-4 min-h-[50vh] flex justify-center items-center">
          <p>Yükleniyor...</p>
        </div>
      </main>
    );
  }

  // Hata durumu
  if (error || !blogData) {
    return (
      <main className="pb-8 pt-56">
        <div className="container mx-auto px-4 min-h-[50vh] flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold mb-4">Bir hata oluştu</h1>
          <p>{error || 'Blog yazısı bulunamadı'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-8 pt-56"> 
      <div className="container mx-auto px-4">
        {/* İlk görünüm - Ekranı kaplayan bölüm */}
        <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center">
          {/* Blog Başlığı - Ortalanmış ve büyütülmüş */}
          <section className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-10 text-slate-800">{blogData.title}</h1>
            
            {/* Uzun açıklama */}
            <p className="text-base text-slate-700 leading-relaxed mb-8">
              {blogData.fullDescription}
            </p>
          </section>
          
          {/* İçindekiler - Daraltılabilir/Genişletilebilir - Tam genişlikte */}
          {blogData.tocItems && blogData.tocItems.length > 0 && (
            <section className="w-full mb-12">
              <div 
                className="bg-gray-50 rounded-lg shadow-sm p-4 cursor-pointer"
                onClick={() => setTocOpen(!tocOpen)}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-slate-800">İçindekiler</h2>
                  <ChevronDown 
                    className={`w-5 h-5 text-slate-500 transition-transform ${tocOpen ? 'transform rotate-180' : ''}`} 
                  />
                </div>
                
                {/* Animated TOC Content */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    tocOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className="space-y-2">
                    {blogData.tocItems.map((item, index) => (
                      <li key={`toc-item-${item.id}-${index}`}>
                        <a
                          href={`#${item.id}`}
                          className={`text-slate-800 hover:underline ${item.isBold ? 'font-bold' : ''}`}
                          style={{ marginLeft: item.level ? `${(item.level - 1) * 12}px` : '0' }}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Blog Kapak Resmi - Eğer varsa */}
        {blogData.coverImageUrl && (
          <section className="w-full mb-12 relative h-[450px] overflow-hidden rounded-xl max-w-6xl mx-auto">
            <img 
              src={blogData.coverImageUrl} 
              alt={blogData.title}
              className="w-full h-full object-cover"
            />
          </section>
        )}

        {/* Blog İçeriği */}
        <article className="prose lg:prose-xl max-w-4xl mx-auto mb-16" dangerouslySetInnerHTML={{
          __html: blogData.content.replace(/id="summary-of-key-insights-in-this-section"/g,
            (match, offset) => `id="summary-of-key-insights-in-this-section-${offset}"`)
        }} />

        {/* Ortak Bileşenler */}
        <ClinicShowcase />
        <BlogPreview />
      </div>

      {/* Tam Genişlikli Bileşen */}
      <WhyTrustSection />
    </main>
  );
};

export default BlogDetailPage;