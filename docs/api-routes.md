# Kōbo NFT Platform - Backend API Routes

## Overview
This document defines all backend API routes for the Kōbo NFT platform, organized by feature domain. All routes will be implemented as Supabase Edge Functions.

## Base URL
```
https://<project-ref>.supabase.co/functions/v1/
```

## Authentication
All authenticated routes require JWT token in Authorization header:
```
Authorization: Bearer <supabase-jwt-token>
```

---

## 1. AI Generation APIs

### POST /ai/generate-image
Generate image from text prompt using Hugging Face.

**Request:**
```json
{
  "prompt": "cyberpunk city at sunset",
  "model": "stabilityai/stable-diffusion-2-1",
  "params": {
    "negative_prompt": "blurry, low quality",
    "num_inference_steps": 50,
    "guidance_scale": 7.5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "image_url": "https://...",
    "generation_id": "uuid",
    "model": "stabilityai/stable-diffusion-2-1",
    "params": {...}
  }
}
```

### POST /ai/generate-video
Generate video from text prompt (placeholder for Open-Sora integration).

**Request:**
```json
{
  "prompt": "waves crashing on beach",
  "duration": 5,
  "fps": 24,
  "resolution": "720p"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "video_url": "https://...",
    "thumbnail_url": "https://...",
    "generation_id": "uuid"
  }
}
```

### POST /ai/generate-audio
Generate audio/music from text prompt using MusicGen.

**Request:**
```json
{
  "prompt": "upbeat electronic dance music",
  "duration": 30,
  "model": "facebook/musicgen-medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audio_url": "https://...",
    "waveform_url": "https://...",
    "generation_id": "uuid"
  }
}
```

---

## 2. Copyright & Provenance APIs

### POST /copyright/verify
Verify content originality and generate copyright proof.

**Request:**
```json
{
  "content_url": "https://...",
  "content_type": "image",
  "metadata": {
    "prompt": "...",
    "model": "...",
    "creator_wallet": "0x..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audit_id": "uuid",
    "status": "verified",
    "confidence_score": 95.5,
    "timestamp_proof": {
      "service": "sunlit-daymark",
      "hash": "0x...",
      "block_number": 12345678,
      "certificate_url": "https://..."
    },
    "watermark": {
      "embedded": true,
      "method": "synthid"
    }
  }
}
```

### POST /copyright/c2pa-manifest
Generate C2PA manifest for content provenance.

**Request:**
```json
{
  "content_url": "https://...",
  "creator_info": {
    "name": "Artist Name",
    "wallet": "0x..."
  },
  "generation_data": {
    "prompt": "...",
    "model": "...",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "manifest_url": "https://...",
    "manifest_hash": "0x...",
    "signed_content_url": "https://..."
  }
}
```

### GET /copyright/audit/:nftId
Get copyright audit history for an NFT.

