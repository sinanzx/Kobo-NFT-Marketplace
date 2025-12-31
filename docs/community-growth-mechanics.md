# Community Growth & Engagement Mechanics

## Overview
This document outlines the comprehensive community engagement system for Kōbo, including gamification mechanics, leaderboards, battles, voting systems, Discord integration, collaboration modes, and DAO governance.

---

## 1. Gamification Mechanics

### 1.1 Experience Points (XP) System
```typescript
interface XPEvent {
  action: string;
  baseXP: number;
  multiplier?: number;
  category: 'creation' | 'social' | 'governance' | 'marketplace';
}

const XP_REWARDS: Record<string, XPEvent> = {
  // Creation Actions
  MINT_NFT: { action: 'mint_nft', baseXP: 100, category: 'creation' },
  AI_GENERATION: { action: 'ai_generate', baseXP: 50, category: 'creation' },
  REMIX_NFT: { action: 'remix', baseXP: 75, category: 'creation' },
  COLLABORATION: { action: 'collaborate', baseXP: 150, category: 'creation' },
  
  // Social Actions
  LIKE_NFT: { action: 'like', baseXP: 5, category: 'social' },
  COMMENT: { action: 'comment', baseXP: 10, category: 'social' },
  SHARE: { action: 'share', baseXP: 15, category: 'social' },
  GIFT_NFT: { action: 'gift', baseXP: 50, category: 'social' },
  
  // Governance Actions
  VOTE: { action: 'vote', baseXP: 25, category: 'governance' },
  PROPOSE: { action: 'propose', baseXP: 100, category: 'governance' },
  
  // Marketplace Actions
  LIST_NFT: { action: 'list', baseXP: 20, category: 'marketplace' },
  SELL_NFT: { action: 'sell', baseXP: 75, category: 'marketplace' },
  BUY_NFT: { action: 'buy', baseXP: 50, category: 'marketplace' },
  
  // Engagement Streaks
  DAILY_LOGIN: { action: 'daily_login', baseXP: 10, category: 'social' },
  WEEKLY_STREAK: { action: 'weekly_streak', baseXP: 100, multiplier: 1.5, category: 'social' },
};
```

### 1.2 Level System
```typescript
interface UserLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  perks: string[];
  badgeNFT?: string; // Soulbound token address
}

const LEVEL_TIERS: UserLevel[] = [
  {
    level: 1,
    title: 'Novice Creator',
    minXP: 0,
    maxXP: 500,
    perks: ['Basic AI models', 'Standard minting'],
  },
  {
    level: 5,
    title: 'Skilled Artist',
    minXP: 2500,
    maxXP: 5000,
    perks: ['Advanced AI models', 'Reduced gas fees (10%)', 'Custom badges'],
  },
  {
    level: 10,
    title: 'Master Creator',
    minXP: 10000,
    maxXP: 25000,
    perks: ['Premium AI models', 'Reduced gas fees (25%)', 'Early feature access', 'Governance voting weight x2'],
    badgeNFT: '0x...', // Soulbound NFT
  },
  {
    level: 20,
    title: 'Legendary Innovator',
    minXP: 50000,
    maxXP: Infinity,
    perks: ['All AI models', 'Reduced gas fees (50%)', 'Priority support', 'Governance voting weight x5', 'Revenue share'],
    badgeNFT: '0x...', // Legendary Soulbound NFT
  },
];
```

