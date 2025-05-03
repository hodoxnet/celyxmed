import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Buton için

// index.html'den alınan klinik görselleri
const clinicImages = [
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b6e872d3351a073b074f22_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-1.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b6e89461cffd4897790c3d_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-2.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b6e894ebcf2407f57a1850_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-3.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b76104be36af549943a17b_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-1.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b6e894eced17dd1e36bdeb_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-5.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b6e8942caa43af25cbb3bc_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-6.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b7610574268604a35d151a_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-4.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b761054cad93f0616d100f_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-3.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b76105ac4bb90e75013a68_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-2.avif",
];

const ClinicShowcase = () => {
  return (
    <section className="py-16 md:py-24 bg-white"> {/* Arka plan rengi */}
      <div className="container mx-auto px-4">
        {/* Başlık, Açıklama ve Buton */}
        <div className="mb-12 md:mb-16 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-gray-800">
            State-of-the-Art Clinic in Istanbul
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-lg text-gray-600 max-w-xl">
               Our modern clinic in Ataşehir, Istanbul, is designed to provide the highest standards of safety, hygiene, and comfort. While our aesthetic surgeries are performed in JCI-accredited partner hospitals, we ensure a seamless experience from consultation to recovery, prioritizing your well-being at every step.
             </p>
             <Button variant="link" className="text-lg p-0 h-auto" asChild>
               <Link href="/our-clinic">
                 Explore Our Clinic
                 <span className="ml-2">→</span> {/* Ok ikonu */}
               </Link>
             </Button>
          </div>
        </div>

        {/* Yatay Kaydırılabilir Görsel Galerisi */}
        {/* Not: Gerçek marquee efekti için ek kütüphane veya CSS gerekebilir */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4"> {/* Yatay kaydırma ve padding ayarı */}
          <div className="flex space-x-4 md:space-x-6 w-max"> {/* Görsellerin yan yana sığması için w-max */}
            {clinicImages.map((src, index) => (
              <div key={index} className="flex-shrink-0 w-64 h-48 md:w-80 md:h-60 relative rounded-lg overflow-hidden shadow-md">
                <Image
                  src={src}
                  alt={`Clinic image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
             {/* İkinci set (marquee efekti hissi için) - Opsiyonel */}
             {clinicImages.map((src, index) => (
              <div key={`duplicate-${index}`} className="flex-shrink-0 w-64 h-48 md:w-80 md:h-60 relative rounded-lg overflow-hidden shadow-md">
                <Image
                  src={src}
                  alt={`Clinic image ${index + 1} duplicate`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClinicShowcase;
