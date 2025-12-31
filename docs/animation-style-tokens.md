# Animation Style Tokens

## Design System for Motion

This document defines the animation design tokens used across the NFT platform. These tokens ensure consistency, maintainability, and a cohesive user experience.

---

## Token Categories

1. **Duration Tokens** - How long animations take
2. **Easing Tokens** - Animation acceleration curves
3. **Spring Tokens** - Physics-based motion parameters
4. **Transform Tokens** - Scale, rotation, translation values
5. **Opacity Tokens** - Visibility transition values

---

## Duration Tokens

### Micro Durations
```typescript
duration.micro = 150  // 0.15s
```
**Use Cases**:
- Icon state changes
- Tooltip appearances
- Badge updates
- Small UI feedback

**Examples**:
- Notification badge pulse
- Icon color transitions
- Checkbox check animation

---

### Fast Durations
```typescript
duration.fast = 200  // 0.2s
```
**Use Cases**:
- Button hover states
- Quick transitions
- Dropdown menus
- Tab switches

**Examples**:
- Button background color change
- Modal backdrop fade
- Dropdown slide-in

---

### Default Durations
```typescript
duration.default = 300  // 0.3s
```
**Use Cases**:
- Standard UI interactions
- Card hovers
- Menu animations
- General transitions

**Examples**:
- Card scale on hover
- Navigation menu slide
- Form field focus states

---

### Medium Durations
```typescript
duration.medium = 500  // 0.5s
```
**Use Cases**:
- Modal appearances
- Card reveals
- Content transitions
- Success animations

**Examples**:
- Modal scale-in animation
- Success checkmark reveal
- Content fade-in on scroll

---

### Slow Durations
```typescript
duration.slow = 800  // 0.8s
```
**Use Cases**:
- Page transitions
- Complex sequences
- Emphasis animations
- Celebration effects

**Examples**:
- Page route transitions
- Multi-step form progression
- Achievement unlock animations

---

## Easing Tokens

### Ease Out Expo
```typescript
easing.easeOutExpo = [0.16, 1, 0.3, 1]
```
**Personality**: Smooth, decelerative  
**Use Cases**:
- Elements entering the viewport
- Dropdown menus
- Slide-in panels

**Feel**: Starts fast, ends gently

---

### Ease In Out Cubic
```typescript
easing.easeInOutCubic = [0.65, 0, 0.35, 1]
```
**Personality**: Balanced, symmetrical  
**Use Cases**:
- Modal animations
- Page transitions
- Reversible animations

**Feel**: Smooth acceleration and deceleration

---

### Ease Out Quart
```typescript
easing.easeOutQuart = [0.22, 1, 0.36, 1]
```
**Personality**: Natural, organic  
**Use Cases**:
- Fade-in animations
- Content reveals
- Scroll-triggered animations

**Feel**: Quick start, smooth landing

---

## Spring Tokens

### Default Spring
```typescript
spring.default = {
  type: 'spring',
  stiffness: 300,
  damping: 30
}
```
**Personality**: Balanced, versatile  
**Use Cases**:
- General animations
- Card reveals
- List item animations

**Feel**: Slight bounce, natural motion

---

### Snappy Spring
```typescript
spring.snappy = {
  type: 'spring',
  stiffness: 400,
  damping: 25
}
```
**Personality**: Quick, responsive  
**Use Cases**:
- Button interactions
- Quick hovers
- Immediate feedback

**Feel**: Fast response, minimal bounce

---

### Bouncy Spring
```typescript
spring.bouncy = {
  type: 'spring',
  stiffness: 500,
  damping: 20
}
```
**Personality**: Playful, energetic  
**Use Cases**:
- Like button animations
- Success states
- Celebratory interactions

**Feel**: Pronounced bounce, fun

---

### Gentle Spring
```typescript
spring.gentle = {
  type: 'spring',
  stiffness: 200,
  damping: 35
}
```
**Personality**: Smooth, calm  
**Use Cases**:
- Large modals
- Page sections
- Subtle transitions

**Feel**: Slow, smooth, no bounce

---

## Transform Tokens

### Scale Tokens

#### Hover Scale (Small)
```typescript
transform.hoverScale = { scale: 1.05 }
```
**Use**: Buttons, small interactive elements

#### Hover Scale (Medium)
```typescript
transform.hoverScaleMedium = { scale: 1.02 }
```
**Use**: Cards, panels, larger elements

#### Hover Scale (Large)
```typescript
transform.hoverScaleLarge = { scale: 1.15 }
```
**Use**: Icons, badges, emphasis elements

#### Tap Scale
```typescript
transform.tapScale = { scale: 0.95 }
```
**Use**: All clickable elements for press feedback

---

### Rotation Tokens

#### Subtle Rotation
```typescript
transform.rotateSubtle = { rotate: 5 }  // degrees
```
**Use**: Icon hover states, playful interactions

#### Full Rotation
```typescript
transform.rotateFull = { rotate: 360 }  // degrees
```
**Use**: Loading spinners, success animations

#### Wiggle Animation
```typescript
transform.wiggle = { 
  rotate: [0, -10, 10, -10, 0],
  transition: { duration: 2, repeat: Infinity }
}
```
**Use**: Attention-grabbing elements, trophy icons

---

### Translation Tokens

