import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Array utility function to handle undefined/null arrays safely
export function ensureArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

// Add default values to array object fields
export function withDefaults<T extends object, K extends keyof T>(
  obj: T | undefined | null, 
  defaultValues: Partial<Record<K, T[K]>>
): T {
  if (!obj) return defaultValues as T;
  
  return Object.entries(defaultValues).reduce(
    (result, [key, value]) => {
      if (result[key] === undefined || result[key] === null) {
        result[key] = value;
      }
      return result;
    }, 
    { ...obj } as T
  );
}