### 1.3 Quest System
```typescript
interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  startDate: Date;
  endDate: Date;
  repeatable: boolean;
}

interface QuestRequirement {
  action: string;
  count: number;
  metadata?: Record<string, any>;
}

interface QuestReward {
  type: 'xp' | 'nft' | 'token' | 'badge' | 'discount';
  amount?: number;
  assetId?: string;
}

// Example Quests
const SAMPLE_QUESTS: Quest[] = [
  {
    id: 'daily_creator',
    title: 'Daily Creator',
    description: 'Mint 3 NFTs today',
    type: 'daily',
    requirements: [{ action: 'MINT_NFT', count: 3 }],
    rewards: [{ type: 'xp', amount: 200 }, { type: 'badge', assetId: 'daily_creator_badge' }],
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    repeatable: true,
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Like 10 NFTs and comment on 5',
    type: 'weekly',
    requirements: [
      { action: 'LIKE_NFT', count: 10 },
      { action: 'COMMENT', count: 5 },
    ],
    rewards: [{ type: 'xp', amount: 500 }],
    startDate: new Date(),
    endDate: new Date(Date.now() + 604800000),
    repeatable: true,
  },
  {
    id: 'collaboration_master',
    title: 'Collaboration Master',
    description: 'Complete 2 collaborative NFT projects',
    type: 'monthly',
    requirements: [{ action: 'COLLABORATION', count: 2 }],
    rewards: [{ type: 'xp', amount: 1000 }, { type: 'nft', assetId: 'collab_master_nft' }],
    startDate: new Date(),
    endDate: new Date(Date.now() + 2592000000),
    repeatable: true,
  },
];
```

---

## 2. Leaderboard System

### 2.1 Ranking Algorithms
```typescript
interface LeaderboardEntry {
  userId: string;
  walletAddress: string;
  username: string;
  score: number;
  rank: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  stats: UserStats;
}

interface UserStats {
  totalXP: number;
  nftsMinted: number;
  nftsSold: number;
  collaborations: number;
  battlesWon: number;
  votingPower: number;
  socialEngagement: number;
}

// Composite Score Algorithm
function calculateLeaderboardScore(stats: UserStats): number {
  const weights = {
    xp: 1.0,
    mints: 10,
    sales: 15,
    collaborations: 25,
    battles: 20,
    voting: 5,
    social: 2,
  };
  
  return (
    stats.totalXP * weights.xp +
    stats.nftsMinted * weights.mints +
    stats.nftsSold * weights.sales +
    stats.collaborations * weights.collaborations +
    stats.battlesWon * weights.battles +
    stats.votingPower * weights.voting +
    stats.socialEngagement * weights.social
  );
}

// Tier Assignment
function assignTier(rank: number, totalUsers: number): string {
  const percentile = (rank / totalUsers) * 100;
  
  if (percentile <= 1) return 'diamond';
  if (percentile <= 5) return 'platinum';
  if (percentile <= 15) return 'gold';
  if (percentile <= 40) return 'silver';
  return 'bronze';
}
```

### 2.2 Leaderboard Categories
```typescript
enum LeaderboardType {
  OVERALL = 'overall',           // Composite score
  CREATORS = 'creators',         // Based on mints & quality
  COLLECTORS = 'collectors',     // Based on purchases & collection value
  SOCIAL = 'social',            // Based on engagement metrics
  BATTLES = 'battles',          // Based on battle wins
  GOVERNANCE = 'governance',    // Based on voting participation
  COLLABORATORS = 'collaborators', // Based on collaboration count
}

interface LeaderboardConfig {
  type: LeaderboardType;
  resetPeriod: 'daily' | 'weekly' | 'monthly' | 'season' | 'never';
  topRewards: LeaderboardReward[];
}

interface LeaderboardReward {
  rankRange: [number, number]; // e.g., [1, 3] for top 3
  rewards: QuestReward[];
}
```

### 2.3 Seasonal Resets
```typescript
interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  theme?: string;
  specialRewards: QuestReward[];
  leaderboardSnapshot: LeaderboardEntry[];
}

// Example: Quarterly seasons with themed rewards
const SEASONS: Season[] = [
  {
    id: 'season_1_genesis',
    name: 'Genesis Season',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    theme: 'Origins',
    specialRewards: [
      { type: 'nft', assetId: 'genesis_champion_nft' },
      { type: 'token', amount: 10000 },
    ],
    leaderboardSnapshot: [],
  },
];
```

---

## 3. Battle System

### 3.1 Battle Mechanics
```typescript
interface Battle {
  id: string;
  type: 'pvp' | 'tournament' | 'community_vote';
  participants: BattleParticipant[];
  nfts: string[]; // NFT token IDs
  startTime: Date;
  endTime: Date;
  votingEnabled: boolean;
  status: 'pending' | 'active' | 'voting' | 'completed';
  winner?: string;
  rewards: BattleReward[];
}

interface BattleParticipant {
  userId: string;
  walletAddress: string;
  nftId: string;
  votes?: number;
  battleStats?: {
    rarity: number;
    communityScore: number;
    aiQualityScore: number;
  };
}

interface BattleReward {
  position: number;
  xp: number;
  tokens?: number;
  nft?: string;
  badge?: string;
}
```

