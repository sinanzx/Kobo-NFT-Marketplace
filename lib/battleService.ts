/**
 * Battle Service
 * 
 * @module battleService
 * @description Manages NFT battles, competitions, and tournaments. Handles battle creation,
 * participant registration, scoring, voting, and prize distribution.
 * 
 * @example
 * ```typescript
 * import { createBattle, joinBattle, submitBattleEntry } from './battleService';
 * 
 * // Create a new battle
 * const battle = await createBattle({
 *   title: 'AI vs Human Art Battle',
 *   theme: 'Cyberpunk',
 *   battleType: 'AI_VS_HUMAN',
 *   prizePool: '1000'
 * });
 * ```
 */

import { supabase } from './supabaseClient';
import { awardXP, XP_REWARDS, updateChallengeProgress, getTodaysChallenges } from './gamificationService';

/**
 * Battle scoring components
 * @interface BattleScore
 */
export interface BattleScore {
  communityVotes: number;
  judgeVotes: number;
  engagementMetrics: number;
  uniquenessScore: number;
}

/**
 * Battle entry submission
 * @interface BattleEntry
 */
export interface BattleEntry {
  id: string;
  battleId: string;
  participantId: string;
  nftId: string;
  submissionTime: string;
  scores: BattleScore;
  totalScore: number;
  rank?: number;
}

/**
 * Battle configuration and state
 * @interface Battle
 */
export interface Battle {
  id: string;
  title: string;
  description: string;
  theme: string;
  battleType: 'AI_VS_HUMAN' | 'REMIX_COMPETITION' | 'TIME_CHALLENGE' | 'THEME_BATTLE' | 'TOURNAMENT';
  status: 'upcoming' | 'registration' | 'active' | 'voting' | 'completed' | 'cancelled';
  registrationStart: string;
  registrationEnd: string;
  battleStart: string;
  battleEnd: string;
  votingEnd: string;
  maxParticipants: number;
  entryFee: string;
  prizePool: string;
  prizeDistribution: number[];
  winnerId?: string;
  participants?: string[];
}

/**
 * Calculate final battle score with weighted components
 * 
 * @param {BattleScore} scores - Individual score components
 * @param {Date} submissionTime - When entry was submitted
 * @param {Date} battleStart - Battle start time
 * @param {Date} battleEnd - Battle end time
 * @returns {number} Final weighted score with time bonus
 * 
 * @description
 * Calculates battle score using weighted components:
 * - Community votes: 40%
 * - Judge votes: 30%
 * - Engagement metrics: 20%
 * - Uniqueness score: 10%
 * 
 * Time bonuses:
 * - First 25%: 1.2x multiplier
 * - First 50%: 1.1x multiplier
 * - After 75%: 0.95x multiplier
 */
export function calculateBattleScore(scores: BattleScore, submissionTime: Date, battleStart: Date, battleEnd: Date): number {
  const weights = {
    communityVotes: 0.4,
    judgeVotes: 0.3,
    engagementMetrics: 0.2,
    uniquenessScore: 0.1,
  };

  // Calculate base score
  const baseScore = (
    scores.communityVotes * weights.communityVotes +
    scores.judgeVotes * weights.judgeVotes +
    scores.engagementMetrics * weights.engagementMetrics +
    scores.uniquenessScore * weights.uniquenessScore
  );

  // Calculate time bonus
  const battleDuration = battleEnd.getTime() - battleStart.getTime();
  const submissionDuration = submissionTime.getTime() - battleStart.getTime();
  const submissionPercentage = submissionDuration / battleDuration;

  let timeBonus = 1.0;
  if (submissionPercentage <= 0.25) {
    timeBonus = 1.2; // First 25%
  } else if (submissionPercentage <= 0.5) {
    timeBonus = 1.1; // First 50%
  } else if (submissionPercentage > 0.75) {
    timeBonus = 0.95; // After 75%
  }

  return baseScore * timeBonus;
}

/**
 * Fetch active battles
 */
export async function getActiveBattles() {
  const { data, error } = await supabase
    .from('battles')
    .select('*')
    .in('status', ['upcoming', 'registration', 'active', 'voting'])
    .order('battle_start', { ascending: true });

  if (error) throw error;
  return data as Battle[];
}

/**
 * Fetch battle by ID
 */
export async function getBattleById(battleId: string) {
  const { data, error } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single();

  if (error) throw error;
  return data as Battle;
}

/**
 * Register for a battle
 */
