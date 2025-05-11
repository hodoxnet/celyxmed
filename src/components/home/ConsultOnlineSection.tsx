import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Konsülte bölümü için tip tanımları
interface DoctorAvatar {
  id: string;
  imageUrl: string;
  altText?: string;
  order: number;
}

interface ConsultOnlineSectionTranslation {
  id: string;
  tagText: string;
  title: string;
  description: string;
  avatarText: string;
  buttonText: string;
  buttonLink: string;
}

interface ConsultOnlineSectionData {
  id: string;
  imageUrl: string | null;
  doctorAvatars: DoctorAvatar[];
  translation: ConsultOnlineSectionTranslation;
}

// Varsayılan veri
const defaultData = {
  imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e2167ec2780fa3209e8f_book-your-free-consultation.avif",
  doctorAvatars: [
    {
      id: '1',
      imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e70a4297a93e1dcb6012_op-dr-kemal-aytuglu-plastic-surgeons-in-turkey.avif",
      altText: "Doctor 1",
      order: 0
    },
    {
      id: '2',
      imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e7117f1946daa107eae0_prof-dr-oge-tascilar-bariatric-surgeons-in-turkey.avif",
      altText: "Doctor 2",
      order: 1
    },
    {
      id: '3',
      imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e7187a4c35c9ccfe172d_dr-fikri-can-ayik-dental-doctor-in-turkey.avif",
      altText: "Doctor 3",
      order: 2
    },
  ],
  translation: {
    id: 'default',
    tagText: 'Be Your Best',
    title: 'Consult with Our Doctors Online',
    description: 'Get expert advice directly from our specialists. Book your free online consultation and discover the best treatment options tailored for you.',
    avatarText: 'Choose Your Doctor, Ask Your Questions',
    buttonText: 'Book Your Free Consultation Today',
    buttonLink: '/contact'
  }
};

interface ConsultOnlineSectionProps {
  locale?: string;
}

const ConsultOnlineSection = ({ locale = 'en' }: ConsultOnlineSectionProps) => {
  const [data, setData] = useState<ConsultOnlineSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/home/consult-online-section?locale=${locale}`);

        if (!response.ok) {
          // API başarısız olursa varsayılan veri kullan
          setData(defaultData as ConsultOnlineSectionData);
          return;
        }

        const responseData = await response.json();
        setData(responseData);
      } catch (err) {
        console.error('Error fetching consult online section data:', err);
        setError('Failed to load data');
        // Hata durumunda varsayılan veri kullan
        setData(defaultData as ConsultOnlineSectionData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  // Yükleme sırasında veya hata durumunda varsayılan veriyi kullan
  const displayData = data || defaultData;
  const { imageUrl, doctorAvatars, translation } = displayData;

  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden md:flex md:items-center">
          {/* Sol Taraf: Görsel */}
          <div className="md:w-1/2 relative min-h-[300px] md:min-h-0 md:h-auto">
            <Image
              src={imageUrl || defaultData.imageUrl}
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
              {translation.tagText}
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-gray-800">
              {translation.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {translation.description}
            </p>

            {/* Doktor Avatarları */}
            <div className="flex items-center mb-6">
               <div className="flex -space-x-3 mr-4">
                 {doctorAvatars.map((avatar, index) => (
                   <Image
                     key={avatar.id}
                     src={avatar.imageUrl}
                     alt={avatar.altText || `Doctor ${index + 1}`}
                     width={48}
                     height={48}
                     className="rounded-full border-2 border-white shadow-md"
                     style={{ zIndex: doctorAvatars.length - index }}
                   />
                 ))}
                 {/* +50 Avatarı */}
                 <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-gray-200 flex items-center justify-center text-center text-[10px] font-semibold text-gray-700 relative" style={{ zIndex: 0 }}>
                   +50<br/>Expert
                   <Image
                     src={doctorAvatars[0]?.imageUrl || defaultData.doctorAvatars[0].imageUrl}
                     alt=""
                     layout="fill"
                     objectFit="cover"
                     className="rounded-full opacity-30 blur-sm absolute inset-0"
                   />
                 </div>
               </div>
               <p className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: translation.avatarText.replace('\n', '<br/>') }} />
            </div>

            {/* Buton */}
            <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700" asChild>
              <Link href={translation.buttonLink}>
                {translation.buttonText}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultOnlineSection;
