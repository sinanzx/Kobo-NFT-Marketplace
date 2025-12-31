/**
 * IPFS Service using Pinata
 * 
 * @module ipfsService
 * @description Handles uploading NFT metadata and media files to IPFS via Pinata.
 * Provides progress tracking, gateway URL generation, and metadata formatting.
 * 
 * @example
 * ```typescript
 * import { ipfsService } from './ipfsService';
 * 
 * // Upload image file
 * const result = await ipfsService.uploadFile(imageBlob, 'my-nft.png');
 * console.log('IPFS URL:', result.ipfsUrl);
 * 
 * // Upload metadata
 * const metadata = await ipfsService.uploadMetadata({
 *   name: 'My NFT',
 *   description: 'Cool art',
 *   image: result.ipfsUrl
 * });
 * ```
 */

/**
 * IPFS upload result
 * @interface IPFSUploadResult
 */
export interface IPFSUploadResult {
  ipfsHash: string;
  ipfsUrl: string;
  gatewayUrl: string;
}

/**
 * NFT metadata following OpenSea standard
 * @interface NFTMetadata
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  animation_url?: string;
  external_url?: string;
  properties?: {
    type: 'IMAGE' | 'VIDEO' | 'AUDIO';
    generationMethod: 'AI_GENERATED' | 'MANUAL_UPLOAD' | 'REMIXED';
    creator: string;
    copyrightAuditHash?: string;
  };
}

/**
 * Upload progress tracking
 * @interface UploadProgress
 */
export interface UploadProgress {
  stage: 'uploading_media' | 'uploading_metadata' | 'complete';
  progress: number;
  message: string;
}

