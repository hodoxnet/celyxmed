import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Shadcn Button kullanılıyor

interface TreatmentLink {
  id: string; // Bölüm ID'si (örn. '#1', '#fiyat')
  number: string; // Sıra numarası (örn. '01', '02')
  text: string;
}

interface TreatmentIntroSectionProps {
  videoId?: string; // YouTube video ID (örn. '2edpx39Iy8g')
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string; // Genel bakış bölümüne link (örn. '#1')
  links: TreatmentLink[];
}

const TreatmentIntroSection: React.FC<TreatmentIntroSectionProps> = ({
  videoId,
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  links,
}) => {
  const videoEmbedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  return (
    <section id="detaylar" className="tedavi-y bg-gray-50 py-16 md:py-24">
      {/* Ana container (ortalanmış ve padding'li) */}
      <div className="container mx-auto px-4">
        {/* Kart yapısı (index.html'deki banner-bg-2'ye benzer) */}
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg">
          {/* İki sütunlu grid yapısı (index.html'deki integrations-banner-2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Sol Sütun (index.html: integrations-banner-left) */}
            <div className="flex flex-col space-y-6">
              {/* Video */}
              <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                {videoEmbedUrl ? (
                  <iframe
                    className="w-full h-full"
                    src={videoEmbedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <span className="text-gray-500">Video Yüklenecek</span>
                )}
              </div>
              {/* Başlık ve Açıklama (index.html: integrations-banner-heading-2) */}
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  <strong>{title}</strong>
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">{description}</p>
              </div>
              {/* Butonlar (index.html: double-button) */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start">
                <Button asChild size="lg" className="bg-[#4a8f9c] hover:bg-[#3d7a86] text-white px-7 py-3 rounded-lg text-base font-medium">
                  <Link href={primaryButtonLink}>{primaryButtonText}</Link>
                </Button>
                <Button asChild variant="link" size="lg" className="text-[#4a8f9c] hover:text-[#3d7a86] px-0 py-3 text-base font-medium">
                   <Link href={secondaryButtonLink}>{secondaryButtonText}</Link>
                </Button>
              </div>
            </div>

            {/* Sağ Sütun - Linkler (index.html: integrations-banner-right) */}
            <div className="flex flex-col">
              {links.map((link, index) => (
                // index.html: integrations-row
                <div key={link.id} className={`integrations-row ${index !== links.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  {/* index.html: integrations-row-content */}
                  <Link href={link.id} className="flex items-center space-x-4 py-4 hover:bg-gray-100 rounded-md transition-colors duration-150 px-3 -mx-3">
                    <div className="opacity-70 flex-shrink-0">
                      <div className="text-lg text-gray-400 font-medium w-8 text-right">{link.number}</div>
                    </div>
                    <span className="text-lg text-gray-800 hover:text-[#4a8f9c] flex-1 transition-colors duration-150">
                      {link.text}
                    </span>
                  </Link>
                </div>
              ))}
            </div>

          </div> {/* grid kapanışı */}
        </div> {/* Kart (bg-white) kapanışı */}
      </div> {/* container kapanışı */}
    </section> // section kapanışı - Düzeltildi
  );
};

export default TreatmentIntroSection;
