import { useState } from 'react';
import { GlassCylinderMint } from '../GlassCylinderMint';
import { Button } from '../ui/button';
import { Zap, Sparkles, Rocket } from 'lucide-react';

/**
 * Demo component showcasing different minting animation variants
 */
export function MintingVariants() {
  const [activeVariant, setActiveVariant] = useState<'mechanical' | 'mystical' | 'scifi' | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleMint = (variant: 'mechanical' | 'mystical' | 'scifi') => {
    setActiveVariant(variant);
    setShowAnimation(true);
  };

  const handleComplete = () => {
    setShowAnimation(false);
    setActiveVariant(null);
  };

  const variants = [
    {
      id: 'mechanical' as const,
      name: 'Mechanical',
      description: 'Industrial hydraulic sounds with metallic clanks',
      icon: Zap,
      color: 'from-gray-500 to-slate-600',
      fogColor: 'from-gray-500/50 via-slate-500/30',
      glowColor: 'from-gray-400/50 to-slate-500/50',
    },
    {
      id: 'mystical' as const,
      name: 'Mystical',
      description: 'Ethereal whooshes with magical chimes',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      fogColor: 'from-purple-500/50 via-pink-500/30',
      glowColor: 'from-purple-500/50 to-pink-500/50',
    },
    {
      id: 'scifi' as const,
      name: 'Sci-Fi',
      description: 'Futuristic power-up with digital confirmation',
      icon: Rocket,
      color: 'from-cyan-500 to-blue-600',
      fogColor: 'from-cyan-500/50 via-blue-500/30',
      glowColor: 'from-cyan-500/50 to-blue-500/50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Glass Cylinder Mint Animations
          </h1>
          <p className="text-gray-400 text-lg">
            Choose a variant to preview the dramatic minting sequence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {variants.map((variant) => {
            const Icon = variant.icon;
            return (
              <div
                key={variant.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${variant.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {variant.name}
                </h3>
                
                <p className="text-gray-400 text-sm mb-6">
                  {variant.description}
                </p>
                
                <Button
                  onClick={() => handleMint(variant.id)}
                  className={`w-full bg-gradient-to-r ${variant.color} hover:opacity-90 transition-opacity`}
                >
                  Preview Animation
                </Button>
              </div>
            );
          })}
        </div>

        {/* Configuration Example */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Customization Options
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Animation Timing</h3>
              <ul className="space-y-1 text-sm">
                <li>• <code className="text-purple-400">openDuration</code>: Cap opening time (default: 2000ms)</li>
                <li>• <code className="text-purple-400">revealDuration</code>: NFT reveal time (default: 2000ms)</li>
                <li>• <code className="text-purple-400">completeDuration</code>: Success display time (default: 2000ms)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">Visual Customization</h3>
              <ul className="space-y-1 text-sm">
                <li>• <code className="text-purple-400">fogColor</code>: Tailwind gradient classes</li>
                <li>• <code className="text-purple-400">glowColor</code>: Tailwind gradient classes</li>
                <li>• <code className="text-purple-400">soundEnabled</code>: Toggle audio (default: true)</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
            <pre>{`<GlassCylinderMint
  isOpen={showMint}
  onComplete={() => setShowMint(false)}
  nftImage="/path/to/nft.png"
  variant="mystical"
  config={{
    openDuration: 2000,
    revealDuration: 2000,
    completeDuration: 2000,
    fogColor: 'from-purple-500/50 via-pink-500/30',
    glowColor: 'from-purple-500/50 to-pink-500/50',
    soundEnabled: true,
  }}
/>`}</pre>
          </div>
        </div>
      </div>

      {/* Active Animation */}
      {activeVariant && (
        <GlassCylinderMint
          isOpen={showAnimation}
          onComplete={handleComplete}
          variant={activeVariant}
          config={{
            fogColor: variants.find(v => v.id === activeVariant)?.fogColor,
            glowColor: variants.find(v => v.id === activeVariant)?.glowColor,
          }}
        />
      )}
    </div>
  );
}