export async function registerForBattle(battleId: string, nftId: string, userId: string) {
  const { data, error } = await supabase
    .from('battle_entries')
    .insert({
      battle_id: battleId,
      participant_id: userId,
      nft_id: nftId,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  
  // Award XP for battle participation
  try {
    await awardXP(userId, XP_REWARDS.BATTLE_PARTICIPATE, 'battle_win', battleId, 'Joined battle');
    
    // Update battle challenge progress
    const challenges = await getTodaysChallenges();
    const battleChallenge = challenges.find(c => c.challenge_type === 'battle');
    if (battleChallenge) {
      await updateChallengeProgress(userId, battleChallenge.id, 1);
    }
  } catch (error) {
    console.error('Error awarding XP for battle registration:', error);
  }
  
  return data;
}

/**
 * Cast a vote for a battle entry
 */
export async function castVote(battleId: string, entryId: string, voterId: string) {
  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('battle_votes')
    .select('id')
    .eq('battle_id', battleId)
    .eq('voter_id', voterId)
    .single();

  if (existingVote) {
    throw new Error('Already voted in this battle');
  }

  // Get user reputation for vote weight
  const { data: userData } = await supabase
    .from('users')
    .select('reputation_score')
    .eq('id', voterId)
    .single();

  const reputation = userData?.reputation_score || 0;
  const voteWeight = calculateVoteWeight(reputation);

  // Insert vote
  const { data, error } = await supabase
    .from('battle_votes')
    .insert({
      battle_id: battleId,
      entry_id: entryId,
      voter_id: voterId,
      vote_weight: voteWeight,
    })
    .select()
    .single();

  if (error) throw error;

  // Update entry vote count
  await supabase.rpc('increment_vote_count', {
    entry_id: entryId,
    weight: voteWeight,
  });

  // Award XP for voting
  try {
    await awardXP(voterId, XP_REWARDS.VOTE_PROPOSAL, 'vote', battleId, 'Voted in battle');
    
    // Update vote challenge progress
    const challenges = await getTodaysChallenges();
    const voteChallenge = challenges.find(c => c.challenge_type === 'vote');
    if (voteChallenge) {
      await updateChallengeProgress(voterId, voteChallenge.id, 1);
    }
  } catch (error) {
    console.error('Error awarding XP for vote:', error);
  }

  return data;
}

/**
 * Calculate vote weight based on reputation
 */
function calculateVoteWeight(reputation: number): number {
  if (reputation >= 1000) return 5;
  if (reputation >= 500) return 3;
  if (reputation >= 100) return 2;
  return 1;
}

/**
 * Get battle entries with scores
 */
export async function getBattleEntries(battleId: string) {
  const { data, error } = await supabase
    .from('battle_entries')
    .select(`
      *,
      participant:users(id, username, avatar_url),
      nft:nfts(id, title, media_url, thumbnail_url)
    `)
    .eq('battle_id', battleId)
    .order('vote_count', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(
  type: 'global' | 'weekly' | 'monthly' | 'category',
  category?: 'battles' | 'collabs' | 'mints' | 'overall',
  limit = 100
) {
  let query = supabase
    .from('leaderboard_entries')
    .select(`
      *,
      user:users(id, username, avatar_url, total_battles_won, total_mints)
    `)
    .eq('leaderboard_type', type)
    .order('rank', { ascending: true })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Update engagement metrics for a battle entry
 */
export async function updateEngagementMetrics(
  entryId: string,
  metrics: { views?: number; shares?: number; comments?: number }
) {
  const { data, error } = await supabase
    .from('battle_entries')
    .update({
      engagement_score: calculateEngagementScore(metrics),
    })
    .eq('id', entryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Calculate engagement score from metrics
 */
function calculateEngagementScore(metrics: { views?: number; shares?: number; comments?: number }): number {
  const { views = 0, shares = 0, comments = 0 } = metrics;
  
  // Weighted engagement score
  return (
    views * 0.3 +
    shares * 5 +
    comments * 2
  );
}

/**
 * Finalize battle and calculate rankings
 */
export async function finalizeBattle(battleId: string) {
  // Get all entries
  const entries = await getBattleEntries(battleId);
  
  // Calculate final scores
  const battle = await getBattleById(battleId);
  const battleStart = new Date(battle.battleStart);
  const battleEnd = new Date(battle.battleEnd);

  const scoredEntries = entries.map((entry: any) => {
    const submissionTime = new Date(entry.submitted_at);
    const totalScore = calculateBattleScore(
      {
        communityVotes: entry.vote_count || 0,
        judgeVotes: 0, // TODO: Aggregate judge scores
        engagementMetrics: entry.engagement_score || 0,
        uniquenessScore: entry.uniqueness_score || 0,
      },
      submissionTime,
      battleStart,
      battleEnd
    );

    return { ...entry, totalScore };
  });

  // Sort by score
  scoredEntries.sort((a, b) => b.totalScore - a.totalScore);

  // Update ranks
  for (let i = 0; i < scoredEntries.length; i++) {
    await supabase
      .from('battle_entries')
      .update({ rank: i + 1, total_score: scoredEntries[i].totalScore })
      .eq('id', scoredEntries[i].id);
  }

  // Update battle status
  await supabase
    .from('battles')
    .update({
      status: 'completed',
      winner_id: scoredEntries[0]?.participant_id,
    })
    .eq('id', battleId);

  // Award XP to winner
  if (scoredEntries[0]?.participant_id) {
    try {
      await awardXP(
        scoredEntries[0].participant_id,
        XP_REWARDS.BATTLE_WIN,
        'battle_win',
        battleId,
        'Won battle'
      );
    } catch (error) {
      console.error('Error awarding XP to battle winner:', error);
    }
  }

  return scoredEntries;
}
