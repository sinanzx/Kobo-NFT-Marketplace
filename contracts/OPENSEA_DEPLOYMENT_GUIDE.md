# OpenSea Integration & Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the KoboNFT contracts with OpenSea integration and verifying them on OpenSea testnet.

## What Was Added

### 1. OpenSea Collection Metadata Support
Both `KoboNFT.sol` and `KoboNFTExtended.sol` now include:
- `contractURI()` function that returns collection-level metadata URL
- `setContractURI()` function for updating the collection metadata URL (owner only)
- Comprehensive test coverage for contractURI functionality

### 2. Collection Metadata JSON Files
Created OpenSea-compliant metadata files:
- `contracts/collection-metadata/kobo-nft-collection.json` - For KoboNFT contract
- `contracts/collection-metadata/kobo-nft-extended-collection.json` - For KoboNFTExtended contract

Each file includes:
```json
{
  "name": "Collection Name",
  "description": "Collection Description",
  "image": "https://ipfs.io/ipfs/QmYourImageHash",
  "external_link": "https://yourwebsite.com",
  "seller_fee_basis_points": 500,
  "fee_recipient": "0xYourWalletAddress"
}
```

## Deployment Steps

### Step 1: Upload Collection Metadata to IPFS

You need to host your collection metadata JSON files on IPFS or a public URL.

