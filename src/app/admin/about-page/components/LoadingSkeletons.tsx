"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface LoadingSkeletonProps {
  title?: string;
  type?: 'form' | 'table' | 'mixed' | 'gallery' | 'minimal';
  rows?: number;
}

// Genel bir kullanılabilir yükleme iskeleti bileşeni
export function LoadingSkeleton({ title = "Yükleniyor...", type = "form", rows = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4 p-6 border rounded-lg">
      {/* Header ve Başlık */}
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="ghost" disabled>
          <ArrowLeft className="h-5 w-5 mr-1" />
          Geri
        </Button>
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      <div className="space-y-4">
        {type === 'form' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Skeleton className="h-48 w-full rounded-md" />
              </div>
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-10 w-full mb-4" />
                {Array.from({ length: rows }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className={`h-${i % 2 === 0 ? '10' : '24'} w-full`} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {type === 'table' && (
          <>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80 mb-6" />
            <div className="border rounded-md p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-24" />
                  ))}
                </div>
                {Array.from({ length: rows }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {type === 'gallery' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-64 mb-6" />
                <Skeleton className="h-60 w-full rounded-md mb-4" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
              <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-64 mb-6" />
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                      <Skeleton className="h-12 w-20 rounded-md" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-10" />
                      <div className="flex space-x-1">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {type === 'mixed' && (
          <>
            <div className="space-y-6">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>

              <div className="space-y-4">
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-64 mb-4" />
                <div className="border rounded-md p-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border-b">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {type === 'minimal' && (
          <div className="space-y-4">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground pt-4 mt-4 border-t">
        {title}
      </div>
    </div>
  );
}

// Özel yükleme iskeletleri
export function FormLoadingSkeleton({ title = "Form yükleniyor...", rows = 4 }: { title?: string, rows?: number }) {
  return <LoadingSkeleton title={title} type="form" rows={rows} />;
}

export function TableLoadingSkeleton({ title = "Tablo yükleniyor...", rows = 5 }: { title?: string, rows?: number }) {
  return <LoadingSkeleton title={title} type="table" rows={rows} />;
}

export function GalleryLoadingSkeleton({ title = "Galeri yükleniyor..." }: { title?: string }) {
  return <LoadingSkeleton title={title} type="gallery" />;
}

export function MixedLoadingSkeleton({ title = "İçerik yükleniyor..." }: { title?: string }) {
  return <LoadingSkeleton title={title} type="mixed" />;
}

export function MinimalLoadingSkeleton({ title = "Yükleniyor..." }: { title?: string }) {
  return <LoadingSkeleton title={title} type="minimal" />;
}