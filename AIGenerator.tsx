/**
 * AI Generator Component
 * 
 * @module AIGenerator
 * @description Unified AI content generation interface supporting images, videos,
 * and audio. Provides tabbed interface for different generation types with
 * real-time preview and compliance checking.
 * 
 * @example
 * ```tsx
 * <AIGenerator
 *   onGenerate={(type, result) => {
 *     console.log('Generated:', type, result);
 *     // Handle generated content
 *   }}
 * />
 * ```
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Image as ImageIcon, Video, Music } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { NFTType } from '@/utils/evmConfig';
import { AudioGenerator } from '@/components/AudioGenerator';
import { VideoGenerator } from '@/components/VideoGenerator';
import { ImageGenerator } from '@/components/ImageGenerator';
import type { AudioGenerationResult } from '@/lib/elevenLabsService';
import type { VideoGenerationResult } from '@/lib/runwayService';
import type { AIGenerationResult } from '@/lib/aiServices';

/**
 * AI Generator component props
 * @interface AIGeneratorProps
 */
interface AIGeneratorProps {
  /** Callback when content is generated */
  onGenerate: (type: NFTType, result: GeneratedContent) => void;
}

/**
 * Generated content result
 * @interface GeneratedContent
 */
export interface GeneratedContent {
  url: string;
  blob?: Blob;
  prompt?: string;
  type: NFTType;
  model: string;
  duration?: number;
}

/**
 * AI Generator Component
 * 
 * @param {AIGeneratorProps} props - Component props
 * @returns {JSX.Element} AI generator interface with tabs
 * 
 * @description
 * Provides unified interface for AI content generation:
 * - Image generation (Stable Diffusion, DALL-E)
 * - Video generation (Runway ML)
 * - Audio generation (ElevenLabs TTS)
 * 
 * Features:
 * - Real-time generation preview
 * - Compliance checking
 * - Progress tracking
 * - Error handling
 */
export function AIGenerator({ onGenerate }: AIGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'audio'>('image');

  const handleImageGenerated = (result: AIGenerationResult, prompt: string) => {
    onGenerate(NFTType.IMAGE, {
      url: result.url,
      blob: result.blob,
      prompt,
      type: NFTType.IMAGE,
      model: 'stabilityai/stable-diffusion-2-1',
    });
  };

  const handleAudioGenerated = (result: AudioGenerationResult) => {
    onGenerate(NFTType.AUDIO, {
      url: result.url,
      blob: result.blob,
      type: NFTType.AUDIO,
      model: 'elevenlabs-tts',
      duration: result.duration,
    });
  };

  const handleVideoGenerated = (result: VideoGenerationResult) => {
    if (result.status === 'completed' && result.url) {
      onGenerate(NFTType.VIDEO, {
        url: result.url,
        blob: result.blob,
        type: NFTType.VIDEO,
        model: 'runway-ml',
        duration: result.duration,
      });
    }
  };

  return (
    <Card className="p-5 border-border/50" role="region" aria-labelledby="ai-generator-heading">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-foreground/60" aria-hidden="true" />
        <h2 id="ai-generator-heading" className="text-sm font-medium">AI Generator</h2>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 mb-4 h-9" role="tablist" aria-label="AI generation type">
          <Tooltip content="Generate AI images using Stable Diffusion">
            <TabsTrigger value="image" className="text-xs" aria-label="Generate image">
              <ImageIcon className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Image
            </TabsTrigger>
          </Tooltip>
          <Tooltip content="Generate AI audio using ElevenLabs TTS">
            <TabsTrigger value="audio" className="text-xs" aria-label="Generate audio">
              <Music className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Audio
            </TabsTrigger>
          </Tooltip>
          <Tooltip content="Generate AI videos using Runway ML">
            <TabsTrigger value="video" className="text-xs" aria-label="Generate video">
              <Video className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Video
            </TabsTrigger>
          </Tooltip>
        </TabsList>

        <TabsContent value="image">
          <ImageGenerator onImageGenerated={handleImageGenerated} />
        </TabsContent>

        <TabsContent value="audio">
          <AudioGenerator onAudioGenerated={handleAudioGenerated} />
        </TabsContent>

        <TabsContent value="video">
          <VideoGenerator onVideoGenerated={handleVideoGenerated} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
