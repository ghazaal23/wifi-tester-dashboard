import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Helper standar untuk menggabungkan className kondisional
// tanpa konflik antar-utility Tailwind (misal "px-2" vs "px-4").
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