**Response:**
```json
{
  "success": true,
  "data": {
    "nft_id": "uuid",
    "audits": [
      {
        "id": "uuid",
        "service": "c2pa",
        "status": "verified",
        "confidence_score": 98.0,
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 3. NFT Management APIs

### POST /nft/create
Create NFT metadata before minting.

**Request:**
```json
{
  "title": "Cyberpunk Sunset",
  "description": "AI-generated cyberpunk cityscape",
  "media_url": "https://...",
  "media_type": "image",
  "prompt": "cyberpunk city at sunset",
  "ai_model": "stable-diffusion-2-1",
  "generation_params": {...},
  "copyright_proof": {...}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nft_id": "uuid",
    "metadata_uri": "ipfs://...",
    "metadata_json": {...}
  }
}
```

### POST /nft/mint
Record NFT minting on-chain.

**Request:**
```json
{
  "nft_id": "uuid",
  "token_id": 123,
  "contract_address": "0x...",
  "chain_id": 11155111,
  "transaction_hash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nft_id": "uuid",
    "minted": true,
    "provenance_entry_id": "uuid"
  }
}
```

### GET /nft/:id
Get NFT details with full provenance.

**Response:**
```json
{
  "success": true,
  "data": {
    "nft": {...},
    "creator": {...},
    "owner": {...},
    "provenance": [...],
    "derivatives": [...],
    "copyright_audits": [...]
  }
}
```

### PUT /nft/:id/traits
Update dynamic NFT traits (ERC-4906 compatible).

**Request:**
```json
{
  "traits": {
    "level": 5,
    "experience": 1250,
    "rarity": "epic"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nft_id": "uuid",
    "traits_updated": true,
    "metadata_uri": "ipfs://...",
    "provenance_entry_id": "uuid"
  }
}
```

### POST /nft/:id/remix
Create derivative/remix of existing NFT.

**Request:**
```json
{
  "parent_nft_id": "uuid",
  "remix_prompt": "same scene but at night",
  "remix_type": "style-transfer",
  "attribution": "Remixed from Original by @artist"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "derivative_nft_id": "uuid",
    "parent_nft_id": "uuid",
    "relationship_id": "uuid"
  }
}
```

---

## 4. Prompt Marketplace APIs

### POST /prompts/create
List a prompt for sale.

**Request:**
```json
{
  "title": "Epic Fantasy Landscape Prompt",
  "prompt_text": "majestic mountain range with...",
  "category": "landscape",
  "tags": ["fantasy", "mountains", "epic"],
  "compatible_models": ["stable-diffusion", "midjourney"],
  "price": "0.01",
  "license_type": "commercial",
  "example_nft_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prompt_id": "uuid",
    "listed": true
  }
}
```

### GET /prompts/marketplace
Browse marketplace prompts with filters.

**Query Params:**
- `category`: Filter by category
- `min_rating`: Minimum rating
- `sort`: `popular`, `recent`, `top_rated`, `price_low`, `price_high`
- `page`: Pagination
- `limit`: Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "prompts": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

### POST /prompts/:id/purchase
Purchase a prompt.

**Request:**
```json
{
  "payment_tx_hash": "0x...",
  "license_type": "commercial"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "purchase_id": "uuid",
    "prompt_id": "uuid",
    "prompt_text": "...",
    "license": {...}
  }
}
```

### POST /prompts/:id/rate
Rate a purchased prompt.

**Request:**
```json
{
  "rating": 5,
  "review": "Amazing prompt, generated beautiful results!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prompt_id": "uuid",
    "new_avg_rating": 4.8,
    "rating_count": 42
  }
}
```

---

## 5. Collaboration APIs

### POST /collaborations/create
Start a collaborative NFT project.

**Request:**
```json
{
  "title": "Collaborative Masterpiece",
  "description": "Multi-artist AI collaboration",
  "collab_type": "sequential",
  "max_contributors": 5,
  "contribution_deadline": "2024-12-31T23:59:59Z",
  "initial_prompt": "start with a forest scene"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "collaboration_id": "uuid",
    "invite_code": "COLLAB123"
  }
}
```

### POST /collaborations/:id/join
Join a collaboration.

**Request:**
```json
{
  "invite_code": "COLLAB123",
  "role": "contributor"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "collaboration_id": "uuid",
    "contributor_id": "uuid",
    "status": "pending"
  }
}
```

### POST /collaborations/:id/contribute
Submit contribution to collaboration.

**Request:**
```json
{
  "contribution_type": "refinement",
  "contribution_data": {
    "prompt_addition": "add glowing mushrooms",
    "media_url": "https://..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contribution_id": "uuid",
    "status": "pending_approval"
  }
}
```

### POST /collaborations/:id/finalize
Complete collaboration and mint final NFT.

**Request:**
```json
{
  "final_media_url": "https://...",
  "royalty_splits": [
    {"user_id": "uuid", "percentage": 40},
    {"user_id": "uuid", "percentage": 30},
    {"user_id": "uuid", "percentage": 30}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "collaboration_id": "uuid",
    "nft_id": "uuid",
    "status": "completed"
  }
}
```

---

## 6. Battle & Challenge APIs

### POST /battles/create
Create a new battle/challenge.

**Request:**
```json
{
  "title": "Cyberpunk Art Battle",
  "description": "Best cyberpunk cityscape wins",
  "theme": "cyberpunk",
  "battle_type": "community-vote",
  "max_participants": 50,
  "entry_fee": "0.001",
  "prize_pool": "0.05",
  "registration_start": "2024-01-01T00:00:00Z",
  "registration_end": "2024-01-07T23:59:59Z",
  "battle_start": "2024-01-08T00:00:00Z",
  "battle_end": "2024-01-14T23:59:59Z",
  "voting_end": "2024-01-21T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "battle_id": "uuid",
    "status": "upcoming"
  }
}
```

### POST /battles/:id/register
Register for a battle.

**Request:**
```json
{
  "payment_tx_hash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "battle_id": "uuid",
    "registration_confirmed": true
  }
}
```

### POST /battles/:id/submit
Submit NFT entry for battle.

**Request:**
```json
{
  "nft_id": "uuid",
  "entry_statement": "My interpretation of cyberpunk..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entry_id": "uuid",
    "battle_id": "uuid"
  }
}
```

### POST /battles/:id/vote
Vote for battle entry.

**Request:**
```json
{
  "entry_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vote_recorded": true,
    "entry_id": "uuid",
    "new_vote_count": 42
  }
}
```

### GET /battles/:id/results
Get battle results and rankings.

**Response:**
```json
{
  "success": true,
  "data": {
    "battle_id": "uuid",
    "status": "completed",
    "winner": {...},
    "rankings": [
      {
        "rank": 1,
        "entry": {...},
        "participant": {...},
        "votes": 150,
        "prize": "0.025"
      }
    ]
  }
}
```

---

## 7. Gifting APIs

### POST /gifts/send
Send NFT as gift.

**Request:**
```json
{
  "nft_id": "uuid",
  "recipient_wallet": "0x...",
  "gift_type": "claimable",
  "message": "Happy Birthday!",
  "animation_type": "confetti",
  "claim_deadline": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gift_id": "uuid",
    "claim_code": "GIFT-ABC123",
    "claim_url": "https://kobo.art/claim/GIFT-ABC123"
  }
}
```

### POST /gifts/claim
Claim a gift NFT.

**Request:**
```json
{
  "claim_code": "GIFT-ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gift_id": "uuid",
    "nft": {...},
    "sender": {...},
    "message": "Happy Birthday!",
    "claimed": true
  }
}
```

### GET /gifts/received
Get gifts received by user.

**Response:**
```json
{
  "success": true,
  "data": {
    "gifts": [
      {
        "gift_id": "uuid",
        "nft": {...},
        "sender": {...},
        "is_claimed": false,
        "sent_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 8. Leaderboard & Gamification APIs

### GET /leaderboard/:type
Get leaderboard rankings.

**Path Params:**
- `type`: `global`, `weekly`, `monthly`, `battles`, `collaborations`

**Query Params:**
- `category`: Optional category filter
- `limit`: Results limit (default 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard_type": "global",
    "period": "all-time",
    "rankings": [
      {
        "rank": 1,
        "user": {...},
        "score": 9850,
        "stats": {
          "total_mints": 150,
          "battles_won": 25,
          "collaborations": 40
        }
      }
    ]
  }
}
```

### GET /achievements
Get all available achievements.

**Response:**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "uuid",
        "name": "First Mint",
        "description": "Mint your first NFT",
        "badge_icon_url": "https://...",
        "rarity": "common",
        "criteria": {
          "type": "mint_count",
          "threshold": 1
        }
      }
    ]
  }
}
```

### GET /users/:id/achievements
Get user's unlocked achievements.

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "achievements": [
      {
        "achievement": {...},
        "unlocked_at": "2024-01-01T00:00:00Z"
      }
    ],
    "progress": [
      {
        "achievement": {...},
        "current": 8,
        "required": 10
      }
    ]
  }
}
```

---

## 9. User & Profile APIs

### GET /users/:id
Get user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "stats": {
      "total_mints": 42,
      "total_collaborations": 15,
      "battles_won": 8,
      "reputation_score": 850
    },
    "recent_nfts": [...],
    "achievements": [...]
  }
}
```

### PUT /users/profile
Update user profile.

**Request:**
```json
{
  "username": "artist123",
  "display_name": "Amazing Artist",
  "bio": "AI art enthusiast",
  "avatar_url": "https://...",
  "social": {
    "twitter": "@artist123",
    "discord": "artist#1234"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...}
  }
}
```

---

## 10. Notification APIs

### GET /notifications
Get user notifications.

**Query Params:**
- `unread_only`: Boolean
- `type`: Filter by notification type
- `limit`: Results limit

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "gift",
        "title": "You received a gift!",
        "message": "...",
        "is_read": false,
        "action_url": "/gifts/claim/...",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

### PUT /notifications/:id/read
Mark notification as read.

**Response:**
```json
{
  "success": true,
  "data": {
    "notification_id": "uuid",
    "is_read": true
  }
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Prompt text is required",
    "details": {...}
  }
}
```

### Common Error Codes
- `INVALID_INPUT`: Validation error
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT`: Too many requests
- `SERVER_ERROR`: Internal server error
- `BLOCKCHAIN_ERROR`: On-chain transaction failed
- `AI_SERVICE_ERROR`: AI generation service error

---

## Rate Limiting

- **Authenticated**: 100 requests/minute
- **AI Generation**: 10 requests/minute
- **Public Endpoints**: 30 requests/minute

---

## Webhooks (Future)

Planned webhook events:
- `nft.minted`
- `battle.completed`
- `gift.claimed`
- `collaboration.finalized`
- `achievement.unlocked`
