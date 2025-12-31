import { FileText, Scale, AlertTriangle, Shield } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-8 h-8 text-[#ea5c2a]" />
            <h1 className="text-4xl font-bold text-[#ea5c2a] font-mono">
              // CLASSIFIED_SYSTEM_DOCUMENT
            </h1>
          </div>
          <p className="text-gray-400 font-mono text-sm mb-2">
            &gt; TERMS_OF_SERVICE.txt
          </p>
          <p className="text-gray-300 leading-relaxed">
            Legal agreement governing your use of the Kobo NFT Platform
          </p>
          <div className="mt-4 text-xs text-gray-500 font-mono">
            LAST_MODIFIED: 2024-11-26 | CLASSIFICATION: PUBLIC
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="border-t border-dashed border-gray-700 my-8" />

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Acceptance */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_1.0_ACCEPTANCE_OF_TERMS
            </h2>
            <div className="text-gray-300 leading-relaxed">
              <p>
                By accessing or using the Kobo NFT Platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform. We reserve the right to modify these Terms at any time, and your continued use of the Platform constitutes acceptance of any changes.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Eligibility */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_2.0_ELIGIBILITY
            </h2>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">
                You must be at least 18 years old to use this Platform. By using the Platform, you represent and warrant that:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>You are at least 18 years of age</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>You have the legal capacity to enter into these Terms</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>You are not prohibited from using the Platform under applicable laws</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>You will comply with all applicable laws and regulations</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Platform Services */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_3.0_PLATFORM_SERVICES
            </h2>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                The Platform provides a decentralized marketplace for creating, buying, selling, and trading non-fungible tokens (NFTs). Our services include but are not limited to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>NFT minting and creation tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Marketplace for buying and selling NFTs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>NFT battle and competition features</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Collaborative creation tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>DAO governance participation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Trait marketplace and trading</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Wallet Connection */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_4.0_WALLET_CONNECTION
            </h2>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                To use the Platform, you must connect a compatible cryptocurrency wallet. You are solely responsible for:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Maintaining the security of your wallet and private keys</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>All transactions initiated from your wallet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Any fees associated with blockchain transactions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Verifying transaction details before confirmation</span>
                </li>
              </ul>
              <p className="mt-4">
                We do not have access to your private keys and cannot reverse, cancel, or refund any transactions.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* User Conduct */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_5.0_USER_CONDUCT
            </h2>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>You agree not to:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Violate any applicable laws or regulations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Infringe on intellectual property rights of others</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Upload or mint content that is illegal, harmful, or offensive</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Engage in market manipulation or fraudulent activities</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Attempt to hack, disrupt, or compromise the Platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Use automated systems to access the Platform without permission</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Impersonate others or misrepresent your affiliation</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Intellectual Property */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_6.0_INTELLECTUAL_PROPERTY
            </h2>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                When you mint an NFT on the Platform, you represent and warrant that you own or have the necessary rights to the content. You retain ownership of your content, but grant us a license to display and distribute it through the Platform.
              </p>
              <p>
                The Platform itself, including its design, code, and branding, is protected by intellectual property laws and remains our exclusive property.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Fees and Payments */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_7.0_FEES_AND_PAYMENTS
            </h2>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                The Platform may charge fees for certain services, including but not limited to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Minting fees for creating NFTs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Transaction fees on sales (typically 2.5%)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Battle entry fees</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Premium features and services</span>
                </li>
              </ul>
              <p className="mt-4">
                All fees are clearly displayed before you confirm a transaction. Blockchain gas fees are separate and paid directly to network validators.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Disclaimers */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_8.0_DISCLAIMERS
            </h2>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p className="uppercase font-semibold">
                THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
              </p>
              <p>We do not guarantee:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Uninterrupted or error-free operation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>The accuracy or reliability of content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>The value or liquidity of NFTs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ea5c2a] font-mono">&gt;</span>
                  <span>Protection against hacks or security breaches</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Limitation of Liability */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_9.0_LIMITATION_OF_LIABILITY
            </h2>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p>
                Our total liability shall not exceed the fees you paid to us in the 12 months preceding the claim.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Indemnification */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_10.0_INDEMNIFICATION
            </h2>
            <div className="text-gray-300 leading-relaxed">
              <p>
                You agree to indemnify and hold harmless Kobo NFT Platform, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform or violation of these Terms.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Termination */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_11.0_TERMINATION
            </h2>
            <div className="text-gray-300 leading-relaxed">
              <p>
                We reserve the right to suspend or terminate your access to the Platform at any time, with or without cause or notice. You may stop using the Platform at any time. Upon termination, your right to use the Platform will immediately cease.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Governing Law */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_12.0_GOVERNING_LAW
            </h2>
            <div className="text-gray-300 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions. Any disputes shall be resolved through binding arbitration.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Changes to Terms */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_13.0_CHANGES_TO_TERMS
            </h2>
            <div className="text-gray-300 leading-relaxed">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on the Platform. Your continued use of the Platform after such changes constitutes acceptance of the new Terms.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-700 my-8" />

          {/* Contact */}
          <div>
            <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
              // SECTION_14.0_CONTACT_INFORMATION
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-[#252525] border border-gray-700 p-4 rounded font-mono">
              <p className="text-[#ea5c2a]">legal@kobo-nft.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
