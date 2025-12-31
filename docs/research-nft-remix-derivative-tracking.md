# Research Report: NFT Remix and Derivative Tracking Best Practices

## Overview
This report examines best practices for tracking remixes and derivative works in NFT ecosystems, including metadata schemas for parent-child relationships, on-chain provenance tracking, and attribution patterns for CC0 and licensed content.

## Key Findings

### Derivative Work Concepts

#### Types of NFT Derivatives
1. **Remixes**: Modifications or reinterpretations of original NFT
2. **Derivatives**: New works based on or inspired by original
3. **Collaborations**: Multiple creators building on shared work
4. **Composites**: Combining multiple NFTs into new creation
5. **Editions**: Limited prints or variations of original
6. **Adaptations**: Cross-media interpretations (2D → 3D, static → animated)

#### Provenance Tracking Challenges
- No universal standard for derivative relationships
- Most tracking is project-specific
- On-chain vs off-chain metadata trade-offs
- Legal copyright vs technical attribution
- Interoperability across platforms

### Metadata Schema Patterns

#### Basic Parent-Child Relationship
```json
{
  "name": "Remix of Original Art",
  "description": "A creative reinterpretation of the original piece",
  "image": "ipfs://Qm.../remix.png",
  "parent": {
    "token_id": "1234",
    "contract_address": "0xABCDEF1234567890",
    "chain": "Ethereum",
    "relationship": "derivative"
  },
  "creator": "0xRemixArtist123",
  "original_creator": "0xOriginalArtist456",
  "attributes": [
    {"trait_type": "Type", "value": "Remix"},
    {"trait_type": "Parent Title", "value": "Original Masterpiece"}
  ]
}
```

#### Multi-Parent (Composite) Metadata
```json
{
  "name": "Mashup NFT",
  "description": "Combining elements from multiple sources",
  "image": "ipfs://Qm.../mashup.png",
  "parents": [
    {
      "token_id": "1111",
      "contract_address": "0xParent1Address",
      "chain": "Ethereum",
      "relationship": "derived",
      "contribution": "Background elements"
    },
    {
      "token_id": "2222",
      "contract_address": "0xParent2Address",
      "chain": "Ethereum",
      "relationship": "inspired",
      "contribution": "Color palette"
    },
    {
      "token_id": "3333",
      "contract_address": "0xParent3Address",
      "chain": "Polygon",
      "relationship": "remixed",
      "contribution": "Character design"
    }
  ],
  "creators": [
    {"address": "0xArtist1", "role": "Compositor"},
    {"address": "0xArtist2", "role": "Original Artist 1"},
    {"address": "0xArtist3", "role": "Original Artist 2"}
  ]
}
```

#### Comprehensive Provenance Schema
```json
{
  "name": "Derivative Work Title",
  "description": "Detailed description of the derivative work",
  "image": "ipfs://Qm.../image.png",
  "animation_url": "ipfs://Qm.../animation.mp4",
  
  "provenance": {
    "original": {
      "token_id": "1234",
      "contract_address": "0xOriginalContract",
      "chain": "Ethereum",
      "creator": "0xOriginalCreator",
      "title": "Original Work Title",
      "creation_date": "2023-05-15T10:00:00Z"
    },
    "derivative": {
      "creator": "0xDerivativeCreator",
      "creation_date": "2024-01-20T14:30:00Z",
      "relationship_type": "remix",
      "modifications": [
        "Color adjustment",
        "Added animation",
        "Style transfer applied"
      ],
      "tools_used": ["Photoshop", "After Effects", "AI Style Transfer"]
    },
    "license": {
      "original_license": "CC0",
      "derivative_license": "CC BY-SA 4.0",
      "attribution_required": true,
      "commercial_use": true
    }
  },
  
  "attribution": {
    "original_artist": "Artist Name",
    "original_artist_url": "https://artist.com",
    "derivative_artist": "Remix Artist Name",
    "attribution_text": "Based on 'Original Work' by Artist Name (CC0)"
  },
  
  "lineage": [
    {
      "generation": 0,
      "token_id": "1234",
      "contract": "0xGen0Contract",
      "creator": "0xOriginalCreator"
    },
    {
      "generation": 1,
      "token_id": "5678",
      "contract": "0xGen1Contract",
      "creator": "0xFirstRemixer"
    },
    {
      "generation": 2,
      "token_id": "9012",
      "contract": "0xThisContract",
      "creator": "0xCurrentCreator"
    }
  ],
  
  "attributes": [
    {"trait_type": "Generation", "value": 2},
    {"trait_type": "Derivative Type", "value": "Remix"},
    {"trait_type": "License", "value": "CC BY-SA 4.0"}
  ]
}
```

### On-Chain Tracking Patterns

