# Gamified Onboarding Script & Demo Logic

## Overview
The Kōbo gamified onboarding system transforms the traditional user onboarding into an interactive adventure with minigames, achievements, and AR/VR previews. This document outlines the complete onboarding flow, game mechanics, and implementation logic.

---

## Onboarding Flow Architecture

### Quest Structure
The onboarding consists of 5 progressive quests:

1. **Welcome Quest** - Introduction to Kōbo Universe
2. **Mint Quest** - Interactive NFT creation tutorial
3. **Collaboration Quest** - Multi-user minting experience
4. **Dynamic Traits Quest** - NFT evolution mechanics
5. **AR/VR Gallery Quest** - Immersive viewing experience

---

## Quest 1: Welcome to Kōbo Universe

### Objective
Introduce users to the platform and set expectations for the gamified experience.

### Script
```
Title: "Welcome to Kōbo Universe"
Subtitle: "Your AI-Powered NFT Adventure Begins"

Description:
"Embark on an interactive journey to master NFT creation, collaboration, 
and dynamic traits! Complete quests to unlock achievements and earn XP."

Reward: Explorer Badge (+10 XP)
```

### UI Elements
- Animated rocket icon with rotating gradient glow
- XP counter display (starts at 0)
- Progress bar (0/5 quests)
- Achievement preview card
- "Start Quest" button with play icon

### Logic Flow
```typescript
1. Display welcome screen with animated entrance
2. Show quest overview and reward preview
3. User clicks "Start Quest" or "Continue"
4. Unlock Explorer achievement
5. Transition to Mint Quest
```

---

## Quest 2: Mint Your First NFT

### Objective
Teach users the NFT creation process through interactive steps.

### Script
```
Title: "Mint Your First NFT"
Subtitle: "Create AI-Powered Art"

Tutorial Steps:
1. "Enter Your Prompt" - Describe the NFT you want to create
2. "Generate AI Art" - Watch AI bring your vision to life
3. "Mint Your NFT" - Publish to blockchain with provenance

Reward: Creator Badge (+50 XP)
```

### Minigame Mechanics

#### Step 1: Prompt Entry
- **UI**: Large textarea with placeholder suggestions
- **Suggestions**: "Mystical Dragon", "Cyber Samurai", "Space Explorer"
- **Validation**: Requires non-empty prompt
- **Animation**: Suggestion chips bounce on hover

#### Step 2: AI Generation
- **UI**: Loading animation with rotating sparkles
- **Duration**: 2-second simulated generation
- **Visual**: Progress indicator with AI-themed messaging
- **Result**: Display generated placeholder image

#### Step 3: Minting
- **UI**: NFT preview card with metadata
- **Info Display**:
  - Provenance: "Tracked"
  - Copyright: "Verified" (green badge)
- **Action**: "Mint NFT" button with sparkles icon
- **Duration**: 2-second simulated blockchain transaction

### Logic Flow
```typescript
State Management:
- currentStep: 0 | 1 | 2
- prompt: string
- isGenerating: boolean
- generatedImage: string | null
- isMinting: boolean

Flow:
1. User enters prompt → Enable "Continue" button
2. Click "Generate" → Show loading (2s) → Display image
3. Click "Mint NFT" → Show minting animation (2s)
4. Unlock Creator achievement (+50 XP)
5. Confetti animation
6. Transition to Collaboration Quest
```

---

## Quest 3: Join a Collaboration

### Objective
Demonstrate collaborative minting and community creation.

### Script
```
Title: "Join a Collaboration"
Subtitle: "Create Together"

Session Details:
- Name: "Cosmic Dreamscape"
- Active Collaborators: 2
- Spots Available: 1
- Time Remaining: 5 minutes

Tutorial Steps:
1. Join active collaboration session
2. View other collaborators' contributions
3. Add your creative contribution
4. Submit and complete collaboration

Reward: Collaborator Badge (+75 XP)
```

### Minigame Mechanics

#### Phase 1: Session Discovery
- **UI**: Collaboration card with live indicator
- **Display**:
  - Session name and description
  - Collaborator avatars (stacked)
  - "Live" badge with pulsing green dot
  - Time remaining countdown
