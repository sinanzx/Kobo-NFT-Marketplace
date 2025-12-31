import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, Wand2, Eye, Rocket, CheckCircle2, Loader2 } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { FogLayer, GlowOrb, ParticleSystem, MetalShine } from '@/components/effects/AtmosphericEffects';
import { SciFiKeyboard } from '@/components/ui/sci-fi-keyboard';
import { RemakeConfirmControls } from './RemakeConfirmControls';
import { ComplianceResultsModal } from '@/components/compliance/ComplianceResultsModal';
import { useCopyrightPrecheck } from '@/hooks/useCopyrightPrecheck';
import { useToast } from '@/hooks/use-toast';
import { ipfsService, type UploadProgress } from '@/lib/ipfsService';

type MintingPhase = 'select' | 'ai-generate' | 'preview' | 'minting' | 'success';

interface MintingFlowProps {
  onComplete?: (nftData: any) => void;
}

export default function MintingFlow({ onComplete }: MintingFlowProps) {
  const [phase, setPhase] = useState<MintingPhase>('select');
  const [creationMode, setCreationMode] = useState<'ai' | 'manual' | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
  });
  const [mintProgress, setMintProgress] = useState(0);
  const [remakeCount, setRemakeCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [complianceScanResult, setComplianceScanResult] = useState<any>(null);
  const [ipfsProgress, setIpfsProgress] = useState<UploadProgress | null>(null);
  const [ipfsHashes, setIpfsHashes] = useState<{ mediaHash: string; metadataHash: string } | null>(null);
  
  const { performPrecheck, loading: complianceLoading } = useCopyrightPrecheck();
  const { toast } = useToast();

  const handleModeSelect = (mode: 'ai' | 'manual') => {
    setCreationMode(mode);
    setPhase(mode === 'ai' ? 'ai-generate' : 'preview');
  };

  const handleGenerate = async () => {
    // Simulate AI generation
    setIsGenerating(true);
    setMintProgress(0);
    const interval = setInterval(() => {
      setMintProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGeneratedImage('https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg?auto=compress&cs=tinysrgb&h=650&w=940');
          setPhase('preview');
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRemake = async () => {
    setRemakeCount(prev => prev + 1);
    setIsGenerating(true);
    setMintProgress(0);
    
    const interval = setInterval(() => {
      setMintProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Generate different image for remake
          const images = [
            'https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
          ];
          setGeneratedImage(images[remakeCount % images.length]);
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleMint = async () => {
    // Perform copyright compliance check before minting
    const result = await performPrecheck({
      promptText: prompt || metadata.description,
      aiEngine: 'stable-diffusion',
      outputType: 'image',
      outputUrl: generatedImage || undefined,
    });

    // Transform result to ComplianceScanResult format
    const scanResult = {
      status: result.success ? 'passed' : (result.errorType === 'COPYRIGHT_VIOLATION' ? 'blocked' : 'warning'),
      outputId: result.outputId,
      scanTimestamp: new Date().toISOString(),
      flaggedTerms: result.flaggedTerms,
      flaggedCategories: result.categories,
      blockedContent: result.errorType ? [{
        type: result.errorType === 'COPYRIGHT_VIOLATION' ? 'copyright' : 'restricted_term',
        term: result.flaggedTerms?.[0] || 'Unknown',
        reason: result.error || 'Content flagged by compliance system',
        documentationUrl: 'https://docs.example.com/compliance',
      }] : undefined,
      recommendations: result.success ? [] : ['Review flagged content', 'Modify prompt or content', 'Contact support if needed'],
      aiEngine: 'stable-diffusion',
      outputType: 'image',
      complianceScore: result.success ? 100 : 50,
    };

    setComplianceScanResult(scanResult);
    setShowComplianceModal(true);

    // If compliance check fails, stop here and show modal
    if (!result.success) {
      return;
    }

    // If compliance passes, proceed with minting
    proceedWithMint();
  };

  const proceedWithMint = async () => {
    setShowComplianceModal(false);
    setPhase('minting');
    setMintProgress(0);
    
    try {
      // Check if IPFS is configured
      if (!ipfsService.isConfigured()) {
        toast({
          title: 'IPFS Not Configured',
          description: 'Please set up Pinata API keys in environment variables to enable IPFS uploads.',
          variant: 'destructive',
        });
        setPhase('preview');
        return;
      }

      // Convert image URL to blob for upload
      if (!generatedImage) {
        throw new Error('No image to upload');
      }

      const imageBlob = await fetch(generatedImage).then(r => r.blob());
      
      // Upload to IPFS with progress tracking
      const result = await ipfsService.uploadNFT(
        imageBlob,
        {
          name: metadata.name || 'Kobo NFT',
          description: metadata.description || prompt,
          attributes: [
            { trait_type: 'Generation Method', value: creationMode === 'ai' ? 'AI Generated' : 'Manual Upload' },
            { trait_type: 'Prompt', value: prompt || 'N/A' },
            { trait_type: 'Remake Count', value: remakeCount },
          ],
          properties: {
            type: 'IMAGE',
            generationMethod: creationMode === 'ai' ? 'AI_GENERATED' : 'MANUAL_UPLOAD',
            creator: 'User', // Will be replaced with actual wallet address
          },
        },
        'kobo-nft.png',
        (progress) => {
          setIpfsProgress(progress);
          setMintProgress(progress.progress);
        }
      );

      setIpfsHashes({
        mediaHash: result.mediaHash,
        metadataHash: result.metadataHash,
      });

      toast({
        title: 'IPFS Upload Complete',
        description: `Metadata uploaded to IPFS: ${result.metadataHash}`,
      });

      // Simulate blockchain minting
      setMintProgress(100);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPhase('success');
      setTimeout(() => {
        onComplete?.({
          metadata,
          image: generatedImage,
          ipfsMetadataUrl: result.metadataUrl,
          ipfsHashes: result,
        });
      }, 3000);
    } catch (error) {
      console.error('Minting error:', error);
      toast({
        title: 'Minting Failed',
        description: error instanceof Error ? error.message : 'Failed to mint NFT',
        variant: 'destructive',
      });
      setPhase('preview');
    }
  };

  const handleComplianceModalChange = (open: boolean) => {
    setShowComplianceModal(open);
    if (!open && complianceScanResult?.status === 'passed') {
      proceedWithMint();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Atmospheric Effects */}
      <FogLayer />
      <ParticleSystem count={20} />
      <GlowOrb color="purple" size="lg" position="top-right" />
      <GlowOrb color="pink" size="md" position="bottom-left" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* Phase 1: Mode Selection */}
          {phase === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Create Your NFT
                </h1>
                <p className="text-xl text-gray-400">Choose how you want to create your masterpiece</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* AI Generate Card */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <GlassCard
                    variant="metal"
                    className="p-8 rounded-3xl cursor-pointer h-full"
                    whileHover={{ scale: 1.02, rotateY: 5 }}
                    onClick={() => handleModeSelect('ai')}
                  >
                    <div className="relative">
                      <MetalShine />
                      <div className="relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                          <Wand2 className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4 text-center">AI Generate</h3>
                        <p className="text-gray-400 text-center mb-6">
                          Use AI to create stunning, unique artwork from your imagination
                        </p>
                        <ul className="space-y-3 mb-8">
                          {['Text-to-image generation', 'Multiple AI models', 'Style customization', 'Instant results'].map((feature, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              className="flex items-center gap-2 text-gray-300"
                            >
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              {feature}
                            </motion.li>
                          ))}
                        </ul>
                        <GlassButton variant="primary" className="w-full" size="lg">
                          Start Creating
                          <Sparkles className="w-5 h-5" />
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Manual Upload Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <GlassCard
                    variant="metal"
                    className="p-8 rounded-3xl cursor-pointer h-full"
                    whileHover={{ scale: 1.02, rotateY: -5 }}
                    onClick={() => handleModeSelect('manual')}
                  >
                    <div className="relative">
                      <MetalShine />
                      <div className="relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                          <Upload className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4 text-center">Manual Upload</h3>
                        <p className="text-gray-400 text-center mb-6">
                          Upload your own artwork and add rich metadata
                        </p>
                        <ul className="space-y-3 mb-8">
                          {['Upload images, videos, audio', 'Full metadata control', 'Provenance tracking', 'Copyright verification'].map((feature, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.1 }}
                              className="flex items-center gap-2 text-gray-300"
                            >
                              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                              {feature}
                            </motion.li>
                          ))}
                        </ul>
                        <GlassButton variant="primary" className="w-full" size="lg">
                          Upload Artwork
                          <Upload className="w-5 h-5" />
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Phase 2: AI Generation */}
          {phase === 'ai-generate' && (
            <motion.div
              key="ai-generate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <GlassCard className="p-8 rounded-3xl">
                <h2 className="text-4xl font-bold text-white mb-8 text-center">AI Art Generator</h2>
                
                <div className="space-y-6">
                  {/* Sci-Fi Prompt Input */}
                  <SciFiKeyboard
                    value={prompt}
                    onChange={setPrompt}
                    placeholder="Describe your vision... (e.g., 'A futuristic cityscape at sunset with flying cars')"
                    suggestions={[
                      'Cyberpunk warrior in neon city',
                      'Abstract galaxy with swirling nebulas',
                      'Neon dragon breathing holographic fire',
                      'Crystal palace floating in clouds',
                      'Steampunk airship at golden hour',
                    ]}
                    trendingPrompts={[
                      { text: 'Cyberpunk samurai in neon-lit Tokyo', category: 'Image', uses: 1247 },
                      { text: 'Abstract liquid metal flowing through space', category: 'Video', uses: 892 },
                      { text: 'Futuristic glass architecture in a forest', category: 'Image', uses: 634 },
                    ]}
                    onSuggestionSelect={(suggestion) => setPrompt(suggestion)}
                  />

                  {/* Generate Button */}
                  <GlassButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={!prompt || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Artwork
                        <Wand2 className="w-5 h-5" />
                      </>
                    )}
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Phase 3: Preview & Metadata */}
          {phase === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* Preview */}
                <GlassCard className="p-6 rounded-3xl">
                  <h3 className="text-2xl font-bold text-white mb-4">Preview</h3>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800 group cursor-zoom-in"
                  >
                    {generatedImage && (
                      <>
                        <img
                          src={generatedImage}
                          alt="Generated NFT"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </>
                    )}
                  </motion.div>
                </GlassCard>

                {/* Metadata Form */}
                <GlassCard className="p-6 rounded-3xl">
                  <h3 className="text-2xl font-bold text-white mb-4">NFT Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={metadata.name}
                        onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                        placeholder="My Awesome NFT"
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={metadata.description}
                        onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                        placeholder="Describe your NFT..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none resize-none"
                      />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Minting Cost</span>
                        <span className="text-lg font-bold text-white">0.05 ETH</span>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-sm text-gray-400">Gas Fee (est.)</span>
                        <span className="text-sm text-gray-300">~$5.00</span>
                      </div>
                      
                      {/* Remake/Confirm Controls */}
                      <RemakeConfirmControls
                        onRemake={handleRemake}
                        onConfirm={handleMint}
                        remakeCount={remakeCount}
                        maxRemakes={5}
                        isGenerating={isGenerating || complianceLoading}
                        showCancel={false}
                      />
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* Phase 4: Minting Progress */}
          {phase === 'minting' && (
            <motion.div
              key="minting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <GlassCard className="p-12 rounded-3xl text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-32 h-32 mx-auto mb-8"
                >
                  <div className="relative w-full h-full">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * mintProgress) / 100}
                        style={{ transformOrigin: 'center' }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{Math.round(mintProgress)}%</span>
                    </div>
                  </div>
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-4">Minting Your NFT</h2>
                <p className="text-gray-400 mb-8">Please wait while we create your masterpiece on the blockchain</p>

                {ipfsProgress && (
                  <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <p className="text-sm text-purple-300">{ipfsProgress.message}</p>
                  </div>
                )}

                <div className="space-y-3 text-left max-w-md mx-auto">
                  {[
                    { label: 'Uploading to IPFS', stage: 'uploading_media', order: 0 },
                    { label: 'Creating metadata', stage: 'uploading_metadata', order: 1 },
                    { label: 'Minting NFT', stage: 'minting', order: 2 },
                    { label: 'Confirming transaction', stage: 'confirming', order: 3 }
                  ].map((step, i) => {
                    const stageOrder = ipfsProgress?.stage === 'uploading_media' ? 0 : 
                                      ipfsProgress?.stage === 'uploading_metadata' ? 1 : 
                                      ipfsProgress?.stage === 'complete' ? 4 : -1;
                    const isComplete = ipfsProgress ? stageOrder > step.order : mintProgress > (i * 25);
                    const isActive = ipfsProgress ? ipfsProgress.stage === step.stage : false;
                    
                    return (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex items-center gap-3"
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                        )}
                        <span className={isComplete ? 'text-white' : isActive ? 'text-purple-300' : 'text-gray-400'}>
                          {step.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Phase 5: Success */}
          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-2xl opacity-50"
                  />
                  <CheckCircle2 className="relative w-32 h-32 text-green-500" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-bold text-white mb-4"
              >
                NFT Minted Successfully!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-400 mb-8"
              >
                Your masterpiece is now on the blockchain
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 justify-center"
              >
                <GlassButton variant="primary" size="lg">
                  View NFT
                  <Eye className="w-5 h-5" />
                </GlassButton>
                <GlassButton variant="glass" size="lg">
                  Share
                  <Sparkles className="w-5 h-5" />
                </GlassButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compliance Results Modal */}
      {complianceScanResult && (
        <ComplianceResultsModal
          open={showComplianceModal}
          onOpenChange={handleComplianceModalChange}
          scanResult={complianceScanResult}
          onProceed={proceedWithMint}
          onCancel={() => setShowComplianceModal(false)}
        />
      )}
    </div>
  );
}
