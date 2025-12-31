// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import "../src/KoboGovernanceToken.sol";
import "../src/KoboTimelock.sol";
import "../src/KoboGovernor.sol";
import "../src/TemporaryDeployFactory.sol";

contract KoboGovernanceTest is Test {
    KoboGovernanceToken public token;
    KoboTimelock public timelock;
    KoboGovernor public governor;
    
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    
    // Events from contracts
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 duration);
    event TokensVested(address indexed beneficiary, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
    event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);
    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        address[] targets,
        uint256[] values,
        string[] signatures,
        bytes[] calldatas,
        uint256 voteStart,
        uint256 voteEnd,
        string description
    );
    event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason);
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy contracts
        token = new KoboGovernanceToken();
        
        uint256 minDelay = 2 days;
        address[] memory proposers = new address[](1);
        proposers[0] = owner;
        address[] memory executors = new address[](1);
        executors[0] = address(0);
        
        timelock = new KoboTimelock(minDelay, proposers, executors, owner);
        governor = new KoboGovernor(IVotes(address(token)), TimelockController(payable(address(timelock))));
        
        // Fund test addresses
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
    }
    
    // ============ Happy Path Tests ============
    
    function testInitialSupply() public view {
        assertEq(token.totalSupply(), token.INITIAL_SUPPLY());
        assertEq(token.balanceOf(owner), token.INITIAL_SUPPLY());
    }
    
    function testTokenMetadata() public view {
        assertEq(token.name(), "Kobo Governance Token");
        assertEq(token.symbol(), "KOBO");
        assertEq(token.decimals(), 18);
    }
    
    function testMintTokens() public {
        uint256 mintAmount = 1000e18;
        token.mint(user1, mintAmount);
        assertEq(token.balanceOf(user1), mintAmount);
        assertEq(token.totalSupply(), token.INITIAL_SUPPLY() + mintAmount);
    }
    
    function testTransferTokens() public {
        uint256 transferAmount = 1000e18;
        token.transfer(user1, transferAmount);
        assertEq(token.balanceOf(user1), transferAmount);
        assertEq(token.balanceOf(owner), token.INITIAL_SUPPLY() - transferAmount);
    }
    
    function testBurnTokens() public {
        uint256 burnAmount = 1000e18;
        token.burn(burnAmount);
        assertEq(token.totalSupply(), token.INITIAL_SUPPLY() - burnAmount);
    }
    
    function testDelegateVotes() public {
        token.transfer(user1, 1000e18);
        
        vm.prank(user1);
        token.delegate(user2);
        
        assertEq(token.getVotes(user2), 1000e18);
        assertEq(token.delegates(user1), user2);
    }
    
    function testSelfDelegate() public {
        token.transfer(user1, 1000e18);
        
        vm.prank(user1);
        token.delegate(user1);
        
        assertEq(token.getVotes(user1), 1000e18);
    }
    
    function testCreateVestingSchedule() public {
        uint256 vestingAmount = 10000e18;
        uint256 duration = 365 days;
        uint256 cliffDuration = 90 days;
        
        vm.expectEmit(true, false, false, true);
        emit VestingScheduleCreated(user1, vestingAmount, duration);
        
        token.createVestingSchedule(user1, vestingAmount, duration, cliffDuration);
        
        (uint256 totalAmount, uint256 releasedAmount, uint256 startTime, uint256 vestDuration, uint256 cliff) = 
            token.vestingSchedules(user1);
        
        assertEq(totalAmount, vestingAmount);
        assertEq(releasedAmount, 0);
        assertEq(vestDuration, duration);
        assertEq(cliff, cliffDuration);
        assertTrue(startTime > 0);
    }
    
    function testReleaseVestedTokensAfterCliff() public {
        uint256 vestingAmount = 10000e18;
        uint256 duration = 365 days;
        uint256 cliffDuration = 90 days;
        
        token.createVestingSchedule(user1, vestingAmount, duration, cliffDuration);
        
        // Fast forward past cliff
        vm.warp(block.timestamp + cliffDuration + 1 days);
        
        uint256 releasable = token.getReleasableAmount(user1);
        assertTrue(releasable > 0);
        
        vm.prank(user1);
        token.releaseVestedTokens();
        
        assertTrue(token.balanceOf(user1) > 0);
    }
    
    function testReleaseAllVestedTokensAfterFullDuration() public {
        uint256 vestingAmount = 10000e18;
        uint256 duration = 365 days;
        uint256 cliffDuration = 90 days;
        
        token.createVestingSchedule(user1, vestingAmount, duration, cliffDuration);
        
        // Fast forward past full duration
        vm.warp(block.timestamp + duration + 1 days);
        
        vm.prank(user1);
        token.releaseVestedTokens();
        
        assertEq(token.balanceOf(user1), vestingAmount);
    }
    
    function testGovernorProposal() public {
        // Give tokens and delegate
        token.transfer(user1, 2000e18);
        vm.prank(user1);
        token.delegate(user1);
        
        // Mine a block to update voting power
        vm.roll(block.number + 1);
        
        // Create proposal
        address[] memory targets = new address[](1);
        targets[0] = address(token);
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSignature("mint(address,uint256)", user2, 1000e18);
        
        vm.prank(user1);
        uint256 proposalId = governor.propose(targets, values, calldatas, "Mint tokens to user2");
        
        assertTrue(proposalId > 0);
    }
    
    function testGovernorVoting() public {
        // Setup: Give tokens and delegate
        token.transfer(user1, 2000e18);
        token.transfer(user2, 3000e18);
        
        vm.prank(user1);
        token.delegate(user1);
        vm.prank(user2);
        token.delegate(user2);
        
        vm.roll(block.number + 1);
        
        // Create proposal
        address[] memory targets = new address[](1);
        targets[0] = address(token);
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSignature("mint(address,uint256)", user3, 1000e18);
        
        vm.prank(user1);
        uint256 proposalId = governor.propose(targets, values, calldatas, "Test proposal");
        
        // Fast forward past voting delay
        vm.roll(block.number + governor.votingDelay() + 1);
        
        // Vote
        vm.prank(user1);
        governor.castVote(proposalId, 1); // Vote for
        
        vm.prank(user2);
        governor.castVote(proposalId, 1); // Vote for
        
        assertTrue(governor.hasVoted(proposalId, user1));
        assertTrue(governor.hasVoted(proposalId, user2));
    }
    
    // ============ Access Control Tests ============
    
    function testOnlyOwnerCanMint() public {
        vm.prank(user1);
        vm.expectRevert();
        token.mint(user2, 1000e18);
    }
    
    function testOnlyOwnerCanCreateVestingSchedule() public {
        vm.prank(user1);
        vm.expectRevert();
        token.createVestingSchedule(user2, 1000e18, 365 days, 90 days);
    }
    
    function testOnlyProposerCanPropose() public {
        // user1 has no tokens, cannot propose
        address[] memory targets = new address[](1);
        targets[0] = address(token);
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSignature("mint(address,uint256)", user2, 1000e18);
        
        vm.prank(user1);
        vm.expectRevert();
        governor.propose(targets, values, calldatas, "Should fail");
    }
    
    // ============ Edge Case Tests ============
    
    function testMintZeroTokens() public {
        token.mint(user1, 0);
        assertEq(token.balanceOf(user1), 0);
    }
    
    function testTransferZeroTokens() public {
        token.transfer(user1, 0);
        assertEq(token.balanceOf(user1), 0);
    }
    
    function testGetReleasableAmountWithNoSchedule() public view {
        assertEq(token.getReleasableAmount(user1), 0);
    }
    
    function testGetReleasableAmountBeforeCliff() public {
        token.createVestingSchedule(user1, 10000e18, 365 days, 90 days);
        
        // Before cliff
        vm.warp(block.timestamp + 30 days);
        assertEq(token.getReleasableAmount(user1), 0);
    }
    
    function testDelegateToZeroAddress() public {
        token.transfer(user1, 1000e18);
        
        vm.prank(user1);
        token.delegate(address(0));
        
        assertEq(token.getVotes(address(0)), 0);
    }
    
    // ============ Revert Tests ============
    
    function testRevertMintExceedsMaxSupply() public {
        uint256 excessAmount = token.MAX_SUPPLY() - token.totalSupply() + 1;
        
        vm.expectRevert("Exceeds max supply");
        token.mint(user1, excessAmount);
    }
    
    function testRevertCreateVestingScheduleInvalidBeneficiary() public {
        vm.expectRevert("Invalid beneficiary");
        token.createVestingSchedule(address(0), 1000e18, 365 days, 90 days);
    }
    
    function testRevertCreateVestingScheduleZeroAmount() public {
        vm.expectRevert("Amount must be > 0");
        token.createVestingSchedule(user1, 0, 365 days, 90 days);
    }
    
    function testRevertCreateVestingScheduleZeroDuration() public {
        vm.expectRevert("Duration must be > 0");
        token.createVestingSchedule(user1, 1000e18, 0, 90 days);
    }
    
    function testRevertCreateVestingScheduleAlreadyExists() public {
        token.createVestingSchedule(user1, 1000e18, 365 days, 90 days);
        
        vm.expectRevert("Schedule already exists");
        token.createVestingSchedule(user1, 2000e18, 365 days, 90 days);
    }
    
    function testRevertCreateVestingScheduleExceedsMaxSupply() public {
        uint256 excessAmount = token.MAX_SUPPLY() - token.totalSupply() + 1;
        
        vm.expectRevert("Exceeds max supply");
        token.createVestingSchedule(user1, excessAmount, 365 days, 90 days);
    }
    
    function testRevertReleaseVestedTokensNoSchedule() public {
        vm.prank(user1);
        vm.expectRevert("No vesting schedule");
        token.releaseVestedTokens();
    }
    
    function testRevertReleaseVestedTokensBeforeCliff() public {
        token.createVestingSchedule(user1, 10000e18, 365 days, 90 days);
        
        vm.prank(user1);
        vm.expectRevert("No tokens to release");
        token.releaseVestedTokens();
    }
    
    function testRevertReleaseVestedTokensTwice() public {
        token.createVestingSchedule(user1, 10000e18, 365 days, 90 days);
        
        vm.warp(block.timestamp + 365 days + 1);
        
        vm.prank(user1);
        token.releaseVestedTokens();
        
        vm.prank(user1);
        vm.expectRevert("No tokens to release");
        token.releaseVestedTokens();
    }
    
    function testRevertBurnMoreThanBalance() public {
        uint256 excessAmount = token.INITIAL_SUPPLY() + 1;
        vm.expectRevert();
        token.burn(excessAmount);
    }
    
    function testRevertTransferMoreThanBalance() public {
        uint256 excessAmount = token.INITIAL_SUPPLY() + 1;
        vm.expectRevert();
        token.transfer(user1, excessAmount);
    }
    
    // ============ Event Emission Tests ============
    
    function testEmitTransferEvent() public {
        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, user1, 1000e18);
        token.transfer(user1, 1000e18);
    }
    
    function testEmitDelegateChangedEvent() public {
        token.transfer(user1, 1000e18);
        
        vm.expectEmit(true, true, true, false);
        emit DelegateChanged(user1, address(0), user2);
        
        vm.prank(user1);
        token.delegate(user2);
    }
    
    function testEmitVestingScheduleCreatedEvent() public {
        vm.expectEmit(true, false, false, true);
        emit VestingScheduleCreated(user1, 10000e18, 365 days);
        
        token.createVestingSchedule(user1, 10000e18, 365 days, 90 days);
    }
    
    function testEmitTokensVestedEvent() public {
        token.createVestingSchedule(user1, 10000e18, 365 days, 90 days);
        vm.warp(block.timestamp + 365 days + 1);
        
        vm.expectEmit(true, false, false, true);
        emit TokensVested(user1, 10000e18);
        
        vm.prank(user1);
        token.releaseVestedTokens();
    }
    
    // ============ State Transition Tests ============
    
    function testVestingScheduleStateTransition() public {
        uint256 vestingAmount = 10000e18;
        token.createVestingSchedule(user1, vestingAmount, 365 days, 90 days);
        
        // Initial state
        (uint256 totalAmount, uint256 releasedAmount,,,) = token.vestingSchedules(user1);
        assertEq(totalAmount, vestingAmount);
        assertEq(releasedAmount, 0);
        
        // After partial vesting
        vm.warp(block.timestamp + 182 days); // Half duration
        vm.prank(user1);
        token.releaseVestedTokens();
        
        (, uint256 releasedAfterHalf,,,) = token.vestingSchedules(user1);
        assertTrue(releasedAfterHalf > 0);
        assertTrue(releasedAfterHalf < vestingAmount);
        
        // After full vesting
        vm.warp(block.timestamp + 365 days);
        vm.prank(user1);
        token.releaseVestedTokens();
        
        (, uint256 releasedAfterFull,,,) = token.vestingSchedules(user1);
        assertEq(releasedAfterFull, vestingAmount);
    }
    
    function testProposalStateTransitions() public {
        // Setup
        token.transfer(user1, 2000e18);
        vm.prank(user1);
        token.delegate(user1);
        vm.roll(block.number + 1);
        
        // Create proposal
        address[] memory targets = new address[](1);
        targets[0] = address(token);
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSignature("mint(address,uint256)", user2, 1000e18);
        
        vm.prank(user1);
        uint256 proposalId = governor.propose(targets, values, calldatas, "Test");
        
        // Pending state
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Pending));
        
        // Active state
        vm.roll(block.number + governor.votingDelay() + 1);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Active));
    }
    
    // ============ Fuzz Testing ============
    
    function testFuzzMint(uint256 amount) public {
        amount = bound(amount, 0, token.MAX_SUPPLY() - token.totalSupply());
        
        uint256 balanceBefore = token.balanceOf(user1);
        token.mint(user1, amount);
        assertEq(token.balanceOf(user1), balanceBefore + amount);
    }
    
    function testFuzzTransfer(uint256 amount) public {
        amount = bound(amount, 0, token.INITIAL_SUPPLY());
        
        token.transfer(user1, amount);
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(owner), token.INITIAL_SUPPLY() - amount);
    }
    
    function testFuzzBurn(uint256 amount) public {
        amount = bound(amount, 0, token.INITIAL_SUPPLY());
        
        uint256 supplyBefore = token.totalSupply();
        token.burn(amount);
        assertEq(token.totalSupply(), supplyBefore - amount);
    }
    
    function testFuzzVestingDuration(uint256 duration) public {
        duration = bound(duration, 1 days, 10 * 365 days);
        
        token.createVestingSchedule(user1, 10000e18, duration, 0);
        
        (,, uint256 startTime, uint256 vestDuration,) = token.vestingSchedules(user1);
        assertEq(vestDuration, duration);
        assertTrue(startTime > 0);
    }
    
    // ============ Integration Tests ============
    
    function testFullGovernanceWorkflow() public {
        // 1. Distribute tokens
        token.transfer(user1, 5000e18);
        token.transfer(user2, 3000e18);
        
        // 2. Delegate votes
        vm.prank(user1);
        token.delegate(user1);
        vm.prank(user2);
        token.delegate(user2);
        
        vm.roll(block.number + 1);
        
        // 3. Create proposal
        address[] memory targets = new address[](1);
        targets[0] = address(token);
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSignature("mint(address,uint256)", user3, 1000e18);
        
        vm.prank(user1);
        uint256 proposalId = governor.propose(targets, values, calldatas, "Mint to user3");
        
        // 4. Vote
        vm.roll(block.number + governor.votingDelay() + 1);
        
        vm.prank(user1);
        governor.castVote(proposalId, 1);
        
        vm.prank(user2);
        governor.castVote(proposalId, 1);
        
        // 5. Verify votes recorded
        assertTrue(governor.hasVoted(proposalId, user1));
        assertTrue(governor.hasVoted(proposalId, user2));
    }
    
    function testFactoryDeployment() public {
        // Record logs
        vm.recordLogs();
        
        // Deploy factory
        TemporaryDeployFactory factory = new TemporaryDeployFactory();
        
        // Parse event
        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 eventSignature = keccak256("ContractsDeployed(address,string[],address[])");
        
        bool foundEvent = false;
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].topics[0] == eventSignature && logs[i].emitter == address(factory)) {
                address deployer = address(uint160(uint256(logs[i].topics[1])));
                (string[] memory contractNames, address[] memory contractAddresses) =
                    abi.decode(logs[i].data, (string[], address[]));
                
                assertEq(deployer, address(this));
                assertEq(contractNames.length, 3);
                assertEq(contractAddresses.length, 3);
                assertEq(contractNames[0], "KoboGovernanceToken");
                assertEq(contractNames[1], "KoboTimelock");
                assertEq(contractNames[2], "KoboGovernor");
                
                assertTrue(contractAddresses[0] != address(0));
                assertTrue(contractAddresses[1] != address(0));
                assertTrue(contractAddresses[2] != address(0));
                
                foundEvent = true;
                break;
            }
        }
        
        assertTrue(foundEvent, "ContractsDeployed event not found");
    }
}
