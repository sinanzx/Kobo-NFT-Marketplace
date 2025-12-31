/**
 * TransactionMonitor Component
 * Listens for marketplace contract events and shows toast notifications
 */

import { useEffect } from 'react';
import { useWatchContractEvent } from 'wagmi';
import toast, { Toaster } from 'react-hot-toast';
import { formatEther } from 'viem';
import { TrendingUp, Gavel, CheckCircle2 } from 'lucide-react';

// Import marketplace ABI events (subset for monitoring)
const MARKETPLACE_EVENTS_ABI = [
  {
    type: 'event',
    name: 'ItemSold',
    inputs: [
      { indexed: true, name: 'listingId', type: 'uint256' },
      { indexed: true, name: 'buyer', type: 'address' },
      { indexed: true, name: 'nftContract', type: 'address' },
      { indexed: false, name: 'seller', type: 'address' },
      { indexed: false, name: 'sourceTokenId', type: 'uint256' },
      { indexed: false, name: 'targetTokenId', type: 'uint256' },
      { indexed: false, name: 'traitName', type: 'string' },
      { indexed: false, name: 'traitValue', type: 'string' },
      { indexed: false, name: 'price', type: 'uint256' },
      { indexed: false, name: 'royaltyAmount', type: 'uint256' },
      { indexed: false, name: 'marketplaceFeeAmount', type: 'uint256' },
      { indexed: false, name: 'paymentToken', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'AuctionBid',
    inputs: [
      { indexed: true, name: 'auctionId', type: 'uint256' },
      { indexed: true, name: 'bidder', type: 'address' },
      { indexed: true, name: 'nftContract', type: 'address' },
      { indexed: false, name: 'sourceTokenId', type: 'uint256' },
      { indexed: false, name: 'bidAmount', type: 'uint256' },
      { indexed: false, name: 'paymentToken', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'AuctionSettled',
    inputs: [
      { indexed: true, name: 'auctionId', type: 'uint256' },
      { indexed: true, name: 'winner', type: 'address' },
      { indexed: true, name: 'nftContract', type: 'address' },
      { indexed: false, name: 'seller', type: 'address' },
      { indexed: false, name: 'sourceTokenId', type: 'uint256' },
      { indexed: false, name: 'targetTokenId', type: 'uint256' },
      { indexed: false, name: 'traitName', type: 'string' },
      { indexed: false, name: 'traitValue', type: 'string' },
      { indexed: false, name: 'finalBid', type: 'uint256' },
      { indexed: false, name: 'royaltyAmount', type: 'uint256' },
      { indexed: false, name: 'marketplaceFeeAmount', type: 'uint256' },
      { indexed: false, name: 'paymentToken', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ListingCreated',
    inputs: [
      { indexed: true, name: 'listingId', type: 'uint256' },
      { indexed: true, name: 'seller', type: 'address' },
      { indexed: true, name: 'nftContract', type: 'address' },
      { indexed: false, name: 'sourceTokenId', type: 'uint256' },
      { indexed: false, name: 'traitIndex', type: 'uint256' },
      { indexed: false, name: 'traitName', type: 'string' },
      { indexed: false, name: 'traitValue', type: 'string' },
      { indexed: false, name: 'price', type: 'uint256' },
      { indexed: false, name: 'paymentToken', type: 'address' },
      { indexed: false, name: 'expirationTime', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
] as const;

interface TransactionMonitorProps {
  marketplaceAddress?: `0x${string}`;
  enabled?: boolean;
}

export function TransactionMonitor({ 
  marketplaceAddress, 
  enabled = true 
}: TransactionMonitorProps) {
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format token symbol (ETH or ERC20)
  const getTokenSymbol = (paymentToken: string) => {
    return paymentToken === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'TOKEN';
  };

  // Watch for ItemSold events
  useWatchContractEvent({
    address: marketplaceAddress,
    abi: MARKETPLACE_EVENTS_ABI,
    eventName: 'ItemSold',
    enabled: enabled && !!marketplaceAddress,
    onLogs(logs) {
      logs.forEach((log) => {
        const { args } = log;
        if (!args || !args.price || !args.paymentToken || !args.buyer) return;

        const price = formatEther(args.price);
        const tokenSymbol = getTokenSymbol(args.paymentToken);
        const buyer = formatAddress(args.buyer);

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20 rounded-lg pointer-events-auto flex items-center p-4`}
            >
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-orange-400">
                  Item Sold!
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  <span className="font-mono font-semibold text-white">{args.traitName}</span>: {args.traitValue}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Sold for <span className="font-bold text-orange-400">{price} {tokenSymbol}</span> to {buyer}
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="ml-4 flex-shrink-0 text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          ),
          {
            duration: 6000,
            position: 'top-right',
          }
        );
      });
    },
  });

  // Watch for AuctionBid events
  useWatchContractEvent({
    address: marketplaceAddress,
    abi: MARKETPLACE_EVENTS_ABI,
    eventName: 'AuctionBid',
    enabled: enabled && !!marketplaceAddress,
    onLogs(logs) {
      logs.forEach((log) => {
        const { args } = log;
        if (!args || !args.bidAmount || !args.paymentToken || !args.bidder || !args.auctionId) return;

        const bidAmount = formatEther(args.bidAmount);
        const tokenSymbol = getTokenSymbol(args.paymentToken);
        const bidder = formatAddress(args.bidder);

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20 rounded-lg pointer-events-auto flex items-center p-4`}
            >
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
                  <Gavel className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-orange-400">
                  New Bid Placed!
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  Auction #{args.auctionId?.toString() || 'Unknown'}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Bid: <span className="font-bold text-orange-400">{bidAmount} {tokenSymbol}</span> by {bidder}
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="ml-4 flex-shrink-0 text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          ),
          {
            duration: 6000,
            position: 'top-right',
          }
        );
      });
    },
  });

  // Watch for AuctionSettled events
  useWatchContractEvent({
    address: marketplaceAddress,
    abi: MARKETPLACE_EVENTS_ABI,
    eventName: 'AuctionSettled',
    enabled: enabled && !!marketplaceAddress,
    onLogs(logs) {
      logs.forEach((log) => {
        const { args } = log;
        if (!args || !args.finalBid || !args.paymentToken || !args.winner) return;

        const finalBid = formatEther(args.finalBid);
        const tokenSymbol = getTokenSymbol(args.paymentToken);
        const winner = args.winner !== '0x0000000000000000000000000000000000000000' 
          ? formatAddress(args.winner) 
          : 'No Winner';

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-green-500/50 shadow-lg shadow-green-500/20 rounded-lg pointer-events-auto flex items-center p-4`}
            >
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-green-400">
                  Auction Settled!
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  <span className="font-mono font-semibold text-white">{args.traitName}</span>: {args.traitValue}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {(args.finalBid ?? 0n) > 0n ? (
                    <>Won by {winner} for <span className="font-bold text-green-400">{finalBid} {tokenSymbol}</span></>
                  ) : (
                    <span className="text-zinc-500">Ended with no bids</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="ml-4 flex-shrink-0 text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          ),
          {
            duration: 8000,
            position: 'top-right',
          }
        );
      });
    },
  });

  // Watch for ListingCreated events
  useWatchContractEvent({
    address: marketplaceAddress,
    abi: MARKETPLACE_EVENTS_ABI,
    eventName: 'ListingCreated',
    enabled: enabled && !!marketplaceAddress,
    onLogs(logs) {
      logs.forEach((log) => {
        const { args } = log;
        if (!args || !args.price || !args.paymentToken) return;

        const price = formatEther(args.price);
        const tokenSymbol = getTokenSymbol(args.paymentToken);

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20 rounded-lg pointer-events-auto flex items-center p-4`}
            >
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-blue-400">
                  New Listing!
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  <span className="font-mono font-semibold text-white">{args.traitName}</span>: {args.traitValue}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Listed for <span className="font-bold text-blue-400">{price} {tokenSymbol}</span>
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="ml-4 flex-shrink-0 text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          ),
          {
            duration: 5000,
            position: 'top-right',
          }
        );
      });
    },
  });

  return null;
}

// Export Toaster component for app-level integration
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: '',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  );
}
