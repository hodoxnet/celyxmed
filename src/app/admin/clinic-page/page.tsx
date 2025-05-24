"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
}

interface ClinicPageData {
  heroTitle: string;
  heroDescription: string;
}

export default function ClinicPageAdmin() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('tr');
  const [formData, setFormData] = useState<ClinicPageData>({
    heroTitle: '',
    heroDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dilleri yükle
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch('/api/languages');
        if (response.ok) {
          const data = await response.json();
          setLanguages(data);
        }
      } catch (error) {
        console.error('Diller yüklenirken hata:', error);
      }
    }
    fetchLanguages();
  }, []);

  // Seçili dil için veriyi yükle
  useEffect(() => {
    if (selectedLanguage) {
      fetchClinicPageData();
    }
  }, [selectedLanguage]);

  const fetchClinicPageData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clinic-page?lang=${selectedLanguage}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          heroTitle: data.heroTitle || '',
          heroDescription: data.heroDescription || ''
        });
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/clinic-page', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          languageCode: selectedLanguage
        }),
      });

      if (response.ok) {
        toast.success('Klinik sayfası başarıyla güncellendi');
      } else {
        toast.error('Güncelleme sırasında bir hata oluştu');
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      toast.error('Kaydetme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ClinicPageData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Klinik Sayfası Yönetimi</h1>
        </div>

        {/* Dil Seçimi */}
        <Card>
          <CardHeader>
            <CardTitle>Dil Seçimi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="language-select">Düzenlenecek Dil</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dil seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Bölümü */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Bölümü</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Başlık</Label>
                <Input
                  id="hero-title"
                  value={formData.heroTitle}
                  onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                  placeholder="Klinik sayfası başlığı"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="hero-description">Açıklama</Label>
                <Textarea
                  id="hero-description"
                  value={formData.heroDescription}
                  onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                  placeholder="Klinik sayfası açıklaması"
                  rows={4}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kaydet Butonu */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving || loading}
            className="w-32"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
}