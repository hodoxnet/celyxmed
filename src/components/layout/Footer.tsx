import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
// Sosyal medya ikonları için lucide-react kullanabiliriz
import { Youtube, Instagram, Facebook, Linkedin, Twitter, Phone, Mail, MapPin } from 'lucide-react';

// Link verileri (index.html'den)
const footerLinks = {
  treatments: [
    { title: "Plastic Surgery", href: "/plastic-surgery" },
    { title: "Dental Aesthetic", href: "/dental-aesthetics" },
    { title: "Hair Transplant", href: "/hair-transplant" },
    { title: "Medical Aesthetic", href: "/medical-aesthetic" },
  ],
  about: [
    { title: "About Us", href: "/about" },
    { title: "Our Clinic", href: "/our-clinic" },
    { title: "Our Doctors", href: "/our-doctors" },
    { title: "Contact", href: "/contact" },
  ],
  resources: [
    { title: "Blog", href: "/blog" },
    { title: "Success Stories", href: "/success-stories" }, // Örnek link
    { title: "Patient Testimonials", href: "/testimonials" }, // Örnek link
    { title: "Before & After Gallery", href: "/gallery" }, // Örnek link
    { title: "Health and Travel Guide to Turkey 🇹🇷 ✈️", href: "/health-travel-guide" }, // Örnek link
  ],
  legal: [
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Protection of Personal Data", href: "/protection-of-personal-data" },
    { title: "Patient Rights", href: "/patient-rights" },
  ]
};

// Sosyal medya linkleri
const socialLinks = [
  { Icon: Youtube, href: "https://www.youtube.com/@Celyxmed", label: "YouTube" },
  { Icon: Instagram, href: "https://www.instagram.com/celyxmed/", label: "Instagram" },
  // { Icon: Facebook, href: "#", label: "Facebook" }, // index.html'de yoktu, eklenebilir
  { Icon: Linkedin, href: "https://www.linkedin.com/company/celyxmed/", label: "LinkedIn" },
  // { Icon: Twitter, href: "#", label: "Twitter" }, // index.html'de yoktu, eklenebilir
];

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
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
            <p className="text-gray-400 mb-6 max-w-md">
              Celyxmed is your trusted healthcare partner in Turkey, offering personalized treatments with world-class doctors and JCI-accredited clinics. Your health, our priority.
            </p>
            <Button variant="secondary" asChild>
              <Link href="/contact">Consultation</Link>
            </Button>
          </div>

          {/* Sağ Kısım: Link Sütunları */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Treatments</h4>
              <ul className="space-y-2">
                {footerLinks.treatments.map(link => (
                  <li key={link.title}>
                    <Link href={link.href} className="hover:text-white transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">About Celyxmed</h4>
              <ul className="space-y-2">
                {footerLinks.about.map(link => (
                  <li key={link.title}>
                    <Link href={link.href} className="hover:text-white transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2">
                {footerLinks.resources.map(link => (
                  <li key={link.title}>
                    <Link href={link.href} className="hover:text-white transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
             <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map(link => (
                  <li key={link.title}>
                    <Link href={link.href} className="hover:text-white transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Alt Kısım: Telif Hakkı ve Sosyal Medya */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="text-gray-400 mb-4 md:mb-0">
            <span>Copyright © {new Date().getFullYear()} Celyxmed</span>
            <span className="mx-2">|</span>
            <a href="https://www.yagizgurbuz.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Design & Developed by Yağız Gürbüz
            </a>
          </div>
          <div className="flex space-x-4">
            {socialLinks.map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-gray-400 hover:text-white transition-colors">
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
