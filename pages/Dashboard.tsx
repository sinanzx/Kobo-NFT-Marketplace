import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserGamification,
  getXPHistory,
  updateStreak,
  type UserGamification,
  type XPTransaction,
} from '@/lib/gamificationService';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { Terminal, Activity, Box, Shield, Zap, TrendingUp, Crosshair } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [xpHistory, setXpHistory] = useState<XPTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock Inventory Data (Replace with real API later)
  const inventory = [
    { id: "K-021", name: "CYBER_APE", type: "ASSET", status: "ACTIVE", image: "https://robohash.org/cyber-ape?set=set1" },
    { id: "K-099", name: "MECH_HELM", type: "TRAIT", status: "IDLE", image: "https://robohash.org/mech-helm?set=set2" },
    { id: "K-104", name: "PLASMA_RIFLE", type: "WEAPON", status: "EQUIPPED", image: "https://robohash.org/plasma?set=set3" },
    { id: "K-332", name: "VOID_PASS", type: "ACCESS", status: "IDLE", image: "https://robohash.org/void?set=set4" },
  ];

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    if (!user) return;
    try {
      setLoading(true);
      await updateStreak(user.id);
      
      const [gamificationData, historyData] = await Promise.all([
        getUserGamification(user.id),
        getXPHistory(user.id, 5), // Fetch last 5 events for Mission Log
      ]);

      setGamification(gamificationData);
      setXpHistory(historyData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !gamification) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#fcfaff] font-mono pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b border-gray-800 pb-6 flex flex-col md:flex-row justify-between items-end gap-4"
        >
          <div>
            <h1 className="text-4xl text-[#ea5c2a] mb-2 flex items-center gap-3">
              <Terminal className="w-8 h-8" />
              // COMMAND_CENTER
            </h1>
            <p className="text-gray-400">WELCOME BACK, OPERATOR {user?.email?.split('@')[0].toUpperCase()}.</p>
          </div>
          <div className="text-right text-xs text-gray-500 font-mono">
            SYS_STATUS: <span className="text-green-500">ONLINE</span> <br/>
            PING: 12ms // ENCRYPTION: AES-256
          </div>
        </motion.div>

        {/* HUD / STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Stat 1: Wallet (Mock) */}
          <div className="bg-[#252525] border-l-4 border-[#ea5c2a] p-6 relative group hover:bg-[#2a2a2a] transition-colors">
            <h3 className="text-xs text-gray-400 mb-1 flex items-center gap-2">
              <Box className="w-3 h-3" /> WALLET_BALANCE
            </h3>
            <p className="text-2xl font-bold">4.50 ETH</p>
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#ea5c2a] rounded-full opacity-50 group-hover:animate-pulse"></div>
          </div>

          {/* Stat 2: Assets (Mock) */}
          <div className="bg-[#252525] border-l-4 border-[#ea5c2a] p-6 relative group hover:bg-[#2a2a2a] transition-colors">
            <h3 className="text-xs text-gray-400 mb-1 flex items-center gap-2">
              <Shield className="w-3 h-3" /> ASSETS_OWNED
            </h3>
            <p className="text-2xl font-bold">{inventory.length} UNITS</p>
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#ea5c2a] rounded-full opacity-50 group-hover:animate-pulse"></div>
          </div>

          {/* Stat 3: Rank (Real Data) */}
          <div className="bg-[#252525] border-l-4 border-[#ea5c2a] p-6 relative group hover:bg-[#2a2a2a] transition-colors">
            <h3 className="text-xs text-gray-400 mb-1 flex items-center gap-2">
              <Activity className="w-3 h-3" /> BATTLE_RANK
            </h3>
            <p className="text-2xl font-bold text-[#ea5c2a]">LVL {gamification.current_level.toString().padStart(2, '0')}</p>
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#ea5c2a] rounded-full opacity-50 group-hover:animate-pulse"></div>
          </div>

          {/* Stat 4: XP (Real Data) */}
          <div className="bg-[#252525] border-l-4 border-[#ea5c2a] p-6 relative group hover:bg-[#2a2a2a] transition-colors">
            <h3 className="text-xs text-gray-400 mb-1 flex items-center gap-2">
              <Zap className="w-3 h-3" /> TOTAL_XP
            </h3>
            <p className="text-2xl font-bold">{gamification.total_xp.toLocaleString()}</p>
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#ea5c2a] rounded-full opacity-50 group-hover:animate-pulse"></div>
          </div>
        </div>

        {/* MAIN CONTENT BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COL: INVENTORY (Spans 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h2 className="text-xl text-[#ea5c2a] flex items-center gap-2">
                <Crosshair className="w-5 h-5" /> ACTIVE_INVENTORY
              </h2>
              <Button 
                variant="outline" 
                className="h-8 border-[#ea5c2a] text-[#ea5c2a] hover:bg-[#ea5c2a] hover:text-black font-mono text-xs"
                onClick={() => navigate('/gallery')}
              >
                VIEW_FULL_ARMORY
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inventory.map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#252525] p-4 border border-gray-800 hover:border-[#ea5c2a] transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* Hover Scanline Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ea5c2a]/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 pointer-events-none" />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-black rounded-sm border border-gray-700 flex items-center justify-center overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className={`text-[10px] px-2 py-1 border ${
                      item.status === 'ACTIVE' || item.status === 'EQUIPPED' 
                        ? 'text-green-500 border-green-500 bg-green-500/10' 
                        : 'text-gray-500 border-gray-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#ea5c2a] transition-colors">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.id} // {item.type}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT COL: ANALYTICS & HISTORY */}
          <div className="flex flex-col gap-8">
            
            {/* MODULE B: ANALYTICS */}
            <div className="bg-[#252525] p-6 border border-gray-800">
              <h2 className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> // PERFORMANCE_METRICS
              </h2>
              <div className="w-full h-40 border border-dashed border-gray-700 bg-black/50 flex flex-col items-center justify-center text-xs text-gray-600 font-mono relative overflow-hidden">
                {/* Fake Chart Lines */}
                <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-4 pb-2 opacity-30">
                  <div className="w-2 h-[40%] bg-[#ea5c2a]"></div>
                  <div className="w-2 h-[60%] bg-[#ea5c2a]"></div>
                  <div className="w-2 h-[30%] bg-[#ea5c2a]"></div>
                  <div className="w-2 h-[80%] bg-[#ea5c2a]"></div>
                  <div className="w-2 h-[50%] bg-[#ea5c2a]"></div>
                </div>
                <span className="z-10 bg-[#1e1e1e] px-2 py-1 border border-gray-700">[ DATA_STREAM_LOADING... ]</span>
              </div>
            </div>

            {/* MODULE C: MISSION LOG (Real History) */}
            <div className="flex-1">
              <h2 className="text-xl text-[#ea5c2a] border-b border-gray-800 pb-2 mb-4">MISSION_LOG</h2>
              <div className="space-y-2">
                {xpHistory.length === 0 ? (
                   <div className="text-gray-600 text-xs p-4 text-center border border-dashed border-gray-800">
                     NO_RECENT_ACTIVITY
                   </div>
                ) : (
                  xpHistory.map((log, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-3 bg-[#252525] border-l-2 border-gray-700 hover:border-[#ea5c2a] hover:bg-black transition-colors cursor-default">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{log.activity_type.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-gray-500">{new Date(log.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[#ea5c2a] font-bold">+{log.xp_amount} XP</span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 text-center">
                 <Button variant="link" className="text-xs text-gray-500 hover:text-[#ea5c2a]" onClick={() => navigate('/account-settings')}>
                    VIEW_FULL_LOGS
                 </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}