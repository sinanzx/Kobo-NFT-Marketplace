import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid3x3, List, Eye, Heart, Share2, MoreVertical, Zap, Swords, Users, Glasses, ExternalLink, GitBranch, Gift, TrendingUp, Award, Clock, Sparkles, ShoppingCart, X, SlidersHorizontal } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { FogLayer, GlowOrb, ParticleSystem } from '@/components/effects/AtmosphericEffects';
import DynamicTraitPreview from '@/components/traits/DynamicTraitPreview';
import TraitVotingPanel from '@/components/traits/TraitVotingPanel';
import { IPFSStatusBadge, IPFSMetadataDisplay } from '@/components/ui/ipfs-status-badge';
import { OpenSeaBadge, OpenSeaCollectionLink } from '@/components/ui/opensea-badge';
import GiftWrapModal from '@/components/gifting/GiftWrapModal';
import { contractAddress, chainId } from '@/utils/evmConfig';
import { RadarScanLoader } from '@/components/ui/radar-scan-loader';
import { useMarketListings, useMarketAuctions } from '@/hooks/useMarketData';
import { formatEther } from 'viem';
import {
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  cardRevealVariants,
  modalVariants,
  modalBackdropVariants,
  hoverScale,
  tapScale,
  spring,
  createStaggerDelay,
} from '@/lib/animationConfig';

interface TraitVariation {
  name: string;
  variationType: 'VISUAL' | 'AUDIO' | 'VIDEO' | 'METADATA';
  visualURI: string;
  audioURI: string;
  videoURI: string;
  metadataJSON: string;
  isActive: boolean;
  activationCount: number;
  lastActivated: number;
}

interface TraitRule {
  triggerType: 'MANUAL' | 'WALLET_EVENT' | 'TIME_BASED' | 'INTERACTION' | 'COMMUNITY_VOTE' | 'BLOCKCHAIN_EVENT';
  threshold: number;
  timeInterval: number;
  isEnabled: boolean;
  variationIndex: number;
}

interface InteractionStats {
  viewCount: number;
  clickCount: number;
  shareCount: number;
  lastInteraction: number;
}

interface TraitVote {
  voteId: string;
  tokenId: string;
  variationIndex: number;
  variationName: string;
  votesFor: number;
  votesAgainst: number;
  endTime: number;
  executed: boolean;
  hasVoted?: boolean;
  userVote?: 'for' | 'against';
}

interface NFT {
  id: string;
  name: string;
  image: string;
  creator: string;
  price: string;
  priceUSD?: string;
  paymentToken?: string;
  likes: number;
  views: number;
  hasDynamicTraits?: boolean;
  traitVariations?: TraitVariation[];
  traitRules?: TraitRule[];
  interactionStats?: InteractionStats;
  traitVotes?: TraitVote[];
  ipfsHash?: string;
  ipfsMetadataUrl?: string;
  ipfsStatus?: 'uploaded' | 'uploading' | 'error' | 'not_uploaded';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  category?: string;
  isListed?: boolean;
  isAuction?: boolean;
  listingId?: string;
  auctionId?: string;
}

const mockTraitVariations: TraitVariation[] = [
  {
    name: 'Day Mode',
    variationType: 'VISUAL',
    visualURI: 'https://images.pexels.com/photos/17298618/pexels-photo-17298618.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    audioURI: '',
    videoURI: '',
    metadataJSON: '{"theme": "day", "brightness": "high"}',
    isActive: true,
    activationCount: 5,
    lastActivated: Date.now()
  },
  {
    name: 'Night Mode',
    variationType: 'VISUAL',
    visualURI: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    audioURI: '',
    videoURI: '',
    metadataJSON: '{"theme": "night", "brightness": "low"}',
    isActive: false,
    activationCount: 3,
    lastActivated: Date.now() - 3600000
  },
  {
    name: 'Ambient Sound',
    variationType: 'AUDIO',
    visualURI: '',
    audioURI: 'https://example.com/ambient.mp3',
    videoURI: '',
    metadataJSON: '{"audio": "ambient"}',
    isActive: false,
    activationCount: 2,
    lastActivated: Date.now() - 7200000
  }
];

