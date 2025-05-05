"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import TableOfContents from '@/components/hizmet-detay/TableOfContents';
import WhyTrustSection from '@/components/home/WhyTrustSection';
import ClinicShowcase from '@/components/home/ClinicShowcase';
import ProcedureSteps from '@/components/hizmet-detay/ProcedureSteps';
import BlogPreview from '@/components/home/BlogPreview';

// Statik veri (ileride dinamik hale getirilebilir)
const blogData = {
  title: 'Her İnsanda Yirmilik Diş Var mıdır? Fonksiyonlar ve Çıkarımlar',
  fullDescription: 'Her insanın yirmilik dişleri var mıdır, özellikle daha fazla kişi bu üçüncü azı dişleriyle ilgili sorunlar yaşadığından, diş sağlığı konusunda sıkça sorulan bir sorudur. Yirmilik dişler olarak da bilinirler ve genellikle 17 ila 25 yaşları arasında çıkarlar; ancak herkeste görülmezler. Evrimsel değişiklikler ve modern beslenme etkileri nedeniyle bazı kişilerde bir, birden fazla veya hiç yirmilik diş olmayabilir. Bu dişlere sahip olanlarda, bu azı dişleri sıkışıklık, gömülülük ve hizalama sorunlarına neden olabilir ve genellikle çekilmesi gerekir. Yirmilik dişlerin rolünü, yaygın çekilme nedenlerini ve ağız sağlığı üzerindeki etkilerini anlayarak, bireyler uzun vadeli diş sağlığını korumak için bilinçli kararlar alabilirler.',
  coverImageUrl: '/placeholder-cover.jpg', // Yer tutucu resim yolu
  content: `
    <h2 id="giris">Giriş</h2>
    <p>Yirmilik dişler, diş hekimliğinde sıkça tartışılan bir konudur. Bu dişler, ağzımızın en arkasında bulunan üçüncü azı dişleridir ve genellikle ergenlik sonrası veya genç yetişkinlik döneminde ortaya çıkarlar. Ancak, herkesin yirmilik dişleri olmayabilir veya bu dişler tamamen farklı şekillerde gelişebilir. Bu makalede, yirmilik dişlerin gelişimi, fonksiyonları ve neden bazı insanlarda sorun yarattığı hakkında detaylı bilgiler sunacağız.</p>

    <h2 id="gelisim">Yirmi Yaş Dişlerini ve Gelişimlerini Anlamak</h2>
    <p>Yirmi yaş dişleri, tıbbi olarak üçüncü azı dişleri olarak adlandırılır. Bu dişler, genellikle 17-25 yaş aralığında ortaya çıktıkları için "yirmilik diş" olarak bilinirler. İnsan ağzında toplam dört adet yirmilik diş bulunabilir - her çenenin sağ ve sol tarafında birer tane.</p>
    
    <p>Yirmilik dişlerin gelişimi şu aşamalardan geçer:</p>
    
    <ul>
      <li><strong>Oluşum Aşaması:</strong> Diş tomurcukları, çocukluk döneminde çene kemiği içinde oluşmaya başlar.</li>
      <li><strong>Kalsifikasyon:</strong> Diş mineralizasyonu 7-10 yaş civarında başlar.</li>
      <li><strong>Kök Gelişimi:</strong> Diş kökleri, ergenlik döneminde gelişmeye devam eder.</li>
      <li><strong>Sürme:</strong> Dişler genellikle 17-25 yaş arasında diş etini delerek ağız boşluğuna çıkar.</li>
    </ul>
    
    <p>Ancak, bu gelişim süreci her insanda aynı şekilde gerçekleşmez. Bazı insanlarda yirmilik dişler hiç oluşmayabilir (konjenital eksiklik), bazılarında ise bu dişler çene kemiği içinde gömülü kalabilir veya anormal pozisyonlarda gelişebilir.</p>

    <h3 id="evrim">Üçüncü Azı Dişlerine İlişkin Evrimsel Bakış Açısı</h3>
    <p>Yirmilik dişlerin rolü zamanla evrimleşmiştir. Antropologlar, atalarımızın daha büyük çenelere ve daha sert besinleri öğütmek için daha fazla azı dişine ihtiyaç duyduğunu belirtmektedir. Ancak, insanların beslenme alışkanlıklarının değişmesi ve daha yumuşak, pişmiş gıdaların tüketilmesiyle birlikte, çene boyutları küçülmüştür.</p>
    
    <p>Modern insanların çeneleri, genellikle 32 dişi (yirmilik dişler dahil) barındıracak kadar büyük değildir. Bu nedenle, yirmilik dişler çıkmaya çalıştığında, genellikle yeterli alan bulamazlar ve çeşitli sorunlara yol açabilirler.</p>
    
    <p>Evrimsel perspektiften bakıldığında, yirmilik dişler "vestigial" (körelmiş) yapılar olarak kabul edilebilir - yani, bir zamanlar atalarımız için işlevsel olan, ancak modern insanlar için artık o kadar gerekli olmayan yapılar.</p>

    <h2 id="sorunlar">Yirmilik Dişlerin Olası Sorunları</h2>
    <p>Yirmilik dişler, çeşitli nedenlerle sorun yaratabilir:</p>
    
    <ul>
      <li><strong>Gömülü Kalma:</strong> Diş, çene kemiği içinde tamamen veya kısmen gömülü kalabilir.</li>
      <li><strong>Açılı Çıkma:</strong> Diş, komşu dişlere doğru eğik bir şekilde çıkabilir.</li>
      <li><strong>Sıkışma:</strong> Çenede yeterli alan olmadığında, diş sıkışabilir ve ağrıya neden olabilir.</li>
      <li><strong>Enfeksiyon:</strong> Kısmen çıkmış dişler etrafında, perikoronitis adı verilen enfeksiyonlar gelişebilir.</li>
      <li><strong>Kist Oluşumu:</strong> Gömülü dişler etrafında kistler oluşabilir.</li>
      <li><strong>Komşu Dişlerde Hasar:</strong> Yanlış açıyla çıkan yirmilik dişler, komşu dişlere zarar verebilir.</li>
    </ul>

    <h2 id="cekilme">Yirmilik Dişlerin Çekilmesi</h2>
    <p>Yirmilik dişlerin çekilmesi, diş hekimliğinde en yaygın cerrahi işlemlerden biridir. Diş hekimleri genellikle şu durumlarda yirmilik dişlerin çekilmesini önerirler:</p>
    
    <ul>
      <li>Diş ağrısına neden oluyorsa</li>
      <li>Enfeksiyon gelişmişse</li>
      <li>Komşu dişlere zarar veriyorsa veya verme riski varsa</li>
      <li>Diş çürüğü varsa ve tedavi edilemiyorsa</li>
      <li>Kist veya tümör oluşmuşsa</li>
      <li>Ortodontik tedavi planı gerektiriyorsa</li>
    </ul>
    
    <p>Çekim işlemi, dişin durumuna bağlı olarak basit veya cerrahi olabilir. Gömülü dişlerin çekilmesi genellikle daha karmaşık bir cerrahi işlem gerektirir.</p>

    <h2 id="ortodonti">Yirmilik Dişler ve Ortodontik Tedavi</h2>
    <p>Ortodontistler, yirmilik dişlerin diğer dişlerin dizilimini etkileyebileceğini ve ortodontik tedavi sonuçlarını bozabileceğini belirtmektedir. Bu nedenle, ortodontik tedavi gören veya görecek olan hastalarda, yirmilik dişlerin durumu dikkatle değerlendirilir.</p>
    
    <p>Bazı durumlarda, ortodontik tedavi öncesinde yirmilik dişlerin çekilmesi önerilebilir. Bu, tedavi sonuçlarının daha stabil olmasını sağlayabilir ve dişlerin yeniden kaymasını önleyebilir.</p>

    <h2 id="koruma">Yirmilik Dişlerin Korunması</h2>
    <p>Her yirmilik diş sorun yaratmaz. Eğer yirmilik dişleriniz tam olarak çıkmışsa, doğru pozisyondaysa ve iyi temizlenebiliyorsa, bu dişleri korumak mümkündür. Düzenli diş fırçalama ve diş ipi kullanımı, yirmilik dişlerin sağlığını korumak için önemlidir.</p>
    
    <p>Ancak, yirmilik dişlerin ağzın en arka kısmında olması nedeniyle, bu bölgeyi temizlemek zor olabilir. Bu nedenle, yirmilik dişleri olan kişilerin ağız hijyenine ekstra özen göstermesi gerekir.</p>

    <h4 id="ozet">Bu Bölümdeki Önemli Görüşlerin Özeti</h4>
    <ul>
      <li>Yirmi yaş dişleri olarak da bilinen üçüncü azı dişleri genellikle 17 ila 25 yaşları arasında çıkarlar.</li>
      <li>Evrimsel süreçte çene yapımızın küçülmesiyle bu dişler için yeterli alan kalmamıştır.</li>
      <li>Herkesin yirmilik dişleri olmayabilir veya farklı sayılarda olabilir.</li>
      <li>Yirmilik dişler çeşitli sorunlara yol açabilir: gömülü kalma, açılı çıkma, sıkışma, enfeksiyon.</li>
      <li>Sorun yaratan yirmilik dişlerin çekilmesi yaygın bir uygulamadır.</li>
      <li>Sorunsuz çıkan ve iyi temizlenebilen yirmilik dişler korunabilir.</li>
    </ul>

    <h2 id="sonuc">Sonuç</h2>
    <p>Yirmilik dişler, her insanda farklı şekillerde gelişebilir ve farklı sorunlara yol açabilir. Bu dişlerin durumu, düzenli diş hekimi kontrolleri sırasında değerlendirilmelidir. Eğer yirmilik dişlerinizle ilgili endişeleriniz varsa, bir diş hekimine danışmanız önemlidir.</p>
    
    <p>Unutmayın ki, her vaka benzersizdir ve tedavi kararları kişiye özel olarak verilmelidir. Diş hekiminiz, sizin için en uygun yaklaşımı belirleyecektir.</p>
  `,
  tocItems: [ // Statik içindekiler öğeleri (TableOfContents için text gerekli)
    { id: 'giris', text: 'Giriş' },
    { id: 'gelisim', text: 'Yirmi Yaş Dişlerini ve Gelişimlerini Anlamak' },
    { id: 'evrim', text: 'Üçüncü Azı Dişlerine İlişkin Evrimsel Bakış Açısı' },
    { id: 'sorunlar', text: 'Yirmilik Dişlerin Olası Sorunları' },
    { id: 'cekilme', text: 'Yirmilik Dişlerin Çekilmesi' },
    { id: 'ortodonti', text: 'Yirmilik Dişler ve Ortodontik Tedavi' },
    { id: 'koruma', text: 'Yirmilik Dişlerin Korunması' },
    { id: 'ozet', text: 'Bu Bölümdeki Önemli Görüşlerin Özeti' },
    { id: 'sonuc', text: 'Sonuç' }
  ]
};

