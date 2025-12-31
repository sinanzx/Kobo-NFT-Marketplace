# Kobo NFT Platform

AI-powered NFT creation platform with advanced features including battles, collaborations, DAO governance, and trait marketplace.

## Features

- 🎨 **AI-Powered NFT Creation**: Generate unique NFTs using Stable Diffusion, DALL-E, and other AI models
- 🎮 **Battle System**: Compete with your NFTs in community-voted battles
- 🤝 **Collaborative Minting**: Create NFTs together with other artists
- 🏛️ **DAO Governance**: Participate in platform decisions through on-chain voting
- 🛒 **Trait Marketplace**: Buy and sell dynamic NFT traits
- 🎁 **Gift Wrapping**: Send NFTs as gifts with custom messages
- 📊 **Gamification**: Earn XP, unlock achievements, and complete daily challenges
- 🔒 **GDPR Compliant**: Full data export, deletion, and consent management

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast builds
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **RainbowKit** for wallet connection
- **wagmi** for Ethereum interactions

### Backend
- **Supabase** for database, auth, and storage
- **Supabase Edge Functions** for serverless API
- **PostgreSQL** with Row Level Security (RLS)

### Smart Contracts
- **Solidity** for EVM contracts
- **Foundry** for development and testing
- **OpenZeppelin** for secure contract standards

### AI Services
- Hugging Face (Stable Diffusion)
- ElevenLabs (Voice/Audio)
- Runway ML (Video)

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kobo-nft.git
cd kobo-nft

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your API keys (see `.env.example` for details)
3. For development, you can use the default Supabase credentials

## Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Smart Contract Development

```bash
cd contracts

# Install dependencies
forge install

# Run tests
forge test

# Deploy to testnet
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast
```

## Project Structure

```
kobo-nft/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utility functions and services
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React contexts
│   └── utils/          # Helper utilities
├── contracts/
│   ├── src/            # Solidity contracts
│   ├── test/           # Contract tests
│   └── script/         # Deployment scripts
├── supabase/
│   ├── migrations/     # Database migrations
│   └── functions/      # Edge Functions
├── docs/               # Documentation
└── public/             # Static assets
```

## Key Features Documentation

### GDPR Compliance

The platform includes comprehensive GDPR compliance features:

- **Data Export**: Users can request a complete export of their data
- **Right to Deletion**: 30-day grace period for account deletion
- **Consent Management**: Granular cookie and data processing consents
- **Account Settings**: `/account-settings` page for managing privacy

See [GDPR Implementation](./docs/MAINNET_LAUNCH_CHECKLIST.md#-gdpr--privacy-compliance) for details.

### Authentication

Built with Supabase Auth:
- Email/password authentication
- Social login (Google, GitHub, etc.)
- Protected routes
- Session management

### NFT Creation

Multiple creation modes:
- AI-generated (text-to-image)
- Manual upload
- Collaborative creation
- Trait customization

### Battle System

- Create themed battles
- Submit NFT entries
- Community voting with reputation weighting
- Leaderboards and rewards

### DAO Governance

- On-chain proposal creation
- Token-weighted voting
- Timelock execution
- Transparent governance

## Deployment

See [Deployment Instructions](./docs/DEPLOYMENT_INSTRUCTIONS.md) for detailed production deployment guide.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/kobo-nft)

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run contract tests
cd contracts && forge test
```

## Security

- All smart contracts should be audited before mainnet deployment
- See [Smart Contract Security](./contracts/SMART_CONTRACT_SECURITY.md)
- See [Production Security](./docs/PRODUCTION_SECURITY.md)
- Report vulnerabilities to security@kobo-nft.com

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/kobo-nft/issues)
- **Email**: support@kobo-nft.com
- **Discord**: [Join our community](https://discord.gg/kobo-nft)

## Roadmap

- [x] Core NFT minting
- [x] Battle system
- [x] Collaborative minting
- [x] DAO governance
- [x] Trait marketplace
- [x] Gift wrapping
- [x] Gamification
- [x] GDPR compliance
- [ ] Mobile app (React Native)
- [ ] AR viewer enhancements
- [ ] Multi-chain support
- [ ] NFT fractionalization
- [ ] Marketplace integration

## Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Supabase for backend infrastructure
- RainbowKit for wallet connection
- Hugging Face for AI models

---

**Built with ❤️ by the Kobo team**
