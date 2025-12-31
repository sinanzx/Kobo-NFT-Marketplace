# Animation Component Registry

## Overview
This document catalogs all animation components, triggers, and style tokens used throughout the NFT platform. All animations follow consistent principles for easing, timing, and performance optimization.

---

## Animation Configuration System

### Location
`src/lib/animationConfig.ts`

### Core Principles
- **Consistency**: All animations use centralized configuration
- **Performance**: GPU-accelerated transforms (scale, rotate, opacity, x, y)
- **Accessibility**: Respects `prefers-reduced-motion`
- **Smoothness**: Spring physics for natural motion

---

## Animation Variants

### 1. Fade Up Variants
**Usage**: Page sections, headers, content blocks  
**Trigger**: Component mount or scroll into view  
**Config**:
```typescript
fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}
```

**Components Using**:
- `NFTGallery` - Header section
- `Leaderboard` - Title and filters
- `Roadmap` - Section header
- `ComplianceDashboard` - Main container

---

### 2. Stagger Container & Item Variants
**Usage**: Lists, grids, sequential reveals  
**Trigger**: Parent container enters viewport  
**Config**:
```typescript
staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: spring.default }
}
```

**Components Using**:
- `NFTGallery` - NFT card grid
- `Leaderboard` - Leaderboard entries
- `Roadmap` - Timeline milestones
- `ComplianceNotifications` - Notification list

---

### 3. Card Reveal Variants
**Usage**: Card components, modals, panels  
**Trigger**: Component mount  
**Config**:
```typescript
cardRevealVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring.default }
}
```

**Components Using**:
- `AnimatedCard` - Reusable card wrapper
- `ComplianceResultsModal` - Modal content sections

---

### 4. Modal Variants
**Usage**: Modals, dialogs, overlays  
**Trigger**: Modal open state  
**Config**:
```typescript
modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
}

modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring.snappy },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
}
```

**Components Using**:
- `ComplianceResultsModal` - Compliance scan results
- `NFTGallery` - NFT detail modal

---

### 5. Scale Variants
**Usage**: Icons, badges, emphasis elements  
**Trigger**: Component mount  
**Config**:
```typescript
scaleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: spring.bouncy }
}
```

**Components Using**:
- `Leaderboard` - Trophy icon
- `ComplianceNotifications` - Notification icons

---

### 6. Success Variants
**Usage**: Success states, confirmations  
**Trigger**: Success state change  
**Config**:
```typescript
successVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: [0, 1.2, 1], 
    opacity: 1, 
    transition: { duration: 0.5, times: [0, 0.6, 1] } 
  }
}
```

**Components Using**:
- `ComplianceResultsModal` - Success checkmarks
- Form submission confirmations

---

## Hover & Interaction Animations

### Hover Scale
**Usage**: Buttons, clickable cards  
**Config**: `{ scale: 1.05 }`  
**Transition**: `spring.snappy`

**Components**:
- `AnimatedButton`
- `NFTGallery` - View mode toggles
- `Leaderboard` - Tab triggers

---

### Hover Lift
**Usage**: Cards, panels  
**Config**: `{ scale: 1.02, y: -4 }`  
**Transition**: `spring.snappy`

**Components**:
- `NFTGallery` - NFT cards
- `Roadmap` - Milestone cards

---

### Tap Scale
**Usage**: All interactive elements  
**Config**: `{ scale: 0.95 }`  
**Transition**: `spring.snappy`

**Components**:
- All buttons
- Interactive cards
- Icon buttons

---

## Spring Configurations

### Default Spring
**Usage**: General animations  
**Config**:
```typescript
{ type: 'spring', stiffness: 300, damping: 30 }
```

### Snappy Spring
**Usage**: Quick interactions  
**Config**:
```typescript
{ type: 'spring', stiffness: 400, damping: 25 }
```

### Bouncy Spring
**Usage**: Playful interactions  
**Config**:
```typescript
{ type: 'spring', stiffness: 500, damping: 20 }
```

### Gentle Spring
**Usage**: Smooth, slow animations  
**Config**:
```typescript
{ type: 'spring', stiffness: 200, damping: 35 }
```

