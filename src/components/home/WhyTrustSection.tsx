import React from 'react';

// index.html'den alınan içerik
const trustPoints = [
  {
    number: "01",
    title: "Experienced Specialists",
    description: "Our doctors bring over 10, 15, and even 25 years of experience in their fields, ensuring the best care and successful results."
  },
  {
    number: "02",
    title: "Trusted Care, Accredited Standards",
    description: "Our state-of-the-art clinic provides high-quality treatments in a safe and hygienic environment. For aesthetic surgeries, we collaborate with JCI-accredited partner hospitals to ensure the highest international healthcare standards."
  },
  {
    number: "03",
    title: "Personalized Patient Care",
    description: "We provide tailored treatment plans, continuous support, and patient-first care from consultation to recovery."
  },
  {
    number: "04",
    title: "Global Patient Trust",
    description: "Thousands of patients from the United States, Europe, and the Middle East trust Celyxmed for safe, effective, and affordable treatments in Turkey."
  }
];

// Arka plan görseli URL'si (index.html'den)
const backgroundImageUrl = "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e1977ec2780fa31f9701_why-trust-celyxmed-your-health-our-priority.avif"; // Bu URL'yi kontrol et

const WhyTrustSection = () => {
  return (
    <section
      className="py-20 md:py-32 bg-cover bg-center bg-no-repeat relative text-white"
      style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80 z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
            Why Trust Celyxmed?<br />Your Health, Our Priority
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {trustPoints.map((point) => (
            <div key={point.number} className="flex items-start space-x-4">
              <div className="text-4xl font-bold text-cyan-400 flex-shrink-0 mt-1"> {/* Numara stili */}
                {point.number}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
                <p className="text-gray-300">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTrustSection;
