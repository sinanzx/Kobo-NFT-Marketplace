/**
 * Animated Card Component
 * 
 * A reusable card component with built-in micro-animations for hover, tap, and reveal effects.
 * Uses centralized animation configuration for consistency.
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cardRevealVariants, hoverLift, tapScale } from '@/lib/animationConfig';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  enableHover?: boolean;
  enableTap?: boolean;
  enableReveal?: boolean;
  delay?: number;
  variant?: 'default' | 'glass' | 'solid';
}

export function AnimatedCard({
  children,
  className,
  enableHover = true,
  enableTap = true,
  enableReveal = true,
  delay = 0,
  variant = 'default',
  ...props
}: AnimatedCardProps) {
  const baseClasses = cn(
    'rounded-xl overflow-hidden',
    variant === 'glass' && 'bg-white/5 backdrop-blur-md border border-white/10',
    variant === 'solid' && 'bg-gray-900 border border-gray-800',
    variant === 'default' && 'bg-background border border-border',
    className
  );

  return (
    <motion.div
      className={baseClasses}
      variants={enableReveal ? cardRevealVariants : undefined}
      initial={enableReveal ? 'hidden' : undefined}
      animate={enableReveal ? 'visible' : undefined}
      whileHover={enableHover ? 'hover' : undefined}
      whileTap={enableTap ? 'tap' : undefined}
      transition={delay > 0 ? { delay } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated Card Grid Container
 * 
 * Container for animated cards with stagger effect
 */
interface AnimatedCardGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  stagger?: boolean;
}

export function AnimatedCardGrid({
  children,
  className,
  columns = 3,
  stagger = true,
}: AnimatedCardGridProps) {
  const gridClasses = cn(
    'grid gap-6',
    columns === 1 && 'grid-cols-1',
    columns === 2 && 'grid-cols-1 md:grid-cols-2',
    columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    className
  );

  if (!stagger) {
    return <div className={gridClasses}>{children}</div>;
  }

  return (
    <motion.div
      className={gridClasses}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
