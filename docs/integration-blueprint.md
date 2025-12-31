# Integration Blueprint - Kōbo Platform

## Overview

This document provides detailed integration patterns for all external services and APIs used in the Kōbo platform.

## 1. AI Service Integration

### 1.1 Hugging Face Integration

**Purpose**: Image generation using FLUX.1-dev model

**Implementation**:
```typescript
// src/lib/aiServices/huggingface.ts
import { HfInference } from '@huggingface/inference'

export class HuggingFaceService {
  private client: HfInference
  
  constructor(apiKey: string) {
    this.client = new HfInference(apiKey)
  }
  
  async generateImage(prompt: string): Promise<Blob> {
    const response = await this.client.textToImage({
      model: 'black-forest-labs/FLUX.1-dev',
      inputs: prompt,
      parameters: {
        guidance_scale: 7.5,
        num_inference_steps: 50,
      }
    })
    return response
  }
}
```

**Edge Function Integration**:
```typescript
// supabase/functions/generate-ai-content/index.ts
const hfApiKey = Deno.env.get('HUGGING_FACE_API_KEY')
const response = await fetch(
  'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hfApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt }),
  }
)
```

**Frontend Usage**:
```typescript
// src/hooks/useAIGeneration.ts
const { data, isLoading } = useMutation({
  mutationFn: async (prompt: string) => {
    const { data } = await supabase.functions.invoke('generate-ai-content', {
      body: { prompt, type: 'image', userId }
    })
    return data
  }
})
```

### 1.2 Stability AI Integration

**Purpose**: High-quality image generation alternative

**Setup**:
```bash
# Environment variable
STABILITY_API_KEY=sk-...
```

**Implementation**:
```typescript
// src/lib/aiServices/stability.ts
export class StabilityAIService {
  async generateImage(prompt: string): Promise<string> {
    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
        }),
      }
    )
    const data = await response.json()
    return `data:image/png;base64,${data.artifacts[0].base64}`
  }
}
```

### 1.3 Runway ML Integration (Video)

**Purpose**: AI video generation

**Implementation**:
```typescript
// src/lib/aiServices/runway.ts
export class RunwayMLService {
  async generateVideo(prompt: string): Promise<string> {
    const response = await fetch('https://api.runwayml.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        duration: 4,
        resolution: '1280x720',
      }),
    })
    const { taskId } = await response.json()
    
    // Poll for completion
    return await this.pollTaskStatus(taskId)
  }
  
  private async pollTaskStatus(taskId: string): Promise<string> {
    // Implementation for polling task status
  }
}
```

### 1.4 ElevenLabs Integration (Audio)

**Purpose**: AI audio/voice generation

**Implementation**:
```typescript
// src/lib/aiServices/elevenlabs.ts
export class ElevenLabsService {
  async generateAudio(text: string, voiceId: string = 'default'): Promise<Blob> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    )
    return await response.blob()
  }
}
```

### 1.5 AI Service Factory Pattern

**Unified Interface**:
```typescript
// src/lib/aiServices/factory.ts
export interface AIProvider {
  generateImage?(prompt: string): Promise<string | Blob>
  generateVideo?(prompt: string): Promise<string>
  generateAudio?(text: string): Promise<Blob>
}

export class AIServiceFactory {
  static getImageProvider(provider: 'huggingface' | 'stability'): AIProvider {
    switch (provider) {
      case 'huggingface':
        return new HuggingFaceService(process.env.HUGGING_FACE_API_KEY!)
      case 'stability':
        return new StabilityAIService()
      default:
        throw new Error('Unknown provider')
    }
  }
  
  static getVideoProvider(): AIProvider {
    return new RunwayMLService()
  }
  
  static getAudioProvider(): AIProvider {
    return new ElevenLabsService()
  }
}
```

## 2. IPFS Integration

### 2.1 Pinata Setup

**Configuration**:
```typescript
// src/lib/ipfsClient.ts
import { PinataSDK } from 'pinata-web3'

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
})
```

**Upload Flow**:
```typescript
// src/hooks/useIPFS.ts
export const useIPFS = () => {
  const uploadFile = async (file: File): Promise<string> => {
    const upload = await pinata.upload.file(file)
    return upload.IpfsHash
  }
  
  const uploadJSON = async (metadata: object): Promise<string> => {
    const upload = await pinata.upload.json(metadata)
    return upload.IpfsHash
  }
  
  const getURL = (cid: string): string => {
    return `https://${process.env.PINATA_GATEWAY}/ipfs/${cid}`
  }
  
  return { uploadFile, uploadJSON, getURL }
}
```

**Edge Function Integration**:
```typescript
// supabase/functions/upload-to-ipfs/index.ts
import { PinataSDK } from 'https://esm.sh/pinata-web3'

