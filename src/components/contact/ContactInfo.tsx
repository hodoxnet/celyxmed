"use client";

import React from 'react';

export default function ContactInfo() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border">
      {/* Online Indicator */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="relative">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="absolute inset-0 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-60"></div>
        </div>
        <span className="text-sm font-medium text-gray-600">
          Sağlık Danışmanlarımız Çevrimiçi
        </span>
      </div>

      {/* Başlık */}
      <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
        Sağlık Danışmanlarımız Çevrimiçi ve Size Yardımcı Olmaya Hazır
      </h2>

      {/* Açıklama */}
      <p className="text-gray-600 leading-relaxed">
        Tedavilerimiz hakkında sorularınız mı var? Deneyimli sağlık danışmanlarımız, 
        size kişiselleştirilmiş tavsiyeler sunmak ve daha iyi bir sağlık yolculuğunuzda 
        size rehberlik etmek için sadece bir mesaj uzağınızda.
      </p>
    </div>
  );
}