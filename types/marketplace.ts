/**
 * Marketplace Event Types for Indexed Data
 * Compatible with The Graph and Envio indexers
 */

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum AuctionStatus {
  ACTIVE = 'ACTIVE',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
}

/**
 * Indexed Listing Event Data
 */
export interface ListingCreatedEvent {
  id: string;
  listingId: string;
  seller: string;
  nftContract: string;
  sourceTokenId: string;
  traitIndex: number;
  traitName: string;
  traitValue: string;
  price: string;
  paymentToken: string;
  expirationTime: string;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

/**
 * Indexed Sale Event Data
 */
export interface ItemSoldEvent {
  id: string;
  listingId: string;
  buyer: string;
  seller: string;
  nftContract: string;
  sourceTokenId: string;
  targetTokenId: string;
  traitName: string;
  traitValue: string;
  price: string;
  royaltyAmount: string;
  marketplaceFeeAmount: string;
  paymentToken: string;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

/**
 * Indexed Auction Created Event Data
 */
export interface AuctionCreatedEvent {
  id: string;
  auctionId: string;
  seller: string;
  nftContract: string;
  sourceTokenId: string;
  traitIndex: number;
  traitName: string;
  traitValue: string;
  startingPrice: string;
  paymentToken: string;
  endTime: string;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

/**
 * Indexed Auction Bid Event Data
 */
export interface AuctionBidEvent {
  id: string;
  auctionId: string;
  bidder: string;
  nftContract: string;
  sourceTokenId: string;
  bidAmount: string;
  paymentToken: string;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

/**
 * Indexed Auction Settled Event Data
 */
export interface AuctionSettledEvent {
  id: string;
  auctionId: string;
  winner: string;
  seller: string;
  nftContract: string;
  sourceTokenId: string;
  targetTokenId: string;
  traitName: string;
  traitValue: string;
  finalBid: string;
  royaltyAmount: string;
  marketplaceFeeAmount: string;
  paymentToken: string;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

/**
 * Aggregated Listing Data (combines event + current state)
 */
export interface MarketplaceListing {
  listingId: string;
  seller: string;
  nftContract: string;
  sourceTokenId: string;
  traitIndex: number;
  traitName: string;
  traitValue: string;
  price: string;
  paymentToken: string;
  expirationTime: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Aggregated Auction Data (combines event + current state)
 */
export interface MarketplaceAuction {
  auctionId: string;
  seller: string;
  nftContract: string;
  sourceTokenId: string;
  traitIndex: number;
  traitName: string;
  traitValue: string;
  startingPrice: string;
  currentBid: string;
  currentBidder: string | null;
  paymentToken: string;
  endTime: string;
  status: AuctionStatus;
  createdAt: string;
  bids: AuctionBidEvent[];
}

/**
 * GraphQL Query Variables
 */
export interface ListingsQueryVariables {
  first?: number;
  skip?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: {
    status?: ListingStatus;
    seller?: string;
    nftContract?: string;
    paymentToken?: string;
    traitName?: string;
    price_gte?: string;
    price_lte?: string;
  };
}

export interface AuctionsQueryVariables {
  first?: number;
  skip?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: {
    status?: AuctionStatus;
    seller?: string;
    nftContract?: string;
    paymentToken?: string;
    traitName?: string;
    endTime_gte?: string;
    endTime_lte?: string;
  };
}

/**
 * GraphQL Response Types
 */
export interface ListingsQueryResponse {
  listings: MarketplaceListing[];
}

export interface AuctionsQueryResponse {
  auctions: MarketplaceAuction[];
}

export interface SalesHistoryQueryResponse {
  itemSoldEvents: ItemSoldEvent[];
}

export interface AuctionBidsQueryResponse {
  auctionBidEvents: AuctionBidEvent[];
}