class IPFSService {
  private apiKey: string;
  private apiSecret: string;
  private gatewayUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY || '';
    this.apiSecret = import.meta.env.VITE_PINATA_SECRET_KEY || '';
    this.gatewayUrl = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
  }

  /**
   * Check if IPFS service is configured
   * 
   * @returns {boolean} True if Pinata API keys are set
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  /**
   * Upload a file (image, video, audio) to IPFS
   * 
   * @param {File | Blob} file - File or blob to upload
   * @param {string} [fileName] - Optional custom filename
   * @param {Function} [onProgress] - Optional progress callback (0-100)
   * @returns {Promise<IPFSUploadResult>} Upload result with IPFS hash and URLs
   * @throws {Error} If IPFS service is not configured or upload fails
   * 
   * @description
   * Uploads media files to IPFS via Pinata. Supports images, videos, and audio.
   * Returns both IPFS protocol URL and HTTP gateway URL.
   */
  async uploadFile(
    file: File | Blob,
    fileName?: string,
    onProgress?: (progress: number) => void
  ): Promise<IPFSUploadResult> {
    if (!this.isConfigured()) {
      throw new Error('IPFS service not configured. Please set Pinata API keys.');
    }

    const formData = new FormData();
    
    // Determine file name and type
    const name = fileName || (file instanceof File ? file.name : 'nft-asset');
    const fileType = file.type || 'application/octet-stream';
    
    // Create a File object if we have a Blob
    const fileToUpload = file instanceof File 
      ? file 
      : new File([file], name, { type: fileType });
    
    formData.append('file', fileToUpload);

    // Add pinata metadata
    const metadata = JSON.stringify({
      name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileType,
      },
    });
    formData.append('pinataMetadata', metadata);

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.apiSecret,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`IPFS upload failed: ${error.error || response.statusText}`);
      }

      const data = await response.json();
      const ipfsHash = data.IpfsHash;

      if (onProgress) onProgress(100);

      return {
        ipfsHash,
        ipfsUrl: `ipfs://${ipfsHash}`,
        gatewayUrl: `${this.gatewayUrl}/ipfs/${ipfsHash}`,
      };
    } catch (error) {
      console.error('IPFS file upload error:', error);
      throw error;
    }
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadMetadata(metadata: NFTMetadata): Promise<IPFSUploadResult> {
    if (!this.isConfigured()) {
      throw new Error('IPFS service not configured. Please set Pinata API keys.');
    }

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.apiSecret,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `${metadata.name}-metadata`,
            keyvalues: {
              uploadedAt: new Date().toISOString(),
              type: metadata.properties?.type || 'IMAGE',
            },
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Metadata upload failed: ${error.error || response.statusText}`);
      }

      const data = await response.json();
      const ipfsHash = data.IpfsHash;

      return {
        ipfsHash,
        ipfsUrl: `ipfs://${ipfsHash}`,
        gatewayUrl: `${this.gatewayUrl}/ipfs/${ipfsHash}`,
      };
    } catch (error) {
      console.error('IPFS metadata upload error:', error);
      throw error;
    }
  }

  /**
   * Complete NFT upload flow: upload media, then metadata
   * Supports image, video, and audio files
   */
  async uploadNFT(
    file: File | Blob,
    metadata: Omit<NFTMetadata, 'image' | 'animation_url'>,
    fileName?: string,
    onProgress?: (update: UploadProgress) => void
  ): Promise<{ mediaHash: string; metadataHash: string; metadataUrl: string }> {
    try {
      // Step 1: Upload media file
      onProgress?.({
        stage: 'uploading_media',
        progress: 0,
        message: 'Uploading media to IPFS...',
      });

      const mediaResult = await this.uploadFile(file, fileName, (progress) => {
        onProgress?.({
          stage: 'uploading_media',
          progress: progress / 2,
          message: `Uploading media: ${progress}%`,
        });
      });

      // Step 2: Create and upload metadata
      onProgress?.({
        stage: 'uploading_metadata',
        progress: 50,
        message: 'Uploading metadata to IPFS...',
      });

      // Determine if this is video/audio (use animation_url) or image
      const mediaType = metadata.properties?.type || 'IMAGE';
      const fullMetadata: NFTMetadata = {
        ...metadata,
        image: mediaType === 'IMAGE' ? mediaResult.ipfsUrl : '', // Placeholder for video/audio
        animation_url: mediaType !== 'IMAGE' ? mediaResult.ipfsUrl : undefined,
      };
      
      // For video/audio, we should also include a thumbnail as 'image'
      // For now, use a placeholder or the media URL itself
      if (mediaType !== 'IMAGE' && !fullMetadata.image) {
        fullMetadata.image = mediaResult.gatewayUrl; // Use gateway URL as fallback
      }

      const metadataResult = await this.uploadMetadata(fullMetadata);

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Upload complete!',
      });

      return {
        mediaHash: mediaResult.ipfsHash,
        metadataHash: metadataResult.ipfsHash,
        metadataUrl: metadataResult.ipfsUrl,
      };
    } catch (error) {
      console.error('NFT upload error:', error);
      throw error;
    }
  }

  /**
   * Get gateway URL for an IPFS hash
   */
  getGatewayUrl(ipfsHash: string): string {
    // Handle both ipfs:// URLs and raw hashes
    const hash = ipfsHash.replace('ipfs://', '');
    return `${this.gatewayUrl}/ipfs/${hash}`;
  }

  /**
   * Fetch metadata from IPFS
   */
  async fetchMetadata(ipfsUrl: string): Promise<NFTMetadata> {
    const gatewayUrl = this.getGatewayUrl(ipfsUrl);
    
    try {
      const response = await fetch(gatewayUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching IPFS metadata:', error);
      throw error;
    }
  }

  /**
   * Pin existing IPFS hash (useful for ensuring content stays available)
   */
  async pinByHash(ipfsHash: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('IPFS service not configured.');
    }

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.apiSecret,
        },
        body: JSON.stringify({
          hashToPin: ipfsHash,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Pin by hash failed: ${error.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error pinning by hash:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();
