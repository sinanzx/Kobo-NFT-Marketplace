import { useState } from 'react';
import { ChevronRight, Terminal, HelpCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  command: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    command: 'HOW_TO_CONNECT_WALLET?',
    answer: 'Click the "Connect Wallet" button in the top navigation bar. Select your preferred wallet provider (MetaMask, WalletConnect, etc.). Approve the connection request in your wallet extension. Once connected, your wallet address will appear in the navigation bar.',
    category: 'getting-started'
  },
  {
    id: '2',
    command: 'HOW_TO_MINT_NFT?',
    answer: 'Navigate to the Create page. Generate or upload your content (image, video, or audio). Fill in the required metadata fields. Click "Mint NFT" and approve the transaction in your wallet. Wait for blockchain confirmation.',
    category: 'getting-started'
  },
  {
    id: '3',
    command: 'WHAT_ARE_GAS_FEES?',
    answer: 'Gas fees are transaction costs paid to blockchain validators. Fees vary based on network congestion. You can view estimated gas fees before confirming transactions. Gas fees are non-refundable even if transactions fail.',
    category: 'blockchain'
  },
  {
    id: '4',
    command: 'HOW_TO_JOIN_BATTLE?',
    answer: 'Go to the Battles page. Browse active battles or create a new one. Select your NFT to enter the battle. Pay the entry fee and wait for other participants. Voting begins once the battle is full.',
    category: 'features'
  },
  {
    id: '5',
    command: 'HOW_TO_START_COLLABORATION?',
    answer: 'Navigate to the Collaborations page (Joint Operations Center). Click "INITIATE_UPLINK" to create a new session. Invite collaborators by sharing the session link. Work together on the shared canvas. Mint the final collaborative NFT.',
    category: 'features'
  },
  {
    id: '6',
    command: 'WHAT_IS_TRAIT_MARKETPLACE?',
    answer: 'The Trait Marketplace is a DeFi trading terminal for individual NFT traits. Buy and sell specific traits (backgrounds, accessories, etc.). Trade traits independently from full NFTs. View real-time market depth and floor prices.',
    category: 'features'
  },
  {
    id: '7',
    command: 'HOW_TO_VOTE_IN_DAO?',
    answer: 'Visit the DAO Governance page. Browse active proposals. Click on a proposal to view details. Cast your vote (For, Against, or Abstain). Your voting power is based on your governance token holdings.',
    category: 'dao'
  },
  {
    id: '8',
    command: 'TRANSACTION_FAILED_ERROR?',
    answer: 'Common causes: Insufficient gas fees, Network congestion, Slippage tolerance too low, Contract interaction error. Solutions: Increase gas limit, Wait and retry, Check wallet balance, Verify contract address.',
    category: 'troubleshooting'
  },
  {
    id: '9',
    command: 'WALLET_NOT_CONNECTING?',
    answer: 'Troubleshooting steps: Refresh the page, Clear browser cache, Update wallet extension, Try a different browser, Check if wallet is locked, Verify network selection.',
    category: 'troubleshooting'
  },
  {
    id: '10',
    command: 'HOW_TO_VIEW_PROVENANCE?',
    answer: 'Navigate to the Provenance page. Enter a Token ID in the database query field. Click "EXECUTE_QUERY" to view the complete chain of custody. See all mint, transfer, and sale events with transaction hashes and timestamps.',
    category: 'features'
  },
];

export default function HelpCenter() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'ALL_COMMANDS' },
    { id: 'getting-started', label: 'GETTING_STARTED' },
    { id: 'features', label: 'FEATURES' },
    { id: 'blockchain', label: 'BLOCKCHAIN' },
    { id: 'dao', label: 'DAO_GOVERNANCE' },
    { id: 'troubleshooting', label: 'TROUBLESHOOTING' },
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-8 h-8 text-[#ea5c2a]" />
            <h1 className="text-4xl font-bold text-[#ea5c2a] font-mono">
              // TROUBLESHOOTING_CONSOLE
            </h1>
          </div>
          <p className="text-gray-400 font-mono text-sm mb-2">
            &gt; HELP_CENTER.exe
          </p>
          <p className="text-gray-300 leading-relaxed">
            Execute commands to access system documentation and troubleshooting guides
          </p>
          <div className="mt-4 text-xs text-gray-500 font-mono">
            STATUS: ONLINE | COMMANDS_AVAILABLE: {faqData.length}
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="border-t border-dashed border-gray-700 my-8" />

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#ea5c2a] font-mono mb-4">
            &gt; SELECT_CATEGORY:
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 font-mono text-sm border transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#ea5c2a] border-[#ea5c2a] text-white'
                    : 'bg-[#252525] border-gray-700 text-gray-400 hover:border-[#ea5c2a] hover:text-[#ea5c2a]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-dashed border-gray-700 my-8" />

        {/* FAQ Console */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#ea5c2a] font-mono mb-4">
            &gt; AVAILABLE_COMMANDS:
          </h2>

          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="border border-gray-700 bg-[#252525]">
              {/* Command Button */}
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2a2a2a] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <ChevronRight 
                    className={`w-4 h-4 text-[#ea5c2a] transition-transform ${
                      openFAQ === faq.id ? 'rotate-90' : ''
                    }`}
                  />
                  <span className="font-mono text-sm text-[#ea5c2a] group-hover:text-white transition-colors">
                    &gt; {faq.command}
                  </span>
                </div>
                <HelpCircle className="w-4 h-4 text-gray-600" />
              </button>

              {/* Terminal Output */}
              <AnimatePresence>
                {openFAQ === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-4 border-t border-gray-700 bg-[#1e1e1e]">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-green-500 font-mono text-xs">[OUTPUT]</span>
                        <span className="text-gray-500 font-mono text-xs">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </div>
                      <div className="mt-3 text-xs text-gray-600 font-mono">
                        &gt; COMMAND_EXECUTED_SUCCESSFULLY
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-mono">
              &gt; NO_COMMANDS_FOUND_IN_CATEGORY
            </p>
          </div>
        )}

        <div className="border-t border-dashed border-gray-700 my-8" />

        {/* Additional Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-6">
            // ADDITIONAL_RESOURCES
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#252525] border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-[#ea5c2a]" />
                <h3 className="font-mono text-white">DOCUMENTATION</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Access comprehensive platform documentation and guides
              </p>
              <a 
                href="/help" 
                className="text-[#ea5c2a] hover:text-white font-mono text-sm transition-colors"
              >
                &gt; ACCESS_DOCS
              </a>
            </div>

            <div className="bg-[#252525] border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Terminal className="w-5 h-5 text-[#ea5c2a]" />
                <h3 className="font-mono text-white">COMMUNITY_SUPPORT</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Join our Discord community for real-time assistance
              </p>
              <a 
                href="https://discord.gg/kobonft" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ea5c2a] hover:text-white font-mono text-sm transition-colors"
              >
                &gt; JOIN_DISCORD
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
