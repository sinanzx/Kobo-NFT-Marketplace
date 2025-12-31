/**
 * useMarketData Hook
 * GraphQL-based data fetching for marketplace listings and auctions
 * Compatible with The Graph and Envio indexers for sub-second filtering
 */

import { useState, useEffect, useCallback } from 'react';
import {
  type MarketplaceListing,
  type MarketplaceAuction,
  type ItemSoldEvent,
  type AuctionBidEvent,
  type ListingsQueryVariables,
  type AuctionsQueryVariables,
  ListingStatus,
  AuctionStatus,
} from '../types/marketplace';

/**
 * GraphQL Query Templates
 * These queries are compatible with The Graph and Envio indexer schemas
 */

const LISTINGS_QUERY = `
  query GetListings(
    $first: Int = 100
    $skip: Int = 0
    $orderBy: String = "timestamp"
    $orderDirection: String = "desc"
    $where: ListingFilter
  ) {
    listings(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      listingId
      seller
      nftContract
      sourceTokenId
      traitIndex
      traitName
      traitValue
      price
      paymentToken
      expirationTime
      status
      createdAt
      updatedAt
    }
  }
`;

const AUCTIONS_QUERY = `
  query GetAuctions(
    $first: Int = 100
    $skip: Int = 0
    $orderBy: String = "timestamp"
    $orderDirection: String = "desc"
    $where: AuctionFilter
  ) {
    auctions(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      auctionId
      seller
      nftContract
      sourceTokenId
      traitIndex
      traitName
      traitValue
      startingPrice
      currentBid
      currentBidder
      paymentToken
      endTime
      status
      createdAt
      bids {
        id
        bidder
        bidAmount
        timestamp
      }
    }
  }
`;

const SALES_HISTORY_QUERY = `
  query GetSalesHistory(
    $first: Int = 100
    $skip: Int = 0
    $orderBy: String = "timestamp"
    $orderDirection: String = "desc"
    $where: ItemSoldFilter
  ) {
    itemSoldEvents(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      listingId
      buyer
      seller
      nftContract
      sourceTokenId
      targetTokenId
      traitName
      traitValue
      price
      royaltyAmount
      marketplaceFeeAmount
      paymentToken
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

const AUCTION_BIDS_QUERY = `
  query GetAuctionBids(
    $auctionId: String!
    $first: Int = 100
    $orderBy: String = "timestamp"
    $orderDirection: String = "desc"
  ) {
    auctionBidEvents(
      where: { auctionId: $auctionId }
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      auctionId
      bidder
      nftContract
      sourceTokenId
      bidAmount
      paymentToken
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

/**
 * Configuration for indexer endpoint
 * Replace with your actual The Graph or Envio subgraph URL
 */
const INDEXER_ENDPOINT = import.meta.env.VITE_INDEXER_ENDPOINT || 'https://api.thegraph.com/subgraphs/name/your-subgraph';

/**
 * Generic GraphQL fetch function
 */
async function fetchGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(INDEXER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data as T;
}

/**
 * Hook for fetching active marketplace listings
 */
export function useMarketListings(variables?: ListingsQueryVariables) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchGraphQL<{ listings: MarketplaceListing[] }>(
        LISTINGS_QUERY,
        {
          first: variables?.first || 100,
          skip: variables?.skip || 0,
          orderBy: variables?.orderBy || 'timestamp',
          orderDirection: variables?.orderDirection || 'desc',
          where: {
            status: ListingStatus.ACTIVE,
            ...variables?.where,
          },
        }
      );

      setListings(data.listings);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [variables]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}

/**
 * Hook for fetching active auctions
 */
export function useMarketAuctions(variables?: AuctionsQueryVariables) {
  const [auctions, setAuctions] = useState<MarketplaceAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchGraphQL<{ auctions: MarketplaceAuction[] }>(
        AUCTIONS_QUERY,
        {
          first: variables?.first || 100,
          skip: variables?.skip || 0,
          orderBy: variables?.orderBy || 'timestamp',
          orderDirection: variables?.orderDirection || 'desc',
          where: {
            status: AuctionStatus.ACTIVE,
            ...variables?.where,
          },
        }
      );

      setAuctions(data.auctions);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [variables]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  return { auctions, loading, error, refetch: fetchAuctions };
}

/**
 * Hook for fetching sales history
 */
export function useSalesHistory(variables?: {
  first?: number;
  skip?: number;
  seller?: string;
  buyer?: string;
  nftContract?: string;
}) {
  const [sales, setSales] = useState<ItemSoldEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchGraphQL<{ itemSoldEvents: ItemSoldEvent[] }>(
        SALES_HISTORY_QUERY,
        {
          first: variables?.first || 100,
          skip: variables?.skip || 0,
          orderBy: 'timestamp',
          orderDirection: 'desc',
          where: variables,
        }
      );

      setSales(data.itemSoldEvents);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [variables]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { sales, loading, error, refetch: fetchSales };
}

/**
 * Hook for fetching auction bid history
 */
export function useAuctionBids(auctionId: string) {
  const [bids, setBids] = useState<AuctionBidEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBids = useCallback(async () => {
    if (!auctionId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await fetchGraphQL<{ auctionBidEvents: AuctionBidEvent[] }>(
        AUCTION_BIDS_QUERY,
        {
          auctionId,
          first: 100,
          orderBy: 'timestamp',
          orderDirection: 'desc',
        }
      );

      setBids(data.auctionBidEvents);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  return { bids, loading, error, refetch: fetchBids };
}

/**
 * Hook for real-time subscription to new listings
 * Note: Requires WebSocket support from indexer
 */
export function useListingSubscription(onNewListing: (listing: MarketplaceListing) => void) {
  useEffect(() => {
    // TODO: Implement WebSocket subscription when indexer supports it
    // Example for The Graph:
    // const ws = new WebSocket('wss://api.thegraph.com/subgraphs/name/your-subgraph');
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === 'ListingCreated') {
    //     onNewListing(data.payload);
    //   }
    // };
    // return () => ws.close();

    console.log('Real-time subscriptions not yet implemented');
  }, [onNewListing]);
}

/**
 * Utility: Filter listings by trait rarity
 */
export function filterByRarity(
  listings: MarketplaceListing[],
  minRarity: number,
  maxRarity: number
): MarketplaceListing[] {
  // This would require rarity data from the indexer
  // For now, return all listings
  return listings;
}

/**
 * Utility: Sort listings by price
 */
export function sortByPrice(
  listings: MarketplaceListing[],
  direction: 'asc' | 'desc' = 'asc'
): MarketplaceListing[] {
  return [...listings].sort((a, b) => {
    const priceA = BigInt(a.price);
    const priceB = BigInt(b.price);
    return direction === 'asc' 
      ? Number(priceA - priceB)
      : Number(priceB - priceA);
  });
}
