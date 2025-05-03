import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from 'lucide-react'; // Yıldız ikonu için

// Örnek başarı hikayesi görselleri (index.html'den)
const storyImages = [
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780ce0e271b28d021a69e1b_gastric-sleeve-surgery-in-turkey-before-after-success-story-review%20(2).avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780ce48b60df05c9cfc199f_gastric-sleeve-surgery-in-turkey-before-after-success-story-review%20(3).avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780cea83c73781d052030ac_hollywood-smile-in-turkey-before-after-success-story-review.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780cece1c64611000e64e56_dental-implant-in-turkey-before-after-success-story-review.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780cefab1719a155e870e1e_nose-job-rhinoplasty-in-turkey-before-after-success-story-review.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780cf2624deaa1aa2a8777a_tummy-tuck-in-turkey-before-after-success-story-review.avif",
  // ... diğer görseller eklenebilir
];

// Örnek hasta yorumları (index.html'den)
const testimonials = [
  {
    stars: 5,
    text: "I’m forever grateful to Prof. Dr. Öge Taşçılar and the Celyxmed team. The care I received was beyond my expectations — from the first consultation to the surgery and follow-ups. Losing 35 kg in just 3 months changed my life completely. I finally feel healthy, confident, and full of energy again!",
    author: "Emily A. (United Kingdom 🇬🇧)",
    treatment: "Gastric Sleeve Surgery in Turkey",
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780d842959745383fe6459f_gastric-sleeve-surgery-in-turkey-before-after-result-review-celyxmed.avif"
  },
  {
    stars: 5,
    text: "Celyxmed and Op. Dr. Kemal Aytuğlu gave me exactly what I was looking for — a safe, professional, and life-changing experience. The procedure was smooth, and the results are incredible. I feel lighter, more confident, and ready to enjoy life without worrying about my appearance.",
    author: "Olivia R. (United States 🇺🇸)",
    treatment: "Mommy Makeover Surgery in Turkey",
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780df88a9c7db7861882613_liposuction-in-turkey-before-after-result-review.avif"
  },
   {
    stars: 5,
    text: "Choosing Celyxmed and Op. Dr. Kemal Aytuğlu was the best decision I’ve made for myself. The care and attention I received were exceptional. My body feels rejuvenated, and I’ve regained my confidence. The results exceeded my expectations — I finally feel like the best version of myself!",
    author: "Olivia M. (United States 🇺🇸)",
    treatment: "Mommy Makeover Surgery in Turkey",
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780dbc0ee579a9541c8b9f9_mommy-makeover-in-turkey-before-after-result-review.avif"
  },
  // ... diğer yorumlar eklenebilir
];

const SuccessStories = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50"> {/* Arka plan rengi */}
      <div className="container mx-auto px-4">
        {/* Başlık ve Açıklama */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-800">
            10,000+ Successful Treatments, Your Health in Trusted Hands
          </h2>
          <p className="text-lg text-gray-600">
            Thousands of patients have trusted Celyxmed for life-changing treatments in bariatric surgery, plastic surgery, dental aesthetics, hair transplant, and medical care. Discover their inspiring journeys to better health and confidence.
          </p>
        </div>

        {/* Başarı Hikayesi Görselleri (Otomatik Kaydırma) */}
        <div className="overflow-hidden mb-12 md:mb-16">
          <div className="flex animate-marquee space-x-4 md:space-x-6">
            {storyImages.map((src, index) => (
              <div key={index} className="flex-shrink-0 w-48 h-64 md:w-60 md:h-80 relative rounded-lg overflow-hidden shadow-md">
                <Image
                  src={src}
                  alt={`Success story ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
             {/* İkinci set (sonsuz döngü için) */}
             {storyImages.slice(0, 4).map((src, index) => (
              <div key={`duplicate-${index}`} className="flex-shrink-0 w-48 h-64 md:w-60 md:h-80 relative rounded-lg overflow-hidden shadow-md">
                <Image
                  src={src}
                  alt={`Success story ${index + 1} duplicate`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

         {/* Butonlar */}
         <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 md:mb-16">
            <Link 
              href="/contact"
              className="flex items-center bg-[#4a8f9c] hover:bg-[#3d7a86] text-white rounded-[20px] shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="bg-[#d4b978] h-[56px] w-[56px] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
              <span className="px-6 py-4 text-base font-medium">Book Your Free Consultation</span>
            </Link>
            
            <Link 
              href="/success-stories"
              className="inline-flex items-center text-[#4a8f9c] hover:text-[#3d7a86] font-medium border-b border-[#4a8f9c] pb-1 transition-all duration-300"
            >
              Discover Success Stories and Before, Afters
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>

        {/* Hasta Yorumları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col">
              <CardContent className="p-6 flex-grow">
                <div className="flex mb-2">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  {[...Array(5 - testimonial.stars)].map((_, i) => (
                     <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
              </CardContent>
              <div className="bg-gray-100 p-4 mt-auto flex items-center space-x-3">
                 <Image
                    src={testimonial.imageUrl}
                    alt={testimonial.author}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.treatment}</p>
                  </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
