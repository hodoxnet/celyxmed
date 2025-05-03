"use client"; // İstemci Bileşeni olarak işaretle

import { useTranslations } from 'next-intl';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('AdminLayout'); // 'AdminLayout' namespace'ini kullan

  // TODO: Add authentication check here later
  return (
    <section>
      {/* Admin paneline özel navigasyon veya sidebar eklenebilir */}
      <nav>{t('navigation')}</nav> {/* Çeviriden navigasyon metnini al */}
      <main>{children}</main>
    </section>
  );
}