const mockTraitRules: TraitRule[] = [
  {
    triggerType: 'WALLET_EVENT',
    threshold: 2,
    timeInterval: 0,
    isEnabled: true,
    variationIndex: 1
  },
  {
    triggerType: 'INTERACTION',
    threshold: 10,
    timeInterval: 0,
    isEnabled: true,
    variationIndex: 2
  },
  {
    triggerType: 'TIME_BASED',
    threshold: 0,
    timeInterval: 30,
    isEnabled: true,
    variationIndex: 0
  }
];

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

const categories = ['All', 'Art', 'Photography', 'Abstract', '3D', 'AI Generated'];

const mockNFTs: NFT[] = Array.from({ length: 12 }, (_, i) => ({
  id: `${i}`,
  name: `AI Masterpiece #${i + 1}`,
  image: `https://images.pexels.com/photos/17298618/pexels-photo-17298618.jpeg?auto=compress&cs=tinysrgb&h=650&w=940`,
  creator: `Creator ${i + 1}`,
  price: `${(Math.random() * 2 + 0.1).toFixed(2)}`,
  priceUSD: `$${(Math.random() * 5000 + 200).toFixed(2)}`,
  paymentToken: i % 3 === 0 ? 'USDC' : 'ETH',
  likes: Math.floor(Math.random() * 1000),
  views: Math.floor(Math.random() * 5000),
  hasDynamicTraits: i % 3 === 0,
  rarity: ['common', 'rare', 'epic', 'legendary'][Math.floor(Math.random() * 4)] as any,
  category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
  isListed: i % 2 === 0,
  isAuction: i % 5 === 0,
  listingId: i % 2 === 0 ? `listing-${i}` : undefined,
  auctionId: i % 5 === 0 ? `auction-${i}` : undefined,
  traitVariations: i % 3 === 0 ? mockTraitVariations : undefined,
  traitRules: i % 3 === 0 ? mockTraitRules : undefined,
  interactionStats: i % 3 === 0 ? {
    viewCount: Math.floor(Math.random() * 500),
    clickCount: Math.floor(Math.random() * 100),
    shareCount: Math.floor(Math.random() * 50),
    lastInteraction: Date.now()
  } : undefined,
  traitVotes: i % 3 === 0 ? [
    {
      voteId: `vote-${i}-1`,
      tokenId: `${i}`,
      variationIndex: 1,
      variationName: 'Night Mode',
      votesFor: 45,
      votesAgainst: 23,
      endTime: Date.now() + 86400000,
      executed: false,
      hasVoted: false
    },
    {
      voteId: `vote-${i}-2`,
      tokenId: `${i}`,
      variationIndex: 2,
      variationName: 'Ambient Sound',
      votesFor: 12,
      votesAgainst: 34,
      endTime: Date.now() - 3600000,
      executed: true,
      hasVoted: true,
      userVote: 'for'
    }
  ] : undefined
}));

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'popular' | 'price-low' | 'price-high';
type StatusFilter = 'all' | 'buy-now' | 'auction';

