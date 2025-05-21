"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  title?: string;
  type?: 'form' | 'table' | 'mixed' | 'minimal';
  rows?: number;
}

// Genel bir kullanılabilir yükleme iskeleti bileşeni
export function LoadingSkeleton({ title = "Yükleniyor...", type = "form", rows = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <div className="space-y-3">
        {type === 'form' && (
          <>
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-4 pt-4">
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className={`h-${i % 2 === 0 ? '12' : '24'} w-full`} />
                </div>
              ))}
            </div>
            <div className="flex justify-start space-x-2 pt-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </>
        )}

        {type === 'table' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="border rounded-md p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className={`h-5 w-${[16, 24, 32, 20, 16][i % 5]}`} />
                  ))}
                </div>
                {Array.from({ length: rows }).map(i => (
                  <div key={i} className="flex justify-between items-center py-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className={`h-5 w-${[8, 32, 48, 20, 20][j % 5]}`} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {type === 'mixed' && (
          <>
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 my-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
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
      <div className="text-center text-sm text-muted-foreground pt-2">
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

export function MixedLoadingSkeleton({ title = "İçerik yükleniyor..." }: { title?: string }) {
  return <LoadingSkeleton title={title} type="mixed" />;
}

export function MinimalLoadingSkeleton({ title = "Yükleniyor..." }: { title?: string }) {
  return <LoadingSkeleton title={title} type="minimal" />;
}