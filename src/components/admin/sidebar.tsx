"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Settings,
  Users,
  LogOut,
  Menu,
  FileImage,
  PlusCircle,
  GalleryHorizontal,
  Languages, // Languages ikonunu import et
  ClipboardList, // Hizmetler için ikon
  Home, // Home ikonu import edildi
  LayoutGrid, // LayoutGrid ikonu import edildi
  LayoutList, // Menü Yönetimi için ikon
  Globe, // Rota çevirileri için ikon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Accordion import edildi

// Alt menü öğesi tipi
type SubNavItem = {
  title: string;
  href: string;
};

// Ana menü öğesi tipi (alt menüleri destekler)
type NavItem = {
  title: string;
  icon: React.ReactNode;
  href?: string; // Ana menü öğesinin linki olmayabilir
  subItems?: SubNavItem[]; // Alt menü öğeleri
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin", // Removed /tr
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Blog Yönetimi",
    href: "/admin/blog", // Removed /tr
    icon: <FileText className="h-5 w-5" />, // Reverted icon change, kept original
  },
  {
    title: "Menü Yönetimi",
    icon: <LayoutList className="h-5 w-5" />,
    subItems: [
      { title: "Header Menüleri", href: "/admin/header-menus" },
      { title: "Footer Menüleri", href: "/admin/footer-menus" },
    ],
  },
  // Removed Sayfalar, Galeri, İletişim, Kullanıcılar, Ayarlar
  {
    title: "Yöneticiler", // Added Yöneticiler menu
    href: "/admin/yoneticiler", // Removed /tr
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Dil Yönetimi", // Added Dil Yönetimi menu
    href: "/admin/diller",
    icon: <Languages className="h-5 w-5" />,
  },
  {
    title: "Hizmetler", // Yeni menü öğesi
    href: "/admin/hizmetler",
    icon: <ClipboardList className="h-5 w-5" />, // Hizmetler için ikon
  },
  {
    title: "Rota Çevirileri", // Yeni menü öğesi
    href: "/admin/rota-cevirileri",
    icon: <Globe className="h-5 w-5" />, // Rota çevirileri için ikon
  },
  {
    title: "Anasayfa Modülleri", // Yeni ana menü
    icon: <LayoutGrid className="h-5 w-5" />,
    subItems: [ // Alt menüler
      { title: "Hero Alanı Yönetimi", href: "/admin/hero" },
      { title: "Tedavi Bölümü İçeriği", href: "/admin/treatments-section" }, // İsim değişikliği
      { title: "Tedavi Kartları Yönetimi", href: "/admin/treatment-cards" }, // Yeni menü
      { title: "Klinik Tanıtım Yönetimi", href: "/admin/clinic-showcase" }, // Yeni menü
      { title: "Neden Celyxmed Bölümü", href: "/admin/why-choose-section" },
      // Gelecekteki anasayfa modülleri buraya eklenebilir
    ],
  },
  {
    title: "Genel Ayarlar",
    href: "/admin/ayarlar",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login"); // Removed /tr
  };

  // Eski NavItem fonksiyonu kaldırıldı.

  const SidebarContent = () => {
    // Aktif alt menüyü belirlemek için state (opsiyonel, istenirse eklenebilir)
    // const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    //   navItems.find(item => item.subItems?.some(sub => pathname.startsWith(sub.href)))?.title
    // );

    return (
      <div className="flex h-full w-full flex-col"> {/* gap-2 kaldırıldı */}
        <div className="px-3 py-2">
          <div className="mb-2 flex h-12 items-center justify-between">
            <h2 className="text-lg font-semibold">CelyxMed Admin</h2>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1"> {/* flex-col gap-1 yerine space-y-1 */}
          <Accordion 
            type="single" 
            collapsible 
            className="w-full"
            // value={openAccordion} // Aktif alt menü state'i
            // onValueChange={setOpenAccordion} // Aktif alt menü state'i
          >
            {navItems.map((item, index) => (
              item.subItems ? (
                // Alt menüsü olan öğe (AccordionItem)
                <AccordionItem value={item.title} key={item.title} className="border-none">
                  <AccordionTrigger className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 hover:no-underline",
                    item.subItems.some(sub => pathname.startsWith(sub.href)) ? "text-gray-900 dark:text-gray-50" : "" // Aktifse ana başlığı vurgula
                  )}>
                     <div className="flex items-center gap-3">
                       {item.icon}
                       {item.title}
                     </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-9 pr-3 pb-1 pt-0">
                    <div className="flex flex-col space-y-1">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            className={cn(
                              "block rounded-md px-3 py-1.5 text-sm text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                              isSubActive ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50" : ""
                            )}
                          >
                            {subItem.title}
                          </Link>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : item.href ? (
                // Doğrudan link olan öğe
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                    pathname === item.href ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50" : ""
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ) : null // href veya subItems yoksa hiçbir şey render etme
            ))}
          </Accordion>
        </nav>
        
        <div className="mt-auto px-3 pb-4 pt-2"> {/* Padding ayarlandı */}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Çıkış Yap
          </Button>
        </div>
      </div>
    ); 
  }; // Eksik kapanış süslü parantezi eklendi

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <div className="block lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-gray-50/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full flex-col gap-2">
          <div className="flex-1 px-3 py-4">
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  );
}
