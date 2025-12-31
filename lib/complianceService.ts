/**
 * Compliance Service
 * 
 * @module complianceService
 * @description Comprehensive compliance scanning for NFT content including copyright
 * detection, trademark checking, NSFW filtering, and reverse image search.
 * Integrates with Supabase Edge Functions for server-side validation.
 * 
 * @example
 * ```typescript
 * import { performComplianceScan } from './complianceService';
 * 
 * const result = await performComplianceScan({
 *   promptText: 'A dragon in space',
 *   aiEngine: 'stable-diffusion',
 *   outputType: 'image',
 *   outputUrl: 'ipfs://...'
 * });
 * 
 * if (result.status === 'blocked') {
 *   console.error('Content blocked:', result.blockedContent);
 * }
 * ```
 */

import { supabase } from './supabaseClient';
import { ComplianceScanResult } from '@/components/compliance/ComplianceResultsModal';
import crypto from 'crypto';

/**
 * Compliance event log entry
 * @interface ComplianceEvent
 */
export interface ComplianceEvent {
  id: string;
  userId: string;
  eventType: 'scan_completed' | 'content_blocked' | 'warning_issued' | 'remediation_required' | 'blocklist_updated';
  severity: 'info' | 'warning' | 'error' | 'critical';
  outputId?: string;
  scanResult?: ComplianceScanResult;
  metadata: Record<string, any>;
  createdAt: string;
}

/**
 * Blocklist entry for restricted content
 * @interface BlocklistEntry
 */
