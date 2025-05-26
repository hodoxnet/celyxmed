"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  ChevronRight,
  BookText,
  Sparkles,
  HeartHandshake,
  Award,
  Users,
  MessageSquare,
  HelpCircle,
  Presentation,
  PanelLeft,
  Languages,
  Settings,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import HeroAlaniFormu from "./components/HeroAlaniFormu";
import OzellikSekmeleriGenelAyarlarFormu from "./components/OzellikSekmeleriGenelAyarlarFormu";
import OzellikSekmeleriListesi from "./components/OzellikSekmeleriListesi";
import OzellikSekmesiFormu from "./components/OzellikSekmesiFormu";
import TedaviBolumuIcerigiFormu from "./components/TedaviBolumuIcerigiFormu";
import TedaviKartlariListesi from "./components/TedaviKartlariListesi";
import TedaviKartiFormu from "./components/TedaviKartiFormu";
import KlinikTanitimYonetimiFormu from "./components/KlinikTanitimYonetimiFormu";
import NedenCelyxmedFormu from "./components/NedenCelyxmedFormu";
import NedenBizeGuvenmelisinizFormu from "./components/NedenBizeGuvenmelisinizFormu";
import BasariHikayeleriFormu from "./components/BasariHikayeleriFormu";
import OnlineKonsultasyonFormu from "./components/OnlineKonsultasyonFormu";
import SSSListesi from "./components/SSSListesi";
import SSSFormu from "./components/SSSFormu";
import SSSBolumFormu from "./components/SSSBolumFormu";
import { Language } from "@/generated/prisma/client";
import { toast } from "sonner";

interface HomePageModule {
  id: string;
  title: string;
  icon: React.ElementType;
  description?: string;
}

const modules: HomePageModule[] = [
  { id: "hero", title: "Hero Alanı Yönetimi", icon: PanelLeft, description: "Ana sayfa hero bölümü içerik ve görsellerini düzenleyin" },
  { id: "why-choose", title: "Neden Celyxmed Bölümü", icon: HeartHandshake, description: "Neden Celyxmed tercih edilmeli bölümünü düzenleyin" }, 
  { id: "treatments-section", title: "Tedavi Bölümü İçeriği", icon: BookText, description: "Ana sayfa tedavi bölümünün genel içeriğini düzenleyin" },
  { id: "clinic-showcase", title: "Klinik Tanıtım Yönetimi", icon: Presentation, description: "Klinik tanıtım görselleri ve içeriğini düzenleyin" },
  { id: "treatment-cards", title: "Tedavi Kartları Yönetimi", icon: Sparkles, description: "Ana sayfada gösterilen tedavi kartlarını yönetin" },
  { id: "why-trust", title: "Neden Bize Güvenmelisiniz", icon: Award, description: "Güven noktaları ve içeriklerini düzenleyin" },
  { id: "success-stories", title: "Başarı Hikayeleri Bölümü", icon: Users, description: "Başarı hikayeleri bölümünü düzenleyin" }, 
  { id: "feature-tabs", title: "Özellik Sekmeleri Yönetimi", icon: LayoutGrid, description: "Ana sayfa özellik sekmelerini düzenleyin" },
  { id: "consult-online", title: "Online Konsültasyon Bölümü", icon: MessageSquare, description: "Online konsültasyon bölümünü düzenleyin" },
  { id: "faqs", title: "SSS Yönetimi", icon: HelpCircle, description: "Sıkça Sorulan Sorular bölümünü düzenleyin" },
];

// Ortak iskelet bileşenlerini içe aktar
import { MixedLoadingSkeleton } from "./components/LoadingSkeletons";

