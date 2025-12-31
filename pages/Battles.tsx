import { useLocation } from 'react-router-dom';
import { BattleGallery } from '@/components/battles/BattleGallery';
import { motion } from 'framer-motion';

export default function Battles() {
  const location = useLocation();
  const preselectedNftId = location.state?.nftId;

  return (
    <div className="min-h-screen bg-[#1e1e1e] relative overflow-hidden">
      {/* Telemetry Strip */}
      <div className="bg-black border-b border-gray-800 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 font-mono text-sm text-[#ea5c2a] tracking-wider">
            <span>LIVE_WARZONES: <span className="text-white">04</span></span>
            <span className="text-gray-600">|</span>
            <span>TOTAL_PAYOUT: <span className="text-white">420 ETH</span></span>
            <span className="text-gray-600">|</span>
            <span>ACTIVE_GLADIATORS: <span className="text-white">1,205</span></span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-mono font-bold mb-4 text-gray-100 tracking-wider">
            // SECTOR: COMBAT_ZONE
          </h1>
          {preselectedNftId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 inline-block px-4 py-2 bg-[#ea5c2a]/20 border border-[#ea5c2a]/50 rounded text-[#ea5c2a] text-sm font-mono"
            >
              ASSET #{preselectedNftId} LOCKED_FOR_COMBAT
            </motion.div>
          )}
        </motion.div>

        {/* Battle Gallery */}
        <BattleGallery />
      </div>
    </div>
  );
}