export interface BlocklistEntry {
  id: string;
  term: string;
  type: 'trademark' | 'copyright' | 'restricted_term' | 'nsfw';
  category: string;
  reason: string;
  documentationUrl?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Reverse image search result
 * @interface ReverseImageSearchResult
 */
export interface ReverseImageSearchResult {
  totalMatches: number;
  matches: Array<{
    score: number;
    imageUrl: string;
    domain: string;
    crawlDate: string;
    backlinks: number;
  }>;
  highestScore: number;
  isAboveThreshold: boolean;
  threshold: number;
}

/**
 * Perform comprehensive compliance scan
 * 
 * @param {Object} params - Scan parameters
 * @param {string} params.promptText - AI generation prompt text
 * @param {string} params.aiEngine - AI engine used for generation
 * @param {'image' | 'video' | 'audio'} params.outputType - Type of output
 * @param {string} [params.outputUrl] - URL of generated output
 * @param {boolean} [params.isRemix] - Whether content is a remix
 * @param {string} [params.parentOutputId] - Parent output ID if remix
 * @returns {Promise<ComplianceScanResult>} Compliance scan results
 * 
 * @description
 * Performs multi-layered compliance scanning:
 * 1. Prompt text analysis for restricted terms
 * 2. Trademark and copyright detection
 * 3. NSFW content filtering
 * 4. Reverse image search for similarity
 * 5. Blocklist checking
 * 
 * Returns detailed results with recommendations and remediation steps.
 */
export async function performComplianceScan(params: {
  promptText: string;
  aiEngine: string;
  outputType: 'image' | 'video' | 'audio';
  outputUrl?: string;
  isRemix?: boolean;
  parentOutputId?: string;
}): Promise<ComplianceScanResult> {
  try {
    const { data, error } = await supabase.functions.invoke('copyright-precheck', {
      body: params,
    });

    if (error) throw error;

    // Transform backend response to ComplianceScanResult
    const scanResult: ComplianceScanResult = {
      status: data.success ? 'passed' : (data.errorType === 'RESTRICTED_CONTENT' ? 'blocked' : 'warning'),
      outputId: data.outputId,
      scanTimestamp: new Date().toISOString(),
      flaggedTerms: data.flaggedTerms || [],
      flaggedCategories: data.categories || [],
      blockedContent: data.blockedContent || [],
      similarityMatches: data.similarityMatches || [],
      recommendations: data.recommendations || [],
      remediationSteps: data.remediationSteps || [],
      aiEngine: params.aiEngine,
      outputType: params.outputType,
      complianceScore: data.complianceScore || (data.success ? 100 : 50),
    };

    // Log compliance event
    await logComplianceEvent({
      eventType: data.success ? 'scan_completed' : 'warning_issued',
      severity: data.success ? 'info' : 'warning',
      outputId: data.outputId,
      scanResult,
      metadata: {
        promptText: params.promptText,
        aiEngine: params.aiEngine,
        outputType: params.outputType,
      },
    });

    return scanResult;
  } catch (err: any) {
    console.error('Compliance scan failed:', err);
    throw err;
  }
}

/**
 * Log compliance event to database
 */
export async function logComplianceEvent(event: Omit<ComplianceEvent, 'id' | 'userId' | 'createdAt'>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('compliance_events')
      .insert({
        user_id: user.id,
        event_type: event.eventType,
        severity: event.severity,
        output_id: event.outputId,
        scan_result: event.scanResult,
        metadata: event.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    // Create user notification for critical events
    if (event.severity === 'critical' || event.severity === 'error') {
      await createComplianceNotification({
        userId: user.id,
        eventType: event.eventType,
        severity: event.severity,
        message: getEventMessage(event.eventType, event.severity),
      });
    }

    return data;
  } catch (err) {
    console.error('Failed to log compliance event:', err);
    throw err;
  }
}

/**
 * Get compliance event history for user
 */
export async function getComplianceEventHistory(limit: number = 50): Promise<ComplianceEvent[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('compliance_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(event => ({
      id: event.id,
      userId: event.user_id,
      eventType: event.event_type,
      severity: event.severity,
      outputId: event.output_id,
      scanResult: event.scan_result,
      metadata: event.metadata,
      createdAt: event.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch compliance history:', err);
    throw err;
  }
}

/**
 * Get active blocklist entries
 */
export async function getActiveBlocklist(): Promise<BlocklistEntry[]> {
  try {
    const { data, error } = await supabase
      .from('compliance_blocklist')
      .select('*')
      .eq('is_active', true)
      .order('severity', { ascending: false });

    if (error) throw error;

    return data.map(entry => ({
      id: entry.id,
      term: entry.term,
      type: entry.type,
      category: entry.category,
      reason: entry.reason,
      documentationUrl: entry.documentation_url,
      severity: entry.severity,
      isActive: entry.is_active,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    }));
  } catch (err) {
    console.error('Failed to fetch blocklist:', err);
    throw err;
  }
}

/**
 * Update blocklist (admin function)
 */
export async function updateBlocklist(entries: Omit<BlocklistEntry, 'id' | 'createdAt' | 'updatedAt'>[]) {
  try {
    const { data, error } = await supabase.functions.invoke('admin/update-blocklist', {
      body: { entries },
    });

    if (error) throw error;

    // Log blocklist update event
    await logComplianceEvent({
      eventType: 'blocklist_updated',
      severity: 'info',
      metadata: {
        entriesCount: entries.length,
        timestamp: new Date().toISOString(),
      },
    });

    return data;
  } catch (err) {
    console.error('Failed to update blocklist:', err);
    throw err;
  }
}

/**
 * Check if content contains blocklisted terms
 */
export async function checkBlocklist(content: string): Promise<{
  isBlocked: boolean;
  matches: BlocklistEntry[];
}> {
  try {
    const blocklist = await getActiveBlocklist();
    const contentLower = content.toLowerCase();
    
    const matches = blocklist.filter(entry => 
      contentLower.includes(entry.term.toLowerCase())
    );

    return {
      isBlocked: matches.some(m => m.severity === 'critical' || m.severity === 'high'),
      matches,
    };
  } catch (err) {
    console.error('Failed to check blocklist:', err);
    throw err;
  }
}

/**
 * Create compliance notification
 */
async function createComplianceNotification(params: {
  userId: string;
  eventType: ComplianceEvent['eventType'];
  severity: ComplianceEvent['severity'];
  message: string;
}) {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .insert({
        user_id: params.userId,
        notification_type: 'compliance',
        title: getEventTitle(params.eventType),
        message: params.message,
        severity: params.severity,
        is_read: false,
      });

    if (error) throw error;
  } catch (err) {
    console.error('Failed to create compliance notification:', err);
  }
}

/**
 * Get event title based on type
 */
function getEventTitle(eventType: ComplianceEvent['eventType']): string {
  const titles: Record<ComplianceEvent['eventType'], string> = {
    scan_completed: 'Compliance Scan Completed',
    content_blocked: 'Content Blocked',
    warning_issued: 'Compliance Warning',
    remediation_required: 'Action Required',
    blocklist_updated: 'Blocklist Updated',
  };
  return titles[eventType];
}

/**
 * Get event message based on type and severity
 */
function getEventMessage(eventType: ComplianceEvent['eventType'], severity: ComplianceEvent['severity']): string {
  if (eventType === 'content_blocked') {
    return 'Your content contains restricted elements and cannot be minted. Please review the compliance report.';
  }
  if (eventType === 'warning_issued') {
    return 'Potential compliance issues detected. Review recommended before proceeding.';
  }
  if (eventType === 'remediation_required') {
    return 'Action required to resolve compliance issues. Check your dashboard for details.';
  }
  if (eventType === 'blocklist_updated') {
    return 'Compliance blocklist has been updated with new restricted content.';
  }
  return 'Compliance scan completed successfully.';
}

/**
 * Perform reverse image search using TinEye API
 */
export async function performReverseImageSearch(imageUrl: string): Promise<ReverseImageSearchResult> {
  const apiKey = import.meta.env.VITE_TINEYE_API_KEY;
  const apiUrl = import.meta.env.VITE_TINEYE_API_URL || 'https://api.tineye.com/rest/';
  const threshold = parseInt(import.meta.env.VITE_TINEYE_MATCH_THRESHOLD || '75', 10);

  if (!apiKey) {
    console.warn('TinEye API key not configured. Skipping reverse image search.');
    return {
      totalMatches: 0,
      matches: [],
      highestScore: 0,
      isAboveThreshold: false,
      threshold,
    };
  }

  try {
    // Generate request signature (required by TinEye API)
    const nonce = Date.now().toString();
    const method = 'search_url';
    const params = new URLSearchParams({
      image_url: imageUrl,
      limit: '10',
      sort: 'score',
      order: 'desc',
    });

    // Create signature: apiKey + nonce + method + params
    const signatureString = `${apiKey}${nonce}${method}${params.toString()}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    // Make API request
    const requestUrl = `${apiUrl}${method}/?${params.toString()}&api_key=${apiKey}&nonce=${nonce}&api_sig=${signature}`;
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TinEye API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Parse TinEye response
    const matches = (data.results?.matches || []).map((match: any) => ({
      score: match.score || 0,
      imageUrl: match.image_url || '',
      domain: match.domain || '',
      crawlDate: match.crawl_date || '',
      backlinks: (match.backlinks || []).length,
    }));

    const highestScore = matches.length > 0 ? Math.max(...matches.map(m => m.score)) : 0;
    const isAboveThreshold = highestScore >= threshold;

    return {
      totalMatches: data.results?.total_results || 0,
      matches,
      highestScore,
      isAboveThreshold,
      threshold,
    };
  } catch (err: any) {
    console.error('Reverse image search failed:', err);
    // Return empty result on error rather than throwing
    return {
      totalMatches: 0,
      matches: [],
      highestScore: 0,
      isAboveThreshold: false,
      threshold,
    };
  }
}

/**
 * Enhanced compliance scan with reverse image search
 */
export async function performEnhancedComplianceScan(params: {
  promptText: string;
  aiEngine: string;
  outputType: 'image' | 'video' | 'audio';
  outputUrl?: string;
  isRemix?: boolean;
  parentOutputId?: string;
}): Promise<ComplianceScanResult & { reverseSearchResult?: ReverseImageSearchResult }> {
  try {
    // Perform standard compliance scan
    const scanResult = await performComplianceScan(params);

    // Perform reverse image search for images
    let reverseSearchResult: ReverseImageSearchResult | undefined;
    if (params.outputType === 'image' && params.outputUrl) {
      reverseSearchResult = await performReverseImageSearch(params.outputUrl);

      // Update scan result based on reverse search findings
      if (reverseSearchResult.isAboveThreshold) {
        scanResult.status = 'warning';
        scanResult.complianceScore = Math.min(scanResult.complianceScore || 100, 60);
        
        // Add reverse search findings to recommendations
        if (!scanResult.recommendations) {
          scanResult.recommendations = [];
        }
        scanResult.recommendations.push(
          `Found ${reverseSearchResult.totalMatches} similar images online with highest match score of ${reverseSearchResult.highestScore}%`,
          'Review the similar images to ensure your content is original or properly licensed'
        );

        // Add top matches to similarity matches
        if (!scanResult.similarityMatches) {
          scanResult.similarityMatches = [];
        }
        reverseSearchResult.matches.slice(0, 3).forEach(match => {
          scanResult.similarityMatches!.push({
            url: match.imageUrl,
            score: match.score,
            source: match.domain,
            metadata: {
              crawlDate: match.crawlDate,
              backlinks: match.backlinks,
            },
          });
        });
      }
    }

    return {
      ...scanResult,
      reverseSearchResult,
    };
  } catch (err: any) {
    console.error('Enhanced compliance scan failed:', err);
    throw err;
  }
}

/**
 * Get compliance statistics for user
 */
export async function getComplianceStats() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('compliance_events')
      .select('event_type, severity')
      .eq('user_id', user.id);

    if (error) throw error;

    const stats = {
      totalScans: data.length,
      passed: data.filter(e => e.event_type === 'scan_completed' && e.severity === 'info').length,
      warnings: data.filter(e => e.severity === 'warning').length,
      blocked: data.filter(e => e.event_type === 'content_blocked').length,
      critical: data.filter(e => e.severity === 'critical').length,
    };

    return stats;
  } catch (err) {
    console.error('Failed to fetch compliance stats:', err);
    throw err;
  }
}
