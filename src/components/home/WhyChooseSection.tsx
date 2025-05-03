import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const WhyChooseSection = () => {
  // index.html'deki iframe src'si
  const videoSrc = "//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2Fgm_x8mMJ6i0%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dgm_x8mMJ6i0&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2Fgm_x8mMJ6i0%2Fhqdefault.jpg&type=text%2Fhtml&schema=youtube";

  return (
    <section className="py-16 md:py-24 bg-gray-50"> {/* Arka plan rengi eklendi */}
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Video */}
          <div className="aspect-video mb-8"> {/* Aspect ratio koruma */}
            <iframe
              className="w-full h-full rounded-lg shadow-md" // Stil eklendi
              src={videoSrc}
              width="940" // Orijinal boyutlar (isteğe bağlı)
              height="528" // Orijinal boyutlar (isteğe bağlı)
              scrolling="no"
              allowFullScreen
              title="Celyxmed"
              loading="lazy" // Lazy loading
            ></iframe>
          </div>

          {/* Başlık */}
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-800">
            Why Choose Celyxmed for Your Health Journey?
          </h2>

          {/* Açıklama */}
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Celyxmed is your trusted partner in healthcare, offering treatments in our state-of-the-art clinic and JCI-accredited partner hospitals. Our highly experienced surgeons, with over 10, 15, and even 25 years of expertise, provide world-class care tailored to your needs, ensuring a safe, comfortable, and successful health journey.
          </p>

          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/#treatments"
              className="flex items-center bg-[#4a8f9c] hover:bg-[#3d7a86] text-white rounded-[20px] shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="bg-[#d4b978] h-[56px] w-[56px] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
              <span className="px-6 py-4 text-base font-medium">Learn More About Our Treatments</span>
            </Link>
            
            <Link 
              href="/contact"
              className="flex items-center justify-center bg-transparent text-gray-700 hover:bg-gray-100 px-8 py-4 rounded-[20px] shadow-lg transition-all duration-300 text-base font-bold"
            >
              Book Your Free Consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
