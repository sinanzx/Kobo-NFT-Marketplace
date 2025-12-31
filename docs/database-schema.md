# Kōbo NFT Platform - Database Schema Design

## Overview
This document defines the complete database schema for the Kōbo NFT platform, supporting multi-modal NFT creation, copyright-proofing, provenance tracking, social features, and marketplace functionality.

## Core Tables

### 1. users
User profiles and authentication data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  twitter_handle TEXT,
  discord_handle TEXT,
  total_mints INTEGER DEFAULT 0,
  total_collaborations INTEGER DEFAULT 0,
  total_battles_won INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
```

### 2. nfts
Core NFT metadata and provenance tracking.

```sql
CREATE TABLE nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id BIGINT NOT NULL,
  contract_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'multi-modal'
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- AI Generation Data
  prompt TEXT NOT NULL,
  ai_model TEXT NOT NULL, -- 'huggingface/stable-diffusion', 'open-sora', 'musicgen'
  generation_params JSONB, -- model-specific parameters
  
  -- Provenance & Copyright
  copyright_proof JSONB, -- {timestamp, hash, service, certificate_url}
  c2pa_manifest_url TEXT,
  watermark_data JSONB,
  
  -- Metadata
  metadata_uri TEXT NOT NULL,
  metadata_json JSONB,
  traits JSONB, -- dynamic traits for gaming/evolution
  
  -- Status
  is_minted BOOLEAN DEFAULT false,
  is_listed BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  minted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(contract_address, token_id, chain_id)
);

CREATE INDEX idx_nfts_creator ON nfts(creator_id);
CREATE INDEX idx_nfts_owner ON nfts(owner_id);
CREATE INDEX idx_nfts_token ON nfts(contract_address, token_id);
CREATE INDEX idx_nfts_media_type ON nfts(media_type);
CREATE INDEX idx_nfts_created ON nfts(created_at DESC);
```

### 3. nft_provenance
Immutable audit trail for NFT lifecycle events.

```sql
CREATE TABLE nft_provenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'created', 'minted', 'transferred', 'updated', 'remixed', 'collaborated'
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Event Data
  from_address TEXT,
  to_address TEXT,
  transaction_hash TEXT,
  block_number BIGINT,
  
  -- Metadata Changes
  metadata_before JSONB,
  metadata_after JSONB,
  
  -- Additional Context
  event_data JSONB,
  notes TEXT,
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provenance_nft ON nft_provenance(nft_id, timestamp DESC);
CREATE INDEX idx_provenance_actor ON nft_provenance(actor_id);
CREATE INDEX idx_provenance_event_type ON nft_provenance(event_type);
```

### 4. nft_derivatives
Track remixes and derivative works.

```sql
CREATE TABLE nft_derivatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  derivative_nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  parent_nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  
  -- Derivative Info
  derivative_type TEXT NOT NULL, -- 'remix', 'style-transfer', 'composite', 'evolution'
  contribution_percentage DECIMAL(5,2), -- for royalty splitting
  attribution_text TEXT,
  
  -- Remix Data
  remix_prompt TEXT,
  remix_params JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(derivative_nft_id, parent_nft_id)
);

CREATE INDEX idx_derivatives_child ON nft_derivatives(derivative_nft_id);
CREATE INDEX idx_derivatives_parent ON nft_derivatives(parent_nft_id);
```

## Prompt Marketplace

### 5. prompts
Tradeable and remixable prompts.

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Prompt Content
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  category TEXT, -- 'character', 'landscape', 'abstract', 'music', 'video'
  tags TEXT[],
  
  -- AI Model Compatibility
  compatible_models TEXT[], -- ['stable-diffusion', 'dall-e', 'midjourney']
  suggested_params JSONB,
  
  -- Marketplace
  is_listed BOOLEAN DEFAULT false,
  price DECIMAL(20,8), -- in ETH or token
  license_type TEXT, -- 'cc0', 'commercial', 'personal', 'exclusive'
  
  -- Stats
  use_count INTEGER DEFAULT 0,
  remix_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,
  
  -- Example Output
  example_nft_id UUID REFERENCES nfts(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompts_creator ON prompts(creator_id);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_listed ON prompts(is_listed) WHERE is_listed = true;
CREATE INDEX idx_prompts_rating ON prompts(rating_avg DESC);
```

### 6. prompt_purchases
Track prompt marketplace transactions.

```sql
CREATE TABLE prompt_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  price DECIMAL(20,8) NOT NULL,
  transaction_hash TEXT,
  license_type TEXT NOT NULL,
  
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchases_prompt ON prompt_purchases(prompt_id);
CREATE INDEX idx_purchases_buyer ON prompt_purchases(buyer_id);
CREATE INDEX idx_purchases_seller ON prompt_purchases(seller_id);
```

## Social Features

### 7. collaborations
Multi-creator NFT projects.

```sql
CREATE TABLE collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL, -- 'pending', 'active', 'completed', 'cancelled'
  
  -- Collaboration Type
  collab_type TEXT NOT NULL, -- 'sequential', 'parallel', 'merge', 'battle-collab'
  
  -- Settings
  max_contributors INTEGER,
  contribution_deadline TIMESTAMPTZ,
  voting_enabled BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_collabs_status ON collaborations(status);
CREATE INDEX idx_collabs_nft ON collaborations(nft_id);
```

### 8. collaboration_contributors
Individual contributions to collaborative NFTs.

```sql
CREATE TABLE collaboration_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id UUID REFERENCES collaborations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  role TEXT, -- 'initiator', 'contributor', 'voter'
  contribution_type TEXT, -- 'prompt', 'style', 'refinement', 'audio', 'video'
  contribution_data JSONB,
  
  royalty_share DECIMAL(5,2), -- percentage
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(collaboration_id, user_id)
);

CREATE INDEX idx_collab_contrib_collab ON collaboration_contributors(collaboration_id);
CREATE INDEX idx_collab_contrib_user ON collaboration_contributors(user_id);
```

