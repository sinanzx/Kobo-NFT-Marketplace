# Schema Diagrams - Kōbo Platform

## Overview

This document provides comprehensive schema diagrams for database, smart contracts, and API flows.

## 1. Database Schema (PostgreSQL)

### 1.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CORE ENTITIES                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│    profiles      │         │      nfts        │         │  ai_generations  │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ id (PK)          │◄───────┤│ id (PK)          │         │ id (PK)          │
│ user_id (FK)     │         │ user_id (FK)     │◄───────┤│ user_id (FK)     │
│ wallet_address   │         │ wallet_address   │         │ prompt           │
│ username         │         │ token_id         │         │ content_type     │
│ avatar_url       │         │ content_url      │         │ content_url      │
│ bio              │         │ content_type     │         │ metadata         │
│ created_at       │         │ name             │         │ created_at       │
│ updated_at       │         │ description      │         └──────────────────┘
└──────────────────┘         │ attributes       │
                             │ prompt           │
                             │ audit_id (FK)    │
                             │ generation_id(FK)│
                             │ provenance       │
                             │ status           │
                             │ created_at       │
                             └──────────────────┘
                                      │
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
         ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
         │ copyright_audits │ │  nft_likes   │ │   nft_gifts      │
         ├──────────────────┤ ├──────────────┤ ├──────────────────┤
         │ id (PK)          │ │ id (PK)      │ │ id (PK)          │
         │ user_id (FK)     │ │ user_id (FK) │ │ sender_id (FK)   │
         │ content_url      │ │ nft_id (FK)  │ │ recipient_id(FK) │
         │ content_type     │ │ created_at   │ │ nft_id (FK)      │
         │ prompt           │ └──────────────┘ │ message          │
         │ originality_score│                  │ status           │
         │ similar_content  │                  │ created_at       │
         │ audit_results    │                  └──────────────────┘
         │ content_hash     │
         │ created_at       │
         └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      SOCIAL & MARKETPLACE                                │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐
│   collaborations     │       │    nft_battles       │
├──────────────────────┤       ├──────────────────────┤
│ id (PK)              │       │ id (PK)              │
│ initiator_id (FK)    │       │ challenger_id (FK)   │
│ collaborator_id (FK) │       │ opponent_id (FK)     │
│ base_nft_id (FK)     │       │ challenger_nft_id(FK)│
│ result_nft_id (FK)   │       │ opponent_nft_id (FK) │
│ status               │       │ winner_id (FK)       │
│ metadata             │       │ votes                │
│ created_at           │       │ status               │
│ completed_at         │       │ metadata             │
└──────────────────────┘       │ created_at           │
                               │ ended_at             │
                               └──────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐
│ prompt_marketplace   │       │  prompt_purchases    │
├──────────────────────┤       ├──────────────────────┤
│ id (PK)              │◄─────┤│ id (PK)              │
│ seller_id (FK)       │       │ buyer_id (FK)        │
│ prompt               │       │ seller_id (FK)       │
│ description          │       │ prompt_id (FK)       │
│ price                │       │ price                │
│ category             │       │ status               │
│ tags                 │       │ created_at           │
│ status               │       └──────────────────────┘
│ sales_count          │
│ created_at           │
└──────────────────────┘
```

### 1.2 Table Definitions

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);
CREATE INDEX idx_profiles_username ON profiles(username);
```

#### nfts
```sql
CREATE TABLE nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  token_id BIGINT,
  content_url TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('image', 'video', 'audio')),
  name TEXT NOT NULL,
  description TEXT,
  attributes JSONB DEFAULT '[]',
  prompt TEXT,
  audit_id UUID REFERENCES copyright_audits(id),
  generation_id UUID REFERENCES ai_generations(id),
  provenance JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'minted', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nfts_user ON nfts(user_id);
CREATE INDEX idx_nfts_wallet ON nfts(wallet_address);
CREATE INDEX idx_nfts_token ON nfts(token_id);
CREATE INDEX idx_nfts_status ON nfts(status);
```

