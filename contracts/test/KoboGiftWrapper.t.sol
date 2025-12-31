// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import "../src/KoboGiftWrapper.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title MockNFT
 * @notice Mock ERC721 contract for testing
 */
contract MockNFT is ERC721 {
    uint256 private _nextTokenId;

    constructor() ERC721("MockNFT", "MNFT") {}

    function mint(address to) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        return tokenId;
    }
}

/**
 * @title KoboGiftWrapperTest
 * @notice Comprehensive test suite for KoboGiftWrapper contract
 */
contract KoboGiftWrapperTest is Test {
    KoboGiftWrapper public giftWrapper;
    MockNFT public mockNFT;
    MockNFT public mockNFT2;

    address public owner;
    address public sender;
    address public recipient;
    address public user1;
    address public user2;

    // Copy event declarations from KoboGiftWrapper
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

    function setUp() public {
        owner = address(this);
        sender = address(0x1);
        recipient = address(0x2);
        user1 = address(0x3);
        user2 = address(0x4);

        // Deploy mock NFT contracts
        mockNFT = new MockNFT();
        mockNFT2 = new MockNFT();

        // Deploy gift wrapper with supported contracts
        address[] memory supportedContracts = new address[](2);
        supportedContracts[0] = address(mockNFT);
        supportedContracts[1] = address(mockNFT2);
        giftWrapper = new KoboGiftWrapper(owner, supportedContracts);

        // Fund test addresses
        vm.deal(sender, 10 ether);
        vm.deal(recipient, 10 ether);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }

    // ============ Happy Path Tests ============

    function testWrapGiftSuccess() public {
        // Mint NFT to sender
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);

        // Wrap gift
        vm.expectEmit(true, true, true, true);
        emit GiftWrapped(0, sender, recipient, address(mockNFT), tokenId, "Happy Birthday!");

        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Happy Birthday!");
        vm.stopPrank();

        // Verify gift details
        KoboGiftWrapper.Gift memory gift = giftWrapper.getGiftDetails(giftId);
        assertEq(gift.giftId, 0, "Gift ID should be 0");
        assertEq(gift.nftContract, address(mockNFT), "NFT contract mismatch");
        assertEq(gift.tokenId, tokenId, "Token ID mismatch");
        assertEq(gift.sender, sender, "Sender mismatch");
        assertEq(gift.recipient, recipient, "Recipient mismatch");
        assertEq(gift.message, "Happy Birthday!", "Message mismatch");
        assertTrue(gift.wrappedAt > 0, "Wrapped timestamp should be set");
        assertEq(gift.unwrappedAt, 0, "Unwrapped timestamp should be 0");
        assertEq(uint256(gift.status), uint256(KoboGiftWrapper.GiftStatus.WRAPPED), "Status should be WRAPPED");

        // Verify NFT ownership transferred to contract
        assertEq(mockNFT.ownerOf(tokenId), address(giftWrapper), "NFT should be owned by contract");

        // Verify token is marked as wrapped
        assertTrue(giftWrapper.isTokenWrapped(address(mockNFT), tokenId), "Token should be marked as wrapped");
    }

    function testUnwrapGiftSuccess() public {
        // Setup: Wrap a gift
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test message");
        vm.stopPrank();

        // Unwrap gift as recipient
        vm.startPrank(recipient);
        vm.expectEmit(true, true, true, true);
        emit GiftUnwrapped(giftId, recipient, address(mockNFT), tokenId);

        giftWrapper.unwrapGift(giftId);
        vm.stopPrank();

        // Verify gift status updated
        KoboGiftWrapper.Gift memory gift = giftWrapper.getGiftDetails(giftId);
        assertEq(uint256(gift.status), uint256(KoboGiftWrapper.GiftStatus.UNWRAPPED), "Status should be UNWRAPPED");
        assertTrue(gift.unwrappedAt > 0, "Unwrapped timestamp should be set");

        // Verify NFT transferred to recipient
        assertEq(mockNFT.ownerOf(tokenId), recipient, "NFT should be owned by recipient");

        // Verify token no longer marked as wrapped
        assertFalse(giftWrapper.isTokenWrapped(address(mockNFT), tokenId), "Token should not be marked as wrapped");
    }

    function testCancelGiftSuccess() public {
        // Setup: Wrap a gift
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test message");

        // Cancel gift
        vm.expectEmit(true, true, true, true);
        emit GiftCancelled(giftId, sender, address(mockNFT), tokenId);

        giftWrapper.cancelGift(giftId);
        vm.stopPrank();

        // Verify gift status
        KoboGiftWrapper.Gift memory gift = giftWrapper.getGiftDetails(giftId);
        assertEq(uint256(gift.status), uint256(KoboGiftWrapper.GiftStatus.CANCELLED), "Status should be CANCELLED");

        // Verify NFT returned to sender
        assertEq(mockNFT.ownerOf(tokenId), sender, "NFT should be returned to sender");

        // Verify token no longer marked as wrapped
        assertFalse(giftWrapper.isTokenWrapped(address(mockNFT), tokenId), "Token should not be marked as wrapped");
    }

    function testBatchWrapGiftsSuccess() public {
        vm.startPrank(sender);

        // Mint multiple NFTs
        uint256 tokenId1 = mockNFT.mint(sender);
        uint256 tokenId2 = mockNFT.mint(sender);
        uint256 tokenId3 = mockNFT2.mint(sender);

        // Approve all
        mockNFT.approve(address(giftWrapper), tokenId1);
        mockNFT.approve(address(giftWrapper), tokenId2);
        mockNFT2.approve(address(giftWrapper), tokenId3);

        // Prepare batch data
        address[] memory nftContracts = new address[](3);
        nftContracts[0] = address(mockNFT);
        nftContracts[1] = address(mockNFT);
        nftContracts[2] = address(mockNFT2);

        uint256[] memory tokenIds = new uint256[](3);
        tokenIds[0] = tokenId1;
        tokenIds[1] = tokenId2;
        tokenIds[2] = tokenId3;

        address[] memory recipients = new address[](3);
        recipients[0] = recipient;
        recipients[1] = user1;
        recipients[2] = user2;

        string[] memory messages = new string[](3);
        messages[0] = "Gift 1";
        messages[1] = "Gift 2";
        messages[2] = "Gift 3";

        // Batch wrap
        uint256[] memory giftIds = giftWrapper.batchWrapGifts(nftContracts, tokenIds, recipients, messages);
        vm.stopPrank();

        // Verify all gifts created
        assertEq(giftIds.length, 3, "Should create 3 gifts");

        for (uint256 i = 0; i < giftIds.length; i++) {
            KoboGiftWrapper.Gift memory gift = giftWrapper.getGiftDetails(giftIds[i]);
            assertEq(gift.nftContract, nftContracts[i], "NFT contract mismatch");
            assertEq(gift.tokenId, tokenIds[i], "Token ID mismatch");
            assertEq(gift.recipient, recipients[i], "Recipient mismatch");
            assertEq(gift.message, messages[i], "Message mismatch");
        }
    }

    function testGetPendingGifts() public {
        vm.startPrank(sender);

        // Create multiple gifts for recipient
        uint256 tokenId1 = mockNFT.mint(sender);
        uint256 tokenId2 = mockNFT.mint(sender);
        uint256 tokenId3 = mockNFT.mint(sender);

        mockNFT.approve(address(giftWrapper), tokenId1);
        mockNFT.approve(address(giftWrapper), tokenId2);
        mockNFT.approve(address(giftWrapper), tokenId3);

        uint256 giftId1 = giftWrapper.wrapGift(address(mockNFT), tokenId1, recipient, "Gift 1");
        uint256 giftId2 = giftWrapper.wrapGift(address(mockNFT), tokenId2, recipient, "Gift 2");
        uint256 giftId3 = giftWrapper.wrapGift(address(mockNFT), tokenId3, recipient, "Gift 3");
        vm.stopPrank();

        // Check pending gifts
        uint256[] memory pendingGifts = giftWrapper.getPendingGifts(recipient);
        assertEq(pendingGifts.length, 3, "Should have 3 pending gifts");

        // Unwrap one gift
        vm.prank(recipient);
        giftWrapper.unwrapGift(giftId2);

        // Check pending gifts again
        pendingGifts = giftWrapper.getPendingGifts(recipient);
        assertEq(pendingGifts.length, 2, "Should have 2 pending gifts after unwrapping");
    }

    // ============ Access Control Tests ============

    function testUnwrapGiftOnlyRecipient() public {
        // Setup: Wrap a gift
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        // Try to unwrap as non-recipient
        vm.prank(user1);
        vm.expectRevert("KoboGiftWrapper: not the recipient");
        giftWrapper.unwrapGift(giftId);

        // Try to unwrap as sender
        vm.prank(sender);
        vm.expectRevert("KoboGiftWrapper: not the recipient");
        giftWrapper.unwrapGift(giftId);
    }

    function testCancelGiftOnlySender() public {
        // Setup: Wrap a gift
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        // Try to cancel as non-sender
        vm.prank(user1);
        vm.expectRevert("KoboGiftWrapper: not the sender");
        giftWrapper.cancelGift(giftId);

        // Try to cancel as recipient
        vm.prank(recipient);
        vm.expectRevert("KoboGiftWrapper: not the sender");
        giftWrapper.cancelGift(giftId);
    }

    function testOnlyOwnerCanPause() public {
        vm.prank(user1);
        vm.expectRevert();
        giftWrapper.pause();

        // Owner can pause
        giftWrapper.pause();
        assertTrue(giftWrapper.paused(), "Contract should be paused");
    }

    function testOnlyOwnerCanSetSupportedContract() public {
        address newContract = address(0x999);

        vm.prank(user1);
        vm.expectRevert();
        giftWrapper.setSupportedContract(newContract, true);

        // Owner can set
        vm.expectEmit(true, true, true, true);
        emit ContractSupportUpdated(newContract, true);
        giftWrapper.setSupportedContract(newContract, true);
        assertTrue(giftWrapper.supportedContracts(newContract), "Contract should be supported");
    }

    // ============ Edge Case Tests ============

    function testWrapGiftZeroAddress() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);

        vm.expectRevert("KoboGiftWrapper: invalid recipient");
        giftWrapper.wrapGift(address(mockNFT), tokenId, address(0), "Test");
        vm.stopPrank();
    }

    function testWrapGiftToSelf() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);

        vm.expectRevert("KoboGiftWrapper: cannot gift to yourself");
        giftWrapper.wrapGift(address(mockNFT), tokenId, sender, "Test");
        vm.stopPrank();
    }

    function testWrapGiftNotOwner() public {
        vm.prank(sender);
        uint256 tokenId = mockNFT.mint(sender);

        vm.prank(user1);
        vm.expectRevert("KoboGiftWrapper: not token owner");
        giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
    }

    function testWrapGiftNotApproved() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        // Don't approve

        vm.expectRevert("KoboGiftWrapper: contract not approved");
        giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();
    }

    function testWrapGiftUnsupportedContract() public {
        MockNFT unsupportedNFT = new MockNFT();

        vm.startPrank(sender);
        uint256 tokenId = unsupportedNFT.mint(sender);
        unsupportedNFT.approve(address(giftWrapper), tokenId);

        vm.expectRevert("KoboGiftWrapper: unsupported NFT contract");
        giftWrapper.wrapGift(address(unsupportedNFT), tokenId, recipient, "Test");
        vm.stopPrank();
    }

    function testDoubleWrap() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);

        giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");

        // Try to wrap again (should fail because contract owns it now)
        vm.expectRevert();
        giftWrapper.wrapGift(address(mockNFT), tokenId, user1, "Test 2");
        vm.stopPrank();
    }

    function testDoubleUnwrap() public {
        // Setup: Wrap and unwrap a gift
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        vm.startPrank(recipient);
        giftWrapper.unwrapGift(giftId);

        // Try to unwrap again
        vm.expectRevert("KoboGiftWrapper: gift not wrapped");
        giftWrapper.unwrapGift(giftId);
        vm.stopPrank();
    }

    function testUnwrapNonexistentGift() public {
        vm.prank(recipient);
        vm.expectRevert("KoboGiftWrapper: gift does not exist");
        giftWrapper.unwrapGift(999);
    }

    function testBatchWrapEmptyArrays() public {
        vm.startPrank(sender);

        address[] memory nftContracts = new address[](0);
        uint256[] memory tokenIds = new uint256[](0);
        address[] memory recipients = new address[](0);
        string[] memory messages = new string[](0);

        vm.expectRevert("KoboGiftWrapper: empty arrays");
        giftWrapper.batchWrapGifts(nftContracts, tokenIds, recipients, messages);
        vm.stopPrank();
    }

    function testBatchWrapLengthMismatch() public {
        vm.startPrank(sender);

        address[] memory nftContracts = new address[](2);
        uint256[] memory tokenIds = new uint256[](3);
        address[] memory recipients = new address[](2);
        string[] memory messages = new string[](2);

        vm.expectRevert("KoboGiftWrapper: length mismatch");
        giftWrapper.batchWrapGifts(nftContracts, tokenIds, recipients, messages);
        vm.stopPrank();
    }

    // ============ State Transition Tests ============

    function testGiftStatusTransitions() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        // Initial state: WRAPPED
        KoboGiftWrapper.Gift memory gift = giftWrapper.getGiftDetails(giftId);
        assertEq(uint256(gift.status), uint256(KoboGiftWrapper.GiftStatus.WRAPPED), "Initial status should be WRAPPED");

        // Transition to UNWRAPPED
        vm.prank(recipient);
        giftWrapper.unwrapGift(giftId);

        gift = giftWrapper.getGiftDetails(giftId);
        assertEq(uint256(gift.status), uint256(KoboGiftWrapper.GiftStatus.UNWRAPPED), "Status should be UNWRAPPED");
    }

    function testCannotCancelUnwrappedGift() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        // Unwrap gift
        vm.prank(recipient);
        giftWrapper.unwrapGift(giftId);

        // Try to cancel unwrapped gift
        vm.prank(sender);
        vm.expectRevert("KoboGiftWrapper: gift not wrapped");
        giftWrapper.cancelGift(giftId);
    }

    function testCannotUnwrapCancelledGift() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        giftWrapper.cancelGift(giftId);
        vm.stopPrank();

        // Try to unwrap cancelled gift
        vm.prank(recipient);
        vm.expectRevert("KoboGiftWrapper: gift not wrapped");
        giftWrapper.unwrapGift(giftId);
    }

    // ============ Event Emission Tests ============

    function testGiftWrappedEventEmission() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);

        vm.expectEmit(true, true, true, true);
        emit GiftWrapped(0, sender, recipient, address(mockNFT), tokenId, "Test message");

        giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test message");
        vm.stopPrank();
    }

    function testGiftUnwrappedEventEmission() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        vm.startPrank(recipient);
        vm.expectEmit(true, true, true, true);
        emit GiftUnwrapped(giftId, recipient, address(mockNFT), tokenId);

        giftWrapper.unwrapGift(giftId);
        vm.stopPrank();
    }

    function testBatchGiftsWrappedEventEmission() public {
        vm.startPrank(sender);

        uint256 tokenId1 = mockNFT.mint(sender);
        uint256 tokenId2 = mockNFT.mint(sender);

        mockNFT.approve(address(giftWrapper), tokenId1);
        mockNFT.approve(address(giftWrapper), tokenId2);

        address[] memory nftContracts = new address[](2);
        nftContracts[0] = address(mockNFT);
        nftContracts[1] = address(mockNFT);

        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = tokenId1;
        tokenIds[1] = tokenId2;

        address[] memory recipients = new address[](2);
        recipients[0] = recipient;
        recipients[1] = user1;

        string[] memory messages = new string[](2);
        messages[0] = "Gift 1";
        messages[1] = "Gift 2";

        // Note: We can't easily test the exact giftIds array in the event,
        // but we can verify the event is emitted
        vm.recordLogs();
        giftWrapper.batchWrapGifts(nftContracts, tokenIds, recipients, messages);

        Vm.Log[] memory logs = vm.getRecordedLogs();
        bool batchEventFound = false;

        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].topics[0] == keccak256("BatchGiftsWrapped(uint256[],address,address[],uint256)")) {
                batchEventFound = true;
                break;
            }
        }

        assertTrue(batchEventFound, "BatchGiftsWrapped event should be emitted");
        vm.stopPrank();
    }

    // ============ Pause Functionality Tests ============

    function testCannotWrapWhenPaused() public {
        giftWrapper.pause();

        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);

        vm.expectRevert();
        giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();
    }

    function testCannotUnwrapWhenPaused() public {
        // Setup: Wrap a gift
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        // Pause contract
        giftWrapper.pause();

        // Try to unwrap
        vm.prank(recipient);
        vm.expectRevert();
        giftWrapper.unwrapGift(giftId);
    }

    function testCanUnpause() public {
        giftWrapper.pause();
        assertTrue(giftWrapper.paused(), "Should be paused");

        giftWrapper.unpause();
        assertFalse(giftWrapper.paused(), "Should be unpaused");
    }

    // ============ View Function Tests ============

    function testGetAllGifts() public {
        vm.startPrank(sender);

        uint256 tokenId1 = mockNFT.mint(sender);
        uint256 tokenId2 = mockNFT.mint(sender);

        mockNFT.approve(address(giftWrapper), tokenId1);
        mockNFT.approve(address(giftWrapper), tokenId2);

        giftWrapper.wrapGift(address(mockNFT), tokenId1, recipient, "Gift 1");
        giftWrapper.wrapGift(address(mockNFT), tokenId2, recipient, "Gift 2");
        vm.stopPrank();

        uint256[] memory allGifts = giftWrapper.getAllGifts(recipient);
        assertEq(allGifts.length, 2, "Should have 2 total gifts");
    }

    function testGetGiftIdByToken() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        uint256 retrievedGiftId = giftWrapper.getGiftIdByToken(address(mockNFT), tokenId);
        assertEq(retrievedGiftId, giftId, "Gift ID should match");
    }

    function testTotalGifts() public {
        assertEq(giftWrapper.totalGifts(), 0, "Initial total should be 0");

        vm.startPrank(sender);
        uint256 tokenId1 = mockNFT.mint(sender);
        uint256 tokenId2 = mockNFT.mint(sender);

        mockNFT.approve(address(giftWrapper), tokenId1);
        mockNFT.approve(address(giftWrapper), tokenId2);

        giftWrapper.wrapGift(address(mockNFT), tokenId1, recipient, "Gift 1");
        giftWrapper.wrapGift(address(mockNFT), tokenId2, user1, "Gift 2");
        vm.stopPrank();

        assertEq(giftWrapper.totalGifts(), 2, "Total should be 2");
    }

    // ============ Emergency Recovery Tests ============

    function testEmergencyRecoverNFT() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        // Owner can recover
        giftWrapper.emergencyRecoverNFT(address(mockNFT), tokenId, owner);
        assertEq(mockNFT.ownerOf(tokenId), owner, "NFT should be recovered to owner");
    }

    function testEmergencyRecoverNFTOnlyOwner() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        vm.prank(user1);
        vm.expectRevert();
        giftWrapper.emergencyRecoverNFT(address(mockNFT), tokenId, user1);
    }

    function testEmergencyRecoverNFTInvalidRecipient() public {
        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);
        giftWrapper.wrapGift(address(mockNFT), tokenId, recipient, "Test");
        vm.stopPrank();

        vm.expectRevert("KoboGiftWrapper: invalid recipient");
        giftWrapper.emergencyRecoverNFT(address(mockNFT), tokenId, address(0));
    }

    // ============ Fuzz Tests ============

    function testFuzzWrapGift(address _recipient, string memory _message) public {
        vm.assume(_recipient != address(0));
        vm.assume(_recipient != sender);
        vm.assume(bytes(_message).length > 0 && bytes(_message).length < 1000);

        vm.startPrank(sender);
        uint256 tokenId = mockNFT.mint(sender);
        mockNFT.approve(address(giftWrapper), tokenId);

        uint256 giftId = giftWrapper.wrapGift(address(mockNFT), tokenId, _recipient, _message);

        KoboGiftWrapper.Gift memory gift = giftWrapper.getGiftDetails(giftId);
        assertEq(gift.recipient, _recipient, "Recipient should match");
        assertEq(gift.message, _message, "Message should match");
        vm.stopPrank();
    }

    function testFuzzBatchWrapGifts(uint8 _count) public {
        uint256 count = bound(_count, 1, 10); // Limit to reasonable batch size

        vm.startPrank(sender);

        address[] memory nftContracts = new address[](count);
        uint256[] memory tokenIds = new uint256[](count);
        address[] memory recipients = new address[](count);
        string[] memory messages = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = mockNFT.mint(sender);
            mockNFT.approve(address(giftWrapper), tokenIds[i]);
            nftContracts[i] = address(mockNFT);
            recipients[i] = address(uint160(0x1000 + i)); // Generate unique addresses
            messages[i] = string(abi.encodePacked("Gift ", vm.toString(i)));
        }

        uint256[] memory giftIds = giftWrapper.batchWrapGifts(nftContracts, tokenIds, recipients, messages);
        assertEq(giftIds.length, count, "Should create correct number of gifts");
        vm.stopPrank();
    }
}
