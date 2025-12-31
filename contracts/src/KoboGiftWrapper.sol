// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KoboGiftWrapper
 * @notice NFT gifting system for wrapping and unwrapping KoboNFT tokens as gifts
 * @dev Supports single and batch gifting with encrypted messages
 */
contract KoboGiftWrapper is Ownable, Pausable, ReentrancyGuard {
    /// @notice Gift status enumeration
    enum GiftStatus {
        WRAPPED,
        UNWRAPPED,
        CANCELLED
    }

    /// @notice Gift metadata structure
    struct Gift {
        uint256 giftId;
        address nftContract;
        uint256 tokenId;
        address sender;
        address recipient;
        string message; // Encrypted message or IPFS hash
        uint256 wrappedAt;
        uint256 unwrappedAt;
        GiftStatus status;
    }

    /// @notice Gift ID counter
    uint256 private _nextGiftId;

    /// @notice Mapping from gift ID to gift data
    mapping(uint256 => Gift) private _gifts;

    /// @notice Mapping from recipient to their pending gift IDs
    mapping(address => uint256[]) private _recipientGifts;

    /// @notice Mapping to track if a token is already wrapped
    mapping(address => mapping(uint256 => bool)) private _isTokenWrapped;

    /// @notice Mapping from NFT contract + tokenId to gift ID
    mapping(address => mapping(uint256 => uint256)) private _tokenToGiftId;

    /// @notice Supported NFT contracts
    mapping(address => bool) public supportedContracts;

    /// @notice Events
    event GiftWrapped(
        uint256 indexed giftId,
        address indexed sender,
        address indexed recipient,
        address nftContract,
        uint256 tokenId,
        string message
    );

    event GiftUnwrapped(
        uint256 indexed giftId,
        address indexed recipient,
        address nftContract,
        uint256 tokenId
    );

    event GiftCancelled(
        uint256 indexed giftId,
        address indexed sender,
        address nftContract,
        uint256 tokenId
    );

    event BatchGiftsWrapped(
        uint256[] giftIds,
        address indexed sender,
        address[] recipients,
        uint256 count
    );

    event ContractSupportUpdated(address indexed nftContract, bool supported);

    /**
     * @notice Constructor
     * @param initialOwner Address of the contract owner
     * @param _supportedContracts Array of supported NFT contract addresses
     */
    constructor(address initialOwner, address[] memory _supportedContracts) Ownable(initialOwner) {
        for (uint256 i = 0; i < _supportedContracts.length; i++) {
            supportedContracts[_supportedContracts[i]] = true;
            emit ContractSupportUpdated(_supportedContracts[i], true);
        }
    }

    /**
     * @notice Wrap an NFT as a gift
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to wrap
     * @param recipient Address of the gift recipient
     * @param message Encrypted message or IPFS hash
     * @return giftId The ID of the created gift
     */
    function wrapGift(
        address nftContract,
        uint256 tokenId,
        address recipient,
        string memory message
    ) public whenNotPaused returns (uint256) {
        return _wrapGift(nftContract, tokenId, recipient, message);
    }

    /**
     * @notice Internal function to wrap an NFT as a gift
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to wrap
     * @param recipient Address of the gift recipient
     * @param message Encrypted message or IPFS hash
     * @return giftId The ID of the created gift
     */
    function _wrapGift(
        address nftContract,
        uint256 tokenId,
        address recipient,
        string memory message
    ) internal returns (uint256) {
        require(supportedContracts[nftContract], "KoboGiftWrapper: unsupported NFT contract");
        require(recipient != address(0), "KoboGiftWrapper: invalid recipient");
        require(recipient != msg.sender, "KoboGiftWrapper: cannot gift to yourself");
        require(!_isTokenWrapped[nftContract][tokenId], "KoboGiftWrapper: token already wrapped");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "KoboGiftWrapper: not token owner");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)),
            "KoboGiftWrapper: contract not approved"
        );

        // Transfer NFT to this contract
        nft.transferFrom(msg.sender, address(this), tokenId);

        uint256 giftId = _nextGiftId++;

        _gifts[giftId] = Gift({
            giftId: giftId,
            nftContract: nftContract,
            tokenId: tokenId,
            sender: msg.sender,
            recipient: recipient,
            message: message,
            wrappedAt: block.timestamp,
            unwrappedAt: 0,
            status: GiftStatus.WRAPPED
        });

        _recipientGifts[recipient].push(giftId);
        _isTokenWrapped[nftContract][tokenId] = true;
        _tokenToGiftId[nftContract][tokenId] = giftId;

        emit GiftWrapped(giftId, msg.sender, recipient, nftContract, tokenId, message);

        return giftId;
    }

    /**
     * @notice Unwrap a gift (recipient only)
     * @param giftId ID of the gift to unwrap
     */
    function unwrapGift(uint256 giftId) public whenNotPaused nonReentrant {
        Gift storage gift = _gifts[giftId];
        
        require(gift.giftId == giftId, "KoboGiftWrapper: gift does not exist");
        require(gift.recipient == msg.sender, "KoboGiftWrapper: not the recipient");
        require(gift.status == GiftStatus.WRAPPED, "KoboGiftWrapper: gift not wrapped");

        gift.status = GiftStatus.UNWRAPPED;
        gift.unwrappedAt = block.timestamp;
        _isTokenWrapped[gift.nftContract][gift.tokenId] = false;

        // Transfer NFT to recipient
        IERC721(gift.nftContract).transferFrom(address(this), msg.sender, gift.tokenId);

        emit GiftUnwrapped(giftId, msg.sender, gift.nftContract, gift.tokenId);
    }

    /**
     * @notice Cancel a gift and return NFT to sender
     * @param giftId ID of the gift to cancel
     */
    function cancelGift(uint256 giftId) public nonReentrant {
        Gift storage gift = _gifts[giftId];
        
        require(gift.giftId == giftId, "KoboGiftWrapper: gift does not exist");
        require(gift.sender == msg.sender, "KoboGiftWrapper: not the sender");
        require(gift.status == GiftStatus.WRAPPED, "KoboGiftWrapper: gift not wrapped");

        gift.status = GiftStatus.CANCELLED;
        _isTokenWrapped[gift.nftContract][gift.tokenId] = false;

        // Return NFT to sender
        IERC721(gift.nftContract).transferFrom(address(this), msg.sender, gift.tokenId);

        emit GiftCancelled(giftId, msg.sender, gift.nftContract, gift.tokenId);
    }

    /**
     * @notice Batch wrap multiple NFTs as gifts
     * @param nftContracts Array of NFT contract addresses
     * @param tokenIds Array of token IDs to wrap
     * @param recipients Array of recipient addresses
     * @param messages Array of encrypted messages or IPFS hashes
     * @return giftIds Array of created gift IDs
     */
    function batchWrapGifts(
        address[] memory nftContracts,
        uint256[] memory tokenIds,
        address[] memory recipients,
        string[] memory messages
    ) public whenNotPaused returns (uint256[] memory) {
        require(nftContracts.length == tokenIds.length, "KoboGiftWrapper: length mismatch");
        require(nftContracts.length == recipients.length, "KoboGiftWrapper: length mismatch");
        require(nftContracts.length == messages.length, "KoboGiftWrapper: length mismatch");
        require(nftContracts.length > 0, "KoboGiftWrapper: empty arrays");

        uint256[] memory giftIds = new uint256[](nftContracts.length);

        for (uint256 i = 0; i < nftContracts.length; i++) {
            giftIds[i] = _wrapGift(nftContracts[i], tokenIds[i], recipients[i], messages[i]);
        }

        emit BatchGiftsWrapped(giftIds, msg.sender, recipients, nftContracts.length);

        return giftIds;
    }

    /**
     * @notice Get gift details
     * @param giftId ID of the gift
     * @return Gift struct containing all gift metadata
     */
    function getGiftDetails(uint256 giftId) public view returns (Gift memory) {
        require(_gifts[giftId].giftId == giftId, "KoboGiftWrapper: gift does not exist");
        return _gifts[giftId];
    }

    /**
     * @notice Get all pending gifts for a recipient
     * @param recipient Address of the recipient
     * @return Array of gift IDs
     */
    function getPendingGifts(address recipient) public view returns (uint256[] memory) {
        uint256[] memory allGifts = _recipientGifts[recipient];
        uint256 pendingCount = 0;

        // Count pending gifts
        for (uint256 i = 0; i < allGifts.length; i++) {
            if (_gifts[allGifts[i]].status == GiftStatus.WRAPPED) {
                pendingCount++;
            }
        }

        // Create array of pending gift IDs
        uint256[] memory pendingGifts = new uint256[](pendingCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allGifts.length; i++) {
            if (_gifts[allGifts[i]].status == GiftStatus.WRAPPED) {
                pendingGifts[index] = allGifts[i];
                index++;
            }
        }

        return pendingGifts;
    }

    /**
     * @notice Get all gifts for a recipient (including unwrapped and cancelled)
     * @param recipient Address of the recipient
     * @return Array of gift IDs
     */
    function getAllGifts(address recipient) public view returns (uint256[] memory) {
        return _recipientGifts[recipient];
    }

    /**
     * @notice Check if a token is currently wrapped
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to check
     * @return True if the token is wrapped
     */
    function isTokenWrapped(address nftContract, uint256 tokenId) public view returns (bool) {
        return _isTokenWrapped[nftContract][tokenId];
    }

    /**
     * @notice Get gift ID for a wrapped token
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID
     * @return Gift ID (0 if not wrapped)
     */
    function getGiftIdByToken(address nftContract, uint256 tokenId) public view returns (uint256) {
        return _tokenToGiftId[nftContract][tokenId];
    }

    /**
     * @notice Get total number of gifts created
     * @return Total gift count
     */
    function totalGifts() public view returns (uint256) {
        return _nextGiftId;
    }

    /**
     * @notice Add or remove supported NFT contract
     * @param nftContract Address of the NFT contract
     * @param supported True to support, false to remove support
     */
    function setSupportedContract(address nftContract, bool supported) public onlyOwner {
        require(nftContract != address(0), "KoboGiftWrapper: invalid contract address");
        supportedContracts[nftContract] = supported;
        emit ContractSupportUpdated(nftContract, supported);
    }

    /**
     * @notice Pause the contract
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency function to recover stuck NFTs (only owner)
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to recover
     * @param to Address to send the NFT to
     */
    function emergencyRecoverNFT(
        address nftContract,
        uint256 tokenId,
        address to
    ) public onlyOwner {
        require(to != address(0), "KoboGiftWrapper: invalid recipient");
        IERC721(nftContract).transferFrom(address(this), to, tokenId);
    }
}
