# Gamification System Documentation

## Overview

The KoboNFT platform includes a comprehensive gamification system that rewards users for their activities with XP (experience points), levels, daily challenges, and achievements. This system encourages engagement and provides clear progression paths for users.

## Features

### 1. XP and Leveling System

**XP Rewards:**
- Mint NFT: 25 XP
- Battle Participation: 15 XP
- Battle Win: 50 XP
- Start Collaboration: 30 XP
- Complete Collaboration: 75 XP
- Vote on Proposal: 10 XP
- Trait Purchase: 20 XP
- Daily Login: 5 XP

**Level Progression:**
- Exponential XP curve: `XP_needed = 100 * (1.5 ^ (level - 1))`
- Level 1 → 2: 100 XP
- Level 2 → 3: 150 XP
- Level 3 → 4: 225 XP
- And so on...

**Automatic Level-Up:**
- Database trigger automatically updates user level when XP threshold is reached
- No manual intervention required

### 2. Daily Challenges

**Challenge Types:**
- **Daily Creator**: Mint 1 NFT today (50 XP)
- **Battle Ready**: Participate in 2 battles today (75 XP)
- **Team Player**: Start or join 1 collaboration today (60 XP)
- **Voice Your Opinion**: Vote on 3 governance proposals today (40 XP)

**Challenge Mechanics:**
- Challenges reset daily at midnight UTC
- Progress tracked automatically through user activities
- XP awarded immediately upon completion
- Challenges can be completed in any order

### 3. Achievements/Badges

**Achievement Tiers:**
- Bronze: Entry-level achievements
- Silver: Intermediate achievements
- Gold: Advanced achievements
- Platinum: Elite achievements

**Achievement Categories:**

**Minting:**
- First Creation (Bronze): Mint your first NFT - 50 XP
- Creator (Silver): Mint 10 NFTs - 100 XP
- Master Creator (Gold): Mint 50 NFTs - 500 XP

**Battles:**
- First Victory (Bronze): Win your first battle - 75 XP
- Battle Champion (Silver): Win 10 battles - 200 XP

**Collaborations:**
- Collaborator (Bronze): Complete your first collaboration - 75 XP
- Collaboration Master (Silver): Complete 10 collaborations - 200 XP

**Levels:**
- Rising Star (Bronze): Reach level 5 - 100 XP
- Veteran (Silver): Reach level 10 - 250 XP
- Legend (Gold): Reach level 25 - 1000 XP

**Streaks:**
- Week Warrior (Bronze): Maintain a 7-day streak - 150 XP
- Monthly Master (Silver): Maintain a 30-day streak - 500 XP

### 4. Streak System

**How It Works:**
- Streak increments by 1 for each consecutive day of activity
- Breaks if user doesn't log in for more than 24 hours
- Resets to 1 on first activity after a break
- Daily login bonus: 5 XP

**Streak Tracking:**
- Automatically updated on dashboard visit
- Displayed prominently in user profile
- Used for streak-based achievements

### 5. Leaderboard

**Global Leaderboard:**
- Ranks users by total XP
- Top 10 displayed by default
- Shows level, XP, and streak for each user
- Highlights current user's position

**Leaderboard Features:**
- Real-time updates
- Visual distinction for top 3 positions (gold, silver, bronze)
- Current user highlighted in purple

## Database Schema

### Tables

**user_gamification:**
- Stores user XP, level, streak data
- Automatically updates level via trigger
- Tracks last activity date for streak calculation

**daily_challenges:**
- Defines available daily challenges
- Rotates based on active_date
- Configurable XP rewards and targets

**user_challenge_progress:**
- Tracks individual user progress on challenges
- Marks completion status
- Records completion timestamp

**achievements:**
- Master list of all achievements
- Defines requirements and rewards
- Categorized by tier and type

**user_achievements:**
- Records unlocked achievements per user
- Timestamp of unlock
- Used to prevent duplicate unlocks

**xp_transactions:**
- Complete audit log of all XP gains
- Links to specific activities
- Useful for debugging and analytics

## Integration Points

### Minting (mintService.ts)
```typescript
// After successful mint
await awardXP(userId, XP_REWARDS.MINT_NFT, 'mint', tokenId, 'Minted NFT');
await updateChallengeProgress(userId, mintChallengeId, 1);
```

### Battles (battleService.ts)
```typescript
// On battle registration
await awardXP(userId, XP_REWARDS.BATTLE_PARTICIPATE, 'battle_win', battleId, 'Joined battle');

// On battle win
await awardXP(winnerId, XP_REWARDS.BATTLE_WIN, 'battle_win', battleId, 'Won battle');

// On vote cast
await awardXP(voterId, XP_REWARDS.VOTE_PROPOSAL, 'vote', battleId, 'Voted in battle');
```

