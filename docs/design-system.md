# Kōbo Design System
## Playful, Interactive UI/UX with Glass & Metal Motifs

---

## Design Philosophy

### Core Principles
1. **Playful Interactivity**: Every interaction delights with micro-animations
2. **Glass Morphism**: Translucent surfaces with backdrop blur
3. **Metallic Accents**: Reflective, gradient metal effects
4. **Atmospheric Depth**: Fog, light rays, and layered depth
5. **Responsive Feedback**: Immediate visual/haptic response to all actions

### Visual Language
- **Dark Mode First**: Deep blacks with subtle gradients
- **Reflective Surfaces**: Cylinder reflections, chrome effects
- **Particle Systems**: Floating particles, light beams
- **Smooth Transitions**: 60fps animations, spring physics
- **Depth Layers**: Multiple z-index layers with parallax

---

## Color System

### Primary Palette
```css
/* Base Colors */
--color-bg-primary: #0a0a0f;        /* Deep space black */
--color-bg-secondary: #12121a;      /* Card background */
--color-bg-tertiary: #1a1a24;       /* Elevated surfaces */

/* Glass Effects */
--color-glass-light: rgba(255, 255, 255, 0.05);
--color-glass-medium: rgba(255, 255, 255, 0.1);
--color-glass-strong: rgba(255, 255, 255, 0.15);

/* Metal Gradients */
--gradient-metal-silver: linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 50%, #e8e8e8 100%);
--gradient-metal-gold: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
--gradient-metal-chrome: linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 25%, #f0f0f0 50%, #c0c0c0 75%, #f0f0f0 100%);
```

### Accent Colors
```css
/* Brand Colors */
--color-primary: #8b5cf6;           /* Purple */
--color-secondary: #ec4899;         /* Pink */
--color-accent: #06b6d4;            /* Cyan */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
--gradient-secondary: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
--gradient-accent: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);

/* State Colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
```

### Atmospheric Effects
```css
/* Fog & Mist */
--color-fog-light: rgba(139, 92, 246, 0.1);
--color-fog-medium: rgba(139, 92, 246, 0.2);
--color-fog-dense: rgba(139, 92, 246, 0.3);

/* Light Rays */
--color-light-beam: rgba(255, 255, 255, 0.05);
--color-light-glow: rgba(139, 92, 246, 0.3);
```

---

## Typography

### Font Stack
```css
/* Primary Font */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Display Font */
--font-display: 'Space Grotesk', 'Inter', sans-serif;

/* Monospace */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

---

## Spacing System

### Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

---

## Animation Principles

### Timing Functions
```css
/* Easing Curves */
--ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Duration Scale
```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 700ms;
```

### Animation Types

#### 1. Micro-interactions
- **Hover**: Scale 1.02-1.05, lift shadow
- **Click**: Scale 0.98, brief glow
- **Focus**: Outline glow, subtle pulse
- **Success**: Checkmark animation, confetti burst
- **Error**: Shake animation, red glow

#### 2. Transitions
- **Page Enter**: Fade up + blur out
- **Page Exit**: Fade down + blur in
- **Modal Open**: Scale from 0.9 + fade
- **Modal Close**: Scale to 0.95 + fade

#### 3. Loading States
- **Spinner**: Rotating gradient ring
- **Skeleton**: Shimmer wave effect
- **Progress**: Gradient fill animation
- **Pulse**: Breathing glow effect

---

## Glass Morphism Components

### Glass Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

### Metal Surface
```css
.metal-surface {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  position: relative;
  overflow: hidden;
}

.metal-surface::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: metal-shine 3s infinite;
}
```

### Reflective Cylinder
```css
.cylinder-reflect {
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.15) 25%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border-radius: 50%;
  box-shadow: 
    inset -10px 0 20px rgba(0, 0, 0, 0.3),
    inset 10px 0 20px rgba(255, 255, 255, 0.1);
}
```

---

## Atmospheric Effects

### Fog Layer
```css
.fog-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    rgba(139, 92, 246, 0.1) 0%,
    transparent 70%
  );
  animation: fog-drift 20s infinite alternate;
}
```

### Light Beams
```css
.light-beam {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  opacity: 0.3;
  animation: beam-sweep 5s infinite;
}
```

### Particle System
```css
.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: particle-float 10s infinite;
}
```

