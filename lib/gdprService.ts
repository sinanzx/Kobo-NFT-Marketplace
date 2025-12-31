/**
 * GDPR Compliance Service
 * Handles user data deletion, export, and consent management
 */

import { supabase } from './supabaseClient';

export interface DeletionRequest {
  id: string;
  user_id: string;
  requested_at: string;
  scheduled_deletion_at: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  reason?: string;
  completed_at?: string;
}

export interface DataExport {
  id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  export_url?: string;
  expires_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface UserConsent {
  id: string;
  user_id?: string;
  consent_type: 'cookies' | 'analytics' | 'marketing' | 'data_processing' | 'terms_of_service' | 'privacy_policy';
  consent_given: boolean;
  consent_version: string;
  ip_address?: string;
  user_agent?: string;
  consented_at?: string;
  withdrawn_at?: string;
}

/**
 * Request account deletion (30-day grace period)
 */
export async function requestAccountDeletion(reason?: string): Promise<DeletionRequest> {
  const { data, error } = await supabase.functions.invoke('gdpr-delete-user', {
    body: { action: 'request', reason },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.message || 'Failed to request deletion');

  return data.deletionRequest;
}

/**
 * Cancel pending account deletion request
 */
export async function cancelAccountDeletion(): Promise<DeletionRequest> {
  const { data, error } = await supabase.functions.invoke('gdpr-delete-user', {
    body: { action: 'cancel' },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.message || 'Failed to cancel deletion');

  return data.deletionRequest;
}

/**
 * Get user's deletion request status
 */
export async function getDeletionRequestStatus(): Promise<DeletionRequest | null> {
  const { data, error } = await supabase
    .from('user_deletion_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Request data export (GDPR Article 20 - Right to data portability)
 */
export async function requestDataExport(): Promise<DataExport> {
  const { data, error } = await supabase.functions.invoke('gdpr-export-data', {
    body: {},
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.message || 'Failed to request data export');

  return data.export;
}

/**
 * Get user's data export requests
 */
export async function getDataExportRequests(): Promise<DataExport[]> {
  const { data, error } = await supabase
    .from('user_data_exports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Record user consent
 */
export async function recordConsent(
  consentType: UserConsent['consent_type'],
  consentGiven: boolean,
  consentVersion: string
): Promise<UserConsent> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get IP and user agent (client-side)
  const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
  const ipData = ipResponse ? await ipResponse.json() : null;

  const consentData = {
    user_id: user?.id || null,
    consent_type: consentType,
    consent_given: consentGiven,
    consent_version: consentVersion,
    ip_address: ipData?.ip || null,
    user_agent: navigator.userAgent,
    consented_at: consentGiven ? new Date().toISOString() : null,
    withdrawn_at: !consentGiven ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('user_consents')
    .upsert(consentData, {
      onConflict: 'user_id,consent_type,consent_version',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's consent records
 */
export async function getUserConsents(): Promise<UserConsent[]> {
  const { data, error } = await supabase
    .from('user_consents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Check if user has given specific consent
 */
export async function hasConsent(
  consentType: UserConsent['consent_type'],
  consentVersion?: string
): Promise<boolean> {
  let query = supabase
    .from('user_consents')
    .select('consent_given')
    .eq('consent_type', consentType)
    .eq('consent_given', true)
    .is('withdrawn_at', null);

  if (consentVersion) {
    query = query.eq('consent_version', consentVersion);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  return !!data?.consent_given;
}

/**
 * Withdraw consent
 */
export async function withdrawConsent(
  consentType: UserConsent['consent_type'],
  consentVersion: string
): Promise<UserConsent> {
  return recordConsent(consentType, false, consentVersion);
}