### Collaborations (collabService.ts)
```typescript
// On joining collaboration
await awardXP(userId, XP_REWARDS.COLLAB_START, 'collab', sessionId, 'Joined collaboration');

// On collaboration completion
await awardXP(userId, XP_REWARDS.COLLAB_COMPLETE, 'collab', sessionId, 'Completed collaboration');
```

## User Dashboard

The dashboard (`/dashboard`) provides a comprehensive view of:

### Overview Section
- Current level and total XP
- Progress bar to next level
- Current streak with fire emoji
- XP needed for next level

### Daily Challenges Tab
- All active challenges for today
- Progress bars for each challenge
- Completion status badges
- XP rewards displayed

### Achievements Tab
- Grid of unlocked achievements
- Achievement icons and descriptions
- Tier badges (bronze/silver/gold/platinum)
- Unlock dates

### Leaderboard Tab
- Top 10 users by XP
- User rankings with medals for top 3
- Level and streak information
- Current user highlighted

### XP History Tab
- Recent XP transactions
- Activity descriptions
- Timestamps
- XP amounts with green badges

### Quick Actions
- Direct links to XP-earning activities:
  - Mint NFT
  - Join Battle
  - Collaborate
  - Vote in DAO

## API Functions

### Core Functions

**getUserGamification(userId)**
- Retrieves user's gamification profile
- Creates profile if doesn't exist
- Returns level, XP, streak data

**awardXP(userId, amount, activityType, activityId, description)**
- Awards XP to user
- Triggers automatic level-up check
- Checks for new achievements
- Returns updated stats and level-up status

**getTodaysChallenges()**
- Fetches all challenges for current date
- Returns challenge details and XP rewards

**getUserChallengeProgress(userId)**
- Gets user's progress on today's challenges
- Includes challenge details
- Shows completion status

**updateChallengeProgress(userId, challengeId, increment)**
- Updates progress on specific challenge
- Awards XP on completion
- Handles first-time and incremental updates

**checkAndUnlockAchievements(userId)**
- Scans all achievements for unlock eligibility
- Unlocks qualifying achievements
- Awards achievement XP
- Returns newly unlocked achievements

**getLeaderboard(limit)**
- Fetches top users by XP
- Configurable result limit
- Ordered by total XP descending

**updateStreak(userId)**
- Updates user's daily streak
- Awards daily login XP
- Handles streak breaks and continuations

## Best Practices

### For Developers

1. **Always Award XP After Success:**
   - Wrap XP calls in try-catch
   - Don't fail main operation if XP fails
   - Log errors for debugging

2. **Update Challenges Appropriately:**
   - Check for relevant challenges before updating
   - Use correct challenge type
   - Increment by appropriate amount

3. **Check Achievements Periodically:**
   - Call after significant milestones
   - Don't check too frequently (performance)
   - Let database handle duplicate prevention

4. **Error Handling:**
   - XP failures should not block user actions
   - Log all gamification errors
   - Provide fallback behavior

### For Users

1. **Maximize XP Gains:**
   - Complete daily challenges every day
   - Maintain login streaks
   - Participate in multiple activities

2. **Achievement Hunting:**
   - Check achievement requirements
   - Plan activities to unlock achievements
   - Focus on tier progression

3. **Leaderboard Climbing:**
   - Consistent daily activity
   - Complete high-XP activities (battles, collabs)
   - Maintain streaks for bonus XP

## Future Enhancements

### Potential Features
- Weekly/monthly challenges
- Seasonal events with bonus XP
- Achievement showcases on profiles
- XP multipliers for premium users
- Team/guild leaderboards
- Achievement trading/NFTs
- Prestige system for max-level users
- Custom challenge creation
- Social sharing of achievements
- XP-based rewards/perks

### Analytics Opportunities
- User engagement metrics
- Challenge completion rates
- Achievement unlock rates
- Leaderboard movement tracking
- XP source distribution
- Retention correlation with gamification

## Troubleshooting

### Common Issues

**XP Not Awarded:**
- Check user authentication
- Verify activity completed successfully
- Check database logs for errors
- Ensure RPC function exists

**Level Not Updating:**
- Verify trigger is active
- Check XP threshold calculation
- Manually refresh gamification data

**Challenges Not Appearing:**
- Verify challenges exist for current date
- Check challenge active_date field
- Ensure RLS policies allow read access

**Achievements Not Unlocking:**
- Verify requirement thresholds
- Check for duplicate unlocks
- Run checkAndUnlockAchievements manually
- Review achievement requirement logic

## Migration and Setup

### Initial Setup
1. Run migration: `20251125010000_create_gamification_tables.sql`
2. Verify all tables created
3. Check RLS policies active
4. Verify seed data inserted (achievements, challenges)

### Testing
1. Create test user
2. Award XP manually
3. Verify level-up trigger
4. Complete challenge
5. Unlock achievement
6. Check leaderboard

## Conclusion

The gamification system provides a robust framework for user engagement and progression. It's designed to be extensible, performant, and user-friendly while maintaining data integrity and security through proper RLS policies and error handling.
