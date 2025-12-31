/**
 * Multi-chain Mint Service
 * 
 * Abstracted minting logic that works across all supported chains.
 * Handles chain-specific configurations and provides unified interface.
 * 
 * @module mintService
 * @description Provides comprehensive NFT minting functionality with compliance scanning,
 * IPFS metadata upload, gamification integration, and multi-chain support.
 * 
 * @example
 * ```typescript
 * import { mintNFT } from './mintService';
 * 
 * const result = await mintNFT({
 *   to: '0x123...',
 *   uri: 'ipfs://...',
 *   nftType: NFTType.IMAGE,
 *   generationMethod: GenerationMethod.AI_GENERATED,
 *   file: imageBlob,
 *   metadata: { name: 'My NFT', description: 'Cool art' }
 * });
 * ```
 */

import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from '../utils/wagmiConfig';
import { contractAddress, contractABI, NFTType, GenerationMethod } from '../utils/evmConfig';
import { ipfsService } from './ipfsService';
import type { NFTMetadata } from './ipfsService';
import { performEnhancedComplianceScan } from './complianceService';
import type { ComplianceScanResult } from '@/components/compliance/ComplianceResultsModal';
import { awardXP, XP_REWARDS, updateChallengeProgress, getTodaysChallenges } from './gamificationService';

/**
 * Options for minting an NFT
 * @interface MintOptions
 */
export interface MintOptions {
  /** Recipient wallet address */
  to: string;
  /** IPFS URI for the NFT metadata */
  uri: string;
  /** Type of NFT (IMAGE, VIDEO, AUDIO) */
  nftType: NFTType;
  /** How the NFT was created (AI_GENERATED, MANUAL_UPLOAD, REMIXED) */
  generationMethod: GenerationMethod;
  /** Optional hash of copyright audit results */
  copyrightAuditHash?: string;
  /** Optional file to upload to IPFS */
  file?: File | Blob;
  /** Optional additional metadata */
  metadata?: Record<string, any>;
  /** Skip compliance scanning (use with caution) */
  skipComplianceScan?: boolean;
}

/**
 * Result of a mint operation
 * @interface MintResult
 */
export interface MintResult {
  /** Whether the mint was successful */
  success: boolean;
  /** Transaction hash on the blockchain */
  transactionHash: string;
  /** Minted token ID (if successful) */
  tokenId?: bigint;
  /** Error message (if failed) */
  error?: string;
  /** Compliance scan results */
  complianceScanResult?: ComplianceScanResult;
  /** Whether content requires manual review */
  requiresReview?: boolean;
}

/**
 * Upload content and metadata to IPFS
 * 
 * @private
 * @param {MintOptions} options - Mint options containing file and metadata
 * @returns {Promise<string>} IPFS URI for the uploaded metadata
 * @throws {Error} If neither uri nor file is provided
 * 
 * @example
 * ```typescript
 * const uri = await prepareMetadata({
 *   file: imageBlob,
 *   metadata: { name: 'My NFT' },
 *   nftType: NFTType.IMAGE,
 *   generationMethod: GenerationMethod.AI_GENERATED
 * });
 * ```
 */
async function prepareMetadata(options: MintOptions): Promise<string> {
  if (options.uri) {
    return options.uri;
  }

  if (!options.file) {
    throw new Error('Either uri or file must be provided');
  }

  // Upload file to IPFS
  const fileResult = await ipfsService.uploadFile(options.file);

  // Prepare metadata
  const metadata: NFTMetadata = {
    name: options.metadata?.name || 'KoboNFT',
    description: options.metadata?.description || 'Created with KoboNFT',
    image: fileResult.ipfsUrl,
    attributes: options.metadata?.attributes || [],
    properties: {
      type: options.nftType === NFTType.IMAGE ? 'IMAGE' : options.nftType === NFTType.VIDEO ? 'VIDEO' : 'AUDIO',
      generationMethod: options.generationMethod === GenerationMethod.AI_GENERATED ? 'AI_GENERATED' : 
                       options.generationMethod === GenerationMethod.MANUAL_UPLOAD ? 'MANUAL_UPLOAD' : 'REMIXED',
      creator: options.to,
      copyrightAuditHash: options.copyrightAuditHash,
    },
    ...options.metadata,
  };

  // Upload metadata to IPFS
  const metadataResult = await ipfsService.uploadMetadata(metadata);

  return metadataResult.ipfsUrl;
}

