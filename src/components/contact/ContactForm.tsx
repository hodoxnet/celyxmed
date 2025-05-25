"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  phone: string;
  email: string;
  contactMethod: string;
  message: string;
  privacyAccepted: boolean;
}

interface ContactFormProps {
  locale: string;
}

export default function ContactForm({ locale }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    contactMethod: 'Phone',
    message: '',
    privacyAccepted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactContent, setContactContent] = useState<any>({
    formTitle: "Bize ulaşın",
    formDescription: "Size 24 saat içinde mümkün olan en kısa sürede geri dönmek için elimizden geleni yapacağız!",
    nameLabel: "İsim Soyisim",
    namePlaceholder: "İsim Soyisim",
    contactMethodLabel: "İletişim Türü",
    phoneLabel: "Telefon",
    phonePlaceholder: "5XX XXX XX XX",
    emailLabel: "E-posta",
    emailPlaceholder: "ornek@email.com",
    messageLabel: "Mesajınız",
    messagePlaceholder: "Mesajınızı buraya yazın...",
    submitButtonText: "Mesaj Gönder",
    privacyCheckboxText: "Gizlilik politikasını kabul ediyorum",
    successMessage: "Mesajınız başarıyla gönderildi! Size 24 saat içinde geri dönüş yapacağız.",
    errorMessage: "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
    privacyErrorMessage: "Gizlilik politikasını kabul etmelisiniz"
  });

  // İletişim sayfası içeriğini yükle
  useEffect(() => {
    const fetchContactContent = async () => {
      try {
        const response = await fetch(`/api/contact-page?lang=${locale}`);
        if (response.ok) {
          const data = await response.json();
          setContactContent(data);
        }
      } catch (error) {
        console.error("İletişim içeriği yüklenirken hata:", error);
      }
    };

    fetchContactContent();
  }, [locale]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacyAccepted) {
      toast.error(contactContent.privacyErrorMessage);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Form gönderme işlemi burada yapılacak
      // Şimdilik sadece bir toast mesajı gösteriyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(contactContent.successMessage);
      
      // Formu sıfırla
      setFormData({
        name: '',
        phone: '',
        email: '',
        contactMethod: 'Phone',
        message: '',
        privacyAccepted: false
      });
    } catch (error) {
      toast.error(contactContent.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f6f9fc] border border-gray-200 rounded-2xl p-8 h-full flex flex-col">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4">
          {contactContent.formTitle}
        </h1>
        <p className="text-gray-600 text-lg">
          {contactContent.formDescription}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-center">
        {/* İsim ve İletişim Türü */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="text-base font-medium text-gray-900 mb-3 block">
              {contactContent.nameLabel}
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={contactContent.namePlaceholder}
              required
              className="w-full h-12 text-base bg-white"
            />
          </div>
          <div>
            <Label htmlFor="contactMethod" className="text-base font-medium text-gray-900 mb-3 block">
              {contactContent.contactMethodLabel}
            </Label>
            <Select value={formData.contactMethod} onValueChange={(value) => handleInputChange('contactMethod', value)}>
              <SelectTrigger className="h-12 text-base bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Whatsapp">Whatsapp</SelectItem>
                <SelectItem value="E-Mail">E-Mail</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Telefon ve E-posta */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="phone" className="text-base font-medium text-gray-900 mb-3 block">
              Telefon Numarası
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <span className="text-lg">🇹🇷</span>
                <span className="text-sm text-gray-600">+90</span>
              </div>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={contactContent.phonePlaceholder}
                required
                className="w-full h-12 pl-20 text-base bg-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-base font-medium text-gray-900 mb-3 block">
              {contactContent.emailLabel}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={contactContent.emailPlaceholder}
              required
              className="w-full h-12 text-base bg-white"
            />
          </div>
        </div>

        {/* Mesaj */}
        <div>
          <Label htmlFor="message" className="text-base font-medium text-gray-900 mb-3 block">
            {contactContent.messageLabel}
          </Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder={contactContent.messagePlaceholder}
            rows={5}
            className="w-full text-base resize-none bg-white"
          />
        </div>

        {/* Gizlilik Politikası */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="privacy"
            checked={formData.privacyAccepted}
            onCheckedChange={(checked) => handleInputChange('privacyAccepted', checked as boolean)}
            className="mt-1"
          />
          <Label htmlFor="privacy" className="text-base text-gray-600 leading-relaxed">
            {contactContent.privacyCheckboxText}
          </Label>
        </div>

        {/* Gönder Butonu */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#4a8f9c] hover:bg-[#3d7a86] text-white rounded-full px-8 py-4 text-base font-medium transition-all duration-300 inline-flex items-center group"
          >
            <div className="bg-[#d4b978] h-10 w-10 rounded-full flex items-center justify-center mr-4">
              <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
            </div>
            {isSubmitting ? 'Gönderiliyor...' : contactContent.submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  );
}