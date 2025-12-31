/**
 * Animated Button Component
 * 
 * Enhanced button with micro-animations for better user feedback.
 * Includes hover, tap, loading, and success states.
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { Loader2, Check } from 'lucide-react';
import { 
  hoverScale, 
  tapScale, 
  successVariants,
  spring,
  duration,
} from '@/lib/animationConfig';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function AnimatedButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isSuccess = false,
  disabled = false,
  fullWidth = false,
  ...props
}: AnimatedButtonProps) {
  const baseClasses = cn(
    'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    
    // Variants
    variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
    variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
    variant === 'ghost' && 'bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-accent',
    variant === 'danger' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
    
    // Sizes
    size === 'sm' && 'px-3 py-1.5 text-sm',
    size === 'md' && 'px-4 py-2 text-base',
    size === 'lg' && 'px-6 py-3 text-lg',
    
    // Full width
    fullWidth && 'w-full',
    
    className
  );

  return (
    <motion.button
      className={baseClasses}
      whileHover={!disabled && !isLoading ? hoverScale : undefined}
      whileTap={!disabled && !isLoading ? tapScale : undefined}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={spring.snappy}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
        </motion.div>
      )}
      
      {/* Success State */}
      {isSuccess && !isLoading && (
        <motion.div
          variants={successVariants}
          initial="hidden"
          animate="visible"
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )}
      
      {/* Content */}
      <motion.span
        animate={{
          opacity: isLoading || isSuccess ? 0.5 : 1,
        }}
        transition={{ duration: duration.fast }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}

/**
 * Animated Icon Button
 * 
 * Circular button with icon and enhanced animations
 */
interface AnimatedIconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  ariaLabel: string;
}

export function AnimatedIconButton({
  icon,
  className,
  size = 'md',
  variant = 'ghost',
  disabled = false,
  ariaLabel,
  ...props
}: AnimatedIconButtonProps) {
  const baseClasses = cn(
    'relative inline-flex items-center justify-center rounded-full transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    
    // Variants
    variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
    variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
    variant === 'ghost' && 'bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-accent',
    
    // Sizes
    size === 'sm' && 'w-8 h-8',
    size === 'md' && 'w-10 h-10',
    size === 'lg' && 'w-12 h-12',
    
    className
  );

  return (
    <motion.button
      className={baseClasses}
      whileHover={!disabled ? { scale: 1.1, rotate: 5 } : undefined}
      whileTap={!disabled ? { scale: 0.9 } : undefined}
      transition={spring.snappy}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </motion.button>
  );
}