**Option A: Using Pinata (Recommended)**
1. Go to [Pinata](https://pinata.cloud/) and create a free account
2. Upload your collection image first:
   - Click "Upload" → "File"
   - Upload your collection banner/logo image
   - Copy the IPFS hash (e.g., `QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
3. Update the JSON file with the image IPFS hash:
   ```json
   "image": "ipfs://QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```
4. Upload the updated JSON file to Pinata
5. Copy the JSON IPFS hash

**Option B: Using NFT.Storage**
1. Go to [NFT.Storage](https://nft.storage/) and create a free account
2. Follow similar steps as Pinata

**Option C: Using a Public URL**
- Host the JSON file on your own server
- Ensure it's publicly accessible via HTTPS

### Step 2: Update Contract with Collection Metadata URI

Before deployment, update the default contractURI in your contracts:

**For KoboNFT.sol** (line 51):
```solidity
_contractURI = "ipfs://QmYourActualIPFSHash";
```

**For KoboNFTExtended.sol** (line 111):
```solidity
_contractURI = "ipfs://QmYourActualIPFSHash";
```

Alternatively, you can set it after deployment using the `setContractURI()` function.

### Step 3: Deploy to Devnet

The contracts are configured to deploy to devnet (chainId 20258) which uses Ethereum mainnet addresses for compatibility.

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $DEVNET_RPC_URL --broadcast
```

The deployment script will:
1. Deploy the TemporaryDeployFactory contract
2. Extract deployed contract addresses from events
3. Display all deployed contract addresses

**Expected Output:**
```
Deployment successful!
Deployer: 0xYourAddress
Contracts deployed: 1
Contract: KoboNFTExtended
Address: 0xDeployedContractAddress
```

### Step 4: Update Collection Metadata After Deployment (Optional)

If you need to update the collection metadata URI after deployment:

```solidity
// Using cast (Foundry CLI)
cast send 0xYourContractAddress \
  "setContractURI(string)" \
  "ipfs://QmNewIPFSHash" \
  --rpc-url $DEVNET_RPC_URL \
  --private-key $PRIVATE_KEY
```

Or using a script:
```javascript
// Using ethers.js
const contract = new ethers.Contract(contractAddress, abi, signer);
await contract.setContractURI("ipfs://QmNewIPFSHash");
```

### Step 5: Verify Contract on OpenSea Testnet

**For Ethereum Sepolia (if deploying there):**
1. Go to [OpenSea Testnet](https://testnets.opensea.io/)
2. Connect your wallet
3. Navigate to your profile
4. Click "Import an existing smart contract"
5. Enter your contract address
6. OpenSea will automatically fetch the `contractURI()` and display your collection metadata

**For Devnet:**
Since devnet is a custom network, you'll need to:
1. Ensure your collection metadata is publicly accessible
2. Test the `contractURI()` function returns the correct URL:
   ```bash
   cast call 0xYourContractAddress "contractURI()" --rpc-url $DEVNET_RPC_URL
   ```
3. Verify the metadata JSON is accessible at the returned URL

### Step 6: Mint Test NFTs

Mint some test NFTs to verify everything works:

**For KoboNFT:**
```solidity
cast send 0xYourContractAddress \
  "mint(address,string,uint8,uint8,bytes32)" \
  0xRecipientAddress \
  "ipfs://QmTokenMetadataHash" \
  0 \
  0 \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  --rpc-url $DEVNET_RPC_URL \
  --private-key $PRIVATE_KEY
```

**For KoboNFTExtended:**
```solidity
cast send 0xYourContractAddress \
  "mint(address,string,uint8,uint8,bytes32,bytes32,bytes32)" \
  0xRecipientAddress \
  "ipfs://QmTokenMetadataHash" \
  0 \
  0 \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890 \
  0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234 \
  --rpc-url $DEVNET_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Verification Checklist

- [ ] Collection metadata JSON uploaded to IPFS/public URL
- [ ] Collection image uploaded and referenced in JSON
- [ ] Contract deployed successfully
- [ ] `contractURI()` returns correct metadata URL
- [ ] Metadata JSON is publicly accessible
- [ ] Test NFTs minted successfully
- [ ] Collection visible on OpenSea testnet (if applicable)
- [ ] Royalty information displays correctly (5% default)

## OpenSea Metadata Standards

### Collection-Level Metadata (contractURI)
```json
{
  "name": "Collection Name",
  "description": "Detailed collection description",
  "image": "ipfs://QmImageHash or https://...",
  "external_link": "https://yourwebsite.com",
  "seller_fee_basis_points": 500,  // 5% royalty
  "fee_recipient": "0xWalletAddress"
}
```

### Token-Level Metadata (tokenURI)
```json
{
  "name": "NFT Name",
  "description": "NFT Description",
  "image": "ipfs://QmTokenImageHash",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Image"
    },
    {
      "trait_type": "Generation Method",
      "value": "AI Generated"
    }
  ]
}
```

## Troubleshooting

### Issue: contractURI() returns empty string
**Solution:** Call `setContractURI()` with your IPFS hash or public URL

### Issue: OpenSea doesn't display collection metadata
**Solution:** 
1. Verify the metadata URL is publicly accessible
2. Check JSON format is valid (use JSONLint)
3. Wait a few minutes for OpenSea to cache the metadata
4. Try refreshing metadata on OpenSea

### Issue: Royalties not showing on OpenSea
**Solution:**
1. Verify `seller_fee_basis_points` is set in collection metadata
2. Ensure `fee_recipient` address is valid
3. Check contract implements ERC2981 (both contracts do)

### Issue: Images not loading
**Solution:**
1. Verify IPFS hashes are correct
2. Try using `ipfs://` protocol instead of `https://ipfs.io/ipfs/`
3. Ensure images are pinned on IPFS

## Contract Addresses

After deployment, record your contract addresses here:

- **KoboNFT (Devnet):** `0x...`
- **KoboNFTExtended (Devnet):** `0x...`
- **Deployment Transaction:** `0x...`

## Additional Resources

- [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [ERC-2981 Royalty Standard](https://eips.ethereum.org/EIPS/eip-2981)
- [Pinata IPFS Documentation](https://docs.pinata.cloud/)
- [NFT.Storage Documentation](https://nft.storage/docs/)

## Support

For issues or questions:
1. Check the test files for usage examples
2. Review the contract source code comments
3. Consult OpenSea documentation
4. Verify all prerequisites are met

## Next Steps

After successful deployment and verification:
1. Build a dApp frontend to interact with your contracts
2. Implement minting functionality in your UI
3. Add collection management features
4. Set up royalty distribution if using collaborative minting
5. Monitor contract activity and gas usage