export default function AnasayfaYonetimiPage() {
  const [selectedModule, setSelectedModule] = useState<HomePageModule | null>(modules[0] || null);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [activeLanguageCode, setActiveLanguageCode] = useState<string>("");
  const [progress, setProgress] = useState(0); // İlerleme durumu için
  const [expandedSections, setExpandedSections] = useState<string[]>(["modules"]); // Açık akordeon bölümleri

  const [featureTabsView, setFeatureTabsView] = useState<'list' | 'form'>('list');
  const [editingFeatureTabId, setEditingFeatureTabId] = useState<string | null>(null);

  const [treatmentCardsView, setTreatmentCardsView] = useState<'list' | 'form'>('list');
  const [editingTreatmentCard, setEditingTreatmentCard] = useState<any | null>(null);
  const [treatmentCardsRefreshTrigger, setTreatmentCardsRefreshTrigger] = useState(0);

  const [faqsView, setFaqsView] = useState<'list' | 'form'>('list');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqsRefreshTrigger, setFaqsRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoadingLanguages(true);
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error('Diller yüklenemedi.');
        const data = await response.json();
        const activeLangs = data.filter((lang: any) => lang.isActive);
        setAvailableLanguages(activeLangs);
        if (activeLangs.length > 0) {
          const defaultLang = activeLangs.find((lang: Language) => lang.isDefault);
          setActiveLanguageCode(defaultLang?.code || activeLangs[0].code);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Diller yüklenirken bir hata oluştu.');
      } finally {
        setLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

  const handleModuleSelect = (module: HomePageModule) => {
    setSelectedModule(module);
    if (module.id === 'feature-tabs') setFeatureTabsView('list');
    if (module.id === 'treatment-cards') setTreatmentCardsView('list');
    if (module.id === 'faqs') setFaqsView('list');
    
    // Yeni bir modül seçildiğinde modüller bölümünü kapat
    setExpandedSections(prev => prev.filter(section => section !== "modules"));
  };

  const commonFormProps = { availableLanguages, activeLanguageCode };

  const handleEditFeatureTab = (itemId: string) => { setEditingFeatureTabId(itemId); setFeatureTabsView('form'); };
  const handleAddNewFeatureTab = () => { setEditingFeatureTabId(null); setFeatureTabsView('form'); };
  const handleFeatureTabFormSuccess = () => { 
    console.log("Form başarıyla tamamlandı"); 
    setFeatureTabsView('list'); 
    // Listeyi yenilemek için bir trigger ekleme
    const currentTime = new Date().getTime();
    setEditingFeatureTabId(String(currentTime));
    setTimeout(() => setEditingFeatureTabId(null), 100);
  };
  const handleFeatureTabFormCancel = () => { setFeatureTabsView('list'); setEditingFeatureTabId(null);};

  const handleEditTreatmentCard = (item: any) => { setEditingTreatmentCard(item); setTreatmentCardsView('form'); };
  const handleAddNewTreatmentCard = () => { setEditingTreatmentCard(null); setTreatmentCardsView('form'); };
  const handleTreatmentCardFormSuccess = () => { setTreatmentCardsView('list'); setTreatmentCardsRefreshTrigger(p => p + 1); };
  const handleTreatmentCardFormCancel = () => { setTreatmentCardsView('list'); setEditingTreatmentCard(null);};

  const handleEditFaq = (faqId: string) => { setEditingFaqId(faqId); setFaqsView('form'); };
  const handleAddNewFaq = () => { setEditingFaqId(null); setFaqsView('form'); };
  const handleFaqFormSuccess = () => { setFaqsView('list'); setFaqsRefreshTrigger(p => p + 1); };
  const handleFaqFormCancel = () => { setFaqsView('list'); setEditingFaqId(null);};
  
  // Akordeon bölümünü aç/kapat
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  const renderModuleContent = () => {
    if (!selectedModule) return <MixedLoadingSkeleton title="Lütfen bir modül seçin" />;
    if (loadingLanguages) return <MixedLoadingSkeleton title="Diller ve modül içeriği yükleniyor..." />;
    if (availableLanguages.length === 0) return (
      <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <h3 className="font-medium">Aktif dil bulunamadı</h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">Lütfen yönetim panelinden en az bir dili aktif hale getirin.</p>
      </div>
    );
    if (!activeLanguageCode) return <MixedLoadingSkeleton title="Aktif dil kodu ayarlanıyor..." />;

    const propsWithLang = { availableLanguages, activeLanguageCode };

    switch (selectedModule.id) {
      case 'hero':
        return <HeroAlaniFormu {...propsWithLang} />;
      case 'feature-tabs':
        return (
          <div className="space-y-6">
            {featureTabsView === 'list' ? (
              <>
                <OzellikSekmeleriGenelAyarlarFormu 
                  activeLanguageCode={activeLanguageCode} 
                  availableLanguages={availableLanguages} 
                />
                <OzellikSekmeleriListesi 
                  onEditItem={handleEditFeatureTab} 
                  onAddNewItem={handleAddNewFeatureTab} 
                  activeLanguageCode={activeLanguageCode} 
                  availableLanguages={availableLanguages} 
                />
              </>
            ) : (
              <OzellikSekmesiFormu
                languages={availableLanguages}
                onSubmitSuccess={handleFeatureTabFormSuccess}
                onCancel={handleFeatureTabFormCancel}
                itemIdToEdit={editingFeatureTabId}
                {...propsWithLang}
              />
            )}
          </div>
        );
      case 'treatments-section':
        return <TedaviBolumuIcerigiFormu activeLanguageCode={activeLanguageCode} availableLanguages={availableLanguages} />;
      case 'treatment-cards':
        return (
          <div className="space-y-6">
            {treatmentCardsView === 'list' ? (
              <TedaviKartlariListesi
                onEditItem={handleEditTreatmentCard}
                onAddNewItem={handleAddNewTreatmentCard}
                refreshTrigger={treatmentCardsRefreshTrigger}
                availableLanguages={availableLanguages}
                activeLanguageCode={activeLanguageCode}
              />
            ) : (
              <TedaviKartiFormu
                onSubmitSuccess={handleTreatmentCardFormSuccess}
                onCancel={handleTreatmentCardFormCancel}
                itemToEdit={editingTreatmentCard}
                {...propsWithLang}
              />
            )}
          </div>
        );
      case 'clinic-showcase':
        return <KlinikTanitimYonetimiFormu {...propsWithLang} />;
      case 'why-choose':
        return <NedenCelyxmedFormu {...propsWithLang} />;
      case 'why-trust':
        return <NedenBizeGuvenmelisinizFormu {...propsWithLang} />;
      case 'success-stories':
        return <BasariHikayeleriFormu {...propsWithLang} />;
      case 'consult-online':
        return <OnlineKonsultasyonFormu {...propsWithLang} />;
      case 'faqs':
        return (
          <div className="space-y-6">
            <SSSBolumFormu {...propsWithLang} />
            <Separator />
            {faqsView === 'list' ? (
              <SSSListesi
                onEditItem={handleEditFaq}
                onAddNewItem={handleAddNewFaq}
                refreshTrigger={faqsRefreshTrigger}
                availableLanguages={availableLanguages}
                activeLanguageCode={activeLanguageCode}
              />
            ) : (
              <SSSFormu
                onSubmitSuccess={handleFaqFormSuccess}
                onCancel={handleFaqFormCancel}
                faqIdToEdit={editingFaqId}
                {...propsWithLang}
              />
            )}
          </div>
        );
      default:
        return <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"><p className="text-gray-700 dark:text-gray-300">`{selectedModule.title}` için yönetim arayüzü burada görünecek.</p></div>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Anasayfa Yönetimi</h2>
        <p className="text-muted-foreground">Ana sayfa bölümlerini düzenleyin ve yönetin.</p>
      </div>
    
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{selectedModule?.title || "Anasayfa Yönetimi"}</CardTitle>
              <CardDescription>
                {selectedModule?.description || "Lütfen düzenlemek istediğiniz modülü seçin"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* İlerleme çubuğu */}
            <div className="flex items-center">
              <Progress value={progress} className="w-full" />
              <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">
                %{progress}
              </span>
            </div>
            
            {/* Dil Seçimi */}
            {availableLanguages.length > 0 && activeLanguageCode && (
              <Tabs value={activeLanguageCode} onValueChange={setActiveLanguageCode} className="w-full">
                <TabsList className="grid w-full grid-cols-none sm:grid-cols-auto sm:inline-flex">
                  {availableLanguages.map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code} className="px-4 py-2 text-sm">
                      {lang.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sol taraf - Modül listesi */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Modüller</CardTitle>
              <CardDescription className="text-sm">
                Düzenlemek için modül seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {modules.map((module) => {
                const IconComponent = module.icon;
                const isActive = selectedModule?.id === module.id;
                return (
                  <div 
                    key={module.id}
                    className={`rounded-lg border border-gray-200 shadow-sm overflow-hidden ${isActive ? 'ring-2 ring-primary' : ''} 
                      hover:border-primary/70 hover:bg-gray-50 cursor-pointer transition-all duration-200`}
                    onClick={() => handleModuleSelect(module)}
                  >
                    <div className="flex items-center p-3">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{module.title}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sağ taraf - İçerik alanı */}
        <div className="md:col-span-3">
          {!selectedModule ? (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center p-6">
                <h3 className="text-lg font-medium mb-2">Modül Düzenleme</h3>
                <p className="text-muted-foreground">Düzenlemek için modül seçin veya sürükleyin</p>
              </div>
            </Card>
          ) : (
            renderModuleContent()
          )}
        </div>
      </div>
    </div>
  );
}
