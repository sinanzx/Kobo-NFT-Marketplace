import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, Monitor, Eye, Maximize2, RotateCw, 
  Move, ZoomIn, CheckCircle2, Sparkles, Camera
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { duration, spring } from '@/lib/animationConfig';

interface ARViewerProps {
  onComplete: () => void;
}

type ViewMode = 'select' | 'mobile-ar' | 'web-vr' | 'complete';

export default function ARViewer({ onComplete }: ARViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (viewMode === 'mobile-ar' || viewMode === 'web-vr') {
      const rotationInterval = setInterval(() => {
        setRotation(prev => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(rotationInterval);
    }
  }, [viewMode]);

  const handleMobileAR = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setViewMode('mobile-ar');
    }, 2000);
  };

  const handleWebVR = () => {
    setViewMode('web-vr');
  };

  const handleComplete = () => {
    setViewMode('complete');
    setTimeout(onComplete, 2500);
  };

  return (
    <GlassCard className="p-8 rounded-3xl max-w-4xl w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Eye className="w-8 h-8 text-blue-400" />
          <h3 className="text-3xl font-bold text-white">AR/VR Gallery Quest</h3>
        </div>
        <p className="text-gray-400">
          {viewMode === 'select' && 'Choose your immersive viewing experience'}
          {viewMode === 'mobile-ar' && 'Viewing NFT in Augmented Reality'}
          {viewMode === 'web-vr' && 'Exploring Virtual Reality Gallery'}
          {viewMode === 'complete' && 'Immersive experience complete!'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Mobile AR Option */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMobileAR}
                className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <Smartphone className="w-12 h-12 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                    <span className="text-purple-400 text-xs font-semibold">Mobile</span>
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">AR Preview</h4>
                <p className="text-gray-400 mb-4">
                  View NFTs in your real environment using your phone camera
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Camera className="w-4 h-4" />
                    <span>Camera-based placement</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Move className="w-4 h-4" />
                    <span>Move & rotate in 3D space</span>
                  </div>
                </div>
              </motion.button>

              {/* Web VR Option */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWebVR}
                className="p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <Monitor className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform" />
                  <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                    <span className="text-blue-400 text-xs font-semibold">Web</span>
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">VR Gallery</h4>
                <p className="text-gray-400 mb-4">
                  Explore an immersive 3D gallery space in your browser
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Maximize2 className="w-4 h-4" />
                    <span>Full 360° environment</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <RotateCw className="w-4 h-4" />
                    <span>Interactive navigation</span>
                  </div>
                </div>
              </motion.button>
            </div>

            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 mx-auto mb-3"
                >
                  <Camera className="w-full h-full text-purple-400" />
                </motion.div>
                <p className="text-white font-semibold">Scanning environment...</p>
                <p className="text-gray-400 text-sm mt-1">Point your camera at a flat surface</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {viewMode === 'mobile-ar' && (
          <motion.div
            key="mobile-ar"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-6"
          >
            {/* AR Viewport */}
            <div className="relative h-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
              {/* Simulated Camera Feed */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20" />
              
              {/* AR Grid Overlay */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-8 grid-rows-8 h-full">
                  {[...Array(64)].map((_, i) => (
                    <div key={i} className="border border-blue-400/30" />
                  ))}
                </div>
              </div>

              {/* NFT in AR Space */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    rotateY: rotation,
                    scale: scale,
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 40px rgba(168, 85, 247, 0.5)',
                        '0 0 60px rgba(236, 72, 153, 0.5)',
                        '0 0 40px rgba(168, 85, 247, 0.5)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-48 h-48 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-6xl"
                  >
                    🎨
                  </motion.div>
                </motion.div>
              </div>

              {/* AR Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                  className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white"
                >
                  <ZoomIn className="w-5 h-5 rotate-180" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setScale(s => Math.min(2, s + 0.1))}
                  className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white"
                >
                  <ZoomIn className="w-5 h-5" />
                </motion.button>
              </div>

              {/* AR Indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-md rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white text-sm font-semibold">AR Active</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-400">
                Move your device to view the NFT from different angles
              </p>
              <AnimatedButton onClick={handleComplete} size="lg">
                <CheckCircle2 className="w-5 h-5" />
                Complete AR Experience
              </AnimatedButton>
            </div>
          </motion.div>
        )}

        {viewMode === 'web-vr' && (
          <motion.div
            key="web-vr"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-6"
          >
            {/* VR Gallery Viewport */}
            <div className="relative h-96 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl overflow-hidden">
              {/* 3D Gallery Space */}
              <motion.div
                animate={{
                  background: [
                    'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                    'radial-gradient(circle at 70% 50%, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
                    'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                  ],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute inset-0"
              />

              {/* Gallery Floor Grid */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-30">
                <div className="grid grid-cols-12 h-full" style={{ perspective: '1000px' }}>
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                      className="border-r border-blue-400/30"
                      style={{ transform: 'rotateX(60deg)' }}
                    />
                  ))}
                </div>
              </div>

              {/* NFT Displays */}
              <div className="absolute inset-0 flex items-center justify-center gap-8">
                {[-1, 0, 1].map((offset, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      x: offset * 150,
                      rotateY: rotation + offset * 30,
                      z: offset === 0 ? 50 : 0,
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className={`relative ${offset === 0 ? 'scale-125' : 'scale-100 opacity-60'}`}
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-4xl shadow-2xl">
                      {['🎨', '🖼️', '🎭'][i]}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* VR Mode Indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-md rounded-full">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-semibold">VR Gallery Mode</span>
              </div>

              {/* Navigation Hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full">
                <span className="text-white text-sm">← Drag to look around →</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="p-3 bg-white/5 rounded-lg">
                <RotateCw className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="text-white font-semibold">360° View</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <Maximize2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <div className="text-white font-semibold">Immersive</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-white font-semibold">Interactive</div>
              </div>
            </div>

            <div className="text-center">
              <AnimatedButton onClick={handleComplete} size="lg">
                <CheckCircle2 className="w-5 h-5" />
                Complete VR Experience
              </AnimatedButton>
            </div>
          </motion.div>
        )}

        {viewMode === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring.bouncy }}
            className="py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...spring.bouncy }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-xl opacity-50"
                />
                <CheckCircle2 className="relative w-24 h-24 text-blue-400" />
              </div>
            </motion.div>

            <h4 className="text-3xl font-bold text-white mb-2">Immersive Experience Complete!</h4>
            <p className="text-gray-400 mb-6">
              You've explored NFTs in AR/VR - the future of digital art
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Visionary Achievement Unlocked</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