- **Action**: "Join Collaboration" button

#### Phase 2: Active Collaboration
- **UI**: 3-column grid showing collaborators
  - Alice (Background) 🎨
  - Bob (Character) 🖌️
  - You (Effects) ✨
- **Canvas**: Animated gradient preview showing combined work
- **Timer**: 30-second countdown
- **Input**: Textarea for contribution description

#### Phase 3: Completion
- **UI**: Success animation with checkmark
- **Display**:
  - "Collaboration Complete!" message
  - Collaborator count: 3
  - Ownership: "Equal ownership" badge
- **Animation**: Rotating success icon with gradient glow

### Logic Flow
```typescript
State Management:
- step: 'join' | 'contribute' | 'complete'
- activeCollaborators: Collaborator[]
- contribution: string
- timeLeft: number (30s countdown)

Flow:
1. Display session card → User clicks "Join"
2. Animate collaborator additions (staggered)
3. Show canvas preview with animated gradients
4. User enters contribution → Enable "Submit"
5. Click "Submit" → Show completion animation
6. Unlock Collaborator achievement (+75 XP)
7. Confetti animation
8. Transition to Dynamic Traits Quest
```

---

## Quest 4: Test Dynamic Traits

### Objective
Teach users about NFT evolution through community voting.

### Script
```
Title: "Test Dynamic Traits"
Subtitle: "Evolving NFTs"

Concept:
"Discover how NFTs evolve based on community votes and on-chain events.
Your NFT can transform over time based on collective decisions."

Trait Options:
1. Cosmic Glow ✨ - Ethereal particle effects
2. Energy Wings 🦋 - Dynamic wing animations
3. Power Aura 💫 - Pulsing energy field

Reward: Innovator Badge (+100 XP)
```

### Minigame Mechanics

#### Phase 1: Introduction
- **UI**: Base NFT display (🎭 mask emoji)
- **Info Cards**:
  - "Community Driven" - Traits evolve based on votes
  - "On-Chain Events" - Triggered by blockchain data
- **Action**: "Start Voting" button

#### Phase 2: Voting
- **UI**: Trait selection cards (3 options)
- **Each Card Shows**:
  - Trait icon (emoji)
  - Trait name
  - Current vote count
  - Selection indicator (checkmark when selected)
- **Interaction**: Click to vote, visual feedback on selection
- **Action**: "Submit Vote" button (disabled until selection)

#### Phase 3: Evolution
- **UI**: Transformation animation
- **Visual**: NFT rotating and scaling
- **Duration**: 2 seconds
- **Messaging**: "Evolving... Community votes are being processed"
- **Animation**: Pulsing dots indicator

#### Phase 4: Result
- **UI**: Evolved NFT with winning trait
- **Display**:
  - Enhanced NFT visual (base + trait emoji)
  - "Evolved!" badge (green)
  - Winning trait name highlighted
  - "Dynamic Trait Unlocked" badge

### Logic Flow
```typescript
State Management:
- step: 'intro' | 'vote' | 'evolve' | 'complete'
- traitVotes: { id, name, votes, icon }[]
- selectedTrait: string | null
- nftState: 'base' | 'glow' | 'wings' | 'aura'

Flow:
1. Show base NFT + info cards
2. User clicks "Start Voting" → Display trait options
3. User selects trait → Highlight selection
4. Click "Submit Vote" → Show evolution animation (2s)
5. Determine winning trait (highest votes)
6. Display evolved NFT with trait
7. Unlock Innovator achievement (+100 XP)
8. Confetti animation
9. Transition to AR/VR Quest
```

---

## Quest 5: AR/VR Gallery Preview

### Objective
Showcase immersive viewing capabilities for NFTs.

### Script
```
Title: "AR/VR Gallery Preview"
Subtitle: "Immersive Experience"

Options:
1. Mobile AR Preview
   - View NFTs in your real environment
   - Camera-based placement
   - Move & rotate in 3D space

2. Web VR Gallery
   - Explore immersive 3D gallery space
   - Full 360° environment
   - Interactive navigation

Reward: Visionary Badge (+150 XP)
```

