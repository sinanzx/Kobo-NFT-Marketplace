# Research Report: Runway ML API Integration

## Overview

This document provides comprehensive research on integrating Runway ML's API for video generation capabilities, specifically focusing on text-to-video and image-to-video generation. Runway ML offers powerful generative AI models through their developer API, enabling applications to create high-quality video content programmatically.

**Research Date:** 2025  
**API Documentation:** https://docs.dev.runwayml.com  
**Developer Portal:** https://app.runwayml.com

---

## Key Findings

### 1. API Endpoints and Models

Runway ML provides several video generation models accessible via their API:

#### Available Video Generation Models

| Model | Type | Input | Credits/Second | Use Case |
|-------|------|-------|----------------|----------|
| `gen4_turbo` | Image → Video | Image + Text | 5 | Fast image-to-video generation |
| `gen4_aleph` | Video Enhancement | Video + Text/Image | 15 | Advanced video modifications |
| `gen3a_turbo` | Video Generation | Various | 5 | General video generation |
| `act_two` | Video Animation | Image or Video | 5 | Character animation |
| `veo3` / `veo3.1` | Text/Image → Video | Text or Image | 40 | High-quality text-to-video |
| `veo3.1_fast` | Text/Image → Video | Text or Image | 20 | Faster text-to-video |

#### Primary API Endpoints

**Image-to-Video Generation:**
```
POST https://api.dev.runwayml.com/v1/image_to_video
```

**Text-to-Image Generation (for video workflows):**
```
POST https://api.dev.runwayml.com/v1/text_to_image
```

**Task Status Polling:**
```
GET https://api.dev.runwayml.com/v1/tasks/{taskId}
```

### 2. Authentication and API Key Requirements

**Authentication Method:** Bearer Token

**Setup Steps:**
1. Create a Runway Developer account at https://app.runwayml.com
2. Navigate to account settings or developer section
3. Generate an API key
4. Store securely in environment variables

**Authentication Header:**
```
Authorization: Bearer YOUR_API_KEY
X-Runway-Version: 2024-11-06
```

**Security Best Practices:**
- Never expose API keys in client-side code
- Use environment variables: `RUNWAYML_API_SECRET`
- Implement backend proxy for API calls from React applications
- Rotate keys periodically

### 3. Video Generation Parameters

#### Resolution Options

**Gen-4 Models (Standard):**
- Fixed at **720p** output
- Frame rate: **24 fps** (fixed)

**Supported Aspect Ratios:**
- 16:9 – 1280×720 pixels
- 9:16 – 720×1280 pixels (vertical)
- 1:1 – 960×960 pixels (square)
- 4:3 – 1104×832 pixels
- 3:4 – 832×1104 pixels
- 21:9 – 1584×672 pixels (ultrawide)

**Alternative (KIE API wrapper):**
- 720p or 1080p available
- **Constraint:** 1080p limited to 5-second videos only
- 10-second videos restricted to 720p

#### Duration Options

- **5 seconds** (all models, all resolutions)
- **10 seconds** (720p only for most models)

#### Common Parameters

```javascript
{
  model: 'gen4_turbo',           // Model selection
  promptImage: 'https://...',     // Image URL or base64 data URI
  promptText: 'Description...',   // Text prompt
  ratio: '1280:720',              // Aspect ratio
  duration: 5,                    // Duration in seconds (5 or 10)
  referenceImages: [...]          // Optional reference images with tags
}
```

### 4. Response Format and Video URL Retrieval

#### Asynchronous Task Workflow

Runway ML uses an asynchronous task-based system:

1. **Submit Request** → Receive Task ID
2. **Poll Task Status** → Check completion
3. **Retrieve Output** → Get video URL

#### Response Formats

