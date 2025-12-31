/**
 * Wallet Connect Animation Component
 * 
 * Animated feedback for wallet connection states with visual indicators
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Check, AlertCircle, Loader2 } from 'lucide-react';
import {
  scaleVariants,
  successVariants,
  errorShakeVariants,
  pulseVariants,
  spring,
  duration,
} from '@/lib/animationConfig';

type WalletState = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';

interface WalletConnectAnimationProps {
  state: WalletState;
  walletName?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export function WalletConnectAnimation({
  state,
  walletName = 'Wallet',
  errorMessage,
  onRetry,
}: WalletConnectAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {/* Idle State */}
        {state === 'idle' && (
          <motion.div
            key="idle"
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              variants={pulseVariants}
              animate="pulse"
              className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
            >
              <Wallet className="w-10 h-10 text-white" />
            </motion.div>
            <p className="text-lg font-medium text-gray-300">Connect Your Wallet</p>
          </motion.div>
        )}

        {/* Connecting State */}
        {state === 'connecting' && (
          <motion.div
            key="connecting"
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-20 h-20">
              {/* Spinning outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500"
              />
              
              {/* Inner icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"
                >
                  <Wallet className="w-8 h-8 text-purple-400" />
                </motion.div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-medium text-white mb-1">Connecting to {walletName}</p>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-sm text-gray-400"
              >
                Please approve in your wallet...
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Connected State */}
        {state === 'connected' && (
          <motion.div
            key="connected"
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {/* Success glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-green-500 blur-xl"
              />
              
              {/* Success icon */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
            </motion.div>
            
            <div className="text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-medium text-white mb-1"
              >
                Connected Successfully!
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-400"
              >
                {walletName} is now connected
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <motion.div
            key="error"
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              variants={errorShakeVariants}
              animate="shake"
              className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
            >
              <AlertCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <div className="text-center max-w-xs">
              <p className="text-lg font-medium text-white mb-1">Connection Failed</p>
              <p className="text-sm text-gray-400 mb-4">
                {errorMessage || 'Unable to connect to wallet'}
              </p>
              
              {onRetry && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRetry}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                >
                  Try Again
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Disconnected State */}
        {state === 'disconnected' && (
          <motion.div
            key="disconnected"
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-400">Wallet Disconnected</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compact Wallet Status Indicator
 * 
 * Small animated indicator for wallet connection status in headers/navbars
 */
interface WalletStatusIndicatorProps {
  isConnected: boolean;
  isConnecting?: boolean;
  address?: string;
  onClick?: () => void;
}

export function WalletStatusIndicator({
  isConnected,
  isConnecting = false,
  address,
  onClick,
}: WalletStatusIndicatorProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={spring.snappy}
      className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
    >
      {/* Status Indicator Dot */}
      <div className="relative">
        <motion.div
          animate={{
            scale: isConnecting ? [1, 1.2, 1] : 1,
            opacity: isConnecting ? [0.5, 1, 0.5] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: isConnecting ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-gray-500'
          }`}
        />
        
        {/* Pulse ring for connected state */}
        {isConnected && (
          <motion.div
            animate={{
              scale: [1, 2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-green-500"
          />
        )}
      </div>
      
      {/* Status Text */}
      <span className="text-sm font-medium text-white">
        {isConnecting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Connecting...
          </span>
        ) : isConnected && address ? (
          formatAddress(address)
        ) : (
          'Connect Wallet'
        )}
      </span>
    </motion.button>
  );
}
