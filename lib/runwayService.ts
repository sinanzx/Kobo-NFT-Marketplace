/**
 * Runway ML Video Generation Service
 * Provides text-to-video and image-to-video functionality for NFT video generation
 */

export interface RunwayVideoOptions {
  prompt: string;
  imageUrl?: string; // For image-to-video
  model?: string;
  duration?: number; // 5 or 10 seconds
  ratio?: '16:9' | '9:16' | '1:1';
  resolution?: '720p' | '1080p';
  seed?: number;
}

export interface VideoGenerationResult {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  blob?: Blob;
  duration?: number;
  error?: string;
}

// Available Runway models
export const RUNWAY_MODELS = {
  GEN4_TURBO: 'gen4_turbo',
  VEO3: 'veo3',
  GEN4_ALEPH: 'gen4_aleph',
} as const;

const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';
const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLLING_ATTEMPTS = 100; // 5 minutes max

/**
 * Generate video using Runway ML API
 */
export async function generateVideo(
  options: RunwayVideoOptions
): Promise<VideoGenerationResult> {
  const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Runway ML API key not configured. Please add VITE_RUNWAY_API_KEY to your .env file.'
    );
  }

  const {
    prompt,
    imageUrl,
    model = RUNWAY_MODELS.GEN4_TURBO,
    duration = 5,
    ratio = '16:9',
    resolution = '720p',
    seed,
  } = options;

  try {
    // Step 1: Create video generation task
    const taskId = await createVideoTask({
      apiKey,
      prompt,
      imageUrl,
      model,
      duration,
      ratio,
      resolution,
      seed,
    });

    // Step 2: Poll for completion
    const result = await pollVideoStatus(apiKey, taskId);

    return result;
  } catch (error) {
    console.error('Video generation error:', error);
    throw error;
  }
}

/**
 * Create video generation task
 */
async function createVideoTask(params: {
  apiKey: string;
  prompt: string;
  imageUrl?: string;
  model: string;
  duration: number;
  ratio: string;
  resolution: string;
  seed?: number;
}): Promise<string> {
  const { apiKey, prompt, imageUrl, model, duration, ratio, resolution, seed } = params;

  const requestBody: any = {
    model,
    prompt_text: prompt,
    duration,
    ratio,
    resolution,
  };

  if (imageUrl) {
    requestBody.prompt_image = imageUrl;
  }

  if (seed !== undefined) {
    requestBody.seed = seed;
  }

  const response = await fetch(`${RUNWAY_API_BASE}/image_to_video`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Runway-Version': '2024-11-06',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Runway API error: ${response.status} - ${errorData.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.id;
}

/**
 * Poll video generation status
 */
async function pollVideoStatus(
  apiKey: string,
  taskId: string
): Promise<VideoGenerationResult> {
  let attempts = 0;

  while (attempts < MAX_POLLING_ATTEMPTS) {
    const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check task status: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'SUCCEEDED') {
      // Download video blob
      const videoBlob = await downloadVideo(data.output[0]);
      const url = URL.createObjectURL(videoBlob);

      return {
        taskId,
        status: 'completed',
        url,
        blob: videoBlob,
        duration: data.duration,
      };
    }

    if (data.status === 'FAILED') {
      return {
        taskId,
        status: 'failed',
        error: data.failure || 'Video generation failed',
      };
    }

    // Still processing
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    attempts++;
  }

  throw new Error('Video generation timeout - please try again');
}

/**
 * Download video from URL
 */
async function downloadVideo(url: string): Promise<Blob> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to download video');
  }

  return await response.blob();
}

/**
 * Get video task status (for manual polling)
 */
export async function getVideoTaskStatus(
  taskId: string
): Promise<VideoGenerationResult> {
  const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;

  if (!apiKey) {
    throw new Error('Runway ML API key not configured');
  }

  const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'X-Runway-Version': '2024-11-06',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to check task status: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status === 'SUCCEEDED') {
    const videoBlob = await downloadVideo(data.output[0]);
    const url = URL.createObjectURL(videoBlob);

    return {
      taskId,
      status: 'completed',
      url,
      blob: videoBlob,
      duration: data.duration,
    };
  }

  if (data.status === 'FAILED') {
    return {
      taskId,
      status: 'failed',
      error: data.failure || 'Video generation failed',
    };
  }

  return {
    taskId,
    status: data.status === 'RUNNING' ? 'processing' : 'pending',
  };
}

/**
 * Cancel video generation task
 */
export async function cancelVideoTask(taskId: string): Promise<void> {
  const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;

  if (!apiKey) {
    throw new Error('Runway ML API key not configured');
  }

  const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'X-Runway-Version': '2024-11-06',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel task: ${response.statusText}`);
  }
}

/**
 * Generate placeholder video for demo/testing
 */
export async function generatePlaceholderVideo(
  prompt: string
): Promise<VideoGenerationResult> {
  // Create a canvas-based placeholder video
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  // Draw placeholder frame
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Video Generation', canvas.width / 2, canvas.height / 2 - 40);
  
  ctx.font = '24px Arial';
  ctx.fillStyle = '#888888';
  ctx.fillText('Requires Runway ML API Key', canvas.width / 2, canvas.height / 2 + 20);
  
  ctx.font = '18px Arial';
  ctx.fillStyle = '#666666';
  const maxWidth = canvas.width - 100;
  const words = prompt.split(' ');
  let line = '';
  let y = canvas.height / 2 + 80;
  
  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, canvas.width / 2, y);
      line = word + ' ';
      y += 25;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, canvas.width / 2, y);

  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        resolve({
          taskId: 'placeholder',
          status: 'completed',
          url,
          blob,
          duration: 5,
        });
      }
    }, 'image/png');
  });
}

/**
 * Estimate video generation cost
 */
export function estimateVideoCost(options: RunwayVideoOptions): number {
  const { model = RUNWAY_MODELS.GEN4_TURBO, duration = 5 } = options;

  // Cost per second based on model
  const costPerSecond: Record<string, number> = {
    [RUNWAY_MODELS.GEN4_TURBO]: 5, // 5 credits/second
    [RUNWAY_MODELS.VEO3]: 40, // 40 credits/second
    [RUNWAY_MODELS.GEN4_ALEPH]: 10, // 10 credits/second
  };

  const credits = (costPerSecond[model] || 5) * duration;
  const costInDollars = credits * 0.01; // $0.01 per credit

  return costInDollars;
}
