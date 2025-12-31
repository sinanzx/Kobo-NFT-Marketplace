# AI APIs Research Report: Image, Video, and Music Generation

**Research Date:** November 2025  
**Purpose:** Comprehensive analysis of AI generation APIs for integration capabilities, free tier availability, authentication methods, and alternatives.

---

## Table of Contents

1. [Image Generation APIs](#image-generation-apis)
   - [Playground AI](#1-playground-ai)
   - [Leonardo AI](#2-leonardo-ai)
   - [Alternative Image APIs](#alternative-image-generation-apis)
2. [Video Generation APIs](#video-generation-apis)
   - [Runway ML](#3-runway-ml)
   - [Pika Labs](#4-pika-labs)
   - [Alternative Video APIs](#alternative-video-generation-apis)
3. [Music Generation APIs](#music-generation-apis)
   - [Suno AI](#5-suno-ai)
   - [Beatoven AI](#6-beatoven-ai)
   - [AIVA](#7-aiva)
   - [Alternative Music APIs](#alternative-music-generation-apis)
4. [Implementation Examples](#implementation-examples)
5. [Recommendations](#recommendations)

---

## Image Generation APIs

### 1. Playground AI

#### Overview
Playground AI is a popular image generation platform, but **does not offer public API access** for general users.

#### Free Tier & API Access
- **API Availability:** ❌ No public API
- **Partner Access Only:** API access is restricted to select partners generating 1M+ images/month
- **Application Required:** Must apply via Playground AI's partner form

#### Web Platform Free Tier (Non-API)
- **Image Edits:** 10 edits every 3 hours (Playground v3)
- **OpenAI 4o Model:** 3 edits per month
- **Downloads:** 10 design downloads per day
- **Limitations:** Background removal and upscaling reserved for Pro users

#### Authentication
Not publicly documented (partner-only access)

#### Recommendation
**Not suitable for API integration.** Consider alternatives like Leonardo AI, Replicate, or Cloudflare Workers AI.

---

### 2. Leonardo AI

#### Overview
Leonardo AI provides a production-ready API for image and video generation with multiple AI models including Lucid Origin, Phoenix, FLUX, and PhotoReal.

#### Free Tier & API Access
- **API Availability:** ✅ Yes, but requires paid subscription
- **Free Web Tier:** Does NOT include API access
- **API Plans:** Basic, Standard, Pro, or Custom
- **Minimum Cost:** Requires API plan subscription (separate from web app plans)

#### Authentication
- **Method:** Bearer Token (API Key)
- **Header Format:** `Authorization: Bearer YOUR_API_KEY`
- **Key Generation:** Via Leonardo.ai web app → API Access → Create New Key
- **Security:** API key shown only once; store securely

#### API Endpoint Structure
```
Base URL: https://cloud.leonardo.ai/api/rest/v1/
```

**Key Endpoints:**
- `POST /generations` - Generate images
- `GET /generations/{id}` - Get generation status
- `POST /generations-texture` - Generate textures
- `POST /variations-upscale` - Upscale images
- `POST /prompt/improve` - Enhance prompts

#### Request/Response Format

**Generate Image Request:**
```bash
curl -X POST https://cloud.leonardo.ai/api/rest/v1/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene Japanese garden with cherry blossoms",
    "modelId": "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3",
    "width": 1024,
    "height": 1024,
    "num_images": 4,
    "negative_prompt": "blurry, low quality",
    "guidance_scale": 7,
    "sd_version": "PHOENIX"
  }'
```

**Response:**
```json
{
  "sdGenerationJob": {
    "generationId": "abc123-def456-ghi789",
    "apiCreditCost": 8
  }
}
```

#### Generation Parameters
- **prompt** (required): Text description of desired image
- **modelId**: Specific model to use
- **width/height**: Image dimensions (512-1024px typical)
- **num_images**: Number of variations (1-8)
- **negative_prompt**: Elements to avoid
- **guidance_scale**: Prompt adherence (1-20, default 7)
- **seed**: Reproducibility control
- **photoReal**: Enable PhotoReal mode
- **alchemy**: Enable Alchemy enhancement

#### Output Formats
- **Delivery:** URLs to generated images
- **Format:** PNG, JPEG
- **Access:** Temporary URLs (download within timeframe)

#### Rate Limits
- Varies by subscription plan
- Concurrency limits apply
- Queue-based processing for high loads

#### Code Example (Node.js)
```javascript
const axios = require('axios');

async function generateImage(prompt) {
  const response = await axios.post(
    'https://cloud.leonardo.ai/api/rest/v1/generations',
    {
      prompt: prompt,
      modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3',
      width: 1024,
      height: 1024,
      num_images: 1
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const generationId = response.data.sdGenerationJob.generationId;
  
  // Poll for completion
  let result;
  do {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const statusResponse = await axios.get(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`
        }
      }
    );
    result = statusResponse.data;
  } while (result.generations_by_pk.status !== 'COMPLETE');
  
  return result.generations_by_pk.generated_images;
}
```

#### Code Example (Python)
```python
import requests
import time
import os

def generate_image(prompt):
    api_key = os.environ.get('LEONARDO_API_KEY')
    
    # Start generation
    response = requests.post(
        'https://cloud.leonardo.ai/api/rest/v1/generations',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'prompt': prompt,
            'modelId': '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3',
            'width': 1024,
            'height': 1024,
            'num_images': 1
        }
    )
    
    generation_id = response.json()['sdGenerationJob']['generationId']
    
    # Poll for completion
    while True:
        time.sleep(3)
        status_response = requests.get(
            f'https://cloud.leonardo.ai/api/rest/v1/generations/{generation_id}',
            headers={'Authorization': f'Bearer {api_key}'}
        )
        
        result = status_response.json()
        if result['generations_by_pk']['status'] == 'COMPLETE':
            return result['generations_by_pk']['generated_images']
```

---

### Alternative Image Generation APIs

#### 1. **Cloudflare Workers AI** (Recommended Free Option)
- **Free Tier:** ~10,000 neurons/day (~10-20 images)
- **Model:** Stable Diffusion XL
- **Quality:** High, no watermark
- **Setup:** Free Cloudflare account, no credit card
- **Best For:** Daily image generation needs

```javascript
// Cloudflare Workers AI Example
export default {
  async fetch(request, env) {
    const response = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
      prompt: "A serene Japanese garden with cherry blossoms"
    });
    
    return new Response(response, {
      headers: { 'content-type': 'image/png' }
    });
  }
};
```

#### 2. **Replicate**
- **Free Tier:** $10 initial credits for new users
- **Pricing:** ~$0.0039 per run (256 runs per $1)
- **Models:** Stable Diffusion, FLUX, SDXL, custom models
- **API:** RESTful with SDKs

```python
import replicate

output = replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    input={"prompt": "A serene Japanese garden with cherry blossoms"}
)
print(output)
```

#### 3. **Hugging Face Inference API**
- **Free Tier:** $0.10/month credits (~80 images)
- **PRO Tier:** $9/month with $2 credits + PAYG
- **Models:** FLUX, Stable Diffusion, custom models
- **Note:** Free tier heavily limited as of 2025

```python
import requests

API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"
headers = {"Authorization": f"Bearer {API_TOKEN}"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.content

image_bytes = query({
    "inputs": "A serene Japanese garden with cherry blossoms",
})
```

#### 4. **Puter.js** (Client-Side Free)
- **Free Tier:** Unlimited, no API key required
- **Type:** Client-side JavaScript
- **Models:** SD3 Medium, SDXL
- **Best For:** Browser-based applications

```html
<script src="https://js.puter.com/v2/"></script>
<script>
  puter.ai.txt2img(
    "A serene Japanese garden with cherry blossoms",
    {
      model: "stabilityai/stable-diffusion-3-medium",
      seed: 42
    }
  ).then(imageElement => {
    document.body.appendChild(imageElement);
  });
</script>
```

#### 5. **AI Horde** (Community-Powered)
- **Free Tier:** Completely free, anonymous
- **Type:** Decentralized, queue-based
- **Speed:** Slower (community contributions)
- **API Key:** Use `0000000000` for anonymous access

---

## Video Generation APIs

### 3. Runway ML

#### Overview
Runway ML provides cutting-edge video generation through Gen-4 Turbo and Gen-4 Aleph models via a developer API.

#### Free Tier & API Access
- **API Availability:** ✅ Yes, but requires credits
- **Free Tier:** ❌ No free tier
- **Minimum Purchase:** $10 (1,000 credits at $0.01/credit)
- **No Trial:** Must purchase credits to use API

#### Authentication
- **Method:** Bearer Token (API Key)
- **Header Format:** `Authorization: Bearer YOUR_API_KEY`
- **Environment Variable:** `RUNWAYML_API_SECRET`
- **Key Generation:** Via developer portal → API Keys

#### API Endpoint Structure
```
Base URL: https://api.dev.runwayml.com/v1/
Documentation: https://docs.dev.runwayml.com/
```

#### Pricing (Credits per Second)
- **Gen-4 Turbo:** 5 credits/second
- **Gen-4 Aleph:** 15 credits/second
- **Upscale to 4K:** 2 credits/second

**Example Costs:**
- 5-second Gen-4 Turbo video: 25 credits ($0.25)
- 10-second Gen-4 Aleph video: 150 credits ($1.50)

#### Usage Tiers & Limits
- **Tier 1:** 50 generations/day, $100/month max spend
- **Higher Tiers:** Unlock more concurrency and daily limits
- **Throttling:** Excess tasks queued
- **Rate Limit Error:** 429 Too Many Requests

#### Request/Response Format

**Generate Video Request:**
```bash
curl -X POST https://api.dev.runwayml.com/v1/tasks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "gen4",
    "internal": false,
    "options": {
      "name": "My Video",
      "seconds": 5,
      "text_prompt": "A serene Japanese garden with cherry blossoms swaying in the wind",
      "init_image": "https://example.com/image.jpg",
      "resolution": "720p"
    }
  }'
```

**Response:**
```json
{
  "id": "task_abc123",
  "status": "PENDING",
  "createdAt": "2025-11-23T10:00:00Z"
}
```

#### Generation Parameters
- **text_prompt**: Description of desired video
- **init_image**: Starting image URL (optional)
- **seconds**: Video duration (5-10s)
- **resolution**: 720p or 1080p
- **seed**: Reproducibility control
- **motion_amount**: Camera/subject motion intensity

#### Output Formats
- **Format:** MP4
- **Resolution:** 720p, 1080p, 4K (with upscale)
- **Delivery:** URL to video file

#### Code Example (Node.js)
```javascript
const RunwayML = require('@runwayml/sdk');

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET
});

async function generateVideo(prompt) {
  const task = await client.tasks.create({
    taskType: 'gen4',
    options: {
      name: 'My Video',
      seconds: 5,
      text_prompt: prompt,
      resolution: '720p'
    }
  });
  
  // Poll for completion
  let result;
  do {
    await new Promise(resolve => setTimeout(resolve, 5000));
    result = await client.tasks.retrieve(task.id);
  } while (result.status === 'PENDING' || result.status === 'RUNNING');
  
  if (result.status === 'SUCCEEDED') {
    return result.output.url;
  } else {
    throw new Error(`Task failed: ${result.failure}`);
  }
}
```

#### Code Example (Python)
```python
import os
import time
from runwayml import RunwayML

client = RunwayML(api_key=os.environ.get("RUNWAYML_API_SECRET"))

def generate_video(prompt):
    task = client.tasks.create(
        task_type="gen4",
        options={
            "name": "My Video",
            "seconds": 5,
            "text_prompt": prompt,
            "resolution": "720p"
        }
    )
    
    # Poll for completion
    while True:
        time.sleep(5)
        result = client.tasks.retrieve(task.id)
        
        if result.status == "SUCCEEDED":
            return result.output.url
        elif result.status == "FAILED":
            raise Exception(f"Task failed: {result.failure}")
```

---

### 4. Pika Labs

#### Overview
Pika Labs (Pika.art) offers AI video generation with Pika 1.0, 1.5, and 2.0 models, but API access is restricted.

#### Free Tier & API Access
- **API Availability:** ⚠️ Partner/Enterprise Only
- **Free Web Tier:** 50-80 credits/month (web platform only)
- **API Access:** Must contact partnerships@pika.art
- **Plans:** Pro or Enterprise required for API

#### Web Platform Free Tier (Non-API)
- **Credits:** 50-80 credits per month
- **Resolution:** 720p with watermark
- **Features:** Basic text-to-video, image-to-video
- **Limitations:** Watermarked output, basic features only

#### Authentication (API - Partner Access)
- **Method:** Bearer Token
- **Header Format:** `Authorization: Bearer YOUR_TOKEN`
- **Access:** Granted after partnership approval

#### API Endpoint Structure (Partner Access)
```
Base URL: https://api.pikapikapika.io/v1/
```

#### Pricing (API - Pay-as-you-go)
- **Pika 1.0:** $0.05 USD per second
- **Pika 1.5:** $0.07 USD per second
- **Pika 2.0 (basic):** $0.11 USD per second
- **Pika 2.0 (Scene Ingredients):** $0.156 USD per second

**Example Costs:**
- 5-second Pika 1.5 video: $0.35
- 10-second Pika 2.0 video: $1.10

#### Rate Limits (API)
- **Generation Limit:** 20 videos per minute
- **Resolution:** 720p MP4
- **Support:** Dedicated support channel for partners

#### Request Format (API - Partner Access)
```bash
curl -X POST https://api.pikapikapika.io/v1/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json" \
  -d '{
    "prompt": "A serene Japanese garden with cherry blossoms",
    "model": "pika-2.0",
    "duration": 5,
    "aspect_ratio": "16:9"
  }'
```

#### Features NOT Available via API
- Pikaffects
- Lip sync
- Sound effects
- Expand canvas (limited partners only)
- Modify region (limited partners only)

#### Recommendation
**Not suitable for general API integration.** Free tier is web-only. API requires partnership. Consider Runway ML or alternative video APIs.

---

### Alternative Video Generation APIs

#### 1. **Luma AI Dream Machine** (Freemium)
- **Free Tier:** Limited free generations
- **Model:** Ray2 engine
- **Duration:** 5-10 seconds
- **Quality:** Realistic, high-quality
- **Best For:** Quick video prototypes

#### 2. **Open-Sora 2.0** (Open Source)
- **Free Tier:** ✅ Fully open-source
- **License:** Apache 2.0
- **Parameters:** 11B
- **Features:** Text-to-video, image-to-video
- **Best For:** Self-hosting, customization

#### 3. **Hunyuan Video** (Tencent - Open Source)
- **Free Tier:** ✅ Open-source
- **Release:** December 2024
- **Features:** Text-to-video, image-to-video, avatar dialogue
- **Quality:** High visual fidelity
- **Best For:** Advanced video generation

#### 4. **Alibaba Wan 2.1** (Open Source - Coming Soon)
- **Free Tier:** ✅ Open-source (planned release)
- **Quality:** VBench leaderboard topper
- **Features:** Text-to-video, image-to-video
- **Best For:** Research, high-quality generation

#### 5. **Kaiber AI** (Freemium)
- **Free Tier:** Limited free access
- **Style:** Music video, artistic motion graphics
- **Input:** Text, image, or audio prompts
- **Best For:** Stylized, artistic videos

---

## Music Generation APIs

### 5. Suno AI

#### Overview
Suno AI provides comprehensive music generation API with v4.5-All model (upgraded from v3.5 in free tier as of October 2025).

#### Free Tier & API Access
- **API Availability:** ✅ Yes
- **Free Tier:** ✅ Available for testing/prototyping
- **Model:** v4.5-All (free tier), v5 (paid)
- **Features:** Music generation, lyrics, audio processing, video creation

#### Authentication
- **Method:** Bearer Token
- **Header Format:** `Authorization: Bearer YOUR_API_KEY`
- **Key Source:** API Key Management Page (after signup)

#### API Endpoint Structure
```
Base URL: https://api.sunoapi.org
Documentation: https://docs.sunoapi.org
```

**Key Endpoints:**
- `POST /generate` - Generate music
- `POST /extend` - Extend music tracks
- `POST /lyrics` - Generate lyrics
- `POST /cover` - Generate music covers
- `POST /separate` - Vocal/instrument separation
- `POST /video` - Create music videos
- `GET /credits` - Check remaining credits

#### Request/Response Format

**Generate Music Request (Non-Custom Mode):**
```bash
curl -X POST https://api.sunoapi.org/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "upbeat electronic dance music with energetic beats",
    "customMode": false
  }'
```

**Generate Music Request (Custom Mode):**
```bash
curl -X POST https://api.sunoapi.org/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene ambient track with piano and strings",
    "customMode": true,
    "style": "ambient, classical",
    "title": "Garden Meditation",
    "vocalGender": "female",
    "personaId": "persona_123"
  }'
```

**Response:**
```json
{
  "id": "song_abc123",
  "status": "processing",
  "songs": [
    {
      "id": "track_1",
      "url": "https://cdn.sunoapi.org/...",
      "streamUrl": "https://stream.sunoapi.org/..."
    },
    {
      "id": "track_2",
      "url": "https://cdn.sunoapi.org/...",
      "streamUrl": "https://stream.sunoapi.org/..."
    }
  ]
}
```

#### Generation Parameters

**Non-Custom Mode:**
- **prompt** (required): Description (max 500 chars)
- **customMode**: false

**Custom Mode:**
- **prompt** (required): Description
- **customMode**: true
- **style**: Genre/style tags
- **title**: Song title
- **personaId**: Voice persona
- **vocalGender**: "male", "female", "neutral"
- **instrumental**: true/false
- **weights**: Style emphasis

#### Output Formats
- **Format:** MP3, WAV (paid tier)
- **Delivery:** URL (streamable in ~30-40s, full download in 2-3min)
- **Retention:** 15 days (download before deletion)
- **Outputs:** 2 songs per request

#### Rate Limits
- **Concurrency:** ~20 requests per 10 seconds
- **Free Tier:** Limited generations
- **Paid Tier:** Higher concurrency, WAV format, commercial licensing

#### Code Example (Node.js)
```javascript
const axios = require('axios');

async function generateMusic(prompt, customOptions = null) {
  const payload = customOptions ? {
    prompt,
    customMode: true,
    ...customOptions
  } : {
    prompt,
    customMode: false
  };
  
  const response = await axios.post(
    'https://api.sunoapi.org/generate',
    payload,
    {
      headers: {
        'Authorization': `Bearer ${process.env.SUNO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const generationId = response.data.id;
  
  // Poll for completion
  let result;
  do {
    await new Promise(resolve => setTimeout(resolve, 5000));
    const statusResponse = await axios.get(
      `https://api.sunoapi.org/status/${generationId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUNO_API_KEY}`
        }
      }
    );
    result = statusResponse.data;
  } while (result.status === 'processing');
  
  return result.songs;
}

