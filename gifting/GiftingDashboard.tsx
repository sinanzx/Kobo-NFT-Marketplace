import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { getUserGifts, GiftWrap, getGiftMessage, markGiftUnwrapped, markGiftCancelled } from '@/lib/giftService';
import { awardXP } from '@/lib/gamificationService';
import { selectedChain } from '@/utils/evmConfig';
import UnwrapAnimation from './UnwrapAnimation';
import { Gift, Send, Inbox, X, Loader2, ExternalLink } from 'lucide-react';

export default function GiftingDashboard() {
  const { address } = useAccount();
  const [sentGifts, setSentGifts] = useState<GiftWrap[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<GiftWrap[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [unwrappingGift, setUnwrappingGift] = useState<GiftWrap | null>(null);
  const [processingGiftId, setProcessingGiftId] = useState<string | null>(null);

  const giftWrapperContract = selectedChain.contracts.find(
    (c) => c.contractName === 'KoboGiftWrapper'
  );

  const nftContract = selectedChain.contracts.find(
    (c) => c.contractName === 'KoboNFT'
  );

  const { writeContract: unwrapContract, data: unwrapHash } = useWriteContract();
  const { isSuccess: isUnwrapSuccess } = useWaitForTransactionReceipt({ hash: unwrapHash });

  const { writeContract: cancelContract, data: cancelHash } = useWriteContract();
  const { isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash });

  useEffect(() => {
    if (address) {
      loadGifts();
    }
  }, [address]);

  useEffect(() => {
    if (isUnwrapSuccess && unwrapHash && processingGiftId) {
      handleUnwrapSuccess();
    }
  }, [isUnwrapSuccess, unwrapHash]);

  useEffect(() => {
    if (isCancelSuccess && cancelHash && processingGiftId) {
      handleCancelSuccess();
    }
  }, [isCancelSuccess, cancelHash]);

  const loadGifts = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const gifts = await getUserGifts(address);
      setSentGifts(gifts.sent);
      setReceivedGifts(gifts.received);
    } catch (error) {
      console.error('Failed to load gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnwrap = async (gift: GiftWrap) => {
    if (!address || !giftWrapperContract) return;

    setProcessingGiftId(gift.id);
    
    unwrapContract({
      address: giftWrapperContract.address as `0x${string}`,
      abi: giftWrapperContract.abi,
      functionName: 'unwrapGift',
      args: [BigInt(gift.gift_id)],
    });
  };

  const handleUnwrapSuccess = async () => {
    if (!address || !unwrapHash || !processingGiftId) return;

    try {
      const gift = receivedGifts.find(g => g.id === processingGiftId);
      if (!gift) return;

      // Get NFT URI
      let tokenUri = '';
      if (nftContract) {
        const { data } = useReadContract({
          address: nftContract.address as `0x${string}`,
          abi: nftContract.abi,
          functionName: 'tokenURI',
          args: [BigInt(gift.token_id)],
        });
        tokenUri = data as string || '';
      }

      // Update database
      await markGiftUnwrapped({
        giftWrapId: gift.id,
        unwrapTxHash: unwrapHash,
        animationType: 'confetti',
      });

      // Award XP
      await awardXP(address, 100, 'gift_unwrapped', `Unwrapped gift #${gift.token_id}`);

      // Get message if exists
      const message = await getGiftMessage(gift.id);

      // Show unwrap animation
      setUnwrappingGift({
        ...gift,
        tokenUri,
        message: message?.message_text,
      } as any);

      // Reload gifts
      await loadGifts();
    } catch (error) {
      console.error('Failed to complete unwrap:', error);
    } finally {
      setProcessingGiftId(null);
    }
  };

  const handleCancel = async (gift: GiftWrap) => {
    if (!address || !giftWrapperContract) return;

    setProcessingGiftId(gift.id);

    cancelContract({
      address: giftWrapperContract.address as `0x${string}`,
      abi: giftWrapperContract.abi,
      functionName: 'cancelGift',
      args: [BigInt(gift.gift_id)],
    });
  };

  const handleCancelSuccess = async () => {
    if (!cancelHash || !processingGiftId) return;

    try {
      await markGiftCancelled({
        giftWrapId: processingGiftId,
        cancelTxHash: cancelHash,
      });

      await loadGifts();
    } catch (error) {
      console.error('Failed to complete cancel:', error);
    } finally {
      setProcessingGiftId(null);
    }
  };

  const GiftCard = ({ gift, type }: { gift: GiftWrap; type: 'sent' | 'received' }) => {
    const isPending = gift.status === 'pending';
    const isUnwrapped = gift.status === 'unwrapped';
    const isCancelled = gift.status === 'cancelled';
    const isProcessing = processingGiftId === gift.id;

    // Get explorer URL from chain config
    const explorerUrl = selectedChain.network === 'devnet' 
      ? 'https://dev-explorer.codenut.dev'
      : `https://etherscan.io`;

    return (
      <div className="bg-[#252525] border border-[#333] rounded p-6 hover:border-[#ea5c2a] transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded flex items-center justify-center ${
              isPending ? 'bg-[#ea5c2a]/20' : isUnwrapped ? 'bg-green-600/20' : 'bg-[#333]'
            }`}>
              <Gift className={`w-6 h-6 ${
                isPending ? 'text-[#ea5c2a]' : isUnwrapped ? 'text-green-500' : 'text-gray-500'
              }`} />
            </div>
            <div>
              <h3 className="font-mono font-bold text-white">NFT_#{gift.token_id.toString().padStart(4, '0')}</h3>
              <p className="text-sm text-gray-400 font-mono">
                {type === 'sent' ? 'TO' : 'FROM'}: {
                  type === 'sent'
                    ? `${gift.recipient_address.slice(0, 6)}...${gift.recipient_address.slice(-4)}`
                    : `${gift.sender_address.slice(0, 6)}...${gift.sender_address.slice(-4)}`
                }
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded text-xs font-mono font-medium uppercase ${
            isPending ? 'bg-[#ea5c2a]/20 text-[#ea5c2a]' :
            isUnwrapped ? 'bg-green-600/20 text-green-500' :
            'bg-[#333] text-gray-400'
          }`}>
            {gift.status}
          </span>
        </div>

        <div className="text-sm text-gray-400 mb-4 font-mono">
          <p>WRAPPED: {new Date(gift.wrapped_at).toLocaleDateString()}</p>
          {gift.unwrapped_at && (
            <p>UNWRAPPED: {new Date(gift.unwrapped_at).toLocaleDateString()}</p>
          )}
        </div>

        {isPending && (
          <div className="flex gap-2">
            {type === 'received' ? (
              <button
                onClick={() => handleUnwrap(gift)}
                disabled={isProcessing}
                className="flex-1 bg-[#ea5c2a] text-black py-2 rounded font-mono font-medium hover:bg-[#d14d1a] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    UNWRAPPING...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    UNWRAP_GIFT
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => handleCancel(gift)}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white py-2 rounded font-mono font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    CANCELLING...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    CANCEL_GIFT
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <a
          href={`${explorerUrl}/tx/${gift.wrap_tx_hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-xs text-[#ea5c2a] hover:text-[#d14d1a] flex items-center gap-1 font-mono"
        >
          VIEW_TRANSACTION <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 font-mono">CONNECT_WALLET_TO_VIEW_GIFTS</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-mono font-bold text-[#ea5c2a] mb-2">// GIFT_INVENTORY</h1>
        <p className="text-gray-400 font-mono text-sm">SEND_AND_RECEIVE // NFT_GIFTS_WITH_MESSAGES</p>
      </div>

      {/* Tabs - Mechanical Toggle Style */}
      <div className="flex gap-4 mb-6 border-b-2 border-[#333]">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 px-4 font-mono font-medium transition-colors relative ${
            activeTab === 'received'
              ? 'text-[#ea5c2a]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            RECEIVED ({receivedGifts.length})
          </div>
          {activeTab === 'received' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ea5c2a]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 font-mono font-medium transition-colors relative ${
            activeTab === 'sent'
              ? 'text-[#ea5c2a]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            SENT ({sentGifts.length})
          </div>
          {activeTab === 'sent' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ea5c2a]" />
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-[#ea5c2a] animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono">LOADING_GIFTS...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'received' ? (
            receivedGifts.length > 0 ? (
              receivedGifts.map((gift) => (
                <GiftCard key={gift.id} gift={gift} type="received" />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Inbox className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 font-mono">NO_GIFTS_RECEIVED_YET</p>
              </div>
            )
          ) : (
            sentGifts.length > 0 ? (
              sentGifts.map((gift) => (
                <GiftCard key={gift.id} gift={gift} type="sent" />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Send className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 font-mono">NO_GIFTS_SENT_YET</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Unwrap Animation */}
      {unwrappingGift && (
        <UnwrapAnimation
          isOpen={!!unwrappingGift}
          onComplete={() => {
            setUnwrappingGift(null);
            loadGifts();
          }}
          tokenId={unwrappingGift.token_id}
          tokenUri={(unwrappingGift as any).tokenUri || ''}
          message={(unwrappingGift as any).message}
          senderAddress={unwrappingGift.sender_address}
        />
      )}
    </div>
  );
}
