import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, AlertCircle } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { toast } from '@/hooks/use-toast';
import { selectedChain } from '@/utils/evmConfig';
import type { MarketplaceListing } from '@/types/marketplace';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: MarketplaceListing | null;
  targetTokenId?: bigint;
  isBulk?: boolean;
  listings?: MarketplaceListing[];
  targetTokenIds?: bigint[];
}

const marketplaceContract = selectedChain.contracts.find(
  c => c.contractName === 'KoboTraitMarketplace'
);

const MARKETPLACE_FEE_BPS = 250; // 2.5% in basis points
const CREATOR_ROYALTY_BPS = 500; // 5% in basis points

export default function CheckoutModal({
  isOpen,
  onClose,
  listing,
  targetTokenId,
  isBulk = false,
  listings = [],
  targetTokenIds = [],
}: CheckoutModalProps) {
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculate price breakdown
  const calculatePriceBreakdown = () => {
    if (isBulk && listings.length > 0) {
      const totalPrice = listings.reduce((sum, l) => sum + BigInt(l.price), 0n);
      const royalty = (totalPrice * BigInt(CREATOR_ROYALTY_BPS)) / 10000n;
      const total = totalPrice;
      return { itemPrice: totalPrice, royalty, total };
    } else if (listing) {
      const itemPrice = BigInt(listing.price);
      const royalty = (itemPrice * BigInt(CREATOR_ROYALTY_BPS)) / 10000n;
      const total = itemPrice;
      return { itemPrice, royalty, total };
    }
    return { itemPrice: 0n, royalty: 0n, total: 0n };
  };

  const { itemPrice, royalty, total } = calculatePriceBreakdown();

  const handleConfirmTransaction = async () => {
    if (!address || !marketplaceContract) {
      toast({ title: 'Error', description: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    if (isBulk) {
      if (listings.length === 0 || targetTokenIds.length === 0) {
        toast({ title: 'Error', description: 'No items selected', variant: 'destructive' });
        return;
      }
      if (listings.length !== targetTokenIds.length) {
        toast({ title: 'Error', description: 'Mismatch between listings and target tokens', variant: 'destructive' });
        return;
      }
    } else {
      if (!listing || !targetTokenId) {
        toast({ title: 'Error', description: 'Invalid listing or target token', variant: 'destructive' });
        return;
      }
    }

    setIsProcessing(true);

    try {
      if (isBulk) {
        // Bulk buy
        const listingIds = listings.map(l => BigInt(l.listingId));
        
        writeContract({
          address: marketplaceContract.address as `0x${string}`,
          abi: marketplaceContract.abi,
          functionName: 'bulkBuyTraits',
          args: [listingIds, targetTokenIds],
          value: total,
        });
      } else {
        // Single buy
        writeContract({
          address: marketplaceContract.address as `0x${string}`,
          abi: marketplaceContract.abi,
          functionName: 'buyTrait',
          args: [BigInt(listing!.listingId), targetTokenId],
          value: total,
        });
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({ title: 'Error', description: error?.message || 'Transaction failed', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  // Handle transaction success
  if (isSuccess && isProcessing) {
    setIsProcessing(false);
    toast({ title: 'Success', description: isBulk ? 'Bulk purchase successful!' : 'Purchase successful!' });
    onClose();
  }

  if (!isOpen) return null;

  const itemCount = isBulk ? listings.length : 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-[#1a1a1a] border-2 border-[#ff6b35] rounded-lg shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-[#0a0a0a] border-b-2 border-[#ff6b35] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-[#ff6b35]" />
                  <h2 className="text-xl font-mono font-bold text-white tracking-wider">
                    RECEIPT
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Item Summary */}
                <div className="space-y-3">
                  <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">
                    Item Summary
                  </h3>
                  
                  {isBulk ? (
                    <div className="space-y-2">
                      {listings.map((item, idx) => (
                        <div
                          key={item.listingId}
                          className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-gray-800 rounded"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-[#ff6b35]/20 to-purple-500/20 rounded flex items-center justify-center">
                            <span className="text-[#ff6b35] font-mono text-xs">#{idx + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{item.traitName}</p>
                            <p className="text-gray-400 text-sm truncate">{item.traitValue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : listing ? (
                    <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-gray-800 rounded">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#ff6b35]/20 to-purple-500/20 rounded flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-[#ff6b35]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{listing.traitName}</p>
                        <p className="text-gray-400 text-sm truncate">{listing.traitValue}</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">
                    Price Breakdown
                  </h3>
                  
                  <div className="bg-[#0a0a0a] border border-gray-800 rounded p-4 space-y-3 font-mono">
                    {/* Item Price */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        {isBulk ? `Items (${itemCount})` : 'Item Price'}
                      </span>
                      <span className="text-white">
                        {formatEther(itemPrice)} ETH
                      </span>
                    </div>

                    {/* Creator Royalty */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Creator Royalty (5%)</span>
                      <span className="text-[#ff6b35]">
                        {formatEther(royalty)} ETH
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-800 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold">TOTAL</span>
                        <span className="text-[#ff6b35] font-bold text-lg">
                          {formatEther(total)} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                {!address && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-200 text-sm">
                      Please connect your wallet to proceed with the purchase.
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handleConfirmTransaction}
                  disabled={!address || isProcessing || isConfirming}
                  className="w-full bg-[#ff6b35] hover:bg-[#ff8555] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-mono font-bold py-4 px-6 rounded transition-all duration-200 uppercase tracking-wider text-lg relative overflow-hidden group"
                >
                  {isProcessing || isConfirming ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10">Confirm Transaction</span>
                      {/* Industrial loading bar effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
