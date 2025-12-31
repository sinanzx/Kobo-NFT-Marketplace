import { getDefaultConfig } from '@rainbow-me/rainbowkit';
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
import { defineChain } from 'viem';
import { selectedChain, chainId, rpcUrl } from './evmConfig';

// Map of supported chains
const chainMap: Record<number, any> = {
  1: mainnet,
  11155111: sepolia,
  137: polygon,
  80002: polygonAmoy,
  42161: arbitrum,
  421614: arbitrumSepolia,
  8453: base,
  84532: baseSepolia,
};

// Get chain from map or define custom
const getChain = () => {
  if (chainMap[chainId]) {
    return chainMap[chainId];
  }
  
  // Define custom chain for unsupported networks
  return defineChain({
    id: chainId,
    name: selectedChain.network,
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: 'Explorer',
        url: 'https://explorer.codenut.dev',
      },
    },
  });
};

export const currentChain = getChain();

export const wagmiConfig = getDefaultConfig({
  appName: 'Kōbo NFT',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [currentChain],
  ssr: false,
});
