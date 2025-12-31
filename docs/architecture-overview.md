# Kōbo Platform - Fullstack Architecture

## Executive Summary

Kōbo is a scalable, production-ready AI-powered NFT platform built with modern web3 technologies. This document outlines the complete architecture, integration patterns, and deployment strategies.

## Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS + Framer Motion
- **Web3**: wagmi + RainbowKit + viem
- **State Management**: React Context + TanStack Query
- **UI Components**: Radix UI + shadcn/ui

### Backend
- **Runtime**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage + IPFS (Pinata/Web3.Storage)
- **Real-time**: Supabase Realtime

### Blockchain
- **Smart Contracts**: Solidity + Foundry
- **Standards**: ERC-721, ERC-1155, ERC-4906, ERC-7160, ERC-2981
- **Networks**: Ethereum, Polygon, Base, Arbitrum, Optimism
- **Indexing**: The Graph Protocol + Alchemy/Moralis APIs

### AI Services
- **Image Generation**: Hugging Face (FLUX.1-dev), Stability AI
- **Video Generation**: Runway ML, Pika Labs
- **Audio Generation**: ElevenLabs, Suno AI
- **Copyright Detection**: Pixsy API, TinEye

### Infrastructure
- **Hosting**: Vercel (Frontend) + Supabase (Backend)
- **IPFS**: Pinata Cloud / Web3.Storage
- **CDN**: Cloudflare
- **Monitoring**: Sentry + Supabase Analytics
- **CI/CD**: GitHub Actions

## Repository Structure

```
kobo-platform/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Continuous Integration
│       ├── deploy-contracts.yml      # Smart contract deployment
│       ├── deploy-frontend.yml       # Frontend deployment
│       └── deploy-functions.yml      # Edge Functions deployment
│
├── contracts/                        # Smart Contracts (Foundry)
│   ├── src/
│   │   ├── KoboNFT.sol              # Main ERC-721 contract
│   │   ├── KoboNFTExtended.sol      # Extended with provenance
│   │   ├── KoboNFT1155.sol          # ERC-1155 for editions
│   │   ├── ProvenanceRegistry.sol   # Provenance tracking
│   │   ├── RoyaltyManager.sol       # ERC-2981 royalties
│   │   └── interfaces/
│   │       ├── IKoboNFT.sol
│   │       └── IProvenance.sol
│   ├── script/
│   │   ├── Deploy.s.sol
│   │   └── Upgrade.s.sol
│   ├── test/
│   │   ├── KoboNFT.t.sol
│   │   └── integration/
│   ├── interfaces/
│   │   ├── metadata.json            # Deployment metadata
│   │   └── deploy.json              # Network configs
│   ├── foundry.toml
│   └── package.json
│
├── src/                              # Frontend Application
│   ├── app/                          # Next.js App Router (future)
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AIGenerator.tsx
│   │   │   ├── MultiModalCreator.tsx
│   │   │   └── PromptEnhancer.tsx
│   │   ├── collections/
│   │   │   ├── NFTGallery.tsx
│   │   │   ├── NFTCard.tsx
│   │   │   └── CollectionView.tsx
│   │   ├── minting/
│   │   │   ├── MintingFlow.tsx
│   │   │   ├── PreviewPanel.tsx
│   │   │   └── MintAnimation.tsx
│   │   ├── social/
│   │   │   ├── CollaborationHub.tsx
│   │   │   ├── BattleArena.tsx
│   │   │   └── GiftingInterface.tsx
│   │   ├── marketplace/
│   │   │   ├── PromptMarketplace.tsx
│   │   │   ├── PromptCard.tsx
│   │   │   └── PurchaseFlow.tsx
│   │   ├── provenance/
│   │   │   ├── ProvenanceTimeline.tsx
│   │   │   ├── CopyrightAudit.tsx
│   │   │   └── RemixTree.tsx
│   │   ├── effects/
│   │   │   └── AtmosphericEffects.tsx
│   │   └── ui/                      # shadcn/ui components
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── Web3Context.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   ├── useContract.ts
│   │   ├── useIPFS.ts
│   │   ├── useAIGeneration.ts
│   │   └── useSupabase.ts
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   ├── aiServices.ts
│   │   ├── ipfsClient.ts
│   │   ├── designTokens.ts
│   │   └── utils.ts
│   ├── utils/
│   │   ├── evmConfig.ts
│   │   ├── wagmiConfig.ts
│   │   └── contractHelpers.ts
│   ├── pages/
│   │   ├── Homepage.tsx
│   │   ├── Index.tsx               # Minting page
│   │   ├── Collections.tsx
│   │   ├── Marketplace.tsx
│   │   └── Profile.tsx
│   └── types/
│       ├── contracts.ts
│       ├── nft.ts
│       └── api.ts
│
├── supabase/                         # Backend Services
│   ├── functions/
│   │   ├── generate-ai-content/
│   │   │   └── index.ts
│   │   ├── copyright-audit/
│   │   │   └── index.ts
│   │   ├── mint-nft/
│   │   │   └── index.ts
│   │   ├── nft-metadata/
│   │   │   └── index.ts
│   │   ├── upload-to-ipfs/
│   │   │   └── index.ts
│   │   ├── leaderboard/
│   │   │   └── index.ts
│   │   ├── social-actions/
│   │   │   └── index.ts
│   │   ├── prompt-marketplace/
│   │   │   └── index.ts
│   │   └── indexer-webhook/
│   │       └── index.ts
│   ├── migrations/
│   │   ├── 20251123032627_create_core_tables.sql
│   │   ├── 20251123032711_create_marketplace_social_tables.sql
│   │   ├── 20251123032743_create_storage_bucket_nft_media.sql
│   │   └── 20251123033247_create_profiles_table.sql
│   └── config.toml
│
├── docs/                             # Documentation
│   ├── architecture-overview.md     # This file
│   ├── integration-blueprint.md     # Integration patterns
│   ├── schema-diagrams.md           # Database & contract schemas
│   ├── deployment-guide.md          # Production deployment
│   ├── api-reference.md             # API documentation
│   └── technical-roadmap.md         # Development roadmap
│
├── scripts/                          # Utility Scripts
│   ├── deploy-contracts.sh
│   ├── setup-ipfs.sh
│   └── seed-database.ts
│
├── .env.example                      # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Core Architecture Patterns

### 1. Modular AI Integration

**Pattern**: Strategy Pattern with Provider Abstraction

```typescript
// src/lib/aiServices.ts
interface AIProvider {
  generateImage(prompt: string): Promise<string>
  generateVideo(prompt: string): Promise<string>
  generateAudio(prompt: string): Promise<string>
}