---

## Component Specifications

### Button Variants

#### Primary Button
```tsx
<button className="
  px-6 py-3 rounded-xl
  bg-gradient-to-r from-purple-600 to-pink-600
  text-white font-semibold
  shadow-lg shadow-purple-500/50
  hover:shadow-xl hover:shadow-purple-500/70
  hover:scale-105
  active:scale-95
  transition-all duration-200
  relative overflow-hidden
  group
">
  <span className="relative z-10">Button Text</span>
  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
</button>
```

#### Glass Button
```tsx
<button className="
  px-6 py-3 rounded-xl
  bg-white/5 backdrop-blur-md
  border border-white/10
  text-white font-medium
  hover:bg-white/10
  hover:border-white/20
  hover:scale-105
  active:scale-95
  transition-all duration-200
">
  Glass Button
</button>
```

#### Metal Button
```tsx
<button className="
  px-6 py-3 rounded-xl
  bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
  text-gray-900 font-bold
  shadow-lg
  hover:shadow-xl
  hover:scale-105
  active:scale-95
  transition-all duration-200
  relative overflow-hidden
  before:absolute before:inset-0
  before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
  before:translate-x-[-200%]
  hover:before:translate-x-[200%]
  before:transition-transform before:duration-700
">
  Metal Button
</button>
```

### Input Fields

#### Glass Input
```tsx
<input className="
  w-full px-4 py-3 rounded-xl
  bg-white/5 backdrop-blur-md
  border border-white/10
  text-white placeholder-gray-400
  focus:bg-white/10
  focus:border-purple-500/50
  focus:ring-2 focus:ring-purple-500/20
  transition-all duration-200
" />
```

### Cards

#### NFT Card
```tsx
<div className="
  group relative
  bg-white/5 backdrop-blur-md
  border border-white/10
  rounded-2xl overflow-hidden
  hover:bg-white/10
  hover:border-white/20
  hover:scale-105
  hover:shadow-2xl hover:shadow-purple-500/20
  transition-all duration-300
  cursor-pointer
">
  {/* Image */}
  <div className="relative aspect-square overflow-hidden">
    <img className="
      w-full h-full object-cover
      group-hover:scale-110
      transition-transform duration-500
    " />
    {/* Overlay on hover */}
    <div className="
      absolute inset-0
      bg-gradient-to-t from-black/80 via-black/20 to-transparent
      opacity-0 group-hover:opacity-100
      transition-opacity duration-300
    " />
  </div>
  
  {/* Content */}
  <div className="p-4">
    <h3 className="text-lg font-bold text-white mb-2">NFT Title</h3>
    <p className="text-sm text-gray-400">Creator Name</p>
  </div>
</div>
```

---

## Onboarding Flow Specifications

### Step 1: Welcome Screen
**Animation Sequence:**
1. Logo fades in with scale (0.8 → 1.0)
2. Title slides up with blur (20px → 0)
3. Subtitle fades in
4. CTA button scales in with bounce
5. Background particles animate in

**Interactions:**
- Hover CTA: Glow pulse, scale 1.05
- Click CTA: Ripple effect, page transition

### Step 2: Wallet Connection
**Animation Sequence:**
1. Wallet icons slide in from sides
2. Each icon has hover state with lift
3. Selected wallet glows and scales
4. Connection progress with animated dots
5. Success checkmark with confetti

**Interactions:**
- Wallet hover: Lift + glow
- Wallet click: Scale down, then expand with glow
- Connecting: Pulsing ring animation
- Success: Checkmark draw + particle burst

### Step 3: Profile Setup
**Animation Sequence:**
1. Form fields slide in sequentially
2. Avatar upload area pulses gently
3. Input focus: Border glow animation
4. Character count animates on type
5. Submit button gradient shift

**Interactions:**
- Input focus: Glow ring, lift label
- Avatar upload: Drag overlay appears
- Submit: Loading spinner, success state

### Step 4: First NFT Preview
**Animation Sequence:**
1. NFT card flips in 3D
2. Metadata fields type in sequentially
3. Mint button glows with pulse
4. Background fog intensifies
5. Celebration animation on complete

---

## Minting Flow Specifications

