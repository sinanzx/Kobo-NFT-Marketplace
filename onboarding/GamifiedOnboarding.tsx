import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Trophy, Target, Zap, Gift, Star, 
  Rocket, Wand2, Users, Palette, ArrowRight,
  CheckCircle2, Lock, Play, Award, Coins
} from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { FogLayer, GlowOrb, ParticleSystem } from '@/components/effects/AtmosphericEffects';
import { AnimatedButton } from '@/components/ui/animated-button';
import { duration, easing, spring } from '@/lib/animationConfig';
import MintMinigame from './minigames/MintMinigame';
import CollabMinigame from './minigames/CollabMinigame';
import TraitsMinigame from './minigames/TraitsMinigame';
import ARViewer from './ARViewer';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  points: number;
  unlocked: boolean;
}

interface GameStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  minigame: 'mint' | 'collab' | 'traits' | 'ar-preview' | null;
  reward: Achievement;
}

const gameSteps: GameStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Kōbo Universe',
    subtitle: 'Your AI-Powered NFT Adventure Begins',
    description: 'Embark on an interactive journey to master NFT creation, collaboration, and dynamic traits!',
    icon: Rocket,
    minigame: null,
    reward: {
      id: 'explorer',
      title: 'Explorer',
      description: 'Started your Kōbo journey',
      icon: Star,
      points: 10,
      unlocked: false,
    },
  },
  {
    id: 'mint-tutorial',
    title: 'Mint Your First NFT',
    subtitle: 'Create AI-Powered Art',
    description: 'Learn to generate and mint your first AI-powered NFT with provenance tracking',
    icon: Wand2,
    minigame: 'mint',
    reward: {
      id: 'creator',
      title: 'Creator',
      description: 'Minted your first NFT',
      icon: Sparkles,
      points: 50,
      unlocked: false,
    },
  },
  {
    id: 'collab-tutorial',
    title: 'Join a Collaboration',
    subtitle: 'Create Together',
    description: 'Experience collaborative minting and create art with the community',
    icon: Users,
    minigame: 'collab',
    reward: {
      id: 'collaborator',
      title: 'Collaborator',
      description: 'Joined your first collab session',
      icon: Users,
      points: 75,
      unlocked: false,
    },
  },
  {
    id: 'traits-tutorial',
    title: 'Test Dynamic Traits',
    subtitle: 'Evolving NFTs',
    description: 'Discover how NFTs evolve based on community votes and on-chain events',
    icon: Palette,
    minigame: 'traits',
    reward: {
      id: 'innovator',
      title: 'Innovator',
      description: 'Mastered dynamic traits',
      icon: Zap,
      points: 100,
      unlocked: false,
    },
  },
  {
    id: 'ar-preview',
    title: 'AR/VR Gallery Preview',
    subtitle: 'Immersive Experience',
    description: 'View your NFTs in an immersive AR/VR gallery (mobile & web)',
    icon: Target,
    minigame: 'ar-preview',
    reward: {
      id: 'visionary',
      title: 'Visionary',
      description: 'Explored the AR/VR gallery',
      icon: Trophy,
      points: 150,
      unlocked: false,
    },
  },
];

