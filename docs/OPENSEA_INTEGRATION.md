# OpenSea Integration Guide

This guide explains how the KoboNFT collection is integrated with OpenSea testnet and how to use the OpenSea features in the dApp.

## Overview

The KoboNFT collection has been fully integrated with OpenSea testnet, allowing users to:
- View the entire collection on OpenSea
- View individual NFTs on OpenSea
- Access OpenSea marketplace features directly from the dApp
- Verify collection metadata and storefront information

## Smart Contract Integration

### contractURI() Function

Both `KoboNFT` and `KoboNFTExtended` contracts implement the `contractURI()` function that returns collection-level metadata for OpenSea:

```solidity
function contractURI() public view returns (string memory) {
    return _contractURI;
}

function setContractURI(string memory newContractURI) external onlyOwner {
    _contractURI = newContractURI;
}
```

### Collection Metadata

The collection metadata is stored in JSON format and includes:

```json
{
  "name": "Kobo NFT Collection",
  "description": "AI-generated and collaborative NFT artwork with copyright proofing and dynamic traits",
  "image": "https://your-domain.com/collection-banner.png",
  "external_link": "https://your-domain.com",
  "seller_fee_basis_points": 500,
  "fee_recipient": "0xYourRoyaltyAddress"
}
```

**Key Fields:**
- `name`: Collection name displayed on OpenSea
- `description`: Collection description
- `image`: Collection banner/logo (recommended: 1400x400px)
- `external_link`: Link to your project website
- `seller_fee_basis_points`: Royalty percentage (500 = 5%)
- `fee_recipient`: Address that receives royalties

## Deployment Steps

### 1. Upload Collection Metadata to IPFS

Use a service like Pinata or NFT.Storage to upload your collection metadata JSON:

```bash
# Example using Pinata
curl -X POST "https://api.pinata.cloud/pinning/pinJSONToIPFS" \
  -H "Authorization: Bearer YOUR_PINATA_JWT" \
  -H "Content-Type: application/json" \
  -d @contracts/collection-metadata/kobo-nft-collection.json
```

You'll receive an IPFS hash like: `QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx`

### 2. Update Contract with IPFS URI

Update the `contractURI` in your deployed contract:

```solidity
// Call setContractURI with your IPFS hash
setContractURI("ipfs://QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx");
```

Or use the deployment script:

```bash
cd contracts
forge script script/UpdateContractURI.s.sol:UpdateContractURI \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### 3. Deploy to Testnet

Deploy your contracts to the desired testnet (Base Sepolia recommended):

```bash
cd contracts
VITE_CHAIN=sepolia pnpm run deploy
```

### 4. Verify Contract on Block Explorer

Verify your contract on the block explorer (e.g., Basescan for Base):

```bash
forge verify-contract \
  --chain-id 84532 \
  --compiler-version v0.8.20 \
  YOUR_CONTRACT_ADDRESS \
  src/KoboNFT.sol:KoboNFT \
  --etherscan-api-key YOUR_API_KEY
```

### 5. Register on OpenSea

1. Visit OpenSea Testnet: https://testnets.opensea.io
2. Connect your wallet (same address as contract owner)
3. Navigate to your collection: `https://testnets.opensea.io/assets/base-sepolia/YOUR_CONTRACT_ADDRESS`
4. OpenSea will automatically detect and display your collection metadata
5. Configure additional storefront settings in OpenSea's collection manager

## Frontend Integration

### OpenSea Badge Component

The dApp includes a reusable `OpenSeaBadge` component with three variants:

#### Badge Variant
Small badge with OpenSea logo, perfect for NFT cards:

```tsx
<OpenSeaBadge
  contractAddress={contractAddress}
  tokenId="123"
  chainId={84532}
  variant="badge"
  size="sm"
/>
```

#### Button Variant
Full button with "View on OpenSea" text:

```tsx
<OpenSeaBadge
  contractAddress={contractAddress}
  tokenId="123"
  chainId={84532}
  variant="button"
  size="lg"
  className="w-full"
/>
```

#### Link Variant
Text link with icon:

```tsx
<OpenSeaBadge
  contractAddress={contractAddress}
  tokenId="123"
  chainId={84532}
  variant="link"
  size="md"
/>
```

### Collection Link Component

Link to the entire collection on OpenSea:

