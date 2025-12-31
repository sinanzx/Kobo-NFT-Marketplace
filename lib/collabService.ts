/**
 * Collaboration Service
 * 
 * @module collabService
 * @description Manages collaborative NFT creation sessions. Supports sequential,
 * parallel, merge, and battle-collab workflows with attribution tracking and
 * royalty distribution.
 * 
 * @example
 * ```typescript
 * import { createCollabSession, addContribution } from './collabService';
 * 
 * // Create collaborative session
 * const session = await createCollabSession(
 *   'Epic Dragon Collab',
 *   'Let\'s create an epic dragon together',
 *   'sequential',
 *   5,
 *   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
 * );
 * ```
 */

import { supabase } from './supabaseClient';
import { awardXP, XP_REWARDS, updateChallengeProgress, getTodaysChallenges } from './gamificationService';

/**
 * Individual contribution to a collaboration
 * @interface Contribution
 */
export interface Contribution {
  id: string;
  collaborationId: string;
  userId: string;
  contributionType: 'prompt' | 'style' | 'refinement' | 'audio' | 'video';
  contributionData: any;
  royaltyShare: number;
  status: 'pending' | 'accepted' | 'rejected';
  joinedAt: string;
}

/**
 * Collaboration session configuration
 * @interface CollabSession
 */
export interface CollabSession {
  id: string;
  nftId?: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  collabType: 'sequential' | 'parallel' | 'merge' | 'battle-collab';
  maxContributors: number;
  contributionDeadline: string;
  votingEnabled: boolean;
  createdAt: string;
  completedAt?: string;
}

/**
 * Participant in a collaboration session
 * @interface CollabParticipant
 */
export interface CollabParticipant {
  userId: string;
  username: string;
  avatarUrl: string;
  contributionCount: number;
  attributionWeight: number;
}

/**
 * Create a new collaboration session
 * 
 * @param {string} title - Session title
 * @param {string} description - Session description
 * @param {CollabSession['collabType']} collabType - Type of collaboration workflow
 * @param {number} maxContributors - Maximum number of contributors
 * @param {Date} contributionDeadline - Deadline for contributions
 * @param {string} [initialPrompt] - Optional initial prompt/contribution
 * @returns {Promise<CollabSession>} Created collaboration session
 * 
 * @description
 * Creates a new collaborative NFT creation session. Supports multiple workflows:
 * - sequential: Contributors work one after another
 * - parallel: Contributors work simultaneously
 * - merge: Multiple contributions merged into final piece
 * - battle-collab: Competitive collaborative creation
 */
export async function createCollabSession(
  title: string,
  description: string,
  collabType: CollabSession['collabType'],
  maxContributors: number,
  contributionDeadline: Date,
  initialPrompt?: string
): Promise<CollabSession> {
  const { data, error } = await supabase
    .from('collaborations')
    .insert({
      title,
      description,
      collab_type: collabType,
      max_contributors: maxContributors,
      contribution_deadline: contributionDeadline.toISOString(),
      status: 'pending',
      voting_enabled: false,
    })
    .select()
    .single();

  if (error) throw error;

  // If initial prompt provided, add as first contribution
  if (initialPrompt && data) {
    await addContribution(data.id, {
      contributionType: 'prompt',
      data: { prompt: initialPrompt },
    });
  }

  return data as CollabSession;
}

/**
 * Add a contribution to a session
 */