### 3.2 Battle Types

#### PvP Battles
```typescript
interface PvPBattle extends Battle {
  type: 'pvp';
  entryFee?: number; // Optional token stake
  winCondition: 'votes' | 'rarity' | 'hybrid';
}

// Hybrid scoring for PvP
function calculateBattleScore(participant: BattleParticipant): number {
  const { rarity, communityScore, aiQualityScore } = participant.battleStats!;
  
  return (
    rarity * 0.3 +
    communityScore * 0.4 +
    aiQualityScore * 0.3
  );
}
```

#### Tournament Brackets
```typescript
interface Tournament extends Battle {
  type: 'tournament';
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  rounds: TournamentRound[];
  maxParticipants: number;
  prizePool: number;
}

interface TournamentRound {
  roundNumber: number;
  matches: Battle[];
  winners: string[];
}
```

#### Community Vote Battles
```typescript
interface CommunityVoteBattle extends Battle {
  type: 'community_vote';
  votingPeriod: number; // Duration in seconds
  voteWeight: 'equal' | 'token_weighted' | 'level_weighted';
  minVotes: number; // Minimum votes to be valid
}
```

### 3.3 Battle Smart Contract
```solidity
// contracts/src/KoboBattleArena.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract KoboBattleArena is Ownable, ReentrancyGuard {
    struct Battle {
        uint256 id;
        address[] participants;
        uint256[] nftIds;
        uint256 startTime;
        uint256 endTime;
        uint256 entryFee;
        bool completed;
        address winner;
        mapping(address => uint256) votes;
        uint256 totalVotes;
    }
    
    mapping(uint256 => Battle) public battles;
    uint256 public battleCount;
    
    IERC721 public koboNFT;
    
    event BattleCreated(uint256 indexed battleId, address[] participants, uint256 startTime);
    event VoteCast(uint256 indexed battleId, address voter, address candidate);
    event BattleCompleted(uint256 indexed battleId, address winner, uint256 reward);
    
    constructor(address _koboNFT) {
        koboNFT = IERC721(_koboNFT);
    }
    
    function createBattle(
        address[] calldata _participants,
        uint256[] calldata _nftIds,
        uint256 _duration,
        uint256 _entryFee
    ) external payable nonReentrant {
        require(_participants.length >= 2, "Need at least 2 participants");
        require(_participants.length == _nftIds.length, "Mismatched arrays");
        require(msg.value >= _entryFee * _participants.length, "Insufficient entry fee");
        
        battleCount++;
        Battle storage battle = battles[battleCount];
        battle.id = battleCount;
        battle.participants = _participants;
        battle.nftIds = _nftIds;
        battle.startTime = block.timestamp;
        battle.endTime = block.timestamp + _duration;
        battle.entryFee = _entryFee;
        
        emit BattleCreated(battleCount, _participants, block.timestamp);
    }
    
    function vote(uint256 _battleId, address _candidate) external {
        Battle storage battle = battles[_battleId];
        require(block.timestamp >= battle.startTime && block.timestamp <= battle.endTime, "Voting not active");
        require(battle.votes[msg.sender] == 0, "Already voted");
        
        bool validCandidate = false;
        for (uint i = 0; i < battle.participants.length; i++) {
            if (battle.participants[i] == _candidate) {
                validCandidate = true;
                break;
            }
        }
        require(validCandidate, "Invalid candidate");
        
        battle.votes[_candidate]++;
        battle.totalVotes++;
        
        emit VoteCast(_battleId, msg.sender, _candidate);
    }
    
    function completeBattle(uint256 _battleId) external nonReentrant {
        Battle storage battle = battles[_battleId];
        require(block.timestamp > battle.endTime, "Battle still active");
        require(!battle.completed, "Already completed");
        
        // Determine winner (most votes)
        address winner;
        uint256 maxVotes = 0;
        for (uint i = 0; i < battle.participants.length; i++) {
            if (battle.votes[battle.participants[i]] > maxVotes) {
                maxVotes = battle.votes[battle.participants[i]];
                winner = battle.participants[i];
            }
        }
        
        battle.winner = winner;
        battle.completed = true;
        
        // Transfer prize pool to winner
        uint256 prizePool = battle.entryFee * battle.participants.length;
        (bool success, ) = winner.call{value: prizePool}("");
        require(success, "Transfer failed");
        
        emit BattleCompleted(_battleId, winner, prizePool);
    }
}
```

