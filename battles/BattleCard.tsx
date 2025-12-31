import { motion } from 'framer-motion';
import { Clock, Users, Trophy, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Battle } from '@/lib/battleService';
import { OpenSeaBadge } from '@/components/ui/opensea-badge';
import { contractAddress, chainId } from '@/utils/evmConfig';

interface BattleCardProps {
  battle: Battle;
  onJoin?: (battleId: string) => void;
  onView?: (battleId: string) => void;
}

export function BattleCard({ battle, onJoin, onView }: BattleCardProps) {
  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(battle.battleEnd);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getBattleTypeColor = (type: Battle['battleType']) => {
    const colors = {
      AI_VS_HUMAN: 'bg-[#ea5c2a]/20 text-[#ea5c2a] border-[#ea5c2a]/50',
      REMIX_COMPETITION: 'bg-[#ea5c2a]/20 text-[#ea5c2a] border-[#ea5c2a]/50',
      TIME_CHALLENGE: 'bg-[#ea5c2a]/20 text-[#ea5c2a] border-[#ea5c2a]/50',
      THEME_BATTLE: 'bg-[#ea5c2a]/20 text-[#ea5c2a] border-[#ea5c2a]/50',
      TOURNAMENT: 'bg-[#ea5c2a]/20 text-[#ea5c2a] border-[#ea5c2a]/50',
    };
    return colors[type] || colors.THEME_BATTLE;
  };

  const getStatusColor = (status: Battle['status']) => {
    const colors = {
      upcoming: 'bg-gray-500/20 text-gray-400',
      registration: 'bg-[#ea5c2a]/20 text-[#ea5c2a]',
      active: 'bg-[#ea5c2a]/20 text-[#ea5c2a]',
      voting: 'bg-[#ea5c2a]/20 text-[#ea5c2a]',
      completed: 'bg-gray-500/20 text-gray-400',
      cancelled: 'bg-red-500/20 text-red-400',
    };
    return colors[status];
  };

  const participantCount = battle.participants?.length || 0;
  const participantPercentage = (participantCount / battle.maxParticipants) * 100;

  // Participants are wallet addresses (strings), not objects with nftId
  // OpenSea links would need actual NFT token IDs from battle entries

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm overflow-hidden hover:border-purple-500/50 transition-all">
        {/* Header */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${getBattleTypeColor(battle.battleType)} border font-dm-sans`}>
                  {battle.battleType.replace(/_/g, ' ')}
                </Badge>
                <Badge className={`${getStatusColor(battle.status)} font-dm-sans`}>
                  {battle.status.toUpperCase()}
                </Badge>
              </div>
              <h3 className="font-jost font-bold text-xl text-white">{battle.title}</h3>
              <p className="text-gray-400 text-sm font-dm-sans line-clamp-2">{battle.description}</p>
            </div>
            
            {battle.status === 'active' && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex-shrink-0"
              >
                <Trophy className="w-8 h-8 text-yellow-400" />
              </motion.div>
            )}
          </div>

          {/* Theme */}
          {battle.theme && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm font-dm-sans">
                <span className="text-purple-400 font-semibold">Theme:</span>{' '}
                <span className="text-white">{battle.theme}</span>
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time Remaining */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-400 font-dm-sans">Time Left</p>
                <p className="text-white font-semibold font-dm-sans">{getTimeRemaining()}</p>
              </div>
            </div>

            {/* Prize Pool */}
            <div className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-gray-400 font-dm-sans">Prize Pool</p>
                <p className="text-white font-semibold font-dm-sans">
                  {parseFloat(battle.prizePool).toFixed(4)} ETH
                </p>
              </div>
            </div>
          </div>

          {/* Participants Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 font-dm-sans">Participants</span>
              </div>
              <span className="text-white font-semibold font-dm-sans">
                {participantCount} / {battle.maxParticipants}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${participantPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </div>

          {/* View Collection on OpenSea */}
          <div className="pt-2 border-t border-gray-700/50">
            <OpenSeaBadge
              contractAddress={contractAddress}
              chainId={chainId}
              variant="link"
              size="sm"
              className="text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {battle.status === 'registration' && onJoin && (
              <Button
                onClick={() => onJoin(battle.id)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-dm-sans font-semibold"
              >
                Join Battle
              </Button>
            )}
            {battle.status === 'voting' && onView && (
              <Button
                onClick={() => onView(battle.id)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-dm-sans font-semibold"
              >
                Vote Now
              </Button>
            )}
            {(battle.status === 'active' || battle.status === 'completed') && onView && (
              <Button
                onClick={() => onView(battle.id)}
                variant="outline"
                className="flex-1 border-gray-600 hover:bg-gray-800 font-dm-sans font-semibold"
              >
                View Battle
              </Button>
            )}
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/0 via-purple-500/0 to-purple-500/5 pointer-events-none" />
      </Card>
    </motion.div>
  );
}