#### ai_generations
```sql
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('image', 'video', 'audio')),
  content_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generations_user ON ai_generations(user_id);
CREATE INDEX idx_generations_type ON ai_generations(content_type);
```

#### copyright_audits
```sql
CREATE TABLE copyright_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_url TEXT NOT NULL,
  content_type TEXT,
  prompt TEXT,
  originality_score DECIMAL(5,2),
  similar_content_found BOOLEAN DEFAULT FALSE,
  audit_results JSONB,
  content_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audits_user ON copyright_audits(user_id);
CREATE INDEX idx_audits_hash ON copyright_audits(content_hash);
```

#### Social Tables
```sql
-- Likes
CREATE TABLE nft_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, nft_id)
);

-- Gifts
CREATE TABLE nft_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaborations
CREATE TABLE collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  collaborator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  base_nft_id UUID REFERENCES nfts(id),
  result_nft_id UUID REFERENCES nfts(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Battles
CREATE TABLE nft_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenger_nft_id UUID REFERENCES nfts(id),
  opponent_nft_id UUID REFERENCES nfts(id),
  winner_id UUID REFERENCES auth.users(id),
  votes JSONB DEFAULT '{"challenger": 0, "opponent": 0}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);
```

#### Marketplace Tables
```sql
-- Prompt Marketplace
CREATE TABLE prompt_marketplace (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt Purchases
CREATE TABLE prompt_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompt_marketplace(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Row-Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- NFTs: Public read, authenticated write
CREATE POLICY "NFTs are viewable by everyone"
  ON nfts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own NFTs"
  ON nfts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AI Generations: Users can only see their own
CREATE POLICY "Users can view own generations"
  ON ai_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations"
  ON ai_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## 2. Smart Contract Schema

### 2.1 Contract Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    KoboNFT (ERC-721)                            │
│  Base NFT contract with minting and ownership                   │
├─────────────────────────────────────────────────────────────────┤
│ State Variables:                                                │
│  - _tokenIds: Counter                                           │
│  - _tokenURIs: mapping(uint256 => string)                       │
│  - _creators: mapping(uint256 => address)                       │
│                                                                 │
│ Functions:                                                      │
│  + mint(string metadataURI) → uint256                           │
│  + tokenURI(uint256 tokenId) → string                           │
│  + getCreator(uint256 tokenId) → address                        │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ inherits
                            │
┌─────────────────────────────────────────────────────────────────┐
│              KoboNFTExtended (Enhanced Features)                │
│  Adds provenance, royalties, and metadata updates               │
├─────────────────────────────────────────────────────────────────┤
│ Implements:                                                     │
│  - ERC-4906 (MetadataUpdate)                                    │
│  - ERC-7160 (Multi-Metadata)                                    │
│  - ERC-2981 (Royalty Standard)                                  │
│                                                                 │
│ State Variables:                                                │
│  - _provenance: mapping(uint256 => ProvenanceData)              │
│  - _royaltyInfo: RoyaltyInfo                                    │
│  - _metadataVersions: mapping(uint256 => string[])              │
│                                                                 │
│ Structs:                                                        │
│  struct ProvenanceData {                                        │
│    address originalCreator;                                     │
│    string aiModel;                                              │
│    string prompt;                                               │
│    uint256 timestamp;                                           │
│    string copyrightAuditId;                                     │
│    uint256[] remixHistory;                                      │
│  }                                                              │
│                                                                 │
│ Functions:                                                      │
│  + mintWithProvenance(...)                                      │
│  + updateMetadata(uint256 tokenId, string newURI)               │
│  + getProvenance(uint256 tokenId) → ProvenanceData              │
│  + royaltyInfo(uint256, uint256) → (address, uint256)           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              ProvenanceRegistry (Separate Contract)             │
│  Centralized provenance tracking across all NFTs                │
├─────────────────────────────────────────────────────────────────┤
│ State Variables:                                                │
│  - _records: mapping(bytes32 => ProvenanceRecord)               │
│  - _nftToRecords: mapping(address => mapping(uint256 => bytes32))│
│                                                                 │
│ Structs:                                                        │
│  struct ProvenanceRecord {                                      │
│    address nftContract;                                         │
│    uint256 tokenId;                                             │
│    address creator;                                             │
│    string contentHash;                                          │
│    string[] remixChain;                                         │
│    uint256 timestamp;                                           │
│  }                                                              │
│                                                                 │
│ Functions:                                                      │
│  + registerProvenance(...)                                      │
│  + getProvenance(address nft, uint256 tokenId)                  │
│  + addRemix(bytes32 recordId, bytes32 remixRecordId)            │
│  + verifyOriginality(string contentHash) → bool                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Contract Interfaces

```solidity
// IERC4906 - Metadata Update
interface IERC4906 {
  event MetadataUpdate(uint256 _tokenId);
  event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
}

