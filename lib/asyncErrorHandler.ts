/**
 * Async Error Handler Utilities
 * Wraps async operations with Sentry error tracking
 */

import { captureError, addBreadcrumb } from './sentry';

/**
 * Wrap async function with error tracking
 * Automatically captures and reports errors to Sentry
 */
export async function withAsyncErrorTracking<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    addBreadcrumb(`Starting: ${operation}`, 'async', context);
    const result = await fn();
    addBreadcrumb(`Completed: ${operation}`, 'async', { success: true });
    return result;
  } catch (error) {
    captureError(error as Error, {
      operation,
      ...context,
      category: 'async',
    });
    throw error;
  }
}

/**
 * Wrap API call with error tracking
 */
export async function withAPIErrorTracking<T>(
  endpoint: string,
  method: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  return withAsyncErrorTracking(
    `API ${method} ${endpoint}`,
    fn,
    {
      endpoint,
      method,
      ...context,
    }
  );
}

/**
 * Safe async wrapper that catches errors and returns null
 * Useful for non-critical operations
 */
export async function safeAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  fallback: T | null = null
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    captureError(error as Error, {
      operation,
      severity: 'warning',
      handled: true,
    });
    return fallback;
  }
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryWithTracking<T>(
  operation: string,
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      addBreadcrumb(`Attempt ${attempt + 1}/${maxRetries + 1}: ${operation}`, 'retry', {
        attempt,
        maxRetries,
      });
      
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        addBreadcrumb(`Retry failed: ${operation}`, 'retry', {
          attempt,
          error: lastError.message,
          nextRetryIn: delay,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  // All retries failed
  captureError(lastError!, {
    operation,
    maxRetries,
    category: 'retry-failed',
  });
  
  throw lastError;
}

/**
 * Batch async operations with error tracking
 */
export async function batchWithTracking<T>(
  operation: string,
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
  options: {
    batchSize?: number;
    continueOnError?: boolean;
  } = {}
): Promise<{ successes: number; failures: number; errors: Error[] }> {
  const { batchSize = 10, continueOnError = true } = options;
  
  let successes = 0;
  let failures = 0;
  const errors: Error[] = [];

  addBreadcrumb(`Starting batch: ${operation}`, 'batch', {
    totalItems: items.length,
    batchSize,
  });

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map((item, index) => fn(item, i + index))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successes++;
      } else {
        failures++;
        const error = result.reason as Error;
        errors.push(error);
        
        captureError(error, {
          operation,
          batchIndex: Math.floor(i / batchSize),
          itemIndex: i + index,
          continueOnError,
        });

        if (!continueOnError) {
          throw error;
        }
      }
    });
  }

  addBreadcrumb(`Completed batch: ${operation}`, 'batch', {
    successes,
    failures,
    totalItems: items.length,
  });

  return { successes, failures, errors };
}

/**
 * Timeout wrapper with error tracking
 */
export async function withTimeout<T>(
  operation: string,
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        const error = new Error(`Operation timed out after ${timeoutMs}ms: ${operation}`);
        captureError(error, {
          operation,
          timeoutMs,
          category: 'timeout',
        });
        reject(error);
      }, timeoutMs);
    }),
  ]);
}

/**
 * Example usage patterns
 */

// Basic async error tracking
export async function exampleAsyncOperation() {
  return withAsyncErrorTracking('fetch user data', async () => {
    const response = await fetch('/api/user');
    return response.json();
  });
}

// API call with tracking
export async function exampleAPICall() {
  return withAPIErrorTracking('users', 'GET', async () => {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  });
}

// Safe async with fallback
export async function exampleSafeAsync() {
  const data = await safeAsync('load preferences', async () => {
    return JSON.parse(localStorage.getItem('preferences') || '{}');
  }, {});
  return data;
}

// Retry with backoff
export async function exampleRetry() {
  return retryWithTracking('upload to IPFS', async () => {
    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      body: new FormData(),
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }, {
    maxRetries: 3,
    initialDelay: 1000,
  });
}

// Batch processing
export async function exampleBatch(items: string[]) {
  return batchWithTracking('process items', items, async (item, index) => {
    await fetch(`/api/process/${item}`, { method: 'POST' });
  }, {
    batchSize: 5,
    continueOnError: true,
  });
}
