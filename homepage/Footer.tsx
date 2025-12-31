import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const systemLinks = [
  { path: '/', label: 'Home' },
  { path: '/create', label: 'Create' },
  { path: '/help', label: 'Help Center' },
];

const marketLinks = [
  { path: '/gallery', label: 'Gallery' },
  { path: '/marketplace', label: 'Trait Marketplace' },
  { path: '/provenance', label: 'Provenance' },
];

const ecosystemLinks = [
  { path: '/governance', label: 'DAO' },
  { path: '/battles', label: 'Battles' },
  { path: '/collaborations', label: 'Collaborations' },
];

const complianceLinks = [
  { path: '/licenses', label: 'Licenses' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms of Service' },
  { path: '/cookies', label: 'Cookies' },
  { path: '/privacy-settings', label: 'Privacy' },
];

export function Footer() {
  return (
    <footer 
      id="footer" 
      className="relative bg-black border-t-2 border-[#ea5c2a]" 
      role="contentinfo"
    >
      <div className="container px-4 mx-auto py-12">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: SYSTEM */}
          <div className="space-y-4">
            <h3 className="text-[#ea5c2a] font-mono text-sm font-bold uppercase tracking-wider">
              // SYSTEM
            </h3>
            <ul className="space-y-2">
              {systemLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-[#888] hover:text-white transition-colors duration-200 text-sm font-mono"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: MARKETS */}
          <div className="space-y-4">
            <h3 className="text-[#ea5c2a] font-mono text-sm font-bold uppercase tracking-wider">
              // MARKETS
            </h3>
            <ul className="space-y-2">
              {marketLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-[#888] hover:text-white transition-colors duration-200 text-sm font-mono"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: ECOSYSTEM */}
          <div className="space-y-4">
            <h3 className="text-[#ea5c2a] font-mono text-sm font-bold uppercase tracking-wider">
              // ECOSYSTEM
            </h3>
            <ul className="space-y-2">
              {ecosystemLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-[#888] hover:text-white transition-colors duration-200 text-sm font-mono"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: COMPLIANCE_LOGS */}
          <div className="space-y-4">
            <h3 className="text-[#ea5c2a] font-mono text-sm font-bold uppercase tracking-wider">
              // COMPLIANCE_LOGS
            </h3>
            <ul className="space-y-2">
              {complianceLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-[#888] hover:text-white transition-colors duration-200 text-sm font-mono"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#ea5c2a]/30 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-[#ea5c2a] rounded-lg" />
              <div className="absolute inset-0 w-8 h-8 bg-[#ea5c2a] rounded-lg blur-md opacity-50" />
            </div>
            <span className="text-xl font-bold text-white font-mono tracking-wider">
              KŌBO
            </span>
          </div>

          {/* Secure Connection Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#252525] border border-[#ea5c2a] rounded">
            <Shield className="w-4 h-4 text-green-500" aria-hidden="true" />
            <span className="text-xs font-mono text-gray-400">
              SECURE_CONNECTION // V.2.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
