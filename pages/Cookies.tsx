import { Cookie, Shield, Settings, BarChart3, Target, Globe, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Cookies() {
  const cookieTypes = [
    {
      name: 'Strictly Necessary Cookies',
      icon: Shield,
      required: true,
      description: 'These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.',
      examples: [
        'Authentication tokens',
        'Session management',
        'Security preferences',
        'Load balancing'
      ],
      canDisable: false
    },
    {
      name: 'Functional Cookies',
      icon: Settings,
      required: false,
      description: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.',
      examples: [
        'Language preferences',
        'Theme settings',
        'Wallet connection state',
        'User interface preferences'
      ],
      canDisable: true
    },
    {
      name: 'Analytics Cookies',
      icon: BarChart3,
      required: false,
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      examples: [
        'Page view tracking',
        'User behavior analysis',
        'Performance metrics',
        'Error tracking'
      ],
      canDisable: true
    },
    {
      name: 'Marketing Cookies',
      icon: Target,
      required: false,
      description: 'These cookies are used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.',
      examples: [
        'Ad targeting',
        'Campaign tracking',
        'Social media integration',
        'Conversion tracking'
      ],
      canDisable: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] relative overflow-hidden">

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center">
            <div className="relative">
              <div className="relative p-5 bg-[#252525] rounded border border-[#ea5c2a]">
                <Cookie className="w-12 h-12 text-[#ea5c2a]" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tight leading-tight text-[#ea5c2a]">
              // COOKIE_POLICY
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-mono">
              UNDERSTANDING_COOKIE_USAGE_AND_TRACKING_TECHNOLOGIES
            </p>
          </div>

          {/* Last Updated */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#252525] border border-[#333] rounded text-gray-400 text-sm font-mono">
            <Cookie className="w-4 h-4" />
            <span className="font-medium">LAST_UPDATED: 2024-11-27</span>
          </div>
        </div>

        {/* Introduction */}
        <Card className="bg-[#252525] border border-[#333] p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1e1e1e] rounded border border-[#ea5c2a]">
              <Globe className="w-6 h-6 text-[#ea5c2a]" />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold font-mono text-[#ea5c2a]">
                // WHAT_ARE_COOKIES
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed font-mono text-sm">
                <p>
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our site, and improving our services.
                </p>
                <p>
                  We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device for a set period or until you delete them).
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Cookie Types */}
        <div className="space-y-8 mb-12">
          <h2 className="text-3xl font-bold font-mono text-[#ea5c2a] text-center">
            // COOKIE_TYPES
          </h2>

          <div className="grid gap-6">
            {cookieTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Card 
                  key={index}
                  className="bg-[#252525] border border-[#333] p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#1e1e1e] rounded border border-[#ea5c2a]">
                      <Icon className="w-6 h-6 text-[#ea5c2a]" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <h3 className="text-xl font-bold font-mono text-[#ea5c2a]">
                          {type.name}
                        </h3>
                        {type.required ? (
                          <span className="px-3 py-1 bg-[#1e1e1e] border border-[#ea5c2a] rounded text-[#ea5c2a] text-xs font-mono font-medium flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            ALWAYS_ACTIVE
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-[#1e1e1e] border border-[#333] rounded text-gray-400 text-xs font-mono font-medium flex items-center gap-1">
                            <Settings className="w-3 h-3" />
                            OPTIONAL
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-300 leading-relaxed font-mono text-sm">
                        {type.description}
                      </p>

                      <div className="space-y-2">
                        <p className="text-sm font-medium font-mono text-[#ea5c2a]">EXAMPLES:</p>
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {type.examples.map((example, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                              <CheckCircle className="w-4 h-4 text-[#ea5c2a] flex-shrink-0" />
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {type.canDisable && (
                        <p className="text-sm text-gray-400 font-mono flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          MANAGE_VIA_BROWSER_SETTINGS_OR_CONSENT_BANNER
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Third-Party Cookies */}
        <Card className="bg-[#252525] border border-[#333] p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1e1e1e] rounded border border-[#ea5c2a]">
              <Globe className="w-6 h-6 text-[#ea5c2a]" />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold font-mono text-[#ea5c2a]">
                // THIRD_PARTY_COOKIES
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed font-mono text-sm">
                <p>
                  Some cookies are placed by third-party services that appear on our pages. We use the following third-party services:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#ea5c2a] mt-0.5 flex-shrink-0" />
                    <span><strong>WalletConnect:</strong> For blockchain wallet connections and authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#ea5c2a] mt-0.5 flex-shrink-0" />
                    <span><strong>Analytics Services:</strong> To understand user behavior and improve our platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#ea5c2a] mt-0.5 flex-shrink-0" />
                    <span><strong>Content Delivery Networks:</strong> To optimize performance and load times</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Managing Cookies */}
        <Card className="bg-[#252525] border border-[#333] p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1e1e1e] rounded border border-[#ea5c2a]">
              <Settings className="w-6 h-6 text-[#ea5c2a]" />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold font-mono text-[#ea5c2a]">
                // MANAGING_COOKIE_PREFERENCES
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed font-mono text-sm">
                <p>
                  You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#ea5c2a] mt-0.5 flex-shrink-0" />
                    <span>Using our cookie consent banner when you first visit the site</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#ea5c2a] mt-0.5 flex-shrink-0" />
                    <span>Adjusting your browser settings to block or delete cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#ea5c2a] mt-0.5 flex-shrink-0" />
                    <span>Using browser extensions that manage cookie preferences</span>
                  </li>
                </ul>
                <p className="text-[#ea5c2a] font-medium font-mono text-sm flex items-start gap-2">
                  <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>WARNING: BLOCKING_COOKIES_MAY_IMPACT_FUNCTIONALITY</span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Browser-Specific Instructions */}
        <Card className="bg-[#252525] border border-[#333] p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1e1e1e] rounded border border-[#ea5c2a]">
              <Globe className="w-6 h-6 text-[#ea5c2a]" />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold font-mono text-[#ea5c2a]">
                // BROWSER_COOKIE_SETTINGS
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed font-mono text-sm">
                <p>
                  Most web browsers allow you to control cookies through their settings. Here's how to manage cookies in popular browsers:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-[#1e1e1e] rounded border border-[#333]">
                    <h4 className="font-semibold font-mono text-[#ea5c2a] mb-2">CHROME</h4>
                    <p className="text-sm text-gray-400 font-mono">Settings → Privacy and security → Cookies and other site data</p>
                  </div>
                  <div className="p-4 bg-[#1e1e1e] rounded border border-[#333]">
                    <h4 className="font-semibold font-mono text-[#ea5c2a] mb-2">FIREFOX</h4>
                    <p className="text-sm text-gray-400 font-mono">Settings → Privacy & Security → Cookies and Site Data</p>
                  </div>
                  <div className="p-4 bg-[#1e1e1e] rounded border border-[#333]">
                    <h4 className="font-semibold font-mono text-[#ea5c2a] mb-2">SAFARI</h4>
                    <p className="text-sm text-gray-400 font-mono">Preferences → Privacy → Manage Website Data</p>
                  </div>
                  <div className="p-4 bg-[#1e1e1e] rounded border border-[#333]">
                    <h4 className="font-semibold font-mono text-[#ea5c2a] mb-2">EDGE</h4>
                    <p className="text-sm text-gray-400 font-mono">Settings → Cookies and site permissions → Cookies and site data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Updates to Policy */}
        <Card className="bg-[#252525] border border-[#333] p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1e1e1e] rounded border border-[#ea5c2a]">
              <Cookie className="w-6 h-6 text-[#ea5c2a]" />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold font-mono text-[#ea5c2a]">
                // POLICY_UPDATES
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed font-mono text-sm">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
                </p>
                <p className="text-sm text-gray-400">
                  We encourage you to review this policy periodically to stay informed about how we use cookies.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
