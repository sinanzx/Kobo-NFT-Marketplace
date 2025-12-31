# Media Generation Integration Guide

This guide covers the integration of ElevenLabs (audio) and Runway ML (video) APIs for NFT media generation in the Kobo platform.

## Overview

The Kobo platform now supports three types of NFT media generation:
- **Images**: Using Hugging Face Stable Diffusion
- **Audio**: Using ElevenLabs Text-to-Speech API
- **Video**: Using Runway ML Video Generation API

## Setup

### 1. Environment Variables

Add the following API keys to your `.env` file:

```bash
# ElevenLabs API Key (for audio/voice generation)
# Get your key from: https://elevenlabs.io/app/settings/api-keys
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Runway ML API Key (for video generation)
# Get your key from: https://app.runwayml.com/account
VITE_RUNWAY_API_KEY=your_runway_api_key

# Pinata IPFS (required for uploading audio/video files)
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
```

### 2. API Key Acquisition

#### ElevenLabs
1. Sign up at [ElevenLabs](https://elevenlabs.io)
2. Navigate to Settings → API Keys
3. Create a new API key
4. Free tier includes 10,000 characters/month

#### Runway ML
1. Sign up at [Runway ML](https://runwayml.com)
2. Go to Account Settings
3. Generate an API key
4. Pricing: $0.01/credit, 5-40 credits per second depending on model

## Features

### Audio Generation (ElevenLabs)

#### Available Voices
The platform includes 20+ pre-configured voices across different categories:
- Female voices: Aria, Sarah, Laura, Charlotte, Alice, Matilda, Jessica, Lily
- Male voices: Roger, Charlie, George, Callum, Liam, Will, Eric, Chris, Brian, Daniel, Bill
- Neutral voices: River

#### Voice Settings
- **Stability** (0-1): Controls voice consistency
- **Similarity Boost** (0-1): Makes voice closer to original
- **Style** (0-1): Adds expressiveness
- **Speaker Boost**: Enhances voice clarity

#### Models
- `eleven_turbo_v2_5`: Fast, multilingual (recommended)
- `eleven_multilingual_v2`: High quality, multilingual
- `eleven_turbo_v2`: Fast, English only

#### Usage Example

```typescript
import { generateAudio, ELEVENLABS_VOICES } from '@/lib/elevenLabsService';

const result = await generateAudio({
  text: 'Welcome to the Kobo NFT platform',
  voiceId: ELEVENLABS_VOICES[0].voice_id, // Aria
  modelId: 'eleven_turbo_v2_5',
  stability: 0.5,
  similarityBoost: 0.75,
});

// result contains: { url, blob, duration }
```

### Video Generation (Runway ML)

#### Available Models
- **Gen-4 Turbo**: Fast, balanced quality (5 credits/second)
- **Veo 3**: Highest quality (40 credits/second)
- **Gen-4 Aleph**: Creative, artistic (10 credits/second)

#### Video Options
- **Duration**: 5 or 10 seconds
- **Aspect Ratio**: 16:9 (landscape), 9:16 (portrait), 1:1 (square)
- **Resolution**: 720p or 1080p
- **Starting Image**: Optional image-to-video generation

#### Usage Example

```typescript
import { generateVideo, RUNWAY_MODELS } from '@/lib/runwayService';

const result = await generateVideo({
  prompt: 'A serene ocean sunset with gentle waves',
  imageUrl: 'https://images.pexels.com/photos/1139541/pexels-photo-1139541.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', // Optional
  model: RUNWAY_MODELS.GEN4_TURBO,
  duration: 5,
  ratio: '16:9',
  resolution: '720p',
});

// result contains: { taskId, status, url, blob, duration }
```

#### Cost Estimation

```typescript
import { estimateVideoCost } from '@/lib/runwayService';

const cost = estimateVideoCost({
  prompt: 'My video prompt',
  model: RUNWAY_MODELS.GEN4_TURBO,
  duration: 5,
});

console.log(`Estimated cost: $${cost.toFixed(2)}`);
// Gen-4 Turbo, 5 seconds = $0.25
```

### Image Generation (Hugging Face)

Existing image generation using Stable Diffusion remains unchanged:

```typescript
import { generateImage } from '@/lib/aiServices';

const result = await generateImage('A futuristic cyberpunk cityscape');
// result contains: { url, blob }
```

## UI Components

### AudioGenerator Component

Provides a complete audio generation interface with:
- Text input (up to 5000 characters)
- Voice selection dropdown
- Model selection
- Stability and similarity boost sliders
- Real-time waveform visualization
- Audio playback controls
- Download functionality

```tsx
import { AudioGenerator } from '@/components/AudioGenerator';

<AudioGenerator 
  onAudioGenerated={(result) => {
    console.log('Audio generated:', result);
  }}
/>
```

### VideoGenerator Component

Provides a complete video generation interface with:
- Prompt input (up to 500 characters)
- Optional starting image upload
- Model, duration, ratio, and resolution selection
- Cost estimation display
- Progress tracking during generation
- Video preview player
- Download functionality

```tsx
import { VideoGenerator } from '@/components/VideoGenerator';

<VideoGenerator 
  onVideoGenerated={(result) => {
    console.log('Video generated:', result);
  }}
  initialImageUrl="https://example.com/image.jpg" // Optional
/>
```

### ImageGenerator Component

Simplified image generation interface:
- Prompt input (up to 1000 characters)
- Generation progress indicator
- Image preview
- Download functionality

```tsx
import { ImageGenerator } from '@/components/ImageGenerator';

<ImageGenerator 
  onImageGenerated={(result, prompt) => {
    console.log('Image generated:', result, prompt);
  }}
/>
```

### AIGenerator (Unified Component)

The main AI Generator component now includes tabs for all three media types:

```tsx
import { AIGenerator } from '@/components/AIGenerator';

<AIGenerator 
  onGenerate={(type, content) => {
    console.log('Generated:', type, content);
  }}
/>
```

## IPFS Integration

Audio and video files are uploaded to IPFS using the enhanced `ipfsService`:

### Upload Audio/Video NFT

```typescript
import { ipfsService } from '@/lib/ipfsService';

const result = await ipfsService.uploadNFT(
  audioBlob, // or videoBlob
  {
    name: 'My Audio NFT',
    description: 'Generated with ElevenLabs',
    attributes: [
      { trait_type: 'Voice', value: 'Aria' },
      { trait_type: 'Duration', value: 10 },
    ],
    properties: {
      type: 'AUDIO', // or 'VIDEO'
      generationMethod: 'AI_GENERATED',
      creator: walletAddress,
    },
  },
  'my-audio.mp3', // filename
  (progress) => {
    console.log(`Upload progress: ${progress.progress}%`);
  }
);

// result contains: { mediaHash, metadataHash, metadataUrl }
```

### NFT Metadata Structure

For audio/video NFTs, the metadata follows this structure:

```json
{
  "name": "My Audio NFT",
  "description": "Generated with ElevenLabs",
  "image": "ipfs://placeholder-thumbnail-hash",
  "animation_url": "ipfs://audio-or-video-hash",
  "attributes": [
    { "trait_type": "Voice", "value": "Aria" },
    { "trait_type": "Duration", "value": 10 }
  ],
  "properties": {
    "type": "AUDIO",
    "generationMethod": "AI_GENERATED",
    "creator": "0x..."
  }
}
```

## Workflow Integration

### Create Page Flow

1. User selects media type (Image/Audio/Video)
2. User configures generation parameters
3. AI generates the media
4. User previews with playback controls
5. User can remake or confirm
6. Media is uploaded to IPFS
7. NFT is minted with metadata URI

### Example: Audio NFT Minting

```typescript
// 1. Generate audio
const audioResult = await generateAudio({
  text: 'Welcome to my NFT collection',
  voiceId: ELEVENLABS_VOICES[0].voice_id,
});

// 2. Upload to IPFS
const ipfsResult = await ipfsService.uploadNFT(
  audioResult.blob,
  {
    name: 'Welcome Message NFT',
    description: 'AI-generated welcome message',
    properties: {
      type: 'AUDIO',
      generationMethod: 'AI_GENERATED',
      creator: address,
    },
  },
  'welcome.mp3'
);

// 3. Mint NFT
await writeContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'mint',
  args: [
    address,
    ipfsResult.metadataUrl,
    NFTType.AUDIO,
    GenerationMethod.AI_GENERATED,
    auditHash,
  ],
});
```

## Fallback Behavior

When API keys are not configured, the components use placeholder generation:

### Audio Fallback
- Generates a simple sine wave tone
- Duration based on text length
- Allows testing without API key

### Video Fallback
- Generates a static placeholder image
- Shows "Video Generation Requires Runway ML API Key" message
- Allows UI testing without API key

### Image Fallback
- Uses placeholder image service
- Allows basic functionality testing

## Best Practices

### Audio Generation
1. Keep text under 5000 characters for optimal performance
2. Use Turbo v2.5 model for fastest generation
3. Adjust stability for consistent voice across multiple generations
4. Test different voices to find the best fit for your content

### Video Generation
1. Start with Gen-4 Turbo for cost-effective testing
2. Use image-to-video for more controlled results
3. Keep prompts clear and descriptive
4. Consider cost before generating long videos
5. Use 720p for testing, 1080p for final production

### IPFS Uploads
1. Always configure Pinata API keys for production
2. Use descriptive filenames for better organization
3. Include comprehensive metadata attributes
4. Store IPFS hashes for future reference

### Performance
1. Show progress indicators during generation
2. Allow users to cancel long-running operations
3. Cache generated content before IPFS upload
4. Provide download options for user backups

## Troubleshooting

### ElevenLabs Issues
- **Rate Limit**: Free tier has 10,000 characters/month limit
- **Voice Not Found**: Ensure voice ID is from ELEVENLABS_VOICES array
- **Audio Quality**: Increase similarity_boost for better quality

### Runway ML Issues
- **Timeout**: Video generation can take 2-5 minutes
- **Cost Concerns**: Use estimateVideoCost before generation
- **Failed Generation**: Check prompt for restricted content

### IPFS Issues
- **Upload Failed**: Verify Pinata API keys are correct
- **Slow Upload**: Large video files may take time
- **Gateway Access**: Use Pinata gateway for reliable access

## API Rate Limits

### ElevenLabs
- Free: 10,000 characters/month
- Starter: 30,000 characters/month ($5)
- Creator: 100,000 characters/month ($22)

### Runway ML
- Pay-as-you-go: $0.01 per credit
- Gen-4 Turbo: 5 credits/second
- Veo 3: 40 credits/second
- Gen-4 Aleph: 10 credits/second

### Pinata IPFS
- Free: 1GB storage, 100GB bandwidth/month
- Picnic: $20/month for 100GB storage

## Future Enhancements

- [ ] Background music generation for videos
- [ ] Voice cloning for personalized audio
- [ ] Multi-language support for audio
- [ ] Video editing and trimming
- [ ] Batch generation for collections
- [ ] Custom voice training
- [ ] Advanced video effects and transitions

## Support

For issues or questions:
- ElevenLabs: https://help.elevenlabs.io
- Runway ML: https://help.runwayml.com
- Pinata: https://docs.pinata.cloud

## License

This integration is part of the Kobo NFT platform and follows the same license terms.
