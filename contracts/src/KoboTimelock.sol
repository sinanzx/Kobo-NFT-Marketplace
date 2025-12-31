// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title KoboTimelock
 * @dev Timelock controller for Kōbo DAO governance
 * Enforces a delay between proposal approval and execution
 * Provides security and transparency for governance actions
 */
contract KoboTimelock is TimelockController {
    /**
     * @param minDelay Minimum delay before executing proposals (in seconds)
     * @param proposers List of addresses that can propose (typically the Governor contract)
     * @param executors List of addresses that can execute (typically anyone via address(0))
     * @param admin Admin address (should be renounced after setup)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
