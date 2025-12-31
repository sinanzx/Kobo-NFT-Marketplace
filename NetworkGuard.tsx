/**
 * NetworkGuard Component
 * Blocks UI with industrial overlay if user is on wrong network
 */

import { useChainId, useSwitchChain } from 'wagmi';
import { chainId as expectedChainId, selectedChain } from '../utils/evmConfig';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = currentChainId !== expectedChainId;

  if (!isWrongNetwork) {
    return <>{children}</>;
  }

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: expectedChainId });
    }
  };

  return (
    <>
      {/* Blurred background content */}
      <div className="blur-sm pointer-events-none">{children}</div>

      {/* Industrial Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="relative max-w-2xl mx-4">
          {/* Industrial border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 blur-xl" />
          
          {/* Main card */}
          <div className="relative bg-zinc-900 border-2 border-orange-500/50 rounded-lg p-8 shadow-2xl">
            {/* Warning icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/30 blur-2xl rounded-full" />
                <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-full">
                  <AlertTriangle className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
              NETWORK SECURITY ALERT
            </h2>

            {/* Message */}
            <div className="space-y-4 mb-8">
              <p className="text-zinc-300 text-center text-lg">
                You are connected to the wrong network.
              </p>
              
              <div className="bg-zinc-800/50 border border-orange-500/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm font-mono">Current Network:</span>
                  <span className="text-red-400 font-semibold font-mono">
                    Chain ID {currentChainId}
                  </span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm font-mono">Required Network:</span>
                  <span className="text-green-400 font-semibold font-mono">
                    {selectedChain.network.toUpperCase()} (Chain ID {expectedChainId})
                  </span>
                </div>
              </div>

              <p className="text-zinc-400 text-center text-sm">
                Please switch to the correct network to continue using the marketplace.
              </p>
            </div>

            {/* Action button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSwitchNetwork}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-8 py-6 text-lg rounded-lg shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-500/50 hover:scale-105"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Switch to {selectedChain.network.toUpperCase()}
              </Button>
            </div>

            {/* Industrial accent lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent" />
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent" />
          </div>

          {/* Corner accents */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-orange-500" />
        </div>
      </div>
    </>
  );
}
