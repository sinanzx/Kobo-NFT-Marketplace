// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "./KoboNFTExtended.sol";

/**
 * @title KoboTraitMarketplace
 * @notice Marketplace for listing, buying, and trading dynamic NFT traits from KoboNFTExtended
 * @dev Enables trait transfers between NFTs with rarity calculation, ERC-2981 royalties, and ERC-20 support
 */
contract KoboTraitMarketplace is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    /// @notice Listing status enumeration
    enum ListingStatus {
        ACTIVE,
        SOLD,
        CANCELLED,
        EXPIRED
    }

    /// @notice Auction status enumeration
    enum AuctionStatus {
        ACTIVE,
        SETTLED,
        CANCELLED
    }

    /// @notice Trait listing structure
    struct TraitListing {
        uint256 listingId;
        address seller;
        uint256 sourceTokenId;
        uint256 traitIndex;
        string traitName;
        string traitValue;
        uint256 price;
        address paymentToken; // address(0) for native ETH, otherwise ERC-20 token address
        uint256 expirationTime;
        ListingStatus status;
        uint256 createdAt;
    }

    /// @notice Trait rarity data
    struct TraitRarity {
        string traitName;
        string traitValue;
        uint256 occurrences;
        uint256 totalSupply;
        uint256 rarityScore; // 0-10000 (10000 = rarest)
    }

    /// @notice Auction structure for English Auctions
    struct Auction {
        uint256 auctionId;
        address seller;
        uint256 sourceTokenId;
        uint256 traitIndex;
        string traitName;
        string traitValue;
        uint256 startingPrice;
        uint256 currentBid;
        address currentBidder;
        address paymentToken;
        uint256 endTime;
        AuctionStatus status;
        uint256 createdAt;
    }

    /// @notice Reference to KoboNFTExtended contract
    KoboNFTExtended public immutable koboNFT;

    /// @notice Listing ID counter
    uint256 private _nextListingId;

    /// @notice Auction ID counter
    uint256 private _nextAuctionId;

    /// @notice Minimum auction duration (1 hour)
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;

    /// @notice Maximum auction duration (7 days)
    uint256 public constant MAX_AUCTION_DURATION = 7 days;

    /// @notice Minimum bid increment percentage (5%)
    uint256 public constant MIN_BID_INCREMENT = 500; // 5% in basis points

    /// @notice Marketplace fee in basis points (250 = 2.5%)
    uint256 public marketplaceFee = 250;

    /// @notice Maximum marketplace fee (10%)
    uint256 public constant MAX_MARKETPLACE_FEE = 1000;

    /// @notice Minimum listing duration (1 hour)
    uint256 public constant MIN_LISTING_DURATION = 1 hours;

    /// @notice Maximum listing duration (30 days)
    uint256 public constant MAX_LISTING_DURATION = 30 days;

    /// @notice Mapping from listing ID to trait listing
    mapping(uint256 => TraitListing) public listings;

    /// @notice Mapping from token ID to active listing IDs
    mapping(uint256 => uint256[]) private _tokenListings;

    /// @notice Mapping from seller to their listing IDs
    mapping(address => uint256[]) private _sellerListings;

    /// @notice Mapping from auction ID to auction
    mapping(uint256 => Auction) public auctions;

    /// @notice Mapping from token ID to active auction IDs
    mapping(uint256 => uint256[]) private _tokenAuctions;

    /// @notice Mapping from seller to their auction IDs
    mapping(address => uint256[]) private _sellerAuctions;

    /// @notice Mapping to track trait occurrences: traitName => traitValue => count
    mapping(string => mapping(string => uint256)) private _traitOccurrences;

    /// @notice Mapping to track total traits by name
    mapping(string => uint256) private _totalTraitsByName;

    /// @notice Events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 sourceTokenId,
        uint256 traitIndex,
        string traitName,
        string traitValue,
        uint256 price,
        address paymentToken,
        uint256 expirationTime,
        uint256 timestamp
    );

    event ItemSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed nftContract,
        address seller,
        uint256 sourceTokenId,
        uint256 targetTokenId,
        string traitName,
        string traitValue,
        uint256 price,
        uint256 royaltyAmount,
        uint256 marketplaceFeeAmount,
        address paymentToken,
        uint256 timestamp
    );

    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller,
        uint256 indexed sourceTokenId
    );

    event ListingExpired(
        uint256 indexed listingId,
        uint256 indexed sourceTokenId
    );

    event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee);

    event TraitRarityUpdated(
        string indexed traitName,
        string traitValue,
        uint256 occurrences,
        uint256 rarityScore
    );

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address indexed nftContract,
        uint256 sourceTokenId,
        uint256 traitIndex,
        string traitName,
        string traitValue,
        uint256 startingPrice,
        address paymentToken,
        uint256 endTime,
        uint256 timestamp
    );

    event AuctionBid(
        uint256 indexed auctionId,
        address indexed bidder,
        address indexed nftContract,
        uint256 sourceTokenId,
        uint256 bidAmount,
        address paymentToken,
        uint256 timestamp
    );

    event AuctionSettled(
        uint256 indexed auctionId,
        address indexed winner,
        address indexed nftContract,
        address seller,
        uint256 sourceTokenId,
        uint256 targetTokenId,
        string traitName,
        string traitValue,
        uint256 finalBid,
        uint256 royaltyAmount,
        uint256 marketplaceFeeAmount,
        address paymentToken,
        uint256 timestamp
    );

    event AuctionCancelled(
        uint256 indexed auctionId,
        address indexed seller,
        uint256 indexed sourceTokenId
    );

    /**
     * @notice Constructor
     * @param _koboNFT Address of KoboNFTExtended contract
     * @param initialOwner Address of the marketplace owner
     */
    constructor(address _koboNFT, address initialOwner) Ownable(initialOwner) {
        require(_koboNFT != address(0), "Invalid KoboNFT address");
        koboNFT = KoboNFTExtended(_koboNFT);
    }

    // ============================================
    // LISTING FUNCTIONS
    // ============================================

    /**
     * @notice List a trait for sale
     * @param sourceTokenId Token ID containing the trait to sell
     * @param traitIndex Index of the trait in the token's trait array
     * @param price Sale price in wei or token units
     * @param paymentToken Address of ERC-20 token (address(0) for native ETH)
     * @param duration Listing duration in seconds
     * @return listingId The ID of the created listing
     */
    function listTrait(
        uint256 sourceTokenId,
        uint256 traitIndex,
        uint256 price,
        address paymentToken,
        uint256 duration
    ) external whenNotPaused nonReentrant returns (uint256) {
        // Validate ownership
        require(koboNFT.ownerOf(sourceTokenId) == msg.sender, "Not token owner");
        
        // Validate duration
        require(duration >= MIN_LISTING_DURATION, "Duration too short");
        require(duration <= MAX_LISTING_DURATION, "Duration too long");
        
        // Validate price
        require(price > 0, "Price must be greater than 0");

        // Get trait data
        KoboNFTExtended.Trait[] memory traits = koboNFT.getTraits(sourceTokenId);
        require(traitIndex < traits.length, "Invalid trait index");

        KoboNFTExtended.Trait memory trait = traits[traitIndex];

        // Create listing
        uint256 listingId = _nextListingId++;
        uint256 expirationTime = block.timestamp + duration;

        listings[listingId] = TraitListing({
            listingId: listingId,
            seller: msg.sender,
            sourceTokenId: sourceTokenId,
            traitIndex: traitIndex,
            traitName: trait.name,
            traitValue: trait.value,
            price: price,
            paymentToken: paymentToken,
            expirationTime: expirationTime,
            status: ListingStatus.ACTIVE,
            createdAt: block.timestamp
        });

        // Track listing
        _tokenListings[sourceTokenId].push(listingId);
        _sellerListings[msg.sender].push(listingId);

        // Update trait rarity tracking
        _updateTraitRarity(trait.name, trait.value, true);

        emit ListingCreated(
            listingId,
            msg.sender,
            address(koboNFT),
            sourceTokenId,
            traitIndex,
            trait.name,
            trait.value,
            price,
            paymentToken,
            expirationTime,
            block.timestamp
        );

        return listingId;
    }

    /**
     * @notice Buy a listed trait with ERC-2981 royalty enforcement
     * @param listingId ID of the listing to purchase
     * @param targetTokenId Token ID that will receive the trait (for verification only)
     */
    function buyTrait(uint256 listingId, uint256 targetTokenId) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        TraitListing storage listing = listings[listingId];

        // Validate listing
        require(listing.status == ListingStatus.ACTIVE, "Listing not active");
        require(block.timestamp < listing.expirationTime, "Listing expired");

        // Validate buyer owns target token
        require(koboNFT.ownerOf(targetTokenId) == msg.sender, "Not target token owner");
        
        // Validate seller still owns source token
        require(koboNFT.ownerOf(listing.sourceTokenId) == listing.seller, "Seller no longer owns token");

        // Validate trait still exists at the same index
        KoboNFTExtended.Trait[] memory traits = koboNFT.getTraits(listing.sourceTokenId);
        require(listing.traitIndex < traits.length, "Trait no longer exists");
        require(
            keccak256(bytes(traits[listing.traitIndex].name)) == keccak256(bytes(listing.traitName)),
            "Trait changed"
        );

        // Calculate ERC-2981 royalty
        (address royaltyReceiver, uint256 royaltyAmount) = IERC2981(address(koboNFT)).royaltyInfo(
            listing.sourceTokenId,
            listing.price
        );

        // Calculate marketplace fee
        uint256 feeAmount = (listing.price * marketplaceFee) / 10000;
        
        // Calculate seller amount after royalty and fee
        uint256 sellerAmount = listing.price - royaltyAmount - feeAmount;
        require(sellerAmount > 0, "Invalid payment distribution");

        // Update listing status
        listing.status = ListingStatus.SOLD;

        // Process payment based on payment token
        if (listing.paymentToken == address(0)) {
            // Native ETH payment
            require(msg.value == listing.price, "Incorrect ETH amount");
            
            // Transfer royalty to creator
            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                (bool royaltySuccess, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
                require(royaltySuccess, "Royalty payment failed");
            }
            
            // Transfer payment to seller
            (bool sellerSuccess, ) = payable(listing.seller).call{value: sellerAmount}("");
            require(sellerSuccess, "Seller payment failed");
            
            // Fee stays in contract
        } else {
            // ERC-20 token payment
            IERC20 token = IERC20(listing.paymentToken);
            
            // Transfer royalty to creator
            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                token.safeTransferFrom(msg.sender, royaltyReceiver, royaltyAmount);
            }
            
            // Transfer payment to seller
            token.safeTransferFrom(msg.sender, listing.seller, sellerAmount);
            
            // Transfer fee to contract
            token.safeTransferFrom(msg.sender, address(this), feeAmount);
        }

        emit ItemSold(
            listingId,
            msg.sender,
            address(koboNFT),
            listing.seller,
            listing.sourceTokenId,
            targetTokenId,
            listing.traitName,
            listing.traitValue,
            listing.price,
            royaltyAmount,
            feeAmount,
            listing.paymentToken,
            block.timestamp
        );
    }

    /**
     * @notice Cancel an active listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        TraitListing storage listing = listings[listingId];

        // Validate caller is seller
        require(listing.seller == msg.sender, "Not listing seller");
        
        // Validate listing is active
        require(listing.status == ListingStatus.ACTIVE, "Listing not active");

        // Update status
        listing.status = ListingStatus.CANCELLED;

        // Update trait rarity tracking
        _updateTraitRarity(listing.traitName, listing.traitValue, false);

        emit ListingCancelled(listingId, msg.sender, listing.sourceTokenId);
    }

    /**
     * @notice Mark expired listings (callable by anyone)
     * @param listingIds Array of listing IDs to check for expiration
     */
    function markExpiredListings(uint256[] calldata listingIds) external {
        for (uint256 i = 0; i < listingIds.length; i++) {
            TraitListing storage listing = listings[listingIds[i]];
            
            if (
                listing.status == ListingStatus.ACTIVE &&
                block.timestamp >= listing.expirationTime
            ) {
                listing.status = ListingStatus.EXPIRED;
                
                // Update trait rarity tracking
                _updateTraitRarity(listing.traitName, listing.traitValue, false);
                
                emit ListingExpired(listingIds[i], listing.sourceTokenId);
            }
        }
    }

    // ============================================
    // RARITY CALCULATION
    // ============================================

    /**
     * @notice Calculate trait rarity based on distribution
     * @param traitName Name of the trait
     * @param traitValue Value of the trait
     * @return rarity Trait rarity data
     */
    function calculateTraitRarity(string memory traitName, string memory traitValue)
        public
        view
        returns (TraitRarity memory rarity)
    {
        uint256 occurrences = _traitOccurrences[traitName][traitValue];
        uint256 totalSupply = koboNFT.totalMinted();
        uint256 totalTraits = _totalTraitsByName[traitName];

        // Calculate rarity score (0-10000, where 10000 is rarest)
        uint256 rarityScore = 0;
        if (totalTraits > 0) {
            if (occurrences == 0) {
                rarityScore = 10000; // Unique trait
            } else {
                // Inverse proportion: fewer occurrences = higher rarity
                rarityScore = 10000 - ((occurrences * 10000) / totalTraits);
            }
        }

        rarity = TraitRarity({
            traitName: traitName,
            traitValue: traitValue,
            occurrences: occurrences,
            totalSupply: totalSupply,
            rarityScore: rarityScore
        });

        return rarity;
    }

    /**
     * @notice Get rarity for multiple traits
     * @param traitNames Array of trait names
     * @param traitValues Array of trait values
     * @return rarities Array of trait rarity data
     */
    function batchCalculateRarity(
        string[] memory traitNames,
        string[] memory traitValues
    ) external view returns (TraitRarity[] memory rarities) {
        require(traitNames.length == traitValues.length, "Array length mismatch");
        
        rarities = new TraitRarity[](traitNames.length);
        for (uint256 i = 0; i < traitNames.length; i++) {
            rarities[i] = calculateTraitRarity(traitNames[i], traitValues[i]);
        }
        
        return rarities;
    }

    /**
     * @notice Update trait rarity tracking
     * @param traitName Name of the trait
     * @param traitValue Value of the trait
     * @param isAdding True if adding to marketplace, false if removing
     */
    function _updateTraitRarity(
        string memory traitName,
        string memory traitValue,
        bool isAdding
    ) private {
        if (isAdding) {
            _traitOccurrences[traitName][traitValue]++;
            _totalTraitsByName[traitName]++;
        } else {
            if (_traitOccurrences[traitName][traitValue] > 0) {
                _traitOccurrences[traitName][traitValue]--;
            }
            if (_totalTraitsByName[traitName] > 0) {
                _totalTraitsByName[traitName]--;
            }
        }

        // Calculate and emit updated rarity
        TraitRarity memory rarity = calculateTraitRarity(traitName, traitValue);
        emit TraitRarityUpdated(
            traitName,
            traitValue,
            rarity.occurrences,
            rarity.rarityScore
        );
    }

    // ============================================
    // QUERY FUNCTIONS
    // ============================================

    /**
     * @notice Get listing details
     * @param listingId ID of the listing
     * @return listing Trait listing data
     */
    function getListing(uint256 listingId) external view returns (TraitListing memory) {
        return listings[listingId];
    }

    /**
     * @notice Get all active listings
     * @return activeListings Array of active trait listings
     */
    function getActiveListings() external view returns (TraitListing[] memory activeListings) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 0; i < _nextListingId; i++) {
            if (
                listings[i].status == ListingStatus.ACTIVE &&
                block.timestamp < listings[i].expirationTime
            ) {
                activeCount++;
            }
        }

        // Populate array
        activeListings = new TraitListing[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _nextListingId; i++) {
            if (
                listings[i].status == ListingStatus.ACTIVE &&
                block.timestamp < listings[i].expirationTime
            ) {
                activeListings[index] = listings[i];
                index++;
            }
        }

        return activeListings;
    }

    /**
     * @notice Get listings for a specific token
     * @param tokenId Token ID
     * @return tokenListings Array of listing IDs for the token
     */
    function getTokenListings(uint256 tokenId) external view returns (uint256[] memory) {
        return _tokenListings[tokenId];
    }

    /**
     * @notice Get listings by a specific seller
     * @param seller Seller address
     * @return sellerListings Array of listing IDs by the seller
     */
    function getSellerListings(address seller) external view returns (uint256[] memory) {
        return _sellerListings[seller];
    }

    /**
     * @notice Get listings by trait name
     * @param traitName Name of the trait to search for
     * @return matchingListings Array of listings with the specified trait name
     */
    function getListingsByTraitName(string memory traitName) 
        external 
        view 
        returns (TraitListing[] memory matchingListings) 
    {
        uint256 matchCount = 0;
        
        // Count matching listings
        for (uint256 i = 0; i < _nextListingId; i++) {
            if (
                listings[i].status == ListingStatus.ACTIVE &&
                block.timestamp < listings[i].expirationTime &&
                keccak256(bytes(listings[i].traitName)) == keccak256(bytes(traitName))
            ) {
                matchCount++;
            }
        }

        // Populate array
        matchingListings = new TraitListing[](matchCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _nextListingId; i++) {
            if (
                listings[i].status == ListingStatus.ACTIVE &&
                block.timestamp < listings[i].expirationTime &&
                keccak256(bytes(listings[i].traitName)) == keccak256(bytes(traitName))
            ) {
                matchingListings[index] = listings[i];
                index++;
            }
        }

        return matchingListings;
    }

    /**
     * @notice Get total number of listings created
     * @return Total listing count
     */
    function totalListings() external view returns (uint256) {
        return _nextListingId;
    }

    /**
     * @notice Check if a listing is active and not expired
     * @param listingId ID of the listing
     * @return True if listing is active and not expired
     */
    function isListingActive(uint256 listingId) external view returns (bool) {
        TraitListing memory listing = listings[listingId];
        return listing.status == ListingStatus.ACTIVE && block.timestamp < listing.expirationTime;
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Update marketplace fee
     * @param newFee New fee in basis points (e.g., 250 = 2.5%)
     */
    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_MARKETPLACE_FEE, "Fee too high");
        
        uint256 oldFee = marketplaceFee;
        marketplaceFee = newFee;
        
        emit MarketplaceFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Pause marketplace operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause marketplace operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Bulk buy multiple traits in one transaction
     * @param listingIds Array of listing IDs to purchase
     * @param targetTokenIds Array of target token IDs (must match listingIds length)
     */
    function bulkBuyTraits(uint256[] calldata listingIds, uint256[] calldata targetTokenIds)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        require(listingIds.length == targetTokenIds.length, "Array length mismatch");
        require(listingIds.length > 0, "Empty arrays");

        uint256 totalEthRequired = 0;

        // First pass: validate all listings and calculate total ETH needed
        for (uint256 i = 0; i < listingIds.length; i++) {
            TraitListing storage listing = listings[listingIds[i]];
            
            require(listing.status == ListingStatus.ACTIVE, "Listing not active");
            require(block.timestamp < listing.expirationTime, "Listing expired");
            require(koboNFT.ownerOf(targetTokenIds[i]) == msg.sender, "Not target token owner");
            require(koboNFT.ownerOf(listing.sourceTokenId) == listing.seller, "Seller no longer owns token");
            
            if (listing.paymentToken == address(0)) {
                totalEthRequired += listing.price;
            }
        }

        // Validate total ETH sent
        require(msg.value == totalEthRequired, "Incorrect total ETH amount");

        // Second pass: execute all purchases
        for (uint256 i = 0; i < listingIds.length; i++) {
            _executeBulkPurchase(listingIds[i], targetTokenIds[i]);
        }
    }

    /**
     * @notice Internal function to execute a single purchase in bulk buy
     * @param listingId ID of the listing to purchase
     * @param targetTokenId Token ID that will receive the trait
     */
    function _executeBulkPurchase(uint256 listingId, uint256 targetTokenId) private {
        TraitListing storage listing = listings[listingId];

        // Validate trait still exists
        KoboNFTExtended.Trait[] memory traits = koboNFT.getTraits(listing.sourceTokenId);
        require(listing.traitIndex < traits.length, "Trait no longer exists");
        require(
            keccak256(bytes(traits[listing.traitIndex].name)) == keccak256(bytes(listing.traitName)),
            "Trait changed"
        );

        // Calculate ERC-2981 royalty
        (address royaltyReceiver, uint256 royaltyAmount) = IERC2981(address(koboNFT)).royaltyInfo(
            listing.sourceTokenId,
            listing.price
        );

        // Calculate marketplace fee
        uint256 feeAmount = (listing.price * marketplaceFee) / 10000;
        uint256 sellerAmount = listing.price - royaltyAmount - feeAmount;

        // Update listing status
        listing.status = ListingStatus.SOLD;

        // Process payment
        if (listing.paymentToken == address(0)) {
            // Native ETH payment
            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                (bool royaltySuccess, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
                require(royaltySuccess, "Royalty payment failed");
            }
            
            (bool sellerSuccess, ) = payable(listing.seller).call{value: sellerAmount}("");
            require(sellerSuccess, "Seller payment failed");
        } else {
            // ERC-20 token payment
            IERC20 token = IERC20(listing.paymentToken);
            
            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                token.safeTransferFrom(msg.sender, royaltyReceiver, royaltyAmount);
            }
            
            token.safeTransferFrom(msg.sender, listing.seller, sellerAmount);
            token.safeTransferFrom(msg.sender, address(this), feeAmount);
        }

        emit ItemSold(
            listingId,
            msg.sender,
            address(koboNFT),
            listing.seller,
            listing.sourceTokenId,
            targetTokenId,
            listing.traitName,
            listing.traitValue,
            listing.price,
            royaltyAmount,
            feeAmount,
            listing.paymentToken,
            block.timestamp
        );
    }

    /**
     * @notice Emergency withdrawal for native ETH (only for stuck funds)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Emergency withdrawal for ERC-20 tokens
     * @param token Address of the ERC-20 token to withdraw
     */
    function emergencyWithdrawToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        
        IERC20 erc20 = IERC20(token);
        uint256 balance = erc20.balanceOf(address(this));
        require(balance > 0, "No token balance to withdraw");
        
        erc20.safeTransfer(owner(), balance);
    }

    // ============================================
    // AUCTION FUNCTIONS (LIQUIDITY ENGINE)
    // ============================================

    /**
     * @notice Create an English Auction for a trait
     * @param sourceTokenId Token ID containing the trait to auction
     * @param traitIndex Index of the trait in the token's trait array
     * @param startingPrice Minimum starting bid
     * @param paymentToken Address of ERC-20 token (address(0) for native ETH)
     * @param duration Auction duration in seconds
     * @return auctionId The ID of the created auction
     */
    function createAuction(
        uint256 sourceTokenId,
        uint256 traitIndex,
        uint256 startingPrice,
        address paymentToken,
        uint256 duration
    ) external whenNotPaused nonReentrant returns (uint256) {
        // Validate ownership
        require(koboNFT.ownerOf(sourceTokenId) == msg.sender, "Not token owner");
        
        // Validate duration
        require(duration >= MIN_AUCTION_DURATION, "Duration too short");
        require(duration <= MAX_AUCTION_DURATION, "Duration too long");
        
        // Validate starting price
        require(startingPrice > 0, "Starting price must be greater than 0");

        // Get trait data
        KoboNFTExtended.Trait[] memory traits = koboNFT.getTraits(sourceTokenId);
        require(traitIndex < traits.length, "Invalid trait index");

        KoboNFTExtended.Trait memory trait = traits[traitIndex];

        // Create auction
        uint256 auctionId = _nextAuctionId++;
        uint256 endTime = block.timestamp + duration;

        auctions[auctionId] = Auction({
            auctionId: auctionId,
            seller: msg.sender,
            sourceTokenId: sourceTokenId,
            traitIndex: traitIndex,
            traitName: trait.name,
            traitValue: trait.value,
            startingPrice: startingPrice,
            currentBid: 0,
            currentBidder: address(0),
            paymentToken: paymentToken,
            endTime: endTime,
            status: AuctionStatus.ACTIVE,
            createdAt: block.timestamp
        });

        // Track auction
        _tokenAuctions[sourceTokenId].push(auctionId);
        _sellerAuctions[msg.sender].push(auctionId);

        emit AuctionCreated(
            auctionId,
            msg.sender,
            address(koboNFT),
            sourceTokenId,
            traitIndex,
            trait.name,
            trait.value,
            startingPrice,
            paymentToken,
            endTime,
            block.timestamp
        );

        return auctionId;
    }

    /**
     * @notice Place a bid on an active auction
     * @param auctionId ID of the auction
     * @param bidAmount Amount to bid (must be higher than current bid + minimum increment)
     */
    function placeBid(uint256 auctionId, uint256 bidAmount)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        Auction storage auction = auctions[auctionId];

        // Validate auction
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");

        // Validate bid amount
        uint256 minBid = auction.currentBid == 0 
            ? auction.startingPrice 
            : auction.currentBid + ((auction.currentBid * MIN_BID_INCREMENT) / 10000);
        
        require(bidAmount >= minBid, "Bid too low");

        // Process payment based on payment token
        if (auction.paymentToken == address(0)) {
            // Native ETH bid
            require(msg.value == bidAmount, "Incorrect ETH amount");
            
            // Refund previous bidder
            if (auction.currentBidder != address(0)) {
                (bool refundSuccess, ) = payable(auction.currentBidder).call{value: auction.currentBid}("");
                require(refundSuccess, "Refund failed");
            }
        } else {
            // ERC-20 token bid
            IERC20 token = IERC20(auction.paymentToken);
            
            // Transfer new bid to contract
            token.safeTransferFrom(msg.sender, address(this), bidAmount);
            
            // Refund previous bidder
            if (auction.currentBidder != address(0)) {
                token.safeTransfer(auction.currentBidder, auction.currentBid);
            }
        }

        // Update auction state
        auction.currentBid = bidAmount;
        auction.currentBidder = msg.sender;

        emit AuctionBid(
            auctionId,
            msg.sender,
            address(koboNFT),
            auction.sourceTokenId,
            bidAmount,
            auction.paymentToken,
            block.timestamp
        );
    }

    /**
     * @notice Settle an ended auction and distribute funds
     * @param auctionId ID of the auction to settle
     * @param targetTokenId Token ID that will receive the trait (only if there's a winner)
     */
    function settleAuction(uint256 auctionId, uint256 targetTokenId)
        external
        whenNotPaused
        nonReentrant
    {
        Auction storage auction = auctions[auctionId];

        // Validate auction
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        // Validate seller still owns source token
        require(koboNFT.ownerOf(auction.sourceTokenId) == auction.seller, "Seller no longer owns token");

        // Validate trait still exists
        KoboNFTExtended.Trait[] memory traits = koboNFT.getTraits(auction.sourceTokenId);
        require(auction.traitIndex < traits.length, "Trait no longer exists");
        require(
            keccak256(bytes(traits[auction.traitIndex].name)) == keccak256(bytes(auction.traitName)),
            "Trait changed"
        );

        // Update auction status
        auction.status = AuctionStatus.SETTLED;

        // If there's a winner, process payment
        if (auction.currentBidder != address(0)) {
            // Validate winner owns target token
            require(koboNFT.ownerOf(targetTokenId) == auction.currentBidder, "Winner doesn't own target token");

            // Calculate ERC-2981 royalty
            (address royaltyReceiver, uint256 royaltyAmount) = IERC2981(address(koboNFT)).royaltyInfo(
                auction.sourceTokenId,
                auction.currentBid
            );

            // Calculate marketplace fee
            uint256 feeAmount = (auction.currentBid * marketplaceFee) / 10000;
            uint256 sellerAmount = auction.currentBid - royaltyAmount - feeAmount;

            // Distribute funds
            if (auction.paymentToken == address(0)) {
                // Native ETH payment
                if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                    (bool royaltySuccess, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
                    require(royaltySuccess, "Royalty payment failed");
                }
                
                (bool sellerSuccess, ) = payable(auction.seller).call{value: sellerAmount}("");
                require(sellerSuccess, "Seller payment failed");
            } else {
                // ERC-20 token payment
                IERC20 token = IERC20(auction.paymentToken);
                
                if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                    token.safeTransfer(royaltyReceiver, royaltyAmount);
                }
                
                token.safeTransfer(auction.seller, sellerAmount);
            }

            emit AuctionSettled(
                auctionId,
                auction.currentBidder,
                address(koboNFT),
                auction.seller,
                auction.sourceTokenId,
                targetTokenId,
                auction.traitName,
                auction.traitValue,
                auction.currentBid,
                royaltyAmount,
                feeAmount,
                auction.paymentToken,
                block.timestamp
            );
        } else {
            // No bids - auction ended without winner
            emit AuctionSettled(
                auctionId,
                address(0),
                address(koboNFT),
                auction.seller,
                auction.sourceTokenId,
                0,
                auction.traitName,
                auction.traitValue,
                0,
                0,
                0,
                auction.paymentToken,
                block.timestamp
            );
        }
    }

    /**
     * @notice Cancel an active auction (only if no bids placed)
     * @param auctionId ID of the auction to cancel
     */
    function cancelAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];

        // Validate caller is seller
        require(auction.seller == msg.sender, "Not auction seller");
        
        // Validate auction is active
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        
        // Can only cancel if no bids placed
        require(auction.currentBidder == address(0), "Cannot cancel auction with bids");

        // Update status
        auction.status = AuctionStatus.CANCELLED;

        emit AuctionCancelled(auctionId, msg.sender, auction.sourceTokenId);
    }

    /**
     * @notice Get auction details
     * @param auctionId ID of the auction
     * @return auction Auction data
     */
    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }

    /**
     * @notice Get all active auctions
     * @return activeAuctions Array of active auctions
     */
    function getActiveAuctions() external view returns (Auction[] memory activeAuctions) {
        uint256 activeCount = 0;
        
        // Count active auctions
        for (uint256 i = 0; i < _nextAuctionId; i++) {
            if (
                auctions[i].status == AuctionStatus.ACTIVE &&
                block.timestamp < auctions[i].endTime
            ) {
                activeCount++;
            }
        }

        // Populate array
        activeAuctions = new Auction[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _nextAuctionId; i++) {
            if (
                auctions[i].status == AuctionStatus.ACTIVE &&
                block.timestamp < auctions[i].endTime
            ) {
                activeAuctions[index] = auctions[i];
                index++;
            }
        }

        return activeAuctions;
    }

    /**
     * @notice Get auctions for a specific token
     * @param tokenId Token ID
     * @return tokenAuctions Array of auction IDs for the token
     */
    function getTokenAuctions(uint256 tokenId) external view returns (uint256[] memory) {
        return _tokenAuctions[tokenId];
    }

    /**
     * @notice Get auctions by a specific seller
     * @param seller Seller address
     * @return sellerAuctions Array of auction IDs by the seller
     */
    function getSellerAuctions(address seller) external view returns (uint256[] memory) {
        return _sellerAuctions[seller];
    }

    /**
     * @notice Receive function to accept ETH from buyTrait and auctions
     */
    receive() external payable {}
}
