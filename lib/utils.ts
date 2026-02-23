import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
      return 'text-green-600 bg-green-50';
    case 'full':
      return 'text-red-600 bg-red-50';
    case 'error':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'available':
      return '✅';
    case 'full':
      return '❌';
    case 'error':
      return '⚠️';
    default:
      return '❓';
  }
}