---

## 4. Discord Integration

### 4.1 Discord Bot Architecture
```typescript
// Discord Bot Features
interface DiscordBotFeatures {
  verification: {
    walletConnect: boolean;
    nftOwnership: boolean;
    roleAssignment: boolean;
  };
  notifications: {
    newMints: boolean;
    battleUpdates: boolean;
    governanceProposals: boolean;
    leaderboardChanges: boolean;
  };
  commands: {
    profile: boolean;
    leaderboard: boolean;
    battles: boolean;
    quests: boolean;
    marketplace: boolean;
  };
  social: {
    nftShowcase: boolean;
    communityFeed: boolean;
    reactions: boolean;
  };
}
```

### 4.2 Bot Commands
```typescript
// Example Discord.js Bot Implementation
import { Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';
import { createClient } from '@supabase/supabase-js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Command: /profile [wallet]
const profileCommand = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View user profile and stats')
  .addStringOption(option =>
    option.setName('wallet')
      .setDescription('Wallet address')
      .setRequired(false)
  );

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'profile') {
    const wallet = interaction.options.getString('wallet') || interaction.user.id;
    
    // Fetch user data from Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', wallet)
      .single();
    
    if (!profile) {
      await interaction.reply('Profile not found. Connect your wallet first!');
      return;
    }
    
    const embed = {
      title: `${profile.username}'s Profile`,
      fields: [
        { name: 'Level', value: profile.level.toString(), inline: true },
        { name: 'XP', value: profile.total_xp.toString(), inline: true },
        { name: 'NFTs Minted', value: profile.nfts_minted.toString(), inline: true },
        { name: 'Battles Won', value: profile.battles_won.toString(), inline: true },
        { name: 'Rank', value: `#${profile.leaderboard_rank}`, inline: true },
      ],
      color: 0x00ff00,
    };
    
    await interaction.reply({ embeds: [embed] });
  }
});

// Command: /leaderboard [type]
const leaderboardCommand = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View leaderboards')
  .addStringOption(option =>
    option.setName('type')
      .setDescription('Leaderboard type')
      .setRequired(false)
      .addChoices(
        { name: 'Overall', value: 'overall' },
        { name: 'Creators', value: 'creators' },
        { name: 'Battles', value: 'battles' },
      )
  );

