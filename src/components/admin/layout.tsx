"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "./sidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
        </div>
        <footer className="border-t py-3 text-center text-xs text-gray-500">
          <div className="container mx-auto">
            © {new Date().getFullYear()} CelyxMed. Tüm hakları saklıdır.
          </div>
        </footer>
      </div>
    </SessionProvider>
  );
}