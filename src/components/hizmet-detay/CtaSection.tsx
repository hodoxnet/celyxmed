// src/components/hizmet-detay/CtaSection.tsx
import React from 'react';
import Image from 'next/image'; // Avatar resimleri için
import Link from 'next/link'; // Link bileşenini import et
import { Button } from '@/components/ui/button';

// Avatar verisi tipi (opsiyonel)
interface Avatar {
  id: string;
  src: string;
  alt: string;
}

interface CtaSectionProps {
  tagline?: string; // Opsiyonel etiket (örn: "Be Your Best")
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  avatars?: Avatar[]; // Gösterilecek doktor avatarları (opsiyonel)
  avatarText?: string; // Avatarların yanındaki metin (opsiyonel)
  backgroundImageUrl?: string; // Arka plan resmi (opsiyonel)
}

const CtaSection: React.FC<CtaSectionProps> = ({
  tagline,
  title,
  description,
  buttonText,
  buttonLink = "/iletisim",
  avatars,
  avatarText,
  backgroundImageUrl
}) => {
  const sectionStyle = backgroundImageUrl
    ? { backgroundImage: `url(${backgroundImageUrl})` }
    : {};

  const bgColorClass = backgroundImageUrl ? 'bg-cover bg-center text-white' : 'bg-blue-600 text-white'; // Arka plan resmine göre sınıf ayarı
  const textColorClass = backgroundImageUrl ? 'text-white' : 'text-white'; // Metin rengi
  const descriptionColorClass = backgroundImageUrl ? 'text-blue-100' : 'text-blue-100'; // Açıklama rengi

  return (
    <section
      className={`py-16 ${bgColorClass}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 text-center">
        {tagline && (
          <div className="inline-block bg-white text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded mb-2">
            {/* Elips eklenebilir */}
            {tagline}
          </div>
        )}
        <h2 className={`text-3xl font-bold mb-4 ${textColorClass}`}>{title}</h2>
        <p className={`mb-6 max-w-xl mx-auto ${descriptionColorClass}`}>{description}</p>

        {/* Avatarlar (varsa) */}
        {avatars && avatars.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="flex -space-x-2 overflow-hidden">
              {avatars.map((avatar) => (
                <div key={avatar.id} className="relative inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-800">
                   <Image
                     src={avatar.src}
                     alt={avatar.alt}
                     layout="fill"
                     objectFit="cover"
                     className="rounded-full"
                   />
                </div>
              ))}
              {/* "+50 uzman" gibi bir gösterge eklenebilir */}
            </div>
            {avatarText && <span className={`text-sm ${descriptionColorClass}`}>{avatarText}</span>}
          </div>
        )}

        <Button asChild size="lg" variant={backgroundImageUrl ? 'secondary' : 'default'}>
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      </div>
    </section>
  );
};

export default CtaSection;