// Command: /battle [action]
const battleCommand = new SlashCommandBuilder()
  .setName('battle')
  .setDescription('Battle commands')
  .addSubcommand(subcommand =>
    subcommand
      .setName('create')
      .setDescription('Create a new battle')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('join')
      .setDescription('Join an active battle')
      .addStringOption(option =>
        option.setName('battle_id')
          .setDescription('Battle ID')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('vote')
      .setDescription('Vote in a battle')
      .addStringOption(option =>
        option.setName('battle_id')
          .setDescription('Battle ID')
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('nft_id')
          .setDescription('NFT to vote for')
          .setRequired(true)
      )
  );
```

### 4.3 Role Management
```typescript
interface DiscordRoleConfig {
  roleName: string;
  roleId: string;
  requirements: {
    minLevel?: number;
    minXP?: number;
    nftOwnership?: string[]; // NFT contract addresses
    leaderboardRank?: number;
    achievements?: string[];
  };
}

const DISCORD_ROLES: DiscordRoleConfig[] = [
  {
    roleName: 'Verified Creator',
    roleId: '123456789',
    requirements: { nftOwnership: ['0x...'] },
  },
  {
    roleName: 'Elite Creator',
    roleId: '987654321',
    requirements: { minLevel: 10, minXP: 10000 },
  },
  {
    roleName: 'Top 100',
    roleId: '555555555',
    requirements: { leaderboardRank: 100 },
  },
  {
    roleName: 'Battle Champion',
    roleId: '777777777',
    requirements: { achievements: ['battle_champion_s1'] },
  },
];
```

---

## 5. Collaboration & Challenge Modes

### 5.1 Collaboration System
```typescript
interface Collaboration {
  id: string;
  title: string;
  description: string;
  creators: CollaborationMember[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  maxMembers: number;
  deadline?: Date;
  nftResult?: string; // Final collaborative NFT
  revenueShare: RevenueShare[];
}

interface CollaborationMember {
  userId: string;
  walletAddress: string;
  role: 'initiator' | 'contributor';
  contribution: {
    type: 'prompt' | 'art' | 'music' | 'code' | 'concept';
    weight: number; // 0-100, for revenue share
  };
  approved: boolean;
}

interface RevenueShare {
  walletAddress: string;
  percentage: number;
}
```

### 5.2 Challenge Modes
```typescript
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'theme' | 'technique' | 'collaboration' | 'speed';
  startDate: Date;
  endDate: Date;
  rules: ChallengeRule[];
  prizes: ChallengePrize[];
  participants: string[];
  submissions: ChallengeSubmission[];
  judges?: string[]; // Wallet addresses of judges
  votingEnabled: boolean;
}

interface ChallengeRule {
  rule: string;
  required: boolean;
}

interface ChallengePrize {
  position: number;
  reward: QuestReward[];
}

interface ChallengeSubmission {
  userId: string;
  nftId: string;
  submittedAt: Date;
  votes: number;
  judgeScores?: number[];
  finalScore?: number;
}

// Example Challenges
const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: 'weekly_theme_cyberpunk',
    title: 'Cyberpunk Dreams',
    description: 'Create NFTs with a cyberpunk aesthetic',
    type: 'theme',
    startDate: new Date(),
    endDate: new Date(Date.now() + 604800000),
    rules: [
      { rule: 'Must use AI generation', required: true },
      { rule: 'Cyberpunk theme required', required: true },
      { rule: 'Original prompts only', required: true },
    ],
    prizes: [
      { position: 1, reward: [{ type: 'token', amount: 5000 }, { type: 'nft', assetId: 'champion_badge' }] },
      { position: 2, reward: [{ type: 'token', amount: 3000 }] },
      { position: 3, reward: [{ type: 'token', amount: 1000 }] },
    ],
    participants: [],
    submissions: [],
    votingEnabled: true,
  },
  {
    id: 'speed_challenge_60min',
    title: '60-Minute Sprint',
    description: 'Create and mint an NFT in under 60 minutes',
    type: 'speed',
    startDate: new Date(),
    endDate: new Date(Date.now() + 3600000),
    rules: [
      { rule: 'Must complete in 60 minutes', required: true },
      { rule: 'Timestamp verified on-chain', required: true },
    ],
    prizes: [
      { position: 1, reward: [{ type: 'xp', amount: 1000 }, { type: 'badge', assetId: 'speed_demon' }] },
    ],
    participants: [],
    submissions: [],
    votingEnabled: false,
  },
];
```

---

## 6. DAO Governance

### 6.1 Governance Token & Voting Power
```solidity
// contracts/src/KoboGovernance.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract KoboGovernance is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("Kobo DAO")
        GovernorSettings(
            1, /* 1 block voting delay */
            50400, /* 1 week voting period */
            1000e18 /* 1000 tokens proposal threshold */
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) /* 4% quorum */
        GovernorTimelockControl(_timelock)
    {}

    // Override required functions
    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### 6.2 Governance Proposals
```typescript
interface GovernanceProposal {
  id: string;
  proposer: string;
  title: string;
  description: string;
  category: 'feature' | 'treasury' | 'parameter' | 'partnership' | 'emergency';
  targets: string[]; // Contract addresses
  values: number[]; // ETH values
  calldatas: string[]; // Encoded function calls
  startBlock: number;
  endBlock: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  status: 'pending' | 'active' | 'succeeded' | 'defeated' | 'queued' | 'executed' | 'cancelled';
  quorumReached: boolean;
  executed: boolean;
}

// Example Proposal Categories
const PROPOSAL_TEMPLATES = {
  FEATURE_REQUEST: {
    category: 'feature',
    minVotingPower: 1000,
    quorum: 0.04, // 4%
    votingPeriod: 50400, // ~1 week in blocks
  },
  TREASURY_ALLOCATION: {
    category: 'treasury',
    minVotingPower: 5000,
    quorum: 0.10, // 10%
    votingPeriod: 100800, // ~2 weeks
  },
  EMERGENCY_ACTION: {
    category: 'emergency',
    minVotingPower: 10000,
    quorum: 0.20, // 20%
    votingPeriod: 7200, // ~1 day
  },
};
```

