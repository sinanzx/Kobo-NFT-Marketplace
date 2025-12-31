/**
 * Governance Service
 * 
 * @module governanceService
 * @description Manages DAO governance including proposal creation, voting, execution,
 * and delegation. Integrates with OpenZeppelin Governor contracts with timelock.
 * 
 * @example
 * ```typescript
 * import { createProposal, castVote, executeProposal } from './governanceService';
 * 
 * // Create a proposal
 * const proposal = await createProposal(
 *   'Update Platform Fee',
 *   'Reduce platform fee from 2.5% to 2%',
 *   targets,
 *   values,
 *   calldatas
 * );
 * 
 * // Vote on proposal
 * await castVote(proposalId, VoteType.For);
 * ```
 */

import { selectedChain } from '@/utils/evmConfig';
import governanceMetadata from '../../governance-metadata.json';

/**
 * Governance token contract address
 * @constant
 */
export const GOVERNANCE_TOKEN_ADDRESS = governanceMetadata.deployedContracts.KoboGovernanceToken.address as `0x${string}`;

/**
 * Governor contract address
 * @constant
 */
export const GOVERNOR_ADDRESS = governanceMetadata.deployedContracts.KoboGovernor.address as `0x${string}`;

/**
 * Timelock controller contract address
 * @constant
 */
export const TIMELOCK_ADDRESS = governanceMetadata.deployedContracts.KoboTimelock.address as `0x${string}`;

/**
 * Governance token ABI
 * @constant
 */
export const GOVERNANCE_TOKEN_ABI = governanceMetadata.deployedContracts.KoboGovernanceToken.abi;

/**
 * Governor contract ABI
 * @constant
 */
export const GOVERNOR_ABI = governanceMetadata.deployedContracts.KoboGovernor.abi;

/**
 * Timelock controller ABI
 * @constant
 */
export const TIMELOCK_ABI = governanceMetadata.deployedContracts.KoboTimelock.abi;

/**
 * Proposal state enumeration
 * @enum {number}
 */
export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7,
}

export const PROPOSAL_STATE_LABELS: Record<ProposalState, string> = {
  [ProposalState.Pending]: 'Pending',
  [ProposalState.Active]: 'Active',
  [ProposalState.Canceled]: 'Canceled',
  [ProposalState.Defeated]: 'Defeated',
  [ProposalState.Succeeded]: 'Succeeded',
  [ProposalState.Queued]: 'Queued',
  [ProposalState.Expired]: 'Expired',
  [ProposalState.Executed]: 'Executed',
};

/**
 * Vote type enumeration
 * @enum {number}
 */
export enum VoteType {
  Against = 0,
  For = 1,
  Abstain = 2,
}

export const VOTE_TYPE_LABELS: Record<VoteType, string> = {
  [VoteType.Against]: 'Against',
  [VoteType.For]: 'For',
  [VoteType.Abstain]: 'Abstain',
};

// Governance parameters
export const GOVERNANCE_PARAMS = {
  votingDelay: 7200, // 1 day in blocks
  votingPeriod: 50400, // 1 week in blocks
  proposalThreshold: BigInt('1000000000000000000000'), // 1000 KOBO
  quorumPercentage: 4, // 4%
  timelockDelay: 172800, // 2 days in seconds
};

// Types
export interface Proposal {
  id: bigint;
  proposer: string;
  targets: string[];
  values: bigint[];
  calldatas: string[];
  description: string;
  state: ProposalState;
  snapshot: bigint;
  deadline: bigint;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  eta?: bigint;
}

export interface ProposalVotes {
  againstVotes: bigint;
  forVotes: bigint;
  abstainVotes: bigint;
}

export interface VotingPower {
  balance: bigint;
  votes: bigint;
  delegatedTo: string;
}

export interface TreasuryAsset {
  type: 'ETH' | 'ERC20' | 'NFT';
  address?: string;
  balance: bigint;
  symbol?: string;
  name?: string;
  decimals?: number;
}

// Helper functions
export function getProposalStateColor(state: ProposalState): string {
  switch (state) {
    case ProposalState.Pending:
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case ProposalState.Active:
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case ProposalState.Canceled:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    case ProposalState.Defeated:
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case ProposalState.Succeeded:
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case ProposalState.Queued:
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case ProposalState.Expired:
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case ProposalState.Executed:
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  
  if (fraction === 0n) {
    return whole.toLocaleString();
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmed = fractionStr.replace(/0+$/, '').slice(0, 4);
  
  return `${whole.toLocaleString()}.${trimmed}`;
}

export function calculateQuorum(totalSupply: bigint): bigint {
  return (totalSupply * BigInt(GOVERNANCE_PARAMS.quorumPercentage)) / 100n;
}

export function calculateVotePercentage(votes: bigint, totalVotes: bigint): number {
  if (totalVotes === 0n) return 0;
  return Number((votes * 10000n) / totalVotes) / 100;
}

export function parseProposalDescription(description: string): {
  title: string;
  body: string;
} {
  const lines = description.split('\n');
  const title = lines[0] || 'Untitled Proposal';
  const body = lines.slice(1).join('\n').trim();
  
  return { title, body };
}

export function encodeProposalId(
  targets: string[],
  values: bigint[],
  calldatas: string[],
  descriptionHash: string
): bigint {
  // This should match the hashProposal function in the Governor contract
  // For now, we'll use a placeholder - in production, use ethers.js or viem to properly encode
  return BigInt(0);
}

export function isProposalActive(state: ProposalState): boolean {
  return state === ProposalState.Active;
}

export function canVote(state: ProposalState, hasVoted: boolean): boolean {
  return state === ProposalState.Active && !hasVoted;
}

export function canQueue(state: ProposalState): boolean {
  return state === ProposalState.Succeeded;
}

export function canExecute(state: ProposalState): boolean {
  return state === ProposalState.Queued;
}

export function canCancel(state: ProposalState): boolean {
  return state === ProposalState.Pending || state === ProposalState.Active;
}
