import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TraitListing,
  MARKETPLACE_ABI,
  MARKETPLACE_ADDRESS,
  sortListings,
  filterByTraitName,
  getUniqueTraitNames,
  ListingStatus
} from '@/lib/traitMarketplaceService';
import { selectedChain } from '@/utils/evmConfig';
import { Search, TrendingUp, Activity, Layers, Package } from 'lucide-react';
import { RadarScanLoader } from '@/components/ui/radar-scan-loader';
import { motion } from 'framer-motion';

const nftExtendedContract = selectedChain.contracts.find(
  c => c.contractName === 'KoboNFTExtended'
);

// Mock data for trait chips
const mockTraitChips = [
  { id: 1, name: 'Cyberpunk Hat', type: 'Head', rarity: 'Legendary', listed: 12, floor: '0.08', icon: '🎩' },
  { id: 2, name: 'Laser Sword', type: 'Item', rarity: 'Epic', listed: 24, floor: '0.05', icon: '⚔️' },
  { id: 3, name: 'Neon City BG', type: 'Background', rarity: 'Rare', listed: 45, floor: '0.03', icon: '🌆' },
  { id: 4, name: 'Chrome Body', type: 'Body', rarity: 'Epic', listed: 18, floor: '0.06', icon: '🤖' },
  { id: 5, name: 'Hologram Eyes', type: 'Eyes', rarity: 'Legendary', listed: 8, floor: '0.12', icon: '👁️' },
  { id: 6, name: 'Tech Armor', type: 'Body', rarity: 'Rare', listed: 32, floor: '0.04', icon: '🛡️' },
  { id: 7, name: 'Plasma Gun', type: 'Item', rarity: 'Epic', listed: 15, floor: '0.07', icon: '🔫' },
  { id: 8, name: 'Matrix BG', type: 'Background', rarity: 'Common', listed: 67, floor: '0.02', icon: '💻' },
];

// Mock recent sales
const mockRecentSales = [
  { trait: 'Cyberpunk Hat', price: '0.08 ETH', time: '2m ago' },
  { trait: 'Laser Sword', price: '0.05 ETH', time: '5m ago' },
  { trait: 'Neon City BG', price: '0.03 ETH', time: '12m ago' },
  { trait: 'Chrome Body', price: '0.06 ETH', time: '18m ago' },
  { trait: 'Hologram Eyes', price: '0.12 ETH', time: '25m ago' },
];