// Usage
generateMusic("upbeat electronic dance music").then(songs => {
  console.log('Generated songs:', songs);
});

// Custom mode
generateMusic("A serene ambient track", {
  style: "ambient, classical",
  title: "Garden Meditation",
  vocalGender: "female"
}).then(songs => {
  console.log('Generated songs:', songs);
});
```

#### Code Example (Python)
```python
import requests
import time
import os

def generate_music(prompt, custom_options=None):
    api_key = os.environ.get('SUNO_API_KEY')
    
    payload = {
        'prompt': prompt,
        'customMode': bool(custom_options)
    }
    
    if custom_options:
        payload.update(custom_options)
    
    # Start generation
    response = requests.post(
        'https://api.sunoapi.org/generate',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json=payload
    )
    
    generation_id = response.json()['id']
    
    # Poll for completion
    while True:
        time.sleep(5)
        status_response = requests.get(
            f'https://api.sunoapi.org/status/{generation_id}',
            headers={'Authorization': f'Bearer {api_key}'}
        )
        
        result = status_response.json()
        if result['status'] != 'processing':
            return result['songs']

# Usage
songs = generate_music("upbeat electronic dance music")
print(songs)

# Custom mode
songs = generate_music("A serene ambient track", {
    'style': 'ambient, classical',
    'title': 'Garden Meditation',
    'vocalGender': 'female'
})
print(songs)
```

---

### 6. Beatoven AI

#### Overview
Beatoven.ai provides AI music generation API with customization by genre, style, mood, and emotional tone.

#### Free Tier & API Access
- **API Availability:** ✅ Yes
- **Free Tier:** 50 free credits upon token creation
- **Access:** Via account dashboard → API → New Token

#### Authentication
- **Method:** API Key
- **Key Generation:** Profile → API → Create New Token
- **SDK:** Python SDK available (requires key request)

#### API Endpoint Structure
```
Base URL: Available after API key generation
Documentation: Accessible via dashboard after authentication
```

#### Free Tier Details
- **Initial Credits:** 50 credits
- **Access:** Create token in dashboard
- **SDK Support:** Python (contact hello@beatoven.ai for access)

#### Request Format
Documentation available after API key generation. General structure:

```bash
curl -X POST https://api.beatoven.ai/v1/generate \
  -H "Authorization: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "genre": "ambient",
    "mood": "calm",
    "duration": 60,
    "tempo": "slow"
  }'
