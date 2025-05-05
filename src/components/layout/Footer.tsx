import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
// Sosyal medya ikonları için lucide-react kullanabiliriz
import { Youtube, Instagram, Facebook, Linkedin, Twitter, Phone, Mail, MapPin, LucideProps } from 'lucide-react'; // Facebook ve LucideProps eklendi

// TikTok ikonu için özel bir component veya SVG gerekebilir, şimdilik bir placeholder kullanalım
const TikTokIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Basit TikTok benzeri ikon */}
    <path d="M21 8.15c-1.3.35-2.7.55-4.1.55-1.5 0-2.9-.25-4.2-.75-.75-.3-1.45-.7-2.1-1.2-.65-.5-1.25-1.1-1.8-1.8C7.2 3.3 5.85 2 4 2" />
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <path d="M12 22V12" />
  </svg>
);


// Link verileri Türkçeleştirildi
const footerLinks = {
  treatments: [
    { title: "Plastik Cerrahi", href: "/plastik-cerrahi" }, // href güncellendi (isteğe bağlı)
    { title: "Diş Estetiği, Tedavileri", href: "/dis-estetigi" }, // href güncellendi
    { title: "Saç Ekimi", href: "/sac-ekimi" }, // href güncellendi
    { title: "Medikal Estetik", href: "/medikal-estetik" }, // href güncellendi
  ],
  about: [
    { title: "Hakkımızda", href: "/hakkimizda" }, // href güncellendi
    { title: "Kliniğimiz", href: "/klinigimiz" }, // href güncellendi
    { title: "Doktorlarımız", href: "/doktorlarimiz" }, // href güncellendi
    { title: "İletişim", href: "/iletisim" }, // href güncellendi
  ],
  resources: [
    { title: "Blog", href: "/blog" },
    { title: "Başarı Hikayeleri", href: "/basari-hikayeleri" }, // href güncellendi
    { title: "Hasta Görüşleri", href: "/hasta-gorusleri" }, // href güncellendi
    { title: "Önce & Sonra Galerisi", href: "/galeri" }, // href güncellendi
    { title: "Türkiye Sağlık ve Seyahat Rehberi 🇹🇷✈️", href: "/turkiye-saglik-seyahat-rehberi" }, // href güncellendi
  ],
  legal: [
    { title: "Gizlilik Politikası", href: "/gizlilik-politikasi" }, // href güncellendi
    { title: "Kişisel Verilerin Korunması", href: "/kisisel-verilerin-korunmasi" }, // href güncellendi
    { title: "Hasta Hakları", href: "/hasta-haklari" }, // href güncellendi
  ]
};

// Sosyal medya linkleri güncellendi (TikTok ve Facebook eklendi)
const socialLinks = [
  { Icon: Youtube, href: "https://www.youtube.com/@Celyxmed", label: "YouTube" },
  { Icon: Instagram, href: "https://www.instagram.com/celyxmed/", label: "Instagram" },
  { Icon: TikTokIcon, href: "#", label: "TikTok" }, // TikTok eklendi (href güncellenmeli)
  { Icon: Facebook, href: "#", label: "Facebook" }, // Facebook eklendi (href güncellenmeli)
  { Icon: Linkedin, href: "https://www.linkedin.com/company/celyxmed/", label: "LinkedIn" },
];

const Footer = () => {
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
              Celyxmed, dünya standartlarında doktorlar ve JCI akreditasyonlu kliniklerle kişiselleştirilmiş tedaviler sunan Türkiye'deki güvenilir sağlık ortağınızdır. Sizin sağlığınız, bizim önceliğimiz.
            </p>
            {/* Buton Link ile sarıldı (Yeni Next.js standardı) */}
            <Button asChild className="bg-[#3E838C] hover:bg-[#367078] text-white rounded-lg px-6 py-2 inline-block">
              <Link href="/iletisim">
                İletişim
              </Link>
            </Button>
          </div>

          {/* Sağ Kısım: Link Sütunları */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:col-span-3"> {/* 4 sütun yapıldı */}
            <div>
              {/* Başlık stili güncellendi */}
              <h4 className="text-base font-medium text-gray-800 mb-4">Tedaviler</h4>
              <ul className="space-y-2">
                {footerLinks.treatments.map(link => (
                  <li key={link.title}>
                    {/* Link stili güncellendi */}
                    <Link href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {/* Başlık stili güncellendi */}
              <h4 className="text-base font-medium text-gray-800 mb-4">Celyxmed Hakkında</h4>
              <ul className="space-y-2">
                {footerLinks.about.map(link => (
                  <li key={link.title}>
                    {/* Link stili güncellendi */}
                    <Link href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {/* Başlık stili güncellendi */}
              <h4 className="text-base font-medium text-gray-800 mb-4">Kaynaklar</h4>
              <ul className="space-y-2">
                {footerLinks.resources.map(link => (
                  <li key={link.title}>
                    {/* Link stili güncellendi */}
                    <Link href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
             <div>
              {/* Başlık stili güncellendi */}
              <h4 className="text-base font-medium text-gray-800 mb-4">Yasal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map(link => (
                  <li key={link.title}>
                    {/* Link stili güncellendi */}
                    <Link href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Alt Kısım: Telif Hakkı ve Sosyal Medya */}
        {/* Üst çizgi kaldırıldı */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          {/* Metin rengi güncellendi, ayraç ve geliştirici linki kaldırıldı */}
          <div className="text-gray-500 mb-4 md:mb-0">
            <span>Copyright © {new Date().getFullYear()} Celyxmed</span>
             {/* Geliştirici bilgisi Türkçeleştirildi */}
            <span className="ml-2">Tasarım & Geliştirme: Yağız Gürbüz</span>
          </div>
          <div className="flex space-x-4">
            {/* İkon renkleri güncellendi */}
            {socialLinks.map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-gray-700 hover:text-gray-900 transition-colors">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
