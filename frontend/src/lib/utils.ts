import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleString();
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'Healthy':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'Warning':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    case 'Critical':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
}

