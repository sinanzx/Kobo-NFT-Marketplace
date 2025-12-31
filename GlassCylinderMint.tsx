/**
 * Glass Cylinder Mint Animation Component
 * 
 * @module GlassCylinderMint
 * @description Premium 3D glass cylinder animation for NFT minting with multiple
 * visual variants, particle effects, and procedural audio synthesis.
 * 
 * @example
 * ```tsx
 * <GlassCylinderMint
 *   isOpen={isMinting}
 *   onComplete={() => setIsMinting(false)}
 *   nftImage="ipfs://..."
 *   variant="mystical"
 *   config={{ soundEnabled: true }}
 * />
 * ```
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Check, Sparkles } from 'lucide-react';

/**
 * Glass cylinder mint component props
 * @interface GlassCylinderMintProps
 */
interface GlassCylinderMintProps {
  /** Whether animation is active */
  isOpen: boolean;
  /** Callback when animation completes */
  onComplete: () => void;
  /** Optional NFT image to display */
  nftImage?: string;
  /** Visual variant theme */
  variant?: 'mechanical' | 'mystical' | 'scifi';
  /** Optional animation configuration */
  config?: MintAnimationConfig;
}

/**
 * Mint animation configuration
 * @interface MintAnimationConfig
 */
interface MintAnimationConfig {
  openDuration?: number;
  revealDuration?: number;
  completeDuration?: number;
  fogColor?: string;
  glowColor?: string;
  soundEnabled?: boolean;
}

const defaultConfig: Required<MintAnimationConfig> = {
  openDuration: 2000,
  revealDuration: 2000,
  completeDuration: 2000,
  fogColor: 'from-purple-500/50 via-blue-500/30',
  glowColor: 'from-purple-500/50 to-blue-500/50',
  soundEnabled: true,
};

/**
 * Glass Cylinder Mint Animation
 * 
 * @param {GlassCylinderMintProps} props - Component props
 * @returns {JSX.Element} Animated glass cylinder mint sequence
 * 
 * @description
 * Multi-stage animation sequence:
 * 1. Opening: Cylinder opens with particle effects
 * 2. Revealing: NFT materializes with glow effects
 * 3. Complete: Success state with confetti
 * 
 * Features:
 * - 3D glass morphism effects
 * - Procedural particle systems
 * - Web Audio API sound synthesis
 * - Customizable themes and timing
 * - Responsive design
 */
