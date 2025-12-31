import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MousePointer, Clock, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { useNavigate } from 'react-router-dom';

interface DemoTrait {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  icon: React.ReactNode;
  color: string;
  preview: string;
}

export function TraitShowcase() {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demoTraits: DemoTrait[] = [
    {
      id: 'interaction',
      name: 'Interaction-Based',
      description: 'NFT evolves based on viewer interactions',
      triggerType: 'Click to activate',
      icon: <MousePointer className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      preview: '👆 Interactive'
    },
    {
      id: 'time',
      name: 'Time-Based',
      description: 'Traits change with time of day or season',
      triggerType: 'Auto-updates',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      preview: '🌙 Dynamic'
    },
    {
      id: 'community',
      name: 'Community-Driven',
      description: 'Holders vote on trait evolution',
      triggerType: 'Vote to change',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      preview: '🗳️ Governed'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const handleDemoClick = (traitId: string) => {
    setActiveDemo(traitId);
    setTimeout(() => setActiveDemo(null), 2000);
  };

  return (
    <section 
      className="py-20 px-4 relative overflow-hidden"
      aria-labelledby="trait-showcase-title"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-10 h-10 text-primary drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.6)]" aria-hidden="true" />
            </motion.div>
            <h2 
              id="trait-showcase-title"
              className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
            >
              Dynamic Traits
            </h2>
          </div>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            NFTs that evolve and change based on interactions, time, and community decisions
          </p>
        </motion.div>

        {/* Demo Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {demoTraits.map((trait) => (
            <motion.div key={trait.id} variants={cardVariants}>
              <GlassCard 
                className="p-8 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group relative overflow-hidden border-primary/20"
                onClick={() => handleDemoClick(trait.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDemoClick(trait.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${trait.name}: ${trait.description}. ${trait.triggerType}`}
              >
                {/* Animated background on active */}
                <AnimatePresence>
                  {activeDemo === trait.id && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 2.5 }}
                        exit={{ opacity: 0, scale: 3.5 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className={`absolute inset-0 bg-gradient-to-br ${trait.color} opacity-30 blur-3xl`}
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 1.5, repeat: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"
                      />
                    </>
                  )}
                </AnimatePresence>

                {/* Icon */}
                <motion.div 
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${trait.color} p-4 mb-6 relative z-10 shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40 transition-shadow`}
                  whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
                >
                  <div className="text-white w-full h-full flex items-center justify-center">
                    {trait.icon}
                  </div>
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors relative z-10">
                  {trait.name}
                </h3>
                <p className="text-base text-foreground/60 mb-6 relative z-10 leading-relaxed">
                  {trait.description}
                </p>

                {/* Trigger Type */}
                <div className="flex items-center gap-2 text-sm font-medium text-primary mb-6 relative z-10">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="tracking-wide">{trait.triggerType}</span>
                </div>

                {/* Preview Badge */}
                <div className="relative z-10">
                  <motion.div
                    animate={activeDemo === trait.id ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, 15, -15, 0]
                    } : {}}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 backdrop-blur-sm text-3xl shadow-lg group-hover:shadow-primary/20 transition-shadow"
                  >
                    {trait.preview}
                  </motion.div>
                </div>

                {/* Active indicator */}
                <AnimatePresence>
                  {activeDemo === trait.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.8 }}
                      className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 text-primary font-bold text-sm shadow-lg shadow-primary/30"
                    >
                      ✨ Activated!
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <GlassCard className="p-8 text-center border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <p className="text-lg text-foreground/70">
              <span className="text-primary font-bold text-xl">Try it:</span> Click on any card above to see a trait activation demo
            </p>
          </GlassCard>
        </motion.div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <GlassButton 
            size="lg"
            onClick={() => navigate('/traits')}
            className="group shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all"
            aria-label="Explore all dynamic traits"
          >
            <span className="text-lg font-semibold">Explore Dynamic Traits</span>
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
          </GlassButton>
        </motion.div>
      </div>
    </section>
  );
}
