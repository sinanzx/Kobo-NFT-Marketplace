import { useState } from 'react';
import { motion } from 'framer-motion';
import { Glasses, Smartphone, Monitor, ArrowRight, Play, Sparkles, Eye } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { useNavigate } from 'react-router-dom';

export function ARShowcase() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'mobile',
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile AR',
      description: 'View NFTs in your space using your phone camera',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'web',
      icon: <Monitor className="w-8 h-8" />,
      title: 'Web Gallery',
      description: 'Immersive 3D gallery accessible from any browser',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'vr',
      icon: <Glasses className="w-8 h-8" />,
      title: 'VR Ready',
      description: 'Full VR support for headset experiences',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section 
      className="py-24 px-4 relative overflow-hidden"
      aria-labelledby="ar-showcase-title"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-accent/8 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <motion.div
              animate={{ 
                rotateY: [0, 180, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Glasses className="w-12 h-12 text-primary drop-shadow-[0_0_16px_rgba(var(--primary-rgb),0.7)]" aria-hidden="true" />
            </motion.div>
            <h2 
              id="ar-showcase-title"
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
            >
              AR/VR Preview
            </h2>
          </div>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            Experience your NFTs in augmented and virtual reality
          </p>
        </motion.div>

        {/* Main Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <GlassCard className="p-10 md:p-16 relative overflow-hidden group border-primary/30 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-shadow duration-500">
            {/* Animated background gradient */}
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 0% 0%, rgba(var(--primary-rgb), 0.15) 0%, transparent 60%)',
                  'radial-gradient(circle at 100% 100%, rgba(var(--accent-rgb), 0.15) 0%, transparent 60%)',
                  'radial-gradient(circle at 0% 100%, rgba(var(--primary-rgb), 0.15) 0%, transparent 60%)',
                  'radial-gradient(circle at 100% 0%, rgba(var(--accent-rgb), 0.15) 0%, transparent 60%)',
                  'radial-gradient(circle at 0% 0%, rgba(var(--primary-rgb), 0.15) 0%, transparent 60%)'
                ]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 pointer-events-none"
            />
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

            <div className="relative z-10 text-center">
              {/* Preview Icon */}
              <motion.div
                animate={{
                  rotateY: [0, 360],
                  scale: [1, 1.15, 1]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-40 h-40 mx-auto mb-8 rounded-[2rem] bg-gradient-to-br from-primary via-accent to-primary p-1 shadow-2xl shadow-primary/40"
              >
                <div className="w-full h-full rounded-[2rem] bg-background/90 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"
                  />
                  <Eye className="w-20 h-20 text-primary drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)] relative z-10" />
                </div>
              </motion.div>

              <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Immersive NFT Experience
              </h3>
              <p className="text-lg md:text-xl text-foreground/60 mb-8 max-w-3xl mx-auto leading-relaxed">
                Step into a new dimension of digital art. View your NFTs in 3D space, place them in your room with AR, or explore a virtual gallery in VR.
              </p>

              {/* Demo CTA */}
              <GlassButton 
                size="lg"
                onClick={() => navigate('/onboarding')}
                className="group shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all px-8 py-4"
                aria-label="Try AR demo experience"
              >
                <Play className="w-6 h-6 mr-3" aria-hidden="true" />
                <span className="text-lg font-semibold">Try AR Demo</span>
                <Sparkles className="w-6 h-6 ml-3 group-hover:rotate-12 transition-transform" aria-hidden="true" />
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.id} 
              variants={cardVariants}
              onHoverStart={() => setHoveredFeature(feature.id)}
              onHoverEnd={() => setHoveredFeature(null)}
            >
              <GlassCard 
                className="p-8 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group border-primary/20"
                role="article"
                aria-label={`${feature.title}: ${feature.description}`}
              >
                {/* Icon */}
                <motion.div
                  animate={hoveredFeature === feature.id ? {
                    scale: [1, 1.25, 1],
                    rotate: [0, 8, -8, 0]
                  } : {}}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} p-4 mb-6 shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40 transition-shadow`}
                >
                  <div className="text-white w-full h-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                </motion.div>

                {/* Content */}
                <h4 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h4>
                <p className="text-base text-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <GlassCard className="p-8 md:p-10 inline-block border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 shadow-xl shadow-primary/10">
            <p className="text-lg md:text-xl text-foreground/70 mb-6">
              <span className="text-primary font-bold text-2xl">Coming Soon:</span> Full AR/VR gallery with social features
            </p>
            <GlassButton 
              onClick={() => navigate('/onboarding')}
              className="group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              aria-label="Get early access to AR/VR features"
            >
              <span className="text-lg font-semibold">Get Early Access</span>
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
            </GlassButton>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