### Minigame Mechanics

#### Phase 1: Mode Selection
- **UI**: Two large option cards
- **Mobile AR Card**:
  - Smartphone icon
  - "AR Preview" title
  - Features: Camera placement, 3D rotation
  - "Mobile" badge
- **Web VR Card**:
  - Monitor icon
  - "VR Gallery" title
  - Features: 360° environment, interactive navigation
  - "Web" badge

#### Phase 2A: Mobile AR Experience
- **Scanning Phase** (2s):
  - Camera icon animation
  - "Scanning environment..." message
  - "Point camera at flat surface" instruction
  
- **AR View**:
  - Simulated camera feed background
  - AR grid overlay (8x8 grid, blue lines)
  - 3D NFT in center (rotating, scalable)
  - Controls: Zoom in/out buttons
  - "AR Active" indicator (green pulsing dot)

#### Phase 2B: Web VR Experience
- **VR Gallery**:
  - 3D gallery space with floor grid
  - Multiple NFT displays (3 visible)
  - Center NFT highlighted and enlarged
  - Continuous rotation animation
  - Animated gradient background
  - "VR Gallery Mode" indicator
  - "Drag to look around" hint

#### Phase 3: Completion
- **UI**: Success screen
- **Display**:
  - Large checkmark with rotating glow
  - "Immersive Experience Complete!" message
  - "Visionary Achievement Unlocked" badge
- **Animation**: Bouncy spring entrance

### Logic Flow
```typescript
State Management:
- viewMode: 'select' | 'mobile-ar' | 'web-vr' | 'complete'
- rotation: number (0-360)
- scale: number (0.5-2.0)
- isScanning: boolean

Flow:
1. Display mode selection cards
2. User selects mode:
   
   Mobile AR Path:
   a. Show scanning animation (2s)
   b. Display AR viewport with NFT
   c. Enable zoom controls
   d. Auto-rotate NFT
   e. User clicks "Complete AR Experience"
   
   Web VR Path:
   a. Display VR gallery immediately
   b. Show 3 NFTs with center focus
   c. Continuous rotation animation
   d. User clicks "Complete VR Experience"

3. Show completion screen
4. Unlock Visionary achievement (+150 XP)
5. Confetti animation
6. Call onComplete() → Return to main app
```

---

## Achievement System

### Achievement Structure
```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  points: number;
  unlocked: boolean;
}
```

### All Achievements
1. **Explorer** - Started Kōbo journey (+10 XP)
2. **Creator** - Minted first NFT (+50 XP)
3. **Collaborator** - Joined first collab (+75 XP)
4. **Innovator** - Mastered dynamic traits (+100 XP)
5. **Visionary** - Explored AR/VR gallery (+150 XP)

**Total Possible XP**: 385 points

### Unlock Animation
```typescript
1. Update achievement state (unlocked: true)
2. Add points to totalPoints
3. Trigger confetti animation (3s duration)
4. Display achievement badge in header
5. Animate badge entrance (scale + rotate spring)
```

---

## UI Components & Animations

### Header Elements
- **XP Counter**: Yellow coin icon + points + "XP" label
- **Achievement Badges**: Circular gradient badges with icons
- **Progress Indicator**: "Quest Progress X/5" text
- **Progress Bar**: Gradient bar (purple → pink → blue)

### Quest Indicators
- **Completed**: Green gradient circle + checkmark
- **Current**: Purple/pink gradient + pulsing animation + bottom dot
- **Locked**: Gray circle + lock icon

### Confetti System
```typescript
Trigger: On achievement unlock
Duration: 3 seconds
Particles: 50
Colors: Purple, pink, blue, green
Animation: Radial explosion from center
Physics: Scale [0→1→0], random rotation, easeOut
```

### Atmospheric Effects
- **Fog Layer**: Subtle moving fog
- **Particle System**: 50 floating particles
- **Glow Orbs**: 
  - Purple (large, top-left)
  - Pink (medium, bottom-right)
  - Blue (small, top-right)

---

## State Management

