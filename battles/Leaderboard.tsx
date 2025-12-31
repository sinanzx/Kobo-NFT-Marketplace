import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Award, Crown, Medal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLeaderboard } from '@/lib/battleService';
import {
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  scaleVariants,
  successVariants,
  hoverScale,
  tapScale,
  spring,
  createStaggerDelay,
} from '@/lib/animationConfig';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string;
  score: number;
  badges: string[];
  stats: {
    battlesWon: number;
    collabsCompleted: number;
    totalMints: number;
    reputationScore: number;
  };
}

export function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'battles' | 'collabs' | 'mints'>('overall');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod, selectedCategory]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(
        selectedPeriod,
        selectedCategory === 'overall' ? undefined : selectedCategory as any
      );
      
      // Transform data to match interface
      const entries: LeaderboardEntry[] = data.map((entry: any) => ({
        rank: entry.rank,
        userId: entry.user.id,
        username: entry.user.username,
        avatarUrl: entry.user.avatar_url,
        score: entry.score,
        badges: getBadgesForRank(entry.rank),
        stats: {
          battlesWon: entry.user.total_battles_won || 0,
          collabsCompleted: 0,
          totalMints: entry.user.total_mints || 0,
          reputationScore: entry.score,
        },
      }));
      
      setLeaderboardData(entries);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgesForRank = (rank: number): string[] => {
    const badges: string[] = [];
    if (rank === 1) badges.push('🥇', '👑');
    else if (rank === 2) badges.push('🥈', '✨');
    else if (rank === 3) badges.push('🥉', '🎨');
    else if (rank <= 10) badges.push('⚡');
    return badges;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <Award className="w-5 h-5 text-purple-400" />;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50';
    return 'bg-gray-900/40 border-gray-700/50';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        className="text-center space-y-2"
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={scaleVariants}
          className="inline-flex items-center gap-2 text-4xl font-bold"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Trophy className="w-10 h-10 text-yellow-400" />
          </motion.div>
          <h1 className="font-jost bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Global Leaderboard
          </h1>
        </motion.div>
        <motion.p 
          className="text-gray-400 font-dm-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Compete, create, and climb the ranks
        </motion.p>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        transition={createStaggerDelay(1, 0.1)}
      >
        <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-gray-900/60">
            <TabsTrigger value="global">All Time</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        transition={createStaggerDelay(2, 0.1)}
      >
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-gray-900/60">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="battles">Battles</TabsTrigger>
            <TabsTrigger value="collabs">Collabs</TabsTrigger>
            <TabsTrigger value="mints">Mints</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        transition={createStaggerDelay(3, 0.1)}
      >
        <Card className="bg-gray-900/60 border-gray-700/50 backdrop-blur-sm">
          <div className="p-6">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-700/50 text-sm font-dm-sans text-gray-400">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">Creator</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-2 text-center">Wins</div>
            <div className="col-span-2 text-center">Badges</div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </motion.div>
              <p className="mt-4 text-gray-400 font-dm-sans">Loading rankings...</p>
            </div>
          )}

          {/* Leaderboard Entries */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {!loading && leaderboardData.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  variants={staggerItemVariants}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  whileHover={{ 
                    scale: 1.01, 
                    x: 4,
                    transition: spring.snappy 
                  }}
                  className={`grid grid-cols-12 gap-4 py-4 border-b border-gray-800/50 items-center hover:bg-purple-500/5 transition-colors rounded-lg px-2 cursor-pointer ${
                    entry.rank <= 3 ? getRankStyle(entry.rank) + ' border' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: entry.rank <= 3 ? 360 : 0 }}
                      transition={entry.rank <= 3 ? spring.bouncy : spring.snappy}
                      className="flex items-center gap-2"
                    >
                    {getRankIcon(entry.rank)}
                    <span className="font-jost font-bold text-lg">{entry.rank}</span>
                  </motion.div>
                </div>

                {/* Creator Info */}
                <div className="col-span-5 flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-purple-500/30">
                    <AvatarImage src={entry.avatarUrl} alt={entry.username} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-dm-sans font-semibold text-white">{entry.username}</p>
                    <p className="text-xs text-gray-400">
                      {entry.stats.totalMints} mints · {entry.stats.collabsCompleted} collabs
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-2 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded-full"
                  >
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-jost font-bold text-lg text-white">
                      {entry.score.toLocaleString()}
                    </span>
                  </motion.div>
                </div>

                {/* Wins */}
                <div className="col-span-2 text-center">
                  <span className="font-dm-sans text-white font-semibold">
                    {entry.stats.battlesWon}
                  </span>
                </div>

                {/* Badges */}
                <div className="col-span-2 flex items-center justify-center gap-1">
                  {entry.badges.map((badge, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + i * 0.1 }}
                      className="text-2xl"
                    >
                      {badge}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {!loading && leaderboardData.length === 0 && (
            <div className="py-12 text-center">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-dm-sans">No rankings yet. Be the first to compete!</p>
            </div>
          )}
          </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Sparkle Effect for Top 3 */}
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
