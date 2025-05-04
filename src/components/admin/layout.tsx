"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "./sidebar";
import { AdminHeader } from "./header"; // AdminHeader'ı import et
import { Toaster } from "@/components/ui/sonner";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col bg-background"> {/* bg-gray-50 yerine bg-background kullanıldı */}
        <AdminHeader /> {/* Header'ı buraya ekle */}
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
        </div>
        <footer className="border-t py-3 text-center text-xs text-gray-500">
          <div className="container mx-auto">
            © {new Date().getFullYear()} CelyxMed. Tüm hakları saklıdır.
          </div>
        </footer>
        <Toaster richColors position="top-right" /> {/* Toaster'ı ekle */}
      </div>
    </SessionProvider>
  );
}