```

#### Generation Parameters (Typical)
- **genre**: Music genre
- **mood**: Emotional tone
- **duration**: Track length (seconds)
- **tempo**: Speed (slow, medium, fast)
- **style**: Additional style tags

#### Code Example (Python SDK)
```python
# Note: SDK access requires contacting hello@beatoven.ai
from beatoven import BeatovenClient

client = BeatovenClient(api_key='YOUR_API_KEY')

track = client.generate(
    genre='ambient',
    mood='calm',
    duration=60,
    tempo='slow'
)

print(f"Track URL: {track.url}")
```

#### Recommendation
**Limited public documentation.** 50 free credits for testing. For production use, contact hello@beatoven.ai for SDK access and detailed API documentation.

---

### 7. AIVA

#### Overview
AIVA (Artificial Intelligence Virtual Artist) is an AI music composition platform, but **does not offer public API access** on free tier.

#### Free Tier & API Access
- **API Availability:** ⚠️ Pro/Enterprise Only
- **Free Tier:** Web-based UI only (no API)
- **API Access:** Mentioned under Pro plan only

#### Web Platform Free Tier (Non-API)
- **Downloads:** 3 per month
- **Duration:** Up to 3 minutes per track
- **Formats:** MP3, MIDI
- **Usage:** Non-commercial only
- **Attribution:** Required

#### Authentication
Not publicly documented (Pro/Enterprise only)

#### Recommendation
**Not suitable for API integration on free tier.** Free tier is web-only with strict limitations. For API access, contact AIVA for Pro or Enterprise plans. Consider alternatives like Suno AI or open-source options.

---

### Alternative Music Generation APIs

#### 1. **Meta MusicGen** (Open Source - Recommended)
- **Free Tier:** ✅ Fully open-source
- **License:** Apache 2.0
- **Quality:** High-quality text-to-music
- **Restrictions:** None
- **Best For:** Unrestricted use, self-hosting

```python
from audiocraft.models import MusicGen
import torchaudio