#### Smart Contract Parent-Child Mapping
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DerivativeNFT is ERC721 {
    struct ParentNFT {
        address contractAddress;
        uint256 tokenId;
        string relationship; // "remix", "derivative", "inspired", etc.
    }
    
    struct DerivativeInfo {
        ParentNFT[] parents;
        address creator;
        uint256 generation;
        uint256 createdAt;
    }
    
    mapping(uint256 => DerivativeInfo) public derivatives;
    mapping(uint256 => uint256[]) public children; // tokenId => child tokenIds
    
    event DerivativeCreated(
        uint256 indexed tokenId,
        address indexed creator,
        address[] parentContracts,
        uint256[] parentTokenIds,
        uint256 generation
    );
    
    event RemixCreated(
        uint256 indexed newTokenId,
        uint256 indexed originalTokenId,
        address indexed remixer
    );
    
    function mintDerivative(
        address to,
        string memory uri,
        ParentNFT[] memory parents
    ) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        // Calculate generation (max parent generation + 1)
        uint256 maxGeneration = 0;
        for (uint256 i = 0; i < parents.length; i++) {
            derivatives[tokenId].parents.push(parents[i]);
            
            // Track child relationship if parent is in this contract
            if (parents[i].contractAddress == address(this)) {
                children[parents[i].tokenId].push(tokenId);
                
                uint256 parentGen = derivatives[parents[i].tokenId].generation;
                if (parentGen > maxGeneration) {
                    maxGeneration = parentGen;
                }
            }
        }
        
        derivatives[tokenId].creator = to;
        derivatives[tokenId].generation = maxGeneration + 1;
        derivatives[tokenId].createdAt = block.timestamp;
        
        address[] memory parentContracts = new address[](parents.length);
        uint256[] memory parentTokenIds = new uint256[](parents.length);
        for (uint256 i = 0; i < parents.length; i++) {
            parentContracts[i] = parents[i].contractAddress;
            parentTokenIds[i] = parents[i].tokenId;
        }
        
        emit DerivativeCreated(
            tokenId,
            to,
            parentContracts,
            parentTokenIds,
            maxGeneration + 1
        );
        
        return tokenId;
    }
    
    // Get all children of a token
    function getChildren(uint256 tokenId) public view returns (uint256[] memory) {
        return children[tokenId];
    }
    
    // Get full lineage (all ancestors)
    function getLineage(uint256 tokenId) public view returns (DerivativeInfo[] memory) {
        // Recursive lineage tracking implementation
        // Returns array of all ancestor derivative info
    }
    
    // Check if token is derivative of another
    function isDerivativeOf(
        uint256 tokenId,
        address parentContract,
        uint256 parentTokenId
    ) public view returns (bool) {
        ParentNFT[] memory parents = derivatives[tokenId].parents;
        for (uint256 i = 0; i < parents.length; i++) {
            if (parents[i].contractAddress == parentContract &&
                parents[i].tokenId == parentTokenId) {
                return true;
            }
        }
        return false;
    }
}
```

#### Royalty Splitting for Derivatives
```solidity
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract DerivativeWithRoyalties is DerivativeNFT, IERC2981 {
    struct RoyaltySplit {
        address recipient;
        uint96 percentage; // Basis points (10000 = 100%)
    }
    
    mapping(uint256 => RoyaltySplit[]) public royaltySplits;
    
    function mintDerivativeWithRoyalties(
        address to,
        string memory uri,
        ParentNFT[] memory parents,
        RoyaltySplit[] memory splits
    ) public returns (uint256) {
        uint256 tokenId = mintDerivative(to, uri, parents);
        
        // Validate splits add up to 100%
        uint96 total = 0;
        for (uint256 i = 0; i < splits.length; i++) {
            royaltySplits[tokenId].push(splits[i]);
            total += splits[i].percentage;
        }
        require(total == 10000, "Splits must equal 100%");
        
        return tokenId;
    }
    
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        // For simplicity, return first recipient
        // In practice, implement payment splitter
        RoyaltySplit[] memory splits = royaltySplits[tokenId];
        if (splits.length > 0) {
            uint256 totalRoyalty = (salePrice * 500) / 10000; // 5% total
            return (splits[0].recipient, totalRoyalty);
        }
        return (address(0), 0);
    }
}
```

### CC0 and Attribution Patterns

#### CC0 Voluntary Attribution
Even though CC0 doesn't require attribution, best practices include:

**Metadata Fields**:
```json
{
  "name": "CC0 Remix",
  "license": "CC0",
  "attribution": {
    "required": false,
    "provided_as_courtesy": true,
    "original_creator": "0xOriginalArtist",
    "original_work": "Original Title",
    "original_token": {
      "contract": "0xOriginalContract",
      "token_id": "1234"
    }
  },
  "remixed_from": "0x1234...5678:42",
  "remix_note": "Attribution voluntary but appreciated"
}
```

**Smart Contract Pattern**:
```solidity
contract CC0RemixNFT is ERC721 {
    struct CC0Attribution {
        address originalContract;
        uint256 originalTokenId;
        address originalCreator;
        bool attributionProvided; // Voluntary flag
    }
    
    mapping(uint256 => CC0Attribution) public attributions;
    
    event VoluntaryAttributionProvided(
        uint256 indexed tokenId,
        address indexed originalCreator,
        string note
    );
    
    function mintCC0Remix(
        address to,
        string memory uri,
        CC0Attribution memory attribution
    ) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        if (attribution.attributionProvided) {
            attributions[tokenId] = attribution;
            emit VoluntaryAttributionProvided(
                tokenId,
                attribution.originalCreator,
                "CC0 - Attribution voluntary"
            );
        }
        
        return tokenId;
    }
}
```

### Platform-Specific Solutions

#### Manifold Creator Contracts
- Extensible contracts with custom metadata
- Support for derivative tracking extensions
- Royalty splitting built-in
- Event emission for provenance

#### Zora Protocol
- Open edition mechanics
- "Seed" token references
- Derivative minting with attribution
- On-chain provenance tracking

#### Catalog Works
- Parent-child NFT documentation
- Custom metadata linking
- Marketplace integration
- Developer-friendly APIs

#### RMRK (Kusama/Polkadot)
- Native nested NFT support
- Assets owning other assets
- Composable NFT primitives
- Multi-resource NFTs

### Registry and Discovery Patterns

#### CC0 Registry
```solidity
contract CC0Registry {
    mapping(address => mapping(uint256 => bool)) public isCC0;
    mapping(address => bool) public isCC0Collection;
    
    event TokenRegisteredAsCC0(address indexed collection, uint256 indexed tokenId);
    event CollectionRegisteredAsCC0(address indexed collection);
    
    function registerTokenAsCC0(address collection, uint256 tokenId) public {
        // Verify caller is token owner or collection owner
        isCC0[collection][tokenId] = true;
        emit TokenRegisteredAsCC0(collection, tokenId);
    }
    
    function registerCollectionAsCC0(address collection) public {
        // Verify caller is collection owner
        isCC0Collection[collection] = true;
        emit CollectionRegisteredAsCC0(collection);
    }
}
```

#### Derivative Discovery Service
```typescript
// Off-chain indexer pattern
interface DerivativeGraph {
  getChildren(contract: string, tokenId: number): Derivative[];
  getParents(contract: string, tokenId: number): Parent[];
  getLineage(contract: string, tokenId: number): LineageNode[];
  getGeneration(contract: string, tokenId: number): number;
}

