// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import "../src/KoboNFTExtended.sol";
import "../src/KoboTraitMarketplace.sol";

contract KoboTraitMarketplaceTest is Test {
    // Receive function to accept ETH from emergency withdraw
    receive() external payable {}
    KoboNFTExtended public koboNFT;
    KoboTraitMarketplace public marketplace;

    address public owner;
    address public seller;
    address public buyer;
    address public user1;
    address public user2;

    uint256 public tokenId1;
    uint256 public tokenId2;
    uint256 public tokenId3;

    // Events to test
    event TraitListed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 indexed sourceTokenId,
        uint256 traitIndex,
        string traitName,
        string traitValue,
        uint256 price,
        uint256 expirationTime
    );

    event TraitPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 sourceTokenId,
        uint256 targetTokenId,
        string traitName,
        string traitValue,
        uint256 price,
        uint256 marketplaceFeeAmount
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

    function setUp() public {
        // Initialize test addresses
        owner = address(this);
        seller = makeAddr("seller");
        buyer = makeAddr("buyer");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Fund test accounts
        vm.deal(seller, 100 ether);
        vm.deal(buyer, 100 ether);
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);

        // Deploy contracts
        koboNFT = new KoboNFTExtended(owner);
        marketplace = new KoboTraitMarketplace(address(koboNFT), owner);

        // Mint test NFTs
        vm.startPrank(seller);
        tokenId1 = koboNFT.mint(
            seller,
            "ipfs://token1",
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            keccak256("content1"),
            keccak256("c2pa1"),
            keccak256("audit1")
        );

        // Add traits to token1
        koboNFT.addTrait(tokenId1, "Background", "Sunset");
        koboNFT.addTrait(tokenId1, "Rarity", "Legendary");
        koboNFT.addTrait(tokenId1, "Power", "Fire");
        vm.stopPrank();

        // Mint NFT for buyer
        vm.startPrank(buyer);
        tokenId2 = koboNFT.mint(
            buyer,
            "ipfs://token2",
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            keccak256("content2"),
            keccak256("c2pa2"),
            keccak256("audit2")
        );
        vm.stopPrank();

        // Mint NFT for user1
        vm.startPrank(user1);
        tokenId3 = koboNFT.mint(
            user1,
            "ipfs://token3",
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            keccak256("content3"),
            keccak256("c2pa3"),
            keccak256("audit3")
        );
        vm.stopPrank();
    }

    // ============================================
    // HAPPY PATH TESTS
    // ============================================

    function testListTrait() public {
        vm.startPrank(seller);
        
        uint256 price = 1 ether;
        uint256 duration = 7 days;
        
        vm.expectEmit(true, true, true, true);
        emit TraitListed(
            0,
            seller,
            tokenId1,
            0,
            "Background",
            "Sunset",
            price,
            block.timestamp + duration
        );

        uint256 listingId = marketplace.listTrait(tokenId1, 0, price, duration);
        
        assertEq(listingId, 0, "First listing should have ID 0");
        
        KoboTraitMarketplace.TraitListing memory listing = marketplace.getListing(listingId);
        assertEq(listing.seller, seller, "Seller mismatch");
        assertEq(listing.sourceTokenId, tokenId1, "Token ID mismatch");
        assertEq(listing.traitIndex, 0, "Trait index mismatch");
        assertEq(listing.traitName, "Background", "Trait name mismatch");
        assertEq(listing.traitValue, "Sunset", "Trait value mismatch");
        assertEq(listing.price, price, "Price mismatch");
        assertEq(uint256(listing.status), uint256(KoboTraitMarketplace.ListingStatus.ACTIVE), "Status should be ACTIVE");
        
        vm.stopPrank();
    }

    function testBuyTrait() public {
        // List trait
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        // Get initial balances
        uint256 sellerBalanceBefore = seller.balance;
        uint256 ownerBalanceBefore = owner.balance;

        // Buy trait
        vm.startPrank(buyer);
        
        vm.expectEmit(true, true, true, true);
        emit TraitPurchased(
            listingId,
            buyer,
            seller,
            tokenId1,
            tokenId2,
            "Background",
            "Sunset",
            1 ether,
            0.025 ether // 2.5% fee
        );

        marketplace.buyTrait{value: 1 ether}(listingId, tokenId2);
        
        // Buyer manually adds the trait to their NFT
        koboNFT.addTrait(tokenId2, "Background", "Sunset");
        vm.stopPrank();

        // Verify trait was added to buyer's NFT
        KoboNFTExtended.Trait[] memory traits = koboNFT.getTraits(tokenId2);
        assertEq(traits.length, 1, "Buyer should have 1 trait");
        assertEq(traits[0].name, "Background", "Trait name mismatch");
        assertEq(traits[0].value, "Sunset", "Trait value mismatch");

        // Verify payment distribution
        uint256 expectedFee = (1 ether * 250) / 10000; // 2.5%
        uint256 expectedSellerAmount = 1 ether - expectedFee;
        
        assertEq(seller.balance, sellerBalanceBefore + expectedSellerAmount, "Seller payment incorrect");
        assertEq(address(marketplace).balance, expectedFee, "Marketplace fee incorrect");

        // Verify listing status
        KoboTraitMarketplace.TraitListing memory listing = marketplace.getListing(listingId);
        assertEq(uint256(listing.status), uint256(KoboTraitMarketplace.ListingStatus.SOLD), "Status should be SOLD");
    }

    function testCancelListing() public {
        // List trait
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        // Cancel listing
        vm.startPrank(seller);
        
        vm.expectEmit(true, true, true, true);
        emit ListingCancelled(listingId, seller, tokenId1);
        
        marketplace.cancelListing(listingId);
        vm.stopPrank();

        // Verify status
        KoboTraitMarketplace.TraitListing memory listing = marketplace.getListing(listingId);
        assertEq(uint256(listing.status), uint256(KoboTraitMarketplace.ListingStatus.CANCELLED), "Status should be CANCELLED");
    }

    function testMultipleListings() public {
        vm.startPrank(seller);
        
        uint256 listingId1 = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        uint256 listingId2 = marketplace.listTrait(tokenId1, 1, 2 ether, 7 days);
        uint256 listingId3 = marketplace.listTrait(tokenId1, 2, 0.5 ether, 7 days);
        
        assertEq(listingId1, 0, "First listing ID incorrect");
        assertEq(listingId2, 1, "Second listing ID incorrect");
        assertEq(listingId3, 2, "Third listing ID incorrect");
        
        assertEq(marketplace.totalListings(), 3, "Total listings incorrect");
        
        vm.stopPrank();
    }

    // ============================================
    // ACCESS CONTROL TESTS
    // ============================================

    function testCannotListTraitNotOwned() public {
        vm.startPrank(buyer);
        
        vm.expectRevert("Not token owner");
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        
        vm.stopPrank();
    }

    function testCannotCancelOthersListing() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        vm.startPrank(buyer);
        
        vm.expectRevert("Not listing seller");
        marketplace.cancelListing(listingId);
        
        vm.stopPrank();
    }

    function testCannotBuyWithoutOwningTargetToken() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        vm.startPrank(user1);
        
        vm.expectRevert("Not target token owner");
        marketplace.buyTrait{value: 1 ether}(listingId, tokenId2);
        
        vm.stopPrank();
    }

    function testOnlyOwnerCanSetMarketplaceFee() public {
        vm.startPrank(buyer);
        
        vm.expectRevert();
        marketplace.setMarketplaceFee(500);
        
        vm.stopPrank();
    }

    function testOnlyOwnerCanPause() public {
        vm.startPrank(buyer);
        
        vm.expectRevert();
        marketplace.pause();
        
        vm.stopPrank();
    }

    // ============================================
    // EDGE CASE TESTS
    // ============================================

    function testCannotListWithZeroPrice() public {
        vm.startPrank(seller);
        
        vm.expectRevert("Price must be greater than 0");
        marketplace.listTrait(tokenId1, 0, 0, 7 days);
        
        vm.stopPrank();
    }

    function testCannotListWithTooShortDuration() public {
        vm.startPrank(seller);
        
        vm.expectRevert("Duration too short");
        marketplace.listTrait(tokenId1, 0, 1 ether, 30 minutes);
        
        vm.stopPrank();
    }

    function testCannotListWithTooLongDuration() public {
        vm.startPrank(seller);
        
        vm.expectRevert("Duration too long");
        marketplace.listTrait(tokenId1, 0, 1 ether, 31 days);
        
        vm.stopPrank();
    }

    function testCannotListInvalidTraitIndex() public {
        vm.startPrank(seller);
        
        vm.expectRevert("Invalid trait index");
        marketplace.listTrait(tokenId1, 999, 1 ether, 7 days);
        
        vm.stopPrank();
    }

    function testCannotBuyWithIncorrectPayment() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        vm.startPrank(buyer);
        
        vm.expectRevert("Incorrect payment amount");
        marketplace.buyTrait{value: 0.5 ether}(listingId, tokenId2);
        
        vm.stopPrank();
    }

    function testCannotBuyExpiredListing() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 1 hours);

        // Fast forward past expiration
        vm.warp(block.timestamp + 2 hours);

        vm.startPrank(buyer);
        
        vm.expectRevert("Listing expired");
        marketplace.buyTrait{value: 1 ether}(listingId, tokenId2);
        
        vm.stopPrank();
    }

    function testCannotBuyCancelledListing() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        vm.prank(seller);
        marketplace.cancelListing(listingId);

        vm.startPrank(buyer);
        
        vm.expectRevert("Listing not active");
        marketplace.buyTrait{value: 1 ether}(listingId, tokenId2);
        
        vm.stopPrank();
    }

    function testCannotCancelAlreadyCancelledListing() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        vm.startPrank(seller);
        marketplace.cancelListing(listingId);
        
        vm.expectRevert("Listing not active");
        marketplace.cancelListing(listingId);
        
        vm.stopPrank();
    }

    function testCannotSetFeeTooHigh() public {
        vm.expectRevert("Fee too high");
        marketplace.setMarketplaceFee(1001); // Max is 1000 (10%)
    }

    // ============================================
    // REVERT TESTS
    // ============================================

    function testRevertWhenPaused() public {
        marketplace.pause();

        vm.startPrank(seller);
        
        vm.expectRevert();
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        
        vm.stopPrank();
    }

    function testRevertBuyWhenPaused() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        marketplace.pause();

        vm.startPrank(buyer);
        
        vm.expectRevert();
        marketplace.buyTrait{value: 1 ether}(listingId, tokenId2);
        
        vm.stopPrank();
    }

    // ============================================
    // EVENT EMISSION TESTS
    // ============================================

    function testTraitListedEventEmission() public {
        vm.startPrank(seller);
        
        uint256 price = 1 ether;
        uint256 duration = 7 days;
        uint256 expectedExpiration = block.timestamp + duration;
        
        vm.expectEmit(true, true, true, true);
        emit TraitListed(0, seller, tokenId1, 0, "Background", "Sunset", price, expectedExpiration);
        
        marketplace.listTrait(tokenId1, 0, price, duration);
        
        vm.stopPrank();
    }

    function testMarketplaceFeeUpdatedEvent() public {
        uint256 oldFee = marketplace.marketplaceFee();
        uint256 newFee = 500;
        
        vm.expectEmit(true, true, true, true);
        emit MarketplaceFeeUpdated(oldFee, newFee);
        
        marketplace.setMarketplaceFee(newFee);
    }

    // ============================================
    // STATE TRANSITION TESTS
    // ============================================

    function testListingStatusTransitions() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        // Initial state: ACTIVE
        KoboTraitMarketplace.TraitListing memory listing = marketplace.getListing(listingId);
        assertEq(uint256(listing.status), uint256(KoboTraitMarketplace.ListingStatus.ACTIVE), "Should start ACTIVE");

        // Transition to SOLD
        vm.startPrank(buyer);
        marketplace.buyTrait{value: 1 ether}(listingId, tokenId2);
        koboNFT.addTrait(tokenId2, "Background", "Sunset");
        vm.stopPrank();

        listing = marketplace.getListing(listingId);
        assertEq(uint256(listing.status), uint256(KoboTraitMarketplace.ListingStatus.SOLD), "Should be SOLD");
    }

    function testListingExpirationTransition() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 1 hours);

        // Fast forward past expiration
        vm.warp(block.timestamp + 2 hours);

        // Mark as expired
        uint256[] memory listingIds = new uint256[](1);
        listingIds[0] = listingId;
        
        vm.expectEmit(true, true, false, false);
        emit ListingExpired(listingId, tokenId1);
        
        marketplace.markExpiredListings(listingIds);

        KoboTraitMarketplace.TraitListing memory listing = marketplace.getListing(listingId);
        assertEq(uint256(listing.status), uint256(KoboTraitMarketplace.ListingStatus.EXPIRED), "Should be EXPIRED");
    }

    // ============================================
    // RARITY CALCULATION TESTS
    // ============================================

    function testCalculateTraitRarity() public {
        // List multiple traits to build rarity data
        vm.startPrank(seller);
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days); // Background: Sunset
        marketplace.listTrait(tokenId1, 1, 1 ether, 7 days); // Rarity: Legendary
        vm.stopPrank();

        // Calculate rarity
        KoboTraitMarketplace.TraitRarity memory rarity = marketplace.calculateTraitRarity("Background", "Sunset");
        
        assertEq(rarity.traitName, "Background", "Trait name mismatch");
        assertEq(rarity.traitValue, "Sunset", "Trait value mismatch");
        assertEq(rarity.occurrences, 1, "Occurrences should be 1");
        // Rarity score calculation: 10000 - (1 * 10000 / 1) = 0 (only 1 Background trait listed)
        assertEq(rarity.rarityScore, 0, "Rarity score should be 0");
    }

    function testBatchCalculateRarity() public {
        vm.startPrank(seller);
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        marketplace.listTrait(tokenId1, 1, 1 ether, 7 days);
        vm.stopPrank();

        string[] memory traitNames = new string[](2);
        traitNames[0] = "Background";
        traitNames[1] = "Rarity";

        string[] memory traitValues = new string[](2);
        traitValues[0] = "Sunset";
        traitValues[1] = "Legendary";

        KoboTraitMarketplace.TraitRarity[] memory rarities = marketplace.batchCalculateRarity(traitNames, traitValues);
        
        assertEq(rarities.length, 2, "Should return 2 rarities");
        assertEq(rarities[0].traitName, "Background", "First trait name mismatch");
        assertEq(rarities[1].traitName, "Rarity", "Second trait name mismatch");
    }

    function testRarityUpdateOnListing() public {
        vm.startPrank(seller);
        
        vm.expectEmit(false, false, false, true);
        emit TraitRarityUpdated("Background", "Sunset", 1, 0);
        
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        
        vm.stopPrank();
    }

    function testRarityUpdateOnCancel() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        vm.startPrank(seller);
        
        vm.expectEmit(false, false, false, false);
        emit TraitRarityUpdated("", "", 0, 0);
        
        marketplace.cancelListing(listingId);
        
        vm.stopPrank();
    }

    // ============================================
    // QUERY FUNCTION TESTS
    // ============================================

    function testGetActiveListings() public {
        vm.startPrank(seller);
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        marketplace.listTrait(tokenId1, 1, 2 ether, 7 days);
        vm.stopPrank();

        KoboTraitMarketplace.TraitListing[] memory activeListings = marketplace.getActiveListings();
        assertEq(activeListings.length, 2, "Should have 2 active listings");
    }

    function testGetTokenListings() public {
        vm.startPrank(seller);
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        marketplace.listTrait(tokenId1, 1, 2 ether, 7 days);
        vm.stopPrank();

        uint256[] memory tokenListings = marketplace.getTokenListings(tokenId1);
        assertEq(tokenListings.length, 2, "Should have 2 listings for token");
    }

    function testGetSellerListings() public {
        vm.startPrank(seller);
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        marketplace.listTrait(tokenId1, 1, 2 ether, 7 days);
        vm.stopPrank();

        uint256[] memory sellerListings = marketplace.getSellerListings(seller);
        assertEq(sellerListings.length, 2, "Seller should have 2 listings");
    }

    function testGetListingsByTraitName() public {
        vm.startPrank(seller);
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days); // Background
        marketplace.listTrait(tokenId1, 1, 2 ether, 7 days); // Rarity
        vm.stopPrank();

        KoboTraitMarketplace.TraitListing[] memory backgroundListings = 
            marketplace.getListingsByTraitName("Background");
        
        assertEq(backgroundListings.length, 1, "Should have 1 Background listing");
        assertEq(backgroundListings[0].traitName, "Background", "Trait name mismatch");
    }

    function testIsListingActive() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        assertTrue(marketplace.isListingActive(listingId), "Listing should be active");

        // Cancel and check
        vm.prank(seller);
        marketplace.cancelListing(listingId);

        assertFalse(marketplace.isListingActive(listingId), "Listing should not be active");
    }

    // ============================================
    // ADMIN FUNCTION TESTS
    // ============================================

    function testSetMarketplaceFee() public {
        uint256 newFee = 500; // 5%
        marketplace.setMarketplaceFee(newFee);
        
        assertEq(marketplace.marketplaceFee(), newFee, "Fee not updated");
    }

    function testPauseAndUnpause() public {
        marketplace.pause();
        
        vm.startPrank(seller);
        vm.expectRevert();
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        vm.stopPrank();

        marketplace.unpause();
        
        vm.prank(seller);
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
    }

    function testEmergencyWithdraw() public {
        // Create a listing and buy it to generate marketplace balance
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 10 ether, 7 days);
        
        vm.prank(buyer);
        marketplace.buyTrait{value: 10 ether}(listingId, tokenId2);

        // Marketplace should have some balance from fees
        uint256 marketplaceBalance = address(marketplace).balance;
        assertTrue(marketplaceBalance > 0, "Marketplace should have balance from fees");
        
        uint256 ownerBalanceBefore = owner.balance;
        
        marketplace.emergencyWithdraw();
        
        assertEq(owner.balance, ownerBalanceBefore + marketplaceBalance, "Emergency withdrawal failed");
        assertEq(address(marketplace).balance, 0, "Marketplace should have 0 balance");
    }

    function testCannotEmergencyWithdrawWithZeroBalance() public {
        vm.expectRevert("No balance to withdraw");
        marketplace.emergencyWithdraw();
    }

    // ============================================
    // FUZZ TESTS
    // ============================================

    function testFuzzListTrait(uint256 price, uint256 duration) public {
        price = bound(price, 1, 1000 ether);
        duration = bound(duration, 1 hours, 30 days);

        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, price, duration);

        KoboTraitMarketplace.TraitListing memory listing = marketplace.getListing(listingId);
        assertEq(listing.price, price, "Price mismatch");
        assertEq(listing.expirationTime, block.timestamp + duration, "Expiration mismatch");
    }

    function testFuzzBuyTrait(uint256 price) public {
        price = bound(price, 0.01 ether, 100 ether);

        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, price, 7 days);

        vm.deal(buyer, price);
        
        vm.startPrank(buyer);
        marketplace.buyTrait{value: price}(listingId, tokenId2);
        vm.stopPrank();

        KoboTraitMarketplace.TraitListing memory listing = marketplace.getListing(listingId);
        assertEq(uint256(listing.status), uint256(KoboTraitMarketplace.ListingStatus.SOLD), "Should be SOLD");
    }

    function testFuzzMarketplaceFee(uint256 fee) public {
        fee = bound(fee, 0, 1000); // Max 10%

        marketplace.setMarketplaceFee(fee);
        assertEq(marketplace.marketplaceFee(), fee, "Fee not set correctly");
    }

    // ============================================
    // INTEGRATION TESTS
    // ============================================

    function testCompleteMarketplaceFlow() public {
        // 1. Seller lists trait
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        // 2. Verify listing is active
        assertTrue(marketplace.isListingActive(listingId), "Listing should be active");

        // 3. Buyer purchases trait
        uint256 buyerTraitsBefore = koboNFT.getTraits(tokenId2).length;
        
        vm.startPrank(buyer);
        marketplace.buyTrait{value: 1 ether}(listingId, tokenId2);
        
        // Buyer manually adds the trait
        koboNFT.addTrait(tokenId2, "Background", "Sunset");
        vm.stopPrank();

        // 4. Verify trait transferred
        assertEq(koboNFT.getTraits(tokenId2).length, buyerTraitsBefore + 1, "Trait not added");

        // 5. Verify listing marked as sold
        assertFalse(marketplace.isListingActive(listingId), "Listing should not be active");
    }

    function testMultipleTraitPurchases() public {
        // List multiple traits
        vm.startPrank(seller);
        uint256 listingId1 = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        uint256 listingId2 = marketplace.listTrait(tokenId1, 1, 2 ether, 7 days);
        vm.stopPrank();

        // Buy first trait
        vm.startPrank(buyer);
        marketplace.buyTrait{value: 1 ether}(listingId1, tokenId2);
        koboNFT.addTrait(tokenId2, "Background", "Sunset");

        // Buy second trait
        marketplace.buyTrait{value: 2 ether}(listingId2, tokenId2);
        koboNFT.addTrait(tokenId2, "Rarity", "Legendary");
        vm.stopPrank();

        // Verify both traits added
        KoboNFTExtended.Trait[] memory traits = koboNFT.getTraits(tokenId2);
        assertEq(traits.length, 2, "Should have 2 traits");
    }

    // ============================================
    // GAS OPTIMIZATION TESTS
    // ============================================

    function testGasListTrait() public {
        vm.prank(seller);
        uint256 gasBefore = gasleft();
        marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);
        uint256 gasUsed = gasBefore - gasleft();
        
        // Gas usage should be reasonable (adjust threshold as needed)
        assertTrue(gasUsed < 500000, "Gas usage too high for listing");
    }

    function testGasBuyTrait() public {
        vm.prank(seller);
        uint256 listingId = marketplace.listTrait(tokenId1, 0, 1 ether, 7 days);

        vm.startPrank(buyer);
        uint256 gasBefore = gasleft();
        marketplace.buyTrait{value: 1 ether}(listingId, tokenId2);
        uint256 gasUsed = gasBefore - gasleft();
        vm.stopPrank();
        
        // Gas usage should be reasonable
        assertTrue(gasUsed < 1000000, "Gas usage too high for buying");
    }
}