// ProcedureSteps için statik veri
const procedureData = {
  sectionTitle: "Blog Yazım Süreci",
  steps: [
    { id: "1", title: "Araştırma", description: "Konu hakkında detaylı araştırma yapılır." },
    { id: "2", title: "Taslak Oluşturma", description: "Yazının ana hatları belirlenir." },
    { id: "3", title: "Yazım", description: "İçerik detaylı bir şekilde yazılır." },
    { id: "4", title: "Düzenleme", description: "Yazım ve dilbilgisi hataları kontrol edilir." },
    { id: "5", title: "Yayınlama", description: "Blog yazısı yayına alınır." },
  ]
};

const BlogDetailPage = () => {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <main className="container mx-auto px-4 pb-8 pt-40"> {/* Navbar için üst padding eklendi */}
      {/* Blog Başlığı - Ortalanmış ve büyütülmüş */}
      <section className="mb-8 text-center pt-16 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-slate-800">{blogData.title}</h1>
        
        {/* Uzun açıklama - Görseldeki gibi */}
        <p className="text-base text-slate-700 leading-relaxed mb-16">
          {blogData.fullDescription}
        </p>
      </section>

      {/* İçindekiler - Daraltılabilir/Genişletilebilir */}
      <section className="mb-12 max-w-4xl mx-auto">
        <div 
          className="bg-gray-50 rounded-lg shadow-sm p-4 cursor-pointer"
          onClick={() => setTocOpen(!tocOpen)}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-slate-800">İçindekiler</h2>
            <ChevronDown 
              className={`w-5 h-5 text-slate-500 transition-transform ${tocOpen ? 'transform rotate-180' : ''}`} 
            />
          </div>
          
          {tocOpen && (
            <div className="mt-4">
              <ul className="space-y-2">
                {blogData.tocItems.map(item => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="text-blue-600 hover:underline">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Blog İçeriği */}
      <article className="prose lg:prose-xl max-w-4xl mx-auto mb-16" dangerouslySetInnerHTML={{ __html: blogData.content }} />

      {/* Yeniden Kullanılabilir Bileşenler */}
      <div className="max-w-6xl mx-auto">
        <WhyTrustSection />
        <ClinicShowcase />
        <ProcedureSteps sectionTitle={procedureData.sectionTitle} steps={procedureData.steps} />
        <BlogPreview />
      </div>
    </main>
  );
};

export default BlogDetailPage;
