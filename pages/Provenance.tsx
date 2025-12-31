import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Factory, ArrowLeftRight, ExternalLink } from 'lucide-react';
import { RadarScanLoader } from '@/components/ui/radar-scan-loader';
import { motion } from 'framer-motion';
import { selectedChain } from '@/utils/evmConfig';

// Event types for the blockchain ledger
interface ProvenanceEvent {
  id: string;
  type: 'mint' | 'transfer' | 'sale';
  txHash: string;
  timestamp: number;
  from: string;
  to: string;
  price?: string;
  blockNumber: number;
}

// Mock provenance data - replace with actual contract reads
const mockProvenanceData: Record<string, ProvenanceEvent[]> = {
  '1': [
    {
      id: '1',
      type: 'mint',
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      timestamp: 1701234567,
      from: '0x0000000000000000000000000000000000000000',
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      blockNumber: 18234567,
    },
    {
      id: '2',
      type: 'transfer',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      timestamp: 1701334567,
      from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      blockNumber: 18245678,
    },
    {
      id: '3',
      type: 'sale',
      txHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
      timestamp: 1701434567,
      from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      to: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      price: '0.5 ETH',
      blockNumber: 18256789,
    },
  ],
};

const EventNode = ({ event, isLast }: { event: ProvenanceEvent; isLast: boolean }) => {
  const isMint = event.type === 'mint';
  const isSale = event.type === 'sale';
  const isTransfer = event.type === 'transfer';
  
  const borderColor = isMint ? 'border-yellow-500' : isSale ? 'border-[#ea5c2a]' : 'border-gray-600';
  const iconBg = isMint ? 'bg-yellow-500/10' : isSale ? 'bg-[#ea5c2a]/10' : 'bg-gray-700/50';
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="relative flex items-start gap-6">
      {/* Orange vertical line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-[#ea5c2a]" />
      )}
      
      {/* Event icon */}
      <div className={`relative z-10 w-12 h-12 rounded-full ${iconBg} border-2 ${borderColor} flex items-center justify-center flex-shrink-0`}>
        {isMint ? (
          <Factory className="w-5 h-5 text-yellow-500" />
        ) : (
          <ArrowLeftRight className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Event card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        <Card className={`bg-[#252525] border-2 ${borderColor} p-4 mb-8`}>
          {/* Event type badge */}
          <div className="flex items-center justify-between mb-3">
            <Badge 
              variant="outline" 
              className={`font-mono text-xs ${
                isMint 
                  ? 'border-yellow-500 text-yellow-500' 
                  : isSale 
                  ? 'border-[#ea5c2a] text-[#ea5c2a]'
                  : 'border-gray-500 text-gray-400'
              }`}
            >
              {event.type.toUpperCase()}_EVENT
            </Badge>
            <span className="text-xs text-gray-500 font-mono">
              BLOCK_{event.blockNumber}
            </span>
          </div>

          {/* Transaction hash */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 font-mono mb-1">TX_HASH:</div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-[#ea5c2a] font-mono break-all">
                {event.txHash}
              </code>
              <a
                href={`https://etherscan.io/tx/${event.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#ea5c2a] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Timestamp */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 font-mono mb-1">TIMESTAMP:</div>
            <div className="text-sm text-white font-mono">{formatDate(event.timestamp)}</div>
          </div>

          {/* From -> To */}
          <div className="flex items-center gap-3 bg-[#1e1e1e] p-3 rounded border border-gray-800">
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-mono mb-1">FROM:</div>
              <code className="text-xs text-gray-300 font-mono">
                {event.from === '0x0000000000000000000000000000000000000000' 
                  ? 'GENESIS_MINT' 
                  : truncateAddress(event.from)}
              </code>
            </div>
            
            <ArrowLeftRight className="w-4 h-4 text-[#ea5c2a] flex-shrink-0" />
            
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-mono mb-1">TO:</div>
              <code className="text-xs text-gray-300 font-mono">
                {truncateAddress(event.to)}
              </code>
            </div>
          </div>

          {/* Price for sales */}
          {isSale && event.price && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="text-xs text-gray-500 font-mono mb-1">SALE_PRICE:</div>
              <div className="text-lg text-green-500 font-mono font-bold">{event.price}</div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default function Provenance() {
  const [tokenId, setTokenId] = useState('');
  const [searchedTokenId, setSearchedTokenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (tokenId.trim()) {
      setSearchedTokenId(tokenId.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const events = searchedTokenId ? mockProvenanceData[searchedTokenId] || [] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-center">
          <RadarScanLoader size="lg" className="mx-auto mb-4" />
          <p className="text-[#ea5c2a] font-mono text-sm">INITIALIZING_LEDGER...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] pt-24 pb-16 relative overflow-hidden">
      {/* Blueprint Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#ea5c2a 1px, transparent 1px),
            linear-gradient(90deg, #ea5c2a 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-white font-mono mb-3">
            <span className="text-[#ea5c2a]">CHAIN_OF_CUSTODY</span> // PROVENANCE_LEDGER
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Immutable blockchain history • Permanent record verification
          </p>
        </motion.div>

        {/* Database Query Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="bg-[#252525] border-2 border-[#ea5c2a] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-[#ea5c2a]" />
              <span className="text-sm font-mono text-gray-400">DATABASE_QUERY:</span>
            </div>
            
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter Token ID (e.g., 1, 2, 3...)"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent border-gray-700 text-white font-mono focus:border-[#ea5c2a] focus:ring-[#ea5c2a]/20"
              />
              <Button
                onClick={handleSearch}
                className="bg-[#ea5c2a] hover:bg-[#ea5c2a]/80 text-white font-mono px-8"
              >
                EXECUTE_QUERY
              </Button>
            </div>

            <div className="mt-3 text-xs text-gray-500 font-mono">
              &gt; Query the immutable ledger for complete asset history
            </div>
          </Card>
        </motion.div>

        {/* Timeline */}
        {searchedTokenId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {events.length > 0 ? (
              <div className="relative">
                <div className="mb-6">
                  <Badge variant="outline" className="border-[#ea5c2a] text-[#ea5c2a] font-mono">
                    TOKEN_ID: {searchedTokenId}
                  </Badge>
                  <div className="text-sm text-gray-500 font-mono mt-2">
                    {events.length} RECORD{events.length !== 1 ? 'S' : ''}_FOUND
                  </div>
                </div>

                {events.map((event, index) => (
                  <EventNode 
                    key={event.id} 
                    event={event} 
                    isLast={index === events.length - 1}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-[#252525] border-2 border-gray-700 p-12 text-center">
                <div className="text-gray-500 font-mono">
                  <div className="text-lg mb-2">NO_RECORDS_FOUND</div>
                  <div className="text-sm">Token ID "{searchedTokenId}" does not exist in the ledger</div>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!searchedTokenId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#252525] border-2 border-gray-700 p-12 text-center">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-500 font-mono">
                <div className="text-lg mb-2">AWAITING_QUERY</div>
                <div className="text-sm">Enter a Token ID to inspect its complete chain of custody</div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
