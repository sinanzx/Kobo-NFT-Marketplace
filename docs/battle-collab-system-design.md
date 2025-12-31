# Battle Mode & Collaborative Mint System Design

## System Architecture Overview

### Core Components
1. **Smart Contracts**: Battle tracking, collaborative attribution, prize distribution
2. **Backend APIs**: Scoring engine, matchmaking, session management
3. **Frontend UI**: Leaderboards, challenge flows, collaborative sessions, galleries
4. **Real-time System**: Live collaboration, voting updates, battle progress

---

## 1. Smart Contract Extensions

### KoboCollaborativeMint.sol
Handles multi-user co-creation with on-chain attribution tracking.

**Key Features:**
- Track individual contributions (prompts, edits, refinements)
- On-chain signature verification for each contributor
- Automated royalty splitting based on contribution weight
- Merge tracking for prompt combinations

**Core Functions:**
```solidity
- createCollabSession(uint256 maxContributors, uint256 deadline)
- addContribution(uint256 sessionId, bytes32 contributionHash, uint8 contributionType)
- finalizeCollab(uint256 sessionId, string memory finalURI)
- getContributors(uint256 sessionId) → address[], uint256[] weights
```

### KoboBattleExtended.sol
Enhanced battle contract with scoring rules and challenge types.

**Battle Types:**
- **AI vs Human**: Community votes on AI-generated vs human-created
- **Remix Competition**: Best remix of a source NFT
- **Time Challenge**: Create within time limit, judged on speed + quality
- **Theme Battle**: Specific theme/prompt constraints

**Scoring System:**
- Community votes (weighted by reputation)
- Judge panel votes (for premium battles)
- Automated metrics (engagement, uniqueness score)
- Time bonuses for speed challenges

---

## 2. Backend API Architecture

### Scoring Engine API

**Endpoint**: `/api/battles/score`

**Scoring Algorithm:**
```typescript
interface BattleScore {
  communityVotes: number;      // 40% weight
  judgeVotes: number;          // 30% weight
  engagementMetrics: number;   // 20% weight (views, shares, comments)
  uniquenessScore: number;     // 10% weight (AI similarity check)
}

totalScore = (
  communityVotes * 0.4 +
  judgeVotes * 0.3 +
  engagementMetrics * 0.2 +
  uniquenessScore * 0.1
) * timeBonusMultiplier
```

**Time Bonus:**
- Submit in first 25% of time: 1.2x multiplier
- Submit in first 50% of time: 1.1x multiplier
- Submit after 75% of time: 0.95x multiplier

### Matchmaking API

**Endpoint**: `/api/battles/matchmaking`

**Matchmaking Logic:**
```typescript
interface MatchmakingCriteria {
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredBattleType: string[];
  reputationRange: [number, number];
  availableTimeSlots: TimeSlot[];
}

// Match users with similar skill levels (±1 tier)
// Balance teams for collaborative battles
// Consider timezone compatibility for live battles
```

### Collaboration Session API

**Endpoint**: `/api/collab/session`

**Session Management:**
```typescript
interface CollabSession {
  id: string;
  participants: Participant[];
  status: 'pending' | 'active' | 'voting' | 'completed';
  contributions: Contribution[];
  finalNFT?: NFTMetadata;
  attributionWeights: Record<string, number>;
}

interface Contribution {
  userId: string;
  type: 'prompt' | 'edit' | 'refinement' | 'style' | 'merge';
  data: any;
  timestamp: number;
  signature: string;
}
```

**Real-time Events:**
- `contribution:added` - New edit/prompt added
- `participant:joined` - User joins session
- `voting:started` - Voting phase begins
- `session:completed` - NFT finalized

---

## 3. Frontend UI Components

### Leaderboard Component

**Design Specifications:**

