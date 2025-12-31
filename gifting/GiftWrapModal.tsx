import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { selectedChain } from '@/utils/evmConfig';
import { createGiftWrap } from '@/lib/giftService';
import { awardXP } from '@/lib/gamificationService';
import { X, Gift, Send, Loader2 } from 'lucide-react';

interface GiftWrapModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  tokenUri: string;
  onSuccess?: () => void;
}

export default function GiftWrapModal({
  isOpen,
  onClose,
  tokenId,
  tokenUri,
  onSuccess,
}: GiftWrapModalProps) {
  const { address } = useAccount();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'idle' | 'approving' | 'wrapping' | 'complete'>('idle');

  // Get contracts
  const giftWrapperContract = selectedChain.contracts.find(
    (c) => c.contractName === 'KoboGiftWrapper'
  );
  const nftContract = selectedChain.contracts.find(
    (c) => c.contractName === 'KoboNFT'
  );

  // Approve NFT
  const { 
    writeContract: approveNFT, 
    data: approveHash,
    isPending: isApproving 
  } = useWriteContract();

  const { 
    isLoading: isApprovingConfirming, 
    isSuccess: isApproveSuccess 
  } = useWaitForTransactionReceipt({ 
    hash: approveHash 
  });

  // Wrap gift
  const { 
    writeContract: wrapGift, 
    data: wrapHash,
    isPending: isWrapping 
  } = useWriteContract();

  const { 
    isLoading: isWrapConfirming, 
    isSuccess: isWrapSuccess 
  } = useWaitForTransactionReceipt({ 
    hash: wrapHash 
  });

  // Read gift IDs after wrapping
  const { data: giftIds, refetch: refetchGiftIds } = useReadContract({
    address: giftWrapperContract?.address as `0x${string}`,
    abi: giftWrapperContract?.abi,
    functionName: 'getGiftsByRecipient',
    args: [recipientAddress as `0x${string}`],
    query: {
      enabled: false, // Only fetch when we need it
    },
  });

  // Handle approval success
  useEffect(() => {
    if (isApproveSuccess && step === 'approving') {
      setStep('wrapping');
      handleWrap();
    }
  }, [isApproveSuccess, step]);

  // Handle wrap success
  useEffect(() => {
    if (isWrapSuccess && step === 'wrapping') {
      handleComplete();
    }
  }, [isWrapSuccess, step]);

  if (!isOpen) return null;

  const handleWrap = () => {
    if (!giftWrapperContract || !nftContract) return;

    wrapGift({
      address: giftWrapperContract.address as `0x${string}`,
      abi: giftWrapperContract.abi,
      functionName: 'wrapGift',
      args: [nftContract.address, BigInt(tokenId), recipientAddress as `0x${string}`, message],
    });
  };

  const handleComplete = async () => {
    if (!address || !nftContract || !wrapHash) return;

    try {
      // Fetch gift IDs
      const result = await refetchGiftIds();
      const ids = result.data as bigint[] | undefined;
      
      if (!ids || ids.length === 0) {
        throw new Error('Failed to get gift ID');
      }

      const latestGiftId = ids[ids.length - 1];

      // Create gift wrap record in database
      await createGiftWrap({
        giftId: Number(latestGiftId),
        tokenId,
        contractAddress: nftContract.address,
        senderAddress: address,
        recipientAddress,
        message: message || undefined,
        wrapTxHash: wrapHash,
      });

      // Award XP for sending a gift
      await awardXP(address, 50, 'gift_sent', `Sent gift #${tokenId}`);

      setStep('complete');
      onSuccess?.();
      onClose();
      setRecipientAddress('');
      setMessage('');
      setStep('idle');
    } catch (err: any) {
      console.error('Gift completion error:', err);
      setError(err.message || 'Failed to complete gift wrapping');
      setStep('idle');
    }
  };

  const handleWrapGift = async () => {
    if (!address || !giftWrapperContract || !nftContract) return;

    // Validate recipient address
    if (!recipientAddress || !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    if (recipientAddress.toLowerCase() === address.toLowerCase()) {
      setError('You cannot send a gift to yourself');
      return;
    }

    setError('');
    setStep('approving');

    // Approve NFT for gift wrapper contract
    approveNFT({
      address: nftContract.address as `0x${string}`,
      abi: nftContract.abi,
      functionName: 'approve',
      args: [giftWrapperContract.address, BigInt(tokenId)],
    });
  };

  const isProcessing = step !== 'idle' && step !== 'complete';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isProcessing}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Wrap as Gift</h2>
            <p className="text-sm text-gray-500">NFT #{tokenId}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gift Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a personal message..."
              rows={4}
              maxLength={500}
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {step !== 'idle' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-600">
                {step === 'approving' && (isApproving || isApprovingConfirming) && 'Approving NFT...'}
                {step === 'wrapping' && (isWrapping || isWrapConfirming) && 'Wrapping gift...'}
              </p>
            </div>
          )}

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-medium text-purple-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Your NFT will be transferred to the gift wrapper contract</li>
              <li>• The recipient can unwrap it at any time</li>
              <li>• You can cancel the gift before it's unwrapped</li>
              <li>• You'll earn 50 XP for sending a gift</li>
            </ul>
          </div>

          <button
            onClick={handleWrapGift}
            disabled={isProcessing || !recipientAddress}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {step === 'approving' ? 'Approving...' : 'Wrapping...'}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Wrap & Send Gift
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
