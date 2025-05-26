import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { HizmetlerDataTable } from './components/hizmetler-data-table'; // DataTable import edildi
// import { getHizmetler } from '@/lib/data/hizmetler'; // Veri çekme fonksiyonu (Client-side yapıldığı için gerek yok)

export const metadata: Metadata = {
  title: "Admin - Hizmet Detayları",
  description: "Hizmet detaylarını yönetin.",
};

// Bu sayfa Server Component olarak kalabilir, veri çekme ve tablo
// Client Component içinde yapılabilir.
export default async function HizmetlerPage() {
  // const hizmetler = await getHizmetler(); // Server-side veri çekme (alternatif)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hizmet Detayları</h2>
          <p className="text-muted-foreground">
            Web sitesinde gösterilecek hizmet detaylarını buradan yönetebilirsiniz.
          </p>
        </div>
        <Link href="/admin/hizmetler/yeni"> {/* Yeni ekleme sayfası linki */}
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Hizmet Ekle
          </Button>
        </Link>
      </div>

      {/*
        Buraya hizmetleri listeleyen DataTable bileşeni gelecek.
        Bu bileşen client-side veri çekme veya server-side props alabilir.
        Örnek: <HizmetlerDataTable data={hizmetler} />
        Buraya hizmetleri listeleyen DataTable bileşeni gelecek.
        Bu bileşen client-side veri çekme veya server-side props alabilir.
        Client-side veri çekme DataTable içinde yapılıyor.
      */}
      <HizmetlerDataTable />
    </div>
  );
}
