import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Doktor avatar verileri (index.html'den)
const doctorAvatars = [
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e70a4297a93e1dcb6012_op-dr-kemal-aytuglu-plastic-surgeons-in-turkey.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e7117f1946daa107eae0_prof-dr-oge-tascilar-bariatric-surgeons-in-turkey.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e7187a4c35c9ccfe172d_dr-fikri-can-ayik-dental-doctor-in-turkey.avif",
];

const ConsultOnlineSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-100"> {/* Arka plan rengi */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden md:flex md:items-center">
          {/* Sol Taraf: Görsel */}
          <div className="md:w-1/2 relative min-h-[300px] md:min-h-0 md:h-auto">
            <Image
              src="https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e2167ec2780fa3209e8f_book-your-free-consultation.avif"
              alt="Consult Online"
              layout="fill"
              objectFit="cover"
              className="md:absolute md:inset-0"
            />
          </div>

          {/* Sağ Taraf: İçerik */}
          <div className="md:w-1/2 p-6 md:p-10 lg:p-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Be Your Best
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-gray-800">
              Consult with Our Doctors Online
            </h2>
            <p className="text-gray-600 mb-6">
              Get expert advice directly from our specialists. Book your free online consultation and discover the best treatment options tailored for you.
            </p>

            {/* Doktor Avatarları */}
            <div className="flex items-center mb-6">
               <div className="flex -space-x-3 mr-4">
                 {doctorAvatars.map((src, index) => (
                   <Image
                     key={index}
                     src={src}
                     alt={`Doctor ${index + 1}`}
                     width={48} // Daha küçük avatarlar
                     height={48}
                     className="rounded-full border-2 border-white shadow-md"
                     style={{ zIndex: doctorAvatars.length - index }}
                   />
                 ))}
                 {/* +50 Avatarı */}
                 <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-gray-200 flex items-center justify-center text-center text-[10px] font-semibold text-gray-700 relative" style={{ zIndex: 0 }}>
                   +50<br/>Expert
                   <Image
                     src={doctorAvatars[0]} // Arka plan için bulanık avatar
                     alt=""
                     layout="fill"
                     objectFit="cover"
                     className="rounded-full opacity-30 blur-sm absolute inset-0"
                   />
                 </div>
               </div>
               <p className="text-sm text-gray-500">
                 Choose Your Doctor,<br/> Ask Your Questions
               </p>
            </div>

            {/* Buton */}
            <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700" asChild>
              <Link href="/contact">
                Book Your Free Consultation Today
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultOnlineSection;
