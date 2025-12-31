import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ProposalCard } from '@/components/dao/ProposalCard';
import { CreateProposalModal } from '@/components/dao/CreateProposalModal';
import {
  GOVERNOR_ABI,
  GOVERNOR_ADDRESS,
  GOVERNANCE_TOKEN_ABI,
  GOVERNANCE_TOKEN_ADDRESS,
  TIMELOCK_ADDRESS,
  Proposal,
  ProposalState,
  formatTokenAmount,
  calculateQuorum,
} from '@/lib/governanceService';
import { ChevronRight } from 'lucide-react';

export default function DAO() {
  const { address } = useAccount();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch user's token balance
  const { data: balance } = useReadContract({
    address: GOVERNANCE_TOKEN_ADDRESS,
    abi: GOVERNANCE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  }) as { data: bigint | undefined };

  // Fetch user's voting power
  const { data: votingPower } = useReadContract({
    address: GOVERNANCE_TOKEN_ADDRESS,
    abi: GOVERNANCE_TOKEN_ABI,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
  }) as { data: bigint | undefined };

  // Fetch delegation
  const { data: delegatedTo } = useReadContract({
    address: GOVERNANCE_TOKEN_ADDRESS,
    abi: GOVERNANCE_TOKEN_ABI,
    functionName: 'delegates',
    args: address ? [address] : undefined,
  }) as { data: string | undefined };

  // Fetch total supply for quorum calculation
  const { data: totalSupply } = useReadContract({
    address: GOVERNANCE_TOKEN_ADDRESS,
    abi: GOVERNANCE_TOKEN_ABI,
    functionName: 'totalSupply',
  }) as { data: bigint | undefined };

  const quorum = totalSupply ? calculateQuorum(totalSupply) : 0n;

  // Mock proposals for now - in production, fetch from events or subgraph
  const mockProposals: Proposal[] = [
    {
      id: 1n,
      proposer: '0x1234567890123456789012345678901234567890',
      targets: [],
      values: [],
      calldatas: [],
      description: 'Upgrade NFT minting contract to v2.0 with enhanced metadata support',
      state: ProposalState.Active,
      snapshot: 1000n,
      deadline: 2000n,
      forVotes: 125000n * 10n ** 18n,
      againstVotes: 45000n * 10n ** 18n,
      abstainVotes: 10000n * 10n ** 18n,
      eta: 0n,
    },
    {
      id: 2n,
      proposer: '0x2234567890123456789012345678901234567890',
      targets: [],
      values: [],
      calldatas: [],
      description: 'Allocate 50,000 KOBO tokens for community rewards program',
      state: ProposalState.Active,
      snapshot: 1100n,
      deadline: 2100n,
      forVotes: 98000n * 10n ** 18n,
      againstVotes: 72000n * 10n ** 18n,
      abstainVotes: 5000n * 10n ** 18n,
      eta: 0n,
    },
    {
      id: 3n,
      proposer: '0x3234567890123456789012345678901234567890',
      targets: [],
      values: [],
      calldatas: [],
      description: 'Implement new trait marketplace fee structure (2.5% → 2.0%)',
      state: ProposalState.Succeeded,
      snapshot: 800n,
      deadline: 1800n,
      forVotes: 200000n * 10n ** 18n,
      againstVotes: 30000n * 10n ** 18n,
      abstainVotes: 8000n * 10n ** 18n,
      eta: 0n,
    },
  ];

  const activeProposals = mockProposals.filter(p => p.state === ProposalState.Active);

  const isDelegated = delegatedTo && delegatedTo !== '0x0000000000000000000000000000000000000000';
  const delegationStatus = isDelegated 
    ? (delegatedTo === address ? 'SELF_DELEGATED' : 'DELEGATED_OUT')
    : 'NOT_DELEGATED';

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      {/* Telemetry Header (Top Strip) */}
      <div className="bg-black border-b-2 border-[#ea5c2a]">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-6">
            {/* TREASURY_VAL */}
            <div>
              <p className="text-gray-500 font-mono text-xs tracking-wider mb-1">
                TREASURY_VAL
              </p>
              <p className="text-green-500 font-mono text-2xl font-bold">
                $4,205,000
              </p>
            </div>

            {/* ACTIVE_DIRECTIVES */}
            <div>
              <p className="text-gray-500 font-mono text-xs tracking-wider mb-1">
                ACTIVE_DIRECTIVES
              </p>
              <p className="text-[#ea5c2a] font-mono text-2xl font-bold">
                {activeProposals.length.toString().padStart(2, '0')}
              </p>
            </div>

            {/* TOTAL_VOTERS */}
            <div>
              <p className="text-gray-500 font-mono text-xs tracking-wider mb-1">
                TOTAL_VOTERS
              </p>
              <p className="text-white font-mono text-2xl font-bold">
                1,420
              </p>
            </div>

            {/* SYSTEM_STATUS */}
            <div>
              <p className="text-gray-500 font-mono text-xs tracking-wider mb-1">
                SYSTEM_STATUS
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-green-500 font-mono text-2xl font-bold">
                  NOMINAL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (Proposal Feed) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-[#ea5c2a] font-mono text-lg tracking-wider">
                // ACTIVE_DIRECTIVES
              </h2>
            </div>

            {/* Proposal Cards */}
            {!address ? (
              <div className="bg-[#252525] border border-gray-800 p-12 text-center">
                <p className="text-gray-400 font-mono text-sm mb-4">
                  AUTHENTICATION_REQUIRED
                </p>
                <p className="text-gray-500 font-mono text-xs">
                  Connect wallet to access governance protocols
                </p>
              </div>
            ) : activeProposals.length === 0 ? (
              <div className="bg-[#252525] border border-gray-800 p-12 text-center">
                <p className="text-gray-400 font-mono text-sm mb-4">
                  NO_ACTIVE_DIRECTIVES
                </p>
                <p className="text-gray-500 font-mono text-xs">
                  All proposals currently in standby mode
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProposals.map((proposal) => {
                  const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
                  const forPercentage = totalVotes > 0n 
                    ? Number((proposal.forVotes * 100n) / totalVotes) 
                    : 0;
                  const againstPercentage = totalVotes > 0n 
                    ? Number((proposal.againstVotes * 100n) / totalVotes) 
                    : 0;

                  // Determine status bar color
                  const statusColor = proposal.state === ProposalState.Succeeded 
                    ? 'bg-green-500' 
                    : proposal.state === ProposalState.Active 
                    ? 'bg-[#ea5c2a]' 
                    : 'bg-red-500';

                  return (
                    <div
                      key={proposal.id.toString()}
                      className="bg-[#252525] border border-gray-800 flex"
                    >
                      {/* Status Bar (Left Side) */}
                      <div className={`w-1 ${statusColor}`} />

                      {/* Content */}
                      <div className="flex-1 p-6">
                        {/* Proposal Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <p className="text-gray-500 font-mono text-xs mb-2">
                              DIRECTIVE_#{proposal.id.toString().padStart(3, '0')}
                            </p>
                            <h3 className="text-white font-mono text-sm leading-relaxed">
                              {proposal.description}
                            </h3>
                          </div>
                          <button className="ml-4 px-4 py-2 border border-[#ea5c2a] text-[#ea5c2a] font-mono text-xs tracking-wider hover:bg-[#ea5c2a] hover:text-black transition-colors">
                            REVIEW_DATA
                          </button>
                        </div>

                        {/* Segmented Progress Bars */}
                        <div className="space-y-3">
                          {/* FOR Votes */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-500 font-mono text-xs">FOR</span>
                              <span className="text-green-500 font-mono text-xs">
                                {forPercentage}%
                              </span>
                            </div>
                            <div className="flex gap-1 h-2">
                              {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`flex-1 ${
                                    i < Math.floor(forPercentage / 5)
                                      ? 'bg-green-500'
                                      : 'bg-gray-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* AGAINST Votes */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-500 font-mono text-xs">AGAINST</span>
                              <span className="text-red-500 font-mono text-xs">
                                {againstPercentage}%
                              </span>
                            </div>
                            <div className="flex gap-1 h-2">
                              {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`flex-1 ${
                                    i < Math.floor(againstPercentage / 5)
                                      ? 'bg-red-500'
                                      : 'bg-gray-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar (User Clearance) */}
          <div className="lg:col-span-1">
            <div className="bg-[#252525] border border-gray-800 sticky top-8">
              {/* Header */}
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-[#ea5c2a] font-mono text-sm tracking-wider">
                  // VOTER_CLEARANCE
                </h2>
              </div>

              {/* User Data */}
              <div className="p-6 space-y-6">
                {!address ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 font-mono text-xs">
                      NO_WALLET_DETECTED
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Voting Power */}
                    <div>
                      <p className="text-gray-500 font-mono text-xs tracking-wider mb-2">
                        VOTING_POWER
                      </p>
                      <p className="text-white font-mono text-3xl font-bold">
                        {formatTokenAmount(votingPower || 0n)}
                      </p>
                      <p className="text-gray-600 font-mono text-xs mt-1">
                        KOBO_TOKENS
                      </p>
                    </div>

                    {/* Delegation Status */}
                    <div>
                      <p className="text-gray-500 font-mono text-xs tracking-wider mb-2">
                        DELEGATION_STATUS
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          delegationStatus === 'SELF_DELEGATED' 
                            ? 'bg-green-500' 
                            : delegationStatus === 'DELEGATED_OUT'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }`} />
                        <p className="text-white font-mono text-sm">
                          {delegationStatus}
                        </p>
                      </div>
                    </div>

                    {/* Token Balance */}
                    <div>
                      <p className="text-gray-500 font-mono text-xs tracking-wider mb-2">
                        TOKEN_BALANCE
                      </p>
                      <p className="text-white font-mono text-xl">
                        {formatTokenAmount(balance || 0n)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* CTA Button */}
              <div className="p-6 border-t border-gray-800">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  disabled={!address}
                  className="w-full bg-[#ea5c2a] text-black font-mono text-sm tracking-widest py-4 font-bold hover:bg-[#ff7c4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  INITIATE_NEW_PROPOSAL
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Proposal Modal */}
      <CreateProposalModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        userVotingPower={votingPower || 0n}
        onSuccess={() => {
          // Refetch proposals
        }}
      />
    </div>
  );
}