export default function TraitMarketplace() {
  const { address } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-center">
          <RadarScanLoader size="lg" className="mx-auto mb-4" />
          <p className="text-[#ea5c2a] font-mono text-sm">LOADING_TRAIT_EXCHANGE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] relative overflow-hidden">
      {/* Blueprint Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#ea5c2a 1px, transparent 1px),
            linear-gradient(90deg, #ea5c2a 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b-2 border-[#ea5c2a] bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-mono font-bold text-white tracking-wider mb-2">
                  // ATOMIC_ASSET_EXCHANGE
                </h1>
                <p className="text-gray-400 font-mono text-sm">
                  PRECISION_TRADING // TRAIT_LIQUIDITY_PROTOCOL
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-6 font-mono text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-gray-400">LIQUIDITY:</span>
                <span className="text-green-500 font-bold">HIGH</span>
              </div>
              <div className="h-4 w-px bg-[#ea5c2a]/30" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#ea5c2a]" />
                <span className="text-gray-400">24H_VOL:</span>
                <span className="text-[#ea5c2a] font-bold">450 ETH</span>
              </div>
              <div className="h-4 w-px bg-[#ea5c2a]/30" />
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-gray-400">ACTIVE_LISTINGS:</span>
                <span className="text-blue-500 font-bold">1,247</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="bg-[#252525] border-2 border-[#ea5c2a]/30 p-4">
                <h3 className="text-[#ea5c2a] font-mono text-sm font-bold uppercase tracking-wider mb-4">
                  // FILTER_PARAMETERS
                </h3>

                {/* Search */}
                <div className="mb-4">
                  <label className="text-gray-400 font-mono text-xs mb-2 block">SEARCH_QUERY</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <Input
                      placeholder="trait_name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-black border-[#ea5c2a]/50 text-white font-mono text-sm focus:border-[#ea5c2a]"
                    />
                  </div>
                </div>

                {/* Rarity Filter */}
                <div className="mb-4">
                  <label className="text-gray-400 font-mono text-xs mb-2 block">RARITY_CLASS</label>
                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger className="bg-black border-[#ea5c2a]/50 text-white font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252525] border-[#ea5c2a]">
                      <SelectItem value="all">ALL_RARITIES</SelectItem>
                      <SelectItem value="common">COMMON</SelectItem>
                      <SelectItem value="rare">RARE</SelectItem>
                      <SelectItem value="epic">EPIC</SelectItem>
                      <SelectItem value="legendary">LEGENDARY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div className="mb-4">
                  <label className="text-gray-400 font-mono text-xs mb-2 block">TRAIT_TYPE</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-black border-[#ea5c2a]/50 text-white font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252525] border-[#ea5c2a]">
                      <SelectItem value="all">ALL_TYPES</SelectItem>
                      <SelectItem value="body">BODY</SelectItem>
                      <SelectItem value="background">BACKGROUND</SelectItem>
                      <SelectItem value="item">ITEM</SelectItem>
                      <SelectItem value="head">HEAD</SelectItem>
                      <SelectItem value="eyes">EYES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <label className="text-gray-400 font-mono text-xs mb-2 block">
                    FLOOR_PRICE_RANGE: {priceRange[0]}% - {priceRange[1]}%
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <Button className="w-full bg-[#ea5c2a] hover:bg-[#ff6b35] text-black font-mono font-bold border-2 border-[#ea5c2a]">
                  APPLY_FILTERS
                </Button>
              </Card>
            </div>

            {/* Main Area - Trait Chips Grid */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockTraitChips.map((trait) => (
                  <motion.div
                    key={trait.id}
                    whileHover={{ scale: 1.05 }}
                    className="relative group cursor-pointer"
                  >
                    <Card className="bg-[#2a2a2a] border-2 border-[#ea5c2a]/30 hover:border-[#ea5c2a] hover:shadow-lg hover:shadow-[#ea5c2a]/20 transition-all duration-300 aspect-square flex flex-col items-center justify-center p-4">
                      {/* Trait Icon */}
                      <div className="text-6xl mb-3">{trait.icon}</div>
                      
                      {/* Trait Name */}
                      <h3 className="text-white font-mono text-xs text-center mb-2 line-clamp-1">
                        {trait.name}
                      </h3>

                      {/* Market Data Overlay */}
                      <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 rounded-lg">
                        <div className="text-center space-y-2">
                          <div>
                            <span className="text-gray-400 font-mono text-xs block">LISTED</span>
                            <span className="text-[#ea5c2a] font-mono text-lg font-bold">{trait.listed}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-mono text-xs block">FLOOR</span>
                            <span className="text-green-500 font-mono text-lg font-bold">{trait.floor} ETH</span>
                          </div>
                          <Badge className="bg-[#ea5c2a] text-black font-mono text-xs">
                            {trait.rarity}
                          </Badge>
                        </div>
                      </div>

                      {/* Bottom Info Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-[#ea5c2a]/20 border-t-2 border-[#ea5c2a] p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#ea5c2a] font-mono text-xs font-bold">{trait.listed} LISTED</span>
                          <span className="text-green-500 font-mono text-xs font-bold">{trait.floor} Ξ</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Sidebar - Live Order Book */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="bg-[#252525] border-2 border-[#ea5c2a]/30 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-[#ea5c2a]" />
                  <h3 className="text-[#ea5c2a] font-mono text-sm font-bold uppercase tracking-wider">
                    // LIVE_ORDER_BOOK
                  </h3>
                </div>

                <div className="space-y-3">
                  {mockRecentSales.map((sale, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-black/50 border border-[#ea5c2a]/20 rounded p-3"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-white font-mono text-xs font-semibold line-clamp-1">
                          {sale.trait}
                        </span>
                        <span className="text-gray-500 font-mono text-xs whitespace-nowrap ml-2">
                          {sale.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-500 font-mono text-sm font-bold">
                          {sale.price}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-[#ea5c2a]/30">
                  <div className="text-center">
                    <span className="text-gray-400 font-mono text-xs">REAL_TIME_UPDATES</span>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-500 font-mono text-xs font-bold">ACTIVE</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
