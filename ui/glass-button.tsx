import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'glass' | 'metal' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ variant = 'primary', size = 'md', children, loading, className, ...props }, ref) => {
    const baseClasses = 'relative overflow-hidden font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: `
        bg-[#ea5c2a]
        text-white
        border-2 border-[#ea5c2a]
        hover:bg-[#ff6b35]
        shadow-lg shadow-[#ea5c2a]/30
        hover:shadow-xl hover:shadow-[#ea5c2a]/50
      `,
      glass: `
        bg-[#252525]
        border-2 border-[#ea5c2a]/50
        text-white
        hover:bg-[#2a2a2a]
        hover:border-[#ea5c2a]
      `,
      metal: `
        bg-[#252525]
        border-2 border-[#ea5c2a]
        text-white
        shadow-lg shadow-[#ea5c2a]/20
        hover:shadow-xl hover:shadow-[#ea5c2a]/40
        before:absolute before:inset-0
        before:bg-gradient-to-r before:from-transparent before:via-[#ea5c2a]/20 before:to-transparent
        before:translate-x-[-200%]
        hover:before:translate-x-[200%]
        before:transition-transform before:duration-700
      `,
      outline: `
        bg-transparent
        border-2 border-[#ea5c2a]
        text-[#ea5c2a]
        hover:bg-[#ea5c2a]/10
        hover:border-[#ff6b35]
      `,
    };
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-2xl',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={loading}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          )}
          {children}
        </span>
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

export { GlassButton };
