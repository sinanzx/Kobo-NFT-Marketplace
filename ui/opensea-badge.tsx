import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OpenSeaBadgeProps {
  contractAddress: string;
  tokenId?: string;
  chainId?: number;
  variant?: 'badge' | 'button' | 'link';
  size?: 'sm' | 'lg';
  className?: string;
}

const OPENSEA_TESTNET_BASE = 'https://testnets.opensea.io';
const OPENSEA_MAINNET_BASE = 'https://opensea.io';

// Map chain IDs to OpenSea network identifiers
const CHAIN_TO_OPENSEA_NETWORK: Record<number, string> = {
  1: 'ethereum',
  11155111: 'sepolia',
  137: 'matic',
  80001: 'mumbai',
  42161: 'arbitrum',
  421613: 'arbitrum-goerli',
  10: 'optimism',
  420: 'optimism-goerli',
  8453: 'base',
  84531: 'base-goerli',
  84532: 'base-sepolia',
};

const TESTNET_CHAIN_IDS = [11155111, 80001, 421613, 420, 84531, 84532];

export function OpenSeaBadge({
  contractAddress,
  tokenId,
  chainId = 84532, // Default to Base Sepolia
  variant = 'badge',
  size = 'sm',
  className = '',
}: OpenSeaBadgeProps) {
  const isTestnet = TESTNET_CHAIN_IDS.includes(chainId);
  const baseUrl = isTestnet ? OPENSEA_TESTNET_BASE : OPENSEA_MAINNET_BASE;
  const network = CHAIN_TO_OPENSEA_NETWORK[chainId] || 'base-sepolia';

  // Build OpenSea URL
  const openSeaUrl = tokenId
    ? `${baseUrl}/assets/${network}/${contractAddress}/${tokenId}`
    : `${baseUrl}/assets/${network}/${contractAddress}`;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    lg: 'w-5 h-5',
  };

  if (variant === 'badge') {
    return (
      <motion.a
        href={openSeaUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-full font-semibold hover:bg-blue-500/30 transition-colors ${sizeClasses[size]} ${className}`}
      >
        <svg className={iconSizes[size]} viewBox="0 0 90 90" fill="currentColor">
          <path d="M45 0C20.151 0 0 20.151 0 45s20.151 45 45 45 45-20.151 45-45S69.849 0 45 0zm23.123 48.514L50.85 66.789c-.584.584-1.535.584-2.119 0L31.458 49.516c-.584-.584-.584-1.535 0-2.119l17.273-17.273c.584-.584 1.535-.584 2.119 0l17.273 17.273c.584.584.584 1.535 0 2.119z" />
        </svg>
        OpenSea
      </motion.a>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        asChild
        variant="outline"
        size={size}
        className={`border-blue-500/50 hover:bg-blue-500/10 ${className}`}
      >
        <motion.a
          href={openSeaUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2"
        >
          <svg className={iconSizes[size]} viewBox="0 0 90 90" fill="currentColor">
            <path d="M45 0C20.151 0 0 20.151 0 45s20.151 45 45 45 45-20.151 45-45S69.849 0 45 0zm23.123 48.514L50.85 66.789c-.584.584-1.535.584-2.119 0L31.458 49.516c-.584-.584-.584-1.535 0-2.119l17.273-17.273c.584-.584 1.535-.584 2.119 0l17.273 17.273c.584.584.584 1.535 0 2.119z" />
          </svg>
          View on OpenSea
          <ExternalLink className={iconSizes[size]} />
        </motion.a>
      </Button>
    );
  }

  // variant === 'link'
  return (
    <motion.a
      href={openSeaUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors ${sizeClasses[size]} ${className}`}
    >
      <svg className={iconSizes[size]} viewBox="0 0 90 90" fill="currentColor">
        <path d="M45 0C20.151 0 0 20.151 0 45s20.151 45 45 45 45-20.151 45-45S69.849 0 45 0zm23.123 48.514L50.85 66.789c-.584.584-1.535.584-2.119 0L31.458 49.516c-.584-.584-.584-1.535 0-2.119l17.273-17.273c.584-.584 1.535-.584 2.119 0l17.273 17.273c.584.584.584 1.535 0 2.119z" />
      </svg>
      View on OpenSea
      <ExternalLink className={iconSizes[size]} />
    </motion.a>
  );
}

interface OpenSeaCollectionLinkProps {
  contractAddress: string;
  chainId?: number;
  className?: string;
}

export function OpenSeaCollectionLink({
  contractAddress,
  chainId = 84532,
  className = '',
}: OpenSeaCollectionLinkProps) {
  const isTestnet = TESTNET_CHAIN_IDS.includes(chainId);
  const baseUrl = isTestnet ? OPENSEA_TESTNET_BASE : OPENSEA_MAINNET_BASE;
  const network = CHAIN_TO_OPENSEA_NETWORK[chainId] || 'base-sepolia';
  const collectionUrl = `${baseUrl}/assets/${network}/${contractAddress}`;

  return (
    <motion.a
      href={collectionUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold transition-all ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 90 90" fill="currentColor">
        <path d="M45 0C20.151 0 0 20.151 0 45s20.151 45 45 45 45-20.151 45-45S69.849 0 45 0zm23.123 48.514L50.85 66.789c-.584.584-1.535.584-2.119 0L31.458 49.516c-.584-.584-.584-1.535 0-2.119l17.273-17.273c.584-.584 1.535-.584 2.119 0l17.273 17.273c.584.584.584 1.535 0 2.119z" />
      </svg>
      View Collection on OpenSea
      <ExternalLink className="w-4 h-4" />
    </motion.a>
  );
}
