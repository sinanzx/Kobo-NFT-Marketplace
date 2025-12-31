# Kobo NFT Collection Metadata

This directory contains OpenSea-compatible collection-level metadata for the Kobo NFT contracts.

## Files

### kobo-nft-collection.json
Collection metadata for the standard KoboNFT contract.

### kobo-nft-extended-collection.json
Collection metadata for the KoboNFTExtended contract with advanced features.

## OpenSea Metadata Standard

Both JSON files follow the OpenSea collection metadata standard:

```json
{
  "name": "Collection Name",
  "description": "Collection description",
  "image": "Collection banner/logo URL",
  "external_link": "Project website URL",
  "seller_fee_basis_points": 500,  // 5% royalty
  "fee_recipient": "Royalty recipient address"
}
```

## Deployment Instructions

### 1. Upload Collection Metadata to IPFS

You can use any IPFS service (Pinata, NFT.Storage, etc.):

```bash
# Example using IPFS CLI
ipfs add kobo-nft-collection.json
# Returns: QmYourCollectionMetadataHash

ipfs add kobo-nft-extended-collection.json
# Returns: QmYourExtendedCollectionMetadataHash
```

### 2. Update Contract URIs

After uploading to IPFS, update the contract URIs:

**For KoboNFT:**
```solidity
// Call setContractURI as contract owner
setContractURI("https://ipfs.io/ipfs/QmYourCollectionMetadataHash")
```

**For KoboNFTExtended:**
```solidity
// Call setContractURI as contract owner
setContractURI("https://ipfs.io/ipfs/QmYourExtendedCollectionMetadataHash")
```

### 3. Update fee_recipient Address

Before uploading to IPFS, replace the placeholder address in both JSON files:

```json
"fee_recipient": "0xYourActualRoyaltyRecipientAddress"
```

This should match the address that receives royalties (typically the contract owner or a multi-sig wallet).

### 4. Upload Collection Banner Image

Create and upload a collection banner image (recommended size: 1400x400px):

```bash
ipfs add collection-banner.png
# Returns: QmYourCollectionBannerImageHash
```

Update the `image` field in the JSON files:
```json
"image": "https://ipfs.io/ipfs/QmYourCollectionBannerImageHash"
```

## OpenSea Verification

After deployment and setting the contract URI:

1. **Testnet (Sepolia):**
   - Visit: https://testnets.opensea.io/assets/sepolia/YOUR_CONTRACT_ADDRESS
   - OpenSea will automatically read the `contractURI()` function
   - Collection metadata will appear on the collection page

2. **Mainnet:**
   - Visit: https://opensea.io/assets/ethereum/YOUR_CONTRACT_ADDRESS
   - Collection metadata will be displayed automatically

## Metadata Fields Explained

- **name**: Collection name displayed on OpenSea
- **description**: Collection description (supports markdown)
- **image**: Collection banner/logo (displayed at top of collection page)
- **external_link**: Link to your project website
- **seller_fee_basis_points**: Royalty percentage in basis points (500 = 5%, 1000 = 10%)
- **fee_recipient**: Address that receives royalty payments

## Updating Metadata

To update collection metadata after deployment:

1. Upload new JSON file to IPFS
2. Call `setContractURI()` with new IPFS hash
3. OpenSea will refresh metadata automatically (may take a few minutes)

## Notes

- The `contractURI()` function is a standard that OpenSea and other marketplaces recognize
- Royalties are enforced by marketplaces that support ERC-2981 (OpenSea, LooksRare, etc.)
- The contract owner can update the contract URI at any time using `setContractURI()`
- Both contracts have a default 5% royalty (500 basis points) set in the constructor
