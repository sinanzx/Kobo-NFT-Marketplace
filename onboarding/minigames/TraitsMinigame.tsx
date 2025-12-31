import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { duration, spring } from '@/lib/animationConfig';

interface TraitsMinigameProps {
  onComplete: () => void;
}

const traits = [
  { id: 'glow', name: 'Cosmic Glow', votes: 0, icon: '✨' },
  { id: 'wings', name: 'Energy Wings', votes: 0, icon: '🦋' },
  { id: 'aura', name: 'Power Aura', votes: 0, icon: '💫' },
];

export default function TraitsMinigame({ onComplete }: TraitsMinigameProps) {
  const [step, setStep] = useState<'intro' | 'vote' | 'evolve' | 'complete'>('intro');
  const [traitVotes, setTraitVotes] = useState(traits);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [nftState, setNftState] = useState('base');

  const handleVote = (traitId: string) => {
    setSelectedTrait(traitId);
    setTraitVotes(prev =>
      prev.map(trait =>
        trait.id === traitId ? { ...trait, votes: trait.votes + 1 } : trait
      )
    );
  };

  const handleSubmitVote = () => {
    setStep('evolve');
    setTimeout(() => {
      const winningTrait = traitVotes.reduce((prev, current) =>
        current.votes > prev.votes ? current : prev
      );
      setNftState(winningTrait.id);
      setStep('complete');
      setTimeout(onComplete, 2500);
    }, 2000);
  };

  return (
    <GlassCard className="p-8 rounded-3xl max-w-2xl w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-8 h-8 text-blue-400" />
          <h3 className="text-3xl font-bold text-white">Dynamic Traits Quest</h3>
        </div>
        <p className="text-gray-400">
          {step === 'intro' && 'Learn how NFTs evolve based on community votes'}
          {step === 'vote' && 'Vote for your favorite trait evolution'}
          {step === 'evolve' && 'Watch the NFT transform in real-time'}
          {step === 'complete' && 'Evolution complete!'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-6"
          >
            {/* NFT Preview */}
            <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-8xl"
              >
                🎭
              </motion.div>
              <div className="absolute top-4 right-4 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <span className="text-blue-400 text-sm font-semibold">Base Form</span>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-white font-semibold mb-1">Community Driven</div>
                <div className="text-gray-400 text-sm">Traits evolve based on votes</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <Sparkles className="w-6 h-6 text-pink-400 mb-2" />
                <div className="text-white font-semibold mb-1">On-Chain Events</div>
                <div className="text-gray-400 text-sm">Triggered by blockchain data</div>
              </div>
            </div>

            <AnimatedButton onClick={() => setStep('vote')} className="w-full" size="lg">
              Start Voting
              <Zap className="w-5 h-5" />
            </AnimatedButton>
          </motion.div>
        )}

        {step === 'vote' && (
          <motion.div
            key="vote"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-6"
          >
            {/* Current NFT */}
            <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
              <div className="text-6xl">🎭</div>
            </div>

            {/* Trait Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Users className="w-4 h-4" />
                <span>Vote for the next evolution</span>
              </div>
              
              {traitVotes.map((trait, i) => (
                <motion.button
                  key={trait.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleVote(trait.id)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedTrait === trait.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{trait.icon}</div>
                      <div className="text-left">
                        <div className="text-white font-semibold">{trait.name}</div>
                        <div className="text-gray-400 text-sm">{trait.votes} votes</div>
                      </div>
                    </div>
                    {selectedTrait === trait.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ ...spring.bouncy }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-purple-400" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <AnimatedButton
              onClick={handleSubmitVote}
              disabled={!selectedTrait}
              className="w-full"
              size="lg"
            >
              Submit Vote
              <TrendingUp className="w-5 h-5" />
            </AnimatedButton>
          </motion.div>
        )}

        {step === 'evolve' && (
          <motion.div
            key="evolve"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🎭
            </motion.div>

            <div className="space-y-2">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-bold text-white"
              >
                Evolving...
              </motion.div>
              <p className="text-gray-400">Community votes are being processed</p>
            </div>

            <div className="mt-8 flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-3 h-3 bg-purple-500 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring.bouncy }}
            className="space-y-6"
          >
            {/* Evolved NFT */}
            <div className="relative h-64 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl overflow-hidden flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...spring.bouncy }}
                className="relative"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl"
                />
                <div className="relative text-8xl">
                  {nftState === 'glow' && '✨🎭✨'}
                  {nftState === 'wings' && '🦋🎭🦋'}
                  {nftState === 'aura' && '💫🎭💫'}
                </div>
              </motion.div>
              <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="text-green-400 text-sm font-semibold">Evolved!</span>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-2xl font-bold text-white mb-2">Evolution Complete!</h4>
              <p className="text-gray-400 mb-4">
                Your NFT has evolved with{' '}
                <span className="text-purple-400 font-semibold">
                  {traitVotes.find(t => t.id === nftState)?.name}
                </span>
              </p>

              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold">Dynamic Trait Unlocked</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
