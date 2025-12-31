import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, ArrowRight, Sparkles, UserPlus } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { getActiveSessions, CollabSession, CollabParticipant } from '@/lib/collabService';
import { useNavigate } from 'react-router-dom';

export function CollabShowcase() {
  const [sessions, setSessions] = useState<CollabSession[]>([]);
  const [participants, setParticipants] = useState<Record<string, CollabParticipant[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setError(null);
      const data = await getActiveSessions();
      setSessions(data.slice(0, 3)); // Show top 3 sessions
      
      // Load participants for each session
      const participantsData: Record<string, CollabParticipant[]> = {};
      for (const session of data.slice(0, 3)) {
        try {
          const { getCollabContributors } = await import('@/lib/collabService');
          const contributors = await getCollabContributors(session.id);
          participantsData[session.id] = contributors;
        } catch (error) {
          participantsData[session.id] = [];
        }
      }
      setParticipants(participantsData);
    } catch (error) {
      console.error('Failed to load collab sessions:', error);
      setError('Unable to load collaboration sessions. Please try again later.');
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

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    if (remaining <= 0) return 'Ended';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <section 
      className="py-20 px-4 relative overflow-hidden"
      aria-labelledby="collab-showcase-title"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Users className="w-8 h-8 text-cyan-400" aria-hidden="true" />
            <h2 
              id="collab-showcase-title"
              className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
            >
              Collaborative Minting
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join forces with other creators to mint unique collaborative NFTs
          </p>
        </motion.div>

        {/* Session Cards */}
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
              <GlassCard key={i} className="p-6 animate-pulse">
                <div className="h-40 bg-white/5 rounded-lg mb-4" />
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </GlassCard>
            ))
          ) : error ? (
            <div className="col-span-3 text-center py-12">
              <GlassCard className="p-6 border-red-500/20">
                <Users className="w-16 h-16 mx-auto mb-4 text-red-400" aria-hidden="true" />
                <p className="text-red-400 mb-4">{error}</p>
                <GlassButton onClick={loadSessions}>
                  Try Again
                </GlassButton>
              </GlassCard>
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((session) => (
              <motion.div key={session.id} variants={cardVariants}>
                <GlassCard 
                  className="p-6 hover:scale-105 transition-transform cursor-pointer group"
                  role="article"
                  aria-label={`Collaboration session: ${session.title}`}
                >
                  {/* Session Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {session.collabType}
                    </span>
                    <div className="flex items-center gap-1 text-cyan-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-bold">{participants[session.id]?.reduce((sum, p) => sum + p.contributionCount, 0) || 0}</span>
                    </div>
                  </div>

                  {/* Session Info */}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                    {session.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {session.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <UserPlus className="w-4 h-4" />
                      <span>{participants[session.id]?.length || 0}/{session.maxContributors}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>{formatTimeRemaining(new Date(session.contributionDeadline).getTime())}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div 
                      className="h-2 bg-white/5 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={(participants[session.id]?.length || 0)}
                      aria-valuemin={0}
                      aria-valuemax={session.maxContributors}
                      aria-label="Session participation progress"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${((participants[session.id]?.length || 0) / session.maxContributors) * 100}%` 
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <GlassButton 
                    className="w-full group-hover:bg-cyan-500/20"
                    onClick={() => navigate('/collab')}
                    aria-label={`Join collaboration session: ${session.title}`}
                  >
                    Join Session
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </GlassButton>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12" role="status">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" aria-hidden="true" />
              <p className="text-muted-foreground">No active sessions yet. Start a collaboration!</p>
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
            onClick={() => navigate('/collab')}
            className="group"
          >
            View All Sessions
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </GlassButton>
        </motion.div>
      </div>
    </section>
  );
}
