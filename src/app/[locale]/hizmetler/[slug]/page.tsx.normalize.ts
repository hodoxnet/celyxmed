// ModuleStates'i normalize eden fonksiyon
export function normalizeModuleStates(moduleStates: any): any {
  if (!moduleStates) return {};
  
  const normalized = { ...moduleStates };
  
  // Bilinen modül çiftleri - her biri için değerleri senkronize et
  const modulePairs = [
    ['toc', 'tocSection'],
    ['intro', 'introSection'],
    ['marquee', 'marqueeSection'],
    ['overview', 'overviewSection'],
    ['why', 'whySection'],
    ['gallery', 'gallerySection'],
    ['testimonials', 'testimonialsSection'],
    ['steps', 'stepsSection'],
    ['recovery', 'recoverySection'],
    ['cta', 'ctaSection'],
    ['pricing', 'pricingSection'],
    ['experts', 'expertsSection'],
    ['faq', 'faqSection']
  ];
  
  for (const [shortKey, longKey] of modulePairs) {
    // Her iki anahtar için değer varsa, herhangi biri false ise, ikisi de false olmalıdır
    if (normalized[shortKey] && normalized[longKey]) {
      const shortKeyHidden = normalized[shortKey].isVisible === false || normalized[shortKey].isActive === false;
      const longKeyHidden = normalized[longKey].isVisible === false || normalized[longKey].isActive === false;
      
      // Eğer herhangi biri gizliyse, her ikisini de gizle
      if (shortKeyHidden || longKeyHidden) {
        normalized[shortKey] = { isVisible: false, isActive: false };
        normalized[longKey] = { isVisible: false, isActive: false };
        console.log(`[Normalize] ${shortKey}/${longKey} gizlendi, çünkü birisi gizliydi`);
      }
    }
    // Eğer sadece biri varsa, diğerini de aynı değerle ekle
    else if (normalized[shortKey] && !normalized[longKey]) {
      normalized[longKey] = { ...normalized[shortKey] };
      console.log(`[Normalize] ${longKey} eklendi, ${shortKey} değerleriyle`);
    }
    else if (!normalized[shortKey] && normalized[longKey]) {
      normalized[shortKey] = { ...normalized[longKey] };
      console.log(`[Normalize] ${shortKey} eklendi, ${longKey} değerleriyle`);
    }
  }
  
  return normalized;
}