import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { TourStep } from '@/hooks/useFeatureTour';

interface FeatureTourProps {
  isActive: boolean;
  currentStep: number;
  currentStepData: TourStep;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export const FeatureTour = ({
  isActive,
  currentStep,
  currentStepData,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: FeatureTourProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    // Find the target element
    const target = document.querySelector(currentStepData.target);
    targetRef.current = target;

    if (target) {
      // Scroll target into view
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Add highlight class
      target.classList.add('tour-highlight');
    }

    return () => {
      if (targetRef.current) {
        targetRef.current.classList.remove('tour-highlight');
      }
    };
  }, [isActive, currentStepData]);

  useEffect(() => {
    if (!isActive || !tooltipRef.current || !targetRef.current) return;

    const updatePosition = () => {
      const target = targetRef.current;
      const tooltip = tooltipRef.current;
      if (!target || !tooltip) return;

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const position = currentStepData.position || 'bottom';

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 16;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + 16;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - 16;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + 16;
          break;
      }

      // Keep tooltip within viewport
      const padding = 16;
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStepData]);

  if (!isActive || !currentStepData) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[100]"
        onClick={onSkip}
        aria-hidden="true"
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-[101] w-full max-w-sm"
          role="dialog"
          aria-labelledby="tour-title"
          aria-describedby="tour-description"
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" aria-hidden="true" />
                <span className="text-sm text-gray-400" role="status" aria-live="polite">
                  Step {currentStep + 1} of {totalSteps}
                </span>
              </div>
              <button
                onClick={onSkip}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close tour"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <h3 id="tour-title" className="text-xl font-bold text-white mb-2">
              {currentStepData.title}
            </h3>
            <p id="tour-description" className="text-gray-300 mb-6">
              {currentStepData.description}
            </p>

            {/* Action Button */}
            {currentStepData.action && (
              <div className="mb-4">
                <GlassButton
                  onClick={currentStepData.action.onClick}
                  className="w-full"
                  aria-label={currentStepData.action.label}
                >
                  {currentStepData.action.label}
                </GlassButton>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={onPrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous step"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Previous
              </button>

              <div className="flex gap-1" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps} aria-label="Tour progress">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep
                        ? 'w-8 bg-purple-500'
                        : i < currentStep
                        ? 'w-1.5 bg-purple-500/50'
                        : 'w-1.5 bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={onNext}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                aria-label={currentStep === totalSteps - 1 ? 'Finish tour' : 'Next step'}
              >
                {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Global styles for highlight effect */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 101;
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          border-radius: 12px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};
