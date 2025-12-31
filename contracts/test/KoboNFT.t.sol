// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import "../src/KoboNFT.sol";

contract KoboNFTTest is Test {
    KoboNFT public koboNFT;
    
    address public owner;
    address public user1;
    address public user2;
    address public royaltyReceiver;

    // Copy event declarations from KoboNFT for testing
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        KoboNFT.NFTType nftType,
        KoboNFT.GenerationMethod generationMethod,
        bytes32 copyrightAuditHash,
        string tokenURI
    );

    event RoyaltyUpdated(address indexed receiver, uint96 feeNumerator);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        royaltyReceiver = makeAddr("royaltyReceiver");

        // Deploy contract
        koboNFT = new KoboNFT(owner);

        // Fund test addresses
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }

    // ============ Happy Path Tests ============

    function testMintImageNFT() public {
        string memory uri = "ipfs://QmTest123";
        bytes32 auditHash = keccak256("audit_data");

        vm.expectEmit(true, true, false, true);
        emit NFTMinted(
            0,
            owner,
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            auditHash,
            uri
        );

        uint256 tokenId = koboNFT.mint(
            user1,
            uri,
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            auditHash
        );

        assertEq(tokenId, 0, "First token ID should be 0");
        assertEq(koboNFT.ownerOf(tokenId), user1, "Token owner should be user1");
        assertEq(koboNFT.tokenURI(tokenId), uri, "Token URI should match");
        assertEq(koboNFT.totalMinted(), 1, "Total minted should be 1");
    }

    function testMintVideoNFT() public {
        string memory uri = "ipfs://QmVideo456";
        bytes32 auditHash = keccak256("video_audit");

        uint256 tokenId = koboNFT.mint(
            user2,
            uri,
            KoboNFT.NFTType.VIDEO,
            KoboNFT.GenerationMethod.MANUAL_UPLOAD,
            auditHash
        );

        KoboNFT.NFTMetadata memory metadata = koboNFT.getTokenMetadata(tokenId);
        assertEq(uint256(metadata.nftType), uint256(KoboNFT.NFTType.VIDEO), "NFT type should be VIDEO");
        assertEq(uint256(metadata.generationMethod), uint256(KoboNFT.GenerationMethod.MANUAL_UPLOAD), "Generation method should be MANUAL_UPLOAD");
        assertEq(metadata.copyrightAuditHash, auditHash, "Audit hash should match");
        assertEq(metadata.creator, owner, "Creator should be owner");
    }

    function testMintAudioNFT() public {
        string memory uri = "ipfs://QmAudio789";
        bytes32 auditHash = keccak256("audio_audit");

        uint256 tokenId = koboNFT.mint(
            user1,
            uri,
            KoboNFT.NFTType.AUDIO,
            KoboNFT.GenerationMethod.REMIXED,
            auditHash
        );

        KoboNFT.NFTMetadata memory metadata = koboNFT.getTokenMetadata(tokenId);
        assertEq(uint256(metadata.nftType), uint256(KoboNFT.NFTType.AUDIO), "NFT type should be AUDIO");
        assertEq(metadata.mintTimestamp, block.timestamp, "Mint timestamp should be current block timestamp");
    }

    function testMintMultipleNFTs() public {
        for (uint256 i = 0; i < 5; i++) {
            string memory uri = string(abi.encodePacked("ipfs://QmTest", vm.toString(i)));
            bytes32 auditHash = keccak256(abi.encodePacked("audit", i));

            uint256 tokenId = koboNFT.mint(
                user1,
                uri,
                KoboNFT.NFTType.IMAGE,
                KoboNFT.GenerationMethod.AI_GENERATED,
                auditHash
            );

            assertEq(tokenId, i, "Token ID should increment");
        }

        assertEq(koboNFT.balanceOf(user1), 5, "User1 should have 5 NFTs");
        assertEq(koboNFT.totalMinted(), 5, "Total minted should be 5");
    }

    function testTokensOfOwner() public {
        // Mint 3 NFTs to user1
        for (uint256 i = 0; i < 3; i++) {
            koboNFT.mint(
                user1,
                string(abi.encodePacked("ipfs://", vm.toString(i))),
                KoboNFT.NFTType.IMAGE,
                KoboNFT.GenerationMethod.AI_GENERATED,
                keccak256(abi.encodePacked(i))
            );
        }

        // Mint 2 NFTs to user2
        for (uint256 i = 0; i < 2; i++) {
            koboNFT.mint(
                user2,
                string(abi.encodePacked("ipfs://user2_", vm.toString(i))),
                KoboNFT.NFTType.VIDEO,
                KoboNFT.GenerationMethod.MANUAL_UPLOAD,
                keccak256(abi.encodePacked("user2", i))
            );
        }

        uint256[] memory user1Tokens = koboNFT.tokensOfOwner(user1);
        uint256[] memory user2Tokens = koboNFT.tokensOfOwner(user2);

        assertEq(user1Tokens.length, 3, "User1 should have 3 tokens");
        assertEq(user2Tokens.length, 2, "User2 should have 2 tokens");
        assertEq(user1Tokens[0], 0, "First token should be 0");
        assertEq(user2Tokens[0], 3, "User2's first token should be 3");
    }

    function testTransferNFT() public {
        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmTransfer",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("transfer_test")
        );

        vm.prank(user1);
        koboNFT.transferFrom(user1, user2, tokenId);

        assertEq(koboNFT.ownerOf(tokenId), user2, "Token should be transferred to user2");
        assertEq(koboNFT.balanceOf(user1), 0, "User1 balance should be 0");
        assertEq(koboNFT.balanceOf(user2), 1, "User2 balance should be 1");
    }

    // ============ Access Control Tests ============

    function testOnlyOwnerCanPause() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        koboNFT.pause();
    }

    function testOnlyOwnerCanUnpause() public {
        koboNFT.pause();

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        koboNFT.unpause();
    }

    function testOnlyOwnerCanSetDefaultRoyalty() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        koboNFT.setDefaultRoyalty(royaltyReceiver, 1000);
    }

    function testOnlyOwnerCanSetTokenRoyalty() public {
        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmRoyalty",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("royalty_test")
        );

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        koboNFT.setTokenRoyalty(tokenId, royaltyReceiver, 1000);
    }

    // ============ Edge Case Tests ============

    function testMintToZeroAddress() public {
        vm.expectRevert("KoboNFT: mint to zero address");
        koboNFT.mint(
            address(0),
            "ipfs://QmTest",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );
    }

    function testMintWithEmptyURI() public {
        vm.expectRevert("KoboNFT: empty URI");
        koboNFT.mint(
            user1,
            "",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );
    }

    function testMintWithZeroAuditHash() public {
        vm.expectRevert("KoboNFT: invalid audit hash");
        koboNFT.mint(
            user1,
            "ipfs://QmTest",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            bytes32(0)
        );
    }

    function testGetMetadataForNonexistentToken() public {
        vm.expectRevert();
        koboNFT.getTokenMetadata(999);
    }

    function testTokensOfOwnerWithNoTokens() public {
        uint256[] memory tokens = koboNFT.tokensOfOwner(user1);
        assertEq(tokens.length, 0, "Should return empty array for owner with no tokens");
    }

    // ============ Revert Tests ============

    function testCannotMintWhenPaused() public {
        koboNFT.pause();

        vm.expectRevert(abi.encodeWithSelector(Pausable.EnforcedPause.selector));
        koboNFT.mint(
            user1,
            "ipfs://QmTest",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );
    }

    function testCanMintAfterUnpause() public {
        koboNFT.pause();
        koboNFT.unpause();

        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmTest",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );

        assertEq(tokenId, 0, "Should mint successfully after unpause");
    }

    function testSetRoyaltyToZeroAddress() public {
        vm.expectRevert("KoboNFT: invalid receiver");
        koboNFT.setDefaultRoyalty(address(0), 500);
    }

    function testSetRoyaltyTooHigh() public {
        vm.expectRevert("KoboNFT: royalty too high");
        koboNFT.setDefaultRoyalty(royaltyReceiver, 10001);
    }

    function testSetTokenRoyaltyInvalidReceiver() public {
        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmTest",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );

        vm.expectRevert("KoboNFT: invalid receiver");
        koboNFT.setTokenRoyalty(tokenId, address(0), 500);
    }

    function testSetTokenRoyaltyTooHigh() public {
        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmTest",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );

        vm.expectRevert("KoboNFT: royalty too high");
        koboNFT.setTokenRoyalty(tokenId, royaltyReceiver, 10001);
    }

    // ============ Event Emission Tests ============

    function testNFTMintedEventEmission() public {
        string memory uri = "ipfs://QmEventTest";
        bytes32 auditHash = keccak256("event_test");

        vm.expectEmit(true, true, false, true);
        emit NFTMinted(
            0,
            owner,
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            auditHash,
            uri
        );

        koboNFT.mint(
            user1,
            uri,
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            auditHash
        );
    }

    function testRoyaltyUpdatedEventEmission() public {
        vm.expectEmit(true, false, false, true);
        emit RoyaltyUpdated(royaltyReceiver, 1000);

        koboNFT.setDefaultRoyalty(royaltyReceiver, 1000);
    }

    // ============ State Transition Tests ============

    function testPauseUnpauseStateTransition() public {
        assertFalse(koboNFT.paused(), "Should not be paused initially");

        koboNFT.pause();
        assertTrue(koboNFT.paused(), "Should be paused after pause()");

        koboNFT.unpause();
        assertFalse(koboNFT.paused(), "Should not be paused after unpause()");
    }

    function testTokenCounterIncrement() public {
        assertEq(koboNFT.totalMinted(), 0, "Initial total minted should be 0");

        koboNFT.mint(
            user1,
            "ipfs://QmTest1",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test1")
        );
        assertEq(koboNFT.totalMinted(), 1, "Total minted should be 1");

        koboNFT.mint(
            user2,
            "ipfs://QmTest2",
            KoboNFT.NFTType.VIDEO,
            KoboNFT.GenerationMethod.MANUAL_UPLOAD,
            keccak256("test2")
        );
        assertEq(koboNFT.totalMinted(), 2, "Total minted should be 2");
    }

    function testBalanceStateAfterMultipleTransfers() public {
        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmTest",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );

        assertEq(koboNFT.balanceOf(user1), 1, "User1 should have 1 token");
        assertEq(koboNFT.balanceOf(user2), 0, "User2 should have 0 tokens");

        vm.prank(user1);
        koboNFT.transferFrom(user1, user2, tokenId);

        assertEq(koboNFT.balanceOf(user1), 0, "User1 should have 0 tokens after transfer");
        assertEq(koboNFT.balanceOf(user2), 1, "User2 should have 1 token after transfer");

        vm.prank(user2);
        koboNFT.transferFrom(user2, user1, tokenId);

        assertEq(koboNFT.balanceOf(user1), 1, "User1 should have 1 token after transfer back");
        assertEq(koboNFT.balanceOf(user2), 0, "User2 should have 0 tokens after transfer back");
    }

    // ============ Royalty Tests (EIP-2981) ============

    function testDefaultRoyaltyInfo() public {
        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmTest",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );

        uint256 salePrice = 1 ether;
        (address receiver, uint256 royaltyAmount) = koboNFT.royaltyInfo(tokenId, salePrice);

        assertEq(receiver, owner, "Royalty receiver should be owner");
        assertEq(royaltyAmount, 0.05 ether, "Royalty should be 5% of sale price");
    }

    function testUpdateDefaultRoyalty() public {
        koboNFT.setDefaultRoyalty(royaltyReceiver, 1000); // 10%

        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmTest",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );

        uint256 salePrice = 1 ether;
        (address receiver, uint256 royaltyAmount) = koboNFT.royaltyInfo(tokenId, salePrice);

        assertEq(receiver, royaltyReceiver, "Royalty receiver should be updated");
        assertEq(royaltyAmount, 0.1 ether, "Royalty should be 10% of sale price");
    }

    function testTokenSpecificRoyalty() public {
        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmTest",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );

        koboNFT.setTokenRoyalty(tokenId, royaltyReceiver, 750); // 7.5%

        uint256 salePrice = 1 ether;
        (address receiver, uint256 royaltyAmount) = koboNFT.royaltyInfo(tokenId, salePrice);

        assertEq(receiver, royaltyReceiver, "Token-specific royalty receiver should be set");
        assertEq(royaltyAmount, 0.075 ether, "Royalty should be 7.5% of sale price");
    }

    // ============ Fuzz Tests ============

    function testFuzzMintWithRandomData(
        address to,
        string memory uri,
        uint8 nftTypeRaw,
        uint8 generationMethodRaw,
        bytes32 auditHash
    ) public {
        // Constrain inputs to valid ranges
        vm.assume(to != address(0));
        vm.assume(bytes(uri).length > 0);
        vm.assume(auditHash != bytes32(0));
        // Ensure 'to' is an EOA (not a contract) to avoid ERC721InvalidReceiver errors
        vm.assume(to.code.length == 0);
        // Avoid precompile addresses (0x01-0x09)
        vm.assume(uint160(to) > 9);
        
        KoboNFT.NFTType nftType = KoboNFT.NFTType(bound(nftTypeRaw, 0, 2));
        KoboNFT.GenerationMethod generationMethod = KoboNFT.GenerationMethod(bound(generationMethodRaw, 0, 2));

        uint256 tokenId = koboNFT.mint(to, uri, nftType, generationMethod, auditHash);

        assertEq(koboNFT.ownerOf(tokenId), to, "Token should be minted to specified address");
        assertEq(koboNFT.tokenURI(tokenId), uri, "Token URI should match");
        
        KoboNFT.NFTMetadata memory metadata = koboNFT.getTokenMetadata(tokenId);
        assertEq(uint256(metadata.nftType), uint256(nftType), "NFT type should match");
        assertEq(uint256(metadata.generationMethod), uint256(generationMethod), "Generation method should match");
        assertEq(metadata.copyrightAuditHash, auditHash, "Audit hash should match");
    }

    function testFuzzRoyaltyCalculation(uint96 feeNumerator, uint256 salePrice) public {
        // Constrain fee to valid range (0-100%)
        feeNumerator = uint96(bound(feeNumerator, 0, 10000));
        // Constrain sale price to reasonable range
        salePrice = bound(salePrice, 0, 1000000 ether);

        koboNFT.setDefaultRoyalty(royaltyReceiver, feeNumerator);

        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmFuzz",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("fuzz")
        );

        (address receiver, uint256 royaltyAmount) = koboNFT.royaltyInfo(tokenId, salePrice);

        assertEq(receiver, royaltyReceiver, "Royalty receiver should match");
        assertEq(royaltyAmount, (salePrice * feeNumerator) / 10000, "Royalty calculation should be correct");
        assertTrue(royaltyAmount <= salePrice, "Royalty should not exceed sale price");
    }

    // ============ Integration Tests ============

    function testCompleteNFTLifecycle() public {
        // Mint
        uint256 tokenId = koboNFT.mint(
            user1,
            "ipfs://QmLifecycle",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("lifecycle")
        );

        // Verify ownership
        assertEq(koboNFT.ownerOf(tokenId), user1, "Initial owner should be user1");

        // Transfer
        vm.prank(user1);
        koboNFT.transferFrom(user1, user2, tokenId);
        assertEq(koboNFT.ownerOf(tokenId), user2, "Owner should be user2 after transfer");

        // Check royalty
        (address receiver, uint256 royaltyAmount) = koboNFT.royaltyInfo(tokenId, 1 ether);
        assertEq(receiver, owner, "Royalty receiver should be owner");
        assertEq(royaltyAmount, 0.05 ether, "Royalty should be 5%");

        // Verify metadata persists
        KoboNFT.NFTMetadata memory metadata = koboNFT.getTokenMetadata(tokenId);
        assertEq(uint256(metadata.nftType), uint256(KoboNFT.NFTType.IMAGE), "Metadata should persist");
        assertEq(metadata.creator, owner, "Creator should remain unchanged");
    }

    function testSupportsInterface() public view {
        // ERC721
        assertTrue(koboNFT.supportsInterface(0x80ac58cd), "Should support ERC721");
        // ERC721Metadata
        assertTrue(koboNFT.supportsInterface(0x5b5e139f), "Should support ERC721Metadata");
        // ERC721Enumerable
        assertTrue(koboNFT.supportsInterface(0x780e9d63), "Should support ERC721Enumerable");
        // ERC2981
        assertTrue(koboNFT.supportsInterface(0x2a55205a), "Should support ERC2981");
    }

    // ============ OpenSea contractURI Tests ============

    function testContractURIDefaultValue() public view {
        string memory uri = koboNFT.contractURI();
        assertEq(uri, "https://ipfs.io/ipfs/QmYourCollectionMetadataHash", "Default contract URI should be set");
    }

    function testSetContractURI() public {
        string memory newURI = "https://ipfs.io/ipfs/QmNewCollectionHash";
        koboNFT.setContractURI(newURI);
        
        assertEq(koboNFT.contractURI(), newURI, "Contract URI should be updated");
    }

    function testSetContractURIMultipleTimes() public {
        string memory uri1 = "https://ipfs.io/ipfs/QmHash1";
        string memory uri2 = "https://ipfs.io/ipfs/QmHash2";
        string memory uri3 = "https://ipfs.io/ipfs/QmHash3";

        koboNFT.setContractURI(uri1);
        assertEq(koboNFT.contractURI(), uri1, "First update should work");

        koboNFT.setContractURI(uri2);
        assertEq(koboNFT.contractURI(), uri2, "Second update should work");

        koboNFT.setContractURI(uri3);
        assertEq(koboNFT.contractURI(), uri3, "Third update should work");
    }

    function testOnlyOwnerCanSetContractURI() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        koboNFT.setContractURI("https://ipfs.io/ipfs/QmUnauthorized");
    }

    function testSetContractURIWithEmptyString() public {
        vm.expectRevert("KoboNFT: empty contract URI");
        koboNFT.setContractURI("");
    }

    function testContractURIPersistsAfterMinting() public {
        string memory newURI = "https://ipfs.io/ipfs/QmPersistTest";
        koboNFT.setContractURI(newURI);

        // Mint some NFTs
        koboNFT.mint(
            user1,
            "ipfs://QmToken1",
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test1")
        );

        koboNFT.mint(
            user2,
            "ipfs://QmToken2",
            KoboNFT.NFTType.VIDEO,
            KoboNFT.GenerationMethod.MANUAL_UPLOAD,
            keccak256("test2")
        );

        // Contract URI should remain unchanged
        assertEq(koboNFT.contractURI(), newURI, "Contract URI should persist after minting");
    }

    function testContractURIPersistsAfterPauseUnpause() public {
        string memory newURI = "https://ipfs.io/ipfs/QmPauseTest";
        koboNFT.setContractURI(newURI);

        koboNFT.pause();
        assertEq(koboNFT.contractURI(), newURI, "Contract URI should persist when paused");

        koboNFT.unpause();
        assertEq(koboNFT.contractURI(), newURI, "Contract URI should persist after unpause");
    }

    function testContractURIWithIPFSFormat() public {
        string memory ipfsURI = "ipfs://QmCollectionMetadata123";
        koboNFT.setContractURI(ipfsURI);
        
        assertEq(koboNFT.contractURI(), ipfsURI, "Should support ipfs:// format");
    }

    function testContractURIWithHTTPSFormat() public {
        string memory httpsURI = "https://api.example.com/collection/metadata.json";
        koboNFT.setContractURI(httpsURI);
        
        assertEq(koboNFT.contractURI(), httpsURI, "Should support https:// format");
    }

    function testFuzzSetContractURI(string memory uri) public {
        // Constrain to non-empty strings
        vm.assume(bytes(uri).length > 0);
        vm.assume(bytes(uri).length < 1000); // Reasonable length limit

        koboNFT.setContractURI(uri);
        assertEq(koboNFT.contractURI(), uri, "Contract URI should match fuzzed input");
    }

    function testContractURIIndependentFromTokenURI() public {
        string memory contractMetadataURI = "https://ipfs.io/ipfs/QmCollectionMeta";
        string memory tokenMetadataURI = "ipfs://QmTokenMeta";

        koboNFT.setContractURI(contractMetadataURI);

        uint256 tokenId = koboNFT.mint(
            user1,
            tokenMetadataURI,
            KoboNFT.NFTType.IMAGE,
            KoboNFT.GenerationMethod.AI_GENERATED,
            keccak256("test")
        );

        // Contract URI and token URI should be independent
        assertEq(koboNFT.contractURI(), contractMetadataURI, "Contract URI should be independent");
        assertEq(koboNFT.tokenURI(tokenId), tokenMetadataURI, "Token URI should be independent");
        assertTrue(
            keccak256(bytes(koboNFT.contractURI())) != keccak256(bytes(koboNFT.tokenURI(tokenId))),
            "Contract URI and token URI should be different"
        );
    }
}
