/**
 * Gift Service
 * 
 * @module giftService
 * @description Manages NFT gifting functionality including wrapping, unwrapping,
 * encrypted messages, and gift tracking. Integrates with smart contracts for
 * on-chain gift wrapping.
 * 
 * @example
 * ```typescript
 * import { createGiftWrap, unwrapGift } from './giftService';
 * 
 * // Wrap an NFT as a gift
 * const gift = await createGiftWrap({
 *   giftId: 1,
 *   tokenId: 42,
 *   contractAddress: '0x123...',
 *   senderAddress: '0xabc...',
 *   recipientAddress: '0xdef...',
 *   message: 'Happy Birthday!',
 *   wrapTxHash: '0x456...'
 * });
 * ```
 */

import { supabase } from './supabaseClient';
import { selectedChain } from '../utils/evmConfig';

/**
 * Gift status enumeration
 * @typedef {'pending' | 'unwrapped' | 'cancelled'} GiftStatus
 */
export type GiftStatus = 'pending' | 'unwrapped' | 'cancelled';

/**
 * Gift wrap data structure
 * @interface GiftWrap
 */
export interface GiftWrap {
  id: string;
  gift_id: number;
  chain: string;
  token_id: number;
  contract_address: string;
  sender_address: string;
  sender_user_id?: string;
  recipient_address: string;
  recipient_user_id?: string;
  message_encrypted?: string;
  message_ipfs_hash?: string;
  wrapped_at: string;
  unwrapped_at?: string;
  cancelled_at?: string;
  status: GiftStatus;
  wrap_tx_hash: string;
  unwrap_tx_hash?: string;
  cancel_tx_hash?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Gift message structure
 * @interface GiftMessage
 */
export interface GiftMessage {
  id: string;
  gift_wrap_id: string;
  message_text: string;
  is_encrypted: boolean;
  read_at?: string;
  created_at: string;
}

/**
 * Gift unwrap event structure
 * @interface GiftUnwrapEvent
 */
export interface GiftUnwrapEvent {
  id: string;
  gift_wrap_id: string;
  user_id: string;
  unwrapped_at: string;
  animation_type?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

/**
 * Create a new gift wrap record
 * 
 * @param {Object} params - Gift wrap parameters
 * @param {number} params.giftId - On-chain gift ID
 * @param {number} params.tokenId - NFT token ID being gifted
 * @param {string} params.contractAddress - NFT contract address
 * @param {string} params.senderAddress - Sender wallet address
 * @param {string} params.recipientAddress - Recipient wallet address
 * @param {string} [params.message] - Optional gift message
 * @param {string} params.wrapTxHash - Blockchain transaction hash
 * @returns {Promise<GiftWrap>} Created gift wrap record
 * 
 * @description
 * Creates a database record for a wrapped NFT gift. Links on-chain gift ID
 * with off-chain metadata including encrypted messages and tracking.
 */
export async function createGiftWrap(params: {
  giftId: number;
  tokenId: number;
  contractAddress: string;
  senderAddress: string;
  recipientAddress: string;
  message?: string;
  wrapTxHash: string;
}): Promise<GiftWrap> {
  const { data: { user } } = await supabase.auth.getUser();

  const giftWrap = {
    gift_id: params.giftId,
    chain: selectedChain.network,
    token_id: params.tokenId,
    contract_address: params.contractAddress.toLowerCase(),
    sender_address: params.senderAddress.toLowerCase(),
    sender_user_id: user?.id,
    recipient_address: params.recipientAddress.toLowerCase(),
    status: 'pending' as GiftStatus,
    wrap_tx_hash: params.wrapTxHash,
  };

  const { data, error } = await supabase
    .from('gift_wraps')
    .insert(giftWrap)
    .select()
    .single();

  if (error) throw error;

  // If there's a message, create it separately
  if (params.message && data) {
    await createGiftMessage({
      giftWrapId: data.id,
      messageText: params.message,
      isEncrypted: false,
    });
  }

  return data;
}

/**
 * Create a gift message
 */
export async function createGiftMessage(params: {
  giftWrapId: string;
  messageText: string;
  isEncrypted: boolean;
}): Promise<GiftMessage> {
  const { data, error } = await supabase
    .from('gift_messages')
    .insert({
      gift_wrap_id: params.giftWrapId,
      message_text: params.messageText,
      is_encrypted: params.isEncrypted,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get pending gifts for a recipient
 */
export async function getPendingGifts(recipientAddress: string): Promise<GiftWrap[]> {
  const { data, error } = await supabase
    .from('gift_wraps')
    .select('*')
    .eq('recipient_address', recipientAddress.toLowerCase())
    .eq('status', 'pending')
    .order('wrapped_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get all gifts (sent or received) for a user
 */
export async function getUserGifts(userAddress: string): Promise<{
  sent: GiftWrap[];
  received: GiftWrap[];
}> {
  const address = userAddress.toLowerCase();

  const { data: sent, error: sentError } = await supabase
    .from('gift_wraps')
    .select('*')
    .eq('sender_address', address)
    .order('wrapped_at', { ascending: false });

  if (sentError) throw sentError;

  const { data: received, error: receivedError } = await supabase
    .from('gift_wraps')
    .select('*')
    .eq('recipient_address', address)
    .order('wrapped_at', { ascending: false });

  if (receivedError) throw receivedError;

  return {
    sent: sent || [],
    received: received || [],
  };
}

/**
 * Get gift message for a gift wrap
 */
export async function getGiftMessage(giftWrapId: string): Promise<GiftMessage | null> {
  const { data, error } = await supabase
    .from('gift_messages')
    .select('*')
    .eq('gift_wrap_id', giftWrapId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

/**
 * Mark gift as unwrapped
 */
export async function markGiftUnwrapped(params: {
  giftWrapId: string;
  unwrapTxHash: string;
  animationType?: string;
}): Promise<GiftWrap> {
  const { data: { user } } = await supabase.auth.getUser();

  // Update gift wrap status
  const { data: giftWrap, error: updateError } = await supabase
    .from('gift_wraps')
    .update({
      status: 'unwrapped' as GiftStatus,
      unwrapped_at: new Date().toISOString(),
      unwrap_tx_hash: params.unwrapTxHash,
    })
    .eq('id', params.giftWrapId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Create unwrap event
  if (user) {
    await supabase.from('gift_unwrap_events').insert({
      gift_wrap_id: params.giftWrapId,
      user_id: user.id,
      animation_type: params.animationType,
      user_agent: navigator.userAgent,
    });
  }

  return giftWrap;
}

/**
 * Mark gift as cancelled
 */
export async function markGiftCancelled(params: {
  giftWrapId: string;
  cancelTxHash: string;
}): Promise<GiftWrap> {
  const { data, error } = await supabase
    .from('gift_wraps')
    .update({
      status: 'cancelled' as GiftStatus,
      cancelled_at: new Date().toISOString(),
      cancel_tx_hash: params.cancelTxHash,
    })
    .eq('id', params.giftWrapId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('gift_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId);

  if (error) throw error;
}

/**
 * Get gift wrap by gift ID
 */
export async function getGiftWrapByGiftId(giftId: number): Promise<GiftWrap | null> {
  const { data, error } = await supabase
    .from('gift_wraps')
    .select('*')
    .eq('gift_id', giftId)
    .eq('chain', selectedChain.network)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Get unwrap events for a gift
 */
export async function getUnwrapEvents(giftWrapId: string): Promise<GiftUnwrapEvent[]> {
  const { data, error } = await supabase
    .from('gift_unwrap_events')
    .select('*')
    .eq('gift_wrap_id', giftWrapId)
    .order('unwrapped_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Simple message encryption (for demo purposes - use proper encryption in production)
 */
export function encryptMessage(message: string, _key: string): string {
  // In production, use a proper encryption library like crypto-js or Web Crypto API
  return btoa(message); // Base64 encoding for demo
}

/**
 * Simple message decryption (for demo purposes - use proper encryption in production)
 */
export function decryptMessage(encryptedMessage: string, _key: string): string {
  // In production, use a proper encryption library
  try {
    return atob(encryptedMessage); // Base64 decoding for demo
  } catch {
    return encryptedMessage;
  }
}
