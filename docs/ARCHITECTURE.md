# KoboNFT Platform Architecture

Comprehensive technical architecture documentation for the KoboNFT platform.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)
- [Technology Stack](#technology-stack)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Web3 Wallet │  │  AI Services │      │
│  │   (Vite)     │  │  Integration │  │  Integration │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │     IPFS     │  │   External   │      │
│  │   REST API   │  │   (Pinata)   │  │     APIs     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │  Edge Funcs  │  │   Services   │      │
│  │   Database   │  │   (Deno)     │  │   (TypeScript)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Blockchain Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Ethereum   │  │    Smart     │  │   Wallet     │      │
│  │   Network    │  │  Contracts   │  │   Connect    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction

```
User Browser
    │
    ├─→ React App (UI)
    │       │
    │       ├─→ Supabase Client (Data)
    │       │       │
    │       │       └─→ PostgreSQL Database
    │       │
    │       ├─→ Web3 Provider (Blockchain)
    │       │       │
    │       │       └─→ Smart Contracts
    │       │
    │       └─→ AI Services (Generation)
    │               │
    │               └─→ OpenAI/ElevenLabs APIs
    │
    └─→ IPFS Client (Storage)
            │
            └─→ Pinata Gateway
```

---

## Frontend Architecture

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **State Management**: React Context + Hooks
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**: wagmi + viem
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + Playwright

### Directory Structure

```
src/
├── components/              # React components
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── features/           # Feature-specific components
│   │   ├── AIGenerator.tsx
│   │   ├── GlassCylinderMint.tsx
│   │   └── ...
│   └── layout/             # Layout components
│       ├── Header.tsx
│       └── Footer.tsx
│
├── lib/                    # Business logic and services
│   ├── mintService.ts      # NFT minting logic
│   ├── battleService.ts    # Battle system logic
│   ├── collabService.ts    # Collaboration logic
│   ├── governanceService.ts # DAO governance
│   ├── gamificationService.ts # XP and achievements
│   ├── ipfsService.ts      # IPFS integration
│   ├── complianceService.ts # Content compliance
│   └── supabase.ts         # Supabase client
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useWallet.ts
│   └── useNFT.ts
│
├── types/                  # TypeScript type definitions
│   ├── database.types.ts   # Supabase generated types
│   ├── nft.types.ts
│   └── user.types.ts
│
├── utils/                  # Utility functions
│   ├── evmConfig.ts        # EVM chain configuration
│   ├── formatters.ts
│   └── validators.ts
│
├── pages/                  # Page components
│   ├── Home.tsx
│   ├── Mint.tsx
│   ├── Battles.tsx
│   └── ...
│
└── styles/                 # Global styles
    └── globals.css
```

### State Management

#### Context Providers

```typescript
// Authentication Context
<AuthProvider>
  {/* Manages user authentication state */}
</AuthProvider>

// Wallet Context
<WalletProvider>
  {/* Manages Web3 wallet connection */}
</WalletProvider>

// Theme Context
<ThemeProvider>
  {/* Manages dark/light theme */}
</ThemeProvider>
```

#### Data Fetching Strategy

- **Server State**: Supabase real-time subscriptions
- **Client State**: React hooks (useState, useReducer)
- **Cached Data**: Browser localStorage/sessionStorage
- **Optimistic Updates**: Immediate UI updates with rollback

### Component Architecture

#### Atomic Design Pattern

```
Atoms (Basic UI elements)
  └─→ button, input, label

Molecules (Simple combinations)
  └─→ form-field, search-bar

Organisms (Complex components)
  └─→ navigation, mint-form

Templates (Page layouts)
  └─→ dashboard-layout, auth-layout

Pages (Complete views)
  └─→ home, mint, battles
```

#### Component Example

```typescript
/**
 * Reusable NFT card component
 */
interface NFTCardProps {
  nft: NFT;
  onSelect?: (nft: NFT) => void;
  showActions?: boolean;
}

export function NFTCard({ nft, onSelect, showActions = true }: NFTCardProps) {
  // Component logic
  return (
    <Card>
      <CardImage src={nft.image} alt={nft.name} />
      <CardContent>
        <CardTitle>{nft.name}</CardTitle>
        <CardDescription>{nft.description}</CardDescription>
      </CardContent>
      {showActions && (
        <CardActions>
          <Button onClick={() => onSelect?.(nft)}>View</Button>
        </CardActions>
      )}
    </Card>
  );
}
```

---

## Backend Architecture

### Supabase Architecture

#### Database Schema

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  wallet_address TEXT UNIQUE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NFTs table
CREATE TABLE nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battles table
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  prize_pool DECIMAL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'voting', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battle entries
CREATE TABLE battle_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES battles(id),
  nft_id UUID REFERENCES nfts(id),
  creator_id UUID REFERENCES profiles(id),
  score DECIMAL DEFAULT 0,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaborations
CREATE TABLE collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('sequential', 'parallel', 'merge', 'battle-collab')),
  max_contributors INTEGER,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaboration contributions
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collaboration_id UUID REFERENCES collaborations(id),
  contributor_id UUID REFERENCES profiles(id),
  content_url TEXT,
  royalty_share DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Row Level Security (RLS)

