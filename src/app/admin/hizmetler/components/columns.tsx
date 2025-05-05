"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // useRouter import edildi
import { useState } from "react"; // useState import edildi

// Veri tipi (API'den dönen)
export type HizmetListesiItem = {
  id: string;
  title: string;
  slug: string;
  languageCode: string;
  published: boolean;
  createdAt: string; // veya Date
  updatedAt: string; // veya Date
};

// Silme işlemi için yardımcı fonksiyon
async function deleteHizmet(id: string, router: ReturnType<typeof useRouter>) {
    try {
        const response = await fetch(`/api/admin/hizmetler/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: `Silme işlemi başarısız (${response.status})` }));
             throw new Error(errorData.message || `Silme işlemi başarısız (${response.status})`);
        }
        toast.success("Hizmet detayı başarıyla silindi.");
        router.refresh(); // Tabloyu yenile
    } catch (error: any) {
        console.error("Silme hatası:", error);
        toast.error(error.message || "Hizmet detayı silinirken bir hata oluştu.");
    }
}


export const columns: ColumnDef<HizmetListesiItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tümünü seç"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Satırı seç"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Başlık
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
   {
    accessorKey: "languageCode",
    header: "Dil",
     cell: ({ row }) => <Badge variant="outline">{row.getValue("languageCode")}</Badge>,
  },
   {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "published",
    header: "Yayın Durumu",
    cell: ({ row }) => {
      const isPublished = row.getValue("published");
      return <Badge variant={isPublished ? "default" : "secondary"}>{isPublished ? "Yayında" : "Taslak"}</Badge>;
    },
  },
   {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Son Güncelleme
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
     cell: ({ row }) => {
       const date = new Date(row.getValue("updatedAt"));
       return <div>{date.toLocaleDateString('tr-TR')} {date.toLocaleTimeString('tr-TR')}</div>;
     },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const hizmet = row.original;
      const router = useRouter(); // Hook burada çağrıldı
      const [isDeleting, setIsDeleting] = useState(false); // Silme durumu

      const handleDelete = async () => {
          if (confirm(`"${hizmet.title}" başlıklı hizmet detayını silmek istediğinizden emin misiniz?`)) {
              setIsDeleting(true);
              await deleteHizmet(hizmet.id, router);
              setIsDeleting(false);
          }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menüyü aç</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Eylemler</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(hizmet.id)}>
              ID Kopyala
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/admin/hizmetler/${hizmet.id}`} passHref>
               <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" /> Düzenle
               </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600 focus:text-red-700 focus:bg-red-100">
               {isDeleting ? "Siliniyor..." : <><Trash2 className="mr-2 h-4 w-4" /> Sil</>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