**Initial Task Creation Response:**
```json
{
  "id": "task_abc12345",
  "status": "PENDING",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**Polling Response (In Progress):**
```json
{
  "id": "task_abc12345",
  "status": "RUNNING",
  "progress": 45
}
```

**Success Response:**
```json
{
  "id": "task_abc12345",
  "status": "SUCCEEDED",
  "output": [
    "https://storage.googleapis.com/runway/output/video.mp4"
  ],
  "artifacts": [
    {
      "url": "https://storage.googleapis.com/runway/output/video.mp4",
      "type": "video/mp4"
    }
  ]
}
```

**Failure Response:**
```json
{
  "id": "task_abc12345",
  "status": "FAILED",
  "failure": "Content moderation triggered",
  "failureCode": "001"
}
```

#### Task Status Values

- `PENDING` - Task queued
- `THROTTLED` - Waiting due to concurrency limits
- `RUNNING` - Generation in progress
- `SUCCEEDED` - Completed successfully
- `FAILED` - Generation failed

### 5. Pricing and Rate Limits

#### Credit System

- **Credit Cost:** $0.01 USD per credit
- Credits purchased via developer portal
- Sales tax may apply based on location

#### Video Generation Costs

| Model | Credits per Second | 5s Video Cost | 10s Video Cost |
|-------|-------------------|---------------|----------------|
| gen4_turbo | 5 | $0.25 | $0.50 |
| gen4_aleph | 15 | $0.75 | $1.50 |
| gen3a_turbo | 5 | $0.25 | $0.50 |
| act_two | 5 | $0.25 | $0.50 |
| veo3 / veo3.1 | 40 | $2.00 | $4.00 |
| veo3.1_fast | 20 | $1.00 | $2.00 |

#### Usage Tiers and Rate Limits

Runway enforces tiered rate limits based on usage:

| Tier | Concurrency | Max Gens/Day | Max Monthly Spend |
|------|-------------|--------------|-------------------|
| Tier 1 | 1 | 50 | $100 |
| Tier 2 | 2 | 200 | $500 |
| Tier 3 | 5 | 1,000 | $2,000 |
| Tier 4 | 10 | 5,000 | $10,000 |
| Tier 5 | 20 | 25,000 | $100,000 |

**Rate Limit Enforcement:**
- **Concurrency:** Excess tasks return `THROTTLED` status and queue
- **Daily Limits:** Rolling 24-hour window, returns `429 Too Many Requests`
- **Monthly Spend:** Auto-billing caps at tier limit

**Enterprise Options:**
- Submit exception requests via developer portal
- Higher limits available
- Faster support via Slack/email
- Early access to new features

#### Content Moderation

**Automatic Moderation:**
- All inputs and outputs are automatically moderated
- Cannot be disabled or bypassed
- Violations result in `FAILED` status

**Failure Codes:**
- **001:** Text-based violation (prompt contains restricted content)
- **002:** Image-based violation (NSFW imagery detected)

**Restricted Content:**
- Adult nudity and sexual content
- Violence and gore
- Child safety violations
- Harassment and hate speech
- Public figures and impersonation
- Copyright infringement

### 6. Best Practices for React Integration

#### Architecture Pattern

**Recommended: Backend Proxy Pattern**

```
React Frontend → Backend API → Runway ML API
```

**Why Backend Proxy:**
- Protects API keys from client exposure
- Enables request validation and rate limiting
- Allows caching and optimization
- Provides better error handling

#### SDK Installation

**Node.js/Backend:**
```bash
npm install @runwayml/sdk
```

**Important Limitations:**
- SDK supports Node.js v18+, Deno, Bun, Cloudflare Workers, Vercel Edge
- **NOT supported:** Browser runtimes, React Native
- Must use backend/serverless functions for React apps

#### Implementation Example

**Backend (Node.js/Express):**

```javascript
import express from 'express';
import RunwayML, { TaskFailedError } from '@runwayml/sdk';

const app = express();
const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET
});

// Endpoint to create video generation task
app.post('/api/generate-video', async (req, res) => {
  try {
    const { promptImage, promptText, duration = 5 } = req.body;
    
    // Validate inputs
    if (!promptImage || !promptText) {
      return res.status(400).json({ 
        error: 'Missing required parameters' 
      });
    }
    
    // Create task
    const task = await client.imageToVideo.create({
      model: 'gen4_turbo',
      promptImage,
      promptText,
      ratio: '1280:720',
      duration
    });
    
    res.json({ 
      taskId: task.id,
      status: task.status 
    });
    
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ 
      error: 'Failed to create video generation task' 
    });
  }
});