### Global State
```typescript
interface OnboardingState {
  currentStepIndex: number;
  achievements: Achievement[];
  totalPoints: number;
  showMinigame: boolean;
  confetti: boolean;
}
```

### Persistence
- Store progress in localStorage
- Resume from last completed quest
- Track achievement unlocks
- Save XP total

---

## Responsive Design

### Mobile Optimizations
- Single column layouts for minigames
- Larger touch targets (min 44x44px)
- Simplified AR viewport for smaller screens
- Reduced particle counts on mobile

### Desktop Enhancements
- Multi-column layouts where appropriate
- Enhanced visual effects
- Larger preview areas
- More detailed animations

---

## Performance Considerations

### Animation Optimization
- Use GPU-accelerated properties (transform, opacity)
- Limit particle counts based on device capability
- Debounce rotation updates
- Use `will-change` for animated elements

### Asset Loading
- Lazy load minigame components
- Preload achievement icons
- Use placeholder images for NFT previews
- Optimize emoji rendering

---

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to skip animations (optional)

### Screen Readers
- Descriptive ARIA labels for all icons
- Announce achievement unlocks
- Progress updates announced
- Clear button labels

### Reduced Motion
- Respect `prefers-reduced-motion`
- Disable confetti if motion reduced
- Simplify rotation animations
- Instant transitions instead of springs

---

## Integration Points

### Entry Point
```typescript
// In main app routing
<Route path="/onboarding" element={
  <GamifiedOnboarding 
    onComplete={() => navigate('/dashboard')} 
  />
} />
```

### Completion Handler
```typescript
const handleComplete = () => {
  // Save completion status
  localStorage.setItem('onboarding_completed', 'true');
  
  // Track analytics
  trackEvent('onboarding_completed', {
    total_xp: totalPoints,
    achievements: achievements.filter(a => a.unlocked).length
  });
  
  // Navigate to main app
  navigate('/dashboard');
};
```

### Skip Option
```typescript
// Optional: Allow users to skip
<button onClick={() => {
  if (confirm('Skip onboarding? You can replay it later.')) {
    handleComplete();
  }
}}>
  Skip Tutorial
</button>
```

---

## Testing Scenarios

### Happy Path
1. Complete all 5 quests in order
2. Unlock all achievements
3. Earn 385 XP
4. Successfully navigate to dashboard

### Edge Cases
1. Refresh during minigame → Resume from current quest
2. Skip without completing → Mark as skipped
3. Return to onboarding → Show completion status
4. Mobile AR on desktop → Show fallback message

### Error Handling
1. Failed NFT generation → Retry option
2. Network timeout → Offline mode message
3. Browser compatibility → Feature detection

---

## Future Enhancements

### Potential Additions
1. **Leaderboard**: Compare XP with other new users
2. **Daily Quests**: Return for bonus challenges
3. **Advanced Tutorials**: Deep dives into specific features
4. **Social Sharing**: Share achievements on social media
5. **Replay Mode**: Revisit quests for practice
6. **Difficulty Levels**: Beginner, intermediate, advanced paths
7. **Multiplayer Onboarding**: Complete quests with friends
8. **NFT Rewards**: Mint commemorative NFT for completion

---

## Analytics Tracking

### Events to Track
```typescript
// Quest progression
trackEvent('quest_started', { quest_id, quest_name });
trackEvent('quest_completed', { quest_id, duration_seconds });

// Achievements
trackEvent('achievement_unlocked', { achievement_id, total_xp });

// Minigame interactions
trackEvent('minigame_action', { minigame, action, value });

// Completion
trackEvent('onboarding_completed', { 
  total_duration_seconds,
  total_xp,
  achievements_unlocked 
});

// Drop-off
trackEvent('onboarding_abandoned', { 
  last_quest,
  progress_percentage 
});
```

---

## Conclusion

The gamified onboarding system transforms user education into an engaging adventure. By combining interactive minigames, achievement systems, and immersive AR/VR previews, users learn platform features while having fun. The progressive quest structure ensures users understand core concepts before advancing, while the XP and achievement system provides motivation and a sense of accomplishment.
