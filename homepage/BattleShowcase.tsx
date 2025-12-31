import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Users, ArrowRight, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { getActiveBattles, Battle } from '@/lib/battleService';
import { useNavigate } from 'react-router-dom';

export function BattleShowcase() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBattles();
  }, []);

  const loadBattles = async () => {
    try {
      setError(null);
      const data = await getActiveBattles();
      setBattles(data.slice(0, 3)); // Show top 3 battles
    } catch (error) {
      console.error('Failed to load battles:', error);
      setError('Unable to load battles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
      aria-labelledby="battle-showcase-title"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.08),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm">
            <Swords className="w-5 h-5 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">Live Battles</span>
          </div>
          <h2 
            id="battle-showcase-title"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
          >
            NFT Battles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Compete in creative battles, earn rewards, and climb the leaderboard
          </p>
        </motion.div>

        {/* Battle Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {loading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <GlassCard key={i} className="p-6 animate-pulse bg-card/50 backdrop-blur-sm">
                <div className="h-40 bg-muted/20 rounded-lg mb-4" />
                <div className="h-4 bg-muted/20 rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted/20 rounded w-1/2" />
              </GlassCard>
            ))
          ) : error ? (
            <div className="col-span-3 text-center py-12">
              <GlassCard className="p-6 border-red-500/20 bg-card/50 backdrop-blur-sm">
                <Swords className="w-16 h-16 mx-auto mb-4 text-red-400" aria-hidden="true" />
                <p className="text-red-400 mb-4">{error}</p>
                <GlassButton onClick={loadBattles}>
                  Try Again
                </GlassButton>
              </GlassCard>
            </div>
          ) : battles.length > 0 ? (
            battles.map((battle) => (
              <motion.div key={battle.id} variants={cardVariants}>
                <GlassCard 
                  className="p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                  role="article"
                  aria-label={`Battle: ${battle.title}`}
                >
                  {/* Battle Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/30">
                      {battle.battleType}
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-yellow-500">{battle.prizePool}</span>
                    </div>
                  </div>

                  {/* Battle Info */}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {battle.title}
                  </h3>
                  <p className="text-sm text-muted-foreground/90 mb-4 line-clamp-2 leading-relaxed">
                    {battle.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground/80 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">{battle.participants?.length || 0}/{battle.maxParticipants}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">{battle.status}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <GlassButton 
                    className="w-full group-hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
                    onClick={() => navigate('/battles')}
                    aria-label={`Join battle: ${battle.title}`}
                  >
                    Join Battle
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
                  </GlassButton>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12" role="status">
              <Swords className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" aria-hidden="true" />
              <p className="text-muted-foreground">No active battles yet. Check back soon!</p>
            </div>
          )}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <GlassButton 
            size="lg"
            onClick={() => navigate('/battles')}
            className="group hover:bg-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            aria-label="View all battles page"
          >
            View All Battles
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
          </GlassButton>
        </motion.div>
      </div>
    </section>
  );
}
