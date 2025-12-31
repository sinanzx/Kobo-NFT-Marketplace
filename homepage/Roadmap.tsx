import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  cardRevealVariants,
  hoverLift,
  spring,
  createStaggerDelay,
} from '@/lib/animationConfig';
import { 
  Rocket, 
  Zap, 
  Shield, 
  Users, 
  Globe, 
  Glasses,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock
} from 'lucide-react';

interface Milestone {
  phase: number;
  title: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  features: string[];
  deliverables: string[];
}

const roadmapData: Milestone[] = [
  {
    phase: 1,
    title: 'MVP Foundation',
    duration: 'Months 1-3',
    status: 'in-progress',
    icon: Rocket,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Smart contract deployment (ERC-721 + ERC-2981)',
      'Supabase backend with authentication',
      'AI-powered image generation (Hugging Face)',
      'Basic minting interface',
      'Wallet integration (RainbowKit)',
      'Responsive web interface'
    ],
    deliverables: [
      'Working NFT minting platform',
      'User authentication system',
      'Basic provenance tracking',
      'Testnet deployment'
    ]
  },
  {
    phase: 2,
    title: 'Dynamic NFTs & Multi-Modal',
    duration: 'Months 4-6',
    status: 'upcoming',
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    features: [
      'ERC-7160 multi-metadata standard',
      'Dynamic trait evolution system',
      'Audio NFTs (Eleven Labs)',
      'Video NFTs (Runway ML)',
      'Trait marketplace',
      'Gamification & achievements'
    ],
    deliverables: [
      'Dynamic trait system',
      'Audio/video NFT support',
      'Trait evolution mechanics',
      'Leaderboards & challenges'
    ]
  },
  {
    phase: 3,
    title: 'Copyright Engine & Provenance',
    duration: 'Months 7-9',
    status: 'upcoming',
    icon: Shield,
    color: 'from-green-500 to-emerald-500',
    features: [
      'AI-powered copyright detection',
      'Content fingerprinting',
      'Provenance chain tracking',
      'Remix & derivative attribution',
      'Creator verification system',
      'Legal compliance tools'
    ],
    deliverables: [
      'Copyright audit dashboard',
      'Provenance visualization',
      'Remix genealogy tree',
      'Authenticity certificates'
    ]
  },
  {
    phase: 4,
    title: 'Social Features & DAO',
    duration: 'Months 10-12',
    status: 'upcoming',
    icon: Users,
    color: 'from-orange-500 to-red-500',
    features: [
      'NFT gifting system',
      'Multi-creator collaborations',
      'NFT battles & voting',
      'Community leaderboards',
      'DAO governance (ERC-20)',
      'Proposal & treasury management'
    ],
    deliverables: [
      'Social gifting platform',
      'Battle arena',
      'DAO governance portal',
      'Community-driven features'
    ]
  },
  {
    phase: 5,
    title: 'Cross-Chain Expansion',
    duration: 'Months 13-15',
    status: 'upcoming',
    icon: Globe,
    color: 'from-indigo-500 to-blue-500',
    features: [
      'LayerZero/Wormhole bridge',
      'Multi-chain deployments (Polygon, Arbitrum, Optimism, BSC)',
      'Unified cross-chain gallery',
      'Chain-agnostic marketplace',
      'Layer 2 optimization',
      'Gas cost reduction'
    ],
    deliverables: [
      'Multi-chain support',
      'Cross-chain bridge',
      'Unified NFT experience',
      'Optimized infrastructure'
    ]
  },
  {
    phase: 6,
    title: 'AR/VR & Metaverse',
    duration: 'Months 16-18',
    status: 'upcoming',
    icon: Glasses,
    color: 'from-pink-500 to-rose-500',
    features: [
      '3D NFT support (glTF/GLB)',
      'AR mobile viewer (AR.js)',
      'WebXR VR gallery',
      'Metaverse integrations (Decentraland, Sandbox)',
      'AI-generated 3D models',
      'Spatial audio & immersive navigation'
    ],
    deliverables: [
      '3D NFT platform',
      'AR mobile experience',
      'VR gallery',
      'Metaverse presence'
    ]
  },
  {
    phase: 7,
    title: 'Advanced AI & Enterprise',
    duration: 'Months 19-21',
    status: 'upcoming',
    icon: Sparkles,
    color: 'from-yellow-500 to-amber-500',
    features: [
      'Interactive onboarding tutorials',
      'AI recommendation engine',
      'GPT-4 prompt assistance',
      'Automated workflows',
      'White-label solutions',
      'Developer API & SDK'
    ],
    deliverables: [
      'Intelligent onboarding',
      'Advanced AI features',
      'Enterprise solutions',
      'Platform v2.0 release'
    ]
  }
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Completed'
  },
  'in-progress': {
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'In Progress'
  },
  upcoming: {
    icon: Circle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    label: 'Upcoming'
  }
};

