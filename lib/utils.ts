import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function getDurumColor(durum: string): string {
  switch (durum) {
    case 'musait':
      return 'text-green-600 bg-green-50';
    case 'dolu':
      return 'text-red-600 bg-red-50';
    case 'hata':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getDurumIcon(durum: string): string {
  switch (durum) {
    case 'musait':
      return '✅';
    case 'dolu':
      return '❌';
    case 'hata':
      return '⚠️';
    default:
      return '❓';
  }
}
