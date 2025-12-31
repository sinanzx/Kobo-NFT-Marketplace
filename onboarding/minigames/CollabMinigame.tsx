import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Palette, CheckCircle2, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { duration, spring } from '@/lib/animationConfig';

interface CollabMinigameProps {
  onComplete: () => void;
}

const mockCollaborators = [
  { id: 1, name: 'Alice', avatar: '🎨', contribution: 'Background' },
  { id: 2, name: 'Bob', avatar: '🖌️', contribution: 'Character' },
  { id: 3, name: 'You', avatar: '✨', contribution: 'Effects' },
];

export default function CollabMinigame({ onComplete }: CollabMinigameProps) {
  const [step, setStep] = useState<'join' | 'contribute' | 'complete'>('join');
  const [activeCollaborators, setActiveCollaborators] = useState<typeof mockCollaborators>([]);
  const [contribution, setContribution] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (step === 'contribute' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  const handleJoin = () => {
    setActiveCollaborators([mockCollaborators[0], mockCollaborators[1]]);
    setTimeout(() => {
      setActiveCollaborators(mockCollaborators);
      setStep('contribute');
    }, 1000);
  };

  const handleContribute = () => {
    if (!contribution.trim()) return;
    setStep('complete');
    setTimeout(onComplete, 2000);
  };

  return (
    <GlassCard className="p-8 rounded-3xl max-w-2xl w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="w-8 h-8 text-pink-400" />
          <h3 className="text-3xl font-bold text-white">Collaboration Quest</h3>
        </div>
        <p className="text-gray-400">
          {step === 'join' && 'Join an active collaboration session'}
          {step === 'contribute' && 'Add your creative contribution'}
          {step === 'complete' && 'Collaboration complete!'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-6"
          >
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">Cosmic Dreamscape</h4>
                  <p className="text-gray-400 text-sm">Collaborative NFT Session</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-semibold">Live</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  {mockCollaborators.slice(0, 2).map((collab, i) => (
                    <motion.div
                      key={collab.id}
                      initial={{ scale: 0, x: -20 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl border-2 border-gray-900"
                    >
                      {collab.avatar}
                    </motion.div>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  2 creators • 1 spot left
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Session ends in 5 minutes</span>
              </div>
            </div>

            <AnimatedButton onClick={handleJoin} className="w-full" size="lg">
              <UserPlus className="w-5 h-5" />
              Join Collaboration
            </AnimatedButton>
          </motion.div>
        )}

        {step === 'contribute' && (
          <motion.div
            key="contribute"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-6"
          >
            {/* Active Collaborators */}
            <div className="grid grid-cols-3 gap-4">
              {activeCollaborators.map((collab, i) => (
                <motion.div
                  key={collab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-xl text-center ${
                    collab.name === 'You'
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="text-4xl mb-2">{collab.avatar}</div>
                  <div className="text-white font-semibold text-sm">{collab.name}</div>
                  <div className="text-gray-400 text-xs mt-1">{collab.contribution}</div>
                </motion.div>
              ))}
            </div>

            {/* Canvas Preview */}
            <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl overflow-hidden">
              <motion.div
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                  ],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute inset-0"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Palette className="w-12 h-12 text-purple-400 opacity-50" />
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-lg font-mono">{timeLeft}s remaining</span>
            </div>

            {/* Contribution Input */}
            <div className="space-y-3">
              <label className="text-sm text-gray-400">Add your creative touch:</label>
              <textarea
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                placeholder="Describe your contribution (e.g., 'Add glowing particles')"
                className="w-full h-24 px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none resize-none"
              />
            </div>

            <AnimatedButton
              onClick={handleContribute}
              disabled={!contribution.trim()}
              className="w-full"
              size="lg"
            >
              <Palette className="w-5 h-5" />
              Submit Contribution
            </AnimatedButton>
          </motion.div>
        )}

        {step === 'complete' && (
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
                  className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-50"
                />
                <CheckCircle2 className="relative w-24 h-24 text-green-400" />
              </div>
            </motion.div>

            <h4 className="text-3xl font-bold text-white mb-2">Collaboration Complete!</h4>
            <p className="text-gray-400 mb-6">Your contribution has been added to the NFT</p>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">3 Collaborators</span>
              <span className="text-gray-400">•</span>
              <span className="text-purple-400">Equal ownership</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
