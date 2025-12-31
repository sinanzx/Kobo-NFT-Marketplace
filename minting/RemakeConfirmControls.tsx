import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, X, Sparkles } from 'lucide-react';
import { SciFiButton } from '@/components/ui/sci-fi-button';
import { useState } from 'react';

interface RemakeConfirmControlsProps {
  onRemake: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  remakeCount?: number;
  maxRemakes?: number;
  isGenerating?: boolean;
  showCancel?: boolean;
  className?: string;
}

export function RemakeConfirmControls({
  onRemake,
  onConfirm,
  onCancel,
  remakeCount = 0,
  maxRemakes = 5,
  isGenerating = false,
  showCancel = false,
  className,
}: RemakeConfirmControlsProps) {
  const [showRemakeHint, setShowRemakeHint] = useState(false);
  const canRemake = remakeCount < maxRemakes;

  return (
    <div className={className}>
      {/* Remake Counter */}
      <AnimatePresence>
        {remakeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-md">
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">
                Remake {remakeCount} of {maxRemakes}
              </span>
              {!canRemake && (
                <span className="ml-2 px-2 py-0.5 bg-orange-500/20 border border-orange-500/40 rounded text-xs text-orange-300">
                  Max reached
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        {/* Remake Button */}
        <div className="relative">
          <SciFiButton
            variant="remake"
            size="lg"
            onClick={onRemake}
            disabled={!canRemake || isGenerating}
            loading={isGenerating}
            onMouseEnter={() => setShowRemakeHint(true)}
            onMouseLeave={() => setShowRemakeHint(false)}
            className="min-w-[160px]"
            aria-label="Remake NFT"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Remake</span>
          </SciFiButton>

          {/* Remake Hint Tooltip */}
          <AnimatePresence>
            {showRemakeHint && canRemake && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/90 border border-purple-500/30 rounded-lg text-xs text-gray-300 whitespace-nowrap backdrop-blur-md"
              >
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Generate a new variation
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 border-r border-b border-purple-500/30 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Button */}
        <SciFiButton
          variant="confirm"
          size="lg"
          onClick={onConfirm}
          disabled={isGenerating}
          className="min-w-[160px]"
          aria-label="Confirm and mint NFT"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Confirm</span>
        </SciFiButton>

        {/* Cancel Button (Optional) */}
        {showCancel && onCancel && (
          <SciFiButton
            variant="cancel"
            size="lg"
            onClick={onCancel}
            disabled={isGenerating}
            className="min-w-[120px]"
            aria-label="Cancel minting"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </SciFiButton>
        )}
      </div>

      {/* Progress Indicator */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </motion.div>
                  Generating your masterpiece...
                </span>
              </div>
              
              {/* Animated progress bar */}
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ width: '50%' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility Announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {isGenerating && 'Generating new NFT variation'}
        {!canRemake && 'Maximum remake attempts reached'}
      </div>
    </div>
  );
}