**Color Palette:**
1. Primary: Deep Purple (#6B46C1) - competitive energy
2. Accent Gold: (#F59E0B) - winner highlights
3. Accent Silver: (#94A3B8) - runner-up
4. Neutral Dark: (#1F2937)
5. Neutral Light: (#F3F4F6)

**Typography:**
- Headings: **Jost Bold** (modern, competitive feel)
- Body: **DM Sans Regular** (clean readability)

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  🏆 Global Leaderboard                  │
│  [All Time] [Weekly] [Monthly]          │
├─────────────────────────────────────────┤
│  Rank  Avatar  Name      Score  Badges  │
│  ────────────────────────────────────── │
│   1    [img]   Alice     9,847  🥇🔥⚡   │
│   2    [img]   Bob       8,234  🥈✨     │
│   3    [img]   Carol     7,891  🥉🎨     │
│   ...                                    │
└─────────────────────────────────────────┘
```

**Features:**
- Real-time rank updates with smooth animations
- Filter by category (Battles, Collabs, Mints, Overall)
- User profile quick-view on hover
- Achievement badges display
- Sparkle effects for top 3 positions

### Challenge Flow UI

**Step-by-step Flow:**

1. **Browse Challenges**
   - Grid view of active battles
   - Filter by type, entry fee, prize pool
   - Countdown timers for registration

2. **Challenge Details**
   - Theme/rules display
   - Participant list (live updates)
   - Prize breakdown visualization
   - Entry requirements check

3. **Create Submission**
   - Integrated AI generation or manual upload
   - Preview with battle theme overlay
   - Submission confirmation modal

4. **Voting Phase**
   - Gallery view of all submissions
   - Vote allocation interface (weighted voting)
   - Live vote count updates
   - Anti-cheat measures (one vote per user)

5. **Results & Rewards**
   - Winner announcement animation
   - Prize distribution breakdown
   - Replay submission gallery
   - Share results to social

### Collaborative Mint Session UI

**Real-time Collaboration Interface:**

```
┌─────────────────────────────────────────────────────┐
│  🤝 Collaborative Session: "Cyber Dreamscape"       │
│  Participants: Alice, Bob, Carol (3/5)              │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │  Live Preview   │  │  Contribution Timeline  │  │
│  │                 │  │  ─────────────────────  │  │
│  │  [NFT Preview]  │  │  Alice: Initial prompt  │  │
│  │                 │  │  Bob: Style refinement  │  │
│  │                 │  │  Carol: Color adjust    │  │
│  └─────────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  Your Turn: [Prompt Input] [Apply Edit] [Pass]     │
│  Attribution: Alice 40% | Bob 35% | Carol 25%       │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Live cursor tracking (see where others are editing)
- Contribution attribution meter (auto-calculated)
- Version history with rollback
- Chat/voice integration
- Signature collection for finalization

### Gallery Views

#### Battle Gallery
- **Layout**: Masonry grid with battle badges
- **Filters**: By battle type, date, winner status
- **Hover Effects**: Show vote count, rank, battle theme
- **Click Action**: Open battle details modal

#### Weekly Challenges Gallery
- **Layout**: Carousel of featured challenges
- **Countdown Timers**: Prominent display
- **Entry Count**: Live participant counter
- **Prize Pool**: Highlighted in gold

#### Team Mints Gallery
- **Layout**: Card grid with contributor avatars
- **Attribution Display**: Pie chart or percentage bars
- **Collaboration Type**: Badge indicator (sequential/parallel/merge)
- **Hover**: Show contribution breakdown

---

## 4. API Contract Specifications

### Battle Scoring API

**POST** `/api/battles/:battleId/score`

```typescript
Request:
{
  entryId: string;
  scores: {
    communityVotes: number;
    judgeVotes?: number;
    engagementMetrics: {
      views: number;
      shares: number;
      comments: number;
    };
  };
}

Response:
{
  entryId: string;
  totalScore: number;
  breakdown: {
    communityScore: number;
    judgeScore: number;
    engagementScore: number;
    uniquenessScore: number;
    timeBonus: number;
  };
  rank: number;
  percentile: number;
}
```

### Collaboration Session API

**POST** `/api/collab/create`

```typescript
Request:
{
  title: string;
  maxContributors: number;
  contributionDeadline: string;
  initialPrompt?: string;
  collabType: 'sequential' | 'parallel' | 'merge';
}

Response:
{
  sessionId: string;
  inviteCode: string;
  status: 'pending';
  createdAt: string;
}
```

**POST** `/api/collab/:sessionId/contribute`

```typescript
Request:
{
  contributionType: 'prompt' | 'edit' | 'refinement' | 'style' | 'merge';
  data: {
    prompt?: string;
    editParams?: object;
    styleReference?: string;
  };
  signature: string; // Wallet signature for attribution
}

Response:
{
  contributionId: string;
  attributionWeight: number; // Auto-calculated
  sessionStatus: string;
  nextContributor?: string;
}
```

**GET** `/api/collab/:sessionId/status`

```typescript
Response:
{
  sessionId: string;
  status: 'pending' | 'active' | 'voting' | 'completed';
  participants: Array<{
    userId: string;
    username: string;
    contributionCount: number;
    attributionWeight: number;
  }>;
  contributions: Contribution[];
  currentPreview?: string;
  votingDeadline?: string;
}
```

### Leaderboard API

**GET** `/api/leaderboard/:type`

```typescript
Query Params:
- type: 'global' | 'weekly' | 'monthly' | 'category'
- category?: 'battles' | 'collabs' | 'mints' | 'overall'
- limit?: number (default 100)
- offset?: number

Response:
{
  leaderboard: Array<{
    rank: number;
    userId: string;
    username: string;
    avatarUrl: string;
    score: number;
    badges: string[];
    stats: {
      battlesWon: number;
      collabsCompleted: number;
      totalMints: number;
      reputationScore: number;
    };
  }>;
  userRank?: number; // Current user's rank
  totalEntries: number;
}
```

---

## 5. Beta Module Toggle System

### Feature Flags

```typescript
interface BetaFeatures {
  battleMode: {
    enabled: boolean;
    allowedBattleTypes: string[];
    maxConcurrentBattles: number;
  };
  collaborativeMint: {
    enabled: boolean;
    maxSessionSize: number;
    allowedCollabTypes: string[];
  };
}

// Environment-based configuration
const BETA_CONFIG = {
  development: { battleMode: true, collaborativeMint: true },
  staging: { battleMode: true, collaborativeMint: true },
  production: { battleMode: false, collaborativeMint: false }, // Gradual rollout
};
```

### UI Feature Gating

```tsx
// Component wrapper for beta features
<BetaFeature feature="battleMode">
  <BattleArena />
</BetaFeature>

// Show beta badge
<Badge variant="beta">Beta</Badge>
```

---

## 6. Implementation Phases

### Phase 1: Smart Contracts (Week 1)
- [ ] Deploy KoboCollaborativeMint.sol
- [ ] Extend KoboBattleArena.sol with scoring
- [ ] Write comprehensive tests
- [ ] Audit contracts

### Phase 2: Backend APIs (Week 2)
- [ ] Implement scoring engine
- [ ] Build matchmaking service
- [ ] Create collaboration session manager
- [ ] Set up real-time WebSocket server

### Phase 3: Frontend UI (Week 3)
- [ ] Build leaderboard component
- [ ] Implement challenge flow
- [ ] Create collaborative session UI
- [ ] Design gallery views

### Phase 4: Integration & Testing (Week 4)
- [ ] Connect frontend to backend APIs
- [ ] Integrate smart contracts
- [ ] End-to-end testing
- [ ] Beta user testing

### Phase 5: Launch (Week 5)
- [ ] Deploy to testnet
- [ ] Limited beta rollout
- [ ] Monitor metrics
- [ ] Iterate based on feedback

---

## 7. Success Metrics

### Battle Mode KPIs
- Daily active battles
- Average participants per battle
- Vote participation rate
- Prize pool growth
- User retention (battle participants)

### Collaborative Mint KPIs
- Sessions created per week
- Average contributors per session
- Completion rate
- Attribution disputes (target: <1%)
- User satisfaction score

### Engagement Metrics
- Leaderboard views
- Challenge page visits
- Social shares of battle results
- Repeat participation rate
- Community growth from battles/collabs

---

## 8. Technical Considerations

### Scalability
- Use Redis for real-time session state
- PostgreSQL for persistent storage
- WebSocket for live updates
- CDN for media assets

### Security
- Rate limiting on voting endpoints
- Wallet signature verification
- Anti-sybil measures (reputation-weighted votes)
- Smart contract pausability

### Performance
- Lazy load gallery images
- Paginated leaderboards
- Cached scoring calculations
- Optimistic UI updates

---

## Next Steps
1. Review and approve design
2. Begin smart contract development
3. Set up backend infrastructure
4. Create UI component library
5. Implement feature flags
