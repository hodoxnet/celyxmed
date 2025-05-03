"use client"; // İstemci Bileşeni olarak işaretle

import { useTranslations } from 'next-intl';
import React from 'react'; // React import'u zaten vardı, koruyalım

export default function AdminPage() {
  const t = useTranslations('AdminPage'); // 'AdminPage' namespace'ini kullan

  return (
    <div>
      <h1>{t('title')}</h1> {/* Çeviriden başlığı al */}
      <p>{t('description')}</p> {/* Çeviriden açıklamayı al */}
    </div>
  );
}