// Endpoint to check task status
app.get('/api/task-status/:taskId', async (req, res) => {
  try {
    const task = await client.tasks.retrieve(req.params.taskId);
    
    res.json({
      id: task.id,
      status: task.status,
      output: task.output,
      progress: task.progress
    });
    
  } catch (error) {
    console.error('Task status error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve task status' 
    });
  }
});

// Endpoint with automatic waiting
app.post('/api/generate-video-wait', async (req, res) => {
  try {
    const { promptImage, promptText, duration = 5 } = req.body;
    
    // Create and wait for completion
    const task = await client.imageToVideo
      .create({
        model: 'gen4_turbo',
        promptImage,
        promptText,
        ratio: '1280:720',
        duration
      })
      .waitForTaskOutput();
    
    res.json({
      videoUrl: task.output[0],
      taskId: task.id
    });
    
  } catch (error) {
    if (error instanceof TaskFailedError) {
      return res.status(400).json({
        error: 'Video generation failed',
        details: error.taskDetails,
        failureCode: error.taskDetails.failureCode
      });
    }
    
    res.status(500).json({ 
      error: 'Server error during video generation' 
    });
  }
});
```

**React Frontend:**

```typescript
import React, { useState } from 'react';

interface VideoGenerationState {
  loading: boolean;
  videoUrl: string | null;
  error: string | null;
  progress: number;
}

export function VideoGenerator() {
  const [state, setState] = useState<VideoGenerationState>({
    loading: false,
    videoUrl: null,
    error: null,
    progress: 0
  });
  
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  
  // Method 1: Poll for status
  const generateVideoWithPolling = async () => {
    setState({ loading: true, videoUrl: null, error: null, progress: 0 });
    
    try {
      // Create task
      const createResponse = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptImage: imageUrl,
          promptText: prompt,
          duration: 5
        })
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create video generation task');
      }
      
      const { taskId } = await createResponse.json();
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/task-status/${taskId}`);
        const taskData = await statusResponse.json();
        
        setState(prev => ({ ...prev, progress: taskData.progress || 0 }));
        
        if (taskData.status === 'SUCCEEDED') {
          clearInterval(pollInterval);
          setState({
            loading: false,
            videoUrl: taskData.output[0],
            error: null,
            progress: 100
          });
        } else if (taskData.status === 'FAILED') {
          clearInterval(pollInterval);
          setState({
            loading: false,
            videoUrl: null,
            error: 'Video generation failed',
            progress: 0
          });
        }
      }, 5000); // Poll every 5 seconds
      
    } catch (error) {
      setState({
        loading: false,
        videoUrl: null,
        error: error.message,
        progress: 0
      });
    }
  };
  
  // Method 2: Wait for completion (simpler)
  const generateVideoWithWait = async () => {
    setState({ loading: true, videoUrl: null, error: null, progress: 0 });
    
    try {
      const response = await fetch('/api/generate-video-wait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptImage: imageUrl,
          promptText: prompt,
          duration: 5
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }
      
      const { videoUrl } = await response.json();
      
      setState({
        loading: false,
        videoUrl,
        error: null,
        progress: 100
      });
      
    } catch (error) {
      setState({
        loading: false,
        videoUrl: null,
        error: error.message,
        progress: 0
      });
    }
  };
  
  return (
    <div className="video-generator">
      <div className="input-section">
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <textarea
          placeholder="Describe the video animation..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          onClick={generateVideoWithWait}
          disabled={state.loading || !imageUrl || !prompt}
        >
          {state.loading ? 'Generating...' : 'Generate Video'}
        </button>
      </div>
      
      {state.loading && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${state.progress}%` }} />
          <p>Generating video... {state.progress}%</p>
        </div>
      )}
      
      {state.error && (
        <div className="error">
          <p>Error: {state.error}</p>
        </div>
      )}
      
      {state.videoUrl && (
        <div className="video-preview">
          <h3>Generated Video:</h3>
          <video 
            controls 
            src={state.videoUrl}
            width="100%"
            style={{ maxWidth: '800px' }}
          />
        </div>
      )}
    </div>
  );
}
```

#### Base64 Image Upload

For local images, use base64 data URIs:

```javascript
// Backend helper
import fs from 'node:fs';

function imageToDataUri(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64String = imageBuffer.toString('base64');
  const mimeType = 'image/png'; // or detect from file
  return `data:${mimeType};base64,${base64String}`;
}

