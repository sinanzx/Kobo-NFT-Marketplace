import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function ARViewerPage() {
  const location = useLocation();
  const preselectedNftId = location.state?.nftId;
  const [selectedNFT, setSelectedNFT] = useState<string | null>(preselectedNftId || null);
  const [scale, setScale] = useState(50);
  const [rotation, setRotation] = useState(50);
  const [lighting, setLighting] = useState(50);

  // Mock NFT data - Data Cartridges
  const mockNFTs = [
    {
      id: 'nft-1',
      name: 'COSMIC_DRAGON_001',
      image: 'https://images.pexels.com/photos/17298618/pexels-photo-17298618.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      model3D: 'https://example.com/models/dragon.glb'
    },
    {
      id: 'nft-2',
      name: 'CYBER_WARRIOR_042',
      image: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      model3D: 'https://example.com/models/warrior.glb'
    },
    {
      id: 'nft-3',
      name: 'ABSTRACT_VISION_123',
      image: 'https://images.pexels.com/photos/17298618/pexels-photo-17298618.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      model3D: 'https://example.com/models/abstract.glb'
    }
  ];

  const currentNFT = mockNFTs.find(nft => nft.id === selectedNFT) || mockNFTs[0];

  return (
    <div className="h-screen overflow-hidden bg-[#1e1e1e] flex">
      {/* Column 1: The Vault (Left Sidebar) */}
      <div className="w-64 border-r border-[#333] bg-[#252525] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-[#ea5c2a] font-mono text-sm tracking-wider">
            // ASSET_LOADER
          </h2>
        </div>

        {/* Data Cartridges List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mockNFTs.map((nft) => (
            <button
              key={nft.id}
              onClick={() => setSelectedNFT(nft.id)}
              className={`w-full p-3 bg-[#1e1e1e] border rounded transition-all ${
                selectedNFT === nft.id
                  ? 'border-[#ea5c2a]'
                  : 'border-[#333] hover:border-[#ea5c2a]'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="text-left flex-1">
                  <p className="text-white font-mono text-xs">{nft.name}</p>
                  <p className="text-gray-500 text-[10px] font-mono">CARTRIDGE</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: The Holo-Deck (Center Stage) */}
      <div className="flex-1 bg-black relative flex items-center justify-center">
        {/* Orange Crosshair Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#ea5c2a] opacity-30" />
          {/* Horizontal Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#ea5c2a] opacity-30" />
          {/* Center Circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-[#ea5c2a] rounded-full opacity-50" />
        </div>

        {/* Coordinate Data (Top Right Corner) */}
        <div className="absolute top-4 right-4 font-mono text-[#ea5c2a] text-xs">
          X: 45.20 Y: 12.01
        </div>

        {/* Wireframe Mode Placeholder */}
        <div className="text-center z-10">
          <div className="inline-block px-6 py-3 border border-[#ea5c2a] bg-black/50">
            <p className="text-[#ea5c2a] font-mono text-lg tracking-widest animate-pulse">
              WIRE_FRAME_MODE
            </p>
          </div>
          <p className="text-gray-600 font-mono text-xs mt-4">
            {currentNFT.name}
          </p>
        </div>
      </div>

      {/* Column 3: Control Systems (Right Sidebar) */}
      <div className="w-72 border-l border-[#333] bg-[#252525] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-[#ea5c2a] font-mono text-sm tracking-wider">
            // RENDER_CONTROLS
          </h2>
        </div>

        {/* Industrial Sliders */}
        <div className="flex-1 p-6 space-y-8">
          {/* SCALE Slider */}
          <div>
            <label className="block text-gray-400 font-mono text-xs mb-2 tracking-wider">
              SCALE
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
              style={{
                background: `linear-gradient(to right, #ea5c2a 0%, #ea5c2a ${scale}%, #333 ${scale}%, #333 100%)`
              }}
            />
            <div className="text-right text-[#ea5c2a] font-mono text-xs mt-1">
              {scale}%
            </div>
          </div>

          {/* ROTATION Slider */}
          <div>
            <label className="block text-gray-400 font-mono text-xs mb-2 tracking-wider">
              ROTATION
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
              style={{
                background: `linear-gradient(to right, #ea5c2a 0%, #ea5c2a ${rotation}%, #333 ${rotation}%, #333 100%)`
              }}
            />
            <div className="text-right text-[#ea5c2a] font-mono text-xs mt-1">
              {rotation}°
            </div>
          </div>

          {/* LIGHTING Slider */}
          <div>
            <label className="block text-gray-400 font-mono text-xs mb-2 tracking-wider">
              LIGHTING
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={lighting}
              onChange={(e) => setLighting(Number(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
              style={{
                background: `linear-gradient(to right, #ea5c2a 0%, #ea5c2a ${lighting}%, #333 ${lighting}%, #333 100%)`
              }}
            />
            <div className="text-right text-[#ea5c2a] font-mono text-xs mt-1">
              {lighting}%
            </div>
          </div>
        </div>

        {/* Massive Action Button */}
        <div className="p-6">
          <button
            className="w-full bg-[#ea5c2a] text-black font-mono text-sm tracking-widest py-4 font-bold hover:bg-[#d14d1a] transition-colors"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
            }}
          >
            INITIATE_VR_LINK
          </button>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style>{`
        .slider-orange::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #ea5c2a;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #1e1e1e;
        }
        
        .slider-orange::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #ea5c2a;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #1e1e1e;
        }
      `}</style>
    </div>
  );
}
