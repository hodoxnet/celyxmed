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
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950"> {/* Arka plan rengi */}
      <div className="container mx-auto px-4">
        {/* Opsiyonel Başlık */}
        {title && (
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 dark:text-white">
              {title}
            </h2>
          </div>
        )}

        {/* Hasta Yorumları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden shadow-md"> {/* shadow-sm -> shadow-md */}
              <CardContent className="p-6 flex-grow">
                <div className="flex mb-4"> {/* mb-3 -> mb-4 */}
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  {[...Array(5 - testimonial.stars)].map((_, i) => (
                     <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                  ))}
                </div>
                <p className="text-gray-800 dark:text-gray-200 mb-6 text-base leading-relaxed">"{testimonial.text}"</p> {/* italic kaldırıldı, text-sm -> text-base, mb-4 -> mb-6, renkler güncellendi */}
              </CardContent>
              <div className="p-6 mt-auto flex items-center space-x-4"> {/* Arka plan ve border kaldırıldı, padding ve space güncellendi */}
                 {/* imageUrl varsa Image'ı render et */}
                 {testimonial.imageUrl && (
                   <Image
                      src={testimonial.imageUrl}
                      alt={testimonial.author}
                      width={48} // 40 -> 48
                      height={48} // 40 -> 48
                      className="rounded-full"
                    />
                 )}
                  <div>
                    <p className="font-semibold text-base text-gray-900 dark:text-white">{testimonial.author}</p> {/* text-sm -> text-base, renkler güncellendi */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.treatment}</p> {/* text-xs -> text-sm, renkler güncellendi */}
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