model = MusicGen.get_pretrained('facebook/musicgen-medium')
model.set_generation_params(duration=10)

descriptions = ['upbeat electronic dance music with energetic beats']
wav = model.generate(descriptions)

for idx, one_wav in enumerate(wav):
    torchaudio.save(f'generated_{idx}.wav', one_wav.cpu(), model.sample_rate)
```

#### 2. **Udio** (Freemium)
- **Free Tier:** ~600 songs/month (as of April 2024)
- **Features:** Vocal + instrumental, remix, audio inpainting
- **Quality:** High-quality generation
- **Best For:** Song creation with vocals

#### 3. **Mubert API**
- **Free Tier:** Limited tracks/month with watermarks
- **Type:** Real-time generative streams
- **Best For:** Background music, ambient loops
- **Paid Plans:** Remove watermarks, commercial use

#### 4. **Soundful**
- **Free Tier:** Unlimited previews, limited downloads
- **Genres:** EDM, hip-hop, lo-fi
- **Best For:** Beat/loop generation
- **Downloads:** Limited per month on free tier

#### 5. **Riffusion** (Open Source)
- **Free Tier:** ✅ MIT License
- **Method:** Spectrogram-based generation
- **Type:** Experimental, creative
- **Best For:** Sound design, experimental music

```python
import requests

