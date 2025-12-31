// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./KoboGiftWrapper.sol";

/**
 * @title TemporaryDeployFactory
 * @notice EIP-6780 compliant factory for deploying KoboGiftWrapper
 * @dev Uses parameter-free constructor for universal bytecode compatibility
 */
contract TemporaryDeployFactory {
    /// @notice Emitted when all contracts are deployed
    /// @dev This event enables frontend to query deployed contracts by tx hash
    event ContractsDeployed(
        address indexed deployer,
        string[] contractNames,
        address[] contractAddresses
    );

    constructor() {
        uint256 chainId = block.chainid;

        // Define supported NFT contract addresses based on chain
        address[] memory supportedContracts = new address[](2);
        
        if (chainId == 1 || chainId == 20258) {
            // Ethereum mainnet or testnet - use placeholder addresses
            // These should be updated with actual KoboNFT contract addresses
            supportedContracts[0] = address(0); // KoboNFT address
            supportedContracts[1] = address(0); // KoboNFTExtended address
        } else if (chainId == 84532) {
            // Base Sepolia - use actual deployed addresses if available
            supportedContracts[0] = address(0); // KoboNFT address on Base Sepolia
            supportedContracts[1] = address(0); // KoboNFTExtended address on Base Sepolia
        } else if (chainId == 8453) {
            // Base mainnet
            supportedContracts[0] = address(0); // KoboNFT address on Base
            supportedContracts[1] = address(0); // KoboNFTExtended address on Base
        } else if (chainId == 11155111) {
            // Ethereum Sepolia
            supportedContracts[0] = address(0); // KoboNFT address on Sepolia
            supportedContracts[1] = address(0); // KoboNFTExtended address on Sepolia
        } else if (chainId == 137) {
            // Polygon
            supportedContracts[0] = address(0); // KoboNFT address on Polygon
            supportedContracts[1] = address(0); // KoboNFTExtended address on Polygon
        } else if (chainId == 42161) {
            // Arbitrum One
            supportedContracts[0] = address(0); // KoboNFT address on Arbitrum
            supportedContracts[1] = address(0); // KoboNFTExtended address on Arbitrum
        } else if (chainId == 10) {
            // Optimism
            supportedContracts[0] = address(0); // KoboNFT address on Optimism
            supportedContracts[1] = address(0); // KoboNFTExtended address on Optimism
        } else if (chainId == 56) {
            // BSC
            supportedContracts[0] = address(0); // KoboNFT address on BSC
            supportedContracts[1] = address(0); // KoboNFTExtended address on BSC
        } else {
            // Default/unsupported chain - empty array
            supportedContracts[0] = address(0);
            supportedContracts[1] = address(0);
        }

        // Deploy KoboGiftWrapper
        KoboGiftWrapper giftWrapper = new KoboGiftWrapper(msg.sender, supportedContracts);

        // Build contract info arrays
        string[] memory contractNames = new string[](1);
        contractNames[0] = "KoboGiftWrapper";

        address[] memory contractAddresses = new address[](1);
        contractAddresses[0] = address(giftWrapper);

        // Emit event with deployment info
        emit ContractsDeployed(msg.sender, contractNames, contractAddresses);

        // Self-destruct to clean up
        selfdestruct(payable(msg.sender));
    }
}
