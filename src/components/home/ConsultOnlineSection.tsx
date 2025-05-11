import React, { useState, useEffect } from 'react';
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
        console.log(`[CLIENT] Fetching consult online section for locale: ${locale}`);
        const response = await fetch(`/api/home/consult-online-section?locale=${locale}`);

        if (!response.ok) {
          console.log(`[CLIENT] API response not OK:`, response.status, response.statusText);
          // API başarısız olursa varsayılan veri kullan
          setData(defaultData as ConsultOnlineSectionData);
          return;
        }

        const responseData = await response.json();
        console.log(`[CLIENT] Received data:`, {
          gotValidResponse: !!responseData,
          hasTranslation: !!responseData?.translation,
          title: responseData?.translation?.title,
          imageUrl: responseData?.imageUrl,
          avatarCount: responseData?.doctorAvatars?.length
        });
        
        // Sunucudan gönderilen veri, varsayılan verinin üstüne yazılır
        if (responseData?.translation) {
          setData(responseData);
        } else {
          console.log(`[CLIENT] Using default data due to missing translation`);
          setData(defaultData as ConsultOnlineSectionData);
        }
      } catch (err) {
        console.error('[CLIENT] Error fetching consult online section data:', err);
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

  // Resim URL'sini işlemek için helper fonksiyon
  const getFullImageUrl = (url: string | null) => {
    if (!url) return defaultData.imageUrl;

    // Eğer tam URL ise (http:// veya https:// ile başlıyorsa)
    if (url.startsWith('http')) {
      return url;
    }

    // Göreli URL ise ve /uploads ile başlıyorsa
    if (url.startsWith('/uploads')) {
      return url; // Aynı originle çalıştığımız için göreceli URL yeterli
    }

    // Hiçbir duruma uymuyorsa varsayılan URL'yi kullan
    return defaultData.imageUrl;
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-teal-800 rounded-2xl shadow-xl overflow-hidden md:flex md:items-stretch">
          {/* Sol Taraf: Görsel */}
          <div className="md:w-1/2 relative overflow-hidden">
            {/* Ana görsel */}
            <div className="h-full w-full bg-amber-500">
              <img
                src={getFullImageUrl(imageUrl)}
                alt="Consult Online"
                className="w-full h-full md:h-[480px] object-cover"
                style={{ objectPosition: 'center' }}
                onError={(e) => {
                  console.error('[CLIENT] Ana resim yüklenemedi:', imageUrl);
                  e.currentTarget.src = defaultData.imageUrl;
                }}
              />
            </div>
          </div>

          {/* Sağ Taraf: İçerik */}
          <div className="md:w-1/2 p-8 md:p-10 lg:p-14 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/20 text-white text-xs font-semibold mb-5">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              {translation.tagText}
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-white">
              {translation.title}
            </h2>
            <p className="text-white/90 mb-6">
              {translation.description}
            </p>

            {/* Doktor Avatarları */}
            <div className="flex items-center mb-6">
               <div className="flex -space-x-3 mr-4">
                 {doctorAvatars.map((avatar, index) => (
                   <img
                     key={avatar.id}
                     src={getFullImageUrl(avatar.imageUrl)}
                     alt={avatar.altText || `Doctor ${index + 1}`}
                     width="48"
                     height="48"
                     className="rounded-full border-2 border-white shadow-md w-12 h-12 object-cover"
                     style={{ zIndex: doctorAvatars.length - index }}
                     onError={(e) => {
                       console.error(`[CLIENT] Avatar resmi yüklenemedi:`, avatar.imageUrl);
                       e.currentTarget.src = defaultData.doctorAvatars[0].imageUrl;
                     }}
                   />
                 ))}
                 {/* +50 Avatarı */}
                 <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-teal-600 flex items-center justify-center text-center text-[10px] font-semibold text-white relative" style={{ zIndex: 0 }}>
                   +50<br/>Expert
                   <img
                     src={getFullImageUrl(doctorAvatars[0]?.imageUrl || defaultData.doctorAvatars[0].imageUrl)}
                     alt=""
                     className="rounded-full opacity-20 blur-sm absolute inset-0 w-full h-full object-cover"
                     onError={(e) => {
                       e.currentTarget.src = defaultData.doctorAvatars[0].imageUrl;
                     }}
                   />
                 </div>
               </div>
               <p className="text-sm text-white" dangerouslySetInnerHTML={{ __html: translation.avatarText.replace('\n', '<br/>') }} />
            </div>

            {/* Buton */}
            <Button size="lg" className="w-full sm:w-auto bg-white text-teal-700 hover:bg-white/90 rounded-full px-8 py-6 flex items-center gap-2 mt-4" asChild>
              <Link href={translation.buttonLink}>
                <span className="text-sm font-medium">{translation.buttonText}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultOnlineSection;