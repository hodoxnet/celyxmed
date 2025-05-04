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

  // Gösterilecek yorum sayısı (örneğin ilk 3)
  const displayedTestimonials = testimonials.slice(0, 3);

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
          {displayedTestimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden shadow-sm"> {/* Arka plan ve stil güncellendi */}
              <CardContent className="p-6 flex-grow">
                <div className="flex mb-3"> {/* Alt boşluk artırıldı */}
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  {[...Array(5 - testimonial.stars)].map((_, i) => (
                     <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300 dark:text-gray-600" /> // Dark mode rengi eklendi
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed italic">"{testimonial.text}"</p> {/* Font boyutu ve satır aralığı ayarlandı */}
              </CardContent>
              <div className="bg-gray-100 dark:bg-gray-700/50 p-4 mt-auto flex items-center space-x-3 border-t border-gray-200 dark:border-gray-700"> {/* Arka plan, border ve stil güncellendi */}
                 {/* imageUrl varsa Image'ı render et */}
                 {testimonial.imageUrl && (
                   <Image
                      src={testimonial.imageUrl}
                      alt={testimonial.author}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                 )}
                  <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{testimonial.author}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.treatment}</p>
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
