import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL gereklidir ve bir string olmalıdır.' }, { status: 400 });
    }

    // URL'nin geçerli bir HTTP/HTTPS URL olup olmadığını kontrol et (basit kontrol)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json({ error: 'Geçersiz URL formatı.' }, { status: 400 });
    }
    
    // İzin verilen domain kontrolü (isteğe bağlı, güvenlik için)
    // const allowedDomain = "www.celyxmed.com";
    // if (!new URL(url).hostname.endsWith(allowedDomain)) {
    //   return NextResponse.json({ error: 'İzin verilmeyen domain.' }, { status: 403 });
    // }

    const response = await fetch(url, {
      headers: {
        // Bazı siteler botları engellemek için User-Agent kontrolü yapabilir
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `URL'den veri alınamadı. Durum: ${response.status}` }, { status: response.status });
    }

    const htmlContent = await response.text();
    
    const $ = cheerio.load(htmlContent);

    // Sayfa Başlığı
    const pageTitle = $('title').text().trim();
    
    // Meta Açıklaması
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || "";

    // Ana Başlık (Genellikle ilk H1)
    // Eski sitede hero bölümünde büyük bir başlık vardı, onu hedefleyebiliriz.
    // Örnek seçici: .hero-content h1, .page-header h1, veya sadece h1
    // Tarayıcı incelemesinde ilk ekran görüntüsünde "Mommy Makeover in der Türkei" başlığı vardı.
    // Bu genellikle bir h1 içinde olur.
    let h1 = $('h1').first().text().trim();
    if (!h1) {
      // Alternatif olarak, belirli bir section içindeki başlığı arayabiliriz.
      // Bu seçiciler sitenin yapısına göre ayarlanmalı.
      h1 = $('.elementor-widget-theme-page-title .elementor-heading-title').first().text().trim();
    }


    // SSS (Sıkça Sorulan Sorular)
    // Tarayıcı incelemesinde "Häufig gestellte Fragen..." başlığı ve akordeonlar vardı.
    // Akordeon yapısı genellikle bir sarmalayıcı, bir soru başlığı ve bir cevap içeriği içerir.
    // Örnek seçiciler (bunlar sitenin gerçek yapısına göre ayarlanmalıdır):
    const faqs: { question: string; answer: string }[] = [];
    
    // Sağlanan HTML'e göre SSS seçicisi
    // Her bir SSS öğesi .faq-item sınıfına sahip bir div içinde.
    // Soru: .faq-item .faq-title h2 veya .faq-item .faq-title içinde.
    // Cevap: .faq-item .faq-bottom .w-richtext içinde.
    $('.faq-item').each((i, el) => {
      let question = $(el).find('.faq-title h2 strong').text().trim();
      if (!question) {
        question = $(el).find('.faq-title h2').text().trim();
      }
      if (!question) {
        question = $(el).find('.faq-title').text().trim();
      }
      
      // Cevap bölümündeki tüm metni almak için .text() kullanıyoruz.
      // Eğer HTML yapısını korumak isterseniz .html() kullanabilirsiniz,
      // ancak form alanına düz metin aktarmak daha yaygındır.
      const answer = $(el).find('.faq-bottom .w-richtext').text().trim();
      
      if (question && answer) {
        faqs.push({ question, answer });
      }
    });

    // İçindekiler Modülü
    const tocTitle = "Inhaltsverzeichnis"; // Sabit veya dinamik çekilebilir
    const tocAuthorRaw = $('.faq-item-2 > p.text-size-regular.doktor').html() || "";
    let tocAuthorInfo = "";
    if (tocAuthorRaw) {
      const authorMatch = tocAuthorRaw.match(/Inhalt Autor<\/strong>:\s*(.*?)(<br|\n)/i);
      if (authorMatch && authorMatch[1]) {
        tocAuthorInfo = authorMatch[1].trim();
      }
    }
    const tocCtaDescription = $('.about-flex-wrapper .interaction p.heading-8').text().trim();
    const tocItems: { text: string; level: number, isBold: boolean, order: number, targetId: string | undefined }[] = [];
    $('.faq-item-2 .faq-bottom-2 .w-richtext li').each((i, el) => {
      const strongText = $(el).find('strong').text().trim();
      const fullText = $(el).text().trim();
      const isBold = !!strongText && strongText === fullText.replace(/\d+\.\d+\s*/, '').trim(); // Check if the entire text content (excluding numbering) is bold
      
      // Level belirleme (örneğin, baştaki sayılara göre)
      let level = 1;
      const matchLevel = fullText.match(/^(\d+)\.(\d+)\s/); // 1.1 gibi
      const matchTopLevel = fullText.match(/^(\d+)\s/); // 1 gibi (ama 1.1 ile çakışmamalı)

      if (matchLevel) {
        level = 2; // veya 3, alt madde sayısına göre
      } else if (matchTopLevel && !matchLevel) {
        level = 1;
      }
      
      tocItems.push({ 
        text: fullText.replace(/^\d+(\.\d+)*\s*/, '').trim(), // Numaralandırmayı kaldır
        level: level, 
        isBold: isBold,
        order: i,
        targetId: $(el).find('a').attr('href') || undefined // Eğer link varsa
      });
    });


    // Giriş Bölümü
    const videoUrl = $('.video.w-video.w-embed iframe.embedly-embed').attr('src') || "";
    let videoId = "";
    if (videoUrl) {
      try {
        const urlParams = new URL(videoUrl).searchParams;
        const srcParam = urlParams.get('src');
        if (srcParam) {
          const youtubeUrl = new URL(srcParam);
          videoId = youtubeUrl.searchParams.get('v') || "";
        }
      } catch (e) { console.error("Video URL parse error:", e); }
    }
    const introTitle = $('.integrations-banner-left .integrations-banner-heading-2 .heading-8.tedavi-basl-k').text().trim();
    const introDescription = $('.integrations-banner-left .integrations-banner-heading-2 div:not([class])').text().trim();
    const introPrimaryButtonText = $('.integrations-banner-left .double-button a.form-2 .button-primary-text div').text().trim();
    const introSecondaryButtonText = $('.integrations-banner-left .double-button a.button-tertiary div').text().trim();
    const introLinks: { number: string; text: string, targetId: string | undefined, order: number }[] = [];
    $('.integrations-banner-right .integrations-row').each((i, el) => {
      const number = $(el).find('.opacity-72 .text-size-large').text().trim();
      const text = $(el).find('a .text-size-large, div > .text-size-large').last().text().trim(); // Hem linkli hem linkli olmayanlar için
      const targetId = $(el).find('a').attr('href') || undefined;
      if (number && text) {
        introLinks.push({ number, text, targetId, order: i });
      }
    });

    // Genel Bakış Bölümü
    const overviewSectionTitle = $('section#1 .tabs-heading .heading-4').text().trim();
    const overviewSectionDescription = $('section#1 .tabs-heading .max-width-45ch div').text().trim();
    const overviewTabs: { value: string, triggerText: string, title: string, content: string, buttonText: string, imagePath?: string, imageAlt?: string, order: number }[] = [];
    $('section#1 .tab-component .tab-menu a.tab').each((i, tabEl) => {
      const triggerText = $(tabEl).text().trim();
      const tabValue = triggerText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // İlgili tab içeriğini bul
      // Webflow tabları genellikle data-w-tab attribute'u ile eşleşir.
      // Bu örnekte, tab menüsündeki sırayla tab içeriklerini eşleştireceğiz.
      const tabContentEl = $(`.tab-component .tab-content .w-tab-pane`).eq(i);

      const title = tabContentEl.find('.cta-heading .heading-3').text().trim();
      const content = tabContentEl.find('.cta-content div').text().trim();
      const buttonText = tabContentEl.find('.button-primary .button-primary-text div').text().trim();
      const imagePath = tabContentEl.find('.banner-image-wrapper .banner-image img').attr('src');
      const imageAlt = tabContentEl.find('.banner-image-wrapper .banner-image img').attr('alt');

      if (triggerText && title && content) {
        overviewTabs.push({
          value: tabValue,
          triggerText,
          title,
          content,
          buttonText,
          imagePath: imagePath || undefined,
          imageAlt: imageAlt || undefined,
          order: i
        });
      }
    });


    const scrapedData = {
      pageTitle,
      metaDescription,
      h1,
      faqs,
      tocTitle,
      tocAuthorInfo,
      tocCtaDescription,
      tocItems,
      videoId,
      introTitle,
      introDescription,
      introPrimaryButtonText,
      introSecondaryButtonText,
      introLinks,
      overviewSectionTitle,
      overviewSectionDescription,
      overviewTabs,
    };

    // Neden Celyxmed Bölümü (Why Section)
    const whySectionTitle = $('section#2 .parallax-heading-size').text().trim();
    const whyItems: { number: string; title: string; description: string; order: number }[] = [];
    $('section#2 .integrations-component .integrations').each((i, el) => {
      const number = $(el).children('.text-size-large').first().text().trim();
      const title = $(el).find('.wrapper .text-weight-medium.why').text().trim();
      const description = $(el).find('.wrapper .opacity-70 div').text().trim();
      if (number && title && description) {
        whyItems.push({ number, title, description, order: i });
      }
    });

    if (whySectionTitle) {
      (scrapedData as any).whySectionTitle = whySectionTitle;
    }
    if (whySectionTitle) {
      (scrapedData as any).whySectionTitle = whySectionTitle;
    }
    if (whyItems.length > 0) {
      (scrapedData as any).whyItems = whyItems;
    }

    // Temel Bilgiler - Kısa Açıklama ve Slug
    const shortDescription = $('.hero-section-component-4 .home-hero-heading .max-width-50ch p.text-size-regular').text().trim();
    let slug = "";
    try {
      const pathSegments = new URL(url).pathname.split('/');
      slug = pathSegments.pop() || pathSegments.pop() || ""; // Sonda / olabilir diye iki pop
    } catch (e) {
      console.error("Slug URL parse error:", e);
    }

    if (shortDescription) {
      (scrapedData as any).shortDescription = shortDescription;
    }
    if (shortDescription) {
      (scrapedData as any).shortDescription = shortDescription;
    }
    if (slug) {
      (scrapedData as any).slug = slug;
    }

    // Galeri Bölümü
    const gallerySectionTitle = $('section#galeri .home-integrations-header-2 .heading-7').text().trim();
    const gallerySectionDescription = $('section#galeri .home-integrations-header-2 .max-width-40ch-3 div').text().trim();
    const galleryImages: { src: string; alt: string; order: number }[] = [];
    // Marquee içindeki ilk set resimleri alalım, ikinci set genellikle klondur.
    $('section#galeri .marquee-hero-wrapper .marquee').first().find('.marquee-image img').each((i, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      if (src) {
        galleryImages.push({ src, alt: alt || "", order: i });
      }
    });

    if (gallerySectionTitle) {
      (scrapedData as any).gallerySectionTitle = gallerySectionTitle;
    }
    if (gallerySectionDescription) {
      (scrapedData as any).gallerySectionDescription = gallerySectionDescription;
    }
    if (galleryImages.length > 0) {
      // Formda galleryImages alanı HizmetGalleryImage[] tipinde, API'den gelen ise {src, alt, order}
      // Bu eşleşiyor.
      (scrapedData as any).galleryImagesData = galleryImages; 
    }

    // Yorumlar Bölümü (Testimonials Section)
    const testimonials: { text: string; author: string; treatment: string; imageUrl?: string; stars: number; order: number }[] = [];
    $('section#galeri .testimonial-grid-card-2').each((i, el) => {
      const text = $(el).children('.text-size-medium.text-weight-medium').text().trim();
      const author = $(el).find('.testimonial-card-info .info-content .text-weight-bold').text().trim();
      const treatment = $(el).find('.testimonial-card-info .info-content .info-description div').text().trim();
      const imageUrl = $(el).find('.testimonial-card-info .info-image img').attr('src');
      // Yıldızları saymak yerine varsayılan olarak 5 atayalım, gerekirse HTML'den okunabilir.
      const stars = 5; 

      if (text && author) {
        testimonials.push({ text, author, treatment, imageUrl: imageUrl || undefined, stars, order: i });
      }
    });

    if (testimonials.length > 0) {
      (scrapedData as any).testimonials = testimonials;
    }

    // Prosedür Adımları Bölümü (Steps Section)
    // HTML'de bu bölüm div#4 veya .procedure class'ı ile başlıyor gibi.
    // Başlık ve açıklama .testimonial-slider-component .heading-testimonial-section içinde.
    // Adımlar .slider .slide içinde.
    const stepsSectionNode = $('.testimonial-slider-component'); // Bu genel bir sarmalayıcı
    
    const stepsSectionTitle = stepsSectionNode.find('.heading-testimonial-section h2.heading-6').text().trim();
    const stepsSectionDescription = stepsSectionNode.find('.heading-testimonial-section h2.heading-6 + div').text().trim();
    const procedureSteps: { title: string; description: string; linkText?: string; order: number }[] = [];

    stepsSectionNode.find('.slider .slide').each((i, el) => {
      const title = $(el).find('.slider-card .slider-text .text-size-large').text().trim();
      const description = $(el).find('.slider-card .slider-text .text-size-medium').text().trim();
      const linkText = $(el).find('.slider-card .learn-button .text-size-small.text-weight-medium').text().trim();
      
      if (title && description) {
        procedureSteps.push({ title, description, linkText: linkText || undefined, order: i });
      }
    });

    if (stepsSectionTitle) {
      (scrapedData as any).stepsSectionTitle = stepsSectionTitle;
    }
    if (stepsSectionDescription) {
      (scrapedData as any).stepsSectionDescription = stepsSectionDescription;
    }
    if (procedureSteps.length > 0) {
      (scrapedData as any).procedureSteps = procedureSteps;
    }

    return NextResponse.json(scrapedData);

  } catch (error: any) {
    console.error('Scraping hatası:', error);
    return NextResponse.json({ error: 'Veri çekme sırasında bir hata oluştu.', details: error.message }, { status: 500 });
  }
}
