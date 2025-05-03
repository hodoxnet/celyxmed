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
            <Button size="lg" asChild>
              <Link href="/#treatments"> {/* Örnek link */}
                Learn More About Our Treatments
                {/* İkon eklenebilir */}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">
                Book Your Free Consultation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
