# Multi-Chain Deployment Guide

This guide covers deploying KoboNFT contracts to multiple EVM-compatible chains including Ethereum, Polygon, Arbitrum, and Base.

## Supported Networks

### Testnets
- **Ethereum Sepolia** (Chain ID: 11155111)
- **Polygon Amoy** (Chain ID: 80002)
- **Arbitrum Sepolia** (Chain ID: 421614)
- **Base Sepolia** (Chain ID: 84532)

### Mainnets
- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **Arbitrum One** (Chain ID: 42161)
- **Base** (Chain ID: 8453)

## Prerequisites

### 1. Environment Variables

Create a `.env` file in the `contracts/` directory:

```bash
# Deployment wallet
PRIVATE_KEY=your_private_key_here

# RPC URLs (get from Alchemy, Infura, or public endpoints)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
POLYGON_AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
ARBITRUM_SEPOLIA_RPC_URL=https://arb-sepolia.g.alchemy.com/v2/YOUR_KEY
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# Mainnet RPC URLs
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Block Explorer API Keys (for verification)
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
ARBISCAN_API_KEY=your_arbiscan_key
BASESCAN_API_KEY=your_basescan_key
```

### 2. Fund Your Deployment Wallet

Ensure your deployment wallet has sufficient native tokens:
- **Sepolia**: Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
- **Polygon Amoy**: Get testnet MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
- **Arbitrum Sepolia**: Bridge Sepolia ETH via [Arbitrum Bridge](https://bridge.arbitrum.io/)
- **Base Sepolia**: Bridge Sepolia ETH via [Base Bridge](https://bridge.base.org/)

## Deployment Steps

### Deploy to Testnet

#### Ethereum Sepolia
```bash
RPC_URL=$SEPOLIA_RPC_URL ./scripts/deploy-contracts.sh sepolia
```

#### Polygon Amoy
```bash
RPC_URL=$POLYGON_AMOY_RPC_URL ./scripts/deploy-contracts.sh polygon-amoy
```

#### Arbitrum Sepolia
```bash
RPC_URL=$ARBITRUM_SEPOLIA_RPC_URL ./scripts/deploy-contracts.sh arbitrum-sepolia
```

#### Base Sepolia
```bash
RPC_URL=$BASE_SEPOLIA_RPC_URL ./scripts/deploy-contracts.sh base-sepolia
```

### Deploy to Mainnet

⚠️ **WARNING**: Deploying to mainnet requires real funds. Double-check all configurations!

#### Ethereum Mainnet
```bash
RPC_URL=$MAINNET_RPC_URL ./scripts/deploy-contracts.sh mainnet
```

#### Polygon
```bash
RPC_URL=$POLYGON_RPC_URL ./scripts/deploy-contracts.sh polygon
```

#### Arbitrum One
```bash
RPC_URL=$ARBITRUM_RPC_URL ./scripts/deploy-contracts.sh arbitrum
```

#### Base
```bash
RPC_URL=$BASE_RPC_URL ./scripts/deploy-contracts.sh base
```

## Post-Deployment

### 1. Verify Deployment

After deployment, the script will:
- ✅ Run all tests
- ✅ Deploy contracts
- ✅ Verify contracts on block explorers (if API key provided)
- ✅ Generate `metadata.json` with contract addresses and ABIs
- ✅ Copy metadata to frontend (`src/metadata.json`)

### 2. Update Frontend Configuration

The deployment automatically updates `src/metadata.json` with the new contract addresses. To use a specific chain in the frontend:

```bash
# Development with Sepolia
VITE_CHAIN=sepolia pnpm run dev

# Build for Polygon
VITE_CHAIN=polygon pnpm run build

# Build for Arbitrum
VITE_CHAIN=arbitrum pnpm run build

# Build for Base
VITE_CHAIN=base pnpm run build
```

### 3. Test the Deployment

1. Connect wallet to the deployed network
2. Mint a test NFT
3. Verify on block explorer
4. Test all contract features

## Chain-Specific Considerations

### Ethereum
- **Gas Costs**: Highest among all chains
- **Finality**: ~15 minutes (2 epochs)
- **Best For**: High-value NFTs, maximum security

### Polygon
- **Gas Costs**: Very low (~$0.01 per transaction)
- **Finality**: ~2 minutes
- **Best For**: High-volume minting, gaming NFTs
- **Note**: Uses MATIC for gas

### Arbitrum
- **Gas Costs**: Low (~10% of Ethereum)
- **Finality**: ~15 minutes (L1 finality)
- **Best For**: DeFi-integrated NFTs, complex contracts
- **Note**: Optimistic rollup with 7-day withdrawal period

### Base
- **Gas Costs**: Very low (similar to Polygon)
- **Finality**: ~2 seconds (L2), ~15 minutes (L1)
- **Best For**: Social NFTs, consumer apps
- **Note**: Built on OP Stack, Coinbase-backed

## Multi-Chain Strategy

### Option 1: Single Chain Deployment
Deploy to one chain based on your use case:
- **High value**: Ethereum Mainnet
- **Gaming/Social**: Polygon or Base
- **DeFi Integration**: Arbitrum

### Option 2: Multi-Chain Deployment
Deploy to multiple chains for:
- Broader user reach
- Lower barriers to entry
- Chain-specific features

**Considerations**:
- Maintain separate metadata for each chain
- Use chain-specific subdomains (e.g., `polygon.yourapp.com`)
- Implement chain detection and switching in UI

### Option 3: Cross-Chain Bridge
Deploy on one chain and use bridges for cross-chain transfers:
- [LayerZero](https://layerzero.network/)
- [Axelar](https://axelar.network/)
- [Wormhole](https://wormhole.com/)

## Troubleshooting

### Deployment Fails
```bash
# Check wallet balance
cast balance $YOUR_WALLET_ADDRESS --rpc-url $RPC_URL

# Check nonce
cast nonce $YOUR_WALLET_ADDRESS --rpc-url $RPC_URL

# Increase gas price (if needed)
forge script script/Deploy.s.sol --gas-price 50gwei
```

### Verification Fails
```bash
# Manual verification
forge verify-contract \
  --chain-id 11155111 \
  --compiler-version v0.8.29 \
  --constructor-args $(cast abi-encode "constructor()") \
  CONTRACT_ADDRESS \
  src/KoboNFTExtended.sol:KoboNFTExtended \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Wrong Network
```bash
# Check current network
cast chain-id --rpc-url $RPC_URL

# Verify contract address
cast code CONTRACT_ADDRESS --rpc-url $RPC_URL
```

## Gas Optimization Tips

1. **Batch Operations**: Use batch minting when possible
2. **Optimize Storage**: Use packed structs and minimize storage writes
3. **Use Events**: Emit events instead of storing data when possible
4. **Lazy Minting**: Consider lazy minting for large collections
5. **L2 First**: Deploy to L2s (Polygon, Arbitrum, Base) for lower costs

## Security Checklist

- [ ] Audit contracts before mainnet deployment
- [ ] Test on testnet thoroughly
- [ ] Verify contract source code
- [ ] Set up monitoring and alerts
- [ ] Implement pause mechanism
- [ ] Configure multi-sig for admin functions
- [ ] Review royalty settings
- [ ] Test emergency procedures

## Resources

### Block Explorers
- Ethereum: https://etherscan.io
- Polygon: https://polygonscan.com
- Arbitrum: https://arbiscan.io
- Base: https://basescan.org

### Faucets
- Sepolia: https://sepoliafaucet.com
- Polygon Amoy: https://faucet.polygon.technology
- Arbitrum Sepolia: https://bridge.arbitrum.io
- Base Sepolia: https://bridge.base.org

### RPC Providers
- Alchemy: https://www.alchemy.com
- Infura: https://www.infura.io
- QuickNode: https://www.quicknode.com
- Public RPCs: https://chainlist.org

## Next Steps

1. Deploy to testnet and test thoroughly
2. Get contracts audited (for mainnet)
3. Set up monitoring and analytics
4. Configure frontend for multi-chain support
5. Deploy to mainnet
6. Announce deployment and verify on block explorers
