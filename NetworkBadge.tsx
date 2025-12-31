import { useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { 
  mainnet, 
  sepolia, 
  polygon, 
  polygonAmoy,
  arbitrum, 
  arbitrumSepolia,
  base,
  baseSepolia 
} from 'wagmi/chains';
import { ChevronDown, Network, AlertCircle } from 'lucide-react';
import { currentChain } from '../utils/wagmiConfig';

const supportedChains = [
  mainnet,
  sepolia,
  polygon,
  polygonAmoy,
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
];

const chainColors: Record<number, string> = {
  1: 'bg-blue-500',
  11155111: 'bg-purple-500',
  137: 'bg-violet-500',
  80002: 'bg-violet-400',
  42161: 'bg-cyan-500',
  421614: 'bg-cyan-400',
  8453: 'bg-blue-600',
  84532: 'bg-blue-400',
};

export default function NetworkBadge() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);

  if (!isConnected) return null;

  const isCorrectChain = chainId === currentChain.id;
  const currentChainInfo = supportedChains.find(c => c.id === chainId) || currentChain;
  const badgeColor = chainColors[chainId] || 'bg-gray-500';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium transition-all ${
          isCorrectChain ? badgeColor : 'bg-red-500 animate-pulse'
        }`}
      >
        {isCorrectChain ? (
          <Network className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        <span>{currentChainInfo.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Switch Network
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {chains.map((chain) => {
                const color = chainColors[chain.id] || 'bg-gray-500';
                const isCurrent = chain.id === chainId;
                const isTarget = chain.id === currentChain.id;
                
                return (
                  <button
                    key={chain.id}
                    onClick={() => {
                      switchChain({ chainId: chain.id });
                      setIsOpen(false);
                    }}
                    disabled={isCurrent}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isCurrent 
                        ? 'bg-gray-100 dark:bg-gray-700 cursor-default' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {chain.name}
                      </p>
                      {isTarget && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Target network
                        </p>
                      )}
                    </div>
                    {isCurrent && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
            {!isCorrectChain && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">
                  ⚠️ Please switch to {currentChain.name} to use this dApp
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
