"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import FeatureTabItemForm from "@/components/admin/home-page-feature-tabs/FeatureTabItemForm";

// Örnek modül enumu (tüm modüller eklenecek)
const HomePageModules = [
  { id: "hero", title: "Hero Bölümü" },
  { id: "features_tabs", title: "Özellik Sekmeleri" },
  { id: "clinic_showcase", title: "Klinik Tanıtım" },
  { id: "why_choose", title: "Neden Celyxmed" },
  { id: "treatments_section", title: "Tedavi Bölümü" },
  { id: "treatment_cards", title: "Tedavi Kartları" },
  { id: "success_stories", title: "Başarı Hikayeleri" },
  { id: "consult_online", title: "Online Danışmanlık" },
  { id: "faqs", title: "SSS" },
  { id: "seo", title: "SEO" },
];

export default function HomePageModulesAdmin() {
  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [selectedModule, setSelectedModule] = useState(HomePageModules[0].id);

  useEffect(() => {
    // Dilleri API'den çek
    fetch("/api/languages")
      .then((res) => res.json())
      .then((data) => {
        const langs = data.filter((l) => l.isActive);
        setLanguages(langs);
        if (langs.length > 0) setActiveLang(langs[0].code);
      });
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-semibold mb-6">Anasayfa Modül Yönetimi</h1>
      <div className="flex gap-8">
        {/* Sol Panel: Modül Listesi */}
        <div className="w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle>Modüller</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {HomePageModules.map((mod) => (
                  <li key={mod.id}>
                    <Button
                      variant={selectedModule === mod.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedModule(mod.id)}
                    >
                      {mod.title}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        {/* Sağ Panel: Modül Formları ve Dil Tabları */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {HomePageModules.find((m) => m.id === selectedModule)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {languages.length > 0 ? (
                <Tabs value={activeLang} onValueChange={setActiveLang}>
                  <TabsList>
                    {languages.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code}>
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {languages.map((lang) => (
                    <TabsContent key={lang.code} value={lang.code}>
                      {/* Burada seçili modül ve dil için ilgili form bileşeni render edilecek */}
                      <div className="py-4">
                        <p className="text-muted-foreground">
                          {modFormPlaceholder(selectedModule, lang.code)}
                        </p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <p>Aktif dil bulunamadı.</p>
              )}
            </CardContent>
          </Card>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => toast.success("Kaydedildi (örnek)")}>Tümünü Kaydet</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function modFormPlaceholder(moduleId: string, lang: string) {
  // Burada her modül için ilgili form bileşeni çağrılacak (örnek placeholder)
  switch (moduleId) {
    case "features_tabs":
      // Örnek: Özellik Sekmeleri modülü için gerçek form entegrasyonu
      return (
        <FeatureTabItemForm
          languages={[{ code: lang, name: lang.toUpperCase() }]}
          onFormSubmit={async () => { return true; }}
          isSubmitting={false}
        />
      );
    case "hero":
      return `Hero Bölümü Formu (${lang})`;
    case "clinic_showcase":
      return `Klinik Tanıtım Formu (${lang})`;
    case "why_choose":
      return `Neden Celyxmed Formu (${lang})`;
    case "treatments_section":
      return `Tedavi Bölümü Formu (${lang})`;
    case "treatment_cards":
      return `Tedavi Kartları Formu (${lang})`;
    case "success_stories":
      return `Başarı Hikayeleri Formu (${lang})`;
    case "consult_online":
      return `Online Danışmanlık Formu (${lang})`;
    case "faqs":
      return `SSS Formu (${lang})`;
    case "seo":
      return `SEO Formu (${lang})`;
    default:
      return `Form (${lang})`;
  }
}
