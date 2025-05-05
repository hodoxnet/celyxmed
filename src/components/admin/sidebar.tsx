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
  ClipboardList // Hizmetler için ikon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
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
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login"); // Removed /tr
  };

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          isActive
            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            : ""
        )}
      >
        {item.icon}
        {item.title}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="px-3 py-2">
        <div className="mb-2 flex h-12 items-center justify-between">
          <h2 className="text-lg font-semibold">CelyxMed Admin</h2>
        </div>
        
        <div className="flex w-full flex-col gap-1">
          {navItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </div>
        
        <div className="mt-auto">
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
    </div>
  );

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