API_URL = "https://api-inference.huggingface.co/models/riffusion/riffusion-model-v1"
headers = {"Authorization": f"Bearer {API_TOKEN}"}

def generate_audio(prompt):
    response = requests.post(API_URL, headers=headers, json={"inputs": prompt})
    return response.content

audio = generate_audio("upbeat electronic dance music")
```

---

## Implementation Examples

### Multi-API Integration Strategy

```javascript
// api-manager.js
class AIGenerationManager {
  constructor(config) {
    this.imageAPI = config.imageAPI || 'cloudflare'; // cloudflare, leonardo, replicate
    this.videoAPI = config.videoAPI || 'runway'; // runway, luma
    this.musicAPI = config.musicAPI || 'suno'; // suno, musicgen
    this.apiKeys = config.apiKeys;
  }
  
  async generateImage(prompt, options = {}) {
    switch(this.imageAPI) {
      case 'leonardo':
        return this.leonardoGenerate(prompt, options);
      case 'cloudflare':
        return this.cloudflareGenerate(prompt, options);
      case 'replicate':
        return this.replicateGenerate(prompt, options);
      default:
        throw new Error('Unsupported image API');
    }
  }
  
  async generateVideo(prompt, options = {}) {
    switch(this.videoAPI) {
      case 'runway':
        return this.runwayGenerate(prompt, options);
      default:
        throw new Error('Unsupported video API');
    }
  }
  
