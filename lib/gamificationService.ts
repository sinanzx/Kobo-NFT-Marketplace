/**
 * Gamification Service
 * 
 * @module gamificationService
 * @description Manages user progression, XP rewards, daily challenges, achievements,
 * and leaderboards. Integrates with all major platform features (minting, battles, collabs).
 * 
 * @example
 * ```typescript
 * import { awardXP, XP_REWARDS } from './gamificationService';
 * 
 * // Award XP for minting
 * await awardXP(userId, XP_REWARDS.MINT_NFT, 'mint');
 * 
 * // Check daily challenges
 * const challenges = await getTodaysChallenges(userId);
 * ```
 */

import { supabase } from './supabaseClient';

/**
 * User gamification profile
 * @interface UserGamification
 */
export interface UserGamification {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  streak_days: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Daily challenge definition
 * @interface DailyChallenge
 */
export interface DailyChallenge {
  id: string;
  challenge_type: 'mint' | 'battle' | 'collab' | 'vote' | 'trade';
  title: string;
  description: string;
  target_count: number;
  xp_reward: number;
  active_date: string;
  created_at: string;
}

/**
 * User's progress on a specific challenge
 * @interface UserChallengeProgress
 */
export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  challenge?: DailyChallenge;
}

/**
 * Achievement definition
 * @interface Achievement
 */
export interface Achievement {
  id: string;
  achievement_key: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: 'mint_count' | 'battle_wins' | 'collab_count' | 'level' | 'streak';
  requirement_value: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: string;
}

/**
 * User's unlocked achievement
 * @interface UserAchievement
 */
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

/**
 * XP transaction record
 * @interface XPTransaction
 */
export interface XPTransaction {
  id: string;
  user_id: string;
  xp_amount: number;
  activity_type: 'mint' | 'battle_win' | 'collab' | 'challenge' | 'achievement' | 'vote' | 'gift_sent' | 'gift_unwrapped';
  activity_id: string | null;
  description: string | null;
  created_at: string;
}

/**
 * Result of awarding XP to a user
 * @interface AwardXPResult
 */
export interface AwardXPResult {
  /** User's total XP after award */
  total_xp: number;
  /** User's current level */
  current_level: number;
  /** XP needed to reach next level */
  xp_to_next_level: number;
  /** Whether user leveled up from this award */
  level_up: boolean;
  /** Achievements unlocked from this award */
  new_achievements: Achievement[];
}

/**
 * XP reward constants for different activities
 * @constant
 */
export const XP_REWARDS = {
  MINT_NFT: 25,
  BATTLE_PARTICIPATE: 15,
  GIFT_SENT: 50,
  GIFT_UNWRAPPED: 100,
  BATTLE_WIN: 50,
  COLLAB_START: 30,
  COLLAB_COMPLETE: 75,
  VOTE_PROPOSAL: 10,
  TRAIT_PURCHASE: 20,
  DAILY_LOGIN: 5,
  CHALLENGE_COMPLETE: 0, // Varies by challenge
};

/**
 * Get or create user gamification profile
 * 
 * @param {string} userId - User ID to fetch profile for
 * @returns {Promise<UserGamification | null>} User's gamification profile
 * @description Retrieves existing profile or creates a new one with default values
 */
export async function getUserGamification(userId: string): Promise<UserGamification | null> {
  try {
    const { data, error } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Create profile if doesn't exist
    if (!data) {
      const { data: newProfile, error: insertError } = await supabase
        .from('user_gamification')
        .insert({
          user_id: userId,
          total_xp: 0,
          current_level: 1,
          xp_to_next_level: 100,
          streak_days: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newProfile;
    }

    return data;
  } catch (error) {
    console.error('Error getting user gamification:', error);
    return null;
  }
}

/**
 * Award XP to user and handle level ups and achievements
 */
export async function awardXP(
  userId: string,
  xpAmount: number,
  activityType: XPTransaction['activity_type'],
  activityId?: string,
  description?: string
): Promise<AwardXPResult | null> {
  try {
    const { data, error } = await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_xp_amount: xpAmount,
      p_activity_type: activityType,
      p_activity_id: activityId || null,
      p_description: description || null,
    });

    if (error) throw error;

    return data as AwardXPResult;
  } catch (error) {
    console.error('Error awarding XP:', error);
    return null;
  }
}

/**
 * Get leaderboard (top users by XP)
 */
