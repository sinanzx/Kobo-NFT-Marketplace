import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NetworkBadge from '../NetworkBadge';
import { Tooltip } from '@/components/Tooltip';
import { 
  Home, 
  Sparkles, 
  Image, 
  Swords, 
  Users, 
  Glasses, 
  LayoutDashboard,
  Menu,
  X,
  Compass,
  Store,
  Vote,
  GitBranch,
  Gift,
  HelpCircle,
  ChevronDown,
  Settings,
  LogOut,
  Circle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Asset Layer Navigation
const assetItems = [
  { path: '/gallery', label: 'Gallery', subtitle: 'View Assets' },
  { path: '/marketplace', label: 'Trait Marketplace', subtitle: 'God-Tier Liquidity' },
  { path: '/provenance', label: 'Provenance', subtitle: 'Asset History' },
];

// Protocol Layer Navigation
const protocolItems = [
  { path: '/governance', label: 'DAO Governance', subtitle: 'Voting' },
  { path: '/collaborations', label: 'Collaborations', subtitle: 'Joint Ops' },
  { path: '/battles', label: 'Battles', subtitle: 'Competition' },
];

export function MainNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Mock wallet connection for demo
  const handleConnectWallet = () => {
    setIsConnected(true);
    setUserAddress('0x742d...5e3a');
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setUserAddress('');
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        id="navigation"
        className="hidden lg:block fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-black border-b-2 border-[#ea5c2a]"
        style={{
          width: 'max-content',
          maxWidth: '90vw',
          boxShadow: '0 4px 20px rgba(234, 92, 42, 0.3)',
        }}
        aria-label="Main navigation"
      >
        <div className="px-6">
          <div className="flex items-center justify-between h-16 gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" aria-label="KoboNFT home">
              <div className="relative">
                <div className="w-10 h-10 bg-[#ea5c2a] rounded-lg rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 w-10 h-10 bg-[#ea5c2a] rounded-lg blur-lg opacity-50" />
              </div>
              <span 
                className="text-xl font-bold text-white font-mono tracking-wider"
              >
                KŌBO
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              {/* ASSETS Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-gray-400 hover:text-[#ea5c2a] transition-all duration-300 font-mono uppercase tracking-wider border-2 border-transparent hover:border-[#ea5c2a]/50"
                  >
                    <span className="text-sm">// ASSETS</span>
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-black border-2 border-[#ea5c2a] shadow-lg shadow-[#ea5c2a]/30 min-w-[240px]"
                  align="center"
                >
                  {assetItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link 
                        to={item.path}
                        className="font-mono text-gray-400 hover:text-[#ea5c2a] hover:bg-[#ea5c2a]/10 cursor-pointer focus:text-[#ea5c2a] focus:bg-[#ea5c2a]/10 transition-colors"
                      >
                        <div className="flex flex-col py-1">
                          <span className="text-sm font-semibold">{item.label}</span>
                          <span className="text-xs text-gray-500">{item.subtitle}</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* PROTOCOL Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-gray-400 hover:text-[#ea5c2a] transition-all duration-300 font-mono uppercase tracking-wider border-2 border-transparent hover:border-[#ea5c2a]/50"
                  >
                    <span className="text-sm">// PROTOCOL</span>
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-black border-2 border-[#ea5c2a] shadow-lg shadow-[#ea5c2a]/30 min-w-[240px]"
                  align="center"
                >
                  {protocolItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link 
                        to={item.path}
                        className="font-mono text-gray-400 hover:text-[#ea5c2a] hover:bg-[#ea5c2a]/10 cursor-pointer focus:text-[#ea5c2a] focus:bg-[#ea5c2a]/10 transition-colors"
                      >
                        <div className="flex flex-col py-1">
                          <span className="text-sm font-semibold">{item.label}</span>
                          <span className="text-xs text-gray-500">{item.subtitle}</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* FABRICATE Direct Link */}
              <Link to="/create">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative gap-2 transition-all duration-300 font-mono uppercase tracking-wider ${
                    isActive('/create')
                      ? 'text-white bg-[#ea5c2a]/20 border-2 border-[#ea5c2a]' 
                      : 'text-gray-400 hover:text-[#ea5c2a] hover:bg-[#ea5c2a]/10 border-2 border-transparent hover:border-[#ea5c2a]/50'
                  }`}
                  aria-label="Fabricate"
                  aria-current={isActive('/create') ? 'page' : undefined}
                >
                  <span className="text-sm">// FABRICATE</span>
                  {isActive('/create') && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#ea5c2a]/20 rounded-md border-2 border-[#ea5c2a]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Button>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Tooltip content="Current blockchain network">
                <div>
                  <NetworkBadge />
                </div>
              </Tooltip>
              <Tooltip content="Restart the interactive feature tour">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const tourCompleted = localStorage.getItem('kobo_feature_tour_completed');
                    const tourDismissed = localStorage.getItem('kobo_feature_tour_dismissed');
                    if (tourCompleted || tourDismissed) {
                      localStorage.removeItem('kobo_feature_tour_completed');
                      localStorage.removeItem('kobo_feature_tour_dismissed');
                      window.location.href = '/';
                    }
                  }}
                  className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                  aria-label="Start feature tour"
                >
                  <Compass className="w-4 h-4" aria-hidden="true" />
                </Button>
              </Tooltip>
              {!isConnected ? (
                <Tooltip content="Connect your Web3 wallet to interact with NFTs">
                  <Button 
                    onClick={handleConnectWallet}
                    className="bg-[#ea5c2a] hover:bg-[#ff6b35] text-white font-mono font-bold rounded-lg border-2 border-[#ea5c2a] shadow-lg shadow-[#ea5c2a]/30 hover:shadow-xl hover:shadow-[#ea5c2a]/50 transition-all duration-300 uppercase tracking-wider"
                    aria-label="Connect wallet"
                  >
                    Connect Wallet
                  </Button>
                </Tooltip>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 bg-[#252525] border-2 border-[#ea5c2a] text-white font-mono hover:bg-[#2a2a2a] transition-all duration-300"
                    >
                      <Circle className="w-2 h-2 fill-green-500 text-green-500" aria-hidden="true" />
                      <span className="text-sm">{userAddress}</span>
                      <ChevronDown className="w-3 h-3" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="bg-[#252525] border-2 border-[#ea5c2a] shadow-lg shadow-[#ea5c2a]/30 min-w-[260px]"
                    align="end"
                  >
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/dashboard"
                        className="font-mono text-gray-300 hover:text-white hover:bg-[#ea5c2a]/10 cursor-pointer focus:text-white focus:bg-[#ea5c2a]/10 transition-colors"
                      >
                        <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-2" aria-hidden="true" />
                        <div className="flex flex-col py-1">
                          <span className="text-sm font-semibold">// COMMAND_DASHBOARD</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/account-settings"
                        className="font-mono text-gray-300 hover:text-white hover:bg-[#ea5c2a]/10 cursor-pointer focus:text-white focus:bg-[#ea5c2a]/10 transition-colors"
                      >
                        <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-2" aria-hidden="true" />
                        <div className="flex flex-col py-1">
                          <span className="text-sm font-semibold">// ACCOUNT_CONFIG</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/gifts"
                        className="font-mono text-gray-300 hover:text-white hover:bg-[#ea5c2a]/10 cursor-pointer focus:text-white focus:bg-[#ea5c2a]/10 transition-colors"
                      >
                        <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-2" aria-hidden="true" />
                        <div className="flex flex-col py-1">
                          <span className="text-sm font-semibold">// CLAIM_GIFTS</span>
                          <span className="text-xs text-gray-500">Social Utility</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/ar-viewer"
                        className="font-mono text-gray-300 hover:text-white hover:bg-[#ea5c2a]/10 cursor-pointer focus:text-white focus:bg-[#ea5c2a]/10 transition-colors"
                      >
                        <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-2" aria-hidden="true" />
                        <div className="flex flex-col py-1">
                          <span className="text-sm font-semibold">// AR_SIMULATION</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <div className="h-px bg-[#ea5c2a] my-1" />
                    <DropdownMenuItem 
                      onClick={handleDisconnect}
                      className="font-mono text-[#ea5c2a] hover:text-white hover:bg-[#ea5c2a]/20 cursor-pointer focus:text-white focus:bg-[#ea5c2a]/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                      <span className="text-sm font-semibold">[ DISCONNECT_UPLINK ]</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav 
        id="navigation"
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-[#ea5c2a]"
        aria-label="Mobile navigation"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" aria-label="KoboNFT home">
              <div className="relative">
                <div className="w-8 h-8 bg-[#ea5c2a] rounded-lg" />
                <div className="absolute inset-0 w-8 h-8 bg-[#ea5c2a] rounded-lg blur-md opacity-50" />
              </div>
              <span 
                className="text-xl font-bold text-white font-mono tracking-wider"
              >
                KŌBO
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 border-t-2 border-[#ea5c2a] bg-black"
              id="mobile-menu"
            >
              <div className="container mx-auto px-4 py-6 space-y-4" role="menu">
                {/* ASSETS Section */}
                <div className="space-y-1">
                  <div className="px-3 py-2 text-xs font-mono text-[#ea5c2a] uppercase tracking-wider">
                    // ASSETS
                  </div>
                  {assetItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 transition-all duration-200 font-mono text-gray-400 hover:text-white hover:bg-[#ea5c2a]/10 border-2 border-transparent hover:border-[#ea5c2a]/50"
                        role="menuitem"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{item.label}</span>
                          <span className="text-xs text-gray-500">{item.subtitle}</span>
                        </div>
                      </Button>
                    </Link>
                  ))}
                </div>

                {/* PROTOCOL Section */}
                <div className="space-y-1">
                  <div className="px-3 py-2 text-xs font-mono text-[#ea5c2a] uppercase tracking-wider">
                    // PROTOCOL
                  </div>
                  {protocolItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 transition-all duration-200 font-mono text-gray-400 hover:text-white hover:bg-[#ea5c2a]/10 border-2 border-transparent hover:border-[#ea5c2a]/50"
                        role="menuitem"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{item.label}</span>
                          <span className="text-xs text-gray-500">{item.subtitle}</span>
                        </div>
                      </Button>
                    </Link>
                  ))}
                </div>

                {/* FABRICATE Section */}
                <div className="space-y-1">
                  <Link
                    to="/create"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 transition-all duration-200 font-mono uppercase tracking-wider ${
                        isActive('/create')
                          ? 'bg-[#ea5c2a]/20 text-white border-2 border-[#ea5c2a]' 
                          : 'text-gray-400 hover:text-white hover:bg-[#ea5c2a]/10 border-2 border-transparent hover:border-[#ea5c2a]/50'
                      }`}
                      role="menuitem"
                    >
                      <span className="font-medium">// FABRICATE</span>
                    </Button>
                  </Link>
                </div>
                
                <div className="pt-4 mt-4 border-t border-[#ea5c2a]/30 space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const tourCompleted = localStorage.getItem('kobo_feature_tour_completed');
                      const tourDismissed = localStorage.getItem('kobo_feature_tour_dismissed');
                      if (tourCompleted || tourDismissed) {
                        localStorage.removeItem('kobo_feature_tour_completed');
                        localStorage.removeItem('kobo_feature_tour_dismissed');
                        window.location.href = '/';
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-accent"
                    role="menuitem"
                    aria-label="Start feature tour"
                  >
                    <Compass className="w-5 h-5" aria-hidden="true" />
                    Feature Tour
                  </Button>
                  
                  {!isConnected ? (
                    <Button 
                      onClick={handleConnectWallet}
                      className="w-full bg-[#ea5c2a] hover:bg-[#ff6b35] text-white font-mono font-bold rounded-lg border-2 border-[#ea5c2a] uppercase tracking-wider"
                      aria-label="Connect wallet"
                    >
                      Connect Wallet
                    </Button>
                  ) : (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-xs font-mono text-[#ea5c2a] uppercase tracking-wider flex items-center gap-2">
                        <Circle className="w-2 h-2 fill-green-500 text-green-500" aria-hidden="true" />
                        {userAddress}
                      </div>
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 transition-all duration-200 font-mono text-gray-400 hover:text-white hover:bg-[#ea5c2a]/10 border-2 border-transparent hover:border-[#ea5c2a]/50"
                        >
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" aria-hidden="true" />
                          <span className="font-medium text-sm">// COMMAND_DASHBOARD</span>
                        </Button>
                      </Link>
                      <Link to="/account-settings" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 transition-all duration-200 font-mono text-gray-400 hover:text-white hover:bg-[#ea5c2a]/10 border-2 border-transparent hover:border-[#ea5c2a]/50"
                        >
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" aria-hidden="true" />
                          <span className="font-medium text-sm">// ACCOUNT_CONFIG</span>
                        </Button>
                      </Link>
                      <Link to="/gifts" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 transition-all duration-200 font-mono text-gray-400 hover:text-white hover:bg-[#ea5c2a]/10 border-2 border-transparent hover:border-[#ea5c2a]/50"
                        >
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" aria-hidden="true" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">// CLAIM_GIFTS</span>
                            <span className="text-xs text-gray-500">Social Utility</span>
                          </div>
                        </Button>
                      </Link>
                      <Link to="/ar-viewer" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 transition-all duration-200 font-mono text-gray-400 hover:text-white hover:bg-[#ea5c2a]/10 border-2 border-transparent hover:border-[#ea5c2a]/50"
                        >
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" aria-hidden="true" />
                          <span className="font-medium text-sm">// AR_SIMULATION</span>
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          handleDisconnect();
                          setMobileMenuOpen(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start gap-3 transition-all duration-200 font-mono text-[#ea5c2a] hover:text-white hover:bg-[#ea5c2a]/20 border-2 border-transparent hover:border-[#ea5c2a]"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        <span className="font-medium text-sm">[ DISCONNECT_UPLINK ]</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
