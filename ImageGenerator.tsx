import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Loader2, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateImage, type AIGenerationResult } from '@/lib/aiServices';

interface ImageGeneratorProps {
  onImageGenerated?: (result: AIGenerationResult, prompt: string) => void;
}

export function ImageGenerator({ onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageResult, setImageResult] = useState<AIGenerationResult | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setCurrentPrompt(prompt);

    try {
      const result = await generateImage(prompt);
      setImageResult(result);
      onImageGenerated?.(result, prompt);
    } catch (error) {
      console.error('Image generation failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setImageResult(null);
    setCurrentPrompt('');
  };

  const handleDownload = () => {
    if (!imageResult?.blob) return;

    const url = URL.createObjectURL(imageResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kobo-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gray-900/50 border-purple-500/20">
        <div className="space-y-4">
          <div>
            <Label htmlFor="image-prompt" className="text-white font-dm-sans">
              Image Prompt
            </Label>
            <Textarea
              id="image-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create... (e.g., 'A futuristic cyberpunk cityscape at night with neon lights')"
              className="mt-2 min-h-[120px] bg-gray-800/50 border-purple-500/30 text-white"
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1">
              {prompt.length} / 1000 characters
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-3 border border-purple-500/20">
            <p className="text-sm text-gray-300">
              Powered by <span className="text-purple-400 font-semibold">Hugging Face</span> Stable Diffusion
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Free tier available • Add API key for higher rate limits
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
                Generating Image...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {imageResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-gray-900/50 border-purple-500/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white font-dm-sans flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-400" />
                    Generated Image
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

                {/* Image Preview */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <img
                    src={imageResult.url}
                    alt={currentPrompt}
                    className="w-full h-auto"
                  />
                </div>

                {currentPrompt && (
                  <div className="bg-gray-800/30 rounded-lg p-3 border border-purple-500/20">
                    <p className="text-sm text-gray-400">
                      <span className="font-semibold text-purple-400">Prompt:</span> {currentPrompt}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
