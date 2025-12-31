/**
 * Trait Marketplace Service
 * Handles trait listing, buying, and rarity calculations
 */

import { selectedChain } from '@/utils/evmConfig';

// Get marketplace contract from metadata
const marketplaceContract = selectedChain.contracts.find(
  c => c.contractName === 'KoboTraitMarketplace'
);

if (!marketplaceContract) {
  throw new Error('KoboTraitMarketplace contract not found in metadata');
}

export const MARKETPLACE_ADDRESS = marketplaceContract.address as `0x${string}`;
export const MARKETPLACE_ABI = marketplaceContract.abi;

// Listing status enum
export enum ListingStatus {
  ACTIVE = 0,
  SOLD = 1,
  CANCELLED = 2,
  EXPIRED = 3
}

// Type definitions
export interface TraitListing {
  listingId: bigint;
  seller: string;
  sourceTokenId: bigint;
  traitIndex: bigint;
  traitName: string;
  traitValue: string;
  price: bigint;
  expirationTime: bigint;
  status: ListingStatus;
  createdAt: bigint;
}

export interface TraitRarity {
  traitName: string;
  traitValue: string;
  occurrences: bigint;
  totalSupply: bigint;
  rarityScore: bigint;
}

export interface Trait {
  name: string;
  value: string;
  lastUpdated: bigint;
}

// Rarity tier classification
export enum RarityTier {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary'
}

/**
 * Get rarity tier based on rarity score
 * Score is calculated as (10000 * totalSupply) / occurrences
 */
export function getRarityTier(rarityScore: bigint): RarityTier {
  const score = Number(rarityScore);
  
  if (score >= 50000) return RarityTier.LEGENDARY;
  if (score >= 20000) return RarityTier.EPIC;
  if (score >= 10000) return RarityTier.RARE;
  if (score >= 5000) return RarityTier.UNCOMMON;
  return RarityTier.COMMON;
}

/**
 * Get color for rarity tier
 */
export function getRarityColor(tier: RarityTier): string {
  switch (tier) {
    case RarityTier.LEGENDARY:
      return 'text-yellow-500';
    case RarityTier.EPIC:
      return 'text-purple-500';
    case RarityTier.RARE:
      return 'text-blue-500';
    case RarityTier.UNCOMMON:
      return 'text-green-500';
    case RarityTier.COMMON:
      return 'text-gray-500';
  }
}

/**
 * Format price in ETH
 */
export function formatPrice(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(occurrences: bigint, totalSupply: bigint): string {
  if (totalSupply === 0n) return '0';
  const percentage = (Number(occurrences) / Number(totalSupply)) * 100;
  return percentage.toFixed(2);
}

/**
 * Check if listing is expired
 */
export function isListingExpired(listing: TraitListing): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return listing.expirationTime < now && listing.status === ListingStatus.ACTIVE;
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(expirationTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = Number(expirationTime) - now;
  
  if (remaining <= 0) return 'Expired';
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Sort listings by various criteria
 */
export function sortListings(
  listings: TraitListing[],
  sortBy: 'price-asc' | 'price-desc' | 'time-asc' | 'time-desc' | 'rarity'
): TraitListing[] {
  const sorted = [...listings];
  
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => Number(a.price - b.price));
    case 'price-desc':
      return sorted.sort((a, b) => Number(b.price - a.price));
    case 'time-asc':
      return sorted.sort((a, b) => Number(a.expirationTime - b.expirationTime));
    case 'time-desc':
      return sorted.sort((a, b) => Number(b.expirationTime - a.expirationTime));
    default:
      return sorted;
  }
}

/**
 * Filter listings by trait name
 */
export function filterByTraitName(listings: TraitListing[], traitName: string): TraitListing[] {
  if (!traitName) return listings;
  return listings.filter(l => 
    l.traitName.toLowerCase().includes(traitName.toLowerCase())
  );
}

/**
 * Filter listings by price range
 */
export function filterByPriceRange(
  listings: TraitListing[],
  minPrice: bigint,
  maxPrice: bigint
): TraitListing[] {
  return listings.filter(l => l.price >= minPrice && l.price <= maxPrice);
}

/**
 * Get unique trait names from listings
 */
export function getUniqueTraitNames(listings: TraitListing[]): string[] {
  const names = new Set(listings.map(l => l.traitName));
  return Array.from(names).sort();
}
