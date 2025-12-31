// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title KoboNFT (工房 NFT)
 * @notice Multi-modal NFT contract supporting IMAGE, VIDEO, and AUDIO with copyright audit tracking
 * @dev Implements ERC-721, ERC-2981 (royalties), enumerable, and pausable functionality
 */
contract KoboNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981, Ownable, Pausable {
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

    /// @notice NFT metadata structure
    struct NFTMetadata {
        NFTType nftType;
        GenerationMethod generationMethod;
        bytes32 copyrightAuditHash;
        uint256 mintTimestamp;
        address creator;
    }

    /// @notice Token ID counter
    uint256 private _nextTokenId;

    /// @notice Mapping from token ID to metadata
    mapping(uint256 => NFTMetadata) private _tokenMetadata;

    /// @notice Default royalty percentage (5% = 500 basis points)
    uint96 private constant ROYALTY_PERCENTAGE = 500;

    /// @notice Contract-level metadata URI for OpenSea
    string private _contractURI;

    /// @notice Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        NFTType nftType,
        GenerationMethod generationMethod,
        bytes32 copyrightAuditHash,
        string tokenURI
    );

    event RoyaltyUpdated(address indexed receiver, uint96 feeNumerator);

    /**
     * @notice Constructor
     * @param initialOwner Address of the contract owner
     */
    constructor(address initialOwner) 
        ERC721("KoboNFT", "KOBO") 
        Ownable(initialOwner) 
    {
        // Set default royalty to 5% for the owner
        _setDefaultRoyalty(initialOwner, ROYALTY_PERCENTAGE);
        
        // Set default contract URI (can be updated later)
        _contractURI = "https://ipfs.io/ipfs/QmYourCollectionMetadataHash";
    }

    /**
     * @notice Mint a new NFT with metadata
     * @param to Address to mint the NFT to
     * @param uri Token URI (IPFS link to metadata JSON)
     * @param nftType Type of NFT (IMAGE, VIDEO, AUDIO)
     * @param generationMethod How the NFT was created
     * @param copyrightAuditHash Hash for copyright verification
     * @return tokenId The ID of the newly minted token
     */
    function mint(
        address to,
        string memory uri,
        NFTType nftType,
        GenerationMethod generationMethod,
        bytes32 copyrightAuditHash
    ) public whenNotPaused returns (uint256) {
        require(to != address(0), "KoboNFT: mint to zero address");
        require(bytes(uri).length > 0, "KoboNFT: empty URI");
        require(copyrightAuditHash != bytes32(0), "KoboNFT: invalid audit hash");

        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        _tokenMetadata[tokenId] = NFTMetadata({
            nftType: nftType,
            generationMethod: generationMethod,
            copyrightAuditHash: copyrightAuditHash,
            mintTimestamp: block.timestamp,
            creator: msg.sender
        });

        emit NFTMinted(
            tokenId,
            msg.sender,
            nftType,
            generationMethod,
            copyrightAuditHash,
            uri
        );

        return tokenId;
    }

    /**
     * @notice Get metadata for a token
     * @param tokenId Token ID to query
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
        require(feeNumerator <= 10000, "KoboNFT: royalty too high");
        
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
        require(feeNumerator <= 10000, "KoboNFT: royalty too high");
        
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

    // Required overrides for multiple inheritance

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
        return super.supportsInterface(interfaceId);
    }
}
