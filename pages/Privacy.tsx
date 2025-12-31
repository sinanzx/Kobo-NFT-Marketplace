import { Shield, Lock, Eye, Database, UserCheck, Mail, FileText, AlertCircle } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#ea5c2a]" />
            <h1 className="text-4xl font-bold text-[#ea5c2a] font-mono">
              // CLASSIFIED_SYSTEM_DOCUMENT
            </h1>
          </div>
          <p className="text-gray-400 font-mono text-sm mb-2">
            &gt; PRIVACY_POLICY.txt
          </p>
          <p className="text-gray-300 leading-relaxed">
            Your privacy and data security are our top priorities
          </p>
          <div className="mt-4 text-xs text-gray-500 font-mono">
            LAST_MODIFIED: 2024-11-26 | CLASSIFICATION: PUBLIC
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="border-t border-dashed border-gray-700 my-8" />

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Introduction */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_1.0_INTRODUCTION
            </h2>
            <div className="text-gray-300 leading-relaxed">
              <p>
                This Privacy Policy describes how Kobo NFT Platform ("we", "us", or "our") collects, uses, and shares your personal information when you use our NFT minting and trading platform. By using our services, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Information We Collect */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_2.0_DATA_COLLECTION
            </h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 font-mono">&gt; WALLET_INFORMATION</h3>
                <p className="leading-relaxed">
                  We collect your blockchain wallet address when you connect to our platform. This is necessary to facilitate NFT transactions and display your owned assets.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 font-mono">&gt; ACCOUNT_DATA</h3>
                <p className="leading-relaxed">
                  If you create an account, we collect your email address, username, and profile information you choose to provide.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 font-mono">&gt; USAGE_INFORMATION</h3>
                <p className="leading-relaxed">
                  We automatically collect information about your interactions with our platform, including pages visited, features used, and transaction history.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 font-mono">&gt; DEVICE_INFORMATION</h3>
                <p className="leading-relaxed">
                  We collect device-specific information such as browser type, IP address, and operating system to improve our services and ensure security.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* How We Use Your Information */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_3.0_DATA_USAGE
            </h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>To provide, maintain, and improve our NFT platform services</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>To process and facilitate blockchain transactions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>To communicate with you about updates, security alerts, and support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>To detect, prevent, and address fraud and security issues</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>To analyze usage patterns and improve user experience</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>To comply with legal obligations and enforce our terms of service</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Data Security */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_4.0_DATA_SECURITY
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. This includes encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Blockchain Transparency */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_5.0_BLOCKCHAIN_TRANSPARENCY
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Please note that blockchain transactions are public and permanent. Your wallet address and transaction history on the blockchain are publicly visible and cannot be deleted or modified. We do not control the blockchain and cannot remove or alter this information.
            </p>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Third-Party Services */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_6.0_THIRD_PARTY_SERVICES
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Our platform integrates with third-party services including:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>Wallet providers (e.g., MetaMask, WalletConnect)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>Blockchain networks and node providers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>Analytics and monitoring services</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>IPFS and decentralized storage providers</span>
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Your Rights */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_7.0_USER_RIGHTS
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>Access and receive a copy of your personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>Request correction of inaccurate personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>Request deletion of your personal data (subject to legal obligations)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>Object to or restrict processing of your personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ea5c2a] font-mono">&gt;</span>
                <span>Withdraw consent at any time (where processing is based on consent)</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Cookies */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_8.0_COOKIES_AND_TRACKING
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, and personalize content. You can control cookie preferences through your browser settings. However, disabling cookies may limit some functionality of our platform.
            </p>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Children's Privacy */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_9.0_CHILDRENS_PRIVACY
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Our platform is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Changes to Policy */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_10.0_POLICY_UPDATES
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically for any changes.
            </p>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Contact */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_11.0_CONTACT_INFORMATION
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-[#252525] border border-gray-700 p-4 rounded font-mono">
              <p className="text-[#ea5c2a]">privacy@kobo-nft.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
