"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminHeader() {
  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:px-6">
      {/* Sağ taraftaki ikonlar */}
      <div className="flex items-center gap-2">
        {/* Siteye Git Linki */}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" target="_blank" aria-label="Siteyi Görüntüle">
            <ExternalLink className="h-5 w-5" />
          </Link>
        </Button>

        {/* Tema Değiştirme Düğmesi */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Temayı Değiştir">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Temayı değiştir</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Açık
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Koyu
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              Sistem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