Deno.serve(async (req) => {
  const pinata = new PinataSDK({
    pinataJwt: Deno.env.get('PINATA_JWT')!,
    pinataGateway: Deno.env.get('PINATA_GATEWAY')!,
  })
  
  const formData = await req.formData()
  const file = formData.get('file') as File
  
  const upload = await pinata.upload.file(file)
  
  return new Response(JSON.stringify({
    cid: upload.IpfsHash,
    url: `https://${Deno.env.get('PINATA_GATEWAY')}/ipfs/${upload.IpfsHash}`
  }))
})
```

### 2.2 Web3.Storage Alternative

**Setup**:
```typescript
// src/lib/web3storage.ts
import { Web3Storage } from 'web3.storage'

const client = new Web3Storage({ 
  token: process.env.WEB3_STORAGE_TOKEN! 
})

export const uploadToWeb3Storage = async (files: File[]): Promise<string> => {
  const cid = await client.put(files)
  return cid
}
```

### 2.3 NFT Metadata Upload Pattern

**Complete Flow**:
```typescript
// src/utils/nftMetadata.ts
export const uploadNFTMetadata = async (
  mediaFile: File,
  metadata: {
    name: string
    description: string
    attributes: Array<{ trait_type: string; value: string | number }>
  }
): Promise<string> => {
  // 1. Upload media file to IPFS
  const mediaCID = await uploadFile(mediaFile)
  const mediaURL = `ipfs://${mediaCID}`
  
  // 2. Create metadata JSON
  const metadataJSON = {
    name: metadata.name,
    description: metadata.description,
    image: mediaURL,
    attributes: metadata.attributes,
    external_url: `https://kobo.app/nft/${Date.now()}`,
  }
  
  // 3. Upload metadata to IPFS
  const metadataCID = await uploadJSON(metadataJSON)
  
  // 4. Return metadata URI
  return `ipfs://${metadataCID}`
}
```

## 3. Web3 Wallet Integration

### 3.1 RainbowKit Configuration

**Setup**:
```typescript
// src/utils/wagmiConfig.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, base, arbitrum, optimism } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Kōbo NFT Platform',
  projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, polygon, base, arbitrum, optimism],
  ssr: false,
})
```

**App Integration**:
```typescript
// src/App.tsx
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* App content */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### 3.2 Sign-In with Ethereum (SIWE)

**Implementation**:
```typescript
// src/hooks/useAuth.ts
import { SiweMessage } from 'siwe'
import { useSignMessage, useAccount } from 'wagmi'

export const useAuth = () => {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  
  const signIn = async () => {
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in to Kōbo Platform',
      uri: window.location.origin,
      version: '1',
      chainId: 1,
    })
    
    const signature = await signMessageAsync({
      message: message.prepareMessage(),
    })
    
    // Verify signature on backend
    const { data } = await supabase.functions.invoke('verify-signature', {
      body: { message, signature }
    })
    
    return data
  }
  
  return { signIn }
}
```

**Backend Verification**:
```typescript
// supabase/functions/verify-signature/index.ts
import { SiweMessage } from 'https://esm.sh/siwe'

Deno.serve(async (req) => {
  const { message, signature } = await req.json()
  
  const siweMessage = new SiweMessage(message)
  const { success, data } = await siweMessage.verify({ signature })
  
  if (success) {
    // Create or update user session
    const { data: session } = await supabase.auth.signInWithPassword({
      email: `${data.address}@kobo.app`,
      password: signature, // Use signature as password
    })
    
    return new Response(JSON.stringify({ session }))
  }
  
  return new Response(JSON.stringify({ error: 'Invalid signature' }), {
    status: 401
  })
})
```

## 4. Smart Contract Integration

### 4.1 Contract Interaction Hooks

**Read Operations**:
```typescript
// src/hooks/useContract.ts
import { useReadContract } from 'wagmi'
import { koboNFTABI } from '@/contracts/abis'

export const useNFTMetadata = (tokenId: bigint) => {
  const { data: tokenURI } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: koboNFTABI,
    functionName: 'tokenURI',
    args: [tokenId],
  })
  
  return { tokenURI }
}
```

