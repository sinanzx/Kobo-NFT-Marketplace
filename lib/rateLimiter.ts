/**
 * Rate Limiting Utilities
 * Client-side rate limiting and Edge Function rate limit helpers
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Client-side rate limiter using localStorage
 */
class ClientRateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private storageKey = 'rate_limit_data';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.storage = new Map(Object.entries(data));
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.storage);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Check if request is allowed under rate limit
   */
  checkLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.storage.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.storage.delete(key);
    }

    const current = this.storage.get(key);

    if (!current) {
      // First request in window
      this.storage.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      this.saveToStorage();
      return true;
    }

    if (current.count >= config.maxRequests) {
      return false;
    }

    // Increment count
    current.count++;
    this.storage.set(key, current);
    this.saveToStorage();
    return true;
  }

  /**
   * Get remaining requests in current window
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const entry = this.storage.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * Get time until rate limit resets (in ms)
   */
  getResetTime(key: string): number {
    const entry = this.storage.get(key);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.storage.delete(key);
    this.saveToStorage();
  }
}

// Singleton instance
export const rateLimiter = new ClientRateLimiter();

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  AI_GENERATION: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  IMAGE_UPLOAD: { maxRequests: 20, windowMs: 60000 }, // 20 per minute
  NFT_MINT: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  IPFS_UPLOAD: { maxRequests: 15, windowMs: 60000 }, // 15 per minute
  COPYRIGHT_CHECK: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
  SOCIAL_ACTION: { maxRequests: 50, windowMs: 60000 }, // 50 per minute (likes, comments)
  SEARCH: { maxRequests: 100, windowMs: 60000 }, // 100 per minute
} as const;

/**
 * Edge Function rate limit headers interface
 */
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
}

/**
 * Parse rate limit headers from response
 */
export function parseRateLimitHeaders(headers: Headers): {
  limit: number;
  remaining: number;
  reset: number;
} | null {
  const limit = headers.get('X-RateLimit-Limit');
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');

  if (!limit || !remaining || !reset) return null;

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: parseInt(reset, 10),
  };
}

/**
 * Create rate limit error message
 */
export function createRateLimitError(resetTime: number): Error {
  const seconds = Math.ceil(resetTime / 1000);
  return new Error(
    `Rate limit exceeded. Please try again in ${seconds} second${seconds !== 1 ? 's' : ''}.`
  );
}

/**
 * Decorator for rate-limited functions
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  key: string,
  config: RateLimitConfig
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (!rateLimiter.checkLimit(key, config)) {
      const resetTime = rateLimiter.getResetTime(key);
      throw createRateLimitError(resetTime);
    }
    return fn(...args);
  }) as T;
}