// IERC7160 - Multi-Metadata
interface IERC7160 {
  function tokenURIs(uint256 tokenId) external view returns (string[] memory);
  function addTokenURI(uint256 tokenId, string memory uri) external;
}

// IERC2981 - Royalty Standard
interface IERC2981 {
  function royaltyInfo(uint256 tokenId, uint256 salePrice)
    external view returns (address receiver, uint256 royaltyAmount);
}

// IProvenance - Custom Interface
interface IProvenance {
  struct ProvenanceData {
    address originalCreator;
    string aiModel;
    string prompt;
    uint256 timestamp;
    string copyrightAuditId;
    uint256[] remixHistory;
  }
  
  function getProvenance(uint256 tokenId) 
    external view returns (ProvenanceData memory);
  
  function updateProvenance(uint256 tokenId, ProvenanceData memory data) 
    external;
}
```

### 2.3 Event Schema

```solidity
// Core Events
event NFTMinted(
  uint256 indexed tokenId,
  address indexed creator,
  string metadataURI,
  uint256 timestamp
);

event ProvenanceRecorded(
  uint256 indexed tokenId,
  address indexed creator,
  string aiModel,
  string copyrightAuditId
);

event MetadataUpdated(
  uint256 indexed tokenId,
  string newURI,
  uint256 version
);

event RemixCreated(
  uint256 indexed originalTokenId,
  uint256 indexed remixTokenId,
  address indexed remixer
);

event CollaborationStarted(
  uint256 indexed collaborationId,
  address indexed initiator,
  address indexed collaborator
);

event RoyaltyPaid(
  uint256 indexed tokenId,
  address indexed recipient,
  uint256 amount
);
```

## 3. API Flow Diagrams

### 3.1 NFT Minting Flow

```
┌─────────┐
│ Frontend│
└────┬────┘
     │
     │ 1. Generate AI Content
     ▼
┌─────────────────────────┐
│ Edge Function:          │
│ generate-ai-content     │
│                         │
│ - Call Hugging Face API │
│ - Store in DB           │
│ - Return content URL    │
└────────┬────────────────┘
         │
         │ 2. Run Copyright Audit
         ▼
┌─────────────────────────┐
│ Edge Function:          │
│ copyright-audit         │
│                         │
│ - Check originality     │
│ - Store audit results   │
│ - Return audit ID       │
└────────┬────────────────┘
         │
         │ 3. Upload to IPFS
         ▼
┌─────────────────────────┐
│ Edge Function:          │
│ upload-to-ipfs          │
│                         │
│ - Upload media to IPFS  │
│ - Create metadata JSON  │
│ - Upload metadata       │
│ - Return metadata CID   │
└────────┬────────────────┘
         │
         │ 4. Prepare Mint
         ▼