export async function addContribution(
  sessionId: string,
  contribution: {
    contributionType: Contribution['contributionType'];
    data: any;
  }
) {
  const { data: session } = await supabase
    .from('collaborations')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (!session) throw new Error('Session not found');
  if (session.status === 'completed' || session.status === 'cancelled') {
    throw new Error('Session is not accepting contributions');
  }

  // Check deadline
  if (new Date(session.contribution_deadline) < new Date()) {
    throw new Error('Contribution deadline has passed');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Calculate contribution weight
  const weight = calculateContributionWeight(contribution.contributionType);

  // Insert contribution
  const { data, error } = await supabase
    .from('collaboration_contributors')
    .insert({
      collaboration_id: sessionId,
      user_id: user.id,
      contribution_type: contribution.contributionType,
      contribution_data: contribution.data,
      royalty_share: weight,
      status: 'accepted',
    })
    .select()
    .single();

  if (error) throw error;

  // Update session status to active if pending
  if (session.status === 'pending') {
    await supabase
      .from('collaborations')
      .update({ status: 'active' })
      .eq('id', sessionId);
  }

  // Award XP for collaboration contribution
  try {
    await awardXP(user.id, XP_REWARDS.COLLAB_START, 'collab', sessionId, 'Joined collaboration');
    
    // Update collab challenge progress
    const challenges = await getTodaysChallenges();
    const collabChallenge = challenges.find(c => c.challenge_type === 'collab');
    if (collabChallenge) {
      await updateChallengeProgress(user.id, collabChallenge.id, 1);
    }
  } catch (error) {
    console.error('Error awarding XP for collaboration:', error);
  }

  return data;
}

/**
 * Calculate contribution weight based on type
 */
function calculateContributionWeight(type: Contribution['contributionType']): number {
  const weights = {
    prompt: 30,
    style: 25,
    refinement: 20,
    audio: 15,
    video: 10,
  };
  return weights[type] || 10;
}

/**
 * Get collaboration session details
 */
export async function getCollabSession(sessionId: string) {
  const { data, error } = await supabase
    .from('collaborations')
    .select(`
      *,
      nft:nfts(*)
    `)
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data as CollabSession;
}

/**
 * Get all contributors for a session
 */
export async function getCollabContributors(sessionId: string): Promise<CollabParticipant[]> {
  const { data, error } = await supabase
    .from('collaboration_contributors')
    .select(`
      user_id,
      royalty_share,
      user:users(id, username, avatar_url)
    `)
    .eq('collaboration_id', sessionId)
    .eq('status', 'accepted');

  if (error) throw error;

  // Aggregate contributions by user
  const contributorMap = new Map<string, CollabParticipant>();

  data.forEach((contrib: any) => {
    const userId = contrib.user_id;
    if (contributorMap.has(userId)) {
      const existing = contributorMap.get(userId)!;
      existing.contributionCount += 1;
      existing.attributionWeight += contrib.royalty_share;
    } else {
      contributorMap.set(userId, {
        userId,
        username: contrib.user.username,
        avatarUrl: contrib.user.avatar_url,
        contributionCount: 1,
        attributionWeight: contrib.royalty_share,
      });
    }
  });

  // Normalize attribution weights to percentages
  const contributors = Array.from(contributorMap.values());
  const totalWeight = contributors.reduce((sum, c) => sum + c.attributionWeight, 0);
  
  contributors.forEach(c => {
    c.attributionWeight = totalWeight > 0 ? (c.attributionWeight / totalWeight) * 100 : 0;
  });

  return contributors;
}

/**
 * Get all contributions for a session
 */
export async function getContributions(sessionId: string) {
  const { data, error } = await supabase
    .from('collaboration_contributors')
    .select(`
      *,
      user:users(id, username, avatar_url)
    `)
    .eq('collaboration_id', sessionId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data as Contribution[];
}

/**
 * Finalize collaboration and mint NFT
 */
export async function finalizeCollab(
  sessionId: string,
  nftMetadata: {
    title: string;
    description: string;
    mediaUrl: string;
    thumbnailUrl: string;
    prompt: string;
  }
) {
  const session = await getCollabSession(sessionId);
  
  if (session.status !== 'active') {
    throw new Error('Session must be active to finalize');
  }

  const contributors = await getCollabContributors(sessionId);
  
  if (contributors.length < 2) {
    throw new Error('Need at least 2 contributors to finalize');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create NFT record
  const { data: nft, error: nftError } = await supabase
    .from('nfts')
    .insert({
      creator_id: user.id,
      owner_id: user.id,
      title: nftMetadata.title,
      description: nftMetadata.description,
      media_type: 'image', // TODO: Detect from mediaUrl
      media_url: nftMetadata.mediaUrl,
      thumbnail_url: nftMetadata.thumbnailUrl,
      prompt: nftMetadata.prompt,
      ai_model: 'collaborative',
      is_minted: false,
      metadata_json: {
        contributors: contributors.map(c => ({
          userId: c.userId,
          username: c.username,
          attribution: c.attributionWeight,
        })),
      },
    })
    .select()
    .single();

  if (nftError) throw nftError;

  // Update collaboration
  const { error: updateError } = await supabase
    .from('collaborations')
    .update({
      nft_id: nft.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (updateError) throw updateError;

  // Update user stats and award XP
  for (const contributor of contributors) {
    await supabase.rpc('increment_user_collaborations', {
      user_id: contributor.userId,
    });
    
    // Award XP for completing collaboration
    try {
      await awardXP(
        contributor.userId,
        XP_REWARDS.COLLAB_COMPLETE,
        'collab',
        sessionId,
        'Completed collaboration'
      );
    } catch (error) {
      console.error('Error awarding XP for collab completion:', error);
    }
  }

  return { nft, contributors };
}

/**
 * Get active collaboration sessions
 */
export async function getActiveSessions() {
  const { data, error } = await supabase
    .from('collaborations')
    .select('*')
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CollabSession[];
}

/**
 * Join a collaboration session
 */
export async function joinSession(sessionId: string) {
  const session = await getCollabSession(sessionId);
  
  if (session.status !== 'pending' && session.status !== 'active') {
    throw new Error('Session is not accepting new members');
  }

  const contributors = await getCollabContributors(sessionId);
  
  if (contributors.length >= session.maxContributors) {
    throw new Error('Session is full');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if already a contributor
  const isAlreadyContributor = contributors.some(c => c.userId === user.id);
  if (isAlreadyContributor) {
    throw new Error('Already a contributor');
  }

  return { success: true, sessionId };
}

/**
 * Real-time subscription to session updates
 */
export function subscribeToSession(sessionId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`collab:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'collaboration_contributors',
        filter: `collaboration_id=eq.${sessionId}`,
      },
      callback
    )
    .subscribe();
}