  async generateMusic(prompt, options = {}) {
    switch(this.musicAPI) {
      case 'suno':
        return this.sunoGenerate(prompt, options);
      default:
        throw new Error('Unsupported music API');
    }
  }
  
  // Implementation methods...
  async leonardoGenerate(prompt, options) {
    const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.leonardo}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        modelId: options.modelId || '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3',
        width: options.width || 1024,
        height: options.height || 1024,
        num_images: options.num_images || 1
      })
    });
    
    const data = await response.json();
    return this.pollLeonardo(data.sdGenerationJob.generationId);
  }
  
  async pollLeonardo(generationId) {
    while(true) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await fetch(
        `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.leonardo}`
          }
        }
      );
      
      const result = await response.json();
      if(result.generations_by_pk.status === 'COMPLETE') {
        return result.generations_by_pk.generated_images;
      }
    }
  }
  
  async cloudflareGenerate(prompt, options) {
    // Cloudflare Workers AI implementation
    const response = await fetch('https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.cloudflare}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });
    
    return response.blob();
  }
  
  async runwayGenerate(prompt, options) {
    const response = await fetch('https://api.dev.runwayml.com/v1/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.runway}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taskType: 'gen4',
        options: {
          name: options.name || 'Generated Video',
          seconds: options.duration || 5,
          text_prompt: prompt,
          resolution: options.resolution || '720p'
        }
      })
    });
    
    const task = await response.json();
    return this.pollRunway(task.id);
  }
  
  async pollRunway(taskId) {
    while(true) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const response = await fetch(
        `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.runway}`
          }
        }
      );
      
      const result = await response.json();
      if(result.status === 'SUCCEEDED') {
        return result.output.url;
      } else if(result.status === 'FAILED') {
        throw new Error(`Task failed: ${result.failure}`);
      }
    }
  }
  
  async sunoGenerate(prompt, options) {
    const payload = options.customMode ? {
      prompt,
      customMode: true,
      style: options.style,
      title: options.title,
      vocalGender: options.vocalGender
    } : {
      prompt,
      customMode: false
    };
    
    const response = await fetch('https://api.sunoapi.org/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.suno}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    return this.pollSuno(data.id);
  }
  
  async pollSuno(generationId) {
    while(true) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const response = await fetch(
        `https://api.sunoapi.org/status/${generationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.suno}`
          }
        }
      );
      
      const result = await response.json();
      if(result.status !== 'processing') {
        return result.songs;
      }
    }
  }
}

