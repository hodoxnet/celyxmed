"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  profileUrl: string;
}

interface DoctorsSectionProps {
  title?: string;
  description?: string;
  doctors?: Doctor[];
}

const DoctorsSection = ({
  title = "Uzman Doktorlarımız, Güvenilir Bakım Ekibiniz",
  description = "Celyxmed'de doktorlarımız uzmanlardan daha fazlasıdır - kendilerini kişiselleştirilmiş bakım sağlamaya ve hayat değiştiren sonuçlar elde etmeye adamış, alanlarında lider kişilerdir. Yılların deneyimiyle, sağlık yolculuğunuzun en iyi ellerde olmasını sağlarlar.",
  doctors = [
    {
      id: "dr-1",
      name: "Op. Dr. Kemal Aytuğlu",
      title: "Plastik Cerrah",
      imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bcd3/67deade75b02537eadc0be2b_op-dr-kemal-aytuglu-celyxmed.png",
      profileUrl: "/doctors/op-dr-kemal-aytuglu"
    },
    {
      id: "dr-2",
      name: "Dr. Damla Erdoğan",
      title: "Pratisyen Hekim",
      imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bcd3/67deade75b02537eadc0be4b_dr-damla-erdogan-celyxmed.png",
      profileUrl: "/doctors/dr-damla-erdogan"
    },
    {
      id: "dr-3",
      name: "Dr. Ahmet Kaya",
      title: "Pratisyen Hekim",
      imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bcd3/67deade75b02537eadc0be69_dr-ahmet-kaya-celyxmed.png",
      profileUrl: "/doctors/dr-ahmet-kaya"
    },
    {
      id: "dr-4",
      name: "Dt. Burcu Akman",
      title: "Diş Doktoru",
      imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bcd3/67deade75b02537eadc0be83_dr-burcu-akman-celyxmed.png",
      profileUrl: "/doctors/dr-burcu-akman"
    },
    {
      id: "dr-5",
      name: "Dr. Dt. Fikri Can Ayık",
      title: "Ağız ve Çene Cerrahı",
      imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bcd3/67deade75b02537eadc0bec5_dr-dt-fikri-can-ayik.png",
      profileUrl: "/doctors/dt-fikri-can-ayik"
    },
    {
      id: "dr-6",
      name: "Dt. Elif Nil Ada",
      title: "Diş Doktoru",
      imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bcd3/67deade75b02537eadc0bea4_dr-elif-nil-ada-celyxmed.png",
      profileUrl: "/doctors/dr-elif-nil-ada"
    }
  ]
}: DoctorsSectionProps) => {
  return (
    <section className="py-24">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {description}
            </p>
          </div>

          <div style={{ opacity: 1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doctor) => (
                <div key={doctor.id} role="listitem" className="group">
                  <div className="relative transition-all duration-300 transform hover:-translate-y-2"
                       style={{ opacity: 1, transformStyle: 'preserve-3d' }}>
                    <Link href={doctor.profileUrl} className="block relative overflow-hidden rounded-xl">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={doctor.imageUrl}
                          alt={doctor.name}
                          className="object-cover w-full h-full rounded-xl"
                        />
                      </div>
                      <div
                        className="absolute inset-0 bg-gradient-to-tr from-[#4a8f9c]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                        style={{ willChange: 'transform', transform: 'translate3d(25%, 0%, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)', transformStyle: 'preserve-3d' }}
                      ></div>
                    </Link>
                    <div className="mt-4">
                      <Link href={doctor.profileUrl} className="block group-hover:text-[#4a8f9c] transition-colors duration-300">
                        <div className="text-2xl font-medium text-gray-900 dark:text-white">
                          {doctor.name}
                        </div>
                        <div className="opacity-70 mt-1">
                          <div className="text-sm font-medium uppercase text-gray-600 dark:text-gray-400">
                            {doctor.title}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;