### Phase 1: Creation Mode Selection
**Layout:**
- Two large cards: "AI Generate" vs "Manual Upload"
- Glass morphism with metal accents
- Hover: Card lifts, glow intensifies

**Animations:**
- Cards slide in from left/right
- Hover: 3D tilt effect, shadow expansion
- Click: Card expands to full screen

### Phase 2: AI Generation
**Layout:**
- Prompt input with suggestions
- Model selector with previews
- Parameter sliders with live preview
- Generate button with progress

**Animations:**
- Prompt typing: Suggestions fade in
- Model select: Cards flip to show details
- Slider drag: Value animates smoothly
- Generate: Progress ring with particles
- Result: Image fades in with blur reduction

### Phase 3: Preview & Metadata
**Layout:**
- Large preview with zoom capability
- Metadata form with validation
- Provenance fields with info tooltips
- Mint button with cost display

**Animations:**
- Preview: Zoom on hover, pan on drag
- Form fields: Slide in sequentially
- Validation: Checkmark or shake
- Mint button: Pulse glow when ready

### Phase 4: Minting Progress
**Layout:**
- Large circular progress indicator
- Step-by-step status list
- Transaction hash with copy button
- Estimated time remaining

**Animations:**
- Progress ring: Gradient fill
- Steps: Checkmark draw animation
- Hash: Fade in, copy ripple effect
- Success: Confetti burst, NFT card reveal

---

## Collections Gallery Specifications

### Grid Layout
**Structure:**
- Masonry grid with variable heights
- Infinite scroll with skeleton loading
- Filter sidebar with glass effect
- Sort dropdown with smooth transitions

**Animations:**
- Cards: Stagger fade-in on scroll
- Hover: Lift + glow + scale
- Click: Expand to detail modal
- Filter: Slide in from left
- Sort: Dropdown with spring animation

### Detail Modal
**Layout:**
- Full-screen overlay with blur backdrop
- Large image with zoom controls
- Metadata sidebar with tabs
- Action buttons (buy, share, etc.)

**Animations:**
- Open: Scale from card position
- Close: Scale back to grid
- Image zoom: Smooth transform
- Tab switch: Slide + fade
- Actions: Ripple on click

---

## Micro-Animation Library

### Hover Effects
```css
/* Lift */
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

/* Glow */
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
}

/* Scale */
.hover-scale:hover {
  transform: scale(1.05);
}

/* Tilt */
.hover-tilt:hover {
  transform: perspective(1000px) rotateX(5deg) rotateY(5deg);
}
```

### Click Effects
```css
/* Press */
.click-press:active {
  transform: scale(0.95);
}

/* Ripple */
.click-ripple {
  position: relative;
  overflow: hidden;
}

.click-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out;
}
```

### Loading States
```css
/* Shimmer */
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

/* Pulse */
.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Spin */
.spin {
  animation: spin 1s linear infinite;
}
```

---

## Accessibility Considerations

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus States
- All interactive elements have visible focus rings
- Focus rings use brand colors with sufficient contrast
- Keyboard navigation follows logical tab order

### Color Contrast
- Text maintains WCAG AA standards (4.5:1 minimum)
- Interactive elements have 3:1 contrast minimum
- Error states use both color and icons

---

## Performance Guidelines

### Animation Performance
- Use `transform` and `opacity` for animations
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly for complex animations
- Implement intersection observer for scroll animations

### Asset Optimization
- Lazy load images below the fold
- Use WebP with fallbacks
- Implement progressive image loading
- Compress and optimize all assets

### Code Splitting
- Lazy load route components
- Split animation libraries into chunks
- Load heavy 3D effects on demand

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Set up design tokens in CSS variables
- [ ] Create base component library
- [ ] Implement glass morphism utilities
- [ ] Add metal gradient system
- [ ] Set up animation utilities

### Phase 2: Components
- [ ] Build button variants
- [ ] Create input components
- [ ] Develop card components
- [ ] Implement modal system
- [ ] Add loading states

### Phase 3: Flows
- [ ] Build onboarding sequence
- [ ] Create minting flow
- [ ] Develop collections gallery
- [ ] Add wallet connection
- [ ] Implement notifications

### Phase 4: Polish
- [ ] Add micro-interactions
- [ ] Implement atmospheric effects
- [ ] Optimize performance
- [ ] Test accessibility
- [ ] Cross-browser testing