class HuggingFaceProvider implements AIProvider { }
class StabilityAIProvider implements AIProvider { }
class RunwayMLProvider implements AIProvider { }

class AIServiceFactory {
  static getProvider(type: 'image' | 'video' | 'audio'): AIProvider
}
```

**Benefits**:
- Easy to swap AI providers
- Centralized error handling
- Consistent API across all content types
- Testable and mockable

### 2. Smart Contract Architecture

**Pattern**: Upgradeable Proxy Pattern + Registry Pattern

```
┌─────────────────────────────────────────────────┐
│           KoboNFT (ERC-721)                     │
│  - Minting logic                                │
│  - Ownership management                         │
│  - Token URI management                         │
└─────────────────┬───────────────────────────────┘
                  │
                  │ inherits
                  ▼
┌─────────────────────────────────────────────────┐
│       KoboNFTExtended                           │
│  - ERC-4906 (Metadata updates)                  │
│  - ERC-7160 (Multi-metadata)                    │
│  - ERC-2981 (Royalties)                         │
└─────────────────┬───────────────────────────────┘
                  │
                  │ uses
                  ▼
┌─────────────────────────────────────────────────┐
│       ProvenanceRegistry                        │
│  - Creation records                             │
│  - Remix tracking                               │
│  - Collaboration history                        │
│  - Copyright audit records                      │
└─────────────────────────────────────────────────┘
```

### 3. Data Flow Architecture

```
┌──────────────┐
│   Frontend   │
│  (React App) │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  Supabase    │  │   Blockchain │
│  Edge Fns    │  │   (wagmi)    │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ├────────┬────────┼────────┐
       │        │        │        │
       ▼        ▼        ▼        ▼
   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
   │ AI  │  │IPFS │  │ DB  │  │Smart│
   │APIs │  │     │  │     │  │Cont.│
   └─────┘  └─────┘  └─────┘  └─────┘
```

### 4. Authentication & Authorization

**Multi-layer Security**:

1. **Frontend**: Supabase Auth + Wallet Connection
2. **Backend**: JWT validation + Row-Level Security (RLS)
3. **Blockchain**: Signature verification + Smart contract access control

```typescript
// Authentication Flow
User → Connect Wallet (RainbowKit)
     → Sign Message (SIWE - Sign-In with Ethereum)
     → Supabase Auth (Custom JWT)
     → Access Protected Resources
