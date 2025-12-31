/**
 * Supabase Error Tracking Integration
 * Wraps Supabase operations with Sentry error tracking
 */

import { supabase } from './supabaseClient';
import { captureError, addBreadcrumb } from './sentry';

/**
 * Initialize Supabase error tracking
 * Call this once during app initialization
 */
export function initSupabaseErrorTracking() {
  // Track auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    addBreadcrumb(`Auth: ${event}`, 'auth', {
      userId: session?.user?.id,
      email: session?.user?.email,
    });
  });
}

/**
 * Wrap Supabase query with error tracking
 * Use this for all database operations
 */
export async function withErrorTracking<T>(
  operation: string,
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    addBreadcrumb(`Supabase query: ${operation}`, 'database', { operation });
    
    const result = await queryFn();
    
    if (result.error) {
      captureError(new Error(`Supabase ${operation}: ${result.error.message}`), {
        operation,
        code: result.error.code,
        details: result.error.details,
        hint: result.error.hint,
        category: 'supabase',
      });
    }
    
    return result;
  } catch (error) {
    captureError(error as Error, { operation, type: 'supabase' });
    throw error;
  }
}

/**
 * Track storage operations
 */
export async function trackStorageOperation<T>(
  operation: string,
  bucket: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    addBreadcrumb(`Storage: ${operation}`, 'storage', { bucket, operation });
    return await fn();
  } catch (error) {
    captureError(error as Error, {
      operation,
      bucket,
      type: 'storage',
    });
    throw error;
  }
}

/**
 * Track RPC function calls
 */
export async function trackRPC<T>(
  functionName: string,
  params?: Record<string, unknown>
): Promise<{ data: T | null; error: any }> {
  return withErrorTracking(`RPC: ${functionName}`, async () =>
    await supabase.rpc(functionName, params)
  );
}

/**
 * Example usage patterns
 */

// Query with error tracking
export async function exampleQuery() {
  return withErrorTracking('fetch profiles', async () =>
    await supabase.from('profiles').select('*')
  );
}

// Insert with error tracking
export async function exampleInsert(data: any) {
  return withErrorTracking('insert profile', async () =>
    await supabase.from('profiles').insert(data)
  );
}

// Update with error tracking
export async function exampleUpdate(id: string, data: any) {
  return withErrorTracking('update profile', async () =>
    await supabase.from('profiles').update(data).eq('id', id)
  );
}

// Storage upload with error tracking
export async function exampleUpload(file: File) {
  return trackStorageOperation('upload file', 'nft-media', async () => {
    const { data, error } = await supabase.storage
      .from('nft-media')
      .upload(`uploads/${file.name}`, file);
    
    if (error) throw error;
    return data;
  });
}