```sql
-- Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can read all NFTs
CREATE POLICY "NFTs are viewable by everyone"
  ON nfts FOR SELECT
  USING (true);

-- Users can insert own NFTs
CREATE POLICY "Users can insert own NFTs"
  ON nfts FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update own NFTs
CREATE POLICY "Users can update own NFTs"
  ON nfts FOR UPDATE
  USING (auth.uid() = owner_id);
```

### Edge Functions

#### Function Structure

```typescript
// supabase/functions/mint-nft/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Parse request
    const { metadata, options } = await req.json();

    // Business logic
    const result = await mintNFT(metadata, options);

    // Return response
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

#### Available Edge Functions

- `mint-nft`: NFT minting with compliance checks
- `generate-ai-content`: AI content generation
- `process-battle-votes`: Battle voting aggregation
- `finalize-collaboration`: Collaboration completion
- `distribute-rewards`: Reward distribution

---

## Smart Contract Architecture

### Contract Structure

```
contracts/
├── src/
│   ├── KoboNFT.sol              # Main NFT contract
│   ├── KoboBattle.sol           # Battle system
│   ├── KoboCollaboration.sol    # Collaboration system
│   ├── KoboGovernance.sol       # DAO governance
│   ├── KoboToken.sol            # Governance token
│   └── libraries/
│       ├── RoyaltyDistributor.sol
│       └── VotingMechanism.sol
│
├── script/
│   └── Deploy.s.sol             # Deployment script
│
└── test/
    ├── KoboNFT.t.sol
    ├── KoboBattle.t.sol
    └── ...
```

### Main Contracts

#### KoboNFT.sol

```solidity
/**
 * @title KoboNFT
 * @notice Main NFT contract with royalty support
 */
contract KoboNFT is ERC721, ERC2981, Ownable {
    // Token counter
    uint256 private _tokenIdCounter;
    
    // Token metadata URIs
    mapping(uint256 => string) private _tokenURIs;
    
    // Collaborative NFT contributors
    mapping(uint256 => address[]) private _contributors;
    mapping(uint256 => mapping(address => uint256)) private _royaltyShares;
    
    /**
     * @notice Mint new NFT
     * @param to Recipient address
     * @param uri Token metadata URI
     */
    function mint(address to, string memory uri) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
    
    /**
     * @notice Mint collaborative NFT with multiple contributors
     * @param contributors Array of contributor addresses
     * @param shares Array of royalty shares (must sum to 10000)
     * @param uri Token metadata URI
     */
    function mintCollaborative(
        address[] memory contributors,
        uint256[] memory shares,
        string memory uri
    ) external returns (uint256) {
        require(contributors.length == shares.length, "Length mismatch");
        
        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        require(totalShares == 10000, "Shares must sum to 10000");
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(contributors[0], tokenId);
        _setTokenURI(tokenId, uri);
        
        _contributors[tokenId] = contributors;
        for (uint256 i = 0; i < contributors.length; i++) {
            _royaltyShares[tokenId][contributors[i]] = shares[i];
        }
        
        return tokenId;
    }
}
```

#### KoboBattle.sol

```solidity
/**
 * @title KoboBattle
 * @notice Battle competition system
 */
contract KoboBattle is Ownable {
    struct Battle {
        string theme;
        uint256 prizePool;
        uint256 entryFee;
        uint256 startTime;
        uint256 endTime;
        uint256 votingEndTime;
        BattleStatus status;
    }
    
    enum BattleStatus { Pending, Active, Voting, Completed }
    
    mapping(uint256 => Battle) public battles;
    mapping(uint256 => mapping(uint256 => uint256)) public votes; // battleId => tokenId => voteCount
    
    /**
     * @notice Create new battle
     */
    function createBattle(
        string memory theme,
        uint256 entryFee,
        uint256 duration
    ) external onlyOwner returns (uint256) {
        // Implementation
    }
    
    /**
     * @notice Submit entry to battle
     */
    function submitEntry(uint256 battleId, uint256 tokenId) external payable {
        // Implementation
    }
    
    /**
     * @notice Vote on battle entry
     */
    function vote(uint256 battleId, uint256 tokenId) external {
        // Implementation
    }
}
```

### Deployment Architecture

```
Mainnet Deployment
    │
    ├─→ KoboNFT (Proxy)
    │       └─→ Implementation Contract
    │
    ├─→ KoboBattle (Proxy)
    │       └─→ Implementation Contract
    │
    ├─→ KoboCollaboration (Proxy)
    │       └─→ Implementation Contract
    │
    ├─→ KoboGovernance (Timelock)
    │       └─→ Governor Contract
    │
    └─→ KoboToken (ERC20)
            └─→ Governance Token
