import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, User, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { FogLayer, GlowOrb, ParticleSystem } from '@/components/effects/AtmosphericEffects';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to Kōbo',
    description: 'Create AI-powered NFTs with provenance tracking and social features',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Connect Your Wallet',
    description: 'Securely connect your wallet to start minting and collecting',
    icon: Wallet,
  },
  {
    id: 3,
    title: 'Set Up Your Profile',
    description: 'Personalize your creator profile and showcase your work',
    icon: User,
  },
  {
    id: 4,
    title: 'You\'re All Set!',
    description: 'Start creating your first AI-powered NFT',
    icon: CheckCircle2,
  },
];

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
      {/* Atmospheric Effects */}
      <FogLayer />
      <ParticleSystem count={30} />
      <GlowOrb color="purple" size="lg" position="top-left" />
      <GlowOrb color="pink" size="md" position="bottom-right" />

      <div className="relative z-10 w-full max-w-2xl px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-12 rounded-3xl text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1 
                }}
                className="mb-8 flex justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50"
                  />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-white mb-4"
              >
                {step.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-400 mb-8 max-w-md mx-auto"
              >
                {step.description}
              </motion.p>

              {/* Step-specific Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                {currentStep === 1 && (
                  <div className="grid grid-cols-3 gap-4">
                    {['MetaMask', 'WalletConnect', 'Coinbase'].map((wallet, i) => (
                      <motion.button
                        key={wallet}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mx-auto mb-2" />
                        <p className="text-sm text-white font-medium">{wallet}</p>
                      </motion.button>
                    ))}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4 max-w-md mx-auto">
                    <input
                      type="text"
                      placeholder="Display Name"
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                    />
                    <textarea
                      placeholder="Bio (optional)"
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none resize-none"
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex justify-center"
                  >
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-50"
                      />
                      <CheckCircle2 className="relative w-24 h-24 text-green-500" />
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Navigation Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 justify-center"
              >
                {currentStep > 0 && (
                  <GlassButton
                    variant="glass"
                    size="lg"
                    onClick={handlePrev}
                  >
                    Back
                  </GlassButton>
                )}
                <GlassButton
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  className="min-w-[200px]"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Get Started
                      <Sparkles className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </GlassButton>
              </motion.div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Step Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-2 mt-8"
        >
          {steps.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentStep ? 1 : -1);
                setCurrentStep(index);
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 w-8'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