// Usage
const manager = new AIGenerationManager({
  imageAPI: 'cloudflare',
  videoAPI: 'runway',
  musicAPI: 'suno',
  apiKeys: {
    leonardo: process.env.LEONARDO_API_KEY,
    cloudflare: process.env.CLOUDFLARE_API_KEY,
    runway: process.env.RUNWAYML_API_SECRET,
    suno: process.env.SUNO_API_KEY
  }
});

// Generate content
const images = await manager.generateImage("A serene Japanese garden");
const video = await manager.generateVideo("Cherry blossoms swaying in wind");
const music = await manager.generateMusic("Calm ambient music");
```

---

## Recommendations

### For Image Generation

**Best Free Option:**
- **Cloudflare Workers AI** - 10-20 images/day, high quality, no watermark

**Best Paid Option:**
- **Leonardo AI** - Professional features, multiple models, good documentation

**Best Open Source:**
- **Stable Diffusion (self-hosted)** - Unlimited, full control

**Quick Start:**
- **Puter.js** - Client-side, no backend needed

### For Video Generation

**Best Paid Option:**
- **Runway ML** - Cutting-edge Gen-4 models, professional quality

**Best Open Source:**
- **Open-Sora 2.0** or **Hunyuan Video** - Self-hosting, customization

**Not Recommended:**
- **Pika Labs** - API requires partnership, not accessible for general use

### For Music Generation

**Best Free API:**
- **Suno AI** - Free tier available, comprehensive features

**Best Open Source:**
- **Meta MusicGen** - Apache 2.0, high quality, unrestricted

**Best for Testing:**
- **Beatoven AI** - 50 free credits to start

**Not Recommended for API:**
- **AIVA** - No free API access, web-only on free tier

### Cost Optimization Strategy

1. **Development/Testing:**
   - Use free tiers: Cloudflare (images), Suno (music)
   - Self-host open-source: MusicGen, Stable Diffusion

2. **Production (Low Volume):**
   - Cloudflare Workers AI (images)
   - Runway ML (video) - pay per use
   - Suno AI (music)

3. **Production (High Volume):**
   - Leonardo AI (images) - API plan
   - Runway ML (video) - higher tier
   - Self-hosted MusicGen (music)

4. **Budget-Conscious:**
   - Replicate (images) - $0.0039/run
   - Open-source self-hosting (all categories)
   - Suno AI free tier (music)

### Integration Checklist

- [ ] Evaluate free tier limits vs. requirements
- [ ] Test API response times and quality
- [ ] Implement polling/webhook for async operations
- [ ] Set up error handling and retries
- [ ] Monitor API costs and usage
- [ ] Implement rate limiting on client side
- [ ] Cache generated content when possible
- [ ] Plan for API key rotation and security
- [ ] Document API version dependencies
- [ ] Set up monitoring and alerting

---

## Sources

### Image Generation
- [Playground AI Help Center](https://help.playgroundai.com/)
- [Leonardo AI Documentation](https://docs.leonardo.ai/)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Replicate Documentation](https://replicate.com/docs)
- [Hugging Face Inference API](https://huggingface.co/docs/api-inference/)
- [Puter.js Documentation](https://developer.puter.com/)

### Video Generation
- [Runway ML API Documentation](https://docs.dev.runwayml.com/)
- [Pika Labs API](https://early-access.pika.art/api)
- [Open-Sora GitHub](https://github.com/hpcaitech/Open-Sora)
- [Hunyuan Video](https://github.com/Tencent/HunyuanVideo)

### Music Generation
- [Suno API Documentation](https://docs.sunoapi.org/)
- [Beatoven AI Help](https://intercom.help/beatovenai-89c661a9bfa7/)
- [Meta MusicGen](https://github.com/facebookresearch/audiocraft)
- [Udio](https://www.udio.com/)

---

**Last Updated:** November 23, 2025  
**Next Review:** Quarterly (APIs change frequently)