export default function GamifiedOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(
    gameSteps.map(step => step.reward)
  );
  const [totalPoints, setTotalPoints] = useState(0);
  const [showMinigame, setShowMinigame] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const currentStep = gameSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / gameSteps.length) * 100;

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => 
      prev.map(ach => 
        ach.id === achievementId ? { ...ach, unlocked: true } : ach
      )
    );
    
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      setTotalPoints(prev => prev + achievement.points);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }
  };

  const handleStepComplete = () => {
    unlockAchievement(currentStep.reward.id);
    
    setTimeout(() => {
      if (currentStepIndex < gameSteps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setShowMinigame(false);
      } else {
        onComplete();
      }
    }, 1500);
  };

  const handleStartMinigame = () => {
    if (currentStep.minigame) {
      setShowMinigame(true);
    } else {
      handleStepComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 overflow-hidden">
      {/* Atmospheric Effects */}
      <FogLayer />
      <ParticleSystem count={50} />
      <GlowOrb color="purple" size="lg" position="top-left" />
      <GlowOrb color="pink" size="md" position="bottom-right" />
      <GlowOrb color="purple" size="sm" position="top-right" />

      {/* Confetti Effect */}
      <AnimatePresence>
        {confetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-50"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: '50%', 
                  y: '50%',
                  scale: 0,
                  rotate: 0,
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{ 
                  duration: 2,
                  ease: 'easeOut',
                  delay: Math.random() * 0.3,
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#a855f7', '#ec4899', '#3b82f6', '#10b981'][Math.floor(Math.random() * 4)],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-6xl px-4 h-full flex flex-col justify-center">
        {/* Header with Points & Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full"
              >
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">{totalPoints}</span>
                <span className="text-sm text-gray-400">XP</span>
              </motion.div>
              
              <div className="flex gap-1">
                {achievements.filter(a => a.unlocked).map((ach, i) => (
                  <motion.div
                    key={ach.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      ...spring.bouncy,
                      delay: i * 0.1,
                    }}
                    className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                  >
                    <ach.icon className="w-5 h-5 text-white" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-400">Quest Progress</div>
              <div className="text-2xl font-bold text-white">{currentStepIndex + 1}/{gameSteps.length}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: easing.easeOut }}
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!showMinigame ? (
            <motion.div
              key={`step-${currentStepIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: duration.normal }}
              className="flex-1 flex items-center justify-center"
            >
              <GlassCard className="p-12 rounded-3xl max-w-3xl w-full">
                {/* Step Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    ...spring.bouncy,
                    delay: 0.1,
                  }}
                  className="mb-8 flex justify-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-2xl opacity-60"
                    />
                    <div className="relative w-32 h-32 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-full flex items-center justify-center">
                      <currentStep.icon className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="text-sm font-semibold text-purple-400 mb-2 uppercase tracking-wider">
                    {currentStep.subtitle}
                  </div>
                  <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    {currentStep.title}
                  </h2>
                  <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                    {currentStep.description}
                  </p>

                  {/* Reward Preview */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-full mb-8"
                  >
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Unlock: {currentStep.reward.title}</span>
                    <span className="text-yellow-400 font-bold">+{currentStep.reward.points} XP</span>
                  </motion.div>

                  {/* Action Button */}
                  <AnimatedButton
                    onClick={handleStartMinigame}
                    size="lg"
                    className="min-w-[250px] text-lg"
                  >
                    {currentStep.minigame ? (
                      <>
                        <Play className="w-6 h-6" />
                        Start Quest
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-6 h-6" />
                      </>
                    )}
                  </AnimatedButton>
                </motion.div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key={`minigame-${currentStepIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: duration.normal }}
              className="flex-1 flex items-center justify-center"
            >
              {currentStep.minigame === 'mint' && (
                <MintMinigame onComplete={handleStepComplete} />
              )}
              {currentStep.minigame === 'collab' && (
                <CollabMinigame onComplete={handleStepComplete} />
              )}
              {currentStep.minigame === 'traits' && (
                <TraitsMinigame onComplete={handleStepComplete} />
              )}
              {currentStep.minigame === 'ar-preview' && (
                <ARViewer onComplete={handleStepComplete} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-3 mt-6"
        >
          {gameSteps.map((step, index) => {
            const isCompleted = achievements[index]?.unlocked;
            const isCurrent = index === currentStepIndex;
            const isLocked = index > currentStepIndex;

            return (
              <motion.div
                key={step.id}
                whileHover={!isLocked ? { scale: 1.2 } : {}}
                className="relative"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-400'
                      : isCurrent
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400 animate-pulse'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-gray-500" />
                  ) : (
                    <step.icon className="w-5 h-5 text-white" />
                  )}
                </div>
                {isCurrent && (
                  <motion.div
                    layoutId="current-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full"
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