┌─────────────────────────┐
│ Edge Function:          │
│ mint-nft                │
│                         │
│ - Create NFT record     │
│ - Store provenance      │
│ - Return metadata URI   │
└────────┬────────────────┘
         │
         │ 5. Mint On-Chain
         ▼
┌─────────────────────────┐
│ Smart Contract:         │
│ KoboNFTExtended         │
│                         │
│ - Mint token            │
│ - Record provenance     │
│ - Emit events           │
└────────┬────────────────┘
         │
         │ 6. Update Status
         ▼
┌─────────────────────────┐
│ Database Update         │
│                         │
│ - Set status: 'minted'  │
│ - Store token ID        │
│ - Update provenance     │
└─────────────────────────┘
```

### 3.2 Social Action Flow (Like/Gift/Collaborate)

```
┌─────────┐
│ Frontend│
└────┬────┘
     │
     │ 1. User Action (Like/Gift/Collaborate)
     ▼
┌─────────────────────────┐
│ Edge Function:          │
│ social-actions          │
│                         │
│ - Validate user auth    │
│ - Check permissions     │
│ - Process action        │
└────────┬────────────────┘
         │
         ├─── LIKE ────────────────┐
         │                         │
         │                         ▼
         │              ┌──────────────────┐
         │              │ Toggle like in   │
         │              │ nft_likes table  │
         │              └──────────────────┘
         │
         ├─── GIFT ────────────────┐
         │                         │
         │                         ▼
         │              ┌──────────────────┐
         │              │ Create gift      │
         │              │ record           │
         │              │ Notify recipient │
         │              └──────────────────┘
         │
         └─── COLLABORATE ─────────┐
                                   │
                                   ▼
                        ┌──────────────────┐
                        │ Create collab    │
                        │ record           │
                        │ Notify partner   │
                        └──────────────────┘
```

### 3.3 Prompt Marketplace Flow

```
┌─────────┐
│ Seller  │
└────┬────┘
     │
     │ 1. List Prompt
     ▼
┌─────────────────────────┐
│ Edge Function:          │
│ prompt-marketplace      │
│ action: 'list'          │
│                         │
│ - Validate prompt       │
│ - Set price             │
│ - Create listing        │
└────────┬────────────────┘
         │
         │ 2. Store in DB
         ▼
┌─────────────────────────┐
│ prompt_marketplace      │
│ table                   │
└─────────────────────────┘
         │
         │ 3. Browse/Search
         ▼
┌─────────┐
│ Buyer   │
└────┬────┘
     │
     │ 4. Purchase Prompt
     ▼
┌─────────────────────────┐
│ Edge Function:          │
│ prompt-marketplace      │
│ action: 'buy'           │
│                         │
│ - Process payment       │
│ - Record purchase       │
│ - Transfer prompt       │
└────────┬────────────────┘
         │
         │ 5. Update Records
         ▼
┌─────────────────────────┐
│ - prompt_purchases      │
│ - Update sales_count    │
│ - Notify seller         │
└─────────────────────────┘
```

### 3.4 Leaderboard Update Flow

```
┌─────────────────────────┐
│ Database Trigger        │
│ (on nfts INSERT)        │
└────────┬────────────────┘
         │
         │ Real-time event
         ▼
┌─────────────────────────┐
│ Supabase Realtime       │
│ Channel: 'leaderboard'  │
└────────┬────────────────┘
         │
         │ Broadcast to subscribers
         ▼
┌─────────────────────────┐
│ Frontend Listeners      │
│                         │
│ - Update leaderboard    │
│ - Show notifications    │
│ - Animate changes       │
└─────────────────────────┘
         │
         │ On-demand fetch
         ▼
┌─────────────────────────┐
│ Edge Function:          │
│ leaderboard             │
│                         │
│ - Query aggregated data │
│ - Apply filters         │
│ - Return ranked list    │
└─────────────────────────┘
```

## 4. Data Flow Summary

### 4.1 Complete User Journey

```
User Action → Frontend → Edge Functions → Database/Blockchain → Response