// Usage
const task = await client.imageToVideo.create({
  model: 'gen4_turbo',
  promptImage: imageToDataUri('./local-image.png'),
  promptText: 'Animation description',
  ratio: '1280:720',
  duration: 5
});
```

#### Error Handling Best Practices

```javascript
import { TaskFailedError } from '@runwayml/sdk';

async function generateVideoWithRetry(params, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const task = await client.imageToVideo
        .create(params)
        .waitForTaskOutput();
      
      return task;
      
    } catch (error) {
      if (error instanceof TaskFailedError) {
        // Content moderation or generation failure
        const { failureCode, failure } = error.taskDetails;
        
        if (failureCode === '001') {
          throw new Error('Text prompt violates content policy');
        } else if (failureCode === '002') {
          throw new Error('Image contains restricted content');
        }
        
        throw new Error(`Generation failed: ${failure}`);
      }
      
      // Retry on network/server errors
      if (error.status >= 500 || error.code === 'ECONNRESET') {
        retries++;
        const backoff = Math.min(1000 * Math.pow(2, retries), 8000);
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
      
      // Don't retry client errors
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

#### Polling Best Practices

```javascript
async function pollTaskStatus(taskId, options = {}) {
  const {
    interval = 5000,        // 5 seconds
    maxAttempts = 60,       // 5 minutes total
    onProgress = null
  } = options;
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const task = await client.tasks.retrieve(taskId);
    
    if (onProgress) {
      onProgress(task.progress || 0);
    }
    
    if (task.status === 'SUCCEEDED') {
      return task;
    }
    
    if (task.status === 'FAILED') {
      throw new Error(`Task failed: ${task.failure}`);
    }
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    await new Promise(resolve => 
      setTimeout(resolve, interval + jitter)
    );
    
    attempts++;
  }
  
  throw new Error('Polling timeout exceeded');
}
```

### 7. Video Preview and Playback Requirements

#### Video Output Format

- **Format:** MP4
- **Codec:** H.264 (typical)
- **Resolution:** 720p (1280×720 or equivalent aspect ratio)
- **Frame Rate:** 24 fps
- **Duration:** 5 or 10 seconds

#### React Video Playback

**Native HTML5 Video:**

```typescript
interface VideoPlayerProps {
  videoUrl: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ videoUrl, autoPlay = false }: VideoPlayerProps) {
  return (
    <video
      controls
      autoPlay={autoPlay}
      loop={false}
      playsInline
      src={videoUrl}
      style={{ width: '100%', maxWidth: '800px' }}
    >
      Your browser does not support video playback.
    </video>
  );
}
```

**Using react-player (Recommended):**

```bash
npm install react-player
```

```typescript
import ReactPlayer from 'react-player';

export function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  return (
    <ReactPlayer
      url={videoUrl}
      controls
      width="100%"
      height="auto"
      config={{
        file: {
          attributes: {
            controlsList: 'nodownload',
            disablePictureInPicture: true
          }
        }
      }}
    />
  );
}
```

#### Video Caching and Storage

**Considerations:**
- Runway-generated video URLs are temporary
- Download and store videos in your own storage (S3, Cloudinary, etc.)
- Implement CDN for faster playback

**Example Storage Flow:**

```javascript
async function downloadAndStoreVideo(runwayVideoUrl, filename) {
  // Download from Runway
  const response = await fetch(runwayVideoUrl);
  const videoBuffer = await response.arrayBuffer();
  
  // Upload to your storage (example: S3)
  const s3Url = await uploadToS3(videoBuffer, filename);
  
  return s3Url;
}
```

---

## Recommendations

### For Production Applications

1. **Use Backend Proxy Pattern**
   - Never expose API keys in frontend code
   - Implement rate limiting and request validation
   - Add caching layer for repeated requests

2. **Implement Robust Error Handling**
   - Handle content moderation failures gracefully
   - Provide user-friendly error messages
   - Implement retry logic with exponential backoff

3. **Optimize User Experience**
   - Show progress indicators during generation
   - Provide preview of input image
   - Allow users to cancel long-running tasks
   - Cache generated videos

4. **Monitor Usage and Costs**
   - Track API usage and credit consumption
   - Set up alerts for approaching tier limits
   - Implement usage quotas per user if needed

5. **Content Moderation Awareness**
   - Educate users about content restrictions
   - Validate inputs before sending to API
   - Provide feedback mechanism for false positives

### Model Selection Guide

| Use Case | Recommended Model | Rationale |
|----------|------------------|-----------|
| Fast prototyping | gen4_turbo | Low cost, fast generation |
| High-quality output | veo3.1 | Best quality, higher cost |
| Budget-conscious | gen4_turbo or gen3a_turbo | 5 credits/sec |
| Character animation | act_two | Specialized for characters |
| Video enhancement | gen4_aleph | Advanced modifications |

### Cost Optimization

1. **Start with shorter videos** (5s) during development
2. **Use gen4_turbo** for testing and prototyping
3. **Implement caching** to avoid regenerating identical content
4. **Batch requests** when possible to maximize concurrency
5. **Monitor and optimize** prompt effectiveness

---

## Implementation Notes

### Technical Requirements

**Backend:**
- Node.js v18+ (or compatible runtime)
- Environment variable management
- HTTPS for production

**Frontend:**
- React 16.8+ (hooks support)
- Modern browser with video playback support
- Responsive design for various screen sizes

### Dependencies

```json
{
  "dependencies": {
    "@runwayml/sdk": "^2.8.2",
    "react-player": "^2.13.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0"
  }
}
```

### Environment Variables

```bash
# .env
RUNWAYML_API_SECRET=your_api_key_here
RUNWAY_API_VERSION=2024-11-06
```

### Potential Challenges

1. **Content Moderation False Positives**
   - **Mitigation:** Provide clear guidelines to users, implement feedback system

2. **Generation Time Variability**
   - **Mitigation:** Set realistic expectations, show progress indicators

3. **Rate Limiting**
   - **Mitigation:** Implement queuing system, upgrade tier as needed

4. **Video Storage Costs**
   - **Mitigation:** Implement cleanup policies, use efficient compression

5. **Browser Compatibility**
   - **Mitigation:** Test across browsers, provide fallbacks

---

## Sources

1. [Runway API Documentation](https://docs.dev.runwayml.com) - Official API documentation
2. [Runway API Getting Started Guide](https://docs.dev.runwayml.com/guides/using-the-api) - Quickstart and examples
3. [Runway API Models](https://docs.dev.runwayml.com/guides/models) - Available models and specifications
4. [Runway API Pricing](https://docs.dev.runwayml.com/guides/pricing) - Credit costs and pricing details
5. [Runway API Usage Tiers](https://docs.dev.runwayml.com/usage/tiers) - Rate limits and tier information
6. [Runway API SDKs](https://docs.dev.runwayml.com/api-details/sdks) - SDK documentation and best practices
7. [Runway API Content Moderation](https://docs.dev.runwayml.com/api-details/moderation) - Moderation system details
8. [@runwayml/sdk npm package](https://www.npmjs.com/package/@runwayml/sdk) - SDK installation and usage
9. [Runway Gen-4 Video Help Center](https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video) - Model capabilities and parameters
10. [Runway Usage Policy](https://help.runwayml.com/hc/en-us/articles/17944787368595-Runway-s-approach-to-trust-safety) - Content restrictions and policies

---

## Next Steps

### For Implementation Team

1. **Set up Runway Developer Account**
   - Create account and generate API key
   - Configure billing and select appropriate tier

2. **Implement Backend Proxy**
   - Create Express/Next.js API routes
   - Install @runwayml/sdk
   - Implement authentication and validation

3. **Build React Components**
   - Video generation form
   - Progress indicator
   - Video player component
   - Error handling UI

4. **Testing Strategy**
   - Test with various image types and prompts
   - Verify content moderation handling
   - Load test with concurrent requests
   - Cross-browser video playback testing

5. **Production Preparation**
   - Set up monitoring and logging
   - Implement usage tracking
   - Configure CDN for video delivery
   - Document user guidelines

### Additional Research Needs

- Webhook integration for async notifications (if available)
- Advanced video editing capabilities with gen4_aleph
- Integration with video storage providers (S3, Cloudinary)
- Performance optimization for high-traffic scenarios
