import { useLocation } from 'react-router-dom';
import { CollabGallery } from '@/components/collab/CollabGallery';
import { Network } from 'lucide-react';

export default function Collaborations() {
  const location = useLocation();
  const preselectedNftId = location.state?.nftId;

  return (
    <div className="min-h-screen bg-[#1e1e1e] relative overflow-hidden">
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ea5c2a08_1px,transparent_1px),linear-gradient(to_bottom,#ea5c2a08_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-16 space-y-8">
          {/* Header with Icon and Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Network Node Icon */}
              <div className="relative">
                <Network className="w-16 h-16 text-[#ea5c2a]" strokeWidth={1.5} />
              </div>
              
              {/* Title */}
              <div>
                <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight">
                  // JOINT_OPERATIONS_PROTOCOL
                </h1>
                <p className="text-sm md:text-base text-gray-400 font-mono mt-2">
                  MULTI_SIG_MINTING // SYNCHRONIZED_ASSET_CREATION
                </p>
              </div>
            </div>
            
            {/* Primary Command Button */}
            <button
              onClick={() => console.log('Create session')}
              className="hidden lg:block px-8 py-4 bg-[#ea5c2a] text-black font-mono font-bold text-lg hover:bg-[#ff6d3a] transition-colors relative"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
              }}
            >
              INITIATE_UPLINK
            </button>
          </div>
          
          {/* Mobile Command Button */}
          <button
            onClick={() => console.log('Create session')}
            className="lg:hidden w-full px-8 py-4 bg-[#ea5c2a] text-black font-mono font-bold text-lg hover:bg-[#ff6d3a] transition-colors relative"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
            }}
          >
            INITIATE_UPLINK
          </button>

          {/* Preselected NFT Badge */}
          {preselectedNftId && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#2a2a2a] border border-[#ea5c2a]/40 text-[#ea5c2a] font-mono">
              <div className="w-2 h-2 bg-[#ea5c2a] rounded-full animate-pulse" />
              <span>NFT #{preselectedNftId} READY_FOR_UPLINK</span>
            </div>
          )}
        </div>

        {/* Gallery Section */}
        <div className="relative">
          <CollabGallery />
        </div>
      </div>
    </div>
  );
}
