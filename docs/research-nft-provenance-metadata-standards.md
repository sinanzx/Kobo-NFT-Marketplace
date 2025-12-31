# Research Report: NFT Provenance Metadata Standards

## Overview
This report examines NFT metadata standards with a focus on provenance tracking, including ERC-721 extensions, on-chain vs off-chain storage options, and best practices for ensuring metadata permanence and authenticity.

## Key Findings

### Base Standards

#### ERC-721 (Non-Fungible Token Standard)
- **Purpose**: Foundational NFT standard on Ethereum
- **Core Functions**: `ownerOf`, `transferFrom`, `approve`, `safeTransferFrom`
- **Metadata Interface**: Optional `ERC721Metadata` with `tokenURI`, `name`, `symbol`
- **Limitation**: No built-in metadata immutability or provenance protection beyond blockchain history
- **Specification**: [ERC-721](https://ercs.ethereum.org/ERCS/erc-721)

#### ERC-1155 (Multi-Token Standard)
- **Purpose**: Supports both fungible and non-fungible tokens in single contract
- **Metadata**: Similar URI-based approach to ERC-721
- **Advantage**: Gas-efficient for collections with shared metadata

### Provenance-Focused Extensions

#### ERC-4906: Metadata Update Extension
- **Status**: Final
- **Purpose**: Enable efficient metadata update notifications
- **Key Features**:
  - `MetadataUpdate(uint256 tokenId)` event
  - `BatchMetadataUpdate(uint256 fromTokenId, uint256 toTokenId)` event
  - Backward-compatible with ERC-721
  - Enables marketplaces to auto-refresh displays
- **Use Cases**: Dynamic NFTs, evolving art, game items, identity tokens
- **Specification**: [EIP-4906](https://eips.ethereum.org/EIPS/eip-4906)

**Implementation Example**:
```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC4906.sol";

contract DynamicNFT is ERC721, IERC4906 {
    mapping(uint256 => string) private _tokenURIs;

    event MetadataUpdate(uint256 indexed tokenId);
    event BatchMetadataUpdate(uint256 fromTokenId, uint256 toTokenId);

    function setTokenURI(uint256 tokenId, string memory newURI) public {
        // Add access control
        _tokenURIs[tokenId] = newURI;
        emit MetadataUpdate(tokenId);
    }

    function batchUpdateURIs(uint256 fromTokenId, uint256 toTokenId, string[] memory uris) public {
        for(uint256 i = fromTokenId; i <= toTokenId; ++i) {
            _tokenURIs[i] = uris[i - fromTokenId];
        }
        emit BatchMetadataUpdate(fromTokenId, toTokenId);
    }
}
```

#### ERC-7160: Multi-Metadata Extension
- **Status**: Final
- **Purpose**: Support multiple metadata URIs per token
- **Key Features**:
  - Dynamic array of URIs per token
  - Pinning mechanism to select active URI
  - `TokenUriPinned` and `TokenUriUnpinned` events
  - Backward-compatible with `tokenURI()`
- **Use Cases**:
  - Evolving artworks with version history
  - Multiple aspect ratios/formats
  - Collaborative content with different views
  - Process documentation (sketches → final)
- **Specification**: [ERC-7160](https://ercs.ethereum.org/ERCS/erc-7160)

**Real-World Implementations**:
- **MakersPlace**: Botto, Invisible Alchemy, SE•E•DS by Patric Ortmann
- **Transient Labs**: The Everlasting Glitchstopper (50-year evolving artwork)
- **Use Cases**: Seeds evolving through sprout to bloom stages

#### ERC-5185: Updatable Metadata via Transformation
- **Status**: Draft
- **Purpose**: Controlled metadata transformations using deterministic "recipes"
- **Key Features**:
  - Define which attributes can update
  - Lock immutable traits
  - Verifiable on-chain evolution
  - Transparent transformation rules
- **Use Cases**: Game stats evolution while preserving base properties
- **Specification**: [EIP-5185](https://eips.ethereum.org/EIPS/eip-5185)

#### ERC-3569: Sealed NFT Metadata Standard
- **Status**: Final
- **Purpose**: Mark metadata as permanently immutable
- **Key Features**:
  - "Seal" metadata for token or range
  - Single URI maps multiple token IDs
  - Bulk caching support
  - Provenance assurance through immutability
- **Use Cases**: Collectors requiring metadata permanence guarantees
- **Specification**: [ERC-3569](https://ercs.ethereum.org/ERCS/erc-3569)

#### ERC-3440: Editions with Signed Provenance
- **Status**: Draft
- **Purpose**: Support for art editions with cryptographic signatures
- **Key Features**:
  - Designate original vs limited-edition prints
  - Cryptographic signature per token
  - Explicit recognition of "original" works
  - Trustless artistic provenance
- **Use Cases**: Art authenticity, limited editions, provenance verification
- **Specification**: [EIP-3440](https://eips.ethereum.org/EIPS/eip-3440)

#### ERC-4955: Vendor Metadata Extension
- **Status**: Draft
- **Purpose**: Structured namespaces for vendor-specific metadata
- **Key Features**:
  - Custom data in standardized format
  - Compatible with ERC-721 and ERC-1155
  - Supports 3D models, metaverse attributes
  - Improves cross-platform interoperability
- **Use Cases**: Gaming, metaverse, platform-specific features
- **Specification**: [EIP-4955](https://eips.ethereum.org/EIPS/eip-4955)

#### ERC-5192: Soulbound Token (Non-Transferable)
- **Status**: Final
- **Purpose**: Non-transferable tokens (Soulbound Tokens)
- **Key Features**:
  - `locked(uint256 tokenId)` returns true
  - `Locked` and `Unlocked` events
  - Can only be minted or burned
  - Uses standard ERC-721 metadata
- **Use Cases**: Certificates, identity traits, achievements
- **Specification**: [EIP-5192](https://eips.ethereum.org/EIPS/eip-5192)

**Metadata Example**:
```json
{
  "name": "Blockchain Developer Certificate",
  "description": "Certificate awarded to Jane Doe",
  "image": "https://example.com/images/certificate.jpg",
  "attributes": [
    {"trait_type": "Issuer", "value": "Blockchain University"},
    {"trait_type": "Issued On", "value": "2024-06-10"}
  ]
}
```

### Storage Solutions Comparison

#### On-Chain Storage
**Pros**:
- Truly immutable and permanent
- Highly decentralized
- Always accessible with blockchain
- No external dependencies

**Cons**:
- Expensive (high gas costs)
- Limited storage capacity
- Only practical for minimal metadata

**When to Use**: Small, critical metadata or fully generative art (e.g., ArtBlocks)

#### IPFS (InterPlanetary File System)
**Pros**:
- Cost-effective (no per-byte blockchain fees)
- Decentralized (no single point of failure)
- Content-addressed (immutable hashes)
- Wide ecosystem support

**Cons**:
- Permanence not guaranteed (requires pinning)
- Data may disappear if not pinned
- Requires pinning services

**Best Practices**:
- Use multiple pinning services (Pinata, NFT.Storage, Infura)
- Use `ipfs://` URIs in contracts
- Regular pinning status audits
- Redundant storage across providers

**Pinning Services**:
- **NFT.Storage**: Free, backed by Protocol Labs
- **Pinata**: Paid plans with SLA guarantees
- **Infura**: Enterprise-grade IPFS infrastructure

#### Arweave
**Pros**:
- Permanent storage by protocol design
- One-time fee for perpetual storage
- Incentive layer ensures data persistence
- Ideal for NFT metadata and art

**Cons**:
- Higher initial cost than IPFS
- Permanence depends on Arweave network
- Less ecosystem adoption than IPFS

**Best Practices**:
- Use `ar://` URIs or HTTP gateways
- Upload via trusted gateways
- Suitable for high-value NFTs requiring permanence

**Cost Comparison** (approximate):
- IPFS: Free (with pinning service costs)
- Arweave: ~$5-10 per MB (one-time)
- On-chain: $1000s per MB (Ethereum mainnet)

### Metadata Schema Best Practices

#### Standard Metadata Fields
```json
{
  "name": "NFT Name",
  "description": "Detailed description",
  "image": "ipfs://Qm.../image.png",
  "external_url": "https://example.com/nft/1",
  "attributes": [
    {"trait_type": "Background", "value": "Blue"},
    {"trait_type": "Rarity", "value": "Legendary"}
  ],
  "animation_url": "ipfs://Qm.../animation.mp4",
  "background_color": "FFFFFF"
}
```

#### Provenance-Enhanced Metadata
```json
{
  "name": "Artwork Title",
  "description": "Description",
  "image": "ipfs://Qm.../image.png",
  "creator": "0xCreatorAddress",
  "created_at": "2024-01-15T10:30:00Z",
  "provenance": {
    "original_creator": "Artist Name",
    "creation_date": "2024-01-15",
    "creation_tool": "Procreate",
    "blockchain_timestamp": "0xTransactionHash"
  },
  "license": "CC0",
  "attributes": [
    {"trait_type": "Medium", "value": "Digital"},
    {"trait_type": "Edition", "value": "1/1"}
  ]
}
```

## Recommendations

### For Static NFT Collections
1. **Storage**: Use **Arweave** for permanent metadata and assets
2. **Standard**: Implement **ERC-721** with optional **ERC-3569** for sealed metadata
3. **Metadata**: Include comprehensive provenance fields
4. **Verification**: Provide independent verification tools

### For Dynamic/Evolving NFTs
1. **Standard**: Implement **ERC-4906** for update notifications
2. **Storage**: Combine on-chain state with IPFS metadata
3. **Updates**: Use controlled update mechanisms with access control
4. **Events**: Emit events for all metadata changes

### For Multi-Version NFTs
1. **Standard**: Implement **ERC-7160** for multiple metadata URIs
2. **Use Cases**: Version history, format variants, evolving art
3. **Pinning**: Allow owners to select preferred version
4. **Storage**: IPFS for each version with permanent Arweave backup

### For Gaming/RPG NFTs
1. **Standard**: Combine **ERC-4906** with **ERC-5185** for controlled evolution
2. **Storage**: On-chain stats, off-chain visual assets
3. **Updates**: Game contract controls trait evolution
4. **Metadata**: Dynamic API generates metadata from on-chain state

### For Art Editions
1. **Standard**: Implement **ERC-3440** for signed provenance
2. **Metadata**: Include edition number, artist signature
3. **Storage**: Arweave for permanence
4. **Verification**: Cryptographic signature verification

## Implementation Notes

### Content-Addressed URIs
Always use content-addressed URIs to ensure immutability:
- IPFS: `ipfs://Qm...` (CIDv0) or `ipfs://bafy...` (CIDv1)
- Arweave: `ar://...` or `https://arweave.net/...`

### Metadata Validation
Ensure metadata consistency:
- Validate JSON schema before upload
- Check all referenced assets exist
- Verify IPFS/Arweave hashes match content
- Test metadata rendering on major platforms

### Marketplace Compatibility
Major marketplaces supporting standards:
- **OpenSea**: ERC-721, ERC-1155, ERC-4906
- **Blur**: ERC-721, ERC-4906
- **Rarible**: ERC-721, ERC-1155, ERC-4906
- **MakersPlace**: ERC-7160, ERC-4906

### Security Considerations
- Implement access control for metadata updates
- Use multi-sig for critical update functions
- Emit events for transparency
- Consider timelock for major changes
- Regular security audits for custom implementations

## Summary Table: Standards Comparison

| Standard | Purpose | Provenance Benefit | Status |
|----------|---------|-------------------|--------|
| ERC-721 | Base NFT standard | Blockchain ownership history | Final |
| ERC-4906 | Metadata update events | Transparent update tracking | Final |
| ERC-7160 | Multiple metadata URIs | Version history preservation | Final |
| ERC-5185 | Controlled transformations | Verifiable evolution | Draft |
| ERC-3569 | Sealed metadata | Guaranteed immutability | Final |
| ERC-3440 | Signed editions | Cryptographic provenance | Draft |
| ERC-4955 | Vendor namespaces | Rich metadata interoperability | Draft |
| ERC-5192 | Soulbound tokens | Non-transferable provenance | Final |

## Sources
1. [ERC-721 Standard](https://ercs.ethereum.org/ERCS/erc-721)
2. [EIP-4906: Metadata Update Extension](https://eips.ethereum.org/EIPS/eip-4906)
3. [ERC-7160: Multi-Metadata Extension](https://ercs.ethereum.org/ERCS/erc-7160)
4. [EIP-5185: Updatable Metadata](https://eips.ethereum.org/EIPS/eip-5185)
5. [ERC-3569: Sealed Metadata](https://ercs.ethereum.org/ERCS/erc-3569)
6. [EIP-3440: Editions Standard](https://eips.ethereum.org/EIPS/eip-3440)
7. [EIP-4955: Vendor Metadata](https://eips.ethereum.org/EIPS/eip-4955)
8. [EIP-5192: Soulbound Tokens](https://eips.ethereum.org/EIPS/eip-5192)
9. [NFT.Storage Best Practices](https://nft.storage/)
10. [Arweave Documentation](https://www.arweave.org/technology)

## Next Steps
1. Select appropriate ERC standard(s) based on NFT use case
2. Choose storage solution (IPFS, Arweave, or hybrid)
3. Design metadata schema with provenance fields
4. Implement smart contracts with chosen extensions
5. Set up pinning/storage infrastructure
6. Test metadata rendering across major platforms
7. Document provenance tracking for users
