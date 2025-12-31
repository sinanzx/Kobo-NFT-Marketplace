/**
 * Input Sanitization Utilities
 * Provides comprehensive input validation and sanitization for security
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize user input text (removes HTML, trims whitespace)
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags
  const withoutHTML = input.replace(/<[^>]*>/g, '');
  
  // Normalize whitespace
  const normalized = withoutHTML.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return null;
  
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(trimmed) ? trimmed : null;
}

/**
 * Sanitize URL to prevent javascript: and data: schemes
 */
export function sanitizeURL(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
  if (dangerousProtocols.test(trimmed)) {
    return null;
  }
  
  // Ensure valid HTTP/HTTPS or relative URLs
  const validURL = /^(https?:\/\/|\/)/i;
  if (!validURL.test(trimmed)) {
    return null;
  }
  
  try {
    // Validate URL structure
    if (trimmed.startsWith('http')) {
      new URL(trimmed);
    }
    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';
  
  // Remove path separators and special characters
  const sanitized = filename
    .replace(/[\/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .trim();
  
  // Limit length
  return sanitized.slice(0, 255);
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number, options?: {
  min?: number;
  max?: number;
  integer?: boolean;
}): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) return null;
  
  if (options?.integer && !Number.isInteger(num)) {
    return Math.floor(num);
  }
  
  if (options?.min !== undefined && num < options.min) {
    return options.min;
  }
  
  if (options?.max !== undefined && num > options.max) {
    return options.max;
  }
  
  return num;
}

/**
 * Sanitize blockchain address (Ethereum format)
 */
export function sanitizeAddress(address: string): string | null {
  if (!address || typeof address !== 'string') return null;
  
  const trimmed = address.trim();
  
  // Ethereum address format: 0x followed by 40 hex characters
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  
  return addressRegex.test(trimmed) ? trimmed.toLowerCase() : null;
}

/**
 * Sanitize prompt text for AI generation
 * Removes potentially harmful content and enforces length limits
 */
export function sanitizePrompt(prompt: string, maxLength = 1000): string {
  if (!prompt || typeof prompt !== 'string') return '';
  
  // Remove HTML and normalize
  let sanitized = sanitizeText(prompt);
  
  // Remove excessive punctuation
  sanitized = sanitized.replace(/([!?.]){4,}/g, '$1$1$1');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength).trim();
  }
  
  return sanitized;
}

/**
 * Sanitize JSON input
 */
export function sanitizeJSON<T>(input: string): T | null {
  if (!input || typeof input !== 'string') return null;
  
  try {
    const parsed = JSON.parse(input);
    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * Rate limit key sanitization (for cache keys)
 */
export function sanitizeRateLimitKey(key: string): string {
  if (!key || typeof key !== 'string') return 'unknown';
  
  return key
    .replace(/[^a-zA-Z0-9:_-]/g, '_')
    .slice(0, 100);
}

/**
 * Validate and sanitize metadata object
 */
export function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    // Sanitize key
    const sanitizedKey = sanitizeText(key).slice(0, 50);
    
    if (!sanitizedKey) continue;
    
    // Sanitize value based on type
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeText(value).slice(0, 500);
    } else if (typeof value === 'number') {
      sanitized[sanitizedKey] = sanitizeNumber(value);
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    }
    // Skip objects, arrays, and other complex types
  }
  
  return sanitized;
}