export default function Gallery() {
  const navigate = useNavigate();
  const [nfts, setNfts] = useState<NFT[]>(mockNFTs);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [likedNFTs, setLikedNFTs] = useState<Set<string>>(new Set());
  const [giftingNFT, setGiftingNFT] = useState<NFT | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]);
  const [selectedRarity, setSelectedRarity] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Fetch marketplace data
  const { listings, loading: listingsLoading } = useMarketListings();
  const { auctions, loading: auctionsLoading } = useMarketAuctions();

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = (nftId: string) => {
    setLikedNFTs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nftId)) {
        newSet.delete(nftId);
      } else {
        newSet.add(nftId);
      }
      return newSet;
    });
  };

  const toggleRarity = (rarity: string) => {
    setSelectedRarity(prev =>
      prev.includes(rarity)
        ? prev.filter(r => r !== rarity)
        : [...prev, rarity]
    );
  };

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || nft.category === selectedCategory;
    const matchesPrice = parseFloat(nft.price) >= priceRange[0] && parseFloat(nft.price) <= priceRange[1];
    const matchesRarity = selectedRarity.length === 0 || (nft.rarity && selectedRarity.includes(nft.rarity));
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'buy-now' && nft.isListed && !nft.isAuction) ||
      (statusFilter === 'auction' && nft.isAuction);
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRarity && matchesStatus;
  });

  const stats = {
    total: nfts.length,
    totalVolume: '1,234.5 ETH',
    floorPrice: '0.15 ETH',
    owners: '892'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-center">
          <RadarScanLoader size="lg" className="mx-auto mb-4" />
          <p className="text-[#ea5c2a] font-mono text-sm">SCANNING_MARKETPLACE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-100 relative overflow-hidden">
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

      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero Header */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 mb-6">
            <ShoppingCart className="w-8 h-8 text-orange-400" />
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-mono font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              MARKETPLACE
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 font-mono">
            Discover and trade unique AI-generated NFTs
          </p>

          {/* Collection Stats */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8"
          >
            {[
              { label: 'Items', value: stats.total, icon: Grid3x3 },
              { label: 'Volume', value: stats.totalVolume, icon: TrendingUp },
              { label: 'Floor', value: stats.floorPrice, icon: Award },
              { label: 'Owners', value: stats.owners, icon: Users }
            ].map((stat, i) => (
              <motion.div key={i} variants={staggerItemVariants}>
                <div className="p-4 rounded-xl text-center bg-[#2a2a2a] border-2 border-[#ea5c2a]/30">
                  <stat.icon className="w-5 h-5 mx-auto mb-2 text-orange-400" />
                  <p className="text-2xl font-bold font-mono text-orange-500 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 font-mono">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <OpenSeaCollectionLink contractAddress={contractAddress} chainId={chainId} />
        </motion.div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={spring.default}
                className="w-80 flex-shrink-0 space-y-6"
              >
                {/* Filter Header */}
                <div className="bg-[#2a2a2a] border-2 border-[#ea5c2a]/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-mono font-bold text-orange-500 flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5" />
                      FILTERS
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-orange-500/20 rounded transition-colors lg:hidden"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-mono text-gray-400 mb-3">STATUS</label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All Items' },
                        { value: 'buy-now', label: 'Buy Now' },
                        { value: 'auction', label: 'Auction' }
                      ].map((status) => (
                        <button
                          key={status.value}
                          onClick={() => setStatusFilter(status.value as StatusFilter)}
                          className={`w-full px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                            statusFilter === status.value
                              ? 'bg-orange-500 text-gray-950 font-bold'
                              : 'bg-gray-950 border border-orange-500/30 text-gray-300 hover:border-orange-500'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-mono text-gray-400 mb-3">
                      PRICE RANGE (ETH)
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])}
                          placeholder="Min"
                          className="flex-1 px-3 py-2 bg-gray-950 border border-orange-500/30 rounded-lg font-mono text-sm text-gray-100 focus:outline-none focus:border-orange-500"
                        />
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value) || 10])}
                          placeholder="Max"
                          className="flex-1 px-3 py-2 bg-gray-950 border border-orange-500/30 rounded-lg font-mono text-sm text-gray-100 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                        className="w-full accent-orange-500"
                      />
                    </div>
                  </div>

                  {/* Rarity Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-mono text-gray-400 mb-3">RARITY</label>
                    <div className="space-y-2">
                      {['common', 'rare', 'epic', 'legendary'].map((rarity) => (
                        <button
                          key={rarity}
                          onClick={() => toggleRarity(rarity)}
                          className={`w-full px-4 py-2 rounded-lg font-mono text-sm capitalize transition-all flex items-center justify-between ${
                            selectedRarity.includes(rarity)
                              ? 'bg-orange-500 text-gray-950 font-bold'
                              : 'bg-gray-950 border border-orange-500/30 text-gray-300 hover:border-orange-500'
                          }`}
                        >
                          <span>{rarity}</span>
                          {selectedRarity.includes(rarity) && (
                            <span className="text-xs">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setPriceRange([0, 10]);
                      setSelectedRarity([]);
                      setStatusFilter('all');
                    }}
                    className="w-full px-4 py-2 bg-gray-950 border border-orange-500/30 rounded-lg font-mono text-sm text-orange-500 hover:bg-orange-500/10 transition-all"
                  >
                    CLEAR ALL
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Category Tabs */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={createStaggerDelay(1, 0.1)}
              className="mb-6"
            >
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2.5 rounded-full text-sm font-mono font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-gray-950 shadow-lg shadow-orange-500/25'
                        : 'bg-gray-900/50 border border-orange-500/30 text-gray-300 hover:text-orange-500 hover:border-orange-500'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Search & Controls */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={createStaggerDelay(2, 0.1)}
              className="mb-8"
            >
              <div className="p-4 rounded-2xl bg-[#2a2a2a] border-2 border-[#ea5c2a]/30">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {/* Search */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or creator..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-950 border border-orange-500/30 rounded-xl font-mono text-gray-100 placeholder-gray-500 focus:bg-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex gap-3 items-center w-full md:w-auto">
                    {/* Toggle Filters (Mobile) */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="md:hidden px-4 py-3 bg-gray-950 border border-orange-500/30 rounded-xl text-orange-500 hover:bg-orange-500/10 transition-all"
                    >
                      <Filter className="w-5 h-5" />
                    </button>

                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="flex-1 md:flex-none px-4 py-3 bg-gray-950 border border-orange-500/30 rounded-xl font-mono text-gray-100 focus:bg-gray-900 focus:border-orange-500 transition-all outline-none cursor-pointer"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>

                    {/* View Mode */}
                    <div className="flex gap-1 p-1 bg-gray-950 rounded-xl border border-orange-500/30">
                      <motion.button
                        whileHover={hoverScale}
                        whileTap={tapScale}
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg transition-all ${
                          viewMode === 'grid'
                            ? 'bg-orange-500 text-gray-950 shadow-lg shadow-orange-500/25'
                            : 'text-gray-400 hover:text-orange-500'
                        }`}
                      >
                        <Grid3x3 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={hoverScale}
                        whileTap={tapScale}
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-lg transition-all ${
                          viewMode === 'list'
                            ? 'bg-orange-500 text-gray-950 shadow-lg shadow-orange-500/25'
                            : 'text-gray-400 hover:text-orange-500'
                        }`}
                      >
                        <List className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* NFT Masonry Grid */}
            <motion.div
              layout
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
              style={{
                gridAutoRows: viewMode === 'grid' ? 'auto' : undefined
              }}
            >
              <AnimatePresence mode="popLayout">
                {filteredNFTs.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    layout
                    variants={staggerItemVariants}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={spring.default}
                  >
                    <div
                      className={`rounded-2xl overflow-hidden cursor-pointer group bg-[#2a2a2a] border-2 border-[#ea5c2a]/30 hover:border-[#ea5c2a] transition-all ${
                        viewMode === 'list' ? 'flex flex-row' : ''
                      }`}
                      onClick={() => setSelectedNFT(nft)}
                    >
                      {/* Image */}
                      <div className={`relative overflow-hidden ${
                        viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square'
                      }`}>
                        {/* Badges */}
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                          {nft.hasDynamicTraits && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: 'spring' }}
                              className="px-2.5 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white text-xs font-bold flex items-center gap-1 shadow-lg"
                            >
                              <Zap className="w-3 h-3" />
                              Dynamic
                            </motion.div>
                          )}
                          {nft.rarity && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: 'spring' }}
                              className={`px-2.5 py-1 bg-gradient-to-r ${rarityColors[nft.rarity]} rounded-full text-white text-xs font-bold shadow-lg capitalize`}
                            >
                              {nft.rarity}
                            </motion.div>
                          )}
                          {nft.isAuction && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.4, type: 'spring' }}
                              className="px-2.5 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white text-xs font-bold shadow-lg flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              Auction
                            </motion.div>
                          )}
                        </div>
                        
                        <motion.img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Hover Actions */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute inset-x-0 bottom-0 p-4 flex gap-2"
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(nft.id);
                            }}
                            className={`p-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg ${
                              likedNFTs.has(nft.id)
                                ? 'bg-pink-500 text-white'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedNFTs.has(nft.id) ? 'fill-current' : ''}`} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all shadow-lg"
                          >
                            <Share2 className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold font-mono text-gray-100 mb-1 group-hover:text-orange-400 transition-colors">
                              {nft.name}
                            </h3>
                            <p className="text-sm text-gray-400 font-mono">by {nft.creator}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between mt-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-mono">PRICE</p>
                            <p className="text-2xl font-bold font-mono text-orange-500">
                              {nft.price} {nft.paymentToken || 'ETH'}
                            </p>
                            {nft.priceUSD && (
                              <p className="text-xs text-gray-400 font-mono">{nft.priceUSD}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Heart className="w-4 h-4" />
                              <span className="font-medium font-mono">{nft.likes}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Eye className="w-4 h-4" />
                              <span className="font-medium font-mono">{nft.views}</span>
                            </div>
                          </div>
                        </div>

                        {/* Buy Now Button */}
                        {nft.isListed && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle buy action
                            }}
                            className="w-full mt-4 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-gray-950 font-mono font-bold rounded-lg transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            {nft.isAuction ? 'PLACE BID' : 'BUY NOW'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredNFTs.length === 0 && (
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold font-mono text-gray-100 mb-2">No NFTs Found</h3>
                <p className="text-gray-400 font-mono">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* NFT Detail Modal */}
      <AnimatePresence>
        {selectedNFT && (
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setSelectedNFT(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full"
            >
              <div className="p-8 rounded-3xl max-h-[90vh] overflow-y-auto bg-[#2a2a2a] border-2 border-[#ea5c2a]/30">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden group">
                    <img
                      src={selectedNFT.image}
                      alt={selectedNFT.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedNFT.rarity && (
                      <div className="absolute top-4 left-4">
                        <div className={`px-3 py-1.5 bg-gradient-to-r ${rarityColors[selectedNFT.rarity]} rounded-full text-white text-sm font-bold shadow-lg capitalize`}>
                          {selectedNFT.rarity}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold font-mono text-gray-100 mb-2">{selectedNFT.name}</h2>
                      <p className="text-gray-400 font-mono">by {selectedNFT.creator}</p>
                    </div>

                    {selectedNFT.ipfsMetadataUrl && (
                      <IPFSMetadataDisplay 
                        ipfsHash={selectedNFT.ipfsHash}
                        metadataUrl={selectedNFT.ipfsMetadataUrl}
                      />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-950 rounded-xl border border-orange-500/30">
                        <p className="text-sm text-gray-400 mb-1 font-mono">Current Price</p>
                        <p className="text-2xl font-bold font-mono text-orange-500">
                          {selectedNFT.price} {selectedNFT.paymentToken || 'ETH'}
                        </p>
                        {selectedNFT.priceUSD && (
                          <p className="text-xs text-gray-400 font-mono mt-1">{selectedNFT.priceUSD}</p>
                        )}
                      </div>
                      <div className="p-4 bg-gray-950 rounded-xl border border-orange-500/30">
                        <p className="text-sm text-gray-400 mb-1 font-mono">Category</p>
                        <p className="text-lg font-semibold font-mono text-gray-100">{selectedNFT.category}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-950 rounded-xl border border-orange-500/30">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span className="font-medium font-mono text-gray-100">{selectedNFT.likes} likes</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-950 rounded-xl border border-orange-500/30">
                        <Eye className="w-4 h-4 text-blue-400" />
                        <span className="font-medium font-mono text-gray-100">{selectedNFT.views} views</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedNFT.isListed && (
                        <button className="w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-gray-950 font-mono font-bold text-lg rounded-lg transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center justify-center gap-2">
                          <ShoppingCart className="w-6 h-6" />
                          {selectedNFT.isAuction ? 'PLACE BID' : 'BUY NOW'}
                        </button>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleLike(selectedNFT.id)}
                          className="flex-1 px-4 py-3 bg-gray-950 border border-orange-500/30 rounded-lg text-gray-100 hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2"
                        >
                          <Heart className={`w-5 h-5 ${likedNFTs.has(selectedNFT.id) ? 'fill-current text-pink-500' : ''}`} />
                        </button>
                        <button className="flex-1 px-4 py-3 bg-gray-950 border border-orange-500/30 rounded-lg text-gray-100 hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>

                      <OpenSeaBadge
                        contractAddress={contractAddress}
                        tokenId={selectedNFT.id}
                        chainId={chainId}
                        variant="button"
                        size="lg"
                        className="w-full"
                      />

                      {/* Quick Actions */}
                      <div className="pt-4 border-t border-orange-500/30">
                        <p className="text-sm text-gray-400 font-mono mb-3">Quick Actions</p>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { icon: Swords, label: 'Battle', color: 'purple', path: '/battles' },
                            { icon: Users, label: 'Collab', color: 'blue', path: '/collaborations' },
                            { icon: Glasses, label: 'AR', color: 'pink', path: '/ar-viewer' },
                            { icon: GitBranch, label: 'Lineage', color: 'green', path: '/provenance' },
                            { icon: Gift, label: 'Gift', color: 'purple', action: () => setGiftingNFT(selectedNFT) }
                          ].map((action, i) => (
                            <button
                              key={i}
                              className="flex flex-col items-center gap-2 p-3 bg-gray-950 border border-orange-500/30 rounded-lg hover:bg-orange-500/10 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (action.action) {
                                  action.action();
                                } else if (action.path) {
                                  navigate(action.path, { state: { nftId: selectedNFT.id } });
                                }
                              }}
                            >
                              <action.icon className={`w-5 h-5 text-${action.color}-400`} />
                              <span className="text-xs font-mono">{action.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Traits Section */}
                {selectedNFT.hasDynamicTraits && selectedNFT.traitVariations && selectedNFT.traitRules && selectedNFT.interactionStats && (
                  <div className="mt-8 pt-8 border-t border-orange-500/30 space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold font-mono text-gray-100 mb-6 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        Dynamic Traits
                      </h3>
                      <DynamicTraitPreview
                        tokenId={selectedNFT.id}
                        variations={selectedNFT.traitVariations}
                        rules={selectedNFT.traitRules}
                        interactionStats={selectedNFT.interactionStats}
                        onActivateVariation={(index) => console.log('Activate variation:', index)}
                        onRecordInteraction={(type) => console.log('Record interaction:', type)}
                        simulationMode={true}
                      />
                    </div>

                    {selectedNFT.traitVotes && (
                      <div className="pt-8 border-t border-orange-500/30">
                        <TraitVotingPanel
                          tokenId={selectedNFT.id}
                          votes={selectedNFT.traitVotes}
                          onCreateVote={(variationIndex, duration) => console.log('Create vote:', variationIndex, duration)}
                          onCastVote={(voteId, support) => console.log('Cast vote:', voteId, support)}
                          onExecuteVote={(voteId) => console.log('Execute vote:', voteId)}
                          canCreateVote={true}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift Wrap Modal */}
      {giftingNFT && (
        <GiftWrapModal
          isOpen={!!giftingNFT}
          onClose={() => setGiftingNFT(null)}
          tokenId={parseInt(giftingNFT.id)}
          tokenUri={giftingNFT.image}
          onSuccess={() => {
            setGiftingNFT(null);
            setSelectedNFT(null);
          }}
        />
      )}
    </div>
  );
}