---

## Easing Functions

### Ease Out Expo
**Usage**: Smooth decelerations  
**Bezier**: `[0.16, 1, 0.3, 1]`

### Ease In Out Cubic
**Usage**: Balanced animations  
**Bezier**: `[0.65, 0, 0.35, 1]`

### Ease Out Quart
**Usage**: Natural motion  
**Bezier**: `[0.22, 1, 0.36, 1]`

---

## Duration Standards

- **Micro**: 150ms - Icon rotations, small state changes
- **Fast**: 200ms - Button hovers, quick transitions
- **Default**: 300ms - Standard animations
- **Medium**: 500ms - Card reveals, modals
- **Slow**: 800ms - Page transitions, complex sequences

---

## Specialized Animations

### Wallet Connect Animation
**Component**: `WalletConnectAnimation`  
**Trigger**: Wallet connection success  
**Features**:
- Checkmark reveal with scale bounce
- Particle burst effect
- Success message fade-in
- Auto-dismiss after 2s

**Usage**:
```tsx
<WalletConnectAnimation 
  isVisible={isConnected} 
  onComplete={() => setShowAnimation(false)} 
/>
```

---

### NFT Card Interactions
**Component**: `NFTGallery`  
**Animations**:
1. **Card Hover**: Scale 1.02, lift -4px
2. **Like Button**: Scale 1.15, rotate 10° (bouncy spring)
3. **Share Button**: Scale 1.15, rotate -5° (snappy spring)
4. **Grid Layout**: Stagger reveal with 50ms delay per item

---

### Leaderboard Rank Animations
**Component**: `Leaderboard`  
**Animations**:
1. **Trophy Icon**: Wiggle animation (rotate -10° to 10°, 2s loop)
2. **Rank Icons**: Scale 1.3 + 360° rotation on hover (top 3 only)
3. **Row Hover**: Scale 1.01, translate X 4px
4. **Entry Reveal**: Stagger with spring physics

---

### Roadmap Timeline Animations
**Component**: `Roadmap`  
**Animations**:
1. **Milestone Nodes**: Scale 1.3 + 360° rotation on hover
2. **Icon Counter-Rotation**: -360° on parent hover
3. **Card Lift**: Scale 1.02, Y -4px on hover
4. **Sequential Reveal**: Stagger from top to bottom

---

## Performance Guidelines

### DO ✅
- Use `transform` and `opacity` for animations
- Apply `will-change` sparingly and remove after animation
- Use `AnimatePresence` for exit animations
- Batch layout animations with `layout` prop
- Respect `prefers-reduced-motion` media query

### DON'T ❌
- Animate `width`, `height`, `top`, `left` (causes layout thrashing)
- Use too many simultaneous animations (>10)
- Animate during scroll (use `whileInView` instead)
- Forget exit animations (causes visual jumps)
- Override spring physics without reason

---

## Accessibility

All animations respect user preferences:
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

When reduced motion is preferred:
- Durations reduced to 0.01s
- Spring stiffness increased to 1000
- Complex animations simplified to opacity fades

---

## Component Checklist

When adding animations to a new component:

1. ✅ Import animation config from `@/lib/animationConfig`
2. ✅ Use existing variants when possible
3. ✅ Apply consistent spring/easing
4. ✅ Add hover/tap states for interactive elements
5. ✅ Use `AnimatePresence` for conditional rendering
6. ✅ Test with `prefers-reduced-motion`
7. ✅ Document in this registry
8. ✅ Verify 60fps performance (Chrome DevTools)

---

## Future Enhancements

### Planned Additions
- [ ] Page transition animations
- [ ] Loading skeleton animations
- [ ] Toast notification animations
- [ ] Drag-and-drop animations
- [ ] Scroll-triggered parallax effects
- [ ] Confetti/celebration animations for achievements

### Under Consideration
- [ ] Sound effects for key interactions
- [ ] Haptic feedback for mobile
- [ ] Advanced physics simulations
- [ ] WebGL-based particle systems

---

## Maintenance

**Last Updated**: 2024  
**Maintained By**: Development Team  
**Review Frequency**: Quarterly

For questions or suggestions, contact the frontend team.
