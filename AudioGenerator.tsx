import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Download, Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  generateAudio,
  generatePlaceholderAudio,
  ELEVENLABS_VOICES,
  ELEVENLABS_MODELS,
  type AudioGenerationResult,
} from '@/lib/elevenLabsService';

interface AudioGeneratorProps {
  onAudioGenerated?: (result: AudioGenerationResult) => void;
}

export function AudioGenerator({ onAudioGenerated }: AudioGeneratorProps) {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState(ELEVENLABS_VOICES[0].voice_id);
  const [modelId, setModelId] = useState(ELEVENLABS_MODELS.TURBO_V2_5);
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioResult, setAudioResult] = useState<AudioGenerationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Generate waveform visualization
  useEffect(() => {
    if (audioResult?.blob) {
      analyzeAudio(audioResult.blob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioResult]);

  // Update waveform animation
  useEffect(() => {
    if (isPlaying && canvasRef.current && waveformData.length > 0) {
      animateWaveform();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, waveformData, currentTime]);

  const analyzeAudio = async (blob: Blob) => {
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Get channel data and downsample for visualization
      const rawData = audioBuffer.getChannelData(0);
      const samples = 100; // Number of bars in waveform
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[i * blockSize + j]);
        }
        filteredData.push(sum / blockSize);
      }
      
      // Normalize
      const max = Math.max(...filteredData);
      const normalized = filteredData.map(val => val / max);
      
      setWaveformData(normalized);
    } catch (error) {
      console.error('Error analyzing audio:', error);
    }
  };

  const animateWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;
    const duration = audioResult?.duration || 1;
    const progress = currentTime / duration;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      
      // Color based on progress
      const isPast = index / waveformData.length < progress;
      ctx.fillStyle = isPast 
        ? 'rgba(139, 92, 246, 0.8)' // Purple for played
        : 'rgba(139, 92, 246, 0.3)'; // Faded for unplayed
      
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    });

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(() => animateWaveform());
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    try {
      const hasApiKey = !!import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      const result = hasApiKey
        ? await generateAudio({
            text,
            voiceId,
            modelId,
            stability,
            similarityBoost,
          })
        : await generatePlaceholderAudio(text);

      setAudioResult(result);
      onAudioGenerated?.(result);
    } catch (error) {
      console.error('Audio generation failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleReset = () => {
    setAudioResult(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setWaveformData([]);
  };

  const handleDownload = () => {
    if (!audioResult?.blob) return;

    const url = URL.createObjectURL(audioResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kobo-audio-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gray-900/50 border-purple-500/20">
        <div className="space-y-4">
          <div>
            <Label htmlFor="audio-text" className="text-white font-dm-sans">
              Text to Speech
            </Label>
            <Textarea
              id="audio-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="mt-2 min-h-[120px] bg-gray-800/50 border-purple-500/30 text-white"
              maxLength={5000}
            />
            <p className="text-xs text-gray-400 mt-1">
              {text.length} / 5000 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="voice" className="text-white font-dm-sans">
                Voice
              </Label>
              <Select value={voiceId} onValueChange={setVoiceId}>
                <SelectTrigger className="mt-2 bg-gray-800/50 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ELEVENLABS_VOICES.map((voice) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} {voice.category && `(${voice.category})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model" className="text-white font-dm-sans">
                Model
              </Label>
              <Select value={modelId} onValueChange={(value) => setModelId(value as typeof modelId)}>
                <SelectTrigger className="mt-2 bg-gray-800/50 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ELEVENLABS_MODELS.TURBO_V2_5}>
                    Turbo v2.5 (Fast, Multilingual)
                  </SelectItem>
                  <SelectItem value={ELEVENLABS_MODELS.MULTILINGUAL_V2}>
                    Multilingual v2 (High Quality)
                  </SelectItem>
                  <SelectItem value={ELEVENLABS_MODELS.TURBO_V2}>
                    Turbo v2 (Fast, English)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-white font-dm-sans">
                Stability: {stability.toFixed(2)}
              </Label>
              <Slider
                value={[stability]}
                onValueChange={([value]) => setStability(value)}
                min={0}
                max={1}
                step={0.01}
                className="mt-2"
              />
              <p className="text-xs text-gray-400 mt-1">
                Higher values make voice more consistent
              </p>
            </div>

            <div>
              <Label className="text-white font-dm-sans">
                Similarity Boost: {similarityBoost.toFixed(2)}
              </Label>
              <Slider
                value={[similarityBoost]}
                onValueChange={([value]) => setSimilarityBoost(value)}
                min={0}
                max={1}
                step={0.01}
                className="mt-2"
              />
              <p className="text-xs text-gray-400 mt-1">
                Higher values make voice closer to original
              </p>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!text.trim() || isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Audio...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Generate Audio
              </>
            )}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {audioResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-gray-900/50 border-purple-500/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white font-dm-sans flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-purple-400" />
                    Generated Audio
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

                {/* Waveform Visualization */}
                <div className="relative bg-gray-800/50 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={120}
                    className="w-full h-[120px]"
                  />
                </div>

                {/* Audio Controls */}
                <div className="flex items-center gap-4">
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

                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(audioResult.duration || 0)}</span>
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${(currentTime / (audioResult.duration || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  src={audioResult.url}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  className="hidden"
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
