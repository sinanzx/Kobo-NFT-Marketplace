/**
 * EVM Configuration for KoboNFT dApp
 * 
 * To build for different chains, set the VITE_CHAIN environment variable:
 * 
 * VITE_CHAIN=devnet pnpm run build    (for local development - default)
 * VITE_CHAIN=sepolia pnpm run build   (for Ethereum Sepolia testnet)
 * VITE_CHAIN=mainnet pnpm run build   (for Ethereum mainnet)
 */

import metadata from '../metadata.json';

const targetChainName = import.meta.env.VITE_CHAIN || 'devnet';

// Find the chain configuration by network name
const evmConfig = metadata.chains.find(chain => chain.network === targetChainName);

if (!evmConfig) {
  throw new Error(`Chain '${targetChainName}' not found in metadata.json`);
}

// Get the KoboNFT contract
const contractInfo = evmConfig.contracts.find(c => c.contractName === 'KoboNFT');

if (!contractInfo) {
  throw new Error(`KoboNFT contract not found in metadata.json for chain '${targetChainName}'`);
}

export const selectedChain = evmConfig;
export const contractAddress = contractInfo.address as `0x${string}`;
export const contractABI = contractInfo.abi;
export const chainId = parseInt(evmConfig.chainId);
export const rpcUrl = evmConfig.rpc_url;

// NFT Type enum (matches Solidity)
export enum NFTType {
  IMAGE = 0,
  VIDEO = 1,
  AUDIO = 2
}

// Generation Method enum (matches Solidity)
export enum GenerationMethod {
  AI_GENERATED = 0,
  MANUAL_UPLOAD = 1,
  REMIXED = 2
}

// Type definitions for contract interactions
export interface NFTMetadata {
  nftType: NFTType;
  generationMethod: GenerationMethod;
  copyrightAuditHash: string;
  mintTimestamp: bigint;
  creator: string;
}

export interface MintParams {
  to: string;
  uri: string;
  nftType: NFTType;
  generationMethod: GenerationMethod;
  copyrightAuditHash: string;
}
