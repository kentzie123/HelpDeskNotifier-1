import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 1) {
    return "Just now";
  } else if (diffInMins < 60) {
    return `${diffInMins} minute${diffInMins !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return d.toLocaleDateString();
  }
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'ticket':
      return 'Ticket';
    case 'warning':
      return 'AlertTriangle';
    case 'system':
      return 'Settings';
    case 'escalation':
      return 'Bell';
    case 'assignment':
      return 'UserCheck';
    case 'feedback':
      return 'Star';
    default:
      return 'Info';
  }
}

export function getNotificationColor(type: string): string {
  switch (type) {
    case 'ticket':
      return 'bg-blue-100 text-blue-600';
    case 'warning':
      return 'bg-red-100 text-red-600';
    case 'system':
      return 'bg-indigo-100 text-indigo-600';
    case 'escalation':
      return 'bg-orange-100 text-orange-600';
    case 'assignment':
      return 'bg-green-100 text-green-600';
    case 'feedback':
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}
