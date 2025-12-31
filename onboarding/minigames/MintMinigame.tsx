import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, Image, CheckCircle2, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { duration, spring } from '@/lib/animationConfig';

interface MintMinigameProps {
  onComplete: () => void;
}

const tutorialSteps = [
  {
    id: 'prompt',
    title: 'Enter Your Prompt',
    description: 'Describe the NFT you want to create',
    action: 'Type a creative prompt',
  },
  {
    id: 'generate',
    title: 'Generate AI Art',
    description: 'Watch AI bring your vision to life',
    action: 'Generate',
  },
  {
    id: 'mint',
    title: 'Mint Your NFT',
    description: 'Publish to the blockchain with provenance',
    action: 'Mint NFT',
  },
];

export default function MintMinigame({ onComplete }: MintMinigameProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const step = tutorialSteps[currentStep];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedImage('https://images.pexels.com/photos/18069161/pexels-photo-18069161.png?auto=compress&cs=tinysrgb&h=650&w=940');
      setIsGenerating(false);
      setCurrentStep(2);
    }, 2000);
  };

  const handleMint = () => {
    setIsMinting(true);
    // Simulate minting
    setTimeout(() => {
      setIsMinting(false);
      onComplete();
    }, 2000);
  };

  const handleAction = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      handleGenerate();
    } else if (currentStep === 2) {
      handleMint();
    }
  };

  return (
    <GlassCard className="p-8 rounded-3xl max-w-2xl w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wand2 className="w-8 h-8 text-purple-400" />
          <h3 className="text-3xl font-bold text-white">Mint Quest</h3>
        </div>
        <p className="text-gray-400">{step.description}</p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex justify-center gap-4 mb-8">
        {tutorialSteps.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <motion.div
              animate={{
                scale: index === currentStep ? 1.2 : 1,
                backgroundColor: index <= currentStep ? '#a855f7' : '#374151',
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            >
              {index < currentStep ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                index + 1
              )}
            </motion.div>
            {index < tutorialSteps.length - 1 && (
              <div className={`w-12 h-1 mx-2 ${index < currentStep ? 'bg-purple-500' : 'bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Interactive Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: duration.normal }}
          className="mb-8"
        >
          {currentStep === 0 && (
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A mystical dragon in a cyberpunk city..."
                className="w-full h-32 px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none resize-none"
              />
              <div className="flex gap-2 flex-wrap">
                {['Mystical Dragon', 'Cyber Samurai', 'Space Explorer'].map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPrompt(suggestion)}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 hover:bg-purple-500/30 transition-all"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="flex flex-col items-center justify-center py-12">
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-16 h-16 text-purple-400" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...spring.bouncy }}
                  className="text-center"
                >
                  <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-xl text-white font-semibold">Ready to Generate!</p>
                  <p className="text-gray-400 mt-2">Prompt: "{prompt}"</p>
                </motion.div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring.smooth }}
                  className="relative rounded-xl overflow-hidden"
                >
                  <img 
                    src={generatedImage} 
                    alt="Generated NFT" 
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-white font-bold text-lg mb-1">Your AI Creation</h4>
                    <p className="text-gray-300 text-sm">Ready to mint with full provenance</p>
                  </div>
                </motion.div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-gray-400">Provenance</div>
                  <div className="text-white font-semibold">Tracked</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-gray-400">Copyright</div>
                  <div className="text-green-400 font-semibold">Verified</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action Button */}
      <AnimatedButton
        onClick={handleAction}
        disabled={currentStep === 0 && !prompt.trim() || isGenerating || isMinting}
        className="w-full"
        size="lg"
      >
        {isGenerating || isMinting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isGenerating ? 'Generating...' : 'Minting...'}
          </>
        ) : (
          <>
            {step.action}
            {currentStep === 2 && <Sparkles className="w-5 h-5" />}
          </>
        )}
      </AnimatedButton>
    </GlassCard>
  );
}