```

### 5. IPFS Integration Strategy

**Hybrid Storage Approach**:

- **Metadata**: IPFS (immutable, decentralized)
- **Media Assets**: IPFS + CDN (performance)
- **Database**: Supabase (queryable, mutable)

```typescript
// Upload Flow
1. Upload media to IPFS → Get CID
2. Create metadata JSON with IPFS CID
3. Upload metadata to IPFS → Get metadata CID
4. Store metadata CID in smart contract
5. Store all CIDs + URLs in Supabase for indexing
```

## Integration Points

### 1. OpenSea Integration

**Metadata Standard Compliance**:
```json
{
  "name": "NFT Name",
  "description": "Description",
  "image": "ipfs://QmHash",
  "external_url": "https://kobo.app/nft/123",
  "attributes": [
    {"trait_type": "Creator", "value": "0x..."},
    {"trait_type": "AI Model", "value": "FLUX.1-dev"},
    {"trait_type": "Originality Score", "value": 95}
  ],
  "animation_url": "ipfs://QmVideoHash",
  "background_color": "000000"
}
```

**Collection Registration**:
- Implement `contractURI()` for collection metadata
- Set up royalty info via ERC-2981
- Configure OpenSea storefront settings

### 2. Indexing & Querying

**The Graph Protocol**:
```graphql
# subgraph.yaml
entities:
  - NFT
  - Transfer
  - ProvenanceRecord
  - Collaboration

# Query Example
{
  nfts(where: {creator: "0x..."}) {
    id
    tokenId
    metadata
    provenance {
      originalCreator
      remixHistory
    }
  }
}
```

**Alternative**: Alchemy/Moralis NFT APIs for faster setup

### 3. Real-time Features

**Supabase Realtime**:
```typescript
// Subscribe to new mints
supabase
  .channel('nfts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'nfts' },
    (payload) => updateGallery(payload.new)
  )
  .subscribe()
```

## Security Considerations

### Smart Contract Security
- ✅ OpenZeppelin contracts as base
- ✅ Reentrancy guards
- ✅ Access control (Ownable, AccessControl)
- ✅ Pausable functionality
- ✅ Rate limiting on minting
- ✅ Comprehensive test coverage (>90%)

### Backend Security
- ✅ Row-Level Security (RLS) policies
- ✅ API rate limiting
- ✅ Input validation & sanitization
- ✅ CORS configuration
- ✅ Secret management (Supabase Vault)
- ✅ SQL injection prevention

### Frontend Security
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ Secure wallet connections
- ✅ Transaction simulation before signing
- ✅ Content Security Policy (CSP)

## Performance Optimization

### Frontend
- Code splitting & lazy loading
- Image optimization (WebP, AVIF)
- CDN for static assets
- Service Worker for offline support
- React Query for caching

### Backend
- Database indexing on frequently queried fields
- Connection pooling
- Edge function caching
- IPFS gateway caching

### Blockchain
- Batch operations where possible
- Gas optimization in contracts
- Transaction queuing
- Multicall for read operations

## Monitoring & Observability

### Metrics to Track
- **Frontend**: Page load time, Core Web Vitals, error rate
- **Backend**: Function execution time, database query performance
- **Blockchain**: Gas usage, transaction success rate, contract events
- **Business**: Mints per day, active users, marketplace volume

### Tools
- **Application**: Sentry (error tracking)
- **Infrastructure**: Supabase Analytics
- **Blockchain**: Etherscan, Tenderly
- **Custom**: Grafana + Prometheus

## Scalability Strategy

### Horizontal Scaling
- Supabase automatically scales database
- Edge Functions scale with traffic
- Frontend deployed to global CDN

### Vertical Scaling
- Database: Upgrade Supabase plan
- IPFS: Multiple gateway providers
- Blockchain: Multi-chain deployment

### Caching Strategy
- Browser cache: Static assets (1 year)
- CDN cache: Images, videos (1 month)
- API cache: Metadata (1 hour)
- Database cache: Query results (5 minutes)

## Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups (Supabase)
- **IPFS**: Pin to multiple providers (Pinata + Web3.Storage)
- **Smart Contracts**: Immutable on-chain
- **Code**: Git version control

### Recovery Procedures
1. Database restore from backup
2. IPFS content recovery from pins
3. Smart contract redeployment (if needed)
4. Frontend redeployment from Git

## Cost Optimization

### Estimated Monthly Costs (10K users)
- **Supabase**: $25-100 (Pro plan)
- **IPFS**: $20-50 (Pinata)
- **Vercel**: $0-20 (Hobby/Pro)
- **AI APIs**: Variable ($100-500)
- **Blockchain**: Gas fees only
- **Total**: ~$200-700/month

### Cost Reduction Strategies
- Use Supabase free tier initially
- Implement aggressive caching
- Optimize AI API calls
- Batch blockchain transactions
- Use cheaper IPFS alternatives

## Next Steps

See detailed implementation guides:
1. [Integration Blueprint](./integration-blueprint.md)
2. [Schema Diagrams](./schema-diagrams.md)
3. [Deployment Guide](./deployment-guide.md)
4. [CI/CD Configuration](../.github/workflows/)