### 6.3 Voting Weight Calculation
```typescript
interface VotingPower {
  baseTokens: number;
  nftMultiplier: number;
  levelMultiplier: number;
  stakingBonus: number;
  totalPower: number;
}

function calculateVotingPower(
  user: {
    tokenBalance: number;
    nftsOwned: number;
    level: number;
    stakedTokens: number;
  }
): VotingPower {
  // Base voting power from tokens (1 token = 1 vote)
  const baseTokens = user.tokenBalance;
  
  // NFT ownership multiplier (up to 2x)
  const nftMultiplier = Math.min(1 + (user.nftsOwned * 0.01), 2);
  
  // Level multiplier (from level tiers)
  const levelMultiplier = user.level >= 20 ? 5 : user.level >= 10 ? 2 : 1;
  
  // Staking bonus (1.5x for staked tokens)
  const stakingBonus = user.stakedTokens * 0.5;
  
  const totalPower = (baseTokens * nftMultiplier * levelMultiplier) + stakingBonus;
  
  return {
    baseTokens,
    nftMultiplier,
    levelMultiplier,
    stakingBonus,
    totalPower,
  };
}
```

---

## 7. Event Calendar System

### 7.1 Event Types
```typescript
interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'contest' | 'ama' | 'workshop' | 'launch' | 'collaboration' | 'governance';
  startDate: Date;
  endDate: Date;
  recurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  rewards?: QuestReward[];
  participants: string[];
  maxParticipants?: number;
  registrationRequired: boolean;
  discordEventId?: string;
  twitterSpaceId?: string;
}
```

### 7.2 Sample Event Calendar
```typescript
const MONTHLY_EVENT_CALENDAR: CommunityEvent[] = [
  // Week 1: Theme Challenge
  {
    id: 'week1_theme_challenge',
    title: 'Weekly Theme Challenge',
    description: 'Create NFTs based on the weekly theme',
    type: 'contest',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-07'),
    recurring: true,
    recurrencePattern: 'weekly',
    rewards: [
      { type: 'token', amount: 5000 },
      { type: 'xp', amount: 1000 },
    ],
    participants: [],
    registrationRequired: false,
  },
  
  // Week 2: AMA with Team
  {
    id: 'week2_ama',
    title: 'Monthly AMA with Kōbo Team',
    description: 'Ask us anything about the platform and roadmap',
    type: 'ama',
    startDate: new Date('2024-12-08T18:00:00Z'),
    endDate: new Date('2024-12-08T19:30:00Z'),
    recurring: true,
    recurrencePattern: 'monthly',
    participants: [],
    maxParticipants: 500,
    registrationRequired: true,
    discordEventId: 'discord_event_123',
    twitterSpaceId: 'twitter_space_456',
  },
  
  // Week 3: Collaboration Workshop
  {
    id: 'week3_collab_workshop',
    title: 'Collaboration Workshop',
    description: 'Learn advanced collaboration techniques',
    type: 'workshop',
    startDate: new Date('2024-12-15T16:00:00Z'),
    endDate: new Date('2024-12-15T18:00:00Z'),
    recurring: true,
    recurrencePattern: 'monthly',
    participants: [],
    maxParticipants: 100,
    registrationRequired: true,
    rewards: [{ type: 'badge', assetId: 'workshop_attendee' }],
  },
  
  // Week 4: Battle Tournament
  {
    id: 'week4_tournament',
    title: 'Monthly Battle Tournament',
    description: 'Compete for the championship title',
    type: 'contest',
    startDate: new Date('2024-12-22'),
    endDate: new Date('2024-12-28'),
    recurring: true,
    recurrencePattern: 'monthly',
    rewards: [
      { type: 'token', amount: 10000 },
      { type: 'nft', assetId: 'tournament_champion' },
    ],
    participants: [],
    maxParticipants: 64,
    registrationRequired: true,
  },
  
  // Monthly Governance Vote
  {
    id: 'monthly_governance',
    title: 'Monthly Governance Proposal',
    description: 'Vote on platform improvements and treasury allocation',
    type: 'governance',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    recurring: true,
    recurrencePattern: 'monthly',
    participants: [],
    registrationRequired: false,
  },
];
```

