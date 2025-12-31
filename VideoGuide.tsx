import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface VideoGuideData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  category: 'getting-started' | 'features' | 'advanced';
}

interface VideoGuideProps {
  guide: VideoGuideData;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export const VideoGuide: React.FC<VideoGuideProps> = ({
  guide,
  autoPlay = false,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreenToggle = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onComplete?.();
  };

  return (
    <Card className="overflow-hidden border-border/50">
      <div className="relative aspect-video bg-black group">
        <video
          ref={videoRef}
          src={guide.videoUrl}
          poster={guide.thumbnailUrl}
          className="w-full h-full object-cover"
          onEnded={handleVideoEnd}
          autoPlay={autoPlay}
          aria-label={`Video guide: ${guide.title}`}
        >
          <track kind="captions" />
        </video>

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: isPlaying ? '100%' : '0%' }}
                transition={{ duration: parseInt(guide.duration) * 60 }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? (
                    <div className="w-4 h-4 flex gap-1">
                      <div className="w-1 h-4 bg-white" />
                      <div className="w-1 h-4 bg-white" />
                    </div>
                  ) : (
                    <Play className="w-4 h-4" aria-hidden="true" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMuteToggle}
                  className="text-white hover:bg-white/20"
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  )}
                </Button>

                <span className="text-white text-sm ml-2">{guide.duration}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreenToggle}
                className="text-white hover:bg-white/20"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Maximize className="w-4 h-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Play Button Overlay (when not playing) */}
        {!isPlaying && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
            onClick={handlePlayPause}
            aria-label="Play video"
          >
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Play className="w-8 h-8 text-primary-foreground ml-1" aria-hidden="true" />
            </div>
          </motion.button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{guide.title}</h3>
            <p className="text-xs text-muted-foreground">{guide.description}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
            {guide.category.replace('-', ' ')}
          </span>
        </div>
      </div>
    </Card>
  );
};

interface VideoGuideLibraryProps {
  guides: VideoGuideData[];
  onGuideComplete?: (guideId: string) => void;
}

export const VideoGuideLibrary: React.FC<VideoGuideLibraryProps> = ({
  guides,
  onGuideComplete,
}) => {
  const [selectedGuide, setSelectedGuide] = useState<VideoGuideData | null>(null);

  const categories = {
    'getting-started': guides.filter((g) => g.category === 'getting-started'),
    features: guides.filter((g) => g.category === 'features'),
    advanced: guides.filter((g) => g.category === 'advanced'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Video Guides</h2>
        <p className="text-muted-foreground">
          Learn how to use KoboNFT with our step-by-step video tutorials
        </p>
      </div>

      {Object.entries(categories).map(([category, categoryGuides]) => {
        if (categoryGuides.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3 capitalize">
              {category.replace('-', ' ')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryGuides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className="cursor-pointer"
                >
                  <VideoGuide
                    guide={guide}
                    onComplete={() => onGuideComplete?.(guide.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {selectedGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedGuide(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl font-bold">{selectedGuide.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedGuide(null)}
                  className="text-white hover:bg-white/20"
                  aria-label="Close video"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </Button>
              </div>
              <VideoGuide
                guide={selectedGuide}
                autoPlay
                onComplete={() => {
                  onGuideComplete?.(selectedGuide.id);
                  setSelectedGuide(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
