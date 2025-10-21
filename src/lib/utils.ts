/**
 * Utility Functions
 * Common helper functions used across the application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in AUD
 */
export function formatCurrency(amount: number, includeCents: boolean = true): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  }).format(amount / 100); // amount is in cents
}

/**
 * Format date for Australian locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    ...options,
  }).format(dateObj);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  return formatDate(date, {
    timeStyle: 'short',
  });
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(Math.abs(diffInSeconds) / seconds);

    if (interval >= 1) {
      const rtf = new Intl.RelativeTimeFormat('en-AU', { numeric: 'auto' });
      return rtf.format(diffInSeconds > 0 ? -interval : interval, unit as Intl.RelativeTimeFormatUnit);
    }
  }

  return 'just now';
}

/**
 * Validate Australian Business Number (ABN)
 * Simple validation - checks length and format
 */
export function validateABN(abn: string): boolean {
  const cleaned = abn.replace(/\s/g, '');

  if (!/^\d{11}$/.test(cleaned)) {
    return false;
  }

  // ABN check digit validation
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;

  for (let i = 0; i < 11; i++) {
    const digit = parseInt(cleaned[i]);
    const weight = weights[i];
    sum += (i === 0 ? digit - 1 : digit) * weight;
  }

  return sum % 89 === 0;
}

/**
 * Generate quote number (QT-YYYY-NNNN)
 */
export function generateQuoteNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `QT-${year}-${paddedSequence}`;
}

/**
 * Calculate GST (10% for Australia)
 */
export function calculateGST(amount: number, rate: number = 10): {
  subtotal: number;
  gst: number;
  total: number;
} {
  const gst = Math.round((amount * rate) / 100);
  return {
    subtotal: amount,
    gst,
    total: amount + gst,
  };
}

/**
 * Calculate GST inclusive price
 */
export function calculateGSTInclusive(totalIncGST: number, rate: number = 10): {
  subtotal: number;
  gst: number;
  total: number;
} {
  const subtotal = Math.round((totalIncGST * 100) / (100 + rate));
  const gst = totalIncGST - subtotal;
  return {
    subtotal,
    gst,
    total: totalIncGST,
  };
}

/**
 * Slugify string (for URLs)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

/**
 * Check if user has access to feature based on subscription tier
 */
export function hasFeatureAccess(
  userTier: 'STARTER' | 'PROFESSIONAL' | 'PREMIUM',
  requiredTier: 'STARTER' | 'PROFESSIONAL' | 'PREMIUM'
): boolean {
  const tierHierarchy = {
    STARTER: 1,
    PROFESSIONAL: 2,
    PREMIUM: 3,
  };

  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Sleep utility (for rate limiting, retries, etc.)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sanitize string for database (prevent injection)
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, '');
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  return !isPast(date);
}

/**
 * Get start and end of day
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start and end of week
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return getStartOfDay(new Date(d.setDate(diff)));
}

export function getEndOfWeek(date: Date = new Date()): Date {
  const start = getStartOfWeek(date);
  return getEndOfDay(new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000));
}

/**
 * Get start and end of month
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  return getStartOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function getEndOfMonth(date: Date = new Date()): Date {
  return getEndOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Estimate travel time based on distance (rough estimate)
 * Assumes average speed of 40 km/h in Australian cities
 */
export function estimateTravelTime(distanceKm: number): number {
  const averageSpeed = 40; // km/h
  return Math.ceil((distanceKm / averageSpeed) * 60); // Returns minutes
}