export default function Roadmap() {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  return (
    <section className="py-28 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[130px] pointer-events-none" />
      
      {/* Animated grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] opacity-50" />
      
      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-primary/20 rounded-full blur-sm"
            style={{
              left: `${15 + i * 12}%`,
              top: `${20 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={spring.default}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <Rocket className="w-12 h-12 text-primary drop-shadow-[0_0_16px_rgba(var(--primary-rgb),0.7)]" />
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Platform Roadmap
            </h2>
          </motion.div>
          
          <motion.p 
            className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Our journey from MVP to a comprehensive, multi-chain AI-powered NFT ecosystem
          </motion.p>
          
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm shadow-lg shadow-primary/20"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-base text-primary font-semibold">21-Month Development Timeline</span>
          </motion.div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 via-accent/60 to-primary/60 rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" />

          {/* Milestones */}
          <motion.div 
            className="space-y-12"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {roadmapData.map((milestone, index) => {
              const Icon = milestone.icon;
              const StatusIcon = statusConfig[milestone.status].icon;
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={milestone.phase}
                  variants={staggerItemVariants}
                  custom={isLeft ? -1 : 1}
                  viewport={{ once: true }}
                  className={`relative flex items-center ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col`}
                >
                  {/* Timeline Node */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      whileHover={{ scale: 1.4, rotate: 360 }}
                      whileTap={{ scale: 0.85 }}
                      transition={spring.bouncy}
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${milestone.color} p-1 shadow-2xl shadow-primary/40`}
                    >
                      <div className="w-full h-full rounded-full bg-background/95 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                          initial={{ rotate: 0 }}
                          whileHover={{ rotate: -360 }}
                          transition={spring.bouncy}
                          className="relative z-10"
                        >
                          <Icon className="w-9 h-9 text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Content Card */}
                  <motion.div
                    whileHover={hoverLift}
                    transition={spring.snappy}
                    onClick={() => setSelectedPhase(selectedPhase === milestone.phase ? null : milestone.phase)}
                    className={`w-full md:w-[calc(50%-4rem)] ml-24 md:ml-0 ${
                      isLeft ? 'md:mr-auto md:pr-16' : 'md:ml-auto md:pl-16'
                    } cursor-pointer`}
                  >
                    <div className="bg-background/60 backdrop-blur-md border border-primary/20 rounded-2xl p-8 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-base font-bold text-primary">
                              Phase {milestone.phase}
                            </span>
                            <span className="text-sm text-foreground/40">•</span>
                            <span className="text-base text-foreground/60 font-medium">{milestone.duration}</span>
                          </div>
                          <h3 className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {milestone.title}
                          </h3>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig[milestone.status].bgColor} border border-primary/20 shadow-lg`}>
                          <StatusIcon className={`w-5 h-5 ${statusConfig[milestone.status].color}`} />
                          <span className={`text-sm font-semibold ${statusConfig[milestone.status].color}`}>
                            {statusConfig[milestone.status].label}
                          </span>
                        </div>
                      </div>

                      {/* Features Preview */}
                      <div className="space-y-3 mb-6">
                        {milestone.features.slice(0, 3).map((feature, idx) => (
                          <motion.div 
                            key={idx} 
                            className="flex items-start gap-3 text-base text-foreground/70"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">{feature}</span>
                          </motion.div>
                        ))}
                        {milestone.features.length > 3 && (
                          <button className="text-base text-primary hover:text-accent transition-colors font-medium flex items-center gap-2 group/btn">
                            <span>+{milestone.features.length - 3} more features</span>
                            <motion.span
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              →
                            </motion.span>
                          </button>
                        )}
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {selectedPhase === milestone.phase && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-primary/20 pt-6 mt-6"
                          >
                            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-primary" />
                              Key Deliverables
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {milestone.deliverables.map((deliverable, idx) => (
                                <motion.div 
                                  key={idx} 
                                  className="flex items-start gap-3 text-base text-foreground/70"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                >
                                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${milestone.color} mt-2 shadow-lg`} />
                                  <span className="leading-relaxed">{deliverable}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { label: 'Total Phases', value: '7', icon: Rocket },
            { label: 'Development Months', value: '21', icon: Clock },
            { label: 'Key Features', value: '40+', icon: Sparkles },
            { label: 'Blockchain Networks', value: '5+', icon: Globe }
          ].map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.08, y: -5 }}
                className="bg-gradient-to-br from-background/80 to-primary/5 backdrop-blur-md border border-primary/30 rounded-2xl p-8 text-center shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 group"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20 + index * 5, repeat: Infinity, ease: "linear" }}
                >
                  <StatIcon className="w-12 h-12 text-primary mx-auto mb-4 drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)] group-hover:drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.7)] transition-all" />
                </motion.div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{stat.value}</div>
                <div className="text-base text-foreground/60 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
