import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { AIGenerator, GeneratedContent } from '@/components/AIGenerator';
import { PreviewPanel } from '@/components/PreviewPanel';
import { ManualCreator } from '@/components/ManualCreator';
import { MintAnimation } from '@/components/MintAnimation';
import { CopyrightAudit, generateAuditHash } from '@/components/CopyrightAudit';
import { contractAddress, contractABI, NFTType, GenerationMethod } from '@/utils/evmConfig';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [currentContent, setCurrentContent] = useState<GeneratedContent | null>(null);
  const [generationMethod, setGenerationMethod] = useState<GenerationMethod>(GenerationMethod.AI_GENERATED);
  const [showMintAnimation, setShowMintAnimation] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleGenerate = (type: NFTType, content: GeneratedContent) => {
    setCurrentContent(content);
    setGenerationMethod(GenerationMethod.AI_GENERATED);
  };

  const handleUpload = (content: GeneratedContent, method: GenerationMethod) => {
    setCurrentContent(content);
    setGenerationMethod(method);
  };

  const handleRemake = () => {
    setCurrentContent(null);
  };

  const handleConfirmMint = async () => {
    if (!currentContent || !isConnected || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet and generate content first',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate copyright audit hash
      const auditHash = await generateAuditHash(currentContent);

      // In production, upload to IPFS and get URI
      const tokenURI = `ipfs://placeholder/${Date.now()}`;

      // Mint NFT
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'mint',
        args: [
          address,
          tokenURI,
          currentContent.type,
          generationMethod,
          auditHash as `0x${string}`,
        ],
      });

      // Show mint animation
      setShowMintAnimation(true);
    } catch (error) {
      console.error('Minting error:', error);
      toast({
        title: 'Minting Failed',
        description: 'There was an error minting your NFT',
        variant: 'destructive',
      });
    }
  };

  const handleAnimationComplete = () => {
    setShowMintAnimation(false);
    setCurrentContent(null);
    
    toast({
      title: 'Success!',
      description: 'Your NFT has been minted successfully',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {!isConnected ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="text-center max-w-lg space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-border">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-mono tracking-tight text-primary">
                  // KŌBO_NFT_FORGE
                </h1>
                <p className="text-base text-muted-foreground max-w-md mx-auto">
                  Create and mint unique NFTs with AI generation or upload your own artwork
                </p>
              </div>
              <div className="pt-4">
                <ConnectButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center space-y-2 pb-8">
              <h1 className="text-3xl lg:text-4xl font-mono tracking-tight text-primary">
                // CREATE_YOUR_NFT
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                GENERATE_WITH_AI // UPLOAD_MANUALLY // PREVIEW_AND_MINT
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column - Creation Tools */}
              <div className="space-y-6">
                <AIGenerator onGenerate={handleGenerate} />
                <ManualCreator onUpload={handleUpload} />
              </div>

              {/* Right Column - Preview & Audit */}
              <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
                <PreviewPanel
                  content={currentContent}
                  onRemake={handleRemake}
                  onConfirm={handleConfirmMint}
                />
                <CopyrightAudit content={currentContent} />
              </div>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {(isPending || isConfirming) && (
          <div className="fixed bottom-8 right-8 bg-card border border-primary/30 rounded-xl p-5 max-w-sm shadow-2xl">
            <p className="text-sm font-mono font-medium mb-3 text-foreground">
              {isPending && '// CONFIRM_TRANSACTION_IN_WALLET...'}
              {isConfirming && '// MINTING_NFT...'}
            </p>
            <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        )}
      </main>

      {/* Mint Animation */}
      <MintAnimation
        isOpen={showMintAnimation}
        onComplete={handleAnimationComplete}
        nftImage={currentContent?.url}
      />
    </div>
  );
}
