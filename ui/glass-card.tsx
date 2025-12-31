import { HTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'metal';
  hover?: boolean;
  children: React.ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', hover = true, children, className, ...props }, ref) => {
    const baseClasses = 'relative overflow-hidden transition-all duration-300';
    
    const variantClasses = {
      default: `
        bg-[#252525]
        border-2 border-gray-700
        shadow-lg
      `,
      elevated: `
        bg-[#252525]
        border-2 border-[#ea5c2a]/50
        shadow-xl shadow-[#ea5c2a]/10
      `,
      metal: `
        bg-[#252525]
        border-2 border-[#ea5c2a]
        shadow-xl shadow-[#ea5c2a]/20
        before:absolute before:inset-0
        before:bg-gradient-to-r before:from-transparent before:via-[#ea5c2a]/10 before:to-transparent
        before:translate-x-[-200%]
        hover:before:translate-x-[200%]
        before:transition-transform before:duration-1000
      `,
    };
    
    const hoverClasses = hover ? `
      hover:bg-[#2a2a2a]
      hover:border-[#ea5c2a]
      hover:shadow-2xl hover:shadow-[#ea5c2a]/30
      hover:scale-[1.02]
    ` : '';

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          baseClasses,
          variantClasses[variant],
          hoverClasses,
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
