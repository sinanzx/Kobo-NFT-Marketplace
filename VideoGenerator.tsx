import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Loader2, Download, RotateCcw, Play, Pause, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  generateVideo,
  generatePlaceholderVideo,
  estimateVideoCost,
  RUNWAY_MODELS,
  type VideoGenerationResult,
  type RunwayVideoOptions,
} from '@/lib/runwayService';

interface VideoGeneratorProps {
  onVideoGenerated?: (result: VideoGenerationResult) => void;
  initialImageUrl?: string;
}

export function VideoGenerator({ onVideoGenerated, initialImageUrl }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(initialImageUrl || '');
  const [model, setModel] = useState(RUNWAY_MODELS.GEN4_TURBO);
  const [duration, setDuration] = useState<5 | 10>(5);
  const [ratio, setRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoGenerationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const estimatedCost = estimateVideoCost({ prompt, model, duration });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      const hasApiKey = !!import.meta.env.VITE_RUNWAY_API_KEY;
      
      if (!hasApiKey) {
        // Use placeholder for demo
        const result = await generatePlaceholderVideo(prompt);
        setVideoResult(result);
        onVideoGenerated?.(result);
        setIsGenerating(false);
        return;
      }

      const options: RunwayVideoOptions = {
        prompt,
        imageUrl: imageUrl || undefined,
        model,
        duration,
        ratio,
        resolution,
      };

      // Simulate progress during generation
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 2000);

      const result = await generateVideo(options);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.status === 'completed') {
        setVideoResult(result);
        onVideoGenerated?.(result);
      } else if (result.status === 'failed') {
        throw new Error(result.error || 'Video generation failed');
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate video');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setVideoResult(null);
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (!videoResult?.blob) return;

    const url = URL.createObjectURL(videoResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kobo-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gray-900/50 border-purple-500/20">
        <div className="space-y-4">
          <div>
            <Label htmlFor="video-prompt" className="text-white font-dm-sans">
              Video Prompt
            </Label>
            <Textarea
              id="video-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate..."
              className="mt-2 min-h-[100px] bg-gray-800/50 border-purple-500/30 text-white"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">
              {prompt.length} / 500 characters
            </p>
          </div>

          <div>
            <Label htmlFor="image-url" className="text-white font-dm-sans">
              Starting Image (Optional)
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL or upload below..."
                className="flex-1 bg-gray-800/50 border-purple-500/30 text-white"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-purple-500/30"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Starting frame"
                  className="w-32 h-32 object-cover rounded-lg border border-purple-500/30"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model" className="text-white font-dm-sans">
                Model
              </Label>
              <Select value={model} onValueChange={(value) => setModel(value as typeof model)}>
                <SelectTrigger className="mt-2 bg-gray-800/50 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RUNWAY_MODELS.GEN4_TURBO}>
                    Gen-4 Turbo (Fast, Balanced)
                  </SelectItem>
                  <SelectItem value={RUNWAY_MODELS.VEO3}>
                    Veo 3 (Highest Quality)
                  </SelectItem>
                  <SelectItem value={RUNWAY_MODELS.GEN4_ALEPH}>
                    Gen-4 Aleph (Creative)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration" className="text-white font-dm-sans">
                Duration
              </Label>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v) as 5 | 10)}>
                <SelectTrigger className="mt-2 bg-gray-800/50 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ratio" className="text-white font-dm-sans">
                Aspect Ratio
              </Label>
              <Select value={ratio} onValueChange={(v) => setRatio(v as typeof ratio)}>
                <SelectTrigger className="mt-2 bg-gray-800/50 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resolution" className="text-white font-dm-sans">
                Resolution
              </Label>
              <Select value={resolution} onValueChange={(v) => setResolution(v as typeof resolution)}>
                <SelectTrigger className="mt-2 bg-gray-800/50 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-3 border border-purple-500/20">
            <p className="text-sm text-gray-300">
              Estimated cost: <span className="text-purple-400 font-semibold">${estimatedCost.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Based on {model} model and {duration}s duration
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Video... {progress > 0 && `${progress}%`}
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>

          {isGenerating && progress > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {videoResult && videoResult.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-gray-900/50 border-purple-500/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white font-dm-sans flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-400" />
                    Generated Video
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Video Preview */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoResult.url}
                    className="w-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls
                  />
                </div>

                {/* Video Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                <div className="text-sm text-gray-400 text-center">
                  Duration: {videoResult.duration}s | Resolution: {resolution} | Ratio: {ratio}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
