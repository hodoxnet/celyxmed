import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Buton için
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Kartlar için

// Örnek tedavi verisi (index.html'den alınmıştır)
const treatments = [
  {
    title: "Plastic Surgery",
    description: "Enhance your beauty with Turkey’s leading plastic surgeons, including Op. Dr. Kemal Aytuğlu, who brings over 25 years of experience...",
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/677d78dd71051814f8fddb34_plastic-surgery-in-turkey.avif",
    link: "/plastic-surgery"
  },
  {
    title: "Dental Aesthetics",
    description: "Achieve the perfect smile with Turkey’s leading dental specialists, including Dr. Fikri Can Ayık, who brings over 10 years of experience...",
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/677d796116e961d177db93a3_dental-surgery-in-turkey.avif",
    link: "/dental-aesthetics"
  },
  {
    title: "Hair Transplant",
    description: "Restore your confidence with Turkey’s leading hair transplant team, bringing over 15 years of experience in advanced hair restoration techniques...",
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/676e91baa933c6efccce1330_celyxmed-hair-transplant-treatment-clinic-in-turkey.avif",
    link: "/hair-transplant"
  },
   {
    title: "Medical Aesthetics",
    description: "Receive world-class medical care from Turkey’s leading specialists, with over 15 years of experience in various medical fields...",
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/677d7a171fc3026504a1b70b_medical-aesthetics-clinic-in-turkey.avif",
    link: "/medical-aesthetic"
  },
  {
    title: "Success Stories and Before, Afters",
    description: "Hear from our patients and discover how Celyxmed has transformed thousands of lives with personalized healthcare solutions...",
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/677d7ff6d47ec2b4c890afd1_success-stories-and-before-afters-clinic-in-turkey.avif",
    link: "/success-stories" // Örnek link
  },
];

// Örnek avatar verisi
const avatars = [
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/677d7e1480f552d9dd759881_celyxmed-.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/677d7e7096d77fc5d147a4a6_celyxmed-success-stories.avif",
  "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/677d7f3b6da406686deb4362_celyxmed-success-stories%20(1).avif",
];

const TreatmentsSection = () => {
  return (
    <section id="treatments" className="py-16 md:py-24"> {/* ID eklendi */}
      <div className="container mx-auto px-4">
        {/* Üst Kısım: Başlık, Açıklama, Avatarlar */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center mb-12 md:mb-16">
          {/* Sol Taraf: Başlık, Açıklama, Buton */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-gray-800">
              Comprehensive Healthcare Solutions Tailored for You
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              From advanced bariatric procedures to expert dental care, hair transplants, medical treatments, and aesthetic surgeries, Celyxmed offers a full spectrum of personalized healthcare solutions. With experienced medical teams and partnerships with accredited hospitals, we ensure world-class care tailored to your needs.
            </p>
            <Button size="lg" asChild>
              <Link href="/treatments"> {/* Tüm tedaviler sayfasına link */}
                Explore Our Treatments
              </Link>
            </Button>
          </div>

          {/* Sağ Taraf: Avatarlar */}
          <div className="lg:w-1/2 flex flex-col items-center">
            <div className="flex -space-x-4 mb-4">
              {avatars.map((src, index) => (
                <Image
                  key={index}
                  src={src}
                  alt={`Patient ${index + 1}`}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-white shadow-md"
                  style={{ zIndex: avatars.length - index }} // Üst üste binme sırası
                />
              ))}
              {/* +10.000 Avatarı */}
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-gray-200 flex items-center justify-center text-center text-xs font-semibold text-gray-700 relative" style={{ zIndex: 0 }}>
                +10.000
                <Image
                  src={avatars[0]} // Arka plan için bulanık bir avatar
                  alt=""
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full opacity-30 blur-sm absolute inset-0"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 max-w-[21ch] text-center">
              10,000+ Successful Treatments, Your Health in Trusted Hands
            </p>
          </div>
        </div>

        {/* Alt Kısım: Tedavi Kartları Grid'i */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {treatments.map((treatment) => (
            <Link key={treatment.title} href={treatment.link} className="block group">
              <Card className="h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative w-full aspect-[4/3] overflow-hidden"> {/* Görsel alanı */}
                    <Image
                      src={treatment.imageUrl}
                      alt={treatment.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-xl font-semibold mb-2 text-gray-800">{treatment.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    {treatment.description}
                  </CardDescription>
                </CardContent>
                {/* İsteğe bağlı olarak CardFooter eklenebilir */}
                {/* <CardFooter className="p-4 pt-0">
                  <Button variant="link" className="p-0 h-auto">Learn More</Button>
                </CardFooter> */}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TreatmentsSection;
