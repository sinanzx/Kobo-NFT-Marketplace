import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface MintAnimationProps {
  isOpen: boolean;
  onComplete: () => void;
  nftImage?: string;
}

export function MintAnimation({ isOpen, onComplete, nftImage }: MintAnimationProps) {
  const [stage, setStage] = useState<'opening' | 'revealing' | 'complete'>('opening');

  useEffect(() => {
    if (!isOpen) {
      setStage('opening');
      return;
    }

    // Opening animation (2s)
    const openTimer = setTimeout(() => {
      setStage('revealing');
      // Play reveal sound effect
      playRevealSound();
    }, 2000);

    // Complete animation (4s total)
    const completeTimer = setTimeout(() => {
      setStage('complete');
    }, 4000);

    // Close modal (6s total)
    const closeTimer = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
      clearTimeout(closeTimer);
    };
  }, [isOpen, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="relative w-full max-w-md aspect-square">
            {/* Glass Cylinder */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Cylinder body */}
              <div className="relative w-64 h-96">
                {/* Top cap */}
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full bg-gradient-to-b from-white/20 to-white/5 border border-white/30"
                  animate={stage === 'opening' ? { y: -100, opacity: 0 } : {}}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />

                {/* Glass body */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-80 bg-gradient-to-b from-white/10 to-white/5 border-x border-white/20 backdrop-blur-md">
                  {/* Fog effect */}
                  <AnimatePresence>
                    {stage === 'revealing' && (
                      <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 0.8, 0], y: -300 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                        className="absolute inset-0 bg-gradient-to-t from-purple-500/50 via-blue-500/30 to-transparent blur-xl"
                      />
                    )}
                  </AnimatePresence>

                  {/* NFT reveal */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <AnimatePresence>
                      {stage !== 'opening' && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0, rotateY: 0 }}
                          animate={{ 
                            scale: 1, 
                            opacity: 1,
                            rotateY: 360
                          }}
                          transition={{ 
                            duration: 1.5,
                            ease: 'easeOut'
                          }}
                          className="relative"
                        >
                          {nftImage ? (
                            <img
                              src={nftImage}
                              alt="Minted NFT"
                              className="w-32 h-32 rounded-lg object-cover shadow-2xl"
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-2xl" />
                          )}
                          
                          {/* Glow effect */}
                          <motion.div
                            className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/50 to-blue-500/50 blur-2xl -z-10"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom cap */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full bg-gradient-to-t from-white/20 to-white/5 border border-white/30" />
              </div>
            </motion.div>

            {/* Success message */}
            <AnimatePresence>
              {stage === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center"
                >
                  <div className="flex items-center gap-2 text-white">
                    <Check className="w-6 h-6 text-green-500" />
                    <span className="text-xl font-semibold">NFT Minted Successfully!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function playRevealSound() {
  // Create a simple reveal sound using Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create oscillator for a "whoosh" sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}
