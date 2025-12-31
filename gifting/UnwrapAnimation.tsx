import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnwrapAnimationProps {
  isOpen: boolean;
  onComplete: () => void;
  tokenId: number;
  tokenUri: string;
  message?: string;
  senderAddress: string;
}

export default function UnwrapAnimation({
  isOpen,
  onComplete,
  tokenId,
  tokenUri,
  message,
  senderAddress,
}: UnwrapAnimationProps) {
  const [stage, setStage] = useState<'wrapped' | 'unwrapping' | 'revealed'>('wrapped');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStage('wrapped');
      setShowMessage(false);
    }
  }, [isOpen]);

  const handleUnwrap = () => {
    setStage('unwrapping');

    // Trigger confetti after a delay
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9333ea', '#ec4899', '#f59e0b'],
      });

      setStage('revealed');

      // Show message if available
      if (message) {
        setTimeout(() => setShowMessage(true), 500);
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <AnimatePresence mode="wait">
        {stage === 'wrapped' && (
          <motion.div
            key="wrapped"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{
                rotate: [0, -5, 5, -5, 5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="relative inline-block"
            >
              <div className="w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Gift className="w-32 h-32 text-white" />
              </div>

              {/* Sparkles */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute -top-4 -right-4"
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
                className="absolute -bottom-4 -left-4"
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </motion.div>

            <h2 className="text-3xl font-bold text-white mt-8 mb-4">
              You've Received a Gift!
            </h2>
            <p className="text-gray-300 mb-2">
              From: {senderAddress.slice(0, 6)}...{senderAddress.slice(-4)}
            </p>

            <button
              onClick={handleUnwrap}
              className="mt-6 px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Unwrap Gift
            </button>
          </motion.div>
        )}

        {stage === 'unwrapping' && (
          <motion.div
            key="unwrapping"
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.2, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 1 }}
            className="w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <Gift className="w-32 h-32 text-white" />
          </motion.div>
        )}

        {stage === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  NFT #{tokenId}
                </h2>
                <p className="text-gray-600">
                  From: {senderAddress.slice(0, 6)}...{senderAddress.slice(-4)}
                </p>
              </div>

              {/* NFT Preview */}
              <div className="bg-gray-100 rounded-2xl p-4 mb-6">
                <img
                  src={tokenUri}
                  alt={`NFT #${tokenId}`}
                  className="w-full h-64 object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.pexels.com/photos/17485871/pexels-photo-17485871.png?auto=compress&cs=tinysrgb&h=650&w=940`;
                  }}
                />
              </div>

              {/* Message */}
              <AnimatePresence>
                {showMessage && message && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 mb-6"
                  >
                    <h3 className="font-bold text-purple-900 mb-2">
                      Personal Message
                    </h3>
                    <p className="text-purple-700 italic">"{message}"</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-green-800 text-center font-medium">
                  🎉 You earned 100 XP for unwrapping a gift!
                </p>
              </div>

              <button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                View in Gallery
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
