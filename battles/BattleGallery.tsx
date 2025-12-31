import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Zap, Trophy, Clock, Target } from 'lucide-react';
import { BattleCard } from './BattleCard';
import { getActiveBattles, Battle } from '@/lib/battleService';
import { BattleSkeleton } from '@/components/ui/loading-skeleton';

export function BattleGallery() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  useEffect(() => {
    loadBattles();
  }, []);

  const loadBattles = async () => {
    setLoading(true);
    try {
      const data = await getActiveBattles();
      setBattles(data);
    } catch (error) {
      console.error('Failed to load battles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBattles = activeTab === 'ALL' 
    ? battles 
    : battles.filter(b => b.battleType === activeTab);

  const handleJoinBattle = (battleId: string) => {
    console.log('Join battle:', battleId);
  };

  const handleViewBattle = (battleId: string) => {
    console.log('View battle:', battleId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Tab Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-8 py-4 font-mono text-sm tracking-wider transition-all duration-200 rounded-full border-2 ${
            activeTab === 'ALL'
              ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_20px_rgba(34,197,94,0.3)] scale-95'
              : 'bg-black/40 text-gray-400 border-gray-600 hover:border-[#ea5c2a] hover:scale-95'
          }`}
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>ALL_SECTORS</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('AI_VS_HUMAN')}
          className={`px-8 py-4 font-mono text-sm tracking-wider transition-all duration-200 rounded border-2 ${
            activeTab === 'AI_VS_HUMAN'
              ? 'bg-[#ea5c2a]/10 text-white border-[#ea5c2a] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_20px_rgba(234,92,42,0.3)] scale-95'
              : 'bg-black/40 text-gray-400 border-gray-600 hover:border-[#ea5c2a] hover:scale-95'
          }`}
        >
          <span>AI_VS_HUMAN</span>
        </button>

        <button
          onClick={() => setActiveTab('TOURNAMENT')}
          className={`px-10 py-5 font-mono text-base font-bold tracking-wider transition-all duration-200 rounded border-2 ${
            activeTab === 'TOURNAMENT'
              ? 'bg-gradient-to-br from-orange-600/20 to-yellow-600/20 text-yellow-400 border-yellow-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_25px_rgba(234,179,8,0.5)] scale-95'
              : 'bg-black/40 text-gray-400 border-gray-600 hover:border-yellow-500 hover:scale-95'
          }`}
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5" />
            <span>TOURNAMENT</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('TIME_CHALLENGE')}
          className={`px-8 py-4 font-mono text-sm tracking-wider transition-all duration-200 rounded border-2 ${
            activeTab === 'TIME_CHALLENGE'
              ? 'bg-blue-500/10 text-white border-blue-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_20px_rgba(96,165,250,0.4)] scale-95'
              : 'bg-black/40 text-gray-400 border-gray-600 hover:border-[#ea5c2a] hover:scale-95'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>SPEED</span>
          </div>
        </button>
      </div>

      {/* Loading State */}
      {loading && <BattleSkeleton />}

      {/* CASE A: AI_VS_HUMAN - THE DUEL */}
      {!loading && activeTab === 'AI_VS_HUMAN' && (
        <motion.div
          key="duel-view"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-[600px] flex relative bg-black border-2 border-[#ea5c2a] rounded-lg overflow-hidden"
        >
          {/* LEFT PANEL - HUMAN */}
          <div className="w-1/2 bg-zinc-900 flex items-center justify-center border-r-2 border-orange-500 relative">
            <div className="absolute top-8 left-8 font-mono text-xs text-blue-400 tracking-widest">
              // HUMAN_COMBATANT
            </div>
            <div className="flex flex-col items-center">
              <div className="w-56 h-56 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.9)]">
                <User className="w-40 h-40 text-white" />
              </div>
              <h2 className="font-mono text-4xl text-white font-bold mt-8">PLAYER_01</h2>
              <div className="font-mono text-lg text-gray-300 mt-3">RANK: MASTER</div>
            </div>
          </div>

          {/* RIGHT PANEL - AI */}
          <div className="w-1/2 bg-black flex items-center justify-center relative">
            <div className="absolute top-8 right-8 font-mono text-xs text-red-400 tracking-widest">
              // AI_OPPONENT
            </div>
            <div className="flex flex-col items-center">
              <div className="w-56 h-56 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-red-500 flex items-center justify-center shadow-[0_0_80px_rgba(239,68,68,0.9)]">
                <Bot className="w-40 h-40 text-red-400" />
              </div>
              <h2 className="font-mono text-4xl text-white font-bold mt-8">AI_NEURAL_X</h2>
              <div className="font-mono text-lg text-gray-300 mt-3">THREAT: MAXIMUM</div>
            </div>
          </div>

          {/* CENTER OVERLAY - GIANT VS */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <Zap className="w-32 h-32 text-[#ea5c2a] mb-4 animate-pulse drop-shadow-[0_0_50px_rgba(234,92,42,1)]" fill="#ea5c2a" />
            <div className="text-[#ea5c2a] font-mono text-[9rem] font-black leading-none drop-shadow-[0_0_60px_rgba(234,92,42,1)] animate-pulse">
              VS
            </div>
          </div>

          {/* BOTTOM ACTION BAR */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/95 border-t-2 border-[#ea5c2a] p-6 flex items-center justify-between z-10">
            <div className="font-mono text-white">
              <div className="text-xl font-bold">DUEL ARENA</div>
              <div className="text-sm text-gray-400">COMBAT ZONE ACTIVE</div>
            </div>
            <button
              onClick={() => handleJoinBattle(filteredBattles[0]?.id || '')}
              className="px-10 py-4 bg-[#ea5c2a] text-black font-mono text-xl font-bold rounded hover:bg-[#ff6d3a] transition-all hover:shadow-[0_0_40px_rgba(234,92,42,0.9)] hover:scale-105"
            >
              ENTER_COMBAT
            </button>
          </div>
        </motion.div>
      )}

      {/* CASE B: TOURNAMENT - THE BRACKET */}
      {!loading && activeTab === 'TOURNAMENT' && (
        <motion.div
          key="bracket-view"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-black/60 border-2 border-yellow-500 rounded-lg p-12"
        >
          <h2 className="font-mono text-5xl text-yellow-400 text-center mb-16 tracking-widest">
            // ELIMINATION_BRACKET
          </h2>

          {/* HORIZONTAL BRACKET STRUCTURE */}
          <div className="flex justify-between items-center w-full max-w-5xl mx-auto py-20">
            {/* COLUMN 1: QUARTER-FINALS */}
            <div className="flex flex-col gap-12">
              <div className="font-mono text-sm text-gray-400 text-center mb-4">QUARTER-FINALS</div>
              {[1, 2, 3, 4].map((qf) => (
                <div
                  key={qf}
                  className="w-48 h-24 border border-[#333] bg-transparent rounded flex items-center justify-center relative hover:border-[#ea5c2a] transition-all"
                >
                  <span className="font-mono text-sm text-gray-400">// MATCH_0{qf}</span>
                  {/* Connection line to right */}
                  <div className="absolute left-full w-12 h-px bg-[#333] top-1/2"></div>
                </div>
              ))}
            </div>

            {/* COLUMN 2: SEMI-FINALS */}
            <div className="flex flex-col gap-32">
              <div className="font-mono text-sm text-gray-400 text-center mb-4">SEMI-FINALS</div>
              {[1, 2].map((sf) => (
                <div
                  key={sf}
                  className="w-48 h-24 border border-[#333] bg-transparent rounded flex items-center justify-center relative hover:border-[#ea5c2a] transition-all"
                >
                  <span className="font-mono text-sm text-white">// SEMI_0{sf}</span>
                  {/* Connection line to right */}
                  <div className="absolute left-full w-12 h-px bg-[#333] top-1/2"></div>
                  {/* Connection line from left */}
                  <div className="absolute right-full w-12 h-px bg-[#333] top-1/2"></div>
                  {/* Vertical connector */}
                  <div className={`absolute right-full w-px bg-[#333] ${sf === 1 ? 'h-40 -top-40' : 'h-40 top-full'}`}></div>
                </div>
              ))}
            </div>

            {/* COLUMN 3: CHAMPION */}
            <div className="flex flex-col items-center">
              <div className="font-mono text-sm text-yellow-400 text-center mb-6">GRAND CHAMPION</div>
              <div className="w-56 h-32 border-4 border-yellow-500 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded flex flex-col items-center justify-center relative shadow-[0_0_40px_rgba(234,179,8,0.6)]">
                <Trophy className="w-12 h-12 text-yellow-400 mb-2" />
                <span className="font-mono text-xl text-yellow-400 font-bold">WINNER</span>
                {/* Connection line from left */}
                <div className="absolute right-full w-12 h-px bg-[#333] top-1/2"></div>
              </div>
            </div>
          </div>

          {/* REGISTER BUTTON */}
          <div className="text-center mt-16">
            <button
              onClick={() => handleJoinBattle(filteredBattles[0]?.id || '')}
              className="px-12 py-5 bg-yellow-500 text-black font-mono text-2xl font-bold rounded hover:bg-yellow-400 transition-all hover:shadow-[0_0_40px_rgba(234,179,8,0.9)] hover:scale-105"
            >
              REGISTER_NOW
            </button>
          </div>
        </motion.div>
      )}

      {/* TIME_CHALLENGE - Countdown Bars */}
      {!loading && activeTab === 'TIME_CHALLENGE' && filteredBattles.length > 0 && (
        <motion.div
          key="time-view"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {filteredBattles.map((battle, index) => {
            const timeRemaining = Math.floor(Math.random() * 300);
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            const percentage = (timeRemaining / 300) * 100;
            const isUrgent = timeRemaining < 60;

            return (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/60 border-2 border-blue-400/30 rounded-lg p-4 hover:border-blue-400 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Clock className={`w-5 h-5 ${isUrgent ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} />
                    <div>
                      <h3 className="font-mono text-white font-bold">{battle.title}</h3>
                      <p className="font-mono text-xs text-gray-400">{battle.theme}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-2xl font-bold ${isUrgent ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    <div className="font-mono text-xs text-gray-400">TIME_LEFT</div>
                  </div>
                </div>
                <div className="relative h-3 bg-gray-900 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full rounded-full ${
                      isUrgent 
                        ? 'bg-gradient-to-r from-red-600 to-orange-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs text-gray-400">
                    PARTICIPANTS: {battle.participants?.length || 0}/{battle.maxParticipants}
                  </div>
                  <button
                    onClick={() => handleJoinBattle(battle.id)}
                    className={`px-4 py-1.5 font-mono text-sm font-bold rounded transition-all ${
                      isUrgent
                        ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                        : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                    }`}
                  >
                    {isUrgent ? 'HURRY!' : 'JOIN_NOW'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* CASE C: ALL - THE GRID */}
      {!loading && activeTab === 'ALL' && filteredBattles.length > 0 && (
        <motion.div
          key="grid-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredBattles.map((battle, index) => (
            <motion.div
              key={battle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BattleCard
                battle={battle}
                onJoin={handleJoinBattle}
                onView={handleViewBattle}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State - Radar Scanner */}
      {!loading && filteredBattles.length === 0 && (
        <div className="text-center py-16">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[#ea5c2a]/30"></div>
            <div className="absolute inset-4 rounded-full border border-[#ea5c2a]/20"></div>
            <div className="absolute inset-8 rounded-full border border-[#ea5c2a]/10"></div>
            <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
              <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left bg-gradient-to-r from-[#ea5c2a] to-transparent"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 rounded-full bg-[#ea5c2a] animate-pulse"></div>
          </div>
          <h3 className="font-mono text-lg text-[#ea5c2a] mb-2 tracking-wider">
            STATUS: SCANNING_FOR_HOSTILES<span className="animate-pulse">_</span>
          </h3>
          <p className="text-gray-500 font-mono text-sm">
            {activeTab === 'ALL' 
              ? '// NO_ACTIVE_COMBAT_ZONES_DETECTED' 
              : '// ADJUST_SECTOR_FILTER_PARAMETERS'}
          </p>
        </div>
      )}
    </div>
  );
}
