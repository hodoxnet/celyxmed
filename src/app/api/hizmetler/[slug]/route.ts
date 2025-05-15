import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Context {
  params: {
    slug: string;
  };
}

// GET: Belirli bir hizmet detayını slug ve locale'e göre getir (Public)
export async function GET(req: Request, context: Context) {
  try {
    const { slug } = context.params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale');
    const defaultLocale = 'tr'; // Varsayılan dili belirle

    if (!locale) {
      return new NextResponse(JSON.stringify({ message: 'Dil parametresi (locale) eksik.' }), { status: 400 });
    }

    // YENİ YAPI: Hizmet ve HizmetTranslation modelleriyle çalışacak şekilde güncellendi
    // Önce belirtilen slug ve locale için çeviriyi bul
    let hizmetTranslation = await prisma.hizmetTranslation.findUnique({
      where: {
        slug_languageCode: { // Unique constraint: slug + language
          slug: slug,
          languageCode: locale,
        },
      },
      include: {
        hizmet: {
          select: {
            id: true,
            published: true,
            heroImageUrl: true,
            heroImageAlt: true,
            whyBackgroundImageUrl: true,
            ctaBackgroundImageUrl: true,
            ctaMainImageUrl: true,
            ctaMainImageAlt: true,
            introVideoId: true,
            marqueeImages: { orderBy: { order: 'asc' } },
            galleryImages: { orderBy: { order: 'asc' } },
            ctaAvatars: { orderBy: { order: 'asc' } },
            // Definition tipindeki modeller ve çevirileri
            overviewTabDefinitions: {
              orderBy: { order: 'asc' },
              include: {
                translations: {
                  where: { languageCode: locale }
                }
              }
            },
            whyItemDefinitions: {
              orderBy: { order: 'asc' },
              include: {
                translations: {
                  where: { languageCode: locale }
                }
              }
            },
            testimonialDefinitions: {
              orderBy: { order: 'asc' },
              include: {
                translations: {
                  where: { languageCode: locale }
                }
              }
            },
            recoveryItemDefinitions: {
              orderBy: { order: 'asc' },
              include: {
                translations: {
                  where: { languageCode: locale }
                }
              }
            },
            expertItemDefinitions: {
              orderBy: { order: 'asc' },
              include: {
                translations: {
                  where: { languageCode: locale }
                }
              }
            },
            pricingPackageDefinitions: {
              orderBy: { order: 'asc' },
              include: {
                translations: {
                  where: { languageCode: locale }
                }
              }
            },
          }
        },
        // Translation'a bağlı modeller
        tocItems: { orderBy: { order: 'asc' } },
        introLinks: { orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
      }
    });

    // Eğer belirtilen dilde çeviri yoksa, içeriği bulmak için slugı kullanarak hizmeti bul
    if (!hizmetTranslation) {
      console.log(`[API] ${locale} dilinde "${slug}" slug'ı için içerik bulunamadı. Hizmet ID'sini bulmaya çalışıyorum.`);
      
      // Slug'a göre herhangi bir dilde içerik ara
      const anyTranslation = await prisma.hizmetTranslation.findFirst({
        where: {
          slug: slug,
        },
        select: {
          hizmetId: true,
        }
      });

      // Eğer herhangi bir dilde bu slug varsa, hizmet ID'sini al ve varsayılan dildeki çevirisini bul
      if (anyTranslation) {
        console.log(`[API] Hizmet ID bulundu: ${anyTranslation.hizmetId}. Varsayılan dildeki çeviriyi arıyorum.`);
        
        hizmetTranslation = await prisma.hizmetTranslation.findFirst({
          where: {
            hizmetId: anyTranslation.hizmetId,
            languageCode: defaultLocale,
          },
          include: {
            hizmet: {
              select: {
                id: true,
                published: true,
                heroImageUrl: true,
                heroImageAlt: true,
                whyBackgroundImageUrl: true,
                ctaBackgroundImageUrl: true,
                ctaMainImageUrl: true,
                ctaMainImageAlt: true,
                introVideoId: true,
                marqueeImages: { orderBy: { order: 'asc' } },
                galleryImages: { orderBy: { order: 'asc' } },
                ctaAvatars: { orderBy: { order: 'asc' } },
                // Definition tipindeki modeller ve çevirileri
                overviewTabDefinitions: {
                  orderBy: { order: 'asc' },
                  include: {
                    translations: {
                      where: { languageCode: defaultLocale }
                    }
                  }
                },
                whyItemDefinitions: {
                  orderBy: { order: 'asc' },
                  include: {
                    translations: {
                      where: { languageCode: defaultLocale }
                    }
                  }
                },
                testimonialDefinitions: {
                  orderBy: { order: 'asc' },
                  include: {
                    translations: {
                      where: { languageCode: defaultLocale }
                    }
                  }
                },
                recoveryItemDefinitions: {
                  orderBy: { order: 'asc' },
                  include: {
                    translations: {
                      where: { languageCode: defaultLocale }
                    }
                  }
                },
                expertItemDefinitions: {
                  orderBy: { order: 'asc' },
                  include: {
                    translations: {
                      where: { languageCode: defaultLocale }
                    }
                  }
                },
                pricingPackageDefinitions: {
                  orderBy: { order: 'asc' },
                  include: {
                    translations: {
                      where: { languageCode: defaultLocale }
                    }
                  }
                },
              }
            },
            // Translation'a bağlı modeller
            tocItems: { orderBy: { order: 'asc' } },
            introLinks: { orderBy: { order: 'asc' } },
            steps: { orderBy: { order: 'asc' } },
            faqs: { orderBy: { order: 'asc' } },
          }
        });
        
        if (hizmetTranslation) {
          console.log(`[API] Varsayılan dilde (${defaultLocale}) içerik bulundu.`);
        }
      }
    }

    if (!hizmetTranslation || !hizmetTranslation.hizmet.published) {
      console.log(`[API] Hizmet bulunamadı veya yayınlanmamış.`);
      return new NextResponse('Not Found', { status: 404 });
    }

    // Verileri, detay sayfasının beklediği formata dönüştür
    const responseData = {
      // Ana bilgiler
      title: hizmetTranslation.title,
      description: hizmetTranslation.description,
      heroImageUrl: hizmetTranslation.hizmet.heroImageUrl,
      heroImageAlt: hizmetTranslation.hizmet.heroImageAlt,
      
      // TOC bölümü
      tocTitle: hizmetTranslation.tocTitle,
      tocAuthorInfo: hizmetTranslation.tocAuthorInfo,
      tocCtaDescription: hizmetTranslation.tocCtaDescription,
      tocItems: hizmetTranslation.tocItems.map(item => ({
        id: item.id,
        text: item.text,
        isBold: item.isBold,
        level: item.level,
        order: item.order
      })),
      
      // Marquee resimleri
      marqueeImages: hizmetTranslation.hizmet.marqueeImages.map(img => ({
        id: img.id,
        src: img.src,
        alt: img.alt,
        order: img.order
      })),
      
      // Intro bölümü
      introVideoId: hizmetTranslation.hizmet.introVideoId, // hizmet'ten alınacak şekilde düzeltildi
      introTitle: hizmetTranslation.introTitle,
      introDescription: hizmetTranslation.introDescription,
      introPrimaryButtonText: hizmetTranslation.introPrimaryButtonText,
      introPrimaryButtonLink: hizmetTranslation.introPrimaryButtonLink,
      introSecondaryButtonText: hizmetTranslation.introSecondaryButtonText,
      introSecondaryButtonLink: hizmetTranslation.introSecondaryButtonLink,
      introLinks: hizmetTranslation.introLinks.map(link => ({
        id: link.id,
        targetId: link.targetId,
        number: link.number,
        text: link.text,
        order: link.order
      })),
      
      // Overview bölümü
      overviewTitle: hizmetTranslation.overviewSectionTitle,
      overviewDescription: hizmetTranslation.overviewSectionDescription,
      overviewTabs: hizmetTranslation.hizmet.overviewTabDefinitions.map(tab => {
        const translation = tab.translations[0]; // İlgili dildeki çeviri
        return {
          id: tab.id,
          value: tab.value,
          triggerText: translation?.triggerText || "",
          title: translation?.title || "",
          content: translation?.content || "",
          imageUrl: tab.imagePath || "",
          imageAlt: tab.imageAlt || "",
          buttonText: translation?.buttonText || "",
          buttonLink: translation?.buttonLink || "",
          order: tab.order
        };
      }),
      
      // Why bölümü
      whyTitle: hizmetTranslation.whySectionTitle,
      whyBackgroundImageUrl: hizmetTranslation.hizmet.whyBackgroundImageUrl,
      whyItems: hizmetTranslation.hizmet.whyItemDefinitions.map(item => {
        const translation = item.translations[0];
        return {
          id: item.id,
          number: item.number,
          title: translation?.title || "",
          description: translation?.description || "",
          order: item.order
        };
      }),
      
      // Gallery bölümü
      galleryTitle: hizmetTranslation.gallerySectionTitle,
      galleryDescription: hizmetTranslation.gallerySectionDescription,
      galleryImages: hizmetTranslation.hizmet.galleryImages.map(img => ({
        id: img.id,
        src: img.src,
        alt: img.alt,
        order: img.order
      })),
      
      // Testimonials bölümü
      testimonialsSectionTitle: hizmetTranslation.testimonialsSectionTitle,
      testimonials: hizmetTranslation.hizmet.testimonialDefinitions.map(item => {
        const translation = item.translations[0];
        return {
          id: item.id,
          stars: item.stars,
          text: translation?.text || "",
          author: translation?.author || "",
          treatment: translation?.treatment || "",
          imageUrl: item.imageUrl || "",
          order: item.order
        };
      }),
      
      // Steps bölümü
      stepsTitle: hizmetTranslation.stepsSectionTitle,
      stepsDescription: hizmetTranslation.stepsSectionDescription,
      steps: hizmetTranslation.steps.map(step => ({
        id: step.id,
        title: step.title,
        description: step.description,
        linkText: step.linkText,
        order: step.order
      })),
      
      // Recovery bölümü
      recoveryTitle: hizmetTranslation.recoverySectionTitle,
      recoveryDescription: hizmetTranslation.recoverySectionDescription,
      recoveryItems: hizmetTranslation.hizmet.recoveryItemDefinitions.map(item => {
        const translation = item.translations[0];
        return {
          id: item.id,
          title: translation?.title || "",
          description: translation?.description || "",
          imageUrl: item.imageUrl || "",
          imageAlt: item.imageAlt || "",
          order: item.order
        };
      }),
      
      // CTA bölümü
      ctaTagline: hizmetTranslation.ctaTagline,
      ctaTitle: hizmetTranslation.ctaTitle,
      ctaDescription: hizmetTranslation.ctaDescription,
      ctaButtonText: hizmetTranslation.ctaButtonText,
      ctaButtonLink: hizmetTranslation.ctaButtonLink,
      ctaAvatarText: hizmetTranslation.ctaAvatarText,
      ctaBackgroundImageUrl: hizmetTranslation.hizmet.ctaBackgroundImageUrl,
      ctaMainImageUrl: hizmetTranslation.hizmet.ctaMainImageUrl,
      ctaMainImageAlt: hizmetTranslation.hizmet.ctaMainImageAlt,
      ctaAvatars: hizmetTranslation.hizmet.ctaAvatars.map(avatar => ({
        id: avatar.id,
        src: avatar.src,
        alt: avatar.alt,
        order: avatar.order
      })),
      
      // Pricing bölümü
      pricingTitle: hizmetTranslation.pricingSectionTitle,
      pricingDescription: hizmetTranslation.pricingSectionDescription,
      pricingPackages: hizmetTranslation.hizmet.pricingPackageDefinitions.map(pkg => {
        const translation = pkg.translations[0];
        return {
          id: pkg.id,
          title: translation?.title || "",
          price: translation?.price || "",
          features: translation?.features || [],
          isFeatured: pkg.isFeatured,
          order: pkg.order
        };
      }),
      
      // Experts bölümü
      expertsSectionTitle: hizmetTranslation.expertsSectionTitle,
      expertsTagline: hizmetTranslation.expertsTagline,
      expertItems: hizmetTranslation.hizmet.expertItemDefinitions.map(expert => {
        const translation = expert.translations[0];
        return {
          id: expert.id,
          name: translation?.name || "",
          title: translation?.title || "",
          description: translation?.description || "",
          imageUrl: expert.imageUrl || "",
          imageAlt: expert.imageAlt || "",
          ctaText: translation?.ctaText || "",
          order: expert.order
        };
      }),
      
      // FAQ bölümü
      faqSectionTitle: hizmetTranslation.faqSectionTitle,
      faqSectionDescription: hizmetTranslation.faqSectionDescription,
      faqs: hizmetTranslation.faqs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        order: faq.order
      })),
      
      // SEO meta bilgileri
      metaTitle: hizmetTranslation.metaTitle,
      metaDescription: hizmetTranslation.metaDescription,
      metaKeywords: hizmetTranslation.metaKeywords,
    };

    // Başarılı yanıt
    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`[GET /api/hizmetler/${context.params.slug}] Error:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