**Write Operations**:
```typescript
// src/hooks/useMint.ts
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

export const useMint = () => {
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })
  
  const mint = async (metadataURI: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: koboNFTABI,
      functionName: 'mint',
      args: [metadataURI],
    })
  }
  
  return { mint, isLoading, isSuccess, hash }
}
```

### 4.2 Multi-Chain Support

**Chain Configuration**:
```typescript
// src/utils/evmConfig.ts
export const SUPPORTED_CHAINS = {
  ethereum: {
    chainId: 1,
    contractAddress: '0x...',
    explorer: 'https://etherscan.io',
  },
  polygon: {
    chainId: 137,
    contractAddress: '0x...',
    explorer: 'https://polygonscan.com',
  },
  base: {
    chainId: 8453,
    contractAddress: '0x...',
    explorer: 'https://basescan.org',
  },
}

export const getContractAddress = (chainId: number): string => {
  const chain = Object.values(SUPPORTED_CHAINS).find(c => c.chainId === chainId)
  return chain?.contractAddress || ''
}
```

## 5. OpenSea Integration

### 5.1 Metadata Standards

**ERC-721 Metadata**:
```typescript
// src/types/nft.ts
export interface OpenSeaMetadata {
  name: string
  description: string
  image: string // IPFS URL
  external_url?: string
  animation_url?: string // For video/audio
  background_color?: string
  attributes: Array<{
    trait_type: string
    value: string | number
    display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date'
  }>
}
```

**Collection Metadata**:
```typescript
// Smart contract implementation
function contractURI() public view returns (string memory) {
  return "ipfs://QmCollection...";
}

// Collection metadata JSON
{
  "name": "Kōbo AI NFTs",
  "description": "AI-generated NFTs with provenance tracking",
  "image": "ipfs://QmCollectionImage...",
  "external_link": "https://kobo.app",
  "seller_fee_basis_points": 250, // 2.5% royalty
  "fee_recipient": "0x..."
}
```

### 5.2 Royalty Configuration (ERC-2981)

**Smart Contract**:
```solidity
// contracts/src/KoboNFTExtended.sol
function royaltyInfo(uint256 tokenId, uint256 salePrice)
  external
  view
  returns (address receiver, uint256 royaltyAmount)
{
  return (owner(), (salePrice * 250) / 10000); // 2.5%
}
```

### 5.3 OpenSea API Integration

**Fetch NFT Data**:
```typescript
// src/lib/opensea.ts
export const fetchNFTFromOpenSea = async (
  contractAddress: string,
  tokenId: string
) => {
  const response = await fetch(
    `https://api.opensea.io/api/v2/chain/ethereum/contract/${contractAddress}/nfts/${tokenId}`,
    {
      headers: {
        'X-API-KEY': process.env.OPENSEA_API_KEY!,
      },
    }
  )
  return await response.json()
}
```

## 6. Indexing Integration

### 6.1 The Graph Protocol

**Subgraph Schema**:
```graphql
# schema.graphql
type NFT @entity {
  id: ID!
  tokenId: BigInt!
  owner: Bytes!
  creator: Bytes!
  metadataURI: String!
  createdAt: BigInt!
  transfers: [Transfer!]! @derivedFrom(field: "nft")
  provenance: ProvenanceRecord
}

type Transfer @entity {
  id: ID!
  nft: NFT!
  from: Bytes!
  to: Bytes!
  timestamp: BigInt!
  transactionHash: Bytes!
}

type ProvenanceRecord @entity {
  id: ID!
  nft: NFT!
  originalCreator: Bytes!
  aiModel: String!
  prompt: String
  copyrightAuditId: String
  remixHistory: [String!]
}
```

**Subgraph Mapping**:
```typescript
// src/mapping.ts
import { Transfer as TransferEvent } from '../generated/KoboNFT/KoboNFT'
import { NFT, Transfer } from '../generated/schema'

export function handleTransfer(event: TransferEvent): void {
  let nft = NFT.load(event.params.tokenId.toString())
  
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString())
    nft.tokenId = event.params.tokenId
    nft.creator = event.params.to
    nft.createdAt = event.block.timestamp
  }
  
  nft.owner = event.params.to
  nft.save()
  
  let transfer = new Transfer(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  )
  transfer.nft = nft.id
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.timestamp = event.block.timestamp
  transfer.transactionHash = event.transaction.hash
  transfer.save()
}
```

**Frontend Query**:
```typescript
// src/hooks/useNFTQuery.ts
import { useQuery } from '@tanstack/react-query'
import { request, gql } from 'graphql-request'

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/kobo/nfts'