### 9. battles
NFT creation battles and challenges.

```sql
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,
  rules JSONB,
  
  -- Battle Type
  battle_type TEXT NOT NULL, -- '1v1', 'tournament', 'community-vote', 'time-challenge'
  
  -- Participants
  max_participants INTEGER,
  entry_fee DECIMAL(20,8),
  
  -- Prize Pool
  prize_pool DECIMAL(20,8),
  prize_distribution JSONB, -- {1st: 50%, 2nd: 30%, 3rd: 20%}
  
  -- Timing
  registration_start TIMESTAMPTZ NOT NULL,
  registration_end TIMESTAMPTZ NOT NULL,
  battle_start TIMESTAMPTZ NOT NULL,
  battle_end TIMESTAMPTZ NOT NULL,
  voting_end TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'registration', 'active', 'voting', 'completed', 'cancelled'
  
  -- Results
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_start ON battles(battle_start);
```

### 10. battle_entries
NFT submissions for battles.

```sql
CREATE TABLE battle_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  
  entry_data JSONB,
  vote_count INTEGER DEFAULT 0,
  rank INTEGER,
  
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(battle_id, participant_id)
);

CREATE INDEX idx_battle_entries_battle ON battle_entries(battle_id);
CREATE INDEX idx_battle_entries_participant ON battle_entries(participant_id);
CREATE INDEX idx_battle_entries_votes ON battle_entries(vote_count DESC);
```

### 11. battle_votes
Community voting for battles.

```sql
CREATE TABLE battle_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES battle_entries(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  vote_weight INTEGER DEFAULT 1,
  
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(battle_id, voter_id)
);

CREATE INDEX idx_votes_battle ON battle_votes(battle_id);
CREATE INDEX idx_votes_entry ON battle_votes(entry_id);
```

### 12. gifts
NFT gifting system.

```sql
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Gift Type
  gift_type TEXT NOT NULL, -- 'direct', 'claimable', 'mystery', 'event'
  
  -- Claim Mechanism
  claim_code TEXT UNIQUE,
  claim_deadline TIMESTAMPTZ,
  is_claimed BOOLEAN DEFAULT false,
  
  -- Message
  message TEXT,
  animation_type TEXT, -- 'confetti', 'fireworks', 'sparkles', 'custom'
  
  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);

CREATE INDEX idx_gifts_sender ON gifts(sender_id);
CREATE INDEX idx_gifts_recipient ON gifts(recipient_id);
CREATE INDEX idx_gifts_claim_code ON gifts(claim_code) WHERE claim_code IS NOT NULL;
CREATE INDEX idx_gifts_unclaimed ON gifts(is_claimed) WHERE is_claimed = false;
```

## Leaderboard & Gamification

### 13. leaderboard_entries
Global and category-specific rankings.

```sql
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Leaderboard Type
  leaderboard_type TEXT NOT NULL, -- 'global', 'weekly', 'monthly', 'category'
  category TEXT, -- 'mints', 'battles', 'collaborations', 'marketplace'
  
  -- Scores
  score INTEGER NOT NULL,
  rank INTEGER,
  
  -- Period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, leaderboard_type, category, period_start)
);

CREATE INDEX idx_leaderboard_type ON leaderboard_entries(leaderboard_type, category);
CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(rank);
CREATE INDEX idx_leaderboard_user ON leaderboard_entries(user_id);
```

### 14. achievements
User achievements and badges.

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  badge_icon_url TEXT,
  
  -- Unlock Criteria
  criteria_type TEXT NOT NULL, -- 'mint_count', 'battle_wins', 'collaborations', 'marketplace_sales'
  criteria_threshold INTEGER,
  
  rarity TEXT, -- 'common', 'rare', 'epic', 'legendary'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 15. user_achievements
Track user achievement unlocks.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
```

## System Tables

### 16. copyright_audits
Copyright verification audit logs.

```sql
CREATE TABLE copyright_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  
  -- Audit Info
  audit_service TEXT NOT NULL, -- 'c2pa', 'sunlit-daymark', 'synthid'
  audit_status TEXT NOT NULL, -- 'pending', 'verified', 'failed', 'flagged'
  
  -- Results
  confidence_score DECIMAL(5,2),
  audit_data JSONB,
  certificate_url TEXT,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_audits_nft ON copyright_audits(nft_id);
CREATE INDEX idx_audits_status ON copyright_audits(audit_status);
```

### 17. notifications
User notification system.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'gift', 'battle_invite', 'collab_request', 'sale', 'achievement'
  title TEXT NOT NULL,
  message TEXT,
  
  -- Related Entities
  related_nft_id UUID REFERENCES nfts(id) ON DELETE SET NULL,
  related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  related_battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
  
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

## Row Level Security (RLS) Policies

All tables will have RLS enabled with appropriate policies:

- **Public Read**: NFTs, prompts (listed), leaderboards, battles
- **Owner Write**: Users can update their own profiles, NFTs, prompts
- **Authenticated Actions**: Minting, gifting, voting, collaborating
- **Admin Actions**: Flagging content, managing battles, audits

## Indexes Summary

All tables include:
- Primary key indexes (automatic)
- Foreign key indexes for joins
- Composite indexes for common query patterns
- Partial indexes for filtered queries (e.g., `WHERE is_listed = true`)

## Next Steps

1. Create migration files for each table group
2. Implement RLS policies
3. Create database functions for complex operations (leaderboard updates, reputation scoring)
4. Set up triggers for automatic timestamp updates
5. Create views for common queries (trending NFTs, active battles, top creators)
