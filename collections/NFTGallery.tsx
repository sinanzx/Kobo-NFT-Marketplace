import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid3x3, List, Eye, Heart, Share2, MoreVertical, Zap, Swords, Users, Glasses, ExternalLink, GitBranch, Gift } from 'lucide-react';
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
}

// Mock trait variations
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

// Mock data
const mockNFTs: NFT[] = Array.from({ length: 12 }, (_, i) => ({
  id: `${i}`,
  name: `AI Masterpiece #${i + 1}`,
  image: `https://images.pexels.com/photos/17298618/pexels-photo-17298618.jpeg?auto=compress&cs=tinysrgb&h=650&w=940`,
  creator: `Creator ${i + 1}`,
  price: `${(Math.random() * 2 + 0.1).toFixed(2)} ETH`,
  likes: Math.floor(Math.random() * 1000),
  views: Math.floor(Math.random() * 5000),
  hasDynamicTraits: i % 3 === 0,
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

export default function NFTGallery() {
  const navigate = useNavigate();
  const [nfts, setNfts] = useState<NFT[]>(mockNFTs);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [likedNFTs, setLikedNFTs] = useState<Set<string>>(new Set());
  const [giftingNFT, setGiftingNFT] = useState<NFT | null>(null);

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

  const filteredNFTs = nfts.filter(nft =>
    nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Atmospheric Effects */}
      <FogLayer />
      <ParticleSystem count={15} />
      <GlowOrb color="purple" size="lg" position="top-left" />
      <GlowOrb color="cyan" size="md" position="bottom-right" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              NFT Collection
            </h1>
            <OpenSeaCollectionLink contractAddress={contractAddress} chainId={chainId} />
          </div>
          <p className="text-xl text-gray-400">Discover unique AI-generated masterpieces</p>
        </motion.div>

        {/* Filters & Controls */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={createStaggerDelay(1, 0.1)}
          className="mb-8"
        >
          <GlassCard className="p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search NFTs..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                />
              </div>

              {/* Sort & View Controls */}
              <div className="flex gap-3 items-center">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-purple-500/50 transition-all outline-none cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                  <motion.button
                    whileHover={hoverScale}
                    whileTap={tapScale}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={hoverScale}
                    whileTap={tapScale}
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* NFT Grid */}
        <motion.div
          layout
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
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
                <GlassCard
                  className={`rounded-2xl overflow-hidden cursor-pointer ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={spring.snappy}
                  onClick={() => setSelectedNFT(nft)}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden group ${
                    viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'
                  }`}>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                      {nft.hasDynamicTraits && (
                        <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Dynamic
                        </div>
                      )}
                      {nft.ipfsHash && (
                        <IPFSStatusBadge 
                          ipfsHash={nft.ipfsHash} 
                          status={nft.ipfsStatus || 'uploaded'}
                          showGatewayLink={false}
                        />
                      )}
                    </div>
                    {/* OpenSea Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <OpenSeaBadge
                        contractAddress={contractAddress}
                        tokenId={nft.id}
                        chainId={chainId}
                        variant="badge"
                        size="sm"
                      />
                    </div>
                    <motion.img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay on hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4"
                    >
                      <div className="flex gap-2 w-full">
                        <motion.button
                          whileHover={{ scale: 1.15, rotate: likedNFTs.has(nft.id) ? 0 : 10 }}
                          whileTap={{ scale: 0.85 }}
                          transition={spring.bouncy}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(nft.id);
                          }}
                          className={`p-2 rounded-lg backdrop-blur-md transition-colors ${
                            likedNFTs.has(nft.id)
                              ? 'bg-pink-500 text-white'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedNFTs.has(nft.id) ? 'fill-current' : ''}`} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15, rotate: -5 }}
                          whileTap={{ scale: 0.85 }}
                          transition={spring.snappy}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          transition={spring.snappy}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-colors ml-auto"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{nft.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">by {nft.creator}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-lg font-bold text-white">{nft.price}</p>
                      </div>
                      
                      <div className="flex gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{nft.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{nft.views}</span>
                        </div>
                      </div>
                    </div>

                    {viewMode === 'list' && (
                      <div className="mt-4">
                        <GlassButton variant="primary" size="sm" className="w-full">
                          View Details
                        </GlassButton>
                      </div>
                    )}
                  </div>
                </GlassCard>
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
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No NFTs Found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </motion.div>
        )}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full"
            >
              <GlassCard className="p-8 rounded-3xl max-h-[90vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <img
                      src={selectedNFT.image}
                      alt={selectedNFT.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedNFT.name}</h2>
                    <p className="text-gray-400 mb-4">by {selectedNFT.creator}</p>

                    {/* IPFS Metadata Display */}
                    {selectedNFT.ipfsMetadataUrl && (
                      <IPFSMetadataDisplay 
                        ipfsHash={selectedNFT.ipfsHash}
                        metadataUrl={selectedNFT.ipfsMetadataUrl}
                        className="mb-6"
                      />
                    )}

                    <div className="space-y-4 mb-8">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Current Price</p>
                        <p className="text-3xl font-bold text-white">{selectedNFT.price}</p>
                      </div>

                      <div className="flex gap-6">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Likes</p>
                          <p className="text-xl font-bold text-white">{selectedNFT.likes}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Views</p>
                          <p className="text-xl font-bold text-white">{selectedNFT.views}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <GlassButton variant="primary" size="lg" className="flex-1">
                          Buy Now
                        </GlassButton>
                        <GlassButton
                          variant="glass"
                          size="lg"
                          onClick={() => handleLike(selectedNFT.id)}
                        >
                          <Heart className={`w-5 h-5 ${likedNFTs.has(selectedNFT.id) ? 'fill-current text-pink-500' : ''}`} />
                        </GlassButton>
                        <GlassButton variant="glass" size="lg">
                          <Share2 className="w-5 h-5" />
                        </GlassButton>
                      </div>

                      {/* OpenSea Link */}
                      <OpenSeaBadge
                        contractAddress={contractAddress}
                        tokenId={selectedNFT.id}
                        chainId={chainId}
                        variant="button"
                        size="lg"
                        className="w-full"
                      />

                      {/* Cross-Feature Actions */}
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-gray-400 mb-3">Use this NFT in:</p>
                        <div className="grid grid-cols-4 gap-2">
                          <GlassButton
                            variant="glass"
                            size="sm"
                            className="flex-col gap-2 h-auto py-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/battles', { state: { nftId: selectedNFT.id } });
                            }}
                          >
                            <Swords className="w-5 h-5 text-purple-400" />
                            <span className="text-xs">Battle</span>
                          </GlassButton>
                          <GlassButton
                            variant="glass"
                            size="sm"
                            className="flex-col gap-2 h-auto py-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/collaborations', { state: { nftId: selectedNFT.id } });
                            }}
                          >
                            <Users className="w-5 h-5 text-blue-400" />
                            <span className="text-xs">Collab</span>
                          </GlassButton>
                          <GlassButton
                            variant="glass"
                            size="sm"
                            className="flex-col gap-2 h-auto py-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/ar-viewer', { state: { nftId: selectedNFT.id } });
                            }}
                          >
                            <Glasses className="w-5 h-5 text-pink-400" />
                            <span className="text-xs">AR View</span>
                          </GlassButton>
                          <GlassButton
                            variant="glass"
                            size="sm"
                            className="flex-col gap-2 h-auto py-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/provenance?tokenId=${selectedNFT.id}`);
                            }}
                          >
                            <GitBranch className="w-5 h-5 text-green-400" />
                            <span className="text-xs">Lineage</span>
                          </GlassButton>
                          <GlassButton
                            variant="glass"
                            size="sm"
                            className="flex-col gap-2 h-auto py-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGiftingNFT(selectedNFT);
                            }}
                          >
                            <Gift className="w-5 h-5 text-purple-400" />
                            <span className="text-xs">Gift</span>
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Traits Section */}
                {selectedNFT.hasDynamicTraits && selectedNFT.traitVariations && selectedNFT.traitRules && selectedNFT.interactionStats && (
                  <div className="mt-8 pt-8 border-t border-white/10 space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
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

                    {/* Community Voting */}
                    {selectedNFT.traitVotes && (
                      <div className="pt-8 border-t border-white/10">
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
              </GlassCard>
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