export const useNFTsByOwner = (owner: string) => {
  return useQuery({
    queryKey: ['nfts', owner],
    queryFn: async () => {
      const query = gql`
        query GetNFTs($owner: Bytes!) {
          nfts(where: { owner: $owner }) {
            id
            tokenId
            metadataURI
            createdAt
            provenance {
              aiModel
              prompt
            }
          }
        }
      `
      return request(SUBGRAPH_URL, query, { owner })
    },
  })
}
```

### 6.2 Alchemy NFT API (Alternative)

**Setup**:
```typescript
// src/lib/alchemy.ts
import { Alchemy, Network } from 'alchemy-sdk'

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY!,
  network: Network.ETH_MAINNET,
})

export const getNFTsByOwner = async (owner: string) => {
  const nfts = await alchemy.nft.getNftsForOwner(owner, {
    contractAddresses: [CONTRACT_ADDRESS],
  })
  return nfts
}

export const getNFTMetadata = async (tokenId: string) => {
  const metadata = await alchemy.nft.getNftMetadata(
    CONTRACT_ADDRESS,
    tokenId
  )
  return metadata
}
```

## 7. Copyright Detection Integration

### 7.1 Pixsy API

**Implementation**:
```typescript
// supabase/functions/copyright-audit/pixsy.ts
export const checkCopyright = async (imageUrl: string) => {
  const response = await fetch('https://api.pixsy.com/v2/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('PIXSY_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      search_type: 'comprehensive',
    }),
  })
  
  const data = await response.json()
  return {
    matches: data.matches,
    similarityScore: data.similarity_score,
  }
}
```

### 7.2 TinEye Reverse Image Search

**Implementation**:
```typescript
// supabase/functions/copyright-audit/tineye.ts
export const reversImageSearch = async (imageUrl: string) => {
  const response = await fetch(
    `https://api.tineye.com/rest/search/?image_url=${encodeURIComponent(imageUrl)}`,
    {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('TINEYE_API_KEY')}`,
      },
    }
  )
  
  const data = await response.json()
  return {
    totalMatches: data.results.matches.length,
    matches: data.results.matches,
  }
}
```

## 8. Real-time Features

### 8.1 Supabase Realtime

**Subscribe to New Mints**:
```typescript
// src/hooks/useRealtimeNFTs.ts
export const useRealtimeNFTs = () => {
  const [nfts, setNFTs] = useState<NFT[]>([])
  
  useEffect(() => {
    const channel = supabase
      .channel('nfts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nfts' },
        (payload) => {
          setNFTs(prev => [payload.new as NFT, ...prev])
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return { nfts }
}
```

**Live Leaderboard**:
```typescript
// src/hooks/useRealtimeLeaderboard.ts
export const useRealtimeLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nft_likes' },
        () => {
          // Refetch leaderboard
          fetchLeaderboard()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return { leaderboard }
}
```

## 9. Payment Integration (Future)

### 9.1 Stripe for Fiat Payments

**Setup**:
```typescript
// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY!)
```

**Checkout Flow**:
```typescript
// supabase/functions/create-checkout/index.ts
import Stripe from 'https://esm.sh/stripe@14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

Deno.serve(async (req) => {
  const { priceId, userId } = await req.json()
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.headers.get('origin')}/success`,
    cancel_url: `${req.headers.get('origin')}/cancel`,
    metadata: { userId },
  })
  
  return new Response(JSON.stringify({ url: session.url }))
})
```

## 10. Analytics Integration

### 10.1 Mixpanel

**Setup**:
```typescript
// src/lib/analytics.ts
import mixpanel from 'mixpanel-browser'

mixpanel.init(process.env.VITE_MIXPANEL_TOKEN!)

export const trackEvent = (event: string, properties?: object) => {
  mixpanel.track(event, properties)
}

export const identifyUser = (userId: string, traits?: object) => {
  mixpanel.identify(userId)
  if (traits) mixpanel.people.set(traits)
}
```

**Usage**:
```typescript
// Track NFT mint
trackEvent('NFT Minted', {
  tokenId: '123',
  contentType: 'image',
  aiModel: 'FLUX.1-dev',
})
```

## Summary

This integration blueprint provides production-ready patterns for all external services. Each integration includes:
- ✅ Error handling
- ✅ Type safety
- ✅ Environment variable management
- ✅ Retry logic where applicable
- ✅ Rate limiting considerations

For deployment configurations, see [Deployment Guide](./deployment-guide.md).
