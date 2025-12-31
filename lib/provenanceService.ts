/**
 * Provenance Service
 * 
 * Service layer for NFT provenance and derivative tracking.
 * Provides functions to query genealogy, lineage, and derivative relationships.
 */

import { readContract } from 'wagmi/actions';
import { wagmiConfig } from '../utils/wagmiConfig';
import metadata from '../metadata.json';

const targetChainName = import.meta.env.VITE_CHAIN || 'devnet';
const evmConfig = metadata.chains.find(chain => chain.network === targetChainName);

if (!evmConfig) {
  throw new Error(`Chain '${targetChainName}' not found in metadata.json`);
}

const extendedContractInfo = evmConfig.contracts.find(c => c.contractName === 'KoboNFTExtended');

if (!extendedContractInfo) {
  throw new Error(`KoboNFTExtended contract not found in metadata.json for chain '${targetChainName}'`);
}

const contractAddress = extendedContractInfo.address as `0x${string}`;
const contractABI = extendedContractInfo.abi;

// Type definitions
export interface ParentNFT {
  contractAddress: string;
  tokenId: bigint;
  relationship: string;
}

export interface DerivativeInfo {
  parents: ParentNFT[];
  creator: string;
  generation: bigint;
  createdAt: bigint;
}

export interface LineageNode {
  tokenId: bigint;
  contractAddress: string;
  creator: string;
  generation: bigint;
  createdAt: bigint;
  parents: ParentNFT[];
  children: bigint[];
}

export interface ProvenanceMetadata {
  tokenId: bigint;
  generation: number;
  creator: string;
  createdAt: Date;
  parents: ParentNFT[];
  children: bigint[];
  isOriginal: boolean;
  descendantCount: number;
}

/**
 * Get derivative information for a token
 */
export async function getDerivativeInfo(tokenId: bigint): Promise<DerivativeInfo> {
  const result = await readContract(wagmiConfig, {
    address: contractAddress,
    abi: contractABI,
    functionName: 'getDerivativeInfo',
    args: [tokenId],
  }) as any;

  return {
    parents: result.parents.map((p: any) => ({
      contractAddress: p.contractAddress,
      tokenId: p.tokenId,
      relationship: p.relationship,
    })),
    creator: result.creator,
    generation: result.generation,
    createdAt: result.createdAt,
  };
}

/**
 * Get all parent NFTs for a token
 */
export async function getParents(tokenId: bigint): Promise<ParentNFT[]> {
  const result = await readContract(wagmiConfig, {
    address: contractAddress,
    abi: contractABI,
    functionName: 'getParents',
    args: [tokenId],
  }) as any[];

  return result.map((p: any) => ({
    contractAddress: p.contractAddress,
    tokenId: p.tokenId,
    relationship: p.relationship,
  }));
}

/**
 * Get all children token IDs for a token
 */
export async function getChildren(tokenId: bigint): Promise<bigint[]> {
  const result = await readContract(wagmiConfig, {
    address: contractAddress,
    abi: contractABI,
    functionName: 'getChildren',
    args: [tokenId],
  }) as bigint[];

  return result;
}

/**
 * Get generation depth for a token
 */
export async function getGeneration(tokenId: bigint): Promise<bigint> {
  const result = await readContract(wagmiConfig, {
    address: contractAddress,
    abi: contractABI,
    functionName: 'getGeneration',
    args: [tokenId],
  }) as bigint;

  return result;
}

/**
 * Check if a token is a derivative of another token
 */
export async function isDerivativeOf(
  tokenId: bigint,
  parentContract: string,
  parentTokenId: bigint
): Promise<boolean> {
  const result = await readContract(wagmiConfig, {
    address: contractAddress,
    abi: contractABI,
    functionName: 'isDerivativeOf',
    args: [tokenId, parentContract, parentTokenId],
  }) as boolean;

  return result;
}

/**
 * Build complete lineage tree for a token (ancestors and descendants)
 */
export async function buildLineageTree(tokenId: bigint): Promise<LineageNode> {
  const derivativeInfo = await getDerivativeInfo(tokenId);
  const children = await getChildren(tokenId);

  const node: LineageNode = {
    tokenId,
    contractAddress: contractAddress,
    creator: derivativeInfo.creator,
    generation: derivativeInfo.generation,
    createdAt: derivativeInfo.createdAt,
    parents: derivativeInfo.parents,
    children,
  };

  return node;
}

/**
 * Get full ancestry chain (all ancestors up to original)
 */
export async function getAncestry(tokenId: bigint): Promise<LineageNode[]> {
  const ancestry: LineageNode[] = [];
  const visited = new Set<string>();

  async function traverse(currentTokenId: bigint) {
    const key = `${contractAddress}-${currentTokenId}`;
    if (visited.has(key)) return;
    visited.add(key);

    const node = await buildLineageTree(currentTokenId);
    ancestry.push(node);

    // Recursively get parents (only same-contract parents for simplicity)
    for (const parent of node.parents) {
      if (parent.contractAddress.toLowerCase() === contractAddress.toLowerCase()) {
        await traverse(parent.tokenId);
      }
    }
  }

  await traverse(tokenId);
  return ancestry.sort((a, b) => Number(a.generation) - Number(b.generation));
}

/**
 * Get all descendants (children, grandchildren, etc.)
 */
export async function getDescendants(tokenId: bigint): Promise<LineageNode[]> {
  const descendants: LineageNode[] = [];
  const visited = new Set<string>();

  async function traverse(currentTokenId: bigint) {
    const key = `${contractAddress}-${currentTokenId}`;
    if (visited.has(key)) return;
    visited.add(key);

    const node = await buildLineageTree(currentTokenId);
    
    // Get children and traverse
    for (const childId of node.children) {
      descendants.push(await buildLineageTree(childId));
      await traverse(childId);
    }
  }

  await traverse(tokenId);
  return descendants.sort((a, b) => Number(a.generation) - Number(b.generation));
}

/**
 * Get comprehensive provenance metadata for display
 */
export async function getProvenanceMetadata(tokenId: bigint): Promise<ProvenanceMetadata> {
  const derivativeInfo = await getDerivativeInfo(tokenId);
  const children = await getChildren(tokenId);
  const descendants = await getDescendants(tokenId);

  return {
    tokenId,
    generation: Number(derivativeInfo.generation),
    creator: derivativeInfo.creator,
    createdAt: new Date(Number(derivativeInfo.createdAt) * 1000),
    parents: derivativeInfo.parents,
    children,
    isOriginal: derivativeInfo.parents.length === 0,
    descendantCount: descendants.length,
  };
}

/**
 * Get relationship type label
 */
export function getRelationshipLabel(relationship: string): string {
  const labels: Record<string, string> = {
    remix: 'Remix',
    derivative: 'Derivative',
    inspired: 'Inspired By',
    composite: 'Composite',
    adaptation: 'Adaptation',
    collaboration: 'Collaboration',
  };
  return labels[relationship.toLowerCase()] || relationship;
}

/**
 * Format generation depth for display
 */
export function formatGeneration(generation: number): string {
  if (generation === 0) return 'Original';
  if (generation === 1) return '1st Generation';
  if (generation === 2) return '2nd Generation';
  if (generation === 3) return '3rd Generation';
  return `${generation}th Generation`;
}
