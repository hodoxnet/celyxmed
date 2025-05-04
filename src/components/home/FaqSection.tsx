import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// SSS verileri Türkçeleştirildi ve yapı güncellendi (id kullanıldı)
const faqData = [
  {
    id: "faq-home-1",
    question: "Celyxmed hangi tedavileri sunuyor?",
    answer: "Celyxmed, bariatrik cerrahi, plastik cerrahi, diş estetiği, saç ekimi ve çeşitli medikal tedaviler dahil olmak üzere geniş bir yelpazede tedavi sunmaktadır."
  },
  {
    id: "faq-home-2",
    question: "Neden diğer klinikler yerine Celyxmed'i seçmeliyim?",
    answer: "Celyxmed, JCI akreditasyonlu klinikleri, deneyimli doktorları ve kişiselleştirilmiş bakımıyla binlerce uluslararası hasta tarafından güvenilmektedir. Yüksek kaliteli tedavileri uygun fiyatlarla sunuyoruz."
  },
  {
    id: "faq-home-3",
    question: "Türkiye tıbbi tedaviler için güvenli mi?",
    answer: "Evet, Türkiye medikal turizm için önde gelen destinasyonlardan biridir. Dünya standartlarında klinikler, deneyimli doktorlar ve uygun fiyatlı tedavi seçenekleri ile her yıl binlerce hastayı cezbetmektedir."
  },
  {
    id: "faq-home-4",
    question: "Nasıl konsültasyon randevusu alabilirim?",
    answer: "Ücretsiz konsültasyonunuzu web sitemiz üzerinden veya WhatsApp, e-posta ya da telefon yoluyla bizimle iletişime geçerek alabilirsiniz. Ekibimiz süreç boyunca size rehberlik edecektir."
  },
  {
    id: "faq-home-5",
    question: "Doktorlarla online görüşme yapabilir miyim?",
    answer: "Evet, ziyaretinizden önce ihtiyaçlarınızı görüşmek ve kişiselleştirilmiş tedavi tavsiyesi almak için uzmanlarımızla online konsültasyon planlayabilirsiniz."
  },
   {
    id: "faq-home-6",
    question: "Yerel doktorumdan bir sevk almam gerekiyor mu?",
    answer: "Hayır, sevk gerekmez. Sadece Celyxmed ile bir konsültasyon ayarlayın, gerisini biz hallederiz."
  },
   {
    id: "faq-home-7",
    question: "Celyxmed havaalanı transferlerini ayarlıyor mu?",
    answer: "Evet, hastalarımızın İstanbul'a varışlarında sorunsuz ve konforlu bir deneyim yaşamalarını sağlamak için havaalanı transferleri sağlıyoruz."
  },
   {
    id: "faq-home-8",
    question: "Konaklama düzenlemeleri konusunda yardımcı olabilir misiniz?",
    answer: "Evet, tedavi süreciniz boyunca konforlu bir konaklama sağlamak için kliniklerimize yakın konaklama rezervasyonu konusunda yardımcı oluyoruz."
  },
   {
    id: "faq-home-9",
    question: "Tedavim için Türkiye'de ne kadar kalmalıyım?",
    answer: "Süre, tedavi türüne bağlıdır. Ekibimiz konsültasyonunuzdan sonra ayrıntılı bir zaman çizelgesi sunacaktır."
  }
];

const FaqSection = () => {
  return (
    // Stil hizmet detay ile aynı yapıldı (dark mode dahil)
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Başlık stili hizmet detay ile aynı yapıldı */}
        <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Sıkça Sorulan Sorular ve Çözümleri {/* Başlık Türkçeleştirildi */}
          </h2>
          {/* İsteğe bağlı açıklama eklenebilir:
          <p className="text-base text-gray-600 dark:text-gray-400">Açıklama buraya</p>
          */}
        </div>

        {/* Ekstra sarmalayıcı div kaldırıldı, Accordion stilleri güncellendi */}
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqData.map((item) => ( // Değişken adı 'item' olarak değiştirildi
            // React.Fragment eklendi (hizmet detaydaki gibi)
            <React.Fragment key={item.id}>
              {/* AccordionItem stili hizmet detay ile aynı yapıldı */}
              <AccordionItem value={item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-none overflow-hidden">
                {/* AccordionTrigger stili hizmet detay ile aynı yapıldı */}
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline px-6 py-5 text-gray-900 dark:text-white">
                  {item.question}
                </AccordionTrigger>
                {/* AccordionContent stili ve cevap renderlama hizmet detay ile aynı yapıldı */}
                <AccordionContent className="px-6 pb-6 pt-0">
                   <div
                    className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </AccordionContent>
              </AccordionItem>
            </React.Fragment>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
