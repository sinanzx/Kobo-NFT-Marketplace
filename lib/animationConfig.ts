/**
 * Centralized Animation Configuration System
 * 
 * This file defines all animation tokens, variants, and utilities used across the application.
 * Ensures consistency in animation principles and minimal performance overhead.
 * 
 * Animation Principles:
 * - Use spring physics for natural, organic motion
 * - Ease curves for smooth, predictable transitions
 * - Bounce for playful, attention-grabbing effects
 * - Keep durations short (150-500ms) for responsiveness
 * - Use stagger for sequential reveals
 * - Prefer GPU-accelerated properties (transform, opacity)
 */

import { Variants, Transition } from 'framer-motion';

// ============================================================================
// TIMING TOKENS
// ============================================================================

export const duration = {
  instant: 0.15,
  fast: 0.25,
  normal: 0.35,
  slow: 0.5,
  slower: 0.75,
  slowest: 1,
} as const;

export const stagger = {
  fast: 0.03,
  normal: 0.05,
  slow: 0.1,
} as const;

// ============================================================================
// EASING TOKENS
// ============================================================================

export const easing = {
  // Standard easing curves
  easeIn: [0.4, 0, 1, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  
  // Custom curves
  smooth: [0.25, 0.1, 0.25, 1] as const,
  snappy: [0.4, 0, 0.6, 1] as const,
  bouncy: [0.68, -0.55, 0.265, 1.55] as const,
  
  // Specialized
  anticipate: [0.68, -0.55, 0.265, 1.55],
  overshoot: [0.175, 0.885, 0.32, 1.275],
} as const;

// ============================================================================
// SPRING CONFIGURATIONS
// ============================================================================

export const spring = {
  // Gentle, smooth springs
  gentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
    mass: 0.5,
  },
  
  // Standard responsive spring
  default: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
    mass: 1,
  },
  
  // Snappy, responsive spring
  snappy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
    mass: 0.8,
  },
  
  // Bouncy, playful spring
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 15,
    mass: 1,
  },
  
  // Stiff, immediate spring
  stiff: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  },
  
  // Slow, smooth spring
  smooth: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 20,
    mass: 1.5,
  },
} as const;

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const transition = {
  // Tween-based transitions
  fast: {
    duration: duration.fast,
    ease: easing.easeOut as any,
  },
  
  normal: {
    duration: duration.normal,
    ease: easing.easeInOut as any,
  },
  
  slow: {
    duration: duration.slow,
    ease: easing.smooth as any,
  },
  
  // Spring-based transitions
  springGentle: spring.gentle,
  springDefault: spring.default,
  springSnappy: spring.snappy,
  springBouncy: spring.bouncy,
  
  // Specialized
  fade: {
    duration: duration.fast,
    ease: easing.easeOut as any,
  },
  
  scale: {
    duration: duration.normal,
    ease: easing.anticipate as any,
  },
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Fade Animations
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transition.fade,
  },
  exit: { 
    opacity: 0,
    transition: transition.fade,
  },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transition.normal,
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: transition.fast,
  },
};

export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transition.normal,
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: transition.fast,
  },
};

export const fadeLeftVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transition.normal,
  },
  exit: { 
    opacity: 0, 
    x: 30,
    transition: transition.fast,
  },
};

export const fadeRightVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transition.normal,
  },
  exit: { 
    opacity: 0, 
    x: -30,
    transition: transition.fast,
  },
};

/**
 * Scale Animations
 */
export const scaleVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: transition.springSnappy,
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: transition.fast,
  },
};

export const scaleBounceVariants: Variants = {
  hidden: { scale: 0 },
  visible: { 
    scale: 1,
    transition: transition.springBouncy,
  },
  exit: { 
    scale: 0,
    transition: transition.fast,
  },
};

export const popVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      ...transition.springBouncy,
      opacity: { duration: duration.fast },
    },
  },
  exit: { 
    scale: 0.9, 
    opacity: 0,
    transition: transition.fast,
  },
};

/**
 * Slide Animations
 */
export const slideUpVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: transition.springDefault,
  },
  exit: { 
    y: '100%', 
    opacity: 0,
    transition: transition.normal,
  },
};

export const slideDownVariants: Variants = {
  hidden: { y: '-100%', opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: transition.springDefault,
  },
  exit: { 
    y: '-100%', 
    opacity: 0,
    transition: transition.normal,
  },
};

export const slideLeftVariants: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: transition.springDefault,
  },
  exit: { 
    x: '-100%', 
    opacity: 0,
    transition: transition.normal,
  },
};

export const slideRightVariants: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: transition.springDefault,
  },
  exit: { 
    x: '100%', 
    opacity: 0,
    transition: transition.normal,
  },
};

/**
 * Rotation Animations
 */
export const rotateVariants: Variants = {
  hidden: { rotate: -180, opacity: 0 },
  visible: { 
    rotate: 0, 
    opacity: 1,
    transition: transition.springDefault,
  },
  exit: { 
    rotate: 180, 
    opacity: 0,
    transition: transition.normal,
  },
};