export function GlassCylinderMint({ 
  isOpen, 
  onComplete, 
  nftImage,
  variant = 'mystical',
  config = {}
}: GlassCylinderMintProps) {
  const [stage, setStage] = useState<'idle' | 'opening' | 'revealing' | 'complete'>('idle');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const finalConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    if (!isOpen) {
      setStage('idle');
      setParticles([]);
      return;
    }

    // Generate fog particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    // Stage progression
    setStage('opening');
    
    const openTimer = setTimeout(() => {
      setStage('revealing');
      if (finalConfig.soundEnabled) {
        playSound(variant, 'reveal');
      }
    }, finalConfig.openDuration);

    const completeTimer = setTimeout(() => {
      setStage('complete');
      if (finalConfig.soundEnabled) {
        playSound(variant, 'complete');
      }
    }, finalConfig.openDuration + finalConfig.revealDuration);

    const closeTimer = setTimeout(() => {
      onComplete();
    }, finalConfig.openDuration + finalConfig.revealDuration + finalConfig.completeDuration);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
      clearTimeout(closeTimer);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isOpen, onComplete, variant, finalConfig]);

  const playSound = (soundVariant: string, type: 'reveal' | 'complete') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    if (soundVariant === 'mechanical') {
      playMechanicalSound(audioContext, type);
    } else if (soundVariant === 'mystical') {
      playMysticalSound(audioContext, type);
    } else if (soundVariant === 'scifi') {
      playSciFiSound(audioContext, type);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center overflow-hidden"
        >
          {/* Atmospheric background effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Radial gradient backdrop */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Light beams */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-white/20 via-purple-500/10 to-transparent"
              animate={{
                opacity: [0, 0.5, 0],
                scaleX: [1, 2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Glass Cylinder Container */}
          <div className="relative w-96 h-96">
            {/* Cylinder base */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-8 rounded-full bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            />

            {/* Cylinder glass */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-80 rounded-t-full bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-md border-x border-t border-white/20"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ 
                scaleY: stage === 'opening' ? [0, 1.1, 1] : 1,
                opacity: 1 
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ transformOrigin: 'bottom' }}
            >
              {/* Inner glow */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-t ${finalConfig.glowColor} rounded-t-full blur-xl`}
                animate={{
                  opacity: stage === 'revealing' ? [0, 0.6, 0.3] : 0,
                }}
                transition={{ duration: 1.5 }}
              />

              {/* NFT Image */}
              <AnimatePresence>
                {stage === 'revealing' && nftImage && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center p-8"
                    initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{ duration: 1, ease: 'backOut' }}
                  >
                    <img
                      src={nftImage}
                      alt="Minted NFT"
                      className="w-full h-full object-contain rounded-lg shadow-2xl"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success checkmark */}
              <AnimatePresence>
                {stage === 'complete' && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <div className="w-24 h-24 rounded-full bg-green-500/20 backdrop-blur-sm border-2 border-green-500 flex items-center justify-center">
                      <Check className="w-12 h-12 text-green-500" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Fog particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className={`absolute bottom-0 w-32 h-32 rounded-full bg-gradient-to-t ${finalConfig.fogColor} to-transparent blur-2xl`}
                initial={{ 
                  x: `calc(50% + ${particle.x}px)`,
                  y: 0,
                  opacity: 0,
                  scale: 0.5
                }}
                animate={{
                  y: -400,
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1.5, 2],
                }}
                transition={{
                  duration: 3,
                  delay: particle.delay,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Sparkles */}
            {stage === 'complete' && (
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: `calc(50% + ${Math.cos(i * 30 * Math.PI / 180) * 150}px)`,
                      y: `calc(50% + ${Math.sin(i * 30 * Math.PI / 180) * 150}px)`,
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.05,
                      ease: 'easeOut',
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Sound generation functions
function playMechanicalSound(audioContext: AudioContext, type: 'reveal' | 'complete') {
  if (type === 'reveal') {
    // Hydraulic hiss + mechanical clank
    const noise = audioContext.createBufferSource();
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;
    
    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 2000;
    
    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.15, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    
    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.3);
    
    // Metallic clank
    const clank = audioContext.createOscillator();
    const clankGain = audioContext.createGain();
    clank.frequency.setValueAtTime(150, audioContext.currentTime + 0.2);
    clankGain.gain.setValueAtTime(0.2, audioContext.currentTime + 0.2);
    clankGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    clank.connect(clankGain);
    clankGain.connect(audioContext.destination);
    clank.start(audioContext.currentTime + 0.2);
    clank.stop(audioContext.currentTime + 0.4);
  } else {
    // Success beep
    const beep = audioContext.createOscillator();
    const beepGain = audioContext.createGain();
    beep.frequency.setValueAtTime(800, audioContext.currentTime);
    beepGain.gain.setValueAtTime(0.15, audioContext.currentTime);
    beepGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    beep.connect(beepGain);
    beepGain.connect(audioContext.destination);
    beep.start(audioContext.currentTime);
    beep.stop(audioContext.currentTime + 0.2);
  }
}

function playMysticalSound(audioContext: AudioContext, type: 'reveal' | 'complete') {
  if (type === 'reveal') {
    // Ethereal whoosh with shimmer
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    osc1.frequency.setValueAtTime(400, audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
    
    osc2.frequency.setValueAtTime(600, audioContext.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioContext.destination);
    
    osc1.start(audioContext.currentTime);
    osc2.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.5);
    osc2.stop(audioContext.currentTime + 0.5);
  } else {
    // Magical chime
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.5);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime + i * 0.1);
      osc.stop(audioContext.currentTime + i * 0.1 + 0.5);
    });
  }
}

function playSciFiSound(audioContext: AudioContext, type: 'reveal' | 'complete') {
  if (type === 'reveal') {
    // Futuristic power-up sweep
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    
    osc.frequency.setValueAtTime(100, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.6);
    
    filter.frequency.setValueAtTime(500, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, audioContext.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.6);
  } else {
    // Digital confirmation
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, audioContext.currentTime);
    osc.frequency.setValueAtTime(1200, audioContext.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.15);
  }
}