Example: Minting an NFT
1. User enters prompt
2. Frontend calls generate-ai-content
3. Edge function calls Hugging Face API
4. Content stored in ai_generations table
5. Frontend calls copyright-audit
6. Audit results stored in copyright_audits table
7. Frontend uploads to IPFS via upload-to-ipfs
8. IPFS CID returned
9. Frontend calls mint-nft
10. NFT record created in nfts table
11. Frontend calls smart contract mint()
12. Token minted on-chain
13. Event emitted and indexed
14. Database updated with token ID
15. User sees success confirmation
```

### 4.2 Data Consistency Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   Source of Truth                           │
├─────────────────────────────────────────────────────────────┤
│ Blockchain:                                                 │
│  - Token ownership                                          │
│  - Transfer history                                         │
│  - Provenance records                                       │
│                                                             │
│ Database (Supabase):                                        │
│  - User profiles                                            │
│  - NFT metadata (cached)                                    │
│  - Social interactions                                      │
│  - Marketplace listings                                     │
│                                                             │
│ IPFS:                                                       │
│  - Media files                                              │
│  - Metadata JSON                                            │
│                                                             │
│ Synchronization:                                            │
│  - Blockchain events → Database updates                     │
│  - Database changes → Real-time broadcasts                  │
│  - IPFS CIDs → Stored in both blockchain & database         │
└─────────────────────────────────────────────────────────────┘
```

## 5. Security Schema

### 5.1 Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Connect Wallet
     ▼
┌─────────────────────────┐
│ RainbowKit              │
│ - MetaMask/WalletConnect│
└────────┬────────────────┘
         │
         │ 2. Sign Message (SIWE)
         ▼
┌─────────────────────────┐
│ Wallet Signature        │
│ - Nonce                 │
│ - Timestamp             │
│ - Domain                │
└────────┬────────────────┘
         │
         │ 3. Verify Signature
         ▼
┌─────────────────────────┐
│ Edge Function:          │
│ verify-signature        │
│                         │
│ - Validate signature    │
│ - Create/update user    │
│ - Generate JWT          │
└────────┬────────────────┘
         │
         │ 4. Store Session
         ▼
┌─────────────────────────┐
│ Supabase Auth           │
│ - JWT token             │
│ - Refresh token         │
│ - Session data          │
└─────────────────────────┘
```

### 5.2 Authorization Matrix

```
┌──────────────┬──────────┬──────────┬──────────┬──────────┐
│ Resource     │ Public   │ Auth User│ Owner    │ Admin    │
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ View NFTs    │    ✓     │    ✓     │    ✓     │    ✓     │
│ Mint NFT     │    ✗     │    ✓     │    ✓     │    ✓     │
│ Update NFT   │    ✗     │    ✗     │    ✓     │    ✓     │
│ Delete NFT   │    ✗     │    ✗     │    ✓     │    ✓     │
│ View Profile │    ✓     │    ✓     │    ✓     │    ✓     │
│ Edit Profile │    ✗     │    ✗     │    ✓     │    ✓     │
│ Like NFT     │    ✗     │    ✓     │    ✓     │    ✓     │
│ Gift NFT     │    ✗     │    ✓     │    ✓     │    ✓     │
│ List Prompt  │    ✗     │    ✓     │    ✓     │    ✓     │
│ Buy Prompt   │    ✗     │    ✓     │    ✓     │    ✓     │
└──────────────┴──────────┴──────────┴──────────┴──────────┘
```

## Summary

This schema documentation provides:
- ✅ Complete database structure with relationships
- ✅ Smart contract architecture and interfaces
- ✅ API flow diagrams for all major features
- ✅ Data consistency and security patterns
- ✅ Authorization matrix

For deployment and CI/CD configurations, see [Deployment Guide](./deployment-guide.md).