// Example query
const children = await derivativeGraph.getChildren(
  "0xContractAddress",
  1234
);

// Returns:
[
  {
    contract: "0xDerivativeContract1",
    tokenId: 5678,
    creator: "0xRemixer1",
    relationship: "remix",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    contract: "0xDerivativeContract2",
    tokenId: 9012,
    creator: "0xRemixer2",
    relationship: "derivative",
    createdAt: "2024-02-20T14:30:00Z"
  }
]
```

## Recommendations

### For Open/CC0 Projects
1. **Metadata**: Include voluntary attribution fields
2. **Registry**: Register in CC0 registry for discoverability
3. **Events**: Emit events for derivative creation
4. **Documentation**: Clearly state CC0 status and remix encouragement
5. **UI**: Display attribution even if not required

### For Licensed Content
1. **Smart Contract**: Enforce license terms on-chain where possible
2. **Metadata**: Include license type and requirements
3. **Royalties**: Implement ERC-2981 with splits for original creators
4. **Verification**: Provide tools to verify derivative legitimacy
5. **Attribution**: Make attribution prominent in metadata

### For Derivative Platforms
1. **Standards**: Support common metadata schemas
2. **Indexing**: Build derivative graph indexer
3. **Discovery**: Provide UI for exploring lineage
4. **Verification**: Verify parent NFT ownership/permissions
5. **Royalties**: Support automatic royalty distribution

### For Individual Creators
1. **Metadata**: Always include parent references
2. **Attribution**: Credit original creators prominently
3. **License**: Clearly state derivative license
4. **Documentation**: Explain modifications made
5. **Community**: Engage with original creator community

## Implementation Notes

### Metadata Best Practices
1. Use consistent field names across projects
2. Include both human-readable and machine-readable data
3. Store critical provenance on-chain, details off-chain
4. Use IPFS/Arweave for permanent metadata storage
5. Include creation timestamps and tool information

### On-Chain Considerations
1. Gas costs for complex lineage tracking
2. Storage optimization for parent arrays
3. Event emission for off-chain indexing
4. Access control for derivative creation
5. Royalty calculation complexity

### Off-Chain Infrastructure
1. Graph indexer for derivative relationships
2. API for lineage queries
3. UI components for family tree visualization
4. Notification system for new derivatives
5. Search and discovery tools

### Legal Considerations
1. Technical attribution ≠ legal copyright
2. License compatibility checking
3. Terms of service for derivative platforms
4. DMCA compliance for unauthorized derivatives
5. International copyright law variations

## Sources
1. [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)
2. [EIP-2981: NFT Royalty Standard](https://eips.ethereum.org/EIPS/eip-2981)
3. [Manifold Creator Contracts](https://docs.manifoldxyz.dev/)
4. [Zora Protocol Documentation](https://docs.zora.co/)
5. [CC0 Registry](https://cc0registry.com/)
6. [RMRK Standards](https://rmrk.app/)

## Next Steps
1. Design metadata schema for derivative tracking
2. Implement smart contract with parent-child relationships
3. Build indexer for derivative graph
4. Create UI for lineage visualization
5. Establish royalty splitting mechanism
6. Document attribution requirements
7. Test cross-platform compatibility
