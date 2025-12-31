// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KoboGovernanceToken
 * @dev ERC20 token with voting capabilities for Kōbo DAO governance
 * Features:
 * - Voting and delegation (ERC20Votes)
 * - Burnable tokens
 * - Minting controlled by owner
 * - Snapshot mechanism for voting
 */
contract KoboGovernanceToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, Ownable {
    // Maximum supply cap (100 million tokens)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    // Minting schedule
    uint256 public constant INITIAL_SUPPLY = 20_000_000 * 10**18; // 20% initial
    uint256 public constant COMMUNITY_ALLOCATION = 40_000_000 * 10**18; // 40% community rewards
    uint256 public constant TEAM_ALLOCATION = 20_000_000 * 10**18; // 20% team (vested)
    uint256 public constant TREASURY_ALLOCATION = 20_000_000 * 10**18; // 20% treasury
    
    // Vesting tracking
    mapping(address => VestingSchedule) public vestingSchedules;
    
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 duration;
        uint256 cliffDuration;
    }
    
    event TokensVested(address indexed beneficiary, uint256 amount);
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 duration);
    
    constructor() ERC20("Kobo Governance Token", "KOBO") ERC20Permit("Kobo Governance Token") Ownable(msg.sender) {
        // Mint initial supply to deployer for distribution
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner, respects max supply)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Create a vesting schedule for team/advisors
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 duration,
        uint256 cliffDuration
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(duration > 0, "Duration must be > 0");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Schedule already exists");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            startTime: block.timestamp,
            duration: duration,
            cliffDuration: cliffDuration
        });
        
        emit VestingScheduleCreated(beneficiary, amount, duration);
    }
    
    /**
     * @dev Release vested tokens to beneficiary
     */
    function releaseVestedTokens() external {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");
        
        uint256 vestedAmount = _calculateVestedAmount(schedule);
        uint256 releasableAmount = vestedAmount - schedule.releasedAmount;
        
        require(releasableAmount > 0, "No tokens to release");
        
        schedule.releasedAmount += releasableAmount;
        _mint(msg.sender, releasableAmount);
        
        emit TokensVested(msg.sender, releasableAmount);
    }
    
    /**
     * @dev Calculate vested amount based on schedule
     */
    function _calculateVestedAmount(VestingSchedule memory schedule) private view returns (uint256) {
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        if (block.timestamp >= schedule.startTime + schedule.duration) {
            return schedule.totalAmount;
        }
        
        uint256 timeVested = block.timestamp - schedule.startTime;
        return (schedule.totalAmount * timeVested) / schedule.duration;
    }
    
    /**
     * @dev Get releasable amount for a beneficiary
     */
    function getReleasableAmount(address beneficiary) external view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        if (schedule.totalAmount == 0) return 0;
        
        uint256 vestedAmount = _calculateVestedAmount(schedule);
        return vestedAmount - schedule.releasedAmount;
    }
    
    // Override required functions
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, amount);
    }
    
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