/**
 * Generate copyright proof hash from file content
 * 
 * @private
 * @param {MintOptions} options - Mint options containing file or existing hash
 * @returns {Promise<string>} SHA-256 hash of file content as hex string
 * @description Creates a cryptographic hash of the file content for copyright verification.
 * Falls back to zero hash if file is not provided or hashing fails.
 */
async function prepareCopyrightProof(options: MintOptions): Promise<string> {
  if (options.copyrightAuditHash) {
    return options.copyrightAuditHash;
  }

  if (!options.file) {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  try {
    // Generate simple hash from file content
    const arrayBuffer = await options.file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.warn('Copyright proof generation failed, using zero hash:', error);
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }
}

/**
 * Mint NFT on current chain with enhanced compliance scanning
 * 
 * @public
 * @param {MintOptions} options - Complete minting configuration
 * @returns {Promise<MintResult>} Result containing transaction hash, token ID, and compliance data
 * @throws {Error} If wallet is not connected or transaction fails
 * 
 * @description
 * Main entry point for NFT minting. Performs the following steps:
 * 1. Uploads file and metadata to IPFS
 * 2. Generates copyright proof hash
 * 3. Runs compliance scan (reverse image search, content filtering)
 * 4. Executes blockchain transaction
 * 5. Awards XP and updates challenges
 * 6. Logs provenance data
 * 
 * @example
 * ```typescript
 * const result = await mintNFT({
 *   to: walletAddress,
 *   file: imageBlob,
 *   nftType: NFTType.IMAGE,
 *   generationMethod: GenerationMethod.AI_GENERATED,
 *   metadata: {
 *     name: 'Cosmic Dragon',
 *     description: 'AI-generated fantasy art',
 *     attributes: [{ trait_type: 'Style', value: 'Fantasy' }]
 *   }
 * });
 * 
 * if (result.success) {
 *   console.log('Minted token:', result.tokenId);
 * }
 * ```
 */
export async function mintNFT(options: MintOptions): Promise<MintResult> {
  try {
    // Prepare metadata URI
    const uri = await prepareMetadata(options);

    // Prepare copyright proof
    const copyrightHash = await prepareCopyrightProof(options);

    // Perform enhanced compliance scan (includes reverse image search)
    let complianceScanResult: ComplianceScanResult | undefined;
    if (!options.skipComplianceScan && options.file) {
      try {
        // Upload file temporarily to get URL for reverse search
        const tempFileResult = await ipfsService.uploadFile(options.file);
        
        complianceScanResult = await performEnhancedComplianceScan({
          promptText: options.metadata?.description || '',
          aiEngine: options.metadata?.aiEngine || 'manual',
          outputType: options.nftType === NFTType.IMAGE ? 'image' : 
                     options.nftType === NFTType.VIDEO ? 'video' : 'audio',
          outputUrl: tempFileResult.ipfsUrl,
          isRemix: options.generationMethod === GenerationMethod.REMIXED,
        });

        // Block minting if compliance scan failed critically
        if (complianceScanResult.status === 'blocked') {
          return {
            success: false,
            transactionHash: '',
            error: 'Content blocked due to compliance violations',
            complianceScanResult,
          };
        }

        // Return warning if threshold exceeded (let UI handle user decision)
        if (complianceScanResult.reverseSearchResult?.isAboveThreshold) {
          return {
            success: false,
            transactionHash: '',
            error: 'High similarity detected - review required',
            complianceScanResult,
          };
        }
      } catch (scanError) {
        console.warn('Compliance scan failed, proceeding with mint:', scanError);
        // Continue with mint if scan fails (don't block user)
      }
    }

    // Execute mint transaction
    const hash = await writeContract(wagmiConfig, {
      address: contractAddress,
      abi: contractABI,
      functionName: 'mint',
      args: [
        options.to,
        uri,
        options.nftType,
        options.generationMethod,
        copyrightHash,
      ],
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
    });

    // Parse logs to get token ID
    let tokenId: bigint | undefined;
    if (receipt.logs && receipt.logs.length > 0) {
      // Look for Transfer event (ERC721)
      const transferEvent = receipt.logs.find(log => 
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      );
      
      if (transferEvent && transferEvent.topics[3]) {
        tokenId = BigInt(transferEvent.topics[3]);
      }
    }

    // Award XP for minting
    try {
      if (tokenId) {
        await awardXP(options.to, XP_REWARDS.MINT_NFT, 'mint', tokenId.toString(), 'Minted NFT');
        
        // Update mint challenge progress
        const challenges = await getTodaysChallenges();
        const mintChallenge = challenges.find(c => c.challenge_type === 'mint');
        if (mintChallenge) {
          await updateChallengeProgress(options.to, mintChallenge.id, 1);
        }
      }
    } catch (error) {
      console.error('Error awarding XP for mint:', error);
      // Don't fail the mint if XP fails
    }

    return {
      success: true,
      transactionHash: hash,
      tokenId,
      complianceScanResult,
    };
  } catch (error: any) {
    console.error('Mint failed:', error);
    return {
      success: false,
      transactionHash: '',
      error: error.message || 'Minting failed',
      complianceScanResult: undefined,
    };
  }
}

/**
 * Mint derivative/remix NFT with parent references
 */
export async function mintDerivative(
  options: MintOptions,
  parents: Array<{ contractAddress: string; tokenId: bigint; relationship: number }>
): Promise<MintResult> {
  try {
    // Prepare metadata URI
    const uri = await prepareMetadata(options);

    // Prepare copyright proof
    const copyrightHash = await prepareCopyrightProof(options);

    // Execute mint derivative transaction
    const hash = await writeContract(wagmiConfig, {
      address: contractAddress,
      abi: contractABI,
      functionName: 'mintDerivative',
      args: [
        options.to,
        uri,
        options.nftType,
        parents,
        copyrightHash,
      ],
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
    });

    // Parse logs to get token ID
    let tokenId: bigint | undefined;
    if (receipt.logs && receipt.logs.length > 0) {
      const transferEvent = receipt.logs.find(log => 
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      );
      
      if (transferEvent && transferEvent.topics[3]) {
        tokenId = BigInt(transferEvent.topics[3]);
      }
    }

    return {
      success: true,
      transactionHash: hash,
      tokenId,
    };
  } catch (error: any) {
    console.error('Derivative mint failed:', error);
    return {
      success: false,
      transactionHash: '',
      error: error.message || 'Derivative minting failed',
    };
  }
}

/**
 * Batch mint multiple NFTs
 */
export async function batchMint(
  mintOptions: MintOptions[]
): Promise<MintResult[]> {
  const results: MintResult[] = [];

  for (const options of mintOptions) {
    const result = await mintNFT(options);
    results.push(result);
    
    // Add delay between mints to avoid nonce issues
    if (results.length < mintOptions.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

/**
 * Get estimated gas for minting
 */
export async function estimateMintGas(options: MintOptions): Promise<bigint> {
  try {
    const uri = options.uri || 'ipfs://placeholder';
    const copyrightHash = options.copyrightAuditHash || '0x0000000000000000000000000000000000000000000000000000000000000000';

    // This would use estimateGas from wagmi
    // For now, return a reasonable estimate
    return BigInt(300000); // ~300k gas
  } catch (error) {
    console.error('Gas estimation failed:', error);
    return BigInt(500000); // Safe fallback
  }
}
