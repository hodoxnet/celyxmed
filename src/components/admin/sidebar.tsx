"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Languages,
  ClipboardList,
  LayoutList,
  Globe,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Alt menü öğesi tipi
interface SubNavItem {
  title: string;
  href: string;
}

// Ana menü öğesi tipi
interface NavItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Blog Yönetimi",
    href: "/admin/blog",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Menü Yönetimi",
    icon: <LayoutList className="h-5 w-5" />,
    subItems: [
      { title: "Header Menüleri", href: "/admin/header-menus" },
      { title: "Footer Menüleri", href: "/admin/footer-menus" },
    ],
  },
  {
    title: "Yöneticiler",
    href: "/admin/yoneticiler",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Dil Yönetimi",
    href: "/admin/diller",
    icon: <Languages className="h-5 w-5" />,
  },
  {
    title: "Hizmetler",
    href: "/admin/hizmetler",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "Rota Çevirileri",
    href: "/admin/rota-cevirileri",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    title: "Anasayfa Yönetimi",
    href: "/admin/anasayfa-yonetimi",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    title: "SSS Yönetimi",
    href: "/admin/faqs",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Hakkımızda Sayfası",
    href: "/admin/about-page",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Genel Ayarlar",
    href: "/admin/ayarlar",
    icon: <Settings className="h-5 w-5" />,
  },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SidebarNew({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Alt menülerden aktif olanın ana menüsünü bul ve otomatik aç
  const activeParent = navItems.find(item => 
    item.subItems?.some(sub => pathname === sub.href)
  );

  // Sayfa yüklendiğinde aktif ana menüyü aç
  useState(() => {
    if (activeParent) {
      setExpandedItems([activeParent.title]);
    }
  }, []);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo ve Kapat Butonu */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">CelyxMed</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const isExpanded = expandedItems.includes(item.title);
                const hasActiveChild = item.subItems?.some(sub => pathname === sub.href);

                if (item.subItems) {
                  return (
                    <div key={item.title}>
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                          hasActiveChild
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            : "text-gray-600 dark:text-gray-400"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="mt-1 ml-9 space-y-1">
                          {item.subItems.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={cn(
                                  "block rounded-lg px-3 py-2 text-sm transition-colors",
                                  isSubActive
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                                )}
                                onClick={() => setIsOpen(false)}
                              >
                                {subItem.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.title}
                    href={item.href!}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Logout Button */}
          <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
