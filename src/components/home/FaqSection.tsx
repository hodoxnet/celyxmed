import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// SSS verileri (index.html'den alınmıştır)
const faqData = [
  {
    value: "item-1",
    question: "What treatments does Celyxmed offer?",
    answer: "Celyxmed offers a wide range of treatments, including bariatric surgery, plastic surgery, dental aesthetics, hair transplant, and various medical treatments."
  },
  {
    value: "item-2",
    question: "Why should I choose Celyxmed over other clinics?",
    answer: "Celyxmed is trusted by thousands of international patients for its JCI-accredited clinics, experienced doctors, and personalized care. We provide high-quality treatments at affordable prices."
  },
  {
    value: "item-3",
    question: "Is Turkey safe for medical treatments?",
    answer: "Yes, Turkey is one of the leading destinations for medical tourism. With world-class clinics, experienced doctors, and affordable treatment options, it attracts thousands of patients every year."
  },
  {
    value: "item-4",
    question: "How can I book a consultation?",
    answer: "You can book your free consultation through our website or by contacting us via WhatsApp, email, or phone. Our team will guide you through the process."
  },
  {
    value: "item-5",
    question: "Can I consult with doctors online?",
    answer: "Yes, you can schedule an online consultation with our specialists to discuss your needs and get personalized treatment advice before your visit."
  },
   {
    value: "item-6",
    question: "Do I need a referral from my local doctor?",
    answer: "No referral is needed. Simply book a consultation with Celyxmed, and we’ll handle the rest."
  },
   {
    value: "item-7",
    question: "Does Celyxmed arrange airport transfers?",
    answer: "Yes, we provide airport transfers for our patients to ensure a smooth and comfortable experience upon arrival in Istanbul."
  },
   {
    value: "item-8",
    question: "Can you help with accommodation arrangements?",
    answer: "Yes, we offer assistance with booking accommodation near our clinics, ensuring a comfortable stay during your treatment journey."
  },
   {
    value: "item-9",
    question: "How long should I stay in Turkey for my treatment?",
    answer: "The duration depends on the type of treatment. Our team will provide a detailed timeline after your consultation."
  }
];

const FaqSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50"> {/* Arka plan rengi */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800">
            Frequently Asked Questions and Solutions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto"> {/* Akordiyonu ortala ve genişliği sınırla */}
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqData.map((faq) => (
              <AccordionItem key={faq.value} value={faq.value} className="border rounded-lg bg-white shadow-sm px-4">
                <AccordionTrigger className="text-left font-medium text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