### 7.3 Automated Event Notifications
```typescript
interface NotificationConfig {
  eventId: string;
  channels: ('discord' | 'email' | 'push' | 'twitter')[];
  timing: {
    advance: number; // Hours before event
    reminder: number; // Hours before event
    live: boolean; // Notify when event starts
    results: boolean; // Notify when results are available
  };
}

// Notification service integration
async function sendEventNotification(
  event: CommunityEvent,
  type: 'advance' | 'reminder' | 'live' | 'results'
) {
  const message = formatEventMessage(event, type);
  
  // Discord notification
  await sendDiscordNotification(message);
  
  // Email notification
  await sendEmailNotification(event.participants, message);
  
  // Push notification
  await sendPushNotification(event.participants, message);
  
  // Twitter announcement
  if (type === 'live' || type === 'results') {
    await postToTwitter(message);
  }
}
```

---

## 8. Analytics & Tracking

### 8.1 Community Metrics
```typescript
interface CommunityMetrics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  engagement: {
    avgSessionDuration: number;
    avgActionsPerUser: number;
    retentionRate: number;
  };
  content: {
    totalNFTsMinted: number;
    dailyMints: number;
    collaborativeNFTs: number;
  };
  social: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  };
  governance: {
    totalProposals: number;
    avgVoterTurnout: number;
    activeVoters: number;
  };
  battles: {
    totalBattles: number;
    activeBattles: number;
    avgParticipation: number;
  };
}
```

### 8.2 Growth Tracking
```typescript
interface GrowthMetrics {
  userGrowth: {
    newUsers: number;
    churnRate: number;
    growthRate: number;
  };
  revenueMetrics: {
    totalVolume: number;
    platformFees: number;
    creatorEarnings: number;
  };
  viralityMetrics: {
    referralRate: number;
    shareRate: number;
    inviteConversionRate: number;
  };
}
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Month 1-2)
- ✅ XP and leveling system
- ✅ Basic leaderboards (overall, creators)
- ✅ Quest system (daily, weekly)
- ✅ Discord bot (basic commands)

### Phase 2: Engagement (Month 3-4)
- 🔄 Battle system (PvP, voting)
- 🔄 Collaboration features
- 🔄 Challenge modes
- 🔄 Advanced Discord integration

### Phase 3: Governance (Month 5-6)
- 📋 DAO governance contracts
- 📋 Proposal system
- 📋 Voting mechanisms
- 📋 Treasury management

### Phase 4: Scale (Month 7+)
- 📋 Tournament system
- 📋 Cross-platform integration
- 📋 Advanced analytics
- 📋 Mobile app integration

---

## 10. Success Metrics

### Key Performance Indicators (KPIs)
```typescript
const SUCCESS_METRICS = {
  engagement: {
    dailyActiveUsers: { target: 1000, current: 0 },
    avgSessionTime: { target: 15, current: 0 }, // minutes
    questCompletionRate: { target: 0.60, current: 0 },
  },
  content: {
    dailyMints: { target: 500, current: 0 },
    collaborationRate: { target: 0.20, current: 0 },
    qualityScore: { target: 8.0, current: 0 }, // out of 10
  },
  community: {
    discordMembers: { target: 10000, current: 0 },
    governanceParticipation: { target: 0.15, current: 0 },
    retentionRate: { target: 0.70, current: 0 },
  },
  revenue: {
    monthlyVolume: { target: 100000, current: 0 }, // USD
    creatorEarnings: { target: 70000, current: 0 }, // USD
    platformFees: { target: 30000, current: 0 }, // USD
  },
};
```

---

This comprehensive community growth system provides the foundation for sustainable engagement, viral growth, and long-term platform success through gamification, social features, and decentralized governance.
