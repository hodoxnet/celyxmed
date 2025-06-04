"use client";

// src/components/hizmet-detay/TestimonialsSection.tsx
import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from 'lucide-react'; // Yıldız ikonu için

// Yorum verisi tipi
interface Testimonial {
  stars: number;
  text: string;
  author: string;
  treatment: string;
  imageUrl: string;
  country?: string; // Ülke adı
  countryFlag?: string; // Ülke bayrağı emoji veya kodu
}

interface TestimonialsSectionProps {
  title?: string; // Opsiyonel başlık
  testimonials: Testimonial[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ title, testimonials }) => {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Opsiyonel Başlık */}
        {title && (
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-normal text-gray-800 dark:text-white">
              {title}
            </h2>
          </div>
        )}

        {/* Hasta Yorumları - 3 sütunlu grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-lg p-6 md:p-8">
              {/* Yıldızlar üstte */}
              <div className="flex mb-6">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gray-700 fill-gray-700 mr-1" />
                ))}
                {[...Array(5 - testimonial.stars)].map((_, i) => (
                   <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300 dark:text-gray-600 mr-1" />
                ))}
              </div>
              
              {/* Testimonial metni */}
              <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed mb-6 font-normal flex-grow">
                {testimonial.text}
              </p>
              
              {/* Alt kısım - Avatar ve bilgiler */}
              <div className="flex items-center space-x-3 mt-auto">
                {/* Avatar */}
                {testimonial.imageUrl && (
                  <Image
                     src={testimonial.imageUrl}
                     alt={testimonial.author}
                     width={48}
                     height={48}
                     className="rounded-full flex-shrink-0"
                   />
                )}
                
                {/* İsim ve bilgiler */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {testimonial.author}
                    </p>
                    {testimonial.country && (
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        ({testimonial.country} {testimonial.countryFlag})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.treatment}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
