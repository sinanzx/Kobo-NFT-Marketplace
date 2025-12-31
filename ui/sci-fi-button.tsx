import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SciFiButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'remake' | 'confirm' | 'cancel';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

export const SciFiButton = forwardRef<HTMLButtonElement, SciFiButtonProps>(
  ({ variant = 'remake', size = 'md', children, loading, className, disabled, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false);

    const variants = {
      remake: {
        base: 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 text-purple-300',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
        hover: 'from-purple-600/30 to-pink-600/30 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)]',
        active: 'from-purple-600/40 to-pink-600/40 shadow-[0_0_40px_rgba(168,85,247,0.8)]',
      },
      confirm: {
        base: 'bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border-emerald-500/50 text-emerald-300',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
        hover: 'from-emerald-600/30 to-cyan-600/30 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)]',
        active: 'from-emerald-600/40 to-cyan-600/40 shadow-[0_0_40px_rgba(16,185,129,0.8)]',
      },
      cancel: {
        base: 'bg-gradient-to-r from-gray-600/20 to-gray-500/20 border-gray-500/50 text-gray-300',
        glow: 'shadow-[0_0_20px_rgba(107,114,128,0.4)]',
        hover: 'from-gray-600/30 to-gray-500/30 border-gray-400 shadow-[0_0_30px_rgba(107,114,128,0.6)]',
        active: 'from-gray-600/40 to-gray-500/40 shadow-[0_0_40px_rgba(107,114,128,0.8)]',
      },
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const currentVariant = variants[variant];

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl border-2 backdrop-blur-md font-semibold',
          'transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
          currentVariant.base,
          currentVariant.glow,
          sizes[size],
          className
        )}
        whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        disabled={disabled || loading}
        {...props}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-0"
          animate={{
            opacity: isPressed ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className={cn('absolute inset-0', currentVariant.active)} />
        </motion.div>

        {/* Scanning beam effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'linear',
          }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current opacity-50" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-current opacity-50" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-current opacity-50" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current opacity-50" />

        {/* Pulse effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(168, 85, 247, 0)',
              '0 0 0 4px rgba(168, 85, 247, 0.1)',
              '0 0 0 0 rgba(168, 85, 247, 0)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && (
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {children}
        </span>

        {/* Haptic-style ripple on click */}
        {isPressed && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-white/10"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.button>
    );
  }
);

SciFiButton.displayName = 'SciFiButton';
