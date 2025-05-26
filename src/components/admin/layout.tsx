"use client";

import { SessionProvider } from "next-auth/react";
import { SidebarNew } from "./sidebar";
import { AdminHeaderNew } from "./header";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <SidebarNew isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Header */}
        <AdminHeaderNew onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Content */}
        <main
          className={cn(
            "transition-all duration-300 ease-in-out",
            "pt-16", // Header height
            "lg:ml-64" // Sidebar width on desktop
          )}
        >
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer
          className={cn(
            "transition-all duration-300 ease-in-out",
            "lg:ml-64", // Sidebar width on desktop
            "border-t bg-white dark:bg-gray-900 dark:border-gray-800"
          )}
        >
          <div className="px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} CelyxMed. Tüm hakları saklıdır.
          </div>
        </footer>

        {/* Toaster */}
        <Toaster richColors position="top-right" />
      </div>
    </SessionProvider>
  );
}