export async function getLeaderboard(limit: number = 10): Promise<UserGamification[]> {
  try {
    const { data, error } = await supabase
      .from('user_gamification')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Get today's daily challenges
 */
export async function getTodaysChallenges(): Promise<DailyChallenge[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('active_date', today);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting daily challenges:', error);
    return [];
  }
}

/**
 * Get user's challenge progress for today
 */
export async function getUserChallengeProgress(userId: string): Promise<UserChallengeProgress[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select(`
        *,
        challenge:daily_challenges(*)
      `)
      .eq('user_id', userId)
      .eq('challenge.active_date', today);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user challenge progress:', error);
    return [];
  }
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  increment: number = 1
): Promise<UserChallengeProgress | null> {
  try {
    // Get current progress
    const { data: existing, error: fetchError } = await supabase
      .from('user_challenge_progress')
      .select('*, challenge:daily_challenges(*)')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let newProgress = increment;
    let completed = false;

    if (existing) {
      newProgress = existing.current_progress + increment;
      const challenge = existing.challenge as DailyChallenge;
      completed = newProgress >= challenge.target_count;

      const { data, error } = await supabase
        .from('user_challenge_progress')
        .update({
          current_progress: newProgress,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', existing.id)
        .select('*, challenge:daily_challenges(*)')
        .single();

      if (error) throw error;

      // Award XP if just completed
      if (completed && !existing.completed) {
        const challenge = data.challenge as DailyChallenge;
        await awardXP(userId, challenge.xp_reward, 'challenge', challengeId, `Completed: ${challenge.title}`);
      }

      return data;
    } else {
      // Create new progress entry
      const { data: challenge, error: challengeError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      completed = newProgress >= challenge.target_count;

      const { data, error } = await supabase
        .from('user_challenge_progress')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          current_progress: newProgress,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .select('*, challenge:daily_challenges(*)')
        .single();

      if (error) throw error;

      // Award XP if completed on first try
      if (completed) {
        await awardXP(userId, challenge.xp_reward, 'challenge', challengeId, `Completed: ${challenge.title}`);
      }

      return data;
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return null;
  }
}

/**
 * Get all achievements
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('tier', { ascending: true })
      .order('requirement_value', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting achievements:', error);
    return [];
  }
}

/**
 * Get user's unlocked achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return [];
  }
}

/**
 * Check and unlock achievements for user
 */
export async function checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
  try {
    // Get user stats
    const gamification = await getUserGamification(userId);
    if (!gamification) return [];

    // Get mint count
    const { count: mintCount } = await supabase
      .from('nfts')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    // Get battle wins
    const { count: battleWins } = await supabase
      .from('battles')
      .select('*', { count: 'exact', head: true })
      .eq('winner_id', userId);

    // Get collab count
    const { count: collabCount } = await supabase
      .from('collaborations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .or(`creator_id.eq.${userId},collaborator_id.eq.${userId}`);

    // Get all achievements
    const allAchievements = await getAllAchievements();
    const userAchievements = await getUserAchievements(userId);
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirement_type) {
        case 'mint_count':
          shouldUnlock = (mintCount || 0) >= achievement.requirement_value;
          break;
        case 'battle_wins':
          shouldUnlock = (battleWins || 0) >= achievement.requirement_value;
          break;
        case 'collab_count':
          shouldUnlock = (collabCount || 0) >= achievement.requirement_value;
          break;
        case 'level':
          shouldUnlock = gamification.current_level >= achievement.requirement_value;
          break;
        case 'streak':
          shouldUnlock = gamification.streak_days >= achievement.requirement_value;
          break;
      }

      if (shouldUnlock) {
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          });

        if (!error) {
          newlyUnlocked.push(achievement);
          // Award achievement XP
          await awardXP(userId, achievement.xp_reward, 'achievement', achievement.id, `Unlocked: ${achievement.title}`);
        }
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

/**
 * Get user's XP transaction history
 */
export async function getXPHistory(userId: string, limit: number = 20): Promise<XPTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting XP history:', error);
    return [];
  }
}

/**
 * Update user streak (call on daily login)
 */
export async function updateStreak(userId: string): Promise<UserGamification | null> {
  try {
    const gamification = await getUserGamification(userId);
    if (!gamification) return null;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = gamification.last_activity_date;

    let newStreak = gamification.streak_days;

    if (!lastActivity) {
      // First activity
      newStreak = 1;
    } else {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If diffDays === 0, same day, no change
    }

    const { data, error } = await supabase
      .from('user_gamification')
      .update({
        streak_days: newStreak,
        last_activity_date: today,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Award daily login XP
    if (lastActivity !== today) {
      await awardXP(userId, XP_REWARDS.DAILY_LOGIN, 'mint', undefined, 'Daily login bonus');
    }

    return data;
  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
}

/**
 * Calculate level from XP
 */
export function calculateLevel(totalXP: number): { level: number; xpToNext: number } {
  let level = 1;
  let xpNeeded = 100;

  while (totalXP >= xpNeeded) {
    level++;
    xpNeeded = Math.floor(100 * Math.pow(1.5, level - 1));
  }

  return {
    level,
    xpToNext: xpNeeded,
  };
}

/**
 * Get XP needed for a specific level
 */
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Get progress percentage to next level
 */
export function getLevelProgress(gamification: UserGamification): number {
  const currentLevelXP = getXPForLevel(gamification.current_level);
  const nextLevelXP = gamification.xp_to_next_level;
  const xpInCurrentLevel = gamification.total_xp - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;

  return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));
}
