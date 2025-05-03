"use client"; // İstemci Bileşeni olarak işaretle

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button'; // Button bileşenini import et

export default function HomePage() {
  const tHome = useTranslations('HomePage'); // 'HomePage' namespace'ini kullan
  const tCommon = useTranslations('Common'); // 'Common' namespace'ini kullan

  return (
    <div className="p-4"> {/* Biraz boşluk ekleyelim */}
      <h1>{tHome('title')}</h1> {/* Çeviriden başlığı al */}
      <p>{tHome('description')}</p> {/* Çeviriden açıklamayı al */}
      <Button className="mt-4">{tCommon('clickMe')}</Button> {/* Butonu ekle ve çeviriyi kullan */}
    </div>
  );
}