export const flipVariants: Variants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: { 
    rotateY: 0, 
    opacity: 1,
    transition: transition.springDefault,
  },
  exit: { 
    rotateY: -90, 
    opacity: 0,
    transition: transition.normal,
  },
};

/**
 * Stagger Container Variants
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.normal,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: stagger.fast,
      staggerDirection: -1,
    },
  },
};

export const staggerFastContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.fast,
      delayChildren: 0,
    },
  },
};

export const staggerSlowContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.slow,
      delayChildren: 0.2,
    },
  },
};

/**
 * Stagger Item Variants (to be used with container variants)
 */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transition.springDefault,
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: transition.fast,
  },
};

// ============================================================================
// HOVER & TAP ANIMATIONS
// ============================================================================

export const hoverScale = {
  scale: 1.05,
  transition: transition.springSnappy,
};

export const hoverScaleSmall = {
  scale: 1.02,
  transition: transition.springSnappy,
};

export const hoverScaleLarge = {
  scale: 1.1,
  transition: transition.springBouncy,
};

export const tapScale = {
  scale: 0.95,
  transition: transition.springSnappy,
};

export const tapScaleSmall = {
  scale: 0.98,
  transition: transition.springSnappy,
};

export const hoverLift = {
  y: -4,
  transition: transition.springSnappy,
};

export const hoverGlow = {
  boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
  transition: transition.normal,
};

export const hoverRotate = {
  rotate: 5,
  transition: transition.springGentle,
};

// ============================================================================
// SPECIALIZED ANIMATIONS
// ============================================================================

/**
 * Card Reveal Animation
 */
export const cardRevealVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: transition.springDefault,
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: transition.springSnappy,
  },
  tap: {
    scale: 0.98,
    transition: transition.springSnappy,
  },
};

/**
 * Modal/Dialog Animations
 */
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transition.springDefault,
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: transition.normal,
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: duration.fast },
  },
  exit: { 
    opacity: 0,
    transition: { duration: duration.fast },
  },
};

/**
 * List Item Animations
 */
export const listItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: transition.springDefault,
  },
  exit: { 
    opacity: 0, 
    x: 20,
    scale: 0.95,
    transition: transition.fast,
  },
};

/**
 * Badge/Notification Animations
 */
export const badgeVariants: Variants = {
  hidden: { 
    scale: 0,
    opacity: 0,
  },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: transition.springBouncy,
  },
  exit: { 
    scale: 0,
    opacity: 0,
    transition: transition.fast,
  },
};

/**
 * Pulse Animation (for attention-grabbing)
 */
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Shimmer/Loading Animation
 */
export const shimmerVariants: Variants = {
  shimmer: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Success/Error Animations
 */
export const successVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: transition.springBouncy,
  },
};

export const errorShakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a stagger delay for sequential animations
 */
export const createStaggerDelay = (index: number, staggerAmount: number = stagger.normal) => ({
  delay: index * staggerAmount,
});

/**
 * Create a custom spring transition
 */
export const createSpring = (
  stiffness: number = 200,
  damping: number = 20,
  mass: number = 1
): Transition => ({
  type: 'spring',
  stiffness,
  damping,
  mass,
});

/**
 * Create a custom tween transition
 */
export const createTween = (
  duration: number = 0.3,
  ease: readonly number[] | string = easing.easeInOut
): any => ({
  duration,
  ease,
});

/**
 * Combine multiple animation variants
 */
export const combineVariants = (...variants: Variants[]): Variants => {
  return variants.reduce((acc, variant) => ({ ...acc, ...variant }), {});
};

/**
 * Create a delayed animation
 */
export const withDelay = (variants: Variants, delay: number): Variants => {
  const result: Variants = {};
  Object.keys(variants).forEach(key => {
    const variant = variants[key];
    if (typeof variant === 'object' && variant !== null) {
      result[key] = {
        ...variant,
        transition: {
          ...(variant.transition || {}),
          delay,
        },
      };
    }
  });
  return result;
};

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * Layout animation configuration for optimal performance
 */
export const layoutTransition = {
  layout: {
    duration: duration.normal,
    ease: easing.easeInOut,
  },
};

/**
 * Will-change optimization for GPU acceleration
 */
export const gpuAcceleration = {
  willChange: 'transform, opacity',
};

/**
 * Reduce motion for accessibility
 */
export const prefersReducedMotion = 
  typeof window !== 'undefined' && 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Get animation config respecting user preferences
 */
export const getAnimationConfig = (variants: Variants): Variants => {
  if (prefersReducedMotion) {
    // Return instant transitions for reduced motion
    const reducedVariants: Variants = {};
    Object.keys(variants).forEach(key => {
      const variant = variants[key];
      if (typeof variant === 'object' && variant !== null) {
        reducedVariants[key] = {
          ...variant,
          transition: { duration: 0 },
        };
      }
    });
    return reducedVariants;
  }
  return variants;
};
