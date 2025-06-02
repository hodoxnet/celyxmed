"use client";

import { Language } from "@/generated/prisma";
import { UseFormReturn } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";

interface LegacyUrl {
  id?: string;
  languageCode: string;
  legacySlug: string;
  isActive: boolean;
}

interface LegacyUrlSectionProps {
  form: UseFormReturn<any>;
  languages: Language[];
  hizmetId?: string;
  loading: boolean;
}

export function LegacyUrlSection({ form, languages, hizmetId, loading }: LegacyUrlSectionProps) {
  const [legacyUrls, setLegacyUrls] = useState<LegacyUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Legacy URL'leri yükle
  useEffect(() => {
    if (hizmetId) {
      fetchLegacyUrls();
    } else {
      setIsLoading(false);
    }
  }, [hizmetId]);

  const fetchLegacyUrls = async () => {
    try {
      const response = await fetch(`/api/admin/hizmetler/${hizmetId}/legacy-urls`);
      if (response.ok) {
        const data = await response.json();
        setLegacyUrls(data);
      }
    } catch (error) {
      console.error('Legacy URL\'ler yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLegacyUrl = async (legacyUrl: LegacyUrl) => {
    if (!hizmetId) {
      toast.error('Önce hizmeti kaydetmelisiniz.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/hizmetler/${hizmetId}/legacy-urls`, {
        method: legacyUrl.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(legacyUrl)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bir hata oluştu');
      }

      const savedUrl = await response.json();
      
      // State'i güncelle
      setLegacyUrls(prev => {
        if (legacyUrl.id) {
          return prev.map(url => url.id === legacyUrl.id ? savedUrl : url);
        } else {
          return [...prev, savedUrl];
        }
      });

      toast.success('Legacy URL başarıyla kaydedildi.');
    } catch (error) {
      console.error('Legacy URL kaydetme hatası:', error);
      toast.error('Legacy URL kaydedilemedi: ' + (error as Error).message);
    }
  };

  const handleDeleteLegacyUrl = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/hizmetler/${hizmetId}/legacy-urls/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız');
      }

      setLegacyUrls(prev => prev.filter(url => url.id !== id));
      toast.success('Legacy URL başarıyla silindi.');
    } catch (error) {
      console.error('Legacy URL silme hatası:', error);
      toast.error('Legacy URL silinemedi.');
    }
  };

  const addNewLegacyUrl = (languageCode: string) => {
    const newUrl: LegacyUrl = {
      languageCode,
      legacySlug: '',
      isActive: true
    };
    setLegacyUrls(prev => [...prev, newUrl]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Legacy URL Yönetimi</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legacy URL Yönetimi</CardTitle>
        <p className="text-sm text-muted-foreground">
          Eski site URL'lerini yönetin. Bu URL'ler otomatik olarak yeni URL'ye yönlendirilir.
        </p>
      </CardHeader>
      <CardContent>
        {!hizmetId ? (
          <p className="text-muted-foreground">Legacy URL'ler için önce hizmeti kaydetmelisiniz.</p>
        ) : (
          <Tabs defaultValue={languages[0]?.code}>
            <TabsList className="mb-4">
              {languages.map(lang => (
                <TabsTrigger key={lang.code} value={lang.code}>
                  {lang.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {languages.map(lang => {
              const langUrls = legacyUrls.filter(url => url.languageCode === lang.code);
              
              return (
                <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">{lang.name} Legacy URL'leri</h4>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => addNewLegacyUrl(lang.code)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Ekle
                    </Button>
                  </div>
                  
                  {langUrls.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Bu dil için legacy URL bulunmuyor.</p>
                  ) : (
                    <div className="space-y-3">
                      {langUrls.map((legacyUrl, index) => (
                        <div key={legacyUrl.id || index} className="flex items-center gap-3 p-3 border rounded">
                          <div className="flex-1">
                            <Input
                              placeholder="gastric-sleeve-turkey"
                              value={legacyUrl.legacySlug}
                              onChange={(e) => setLegacyUrls(prev => 
                                prev.map(url => 
                                  url === legacyUrl 
                                    ? { ...url, legacySlug: e.target.value }
                                    : url
                                )
                              )}
                              disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Örnek: gastric-sleeve-turkey
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={legacyUrl.isActive}
                              onCheckedChange={(checked) => setLegacyUrls(prev => 
                                prev.map(url => 
                                  url === legacyUrl 
                                    ? { ...url, isActive: checked }
                                    : url
                                )
                              )}
                            />
                            <span className="text-xs">Aktif</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveLegacyUrl(legacyUrl)}
                            disabled={!legacyUrl.legacySlug.trim()}
                          >
                            Kaydet
                          </Button>
                          {legacyUrl.id && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteLegacyUrl(legacyUrl.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}