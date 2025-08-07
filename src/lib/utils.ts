import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(d)
}

export function formatSalary(salary: string | null | undefined): string {
  if (!salary) return ''
  
  // If it's already formatted, return as is
  if (salary.includes('$') || salary.includes('k') || salary.includes('K')) {
    return salary
  }
  
  // Try to parse as number and format
  const num = parseInt(salary.replace(/[^\d]/g, ''))
  if (isNaN(num)) return salary
  
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}k`
  } else {
    return `$${num}`
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'applied':
      return 'bg-blue-100 text-blue-800'
    case 'phone_screening':
      return 'bg-yellow-100 text-yellow-800'
    case 'technical_interview':
    case 'onsite_interview':
    case 'final_interview':
      return 'bg-purple-100 text-purple-800'
    case 'offer':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'withdrawn':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
