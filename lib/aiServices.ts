import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
// Note: For production, use environment variable for API key
const hf = new HfInference(import.meta.env.VITE_HF_API_KEY || '');

export interface AIGenerationResult {
  url: string;
  blob?: Blob;
}

/**
 * Generate image using Hugging Face Inference API
 * Free tier: ~10-20 requests per day without API key
 */
export async function generateImage(prompt: string): Promise<AIGenerationResult> {
  try {
    const result = await hf.textToImage(
      {
        model: 'stabilityai/stable-diffusion-2-1',
        inputs: prompt,
        parameters: {
          negative_prompt: 'blurry, bad quality, distorted',
        },
      }
    ) as unknown as Blob;

    const url = URL.createObjectURL(result);
    return { url, blob: result };
  } catch (error) {
    console.error('Image generation error:', error);
    
    // Fallback to placeholder for demo
    return {
      url: await generatePlaceholderImage(prompt),
    };
  }
}

/**
 * Generate video using Open-Sora (placeholder - requires backend)
 * Note: Video generation is computationally expensive and typically requires backend processing
 */
export async function generateVideo(prompt: string): Promise<AIGenerationResult> {
  // This would require a backend service running Open-Sora
  // For now, return a placeholder
  console.log('Video generation requested:', prompt);
  
  return {
    url: 'https://via.placeholder.com/512x512?text=Video+Generation+Requires+Backend',
  };
}

/**
 * Generate audio using MusicGen (placeholder - requires backend)
 * Note: Audio generation requires backend processing
 */
export async function generateAudio(prompt: string): Promise<AIGenerationResult> {
  // This would require a backend service running MusicGen
  // For now, return a placeholder
  console.log('Audio generation requested:', prompt);
  
  return {
    url: 'https://via.placeholder.com/512x512?text=Audio+Generation+Requires+Backend',
  };
}

/**
 * Generate placeholder image using canvas
 */
async function generatePlaceholderImage(prompt: string): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#8B5CF6');
  gradient.addColorStop(1, '#3B82F6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Add text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Space Grotesk, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Word wrap
  const words = prompt.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 450 && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  lines.push(currentLine);

  // Draw lines
  const lineHeight = 30;
  const startY = 256 - (lines.length * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), 256, startY + i * lineHeight);
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      }
    });
  });
}

/**
 * Upload to IPFS (placeholder - requires backend or Pinata/Web3.Storage)
 */
export async function uploadToIPFS(file: Blob, metadata: any): Promise<string> {
  // This would require integration with IPFS service like Pinata or Web3.Storage
  // For now, return a placeholder URI
  console.log('IPFS upload requested:', metadata);
  
  return `ipfs://placeholder/${Date.now()}`;
}