#### Lift (Small)
```typescript
transform.liftSmall = { y: -4 }  // pixels
```
**Use**: Card hover states

#### Lift (Medium)
```typescript
transform.liftMedium = { y: -8 }  // pixels
```
**Use**: Emphasized hover states

#### Slide In (Right)
```typescript
transform.slideInRight = { x: 20 }  // pixels
```
**Use**: List item hover, row interactions

---

## Opacity Tokens

### Fade Levels
```typescript
opacity.hidden = 0
opacity.subtle = 0.4
opacity.medium = 0.6
opacity.visible = 1
```

### Fade Transitions
```typescript
fade.in = { opacity: 0 } → { opacity: 1 }
fade.out = { opacity: 1 } → { opacity: 0 }
fade.subtle = { opacity: 1 } → { opacity: 0.6 }
```

---

## Stagger Tokens

### Stagger Delays
```typescript
stagger.fast = 0.05    // 50ms between items
stagger.default = 0.1  // 100ms between items
stagger.slow = 0.15    // 150ms between items
```

**Use Cases**:
- **Fast**: Small lists (5-10 items)
- **Default**: Medium lists (10-20 items)
- **Slow**: Large grids, emphasis reveals

---

## Composite Animation Patterns

### Card Reveal Pattern
```typescript
{
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: spring.default
}
```

### Modal Entry Pattern
```typescript
{
  backdrop: { opacity: 0 } → { opacity: 1 },
  content: { opacity: 0, scale: 0.95, y: 20 } → { opacity: 1, scale: 1, y: 0 },
  transition: spring.snappy
}
```

### Success Celebration Pattern
```typescript
{
  initial: { scale: 0, opacity: 0 },
  animate: { scale: [0, 1.2, 1], opacity: 1 },
  transition: { duration: 0.5, times: [0, 0.6, 1] }
}
```

### List Stagger Pattern
```typescript
{
  container: { staggerChildren: 0.1 },
  item: { 
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: spring.default
  }
}
```

---

## Usage Guidelines

### Choosing Duration
1. **Micro (150ms)**: Instant feedback, no delay perceived
2. **Fast (200ms)**: Quick but noticeable
3. **Default (300ms)**: Standard, balanced
4. **Medium (500ms)**: Deliberate, draws attention
5. **Slow (800ms)**: Dramatic, special moments

### Choosing Easing
1. **Ease Out**: Elements entering view
2. **Ease In Out**: Reversible animations
3. **Spring**: Interactive elements, natural motion

### Choosing Spring
1. **Gentle**: Large elements, subtle motion
2. **Default**: General purpose, versatile
3. **Snappy**: Quick interactions, buttons
4. **Bouncy**: Playful, celebratory

---

## Implementation Example

```typescript
import { 
  duration, 
  easing, 
  spring, 
  hoverScale, 
  tapScale 
} from '@/lib/animationConfig';

<motion.button
  whileHover={hoverScale}
  whileTap={tapScale}
  transition={spring.snappy}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95 }}
>
  Click Me
</motion.button>
```

---

## Token Naming Convention

### Pattern
`{category}.{variant}` or `{category}{Variant}`

### Examples
- `duration.fast` ✅
- `spring.bouncy` ✅
- `hoverScale` ✅
- `tapScale` ✅
- `easing.easeOutExpo` ✅

### Anti-patterns
- `fastDuration` ❌
- `bouncySpring` ❌
- `scale_hover` ❌

---

## Accessibility Considerations

### Reduced Motion
When `prefers-reduced-motion: reduce` is detected:

```typescript
const reducedMotion = {
  duration: { ...duration, default: 0.01, medium: 0.01, slow: 0.01 },
  spring: { type: 'spring', stiffness: 1000, damping: 100 },
  transform: { scale: 1, y: 0, x: 0 }  // Disable transforms
}
```

### Implementation
```typescript
const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const animationConfig = shouldReduceMotion ? reducedMotion : standardMotion;
```

---

## Design Principles

### 1. Purposeful Motion
Every animation should have a clear purpose:
- **Feedback**: Confirm user actions
- **Guidance**: Direct attention
- **Relationship**: Show element connections
- **Delight**: Add personality (sparingly)

### 2. Performance First
- Animate `transform` and `opacity` only
- Avoid animating layout properties
- Use GPU acceleration
- Limit simultaneous animations

### 3. Consistency
- Use tokens, not arbitrary values
- Follow established patterns
- Maintain timing relationships
- Respect the design system

### 4. Restraint
- Less is more
- Avoid animation overload
- Let content shine
- Use motion to enhance, not distract

---

## Token Evolution

### Version History
- **v1.0** (2024): Initial token system
- **v1.1** (Planned): Add haptic feedback tokens
- **v2.0** (Planned): Advanced physics simulations

### Deprecation Policy
- Deprecated tokens supported for 2 major versions
- Migration guides provided
- Console warnings for deprecated usage

---

## Resources

### Tools
- [Cubic Bezier Generator](https://cubic-bezier.com/)
- [Spring Physics Visualizer](https://www.react-spring.io/visualizer)
- [Framer Motion Docs](https://www.framer.com/motion/)

### Inspiration
- Material Design Motion
- Apple Human Interface Guidelines
- Stripe Design System

---

**Maintained By**: Design & Frontend Teams  
**Last Updated**: 2024  
**Next Review**: Quarterly