```tsx
<OpenSeaCollectionLink
  contractAddress={contractAddress}
  chainId={84532}
/>
```

### Supported Networks

The OpenSea integration supports the following networks:

**Mainnets:**
- Ethereum (chainId: 1)
- Polygon (chainId: 137)
- Arbitrum (chainId: 42161)
- Optimism (chainId: 10)
- Base (chainId: 8453)

**Testnets:**
- Sepolia (chainId: 11155111)
- Mumbai (chainId: 80001)
- Arbitrum Goerli (chainId: 421613)
- Optimism Goerli (chainId: 420)
- Base Goerli (chainId: 84531)
- Base Sepolia (chainId: 84532) ⭐ Recommended

## Usage in the dApp

### NFT Gallery Page

The gallery page displays:
- **Collection Link**: Header button to view entire collection on OpenSea
- **NFT Badges**: Small OpenSea badge on each NFT card (top-right corner)
- **Detail Modal**: Full "View on OpenSea" button in NFT detail modal

### Battle Pages

Battle cards show:
- **Participant NFTs**: OpenSea badges for NFTs participating in battles
- **Quick Access**: Click badges to view specific battle NFTs on OpenSea

### Configuration

The OpenSea integration automatically uses the correct network based on your build configuration:

```bash
# Build for Base Sepolia testnet (default)
VITE_CHAIN=sepolia pnpm run build

# Build for mainnet
VITE_CHAIN=mainnet pnpm run build
```

The `evmConfig.ts` file automatically provides:
- `contractAddress`: Current contract address
- `chainId`: Current chain ID
- Network detection for OpenSea URLs

## Testing

### Test OpenSea Integration

1. **Deploy to testnet** (Base Sepolia recommended)
2. **Mint test NFTs** using the dApp or contract directly
3. **Visit OpenSea testnet** and search for your contract address
4. **Verify metadata** appears correctly
5. **Test frontend links** by clicking OpenSea badges in the dApp

### Common Issues

**Collection not appearing on OpenSea:**
- Ensure contract is verified on block explorer
- Check that `contractURI()` returns valid IPFS URL
- Verify metadata JSON is accessible via IPFS gateway
- Wait 5-10 minutes for OpenSea to index the contract

**NFT images not loading:**
- Verify `tokenURI()` returns valid metadata
- Check that image URLs in metadata are accessible
- Ensure IPFS gateway is working (try https://ipfs.io/ipfs/YOUR_HASH)

**Royalties not working:**
- Verify `seller_fee_basis_points` is set correctly (500 = 5%)
- Ensure `fee_recipient` address is correct
- Check that contract implements ERC-2981 royalty standard

## Best Practices

### Metadata Hosting

1. **Use IPFS for permanence**: Upload to Pinata, NFT.Storage, or similar
2. **Pin your content**: Ensure metadata and images remain accessible
3. **Use IPFS gateways**: Provide fallback gateways for reliability
4. **Test accessibility**: Verify metadata loads from multiple gateways

### Collection Setup

1. **High-quality banner**: Use 1400x400px image for collection banner
2. **Clear description**: Write compelling collection description
3. **Set royalties**: Configure appropriate royalty percentage
4. **External link**: Link to your project website or documentation
5. **Social links**: Add Twitter, Discord, etc. in OpenSea collection settings

### Security

1. **Verify contracts**: Always verify on block explorer before OpenSea registration
2. **Test on testnet**: Fully test on testnet before mainnet deployment
3. **Secure metadata**: Use IPFS for immutable metadata storage
4. **Owner controls**: Only contract owner can update `contractURI`

## Resources

- **OpenSea Testnet**: https://testnets.opensea.io
- **OpenSea Docs**: https://docs.opensea.io/docs
- **Metadata Standards**: https://docs.opensea.io/docs/metadata-standards
- **Contract Deployment Guide**: See `contracts/OPENSEA_DEPLOYMENT_GUIDE.md`
- **IPFS Pinata**: https://www.pinata.cloud
- **IPFS NFT.Storage**: https://nft.storage

## Support

For issues or questions:
1. Check the contract deployment guide: `contracts/OPENSEA_DEPLOYMENT_GUIDE.md`
2. Review OpenSea documentation: https://docs.opensea.io
3. Test on Base Sepolia testnet first
4. Verify contract on block explorer before troubleshooting OpenSea issues
