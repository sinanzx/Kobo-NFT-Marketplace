// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/interfaces/IERC4906.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KoboNFTExtended (工房 NFT Extended)
 * @notice Extended multi-modal NFT contract with provenance, dynamic traits, derivatives, and collaboration
 * @dev Implements ERC-721, ERC-2981, ERC-4906, and custom extensions for comprehensive NFT features
 */
contract KoboNFTExtended is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    ERC2981,
    Ownable, 
    Pausable,
    ReentrancyGuard 
{
    /// @notice NFT type enumeration
    enum NFTType {
        IMAGE,
        VIDEO,
        AUDIO
    }

    /// @notice Generation method enumeration
    enum GenerationMethod {
        AI_GENERATED,
        MANUAL_UPLOAD,
        REMIXED
    }

    /// @notice Derivative relationship type
    enum DerivativeType {
        NONE,           // Not a derivative
        REMIX,          // Modified version
        DERIVATIVE,     // Inspired by
        COLLABORATION,  // Multi-creator work
        COMPOSITE,      // Multiple parents
        ADAPTATION      // Cross-media
    }

    /// @notice Parent NFT reference for derivatives
    struct ParentNFT {
        address contractAddress;
        uint256 tokenId;
        DerivativeType relationship;
        string contribution;  // What was taken/inspired
    }

    /// @notice Derivative information structure
    struct DerivativeInfo {
        ParentNFT[] parents;
        address creator;
        uint256 generation;
        uint256 createdAt;
    }

    /// @notice Creator attribution for collaborations
    struct Creator {
        address wallet;
        string role;
        uint96 royaltyShare; // Basis points (10000 = 100%)
    }

    /// @notice Dynamic trait structure
    struct Trait {
        string name;
        string value;
        uint256 lastUpdated;
    }

    /// @notice Copyright proof data
    struct CopyrightProof {
        bytes32 contentHash;      // Hash of the actual content
        bytes32 c2paManifestHash; // C2PA manifest hash
        bytes32 auditHash;        // Copyright audit hash
        uint256 timestamp;        // Proof timestamp
        string proofURI;          // Link to full proof data
    }

    /// @notice Metadata version for ERC-7160 multi-metadata support
    struct MetadataVersion {
        string uri;
        uint256 timestamp;
        string description;
        bool isPinned;
    }

    /// @notice Core NFT metadata structure
    struct NFTMetadata {
        NFTType nftType;
        GenerationMethod generationMethod;
        uint256 mintTimestamp;
        address originalCreator;
        uint256 level;           // For gaming/evolution
        uint256 experience;      // For trait progression
    }

    /// @notice Token ID counter
    uint256 private _nextTokenId;

    /// @notice Default royalty percentage (5% = 500 basis points)
    uint96 private constant ROYALTY_PERCENTAGE = 500;

    /// @notice Maximum royalty (10%)
    uint96 private constant MAX_ROYALTY = 1000;

    /// @notice Contract-level metadata URI for OpenSea
    string private _contractURI;

    /// @notice Mapping from token ID to core metadata
    mapping(uint256 => NFTMetadata) private _tokenMetadata;

    /// @notice Mapping from token ID to copyright proof
    mapping(uint256 => CopyrightProof) private _copyrightProofs;

    /// @notice Mapping from token ID to parent NFTs (for derivatives)
    mapping(uint256 => ParentNFT[]) private _parentNFTs;

    /// @notice Mapping from token ID to creators (for collaborations)
    mapping(uint256 => Creator[]) private _creators;

    /// @notice Mapping from token ID to dynamic traits
    mapping(uint256 => Trait[]) private _traits;

    /// @notice Mapping from token ID to metadata versions (ERC-7160)
    mapping(uint256 => MetadataVersion[]) private _metadataVersions;

    /// @notice Mapping from token ID to pinned metadata index
    mapping(uint256 => uint256) private _pinnedMetadataIndex;

    /// @notice Mapping to track if token has derivatives (children)
    mapping(uint256 => uint256[]) private _derivatives;

    /// @notice Mapping from token ID to derivative info
    mapping(uint256 => DerivativeInfo) private _derivativeInfo;

    /// @notice Mapping from token ID to generation depth
    mapping(uint256 => uint256) private _generation;

    /// @notice Events
    /// @dev ERC-4906 events are inherited from IERC4906 interface

    /// @notice Minting and Creation Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        NFTType nftType,
        GenerationMethod generationMethod,
        string tokenURI
    );

    event CollaborativeNFTMinted(
        uint256 indexed tokenId,
        address[] creators,
        uint96[] royaltyShares
    );

    /// @notice Provenance Events
    event CopyrightProofAdded(
        uint256 indexed tokenId,
        bytes32 contentHash,
        bytes32 c2paManifestHash,
        uint256 timestamp
    );

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

    /// @notice Metadata Version Events (ERC-7160)
    event MetadataVersionAdded(
        uint256 indexed tokenId,
        uint256 versionIndex,
        string uri,
        string description
    );

    event MetadataVersionPinned(
        uint256 indexed tokenId,
        uint256 versionIndex
    );

    /// @notice Dynamic Trait Events
    event TraitAdded(
        uint256 indexed tokenId,
        string traitName,
        string traitValue
    );

    event TraitUpdated(
        uint256 indexed tokenId,
        string traitName,
        string oldValue,
        string newValue
    );

    event CharacterLevelUp(
        uint256 indexed tokenId,
        uint256 newLevel,
        uint256 experience
    );

    /// @notice Royalty Events
    event RoyaltyUpdated(address indexed receiver, uint96 feeNumerator);
    event TokenRoyaltySplitConfigured(uint256 indexed tokenId, uint256 creatorCount);

    /**
     * @notice Constructor
     * @param initialOwner Address of the contract owner
     */
    constructor(address initialOwner) 
        ERC721("KoboNFT Extended", "KOBOE") 
        Ownable(initialOwner) 
    {
        _setDefaultRoyalty(initialOwner, ROYALTY_PERCENTAGE);
        
        // Set default contract URI (can be updated later)
        _contractURI = "https://ipfs.io/ipfs/QmYourExtendedCollectionMetadataHash";
    }

    // ============================================
    // MINTING FUNCTIONS
    // ============================================

    /**
     * @notice Mint a standard NFT with copyright proof
     * @param to Address to mint the NFT to
     * @param uri Token URI (IPFS link to metadata JSON)
     * @param nftType Type of NFT (IMAGE, VIDEO, AUDIO)
     * @param generationMethod How the NFT was created
     * @param contentHash Hash of the actual content
     * @param c2paManifestHash C2PA manifest hash for provenance
     * @param auditHash Copyright audit hash
     * @return tokenId The ID of the newly minted token
     */
    function mint(
        address to,
        string memory uri,
        NFTType nftType,
        GenerationMethod generationMethod,
        bytes32 contentHash,
        bytes32 c2paManifestHash,
        bytes32 auditHash
    ) public whenNotPaused returns (uint256) {
        require(to != address(0), "KoboNFT: mint to zero address");
        require(bytes(uri).length > 0, "KoboNFT: empty URI");
        require(contentHash != bytes32(0), "KoboNFT: invalid content hash");

        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // Store core metadata
        _tokenMetadata[tokenId] = NFTMetadata({
            nftType: nftType,
            generationMethod: generationMethod,
            mintTimestamp: block.timestamp,
            originalCreator: msg.sender,
            level: 1,
            experience: 0
        });

        // Store copyright proof
        _copyrightProofs[tokenId] = CopyrightProof({
            contentHash: contentHash,
            c2paManifestHash: c2paManifestHash,
            auditHash: auditHash,
            timestamp: block.timestamp,
            proofURI: ""
        });

        // Add initial metadata version
        _metadataVersions[tokenId].push(MetadataVersion({
            uri: uri,
            timestamp: block.timestamp,
            description: "Initial mint",
            isPinned: true
        }));
        _pinnedMetadataIndex[tokenId] = 0;

        // Set default royalty for this token
        _setTokenRoyalty(tokenId, msg.sender, ROYALTY_PERCENTAGE);

        emit NFTMinted(tokenId, msg.sender, nftType, generationMethod, uri);
        emit CopyrightProofAdded(tokenId, contentHash, c2paManifestHash, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Mint a collaborative NFT with multiple creators and royalty splits
     * @param to Address to mint the NFT to
     * @param uri Token URI
     * @param nftType Type of NFT
     * @param generationMethod How the NFT was created
     * @param contentHash Hash of the content
     * @param c2paManifestHash C2PA manifest hash
     * @param auditHash Copyright audit hash
     * @param creators Array of creator addresses
     * @param roles Array of creator roles
     * @param royaltyShares Array of royalty shares in basis points (must sum to 10000)
     * @return tokenId The ID of the newly minted token
     */
    function mintCollaborative(
        address to,
        string memory uri,
        NFTType nftType,
        GenerationMethod generationMethod,
        bytes32 contentHash,
        bytes32 c2paManifestHash,
        bytes32 auditHash,
        address[] memory creators,
        string[] memory roles,
        uint96[] memory royaltyShares
    ) public whenNotPaused returns (uint256) {
        require(creators.length > 1, "KoboNFT: need multiple creators");
        require(creators.length == roles.length, "KoboNFT: length mismatch");
        require(creators.length == royaltyShares.length, "KoboNFT: length mismatch");

        // Validate royalty shares sum to 100%
        uint96 totalShares = 0;
        for (uint256 i = 0; i < royaltyShares.length; i++) {
            require(creators[i] != address(0), "KoboNFT: invalid creator");
            totalShares += royaltyShares[i];
        }
        require(totalShares == 10000, "KoboNFT: shares must equal 100%");

        // Mint the token
        uint256 tokenId = mint(to, uri, nftType, generationMethod, contentHash, c2paManifestHash, auditHash);

        // Store creator information
        for (uint256 i = 0; i < creators.length; i++) {
            _creators[tokenId].push(Creator({
                wallet: creators[i],
                role: roles[i],
                royaltyShare: royaltyShares[i]
            }));
        }

        emit CollaborativeNFTMinted(tokenId, creators, royaltyShares);
        emit TokenRoyaltySplitConfigured(tokenId, creators.length);

        return tokenId;
    }

    /**
     * @notice Mint a derivative NFT with parent references
     * @param to Address to mint the NFT to
     * @param uri Token URI
     * @param nftType Type of NFT
     * @param contentHash Hash of the content
     * @param c2paManifestHash C2PA manifest hash
     * @param auditHash Copyright audit hash
     * @param parentContracts Array of parent contract addresses
     * @param parentTokenIds Array of parent token IDs
     * @param relationships Array of derivative relationship types
     * @param contributions Array of contribution descriptions
     * @return tokenId The ID of the newly minted token
     */
    function mintDerivative(
        address to,
        string memory uri,
        NFTType nftType,
        bytes32 contentHash,
        bytes32 c2paManifestHash,
        bytes32 auditHash,
        address[] memory parentContracts,
        uint256[] memory parentTokenIds,
        DerivativeType[] memory relationships,
        string[] memory contributions
    ) public whenNotPaused returns (uint256) {
        require(parentContracts.length > 0, "KoboNFT: need at least one parent");
        require(parentContracts.length == parentTokenIds.length, "KoboNFT: length mismatch");
        require(parentContracts.length == relationships.length, "KoboNFT: length mismatch");
        require(parentContracts.length == contributions.length, "KoboNFT: length mismatch");

        // Mint as REMIXED
        uint256 tokenId = mint(to, uri, nftType, GenerationMethod.REMIXED, contentHash, c2paManifestHash, auditHash);

        // Calculate generation (max parent generation + 1)
        uint256 maxGeneration = 0;

        // Store parent references
        for (uint256 i = 0; i < parentContracts.length; i++) {
            require(parentContracts[i] != address(0), "KoboNFT: invalid parent contract");
            require(relationships[i] != DerivativeType.NONE, "KoboNFT: invalid relationship");

            _parentNFTs[tokenId].push(ParentNFT({
                contractAddress: parentContracts[i],
                tokenId: parentTokenIds[i],
                relationship: relationships[i],
                contribution: contributions[i]
            }));

            // Track derivative in parent if same contract
            if (parentContracts[i] == address(this)) {
                _derivatives[parentTokenIds[i]].push(tokenId);
                
                // Get parent generation for calculation
                uint256 parentGen = _generation[parentTokenIds[i]];
                if (parentGen > maxGeneration) {
                    maxGeneration = parentGen;
                }
            }
        }

        // Set generation (max parent generation + 1)
        uint256 generation = maxGeneration + 1;
        _generation[tokenId] = generation;

        // Store derivative info
        _derivativeInfo[tokenId] = DerivativeInfo({
            parents: _parentNFTs[tokenId],
            creator: msg.sender,
            generation: generation,
            createdAt: block.timestamp
        });

        emit DerivativeCreated(tokenId, msg.sender, parentContracts, parentTokenIds, generation);

        return tokenId;
    }

    /**
     * @notice Mint a remix NFT from a single parent (simplified derivative)
     * @param to Address to mint the NFT to
     * @param uri Token URI
     * @param nftType Type of NFT
     * @param contentHash Hash of the content
     * @param c2paManifestHash C2PA manifest hash
     * @param auditHash Copyright audit hash
     * @param originalTokenId Parent token ID to remix
     * @return tokenId The ID of the newly minted token
     */
    function mintRemix(
        address to,
        string memory uri,
        NFTType nftType,
        bytes32 contentHash,
        bytes32 c2paManifestHash,
        bytes32 auditHash,
        uint256 originalTokenId
    ) public whenNotPaused returns (uint256) {
        require(_ownerOf(originalTokenId) != address(0), "KoboNFT: original token does not exist");

        // Create arrays for single parent
        address[] memory parentContracts = new address[](1);
        uint256[] memory parentTokenIds = new uint256[](1);
        DerivativeType[] memory relationships = new DerivativeType[](1);
        string[] memory contributions = new string[](1);

        parentContracts[0] = address(this);
        parentTokenIds[0] = originalTokenId;
        relationships[0] = DerivativeType.REMIX;
        contributions[0] = "Remixed from original";

        uint256 tokenId = mintDerivative(
            to,
            uri,
            nftType,
            contentHash,
            c2paManifestHash,
            auditHash,
            parentContracts,
            parentTokenIds,
            relationships,
            contributions
        );

        emit RemixCreated(tokenId, originalTokenId, msg.sender);

        return tokenId;
    }

    // ============================================
    // METADATA VERSION MANAGEMENT (ERC-7160)
    // ============================================

    /**
     * @notice Add a new metadata version for a token
     * @param tokenId Token ID
     * @param newURI New metadata URI
     * @param description Description of this version
     */
    function addMetadataVersion(
        uint256 tokenId,
        string memory newURI,
        string memory description
    ) public {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "KoboNFT: unauthorized");
        require(bytes(newURI).length > 0, "KoboNFT: empty URI");

        _metadataVersions[tokenId].push(MetadataVersion({
            uri: newURI,
            timestamp: block.timestamp,
            description: description,
            isPinned: false
        }));

        uint256 versionIndex = _metadataVersions[tokenId].length - 1;

        emit MetadataVersionAdded(tokenId, versionIndex, newURI, description);
        emit MetadataUpdate(tokenId);
    }

    /**
     * @notice Pin a specific metadata version as active
     * @param tokenId Token ID
     * @param versionIndex Index of the version to pin
     */
    function pinMetadataVersion(uint256 tokenId, uint256 versionIndex) public {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "KoboNFT: unauthorized");
        require(versionIndex < _metadataVersions[tokenId].length, "KoboNFT: invalid version");

        // Unpin current
        _metadataVersions[tokenId][_pinnedMetadataIndex[tokenId]].isPinned = false;

        // Pin new
        _pinnedMetadataIndex[tokenId] = versionIndex;
        _metadataVersions[tokenId][versionIndex].isPinned = true;

        // Update the token URI to the pinned version
        _setTokenURI(tokenId, _metadataVersions[tokenId][versionIndex].uri);

        emit MetadataVersionPinned(tokenId, versionIndex);
        emit MetadataUpdate(tokenId);
    }

    /**
     * @notice Get all metadata versions for a token
     * @param tokenId Token ID
     * @return Array of metadata versions
     */
    function getMetadataVersions(uint256 tokenId) public view returns (MetadataVersion[] memory) {
        _requireOwned(tokenId);
        return _metadataVersions[tokenId];
    }

    /**
     * @notice Get the currently pinned metadata version index
     * @param tokenId Token ID
     * @return Index of pinned version
     */
    function getPinnedMetadataIndex(uint256 tokenId) public view returns (uint256) {
        _requireOwned(tokenId);
        return _pinnedMetadataIndex[tokenId];
    }

    // ============================================
    // DYNAMIC TRAITS MANAGEMENT
    // ============================================

    /**
     * @notice Add a new trait to a token
     * @param tokenId Token ID
     * @param traitName Name of the trait
     * @param traitValue Value of the trait
     */
    function addTrait(
        uint256 tokenId,
        string memory traitName,
        string memory traitValue
    ) public {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "KoboNFT: unauthorized");
        require(bytes(traitName).length > 0, "KoboNFT: empty trait name");

        _traits[tokenId].push(Trait({
            name: traitName,
            value: traitValue,
            lastUpdated: block.timestamp
        }));

        emit TraitAdded(tokenId, traitName, traitValue);
        emit MetadataUpdate(tokenId);
    }

    /**
     * @notice Update an existing trait
     * @param tokenId Token ID
     * @param traitIndex Index of the trait to update
     * @param newValue New value for the trait
     */
    function updateTrait(
        uint256 tokenId,
        uint256 traitIndex,
        string memory newValue
    ) public {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "KoboNFT: unauthorized");
        require(traitIndex < _traits[tokenId].length, "KoboNFT: invalid trait index");

        string memory oldValue = _traits[tokenId][traitIndex].value;
        _traits[tokenId][traitIndex].value = newValue;
        _traits[tokenId][traitIndex].lastUpdated = block.timestamp;

        emit TraitUpdated(tokenId, _traits[tokenId][traitIndex].name, oldValue, newValue);
        emit MetadataUpdate(tokenId);
    }

    /**
     * @notice Add experience and potentially level up
     * @param tokenId Token ID
     * @param xp Experience points to add
     */
    function addExperience(uint256 tokenId, uint256 xp) public {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "KoboNFT: unauthorized");

        NFTMetadata storage metadata = _tokenMetadata[tokenId];
        metadata.experience += xp;

        // Level up if enough XP (100 XP per level)
        uint256 xpNeeded = metadata.level * 100;
        if (metadata.experience >= xpNeeded) {
            metadata.level += 1;
            emit CharacterLevelUp(tokenId, metadata.level, metadata.experience);
        }

        emit MetadataUpdate(tokenId);
    }

    /**
     * @notice Get all traits for a token
     * @param tokenId Token ID
     * @return Array of traits
     */
    function getTraits(uint256 tokenId) public view returns (Trait[] memory) {
        _requireOwned(tokenId);
        return _traits[tokenId];
    }

    /**
     * @notice Batch update traits for multiple tokens
     * @param tokenIds Array of token IDs
     * @param traitIndices Array of trait indices to update
     * @param newValues Array of new values
     */
    function batchUpdateTraits(
        uint256[] memory tokenIds,
        uint256[] memory traitIndices,
        string[] memory newValues
    ) public {
        require(tokenIds.length == traitIndices.length, "KoboNFT: length mismatch");
        require(tokenIds.length == newValues.length, "KoboNFT: length mismatch");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            updateTrait(tokenIds[i], traitIndices[i], newValues[i]);
        }

        if (tokenIds.length > 1) {
            emit BatchMetadataUpdate(tokenIds[0], tokenIds[tokenIds.length - 1]);
        }
    }

    // ============================================
    // COPYRIGHT PROOF MANAGEMENT
    // ============================================

    /**
     * @notice Update copyright proof URI with additional documentation
     * @param tokenId Token ID
     * @param proofURI URI to full copyright proof documentation
     */
    function updateCopyrightProofURI(uint256 tokenId, string memory proofURI) public {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "KoboNFT: unauthorized");
        _copyrightProofs[tokenId].proofURI = proofURI;
        emit MetadataUpdate(tokenId);
    }

    /**
     * @notice Get copyright proof for a token
     * @param tokenId Token ID
     * @return Copyright proof data
     */
    function getCopyrightProof(uint256 tokenId) public view returns (CopyrightProof memory) {
        _requireOwned(tokenId);
        return _copyrightProofs[tokenId];
    }

    // ============================================
    // PROVENANCE & DERIVATIVE QUERIES
    // ============================================

    /**
     * @notice Get parent NFTs for a derivative token
     * @param tokenId Token ID
     * @return Array of parent NFT references
     */
    function getParentNFTs(uint256 tokenId) public view returns (ParentNFT[] memory) {
        _requireOwned(tokenId);
        return _parentNFTs[tokenId];
    }

    /**
     * @notice Alias for getParentNFTs for consistency
     * @param tokenId Token ID
     * @return Array of parent NFT references
     */
    function getParents(uint256 tokenId) public view returns (ParentNFT[] memory) {
        return getParentNFTs(tokenId);
    }

    /**
     * @notice Get derivative tokens created from this token (children)
     * @param tokenId Token ID
     * @return Array of derivative token IDs
     */
    function getDerivatives(uint256 tokenId) public view returns (uint256[] memory) {
        _requireOwned(tokenId);
        return _derivatives[tokenId];
    }

    /**
     * @notice Alias for getDerivatives for consistency
     * @param tokenId Token ID
     * @return Array of child token IDs
     */
    function getChildren(uint256 tokenId) public view returns (uint256[] memory) {
        return getDerivatives(tokenId);
    }

    /**
     * @notice Get generation depth of a token
     * @param tokenId Token ID
     * @return Generation number (0 for original, 1+ for derivatives)
     */
    function getGeneration(uint256 tokenId) public view returns (uint256) {
        _requireOwned(tokenId);
        return _generation[tokenId];
    }

    /**
     * @notice Check if a token is a derivative of a specific parent
     * @param tokenId Token ID to check
     * @param parentContract Parent contract address
     * @param parentTokenId Parent token ID
     * @return True if token is derivative of specified parent
     */
    function isDerivativeOf(
        uint256 tokenId,
        address parentContract,
        uint256 parentTokenId
    ) public view returns (bool) {
        _requireOwned(tokenId);
        ParentNFT[] memory parents = _parentNFTs[tokenId];
        
        for (uint256 i = 0; i < parents.length; i++) {
            if (parents[i].contractAddress == parentContract &&
                parents[i].tokenId == parentTokenId) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * @notice Check if a token is a derivative
     * @param tokenId Token ID
     * @return True if token has parent NFTs
     */
    function isDerivative(uint256 tokenId) public view returns (bool) {
        _requireOwned(tokenId);
        return _parentNFTs[tokenId].length > 0;
    }

    /**
     * @notice Get complete derivative information
     * @param tokenId Token ID
     * @return DerivativeInfo struct with all derivative data
     */
    function getDerivativeInfo(uint256 tokenId) public view returns (DerivativeInfo memory) {
        _requireOwned(tokenId);
        return _derivativeInfo[tokenId];
    }

    // ============================================
    // COLLABORATION QUERIES
    // ============================================

    /**
     * @notice Get creators for a collaborative token
     * @param tokenId Token ID
     * @return Array of creators with roles and royalty shares
     */
    function getCreators(uint256 tokenId) public view returns (Creator[] memory) {
        _requireOwned(tokenId);
        return _creators[tokenId];
    }

    /**
     * @notice Check if a token is collaborative
     * @param tokenId Token ID
     * @return True if token has multiple creators
     */
    function isCollaborative(uint256 tokenId) public view returns (bool) {
        _requireOwned(tokenId);
        return _creators[tokenId].length > 1;
    }

    /**
     * @notice Calculate royalty distribution for collaborative token
     * @param tokenId Token ID
     * @param salePrice Sale price
     * @return receivers Array of creator addresses
     * @return amounts Array of royalty amounts for each creator
     */
    function calculateRoyaltySplit(uint256 tokenId, uint256 salePrice) 
        public 
        view 
        returns (address[] memory receivers, uint256[] memory amounts) 
    {
        _requireOwned(tokenId);
        Creator[] memory creators = _creators[tokenId];
        
        if (creators.length == 0) {
            // Use default royalty
            (address receiver, uint256 royaltyAmount) = royaltyInfo(tokenId, salePrice);
            receivers = new address[](1);
            amounts = new uint256[](1);
            receivers[0] = receiver;
            amounts[0] = royaltyAmount;
        } else {
            // Split among creators
            receivers = new address[](creators.length);
            amounts = new uint256[](creators.length);
            
            (address defaultReceiver, uint256 totalRoyalty) = royaltyInfo(tokenId, salePrice);
            
            for (uint256 i = 0; i < creators.length; i++) {
                receivers[i] = creators[i].wallet;
                amounts[i] = (totalRoyalty * creators[i].royaltyShare) / 10000;
            }
        }
        
        return (receivers, amounts);
    }

    // ============================================
    // METADATA QUERIES
    // ============================================

    /**
     * @notice Get core metadata for a token
     * @param tokenId Token ID
     * @return Metadata struct containing NFT details
     */
    function getTokenMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        _requireOwned(tokenId);
        return _tokenMetadata[tokenId];
    }

    /**
     * @notice Get all token IDs owned by an address
     * @param owner Address to query
     * @return Array of token IDs
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Pause minting
     * @dev Only callable by owner
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause minting
     * @dev Only callable by owner
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @notice Update default royalty
     * @param receiver Address to receive royalties
     * @param feeNumerator Royalty percentage in basis points (e.g., 500 = 5%)
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        require(receiver != address(0), "KoboNFT: invalid receiver");
        require(feeNumerator <= MAX_ROYALTY, "KoboNFT: royalty too high");
        
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }

    /**
     * @notice Set royalty for a specific token
     * @param tokenId Token ID
     * @param receiver Address to receive royalties
     * @param feeNumerator Royalty percentage in basis points
     */
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) public onlyOwner {
        require(receiver != address(0), "KoboNFT: invalid receiver");
        require(feeNumerator <= MAX_ROYALTY, "KoboNFT: royalty too high");
        
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    /**
     * @notice Get total number of minted tokens
     * @return Total supply
     */
    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice Get contract-level metadata URI for OpenSea
     * @return Contract metadata URI
     */
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    /**
     * @notice Update contract-level metadata URI
     * @param newContractURI New contract metadata URI
     * @dev Only callable by owner
     */
    function setContractURI(string memory newContractURI) public onlyOwner {
        require(bytes(newContractURI).length > 0, "KoboNFT: empty contract URI");
        _contractURI = newContractURI;
    }

    // ============================================
    // REQUIRED OVERRIDES
    // ============================================

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        // ERC-4906 interface support
        if (interfaceId == type(IERC4906).interfaceId) {
            return true;
        }
        return super.supportsInterface(interfaceId);
    }
}
