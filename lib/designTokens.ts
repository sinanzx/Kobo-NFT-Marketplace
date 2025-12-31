/**
 * Kōbo Design System Tokens
 * Glass morphism, metal effects, and atmospheric animations
 */

export const colors = {
  // Base backgrounds
  bg: {
    primary: '#0a0a0f',
    secondary: '#12121a',
    tertiary: '#1a1a24',
  },
  
  // Glass effects
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.15)',
  },
  
  // Brand colors
  brand: {
    purple: '#8b5cf6',
    pink: '#ec4899',
    cyan: '#06b6d4',
  },
  
  // State colors
  state: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Atmospheric
  fog: {
    light: 'rgba(139, 92, 246, 0.1)',
    medium: 'rgba(139, 92, 246, 0.2)',
    dense: 'rgba(139, 92, 246, 0.3)',
  },
};

export const gradients = {
  // Metal gradients
  metal: {
    silver: 'linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 50%, #e8e8e8 100%)',
    gold: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
    chrome: 'linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 25%, #f0f0f0 50%, #c0c0c0 75%, #f0f0f0 100%)',
  },
  
  // Brand gradients
  brand: {
    primary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    secondary: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
    accent: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
};

export const animations = {
  // Timing functions
  easing: {
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  // Durations
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
};

export const spacing = {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  24: '6rem',     // 96px
};

export const typography = {
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Space Grotesk', 'Inter', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  
  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
};

// Animation keyframes as CSS strings
export const keyframes = {
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  
  ripple: `
    @keyframes ripple {
      0% {
        width: 0;
        height: 0;
        opacity: 0.5;
      }
      100% {
        width: 300px;
        height: 300px;
        opacity: 0;
      }
    }
  `,
  
  metalShine: `
    @keyframes metal-shine {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
  `,
  
  fogDrift: `
    @keyframes fog-drift {
      0% { transform: translateX(-10%) translateY(0); }
      100% { transform: translateX(10%) translateY(-5%); }
    }
  `,
  
  beamSweep: `
    @keyframes beam-sweep {
      0% { transform: translateX(-100%); opacity: 0; }
      50% { opacity: 0.3; }
      100% { transform: translateX(100%); opacity: 0; }
    }
  `,
  
  particleFloat: `
    @keyframes particle-float {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
    }
  `,
  
  fadeInUp: `
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  scaleIn: `
    @keyframes scale-in {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
  
  glowPulse: `
    @keyframes glow-pulse {
      0%, 100% {
        box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
      }
      50% {
        box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
      }
    }
  `,
  
  scanLine: `
    @keyframes scan-line {
      0% {
        top: 0%;
        opacity: 0;
      }
      50% {
        opacity: 0.3;
      }
      100% {
        top: 100%;
        opacity: 0;
      }
    }
  `,
  
  buttonPress: `
    @keyframes button-press {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(0.95);
      }
      100% {
        transform: scale(1);
      }
    }
  `,
  
  hologramFlicker: `
    @keyframes hologram-flicker {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
    }
  `,
};
