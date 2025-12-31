import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Upload, Image as ImageIcon, Video, FileText, Plus, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contractAddress, contractABI, NFTType, GenerationMethod } from '@/utils/evmConfig';
import { generateAuditHash } from '@/components/CopyrightAudit';

interface TraitInput {
  id: string;
  name: string;
  value: string;
}

interface FormData {
  name: string;
  description: string;
  file: File | null;
  filePreview: string | null;
  fileType: 'image' | 'video' | null;
  traits: TraitInput[];
}

export default function Create() {
  const { address, isConnected } = useAccount();
  
  // DEV MODE: Force connected state
  const devMode = true;
  const forceConnected = devMode ? true : isConnected;
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    file: null,
    filePreview: null,
    fileType: null,
    traits: [],
  });
  const [mintStatus, setMintStatus] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Add status messages
  const addStatus = (message: string) => {
    setMintStatus((prev) => [...prev, `> ${message}`]);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
    
    if (!fileType) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image or video file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        file,
        filePreview: reader.result as string,
        fileType,
      }));
      addStatus(`File loaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Add trait
  const addTrait = () => {
    setFormData((prev) => ({
      ...prev,
      traits: [...prev.traits, { id: Date.now().toString(), name: '', value: '' }],
    }));
  };

  // Remove trait
  const removeTrait = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      traits: prev.traits.filter((t) => t.id !== id),
    }));
  };

  // Update trait
  const updateTrait = (id: string, field: 'name' | 'value', value: string) => {
    setFormData((prev) => ({
      ...prev,
      traits: prev.traits.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    }));
  };

  // Handle mint
  const handleMint = async () => {
    if (!isConnected || !address) {
      toast({
        title: '// ACCESS_DENIED',
        description: 'SECURE_LINK_REQUIRED. CONNECT WALLET TO INITIALIZE MINT.',
        variant: 'security' as any,
      });
      return;
    }

    if (!formData.file || !formData.name) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name and upload a file',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      setMintStatus([]);
      addStatus('Initializing mint process...');
      
      // Simulate IPFS upload
      addStatus('Uploading to IPFS...');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const tokenURI = `ipfs://placeholder/${Date.now()}`;
      addStatus(`IPFS Upload Complete: ${tokenURI.substring(0, 30)}...`);

      // Generate copyright audit hash
      addStatus('Generating copyright audit hash...');
      const auditHash = await generateAuditHash({
        url: formData.filePreview!,
        prompt: formData.description,
        model: 'manual-upload',
      });
      addStatus('Audit hash generated');

      // Prepare for minting
      addStatus('Preparing transaction...');
      const nftType = formData.fileType === 'image' ? NFTType.IMAGE : NFTType.VIDEO;
      
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'mint',
        args: [
          address,
          tokenURI,
          nftType,
          GenerationMethod.MANUAL_UPLOAD,
          auditHash as `0x${string}`,
        ],
      });

      addStatus('Transaction submitted to blockchain...');
    } catch (error) {
      console.error('Minting error:', error);
      addStatus('ERROR: Minting failed');
      toast({
        title: 'Minting Failed',
        description: 'There was an error minting your NFT',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Watch for transaction confirmation
  useEffect(() => {
    if (isConfirming) {
      addStatus('Waiting for blockchain confirmation...');
    }
    if (isSuccess) {
      addStatus('SUCCESS: NFT minted successfully!');
      addStatus(`Transaction hash: ${hash?.substring(0, 20)}...`);
      toast({
        title: 'Mint Successful!',
        description: 'Your NFT has been minted',
      });
      
      // Reset form
      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          file: null,
          filePreview: null,
          fileType: null,
          traits: [],
        });
        setMintStatus([]);
      }, 3000);
    }
  }, [isConfirming, isSuccess, hash, toast]);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#fcfaff]">
      {/* Header */}
      <header className="border-b-2 border-[#ea5c2a] bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-mono font-bold tracking-wider text-[#ea5c2a]">
            ASSET_FABRICATION_STATION <span className="text-gray-600">//</span> v2.1
          </h1>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!forceConnected ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <div className="text-center space-y-6 border-2 border-[#ea5c2a] bg-[#252525] p-12">
              <div className="text-6xl">🔒</div>
              <h2 className="text-2xl font-mono text-[#ea5c2a] uppercase">ACCESS DENIED</h2>
              <p className="text-gray-400 font-mono uppercase text-sm">// Connect wallet to access fabrication station</p>
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - THE CONTROLS */}
            <div className="space-y-6">
              <div className="border-2 border-[#333] bg-[#252525] p-6">
                <h2 className="text-xl font-mono font-bold text-[#ea5c2a] mb-6 flex items-center gap-2 uppercase">
                  <span className="w-2 h-2 bg-[#ea5c2a] rounded-full animate-pulse"></span>
                  // CONTROL_PANEL
                </h2>

                {/* File Upload - Scanner Plate */}
                <div className="mb-6">
                  <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">
                    // MEDIA_FILE
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="group flex flex-col items-center justify-center gap-3 w-full p-8 border-2 border-dashed border-[#ea5c2a]/50 bg-[#1e1e1e] cursor-pointer hover:border-[#ea5c2a] hover:bg-[#252525] transition-all relative overflow-hidden"
                    >
                      {/* Scanning animation on hover */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ea5c2a]/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-linear"></div>
                      
                      <Upload className="w-8 h-8 text-[#ea5c2a] relative z-10" />
                      <span className="font-mono text-sm text-gray-400 uppercase relative z-10">
                        {formData.file ? `[${formData.file.name}]` : '[ SCANNER_PLATE: AWAITING_INPUT ]'}
                      </span>
                      <span className="font-mono text-xs text-gray-600 relative z-10">// Click to upload asset</span>
                    </label>
                  </div>
                </div>

                {/* Name Input - Dark Terminal */}
                <div className="mb-6">
                  <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">
                    // ASSET_NAME
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-[#333] font-mono text-[#fcfaff] focus:outline-none focus:border-[#ea5c2a] transition-colors placeholder:text-gray-600"
                    placeholder="enter_asset_identifier..."
                  />
                </div>

                {/* Description Input - Dark Terminal */}
                <div className="mb-6">
                  <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">
                    // DESCRIPTION
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-[#333] font-mono text-[#fcfaff] focus:outline-none focus:border-[#ea5c2a] transition-colors resize-none placeholder:text-gray-600"
                    placeholder="enter_asset_metadata..."
                  />
                </div>

                {/* Traits - Dark Terminal */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-mono text-gray-500 uppercase">
                      // TRAIT_CONFIG
                    </label>
                    <button
                      onClick={addTrait}
                      className="flex items-center gap-2 px-3 py-1 bg-transparent border border-[#ea5c2a] font-mono text-xs text-[#ea5c2a] hover:bg-[#ea5c2a] hover:text-black transition-all uppercase"
                    >
                      <Plus className="w-3 h-3" />
                      ADD
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.traits.map((trait) => (
                      <div key={trait.id} className="flex gap-2">
                        <input
                          type="text"
                          value={trait.name}
                          onChange={(e) => updateTrait(trait.id, 'name', e.target.value)}
                          placeholder="trait_key"
                          className="flex-1 px-0 py-2 bg-transparent border-0 border-b-2 border-[#333] font-mono text-sm text-[#fcfaff] focus:outline-none focus:border-[#ea5c2a] transition-colors placeholder:text-gray-600"
                        />
                        <input
                          type="text"
                          value={trait.value}
                          onChange={(e) => updateTrait(trait.id, 'value', e.target.value)}
                          placeholder="value"
                          className="flex-1 px-0 py-2 bg-transparent border-0 border-b-2 border-[#333] font-mono text-sm text-[#fcfaff] focus:outline-none focus:border-[#ea5c2a] transition-colors placeholder:text-gray-600"
                        />
                        <button
                          onClick={() => removeTrait(trait.id)}
                          className="px-3 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/20 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - THE VIEWPORT */}
            <div className="space-y-6">
              <div className="border-2 border-[#333] bg-[#252525] p-6">
                <h2 className="text-xl font-mono font-bold text-[#ea5c2a] mb-6 flex items-center gap-2 uppercase">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  // VIEWPORT
                </h2>

                {/* Holographic Container with Corner Brackets */}
                <div className="bg-[#1e1e1e] border-2 border-[#ea5c2a]/50 overflow-hidden relative">
                  {/* Corner Brackets Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {/* Top-left bracket */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ea5c2a]"></div>
                    {/* Top-right bracket */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ea5c2a]"></div>
                    {/* Bottom-left bracket */}
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ea5c2a]"></div>
                    {/* Bottom-right bracket */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ea5c2a]"></div>
                  </div>

                  {/* Status Label */}
                  <div className="absolute top-2 right-2 z-20 bg-black/80 border border-[#ea5c2a] px-3 py-1">
                    <span className="font-mono text-xs text-[#ea5c2a] uppercase">
                      STATUS: {formData.file ? 'LOADED' : 'AWAITING_MINT'}
                    </span>
                  </div>

                  {/* Floating Data Labels */}
                  {formData.file && (
                    <>
                      <div className="absolute top-2 left-2 z-20 bg-black/80 border border-[#ea5c2a]/50 px-2 py-1">
                        <span className="font-mono text-xs text-green-400">
                          SIZE: {(formData.file.size / 1024 / 1024).toFixed(2)}MB
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 z-20 bg-black/80 border border-[#ea5c2a]/50 px-2 py-1">
                        <span className="font-mono text-xs text-green-400">
                          FMT: {formData.fileType?.toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 z-20 bg-black/80 border border-[#ea5c2a]/50 px-2 py-1">
                        <span className="font-mono text-xs text-green-400">
                          IPFS: READY
                        </span>
                      </div>
                    </>
                  )}

                  {/* Crosshair Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {/* Horizontal crosshair */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#ea5c2a]/30"></div>
                    {/* Vertical crosshair */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#ea5c2a]/30"></div>
                  </div>

                  {/* Media Preview */}
                  <div className="aspect-square bg-[#1e1e1e] flex items-center justify-center border-b-2 border-[#ea5c2a]/30">
                    {formData.filePreview ? (
                      formData.fileType === 'image' ? (
                        <img
                          src={formData.filePreview}
                          alt="Preview"
                          className="w-full h-full object-cover animate-glitch"
                        />
                      ) : (
                        <video
                          src={formData.filePreview}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )
                    ) : (
                      <div className="text-center space-y-4">
                        {formData.fileType === 'image' ? (
                          <ImageIcon className="w-16 h-16 text-gray-700 mx-auto" />
                        ) : formData.fileType === 'video' ? (
                          <Video className="w-16 h-16 text-gray-700 mx-auto" />
                        ) : (
                          <FileText className="w-16 h-16 text-gray-700 mx-auto" />
                        )}
                        <p className="text-gray-600 font-mono text-sm uppercase">// NO_MEDIA_LOADED</p>
                      </div>
                    )}
                  </div>

                  {/* Metadata Preview */}
                  <div className="p-6 space-y-4 bg-[#252525]">
                    <div>
                      <h3 className="font-mono text-lg text-[#ea5c2a] mb-1 uppercase">
                        {formData.name || '[UNTITLED_ASSET]'}
                      </h3>
                      <p className="text-gray-400 text-sm font-mono">
                        {formData.description || '// No metadata provided'}
                      </p>
                    </div>

                    {formData.traits.length > 0 && (
                      <div className="border-t-2 border-[#ea5c2a]/30 pt-4">
                        <h4 className="text-xs font-mono text-gray-500 mb-3 uppercase">// TRAITS</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {formData.traits.map((trait) => (
                            <div
                              key={trait.id}
                              className="bg-[#1e1e1e] border border-[#ea5c2a]/30 p-2"
                            >
                              <div className="text-xs font-mono text-gray-500 uppercase">
                                {trait.name || 'trait'}
                              </div>
                              <div className="text-sm font-mono text-[#ea5c2a]">
                                {trait.value || 'value'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Safety Switch Button & Terminal */}
        {forceConnected && (
          <div className="mt-8 space-y-6">
            {/* Safety Switch - INITIALIZE PROTOCOL */}
            <div className="relative">
              <button
                onClick={handleMint}
                disabled={isPending || isConfirming || isUploading || !formData.file || !formData.name}
                className="w-full py-8 bg-[#ea5c2a] hover:bg-[#ff6d3a] disabled:bg-[#333] disabled:cursor-not-allowed border-4 border-black font-mono text-3xl font-bold text-black disabled:text-gray-600 transition-all shadow-lg shadow-[#ea5c2a]/50 disabled:shadow-none hover:shadow-[#ea5c2a]/70 hover:scale-[1.01] active:scale-[0.99] uppercase relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}
              >
                {/* Diagonal stripe pattern */}
                <div className="absolute inset-0 opacity-20" style={{ 
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, black 10px, black 20px)'
                }}></div>
                
                <span className="relative z-10">
                  {isPending || isConfirming || isUploading ? (
                    <span className="flex items-center justify-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      PROCESSING...
                    </span>
                  ) : (
                    'INITIALIZE PROTOCOL'
                  )}
                </span>
              </button>
              
              {/* Gas Fee Estimate */}
              <div className="mt-2 text-center">
                <span className="font-mono text-xs text-gray-500 uppercase">
                  // Gas Fee Est: ~0.0002 ETH
                </span>
              </div>
            </div>

            {/* Terminal Log - Always Visible */}
            <div className="border-2 border-[#ea5c2a]/30 bg-[#252525] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="font-mono text-sm text-gray-400 uppercase">// SYSTEM_LOG</h3>
              </div>
              <div className="bg-black p-4 font-mono text-sm space-y-1 max-h-64 overflow-y-auto border border-[#ea5c2a]/20">
                {mintStatus.length === 0 ? (
                  <>
                    <div className="text-green-400">&gt; INITIALIZING CORE...</div>
                    <div className="text-green-400">&gt; EST. GAS: 0.0002 ETH</div>
                    <div className="text-green-400">&gt; WAITING FOR USER INPUT...</div>
                    <div className="text-green-400 animate-pulse">▊</div>
                  </>
                ) : (
                  <>
                    {mintStatus.map((status, index) => (
                      <div
                        key={index}
                        className={`${
                          status.includes('ERROR')
                            ? 'text-red-500'
                            : status.includes('SUCCESS')
                            ? 'text-green-500'
                            : 'text-green-400'
                        }`}
                      >
                        {status}
                      </div>
                    ))}
                    {(isPending || isConfirming || isUploading) && (
                      <div className="text-green-400 animate-pulse">▊</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Old Terminal Output - Remove */}
            {false && mintStatus.length > 0 && (
              <div className="border-2 border-[#ea5c2a]/30 bg-[#252525] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="font-mono text-sm text-gray-400 uppercase">// PROTOCOL_STATUS</h3>
                </div>
                <div className="bg-black p-4 font-mono text-sm space-y-1 max-h-64 overflow-y-auto border border-[#ea5c2a]/20">
                  {mintStatus.map((status, index) => (
                    <div
                      key={index}
                      className={`${
                        status.includes('ERROR')
                          ? 'text-red-500'
                          : status.includes('SUCCESS')
                          ? 'text-green-500'
                          : 'text-green-400'
                      }`}
                    >
                      {status}
                    </div>
                  ))}
                  {(isPending || isConfirming || isUploading) && (
                    <div className="text-green-400 animate-pulse">▊</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
