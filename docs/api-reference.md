# API Reference - Kōbo Platform

## Overview

This document provides comprehensive API documentation for all Supabase Edge Functions.

## Base URL

```
Production: https://your-project.supabase.co/functions/v1
Development: http://localhost:54321/functions/v1
```

## Authentication

All authenticated endpoints require a valid Supabase JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## Edge Functions

### 1. Generate AI Content

Generate AI content (image, video, or audio) from a text prompt.

**Endpoint**: `POST /generate-ai-content`

**Request Body**:
```json
{
  "prompt": "A futuristic cityscape at sunset",
  "type": "image",
  "userId": "uuid"
}
```

**Parameters**:
- `prompt` (string, required): Text prompt for AI generation
- `type` (string, required): Content type - "image", "video", or "audio"
- `userId` (string, required): User ID

**Response**:
```json
{
  "success": true,
  "generationId": "uuid",
  "contentUrl": "data:image/png;base64,...",
  "metadata": {
    "model": "FLUX.1-dev",
    "prompt": "A futuristic cityscape at sunset",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Example**:
```typescript
const { data, error } = await supabase.functions.invoke('generate-ai-content', {
  body: {
    prompt: 'A futuristic cityscape at sunset',
    type: 'image',
    userId: user.id
  }
})
```

---

### 2. Copyright Audit

Run copyright audit on content to check originality.

**Endpoint**: `POST /copyright-audit`

**Request Body**:
```json
{
  "contentUrl": "https://example.com/image.jpg",
  "contentType": "image",
  "userId": "uuid",
  "prompt": "Optional prompt text"
}
```

**Parameters**:
- `contentUrl` (string, required): URL of content to audit
- `contentType` (string, required): "image", "video", or "audio"
- `userId` (string, required): User ID
- `prompt` (string, optional): Original prompt used

**Response**:
```json
{
  "success": true,
  "auditId": "uuid",
  "results": {
    "originalityScore": 95.5,
    "similarContentFound": false,
    "potentialMatches": [],
    "timestamp": "2024-01-01T00:00:00Z",
    "contentHash": "hash_123456789"
  }
}
```

**Example**:
```typescript
const { data } = await supabase.functions.invoke('copyright-audit', {
  body: {
    contentUrl: generatedImageUrl,
    contentType: 'image',
    userId: user.id,
    prompt: 'A futuristic cityscape'
  }
})
```

---

### 3. Mint NFT

Prepare NFT metadata and create database record for minting.

**Endpoint**: `POST /mint-nft`

**Request Body**:
```json
{
  "userId": "uuid",
  "walletAddress": "0x...",
  "contentUrl": "ipfs://QmHash",
  "contentType": "image",
  "prompt": "A futuristic cityscape",
  "auditId": "uuid",
  "generationId": "uuid",
  "metadata": {
    "name": "Futuristic Cityscape #1",
    "description": "AI-generated cityscape at sunset",
    "attributes": [
      { "trait_type": "Style", "value": "Futuristic" },
      { "trait_type": "Time", "value": "Sunset" }
    ]
  }
}
```

**Parameters**:
- `userId` (string, required): User ID
- `walletAddress` (string, required): User's wallet address
- `contentUrl` (string, required): IPFS URL of content
- `contentType` (string, required): "image", "video", or "audio"
- `metadata` (object, required): NFT metadata
  - `name` (string, required): NFT name
  - `description` (string, required): NFT description
  - `attributes` (array, optional): NFT attributes
- `prompt` (string, optional): Original prompt
- `auditId` (string, optional): Copyright audit ID
- `generationId` (string, optional): AI generation ID

**Response**:
```json
{
  "success": true,
  "nftId": "uuid",
  "metadataUri": "https://your-project.supabase.co/functions/v1/nft-metadata/uuid",
  "provenance": {
    "creator": "0x...",
    "createdAt": "2024-01-01T00:00:00Z",
    "prompt": "A futuristic cityscape",
    "contentType": "image",
    "auditId": "uuid",
    "generationId": "uuid",
    "originalityVerified": true
  }
}
```

**Example**:
```typescript
const { data } = await supabase.functions.invoke('mint-nft', {
  body: {
    userId: user.id,
    walletAddress: address,
    contentUrl: ipfsUrl,
    contentType: 'image',
    metadata: {
      name: 'My NFT',
      description: 'AI-generated artwork',
      attributes: []
    }
  }
})
```

---

### 4. NFT Metadata

Retrieve ERC-721 compliant metadata for an NFT.

**Endpoint**: `GET /nft-metadata/:nftId`

**Parameters**:
- `nftId` (string, required): NFT ID (in URL path)

**Response**:
```json
{
  "name": "Futuristic Cityscape #1",
  "description": "AI-generated cityscape at sunset",
  "image": "ipfs://QmHash",
  "external_url": "https://kobo.app/nft/uuid",
  "attributes": [
    { "trait_type": "Style", "value": "Futuristic" },
    { "trait_type": "Time", "value": "Sunset" }
  ],
  "properties": {
    "contentType": "image",
    "creator": "0x...",
    "prompt": "A futuristic cityscape",
    "provenance": { ... },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Example**:
```bash
curl https://your-project.supabase.co/functions/v1/nft-metadata/uuid
```

---

### 5. Leaderboard

Get leaderboard rankings by category and timeframe.

**Endpoint**: `GET /leaderboard?category=mints&timeframe=week&limit=50`

**Query Parameters**:
- `category` (string, optional): "mints", "likes", "collaborations", "battles", or "overall" (default: "overall")
- `timeframe` (string, optional): "day", "week", "month", or "all" (default: "all")
- `limit` (number, optional): Number of results (default: 50, max: 100)

**Response**:
```json
{
  "success": true,
  "category": "mints",
  "timeframe": "week",
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "walletAddress": "0x...",
      "score": 42,
      "category": "mints"
    },
    {
      "rank": 2,
      "userId": "uuid",
      "walletAddress": "0x...",
      "score": 38,
      "category": "mints"
    }
  ]
}
```

**Example**:
```typescript
const { data } = await supabase.functions.invoke('leaderboard', {
  method: 'GET',
  params: {
    category: 'mints',
    timeframe: 'week',
    limit: 10
  }
})
```

---

### 6. Social Actions

Perform social actions: like, gift, collaborate, or battle.

**Endpoint**: `POST /social-actions`

**Request Body**:
```json
{
  "action": "like",
  "userId": "uuid",
  "nftId": "uuid",
  "targetUserId": "uuid",
  "metadata": {}
}
```

**Parameters**:
- `action` (string, required): "like", "gift", "collaborate", or "battle"
- `userId` (string, required): User performing action
- `nftId` (string, required): NFT ID
- `targetUserId` (string, optional): Target user (required for gift, collaborate, battle)
- `metadata` (object, optional): Additional metadata

**Response (Like)**:
```json
{
  "success": true,
  "action": "like",
  "result": {
    "liked": true
  }
}
```

**Response (Gift)**:
```json
{
  "success": true,
  "action": "gift",
  "result": {
    "giftId": "uuid",
    "status": "pending"
  }
}
```

**Response (Collaborate)**:
```json
{
  "success": true,
  "action": "collaborate",
  "result": {
    "collaborationId": "uuid",
    "status": "pending"
  }
}
```

**Response (Battle)**:
```json
{
  "success": true,
  "action": "battle",
  "result": {
    "battleId": "uuid",
    "status": "pending"
  }
}
```

**Example**:
```typescript
// Like an NFT
const { data } = await supabase.functions.invoke('social-actions', {
  body: {
    action: 'like',
    userId: user.id,
    nftId: nft.id
  }
})

// Gift an NFT
const { data } = await supabase.functions.invoke('social-actions', {
  body: {
    action: 'gift',
    userId: user.id,
    nftId: nft.id,
    targetUserId: recipient.id,
    metadata: { message: 'Happy birthday!' }
  }
})
```

---

### 7. Prompt Marketplace

List, search, or purchase prompts.

**Endpoint**: `GET /prompt-marketplace?action=search&query=cityscape&limit=20`

**Query Parameters (Search)**:
- `action` (string): "search"
- `query` (string, optional): Search query
- `category` (string, optional): Filter by category
- `limit` (number, optional): Number of results (default: 20)

**Response (Search)**:
```json
{
  "success": true,
  "prompts": [
    {
      "id": "uuid",
      "seller_id": "uuid",
      "prompt": "A futuristic cityscape at sunset",
      "description": "Perfect for sci-fi artwork",
      "price": 5.00,
      "category": "cityscape",
      "tags": ["futuristic", "sunset", "city"],
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**Endpoint**: `POST /prompt-marketplace`

**Request Body (List)**:
```json
{
  "action": "list",
  "userId": "uuid",
  "listingData": {
    "prompt": "A futuristic cityscape at sunset",
    "description": "Perfect for sci-fi artwork",
    "price": 5.00,
    "category": "cityscape",
    "tags": ["futuristic", "sunset", "city"]
  }
}
```

**Response (List)**:
```json
{
  "success": true,
  "listingId": "uuid",
  "listing": { ... }
}
```

**Request Body (Buy)**:
```json
{
  "action": "buy",
  "userId": "uuid",
  "promptId": "uuid"
}
```

**Response (Buy)**:
```json
{
  "success": true,
  "purchaseId": "uuid",
  "prompt": "A futuristic cityscape at sunset"
}
```

**Example**:
```typescript
// Search prompts
const { data } = await supabase.functions.invoke('prompt-marketplace', {
  method: 'GET',
  params: {
    action: 'search',
    query: 'cityscape',
    limit: 20
  }
})

// List a prompt
const { data } = await supabase.functions.invoke('prompt-marketplace', {
  body: {
    action: 'list',
    userId: user.id,
    listingData: {
      prompt: 'A futuristic cityscape',
      description: 'Great for sci-fi',
      price: 5.00,
      category: 'cityscape',
      tags: ['futuristic']
    }
  }
})

// Buy a prompt
const { data } = await supabase.functions.invoke('prompt-marketplace', {
  body: {
    action: 'buy',
    userId: user.id,
    promptId: 'uuid'
  }
})
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request (missing or invalid parameters)
- `401`: Unauthorized (invalid or missing JWT token)
- `404`: Not Found
- `500`: Internal Server Error

**Example Error Response**:
```json
{
  "error": "Missing required fields: prompt, type, userId"
}
```

## Rate Limiting

- **Anonymous requests**: 10 requests per minute
- **Authenticated requests**: 100 requests per minute
- **AI generation**: 5 requests per minute per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## CORS

All endpoints support CORS with the following headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

## Webhooks (Future)

Webhook endpoints for external integrations:

### Indexer Webhook
**Endpoint**: `POST /indexer-webhook`

Receives blockchain events from The Graph or other indexers.

**Request Body**:
```json
{
  "event": "Transfer",
  "data": {
    "tokenId": "123",
    "from": "0x...",
    "to": "0x...",
    "transactionHash": "0x..."
  }
}
```

## SDK Usage

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Generate AI content
const { data, error } = await supabase.functions.invoke('generate-ai-content', {
  body: {
    prompt: 'A futuristic cityscape',
    type: 'image',
    userId: user.id
  }
})

if (error) {
  console.error('Error:', error)
} else {
  console.log('Generated:', data.contentUrl)
}
```

### cURL

```bash
# Generate AI content
curl -X POST https://your-project.supabase.co/functions/v1/generate-ai-content \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic cityscape",
    "type": "image",
    "userId": "uuid"
  }'

# Get leaderboard
curl https://your-project.supabase.co/functions/v1/leaderboard?category=mints&timeframe=week
```

## Testing

Use the Supabase CLI to test functions locally:

```bash
# Start local development
supabase start

# Invoke function locally
supabase functions serve

# Test with curl
curl -X POST http://localhost:54321/functions/v1/generate-ai-content \
  -H "Authorization: Bearer YOUR_LOCAL_JWT" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "type": "image", "userId": "uuid"}'
```

## Support

For API support:
- Documentation: https://kobo.app/docs
- GitHub Issues: https://github.com/kobo/platform/issues
- Discord: https://discord.gg/kobo
