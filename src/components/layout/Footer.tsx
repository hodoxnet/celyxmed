import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
// Sosyal medya ikonları için tip tanımı
import { LucideProps } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { routeTranslations } from '@/generated/route-translations';

// Menü tipleri (RootLayoutClient'tan veya ortak tiplerden)
interface MenuItem {
  id: string;
  title: string;
  href: string;
  openInNewTab: boolean;
  // Footer'da children yok
}
interface FooterMenu {
  id: string;
  name: string; // Grup adı (örn: "Tedaviler")
  items: MenuItem[];
}


// Modern sosyal medya ikonları
const ModernYouTubeIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const ModernInstagramIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const ModernTikTokIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const ModernFacebookIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const ModernLinkedInIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// Statik footerLinks objesi kaldırıldı. Veri menuData prop'undan gelecek.

// Sosyal medya linkleri için platform tanımları (Modern ikonlarla)
const socialMediaPlatforms = [
  { key: 'youtube', Icon: ModernYouTubeIcon, label: 'YouTube', defaultHref: "https://www.youtube.com/@Celyxmed" },
  { key: 'instagram', Icon: ModernInstagramIcon, label: 'Instagram', defaultHref: "https://www.instagram.com/celyxmed/" },
  { key: 'tiktok', Icon: ModernTikTokIcon, label: 'TikTok', defaultHref: "#" },
  { key: 'facebook', Icon: ModernFacebookIcon, label: 'Facebook', defaultHref: "#" },
  { key: 'linkedin', Icon: ModernLinkedInIcon, label: 'LinkedIn', defaultHref: "https://www.linkedin.com/company/celyxmed/" },
];

interface FooterProps {
  socialLinks?: {
    youtube?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
  } | null;
  contactInfo?: { // Bu prop kabul ediliyor ancak mevcut footer yapısında doğrudan kullanılmıyor.
    whatsapp?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  } | null;
  copyrightText?: string | null;
  menuData?: FooterMenu[] | null; // Dinamik footer menü verisi
  translations?: {
    description: string;
    contactButton: string;
  };
}

const Footer: React.FC<FooterProps> = ({
  socialLinks: dynamicSocialLinks,
  contactInfo,
  copyrightText,
  menuData, // Prop'u al
  translations
}) => {
  // Dinamik menü gruplarını al veya boş array kullan
  const footerMenuGroups = menuData || [];
  const pathname = usePathname();
  
  // Mevcut locale'i pathname'den al
  const currentLocale = pathname.split('/')[1] || 'tr';
  
  // Menü linklerini hedef dile çeviren fonksiyon (Navbar'dan alındı)
  const translateMenuLink = (href: string, targetLocale: string): string => {
    if (!href || href === '#') return href;
    
    // URL'i parçalara ayır
    const pathParts = href.split('/').filter(Boolean);
    
    // Eğer ilk parça bir dil koduysa, onu çıkar
    const startsWithLocale = pathParts[0] && ['tr', 'en', 'de', 'es', 'fr', 'it', 'ru'].includes(pathParts[0]);
    const actualPathParts = startsWithLocale ? pathParts.slice(1) : pathParts;
    
    if (actualPathParts.length === 0) {
      return `/${targetLocale}`;
    }
    
    // İlk parçayı çevir (varsa)
    const firstPart = actualPathParts[0];
    const translatedRoute = routeTranslations[firstPart]?.[targetLocale] || firstPart;
    
    // Çeviri varsa yeni path oluştur
    if (routeTranslations[firstPart]?.[targetLocale]) {
      const otherParts = actualPathParts.slice(1);
      const translatedPath = [translatedRoute, ...otherParts].join('/');
      return `/${targetLocale}/${translatedPath}`;
    }
    
    // Çeviri yoksa orijinal path'i kullan (ama dil kodunu güncelle)
    const finalPath = actualPathParts.join('/');
    return `/${targetLocale}/${finalPath}`;
  };
  return (
    // Renk şeması güncellendi: beyaz arka plan, koyu gri metin. Alt boşluk artırıldı.
    <footer className="bg-white text-gray-700 pt-16 pb-24"> {/* pb-8'den pb-24'e çıkarıldı */}
      <div className="container mx-auto px-4">
        {/* Üst Kısım: Logo, Açıklama, Linkler */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Sol Kısım: Logo ve Açıklama */}
          <div className="md:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/676be4d72f148f551550461b_Celyxmed_Logo_88x29.svg"
                alt="Celyxmed Logo"
                width={100}
                height={33} // Oran korunarak biraz büyütüldü
              />
            </Link>
            {/* Açıklama Türkçeleştirildi ve rengi güncellendi */}
            <p className="text-gray-600 mb-6 max-w-md">
              {translations?.description || "Celyxmed, dünya standartlarında doktorlar ve JCI akreditasyonlu kliniklerle kişiselleştirilmiş tedaviler sunan Türkiye'deki güvenilir sağlık ortağınızdır. Sizin sağlığınız, bizim önceliğimiz."}
            </p>
            {/* Buton Link ile sarıldı (Yeni Next.js standardı) */}
            <Button asChild className="bg-[#3E838C] hover:bg-[#367078] text-white rounded-lg px-6 py-2 inline-block">
              <Link href={translateMenuLink("/iletisim", currentLocale)}>
                {translations?.contactButton || "İletişim"}
              </Link>
            </Button>
          </div>

          {/* Sağ Kısım: Dinamik Link Sütunları */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:col-span-3">
            {footerMenuGroups.map((group) => (
              <div key={group.id}>
                <h4 className="text-base font-medium text-gray-800 mb-4">{group.name}</h4>
                <ul className="space-y-2">
                  {group.items.map(item => (
                    <li key={item.id}>
                      <Link 
                        href={translateMenuLink(item.href, currentLocale)} 
                        className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                        target={item.openInNewTab ? "_blank" : undefined}
                        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Alt Kısım: Telif Hakkı ve Sosyal Medya */}
        {/* Üst çizgi kaldırıldı */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          {/* Metin rengi güncellendi, ayraç ve geliştirici linki kaldırıldı */}
          <div className="text-gray-500 mb-4 md:mb-0">
            <span>{copyrightText || `Copyright © ${new Date().getFullYear()} Celyxmed`}</span>
            {/* Geliştirici bilgisi kaldırıldı */}
            {/* <span className="ml-2">Tasarım & Geliştirme: Yağız Gürbüz</span> */}
          </div>
          <div className="flex space-x-4">
            {socialMediaPlatforms.map(({ key, Icon, label, defaultHref }) => {
              const href = dynamicSocialLinks?.[key as keyof typeof dynamicSocialLinks] || defaultHref;
              if (!href || href === "#") return null; // URL yoksa veya # ise render etme
              return (
                <a 
                  key={label} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={label} 
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
