# IPFS Integration Guide

## Overview

Kōbo NFT platform integrates IPFS (InterPlanetary File System) using Pinata for decentralized storage of NFT metadata and media assets. This ensures that NFT content remains permanently accessible and truly decentralized.

## Architecture

### Components

1. **Frontend IPFS Service** (`src/lib/ipfsService.ts`)
   - Handles direct uploads to Pinata from the browser
   - Manages file and metadata uploads
   - Provides gateway URL generation
   - Tracks upload progress

2. **Supabase Edge Function** (`supabase/functions/ipfs-upload/index.ts`)
   - Server-side IPFS uploads for sensitive operations
   - Stores upload records in database
   - Handles authentication and authorization

3. **Smart Contracts**
   - Store IPFS hashes in `tokenURI` field
   - Both `KoboNFT.sol` and `KoboNFTExtended.sol` support IPFS URIs
   - Metadata follows ERC-721 standard with IPFS links

4. **UI Components**
   - `IPFSStatusBadge`: Shows upload status and IPFS availability
   - `IPFSMetadataDisplay`: Displays IPFS hash with gateway link
   - Integrated into minting flow and gallery

## Setup Instructions

### 1. Get Pinata API Keys

1. Sign up at [Pinata Cloud](https://app.pinata.cloud)
2. Navigate to **Developers** → **API Keys**
3. Create a new API key with the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `pinByHash` (optional)
4. Copy your API Key and Secret Key

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your_api_key_here
VITE_PINATA_SECRET_KEY=your_secret_key_here
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

For Supabase Edge Functions, add to Supabase secrets:

```bash
supabase secrets set PINATA_API_KEY=your_api_key_here
supabase secrets set PINATA_SECRET_KEY=your_secret_key_here
```

### 3. Run Database Migration

Apply the IPFS uploads tracking table:

```bash
supabase db push
```

This creates the `ipfs_uploads` table for tracking all IPFS uploads.

### 4. Deploy Edge Function

```bash
supabase functions deploy ipfs-upload
```

## Usage

### Frontend Upload (Direct to Pinata)

```typescript
import { ipfsService } from '@/lib/ipfsService';

// Upload complete NFT (media + metadata)
const result = await ipfsService.uploadNFT(
  imageBlob,
  {
    name: 'My NFT',
    description: 'An awesome NFT',
    attributes: [
      { trait_type: 'Color', value: 'Blue' },
      { trait_type: 'Rarity', value: 'Rare' }
    ],
    properties: {
      type: 'IMAGE',
      generationMethod: 'AI_GENERATED',
      creator: walletAddress,
    }
  },
  (progress) => {
    console.log(`${progress.stage}: ${progress.progress}%`);
  }
);

// Result contains:
// - mediaHash: IPFS hash of the image
// - metadataHash: IPFS hash of the metadata JSON
// - metadataUrl: ipfs://Qm... URL for tokenURI
```

### Backend Upload (via Edge Function)

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/ipfs-upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    file: base64EncodedFile,
    metadata: {
      name: 'My NFT',
      description: 'Description',
      attributes: [...]
    },
    uploadType: 'complete'
  })
});

const { mediaHash, metadataHash, metadataUrl } = await response.json();
```

### Minting with IPFS

```typescript
// 1. Upload to IPFS
const ipfsResult = await ipfsService.uploadNFT(file, metadata);

// 2. Mint NFT with IPFS metadata URL
const tx = await koboNFTContract.mint(
  userAddress,
  ipfsResult.metadataUrl, // ipfs://Qm...
  NFTType.IMAGE,
  GenerationMethod.AI_GENERATED,
  contentHash,
  c2paManifestHash,
  auditHash
);
```

## NFT Metadata Standard

Kōbo follows the ERC-721 metadata standard with IPFS:

```json
{
  "name": "Kōbo NFT #1",
  "description": "AI-generated masterpiece",
  "image": "ipfs://QmYourImageHash",
  "attributes": [
    {
      "trait_type": "Generation Method",
      "value": "AI Generated"
    },
    {
      "trait_type": "Style",
      "value": "Cyberpunk"
    }
  ],
  "properties": {
    "type": "IMAGE",
    "generationMethod": "AI_GENERATED",
    "creator": "0x...",
    "copyrightAuditHash": "0x..."
  }
}
```

## IPFS Gateway URLs

### Accessing Content

- **IPFS Protocol**: `ipfs://QmHash`
- **Pinata Gateway**: `https://gateway.pinata.cloud/ipfs/QmHash`
- **Public Gateways**: `https://ipfs.io/ipfs/QmHash`

### Best Practices

1. **Always use `ipfs://` URLs in smart contracts** for protocol independence
2. **Use gateway URLs for display** in the UI for better performance
3. **Pin important content** to ensure availability
4. **Verify content hashes** before minting

## UI Components

### IPFS Status Badge

Shows the IPFS upload status on NFT cards:

```tsx
<IPFSStatusBadge 
  ipfsHash="QmYourHash"
  status="uploaded" // 'uploaded' | 'uploading' | 'error' | 'not_uploaded'
  showGatewayLink={true}
/>
```

### IPFS Metadata Display

Displays full IPFS hash with gateway link:

```tsx
<IPFSMetadataDisplay 
  ipfsHash="QmYourHash"
  metadataUrl="ipfs://QmYourHash"
/>
```

## Monitoring & Troubleshooting

### Check Upload Status

Query the `ipfs_uploads` table:

```sql
SELECT * FROM ipfs_uploads 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### Common Issues

1. **Upload fails with "API keys not configured"**
   - Verify environment variables are set correctly
   - Check that keys have proper permissions in Pinata dashboard

2. **Gateway URLs not loading**
   - IPFS content may take a few seconds to propagate
   - Try alternative gateways: `ipfs.io`, `cloudflare-ipfs.com`
   - Ensure content is pinned in Pinata

3. **Metadata not updating in wallet/marketplace**
   - Some platforms cache metadata
   - Use ERC-4906 `MetadataUpdate` event to signal changes
   - Wait for platform to refresh (can take hours)

## Security Considerations

1. **API Key Protection**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys periodically

2. **Content Validation**
   - Validate file types and sizes before upload
   - Scan for malicious content
   - Verify copyright compliance

3. **Rate Limiting**
   - Pinata free tier has rate limits
   - Implement client-side throttling
   - Consider upgrading for production

## Cost Optimization

1. **Pinata Pricing**
   - Free tier: 1GB storage, 100GB bandwidth/month
   - Paid plans start at $20/month for more storage
   - Pin only essential content

2. **Storage Best Practices**
   - Compress images before upload
   - Use appropriate image formats (WebP, AVIF)
   - Avoid uploading duplicate content
   - Clean up unused pins periodically

## Future Enhancements

- [ ] Support for multiple IPFS providers (Web3.Storage, NFT.Storage)
- [ ] Automatic content pinning service
- [ ] IPFS cluster for redundancy
- [ ] Content addressing verification
- [ ] Metadata versioning with IPFS
- [ ] Integration with Arweave for permanent storage

## Resources

- [Pinata Documentation](https://docs.pinata.cloud)
- [IPFS Documentation](https://docs.ipfs.tech)
- [ERC-721 Metadata Standard](https://eips.ethereum.org/EIPS/eip-721)
- [NFT Metadata Best Practices](https://docs.opensea.io/docs/metadata-standards)