```

---

## Data Flow

### NFT Minting Flow

```
1. User initiates mint
   │
   ├─→ Frontend validates input
   │
   ├─→ AI generates content (if applicable)
   │       └─→ OpenAI/ElevenLabs API
   │
   ├─→ Upload to IPFS
   │       └─→ Pinata API
   │       └─→ Returns IPFS hash
   │
   ├─→ Compliance scan
   │       └─→ Edge Function
   │       └─→ Returns scan results
   │
   ├─→ Smart contract interaction
   │       └─→ Call mint() function
   │       └─→ Wait for transaction
   │
   ├─→ Database update
   │       └─→ Insert NFT record
   │       └─→ Update user XP
   │
   └─→ Return success to user
```

### Battle Participation Flow

```
1. User joins battle
   │
   ├─→ Pay entry fee
   │       └─→ Smart contract transaction
   │
   ├─→ Create NFT entry
   │       └─→ Follow minting flow
   │
   ├─→ Submit to battle
   │       └─→ Database insert
   │       └─→ Smart contract call
   │
   └─→ Voting phase
           │
           ├─→ Users cast votes
           │       └─→ Smart contract transaction
           │
           ├─→ Aggregate scores
           │       └─→ Edge Function
           │
           └─→ Distribute prizes
                   └─→ Smart contract execution
```

### Collaboration Flow

```
1. Initiator creates collaboration
   │
   ├─→ Database insert
   │       └─→ collaboration record
   │
   ├─→ Upload initial content
   │       └─→ IPFS
   │
   └─→ Invite contributors
           │
           ├─→ Contributors add content
           │       └─→ IPFS upload
           │       └─→ Database insert
           │
           ├─→ Finalize collaboration
           │       └─→ Merge content
           │       └─→ Generate final NFT
           │
           └─→ Mint collaborative NFT
                   └─→ Smart contract with royalty splits
```

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────┐
│         Authentication Layer             │
│  ┌────────────┐      ┌────────────┐     │
│  │  Supabase  │      │   Wallet   │     │
│  │    Auth    │      │   Connect  │     │
│  └────────────┘      └────────────┘     │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Authorization Layer              │
│  ┌────────────┐      ┌────────────┐     │
│  │    RLS     │      │   Smart    │     │
│  │  Policies  │      │  Contract  │     │
│  └────────────┘      └────────────┘     │
└─────────────────────────────────────────┘
```

### Security Layers

1. **Frontend Security**
   - Input sanitization
   - XSS prevention
   - CSRF protection
   - Content Security Policy

2. **API Security**
   - Rate limiting
   - Authentication required
   - Request validation
   - CORS configuration

3. **Database Security**
   - Row Level Security (RLS)
   - Encrypted connections
   - Prepared statements
   - Audit logging

4. **Smart Contract Security**
   - Access control
   - Reentrancy guards
   - Integer overflow protection
   - Pausable functionality

---

## Scalability Considerations

### Frontend Scalability

- **Code Splitting**: Dynamic imports for routes
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: WebP format, lazy loading
- **Caching**: Service workers, CDN caching

### Backend Scalability

- **Database**: Connection pooling, read replicas
- **Edge Functions**: Auto-scaling, regional deployment
- **IPFS**: Pinning service, CDN integration
- **Rate Limiting**: Per-user, per-endpoint limits

### Blockchain Scalability

- **Layer 2**: Support for Polygon, Arbitrum
- **Batch Operations**: Batch minting, batch transfers
- **Gas Optimization**: Efficient contract code
- **Off-chain Computation**: Signatures, proofs

---

## Technology Stack

### Frontend
- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- shadcn/ui
- wagmi
- viem

### Backend
- Supabase (PostgreSQL)
- Deno (Edge Functions)
- IPFS (Pinata)

### Smart Contracts
- Solidity 0.8.20
- Foundry
- OpenZeppelin

### DevOps
- GitHub Actions
- Vercel
- Sentry
- Codecov

### External Services
- OpenAI (AI generation)
- ElevenLabs (Voice/audio)
- WalletConnect (Wallet integration)
- Etherscan (Contract verification)

---

**Last Updated**: November 25, 2024
**Version**: 1.0.0
