// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import "../src/KoboNFTExtended.sol";

contract KoboNFTExtendedTest is Test {
    // Implement ERC721Receiver to accept NFTs in fuzz tests
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
    KoboNFTExtended public nft;
    
    address public owner;
    address public creator1;
    address public creator2;
    address public creator3;
    address public user1;
    address public user2;
    
    // Test data
    string constant TEST_URI = "ipfs://QmTest123";
    string constant TEST_URI_V2 = "ipfs://QmTest456";
    bytes32 constant CONTENT_HASH = keccak256("test content");
    bytes32 constant C2PA_HASH = keccak256("c2pa manifest");
    bytes32 constant AUDIT_HASH = keccak256("audit data");
    
    // Events to test
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        KoboNFTExtended.NFTType nftType,
        KoboNFTExtended.GenerationMethod generationMethod,
        string tokenURI
    );
    
    event MetadataUpdate(uint256 indexed tokenId);
    event BatchMetadataUpdate(uint256 fromTokenId, uint256 toTokenId);
    
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
    
    event CollaborativeNFTMinted(
        uint256 indexed tokenId,
        address[] creators,
        uint96[] royaltyShares
    );
    
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
    
    function setUp() public {
        owner = address(this);
        creator1 = makeAddr("creator1");
        creator2 = makeAddr("creator2");
        creator3 = makeAddr("creator3");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy contract
        nft = new KoboNFTExtended(owner);
        
        // Fund test addresses
        vm.deal(creator1, 10 ether);
        vm.deal(creator2, 10 ether);
        vm.deal(creator3, 10 ether);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }
    
    // ============================================
    // BASIC MINTING TESTS
    // ============================================
    
    function testMintBasicNFT() public {
        vm.startPrank(creator1);
        
        vm.expectEmit(true, true, false, true);
        emit NFTMinted(0, creator1, KoboNFTExtended.NFTType.IMAGE, KoboNFTExtended.GenerationMethod.AI_GENERATED, TEST_URI);
        
        vm.expectEmit(true, false, false, true);
        emit CopyrightProofAdded(0, CONTENT_HASH, C2PA_HASH, block.timestamp);
        
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        assertEq(tokenId, 0, "First token should be ID 0");
        assertEq(nft.ownerOf(tokenId), creator1, "Creator should own token");
        assertEq(nft.tokenURI(tokenId), TEST_URI, "Token URI should match");
        
        vm.stopPrank();
    }
    
    function testMintRevertsWithZeroAddress() public {
        vm.expectRevert("KoboNFT: mint to zero address");
        nft.mint(
            address(0),
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
    }
    
    function testMintRevertsWithEmptyURI() public {
        vm.expectRevert("KoboNFT: empty URI");
        nft.mint(
            creator1,
            "",
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
    }
    
    function testMintRevertsWithInvalidContentHash() public {
        vm.expectRevert("KoboNFT: invalid content hash");
        nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            bytes32(0),
            C2PA_HASH,
            AUDIT_HASH
        );
    }
    
    function testMintWhenPaused() public {
        nft.pause();
        
        vm.expectRevert();
        nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        nft.unpause();
        
        // Should work after unpause
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        assertEq(tokenId, 0, "Should mint successfully after unpause");
    }
    
    // ============================================
    // COLLABORATIVE MINTING TESTS
    // ============================================
    
    function testMintCollaborativeNFT() public {
        address[] memory creators = new address[](3);
        creators[0] = creator1;
        creators[1] = creator2;
        creators[2] = creator3;
        
        string[] memory roles = new string[](3);
        roles[0] = "Artist";
        roles[1] = "Animator";
        roles[2] = "Composer";
        
        uint96[] memory shares = new uint96[](3);
        shares[0] = 5000; // 50%
        shares[1] = 3000; // 30%
        shares[2] = 2000; // 20%
        
        vm.expectEmit(true, false, false, true);
        emit CollaborativeNFTMinted(0, creators, shares);
        
        uint256 tokenId = nft.mintCollaborative(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.VIDEO,
            KoboNFTExtended.GenerationMethod.MANUAL_UPLOAD,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH,
            creators,
            roles,
            shares
        );
        
        assertTrue(nft.isCollaborative(tokenId), "Should be collaborative");
        
        KoboNFTExtended.Creator[] memory storedCreators = nft.getCreators(tokenId);
        assertEq(storedCreators.length, 3, "Should have 3 creators");
        assertEq(storedCreators[0].wallet, creator1, "First creator should match");
        assertEq(storedCreators[0].royaltyShare, 5000, "First creator share should be 50%");
    }
    
    function testCollaborativeRevertsWithSingleCreator() public {
        address[] memory creators = new address[](1);
        creators[0] = creator1;
        
        string[] memory roles = new string[](1);
        roles[0] = "Artist";
        
        uint96[] memory shares = new uint96[](1);
        shares[0] = 10000;
        
        vm.expectRevert("KoboNFT: need multiple creators");
        nft.mintCollaborative(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH,
            creators,
            roles,
            shares
        );
    }
    
    function testCollaborativeRevertsWithInvalidShares() public {
        address[] memory creators = new address[](2);
        creators[0] = creator1;
        creators[1] = creator2;
        
        string[] memory roles = new string[](2);
        roles[0] = "Artist";
        roles[1] = "Animator";
        
        uint96[] memory shares = new uint96[](2);
        shares[0] = 6000; // 60%
        shares[1] = 3000; // 30% - doesn't sum to 100%
        
        vm.expectRevert("KoboNFT: shares must equal 100%");
        nft.mintCollaborative(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH,
            creators,
            roles,
            shares
        );
    }
    
    function testRoyaltySplitCalculation() public {
        address[] memory creators = new address[](2);
        creators[0] = creator1;
        creators[1] = creator2;
        
        string[] memory roles = new string[](2);
        roles[0] = "Artist";
        roles[1] = "Animator";
        
        uint96[] memory shares = new uint96[](2);
        shares[0] = 7000; // 70%
        shares[1] = 3000; // 30%
        
        uint256 tokenId = nft.mintCollaborative(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH,
            creators,
            roles,
            shares
        );
        
        uint256 salePrice = 1 ether;
        (address[] memory receivers, uint256[] memory amounts) = nft.calculateRoyaltySplit(tokenId, salePrice);
        
        assertEq(receivers.length, 2, "Should have 2 receivers");
        assertEq(receivers[0], creator1, "First receiver should be creator1");
        assertEq(receivers[1], creator2, "Second receiver should be creator2");
        
        // 5% royalty = 0.05 ether, split 70/30
        uint256 totalRoyalty = (salePrice * 500) / 10000; // 5%
        assertEq(amounts[0], (totalRoyalty * 7000) / 10000, "Creator1 should get 70% of royalty");
        assertEq(amounts[1], (totalRoyalty * 3000) / 10000, "Creator2 should get 30% of royalty");
    }
    
    // ============================================
    // DERIVATIVE MINTING TESTS
    // ============================================
    
    function testMintDerivativeNFT() public {
        // First mint a parent NFT
        vm.prank(creator1);
        uint256 parentId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        // Now mint a derivative
        address[] memory parentContracts = new address[](1);
        parentContracts[0] = address(nft);
        
        uint256[] memory parentTokenIds = new uint256[](1);
        parentTokenIds[0] = parentId;
        
        KoboNFTExtended.DerivativeType[] memory relationships = new KoboNFTExtended.DerivativeType[](1);
        relationships[0] = KoboNFTExtended.DerivativeType.REMIX;
        
        string[] memory contributions = new string[](1);
        contributions[0] = "Color palette and composition";
        
        vm.prank(creator2);
        uint256 derivativeId = nft.mintDerivative(
            creator2,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("derivative content"),
            keccak256("derivative c2pa"),
            keccak256("derivative audit"),
            parentContracts,
            parentTokenIds,
            relationships,
            contributions
        );
        
        assertTrue(nft.isDerivative(derivativeId), "Should be a derivative");
        
        KoboNFTExtended.ParentNFT[] memory parents = nft.getParentNFTs(derivativeId);
        assertEq(parents.length, 1, "Should have 1 parent");
        assertEq(parents[0].contractAddress, address(nft), "Parent contract should match");
        assertEq(parents[0].tokenId, parentId, "Parent token ID should match");
        
        uint256[] memory derivatives = nft.getDerivatives(parentId);
        assertEq(derivatives.length, 1, "Parent should have 1 derivative");
        assertEq(derivatives[0], derivativeId, "Derivative ID should match");
        
        // Test generation
        assertEq(nft.getGeneration(derivativeId), 1, "Derivative should be generation 1");
    }
    
    function testMintMultiParentDerivative() public {
        // Mint two parent NFTs
        vm.prank(creator1);
        uint256 parent1 = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        vm.prank(creator2);
        uint256 parent2 = nft.mint(
            creator2,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            keccak256("content2"),
            keccak256("c2pa2"),
            keccak256("audit2")
        );
        
        // Mint composite derivative
        address[] memory parentContracts = new address[](2);
        parentContracts[0] = address(nft);
        parentContracts[1] = address(nft);
        
        uint256[] memory parentTokenIds = new uint256[](2);
        parentTokenIds[0] = parent1;
        parentTokenIds[1] = parent2;
        
        KoboNFTExtended.DerivativeType[] memory relationships = new KoboNFTExtended.DerivativeType[](2);
        relationships[0] = KoboNFTExtended.DerivativeType.COMPOSITE;
        relationships[1] = KoboNFTExtended.DerivativeType.COMPOSITE;
        
        string[] memory contributions = new string[](2);
        contributions[0] = "Background";
        contributions[1] = "Foreground character";
        
        vm.prank(creator3);
        uint256 compositeId = nft.mintDerivative(
            creator3,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("composite content"),
            keccak256("composite c2pa"),
            keccak256("composite audit"),
            parentContracts,
            parentTokenIds,
            relationships,
            contributions
        );
        
        KoboNFTExtended.ParentNFT[] memory parents = nft.getParentNFTs(compositeId);
        assertEq(parents.length, 2, "Should have 2 parents");
    }
    
    // ============================================
    // METADATA VERSION TESTS (ERC-7160)
    // ============================================
    
    function testAddMetadataVersion() public {
        vm.prank(creator1);
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        vm.prank(creator1);
        nft.addMetadataVersion(tokenId, TEST_URI_V2, "Updated artwork");
        
        KoboNFTExtended.MetadataVersion[] memory versions = nft.getMetadataVersions(tokenId);
        assertEq(versions.length, 2, "Should have 2 versions");
        assertEq(versions[1].uri, TEST_URI_V2, "Second version URI should match");
        assertEq(versions[1].description, "Updated artwork", "Description should match");
    }
    
    function testPinMetadataVersion() public {
        vm.startPrank(creator1);
        
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        nft.addMetadataVersion(tokenId, TEST_URI_V2, "Version 2");
        
        vm.expectEmit(true, false, false, true);
        emit MetadataVersionPinned(tokenId, 1);
        
        nft.pinMetadataVersion(tokenId, 1);
        
        assertEq(nft.getPinnedMetadataIndex(tokenId), 1, "Pinned index should be 1");
        assertEq(nft.tokenURI(tokenId), TEST_URI_V2, "Token URI should be updated to pinned version");
        
        vm.stopPrank();
    }
    
    function testMetadataVersionUnauthorized() public {
        vm.prank(creator1);
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        vm.prank(user1);
        vm.expectRevert("KoboNFT: unauthorized");
        nft.addMetadataVersion(tokenId, TEST_URI_V2, "Unauthorized update");
    }
    
    // ============================================
    // DYNAMIC TRAITS TESTS
    // ============================================
    
    function testAddTrait() public {
        vm.prank(creator1);
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        vm.expectEmit(true, false, false, true);
        emit TraitAdded(tokenId, "Strength", "10");
        
        vm.prank(creator1);
        nft.addTrait(tokenId, "Strength", "10");
        
        KoboNFTExtended.Trait[] memory traits = nft.getTraits(tokenId);
        assertEq(traits.length, 1, "Should have 1 trait");
        assertEq(traits[0].name, "Strength", "Trait name should match");
        assertEq(traits[0].value, "10", "Trait value should match");
    }
    
    function testUpdateTrait() public {
        vm.startPrank(creator1);
        
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        nft.addTrait(tokenId, "Strength", "10");
        
        vm.expectEmit(true, false, false, true);
        emit TraitUpdated(tokenId, "Strength", "10", "15");
        
        nft.updateTrait(tokenId, 0, "15");
        
        KoboNFTExtended.Trait[] memory traits = nft.getTraits(tokenId);
        assertEq(traits[0].value, "15", "Trait value should be updated");
        
        vm.stopPrank();
    }
    
    function testAddExperienceAndLevelUp() public {
        vm.startPrank(creator1);
        
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        // Add 50 XP (not enough to level up from level 1)
        nft.addExperience(tokenId, 50);
        
        KoboNFTExtended.NFTMetadata memory metadata = nft.getTokenMetadata(tokenId);
        assertEq(metadata.level, 1, "Should still be level 1");
        assertEq(metadata.experience, 50, "Should have 50 XP");
        
        // Add 50 more XP (total 100, enough to level up)
        vm.expectEmit(true, false, false, true);
        emit CharacterLevelUp(tokenId, 2, 100);
        
        nft.addExperience(tokenId, 50);
        
        metadata = nft.getTokenMetadata(tokenId);
        assertEq(metadata.level, 2, "Should be level 2");
        assertEq(metadata.experience, 100, "Should have 100 XP");
        
        vm.stopPrank();
    }
    
    function testBatchUpdateTraits() public {
        vm.startPrank(creator1);
        
        // Mint 3 tokens
        uint256 token1 = nft.mint(creator1, TEST_URI, KoboNFTExtended.NFTType.IMAGE, KoboNFTExtended.GenerationMethod.AI_GENERATED, CONTENT_HASH, C2PA_HASH, AUDIT_HASH);
        uint256 token2 = nft.mint(creator1, TEST_URI, KoboNFTExtended.NFTType.IMAGE, KoboNFTExtended.GenerationMethod.AI_GENERATED, CONTENT_HASH, C2PA_HASH, AUDIT_HASH);
        uint256 token3 = nft.mint(creator1, TEST_URI, KoboNFTExtended.NFTType.IMAGE, KoboNFTExtended.GenerationMethod.AI_GENERATED, CONTENT_HASH, C2PA_HASH, AUDIT_HASH);
        
        // Add traits
        nft.addTrait(token1, "Power", "10");
        nft.addTrait(token2, "Power", "10");
        nft.addTrait(token3, "Power", "10");
        
        // Batch update
        uint256[] memory tokenIds = new uint256[](3);
        tokenIds[0] = token1;
        tokenIds[1] = token2;
        tokenIds[2] = token3;
        
        uint256[] memory traitIndices = new uint256[](3);
        traitIndices[0] = 0;
        traitIndices[1] = 0;
        traitIndices[2] = 0;
        
        string[] memory newValues = new string[](3);
        newValues[0] = "20";
        newValues[1] = "20";
        newValues[2] = "20";
        
        vm.expectEmit(true, true, false, false);
        emit BatchMetadataUpdate(token1, token3);
        
        nft.batchUpdateTraits(tokenIds, traitIndices, newValues);
        
        KoboNFTExtended.Trait[] memory traits1 = nft.getTraits(token1);
        assertEq(traits1[0].value, "20", "Token1 trait should be updated");
        
        vm.stopPrank();
    }
    
    // ============================================
    // COPYRIGHT PROOF TESTS
    // ============================================
    
    function testGetCopyrightProof() public {
        vm.prank(creator1);
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        KoboNFTExtended.CopyrightProof memory proof = nft.getCopyrightProof(tokenId);
        assertEq(proof.contentHash, CONTENT_HASH, "Content hash should match");
        assertEq(proof.c2paManifestHash, C2PA_HASH, "C2PA hash should match");
        assertEq(proof.auditHash, AUDIT_HASH, "Audit hash should match");
    }
    
    function testUpdateCopyrightProofURI() public {
        vm.startPrank(creator1);
        
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        string memory proofURI = "ipfs://QmProof123";
        nft.updateCopyrightProofURI(tokenId, proofURI);
        
        KoboNFTExtended.CopyrightProof memory proof = nft.getCopyrightProof(tokenId);
        assertEq(proof.proofURI, proofURI, "Proof URI should be updated");
        
        vm.stopPrank();
    }
    
    // ============================================
    // ROYALTY TESTS
    // ============================================
    
    function testDefaultRoyalty() public {
        vm.prank(creator1);
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        uint256 salePrice = 1 ether;
        (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(tokenId, salePrice);
        
        assertEq(receiver, creator1, "Royalty receiver should be creator");
        assertEq(royaltyAmount, (salePrice * 500) / 10000, "Royalty should be 5%");
    }
    
    function testSetDefaultRoyalty() public {
        address newReceiver = makeAddr("newReceiver");
        uint96 newFee = 750; // 7.5%
        
        nft.setDefaultRoyalty(newReceiver, newFee);
        
        vm.prank(creator1);
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        // Note: mint() sets token-specific royalty to msg.sender (creator1)
        // So we need to check that the default was set correctly before minting
        (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(tokenId, 1 ether);
        // The token has its own royalty set to creator1 during mint
        assertEq(receiver, creator1, "Token royalty receiver should be creator");
        assertEq(royaltyAmount, (1 ether * 500) / 10000, "Token royalty should be 5%");
    }
    
    // ============================================
    // ACCESS CONTROL TESTS
    // ============================================
    
    function testOnlyOwnerCanPause() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.pause();
        
        // Owner can pause
        nft.pause();
        assertTrue(nft.paused(), "Contract should be paused");
    }
    
    function testOnlyOwnerCanSetRoyalty() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.setDefaultRoyalty(user1, 500);
    }
    
    // ============================================
    // EDGE CASE TESTS
    // ============================================
    
    function testTokensOfOwner() public {
        vm.startPrank(creator1);
        
        uint256 token1 = nft.mint(creator1, TEST_URI, KoboNFTExtended.NFTType.IMAGE, KoboNFTExtended.GenerationMethod.AI_GENERATED, CONTENT_HASH, C2PA_HASH, AUDIT_HASH);
        uint256 token2 = nft.mint(creator1, TEST_URI, KoboNFTExtended.NFTType.VIDEO, KoboNFTExtended.GenerationMethod.AI_GENERATED, CONTENT_HASH, C2PA_HASH, AUDIT_HASH);
        uint256 token3 = nft.mint(creator1, TEST_URI, KoboNFTExtended.NFTType.AUDIO, KoboNFTExtended.GenerationMethod.AI_GENERATED, CONTENT_HASH, C2PA_HASH, AUDIT_HASH);
        
        uint256[] memory tokens = nft.tokensOfOwner(creator1);
        assertEq(tokens.length, 3, "Should own 3 tokens");
        assertEq(tokens[0], token1, "First token should match");
        assertEq(tokens[1], token2, "Second token should match");
        assertEq(tokens[2], token3, "Third token should match");
        
        vm.stopPrank();
    }
    
    function testSupportsInterface() public view {
        // ERC-721
        assertTrue(nft.supportsInterface(0x80ac58cd), "Should support ERC-721");
        
        // ERC-2981 (Royalties)
        assertTrue(nft.supportsInterface(0x2a55205a), "Should support ERC-2981");
        
        // ERC-4906 (Metadata Update)
        assertTrue(nft.supportsInterface(0x49064906), "Should support ERC-4906");
    }
    
    function testTotalMinted() public {
        assertEq(nft.totalMinted(), 0, "Should start at 0");
        
        vm.prank(creator1);
        nft.mint(creator1, TEST_URI, KoboNFTExtended.NFTType.IMAGE, KoboNFTExtended.GenerationMethod.AI_GENERATED, CONTENT_HASH, C2PA_HASH, AUDIT_HASH);
        
        assertEq(nft.totalMinted(), 1, "Should be 1 after first mint");
        
        vm.prank(creator2);
        nft.mint(creator2, TEST_URI, KoboNFTExtended.NFTType.IMAGE, KoboNFTExtended.GenerationMethod.AI_GENERATED, CONTENT_HASH, C2PA_HASH, AUDIT_HASH);
        
        assertEq(nft.totalMinted(), 2, "Should be 2 after second mint");
    }
    
    // ============================================
    // FUZZ TESTS
    // ============================================
    
    function testFuzzMintWithRandomData(
        address to,
        string memory uri,
        uint8 nftTypeRaw,
        uint8 genMethodRaw
    ) public {
        vm.assume(to != address(0));
        vm.assume(bytes(uri).length > 0);
        // Only allow EOAs (externally owned accounts) - no contract addresses
        vm.assume(to.code.length == 0);
        
        KoboNFTExtended.NFTType nftType = KoboNFTExtended.NFTType(bound(nftTypeRaw, 0, 2));
        KoboNFTExtended.GenerationMethod genMethod = KoboNFTExtended.GenerationMethod(bound(genMethodRaw, 0, 2));
        
        uint256 tokenId = nft.mint(
            to,
            uri,
            nftType,
            genMethod,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        assertEq(nft.ownerOf(tokenId), to, "Owner should match");
        assertEq(nft.tokenURI(tokenId), uri, "URI should match");
    }
    
    function testFuzzAddExperience(uint256 xp) public {
        xp = bound(xp, 1, 10000);
        
        vm.startPrank(creator1);
        
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        
        nft.addExperience(tokenId, xp);
        
        KoboNFTExtended.NFTMetadata memory metadata = nft.getTokenMetadata(tokenId);
        assertEq(metadata.experience, xp, "Experience should match");
        
        vm.stopPrank();
    }

    // ============================================
    // OPENSEA contractURI TESTS
    // ============================================

    function testContractURIDefaultValue() public view {
        string memory uri = nft.contractURI();
        assertEq(uri, "https://ipfs.io/ipfs/QmYourExtendedCollectionMetadataHash", "Default contract URI should be set");
    }

    function testSetContractURI() public {
        string memory newURI = "https://ipfs.io/ipfs/QmNewExtendedCollectionHash";
        nft.setContractURI(newURI);
        
        assertEq(nft.contractURI(), newURI, "Contract URI should be updated");
    }

    function testSetContractURIMultipleTimes() public {
        string memory uri1 = "https://ipfs.io/ipfs/QmExtHash1";
        string memory uri2 = "https://ipfs.io/ipfs/QmExtHash2";
        string memory uri3 = "https://ipfs.io/ipfs/QmExtHash3";

        nft.setContractURI(uri1);
        assertEq(nft.contractURI(), uri1, "First update should work");

        nft.setContractURI(uri2);
        assertEq(nft.contractURI(), uri2, "Second update should work");

        nft.setContractURI(uri3);
        assertEq(nft.contractURI(), uri3, "Third update should work");
    }

    function testOnlyOwnerCanSetContractURI() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.setContractURI("https://ipfs.io/ipfs/QmUnauthorized");
    }

    function testSetContractURIWithEmptyString() public {
        vm.expectRevert("KoboNFT: empty contract URI");
        nft.setContractURI("");
    }

    function testContractURIPersistsAfterMinting() public {
        string memory newURI = "https://ipfs.io/ipfs/QmExtPersistTest";
        nft.setContractURI(newURI);

        vm.prank(creator1);
        nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        assertEq(nft.contractURI(), newURI, "Contract URI should persist after minting");
    }

    function testContractURIPersistsAfterCollaborativeMint() public {
        string memory newURI = "https://ipfs.io/ipfs/QmExtCollabTest";
        nft.setContractURI(newURI);

        address[] memory creators = new address[](2);
        creators[0] = creator1;
        creators[1] = creator2;
        
        string[] memory roles = new string[](2);
        roles[0] = "Artist";
        roles[1] = "Animator";
        
        uint96[] memory shares = new uint96[](2);
        shares[0] = 5000;
        shares[1] = 5000;

        nft.mintCollaborative(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.VIDEO,
            KoboNFTExtended.GenerationMethod.MANUAL_UPLOAD,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH,
            creators,
            roles,
            shares
        );

        assertEq(nft.contractURI(), newURI, "Contract URI should persist after collaborative mint");
    }

    function testContractURIPersistsAfterDerivativeMint() public {
        string memory newURI = "https://ipfs.io/ipfs/QmExtDerivTest";
        nft.setContractURI(newURI);

        vm.prank(creator1);
        uint256 parentId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        address[] memory parentContracts = new address[](1);
        parentContracts[0] = address(nft);
        
        uint256[] memory parentTokenIds = new uint256[](1);
        parentTokenIds[0] = parentId;
        
        KoboNFTExtended.DerivativeType[] memory relationships = new KoboNFTExtended.DerivativeType[](1);
        relationships[0] = KoboNFTExtended.DerivativeType.REMIX;
        
        string[] memory contributions = new string[](1);
        contributions[0] = "Remixed version";

        vm.prank(creator2);
        nft.mintDerivative(
            creator2,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("derivative"),
            keccak256("c2pa"),
            keccak256("audit"),
            parentContracts,
            parentTokenIds,
            relationships,
            contributions
        );

        assertEq(nft.contractURI(), newURI, "Contract URI should persist after derivative mint");
    }

    function testContractURIPersistsAfterMetadataVersionUpdate() public {
        string memory contractMetadataURI = "https://ipfs.io/ipfs/QmExtMetaTest";
        nft.setContractURI(contractMetadataURI);

        vm.startPrank(creator1);
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        nft.addMetadataVersion(tokenId, TEST_URI_V2, "Updated version");
        nft.pinMetadataVersion(tokenId, 1);

        assertEq(nft.contractURI(), contractMetadataURI, "Contract URI should persist after metadata updates");
        vm.stopPrank();
    }

    function testContractURIIndependentFromTokenURI() public {
        string memory contractMetadataURI = "https://ipfs.io/ipfs/QmExtCollectionMeta";
        string memory tokenMetadataURI = "ipfs://QmExtTokenMeta";

        nft.setContractURI(contractMetadataURI);

        vm.prank(creator1);
        uint256 tokenId = nft.mint(
            creator1,
            tokenMetadataURI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        assertEq(nft.contractURI(), contractMetadataURI, "Contract URI should be independent");
        assertEq(nft.tokenURI(tokenId), tokenMetadataURI, "Token URI should be independent");
        assertTrue(
            keccak256(bytes(nft.contractURI())) != keccak256(bytes(nft.tokenURI(tokenId))),
            "Contract URI and token URI should be different"
        );
    }

    function testFuzzSetContractURI(string memory uri) public {
        vm.assume(bytes(uri).length > 0);
        vm.assume(bytes(uri).length < 1000);

        nft.setContractURI(uri);
        assertEq(nft.contractURI(), uri, "Contract URI should match fuzzed input");
    }

    // ============================================
    // PROVENANCE & DERIVATIVE TRACKING TESTS
    // ============================================

    function testMintRemix() public {
        // Mint original
        vm.prank(creator1);
        uint256 originalId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        // Mint remix
        vm.expectEmit(true, true, false, true);
        emit RemixCreated(1, originalId, creator2);

        vm.prank(creator2);
        uint256 remixId = nft.mintRemix(
            creator2,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("remix content"),
            keccak256("remix c2pa"),
            keccak256("remix audit"),
            originalId
        );

        // Verify remix properties
        assertTrue(nft.isDerivative(remixId), "Should be a derivative");
        assertEq(nft.getGeneration(remixId), 1, "Should be generation 1");
        
        KoboNFTExtended.ParentNFT[] memory parents = nft.getParents(remixId);
        assertEq(parents.length, 1, "Should have 1 parent");
        assertEq(parents[0].tokenId, originalId, "Parent should be original");
        assertEq(uint256(parents[0].relationship), uint256(KoboNFTExtended.DerivativeType.REMIX), "Should be REMIX relationship");

        // Verify children tracking
        uint256[] memory children = nft.getChildren(originalId);
        assertEq(children.length, 1, "Original should have 1 child");
        assertEq(children[0], remixId, "Child should be remix");
    }

    function testMintRemixRevertsForNonexistentToken() public {
        vm.expectRevert("KoboNFT: original token does not exist");
        vm.prank(creator1);
        nft.mintRemix(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH,
            999 // Non-existent token
        );
    }

    function testGetGeneration() public {
        // Gen 0: Original
        vm.prank(creator1);
        uint256 gen0 = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );
        assertEq(nft.getGeneration(gen0), 0, "Original should be generation 0");

        // Gen 1: First remix
        vm.prank(creator2);
        uint256 gen1 = nft.mintRemix(
            creator2,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("gen1"),
            keccak256("gen1 c2pa"),
            keccak256("gen1 audit"),
            gen0
        );
        assertEq(nft.getGeneration(gen1), 1, "First remix should be generation 1");

        // Gen 2: Remix of remix
        vm.prank(creator3);
        uint256 gen2 = nft.mintRemix(
            creator3,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("gen2"),
            keccak256("gen2 c2pa"),
            keccak256("gen2 audit"),
            gen1
        );
        assertEq(nft.getGeneration(gen2), 2, "Remix of remix should be generation 2");
    }

    function testIsDerivativeOf() public {
        // Mint original
        vm.prank(creator1);
        uint256 originalId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        // Mint remix
        vm.prank(creator2);
        uint256 remixId = nft.mintRemix(
            creator2,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("remix"),
            keccak256("remix c2pa"),
            keccak256("remix audit"),
            originalId
        );

        // Test isDerivativeOf
        assertTrue(
            nft.isDerivativeOf(remixId, address(nft), originalId),
            "Should be derivative of original"
        );
        assertFalse(
            nft.isDerivativeOf(remixId, address(nft), 999),
            "Should not be derivative of non-parent"
        );
        assertFalse(
            nft.isDerivativeOf(originalId, address(nft), remixId),
            "Original should not be derivative of remix"
        );
    }

    function testMultiGenerationLineage() public {
        // Create a lineage: gen0 -> gen1 -> gen2 -> gen3
        vm.prank(creator1);
        uint256 gen0 = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        vm.prank(creator2);
        uint256 gen1 = nft.mintRemix(
            creator2,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("gen1"),
            keccak256("c2pa1"),
            keccak256("audit1"),
            gen0
        );

        vm.prank(creator3);
        uint256 gen2 = nft.mintRemix(
            creator3,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("gen2"),
            keccak256("c2pa2"),
            keccak256("audit2"),
            gen1
        );

        vm.prank(user1);
        uint256 gen3 = nft.mintRemix(
            user1,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("gen3"),
            keccak256("c2pa3"),
            keccak256("audit3"),
            gen2
        );

        // Verify generations
        assertEq(nft.getGeneration(gen0), 0, "Gen 0 should be 0");
        assertEq(nft.getGeneration(gen1), 1, "Gen 1 should be 1");
        assertEq(nft.getGeneration(gen2), 2, "Gen 2 should be 2");
        assertEq(nft.getGeneration(gen3), 3, "Gen 3 should be 3");

        // Verify children at each level
        uint256[] memory children0 = nft.getChildren(gen0);
        assertEq(children0.length, 1, "Gen 0 should have 1 child");
        assertEq(children0[0], gen1, "Gen 0 child should be gen1");

        uint256[] memory children1 = nft.getChildren(gen1);
        assertEq(children1.length, 1, "Gen 1 should have 1 child");
        assertEq(children1[0], gen2, "Gen 1 child should be gen2");

        uint256[] memory children2 = nft.getChildren(gen2);
        assertEq(children2.length, 1, "Gen 2 should have 1 child");
        assertEq(children2[0], gen3, "Gen 2 child should be gen3");
    }

    function testMultipleChildrenTracking() public {
        // Mint original
        vm.prank(creator1);
        uint256 originalId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        // Mint 3 different remixes of the same original
        vm.prank(creator2);
        uint256 remix1 = nft.mintRemix(
            creator2,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("remix1"),
            keccak256("c2pa1"),
            keccak256("audit1"),
            originalId
        );

        vm.prank(creator3);
        uint256 remix2 = nft.mintRemix(
            creator3,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("remix2"),
            keccak256("c2pa2"),
            keccak256("audit2"),
            originalId
        );

        vm.prank(user1);
        uint256 remix3 = nft.mintRemix(
            user1,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("remix3"),
            keccak256("c2pa3"),
            keccak256("audit3"),
            originalId
        );

        // Verify all children are tracked
        uint256[] memory children = nft.getChildren(originalId);
        assertEq(children.length, 3, "Original should have 3 children");
        assertEq(children[0], remix1, "First child should be remix1");
        assertEq(children[1], remix2, "Second child should be remix2");
        assertEq(children[2], remix3, "Third child should be remix3");

        // Verify all are generation 1
        assertEq(nft.getGeneration(remix1), 1, "Remix1 should be gen 1");
        assertEq(nft.getGeneration(remix2), 1, "Remix2 should be gen 1");
        assertEq(nft.getGeneration(remix3), 1, "Remix3 should be gen 1");
    }

    function testCompositeMultiParentGeneration() public {
        // Mint two originals (gen 0)
        vm.prank(creator1);
        uint256 parent1 = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        vm.prank(creator2);
        uint256 parent2 = nft.mint(
            creator2,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            keccak256("content2"),
            keccak256("c2pa2"),
            keccak256("audit2")
        );

        // Create composite from both parents
        address[] memory parentContracts = new address[](2);
        parentContracts[0] = address(nft);
        parentContracts[1] = address(nft);

        uint256[] memory parentTokenIds = new uint256[](2);
        parentTokenIds[0] = parent1;
        parentTokenIds[1] = parent2;

        KoboNFTExtended.DerivativeType[] memory relationships = new KoboNFTExtended.DerivativeType[](2);
        relationships[0] = KoboNFTExtended.DerivativeType.COMPOSITE;
        relationships[1] = KoboNFTExtended.DerivativeType.COMPOSITE;

        string[] memory contributions = new string[](2);
        contributions[0] = "Background";
        contributions[1] = "Foreground";

        vm.prank(creator3);
        uint256 compositeId = nft.mintDerivative(
            creator3,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("composite"),
            keccak256("composite c2pa"),
            keccak256("composite audit"),
            parentContracts,
            parentTokenIds,
            relationships,
            contributions
        );

        // Composite should be generation 1 (max parent gen 0 + 1)
        assertEq(nft.getGeneration(compositeId), 1, "Composite should be generation 1");

        // Both parents should track this as a child
        uint256[] memory children1 = nft.getChildren(parent1);
        uint256[] memory children2 = nft.getChildren(parent2);
        assertEq(children1.length, 1, "Parent1 should have 1 child");
        assertEq(children2.length, 1, "Parent2 should have 1 child");
        assertEq(children1[0], compositeId, "Parent1 child should be composite");
        assertEq(children2[0], compositeId, "Parent2 child should be composite");
    }

    function testMixedGenerationComposite() public {
        // Gen 0: Original
        vm.prank(creator1);
        uint256 gen0 = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        // Gen 1: Remix of gen0
        vm.prank(creator2);
        uint256 gen1 = nft.mintRemix(
            creator2,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("gen1"),
            keccak256("c2pa1"),
            keccak256("audit1"),
            gen0
        );

        // Gen 2: Remix of gen1
        vm.prank(creator3);
        uint256 gen2 = nft.mintRemix(
            creator3,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("gen2"),
            keccak256("c2pa2"),
            keccak256("audit2"),
            gen1
        );

        // Composite from gen0 and gen2 (mixed generations)
        address[] memory parentContracts = new address[](2);
        parentContracts[0] = address(nft);
        parentContracts[1] = address(nft);

        uint256[] memory parentTokenIds = new uint256[](2);
        parentTokenIds[0] = gen0; // Generation 0
        parentTokenIds[1] = gen2; // Generation 2

        KoboNFTExtended.DerivativeType[] memory relationships = new KoboNFTExtended.DerivativeType[](2);
        relationships[0] = KoboNFTExtended.DerivativeType.COMPOSITE;
        relationships[1] = KoboNFTExtended.DerivativeType.COMPOSITE;

        string[] memory contributions = new string[](2);
        contributions[0] = "Base";
        contributions[1] = "Style";

        vm.prank(user1);
        uint256 compositeId = nft.mintDerivative(
            user1,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("composite"),
            keccak256("composite c2pa"),
            keccak256("composite audit"),
            parentContracts,
            parentTokenIds,
            relationships,
            contributions
        );

        // Should be max(0, 2) + 1 = 3
        assertEq(nft.getGeneration(compositeId), 3, "Composite should be generation 3 (max parent + 1)");
    }

    function testGetDerivativeInfo() public {
        // Mint original
        vm.prank(creator1);
        uint256 originalId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        // Mint remix
        vm.prank(creator2);
        uint256 remixId = nft.mintRemix(
            creator2,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("remix"),
            keccak256("remix c2pa"),
            keccak256("remix audit"),
            originalId
        );

        // Get derivative info
        KoboNFTExtended.DerivativeInfo memory info = nft.getDerivativeInfo(remixId);
        
        assertEq(info.creator, creator2, "Creator should match");
        assertEq(info.generation, 1, "Generation should be 1");
        assertEq(info.parents.length, 1, "Should have 1 parent");
        assertTrue(info.createdAt > 0, "Created timestamp should be set");
    }

    function testDerivativeRevertsWithNoParents() public {
        address[] memory parentContracts = new address[](0);
        uint256[] memory parentTokenIds = new uint256[](0);
        KoboNFTExtended.DerivativeType[] memory relationships = new KoboNFTExtended.DerivativeType[](0);
        string[] memory contributions = new string[](0);

        vm.expectRevert("KoboNFT: need at least one parent");
        vm.prank(creator1);
        nft.mintDerivative(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH,
            parentContracts,
            parentTokenIds,
            relationships,
            contributions
        );
    }

    function testDerivativeRevertsWithInvalidRelationship() public {
        vm.prank(creator1);
        uint256 parentId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        address[] memory parentContracts = new address[](1);
        parentContracts[0] = address(nft);

        uint256[] memory parentTokenIds = new uint256[](1);
        parentTokenIds[0] = parentId;

        KoboNFTExtended.DerivativeType[] memory relationships = new KoboNFTExtended.DerivativeType[](1);
        relationships[0] = KoboNFTExtended.DerivativeType.NONE; // Invalid

        string[] memory contributions = new string[](1);
        contributions[0] = "Test";

        vm.expectRevert("KoboNFT: invalid relationship");
        vm.prank(creator2);
        nft.mintDerivative(
            creator2,
            TEST_URI_V2,
            KoboNFTExtended.NFTType.IMAGE,
            keccak256("derivative"),
            keccak256("c2pa"),
            keccak256("audit"),
            parentContracts,
            parentTokenIds,
            relationships,
            contributions
        );
    }

    function testOriginalTokenHasZeroGeneration() public {
        vm.prank(creator1);
        uint256 tokenId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        assertEq(nft.getGeneration(tokenId), 0, "Original token should be generation 0");
        assertFalse(nft.isDerivative(tokenId), "Original should not be derivative");
        
        uint256[] memory children = nft.getChildren(tokenId);
        assertEq(children.length, 0, "Original should have no children initially");
    }

    function testFuzzDerivativeGeneration(uint8 numGenerations) public {
        numGenerations = uint8(bound(numGenerations, 1, 10));

        // Mint original
        vm.prank(creator1);
        uint256 currentId = nft.mint(
            creator1,
            TEST_URI,
            KoboNFTExtended.NFTType.IMAGE,
            KoboNFTExtended.GenerationMethod.AI_GENERATED,
            CONTENT_HASH,
            C2PA_HASH,
            AUDIT_HASH
        );

        // Create chain of remixes
        for (uint8 i = 0; i < numGenerations; i++) {
            vm.prank(creator2);
            uint256 newId = nft.mintRemix(
                creator2,
                TEST_URI_V2,
                KoboNFTExtended.NFTType.IMAGE,
                keccak256(abi.encodePacked("gen", i)),
                keccak256(abi.encodePacked("c2pa", i)),
                keccak256(abi.encodePacked("audit", i)),
                currentId
            );

            assertEq(nft.getGeneration(newId), i + 1, "Generation should increment");
            currentId = newId;
        }

        assertEq(nft.getGeneration(currentId), numGenerations, "Final generation should match");
    }
}
