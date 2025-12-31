import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#1e1e1e] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-[#252525] border border-[#333] rounded p-8 md:p-12">
        <h1 className="text-4xl font-bold font-mono text-[#ea5c2a] mb-8">// PRIVACY_POLICY</h1>
        
        <div className="space-y-8 text-gray-300 font-mono text-sm">
          <section>
            <p className="text-sm text-gray-400 mb-6 font-mono">
              <strong>LAST_UPDATED:</strong> 2024-11-25
            </p>
            <p className="mb-4">
              This Privacy Policy describes how Kobo NFT Platform ("we", "us", or "our") collects, uses, and shares your personal information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 1. INFORMATION_WE_COLLECT</h2>
            
            <h3 className="text-xl font-medium font-mono text-[#ea5c2a] mb-3 mt-4">1.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono"><strong>Account Information:</strong> Email address, username, profile picture</li>
              <li className="font-mono"><strong>Wallet Information:</strong> Blockchain wallet addresses (public)</li>
              <li className="font-mono"><strong>Content:</strong> AI prompts, generated content, NFT metadata, comments, and interactions</li>
              <li className="font-mono"><strong>Communications:</strong> Messages sent through our platform, support requests</li>
            </ul>

            <h3 className="text-xl font-medium font-mono text-[#ea5c2a] mb-3 mt-4">1.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono"><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
              <li className="font-mono"><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li className="font-mono"><strong>Blockchain Data:</strong> Transaction history, NFT ownership (publicly available on blockchain)</li>
              <li className="font-mono"><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 2. HOW_WE_USE_YOUR_INFORMATION</h2>
            <p className="mb-3">We use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono"><strong>Service Delivery:</strong> Provide and maintain our NFT platform services</li>
              <li className="font-mono"><strong>AI Generation:</strong> Process your prompts to generate images, audio, and video content</li>
              <li className="font-mono"><strong>Authentication:</strong> Verify your identity and manage your account</li>
              <li className="font-mono"><strong>Compliance:</strong> Detect and prevent copyright infringement, fraud, and abuse</li>
              <li className="font-mono"><strong>Communication:</strong> Send service updates, security alerts, and support responses</li>
              <li className="font-mono"><strong>Analytics:</strong> Understand usage patterns and improve our services</li>
              <li className="font-mono"><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 3. LEGAL_BASIS_FOR_PROCESSING_(GDPR)</h2>
            <p className="mb-3">For users in the European Economic Area (EEA), we process your data based on:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono"><strong>Consent:</strong> You have given clear consent for specific processing activities</li>
              <li className="font-mono"><strong>Contract:</strong> Processing is necessary to provide services you requested</li>
              <li className="font-mono"><strong>Legal Obligation:</strong> Processing is required to comply with legal requirements</li>
              <li className="font-mono"><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 4. INFORMATION_SHARING</h2>
            <p className="mb-3">We share your information in the following circumstances:</p>
            
            <h3 className="text-xl font-medium font-mono text-[#ea5c2a] mb-3 mt-4">4.1 Third-Party Services</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono"><strong>Supabase:</strong> Database and authentication services</li>
              <li className="font-mono"><strong>Pinata/IPFS:</strong> Decentralized storage for NFT content</li>
              <li className="font-mono"><strong>AI Providers:</strong> Hugging Face, ElevenLabs, Runway ML for content generation</li>
              <li className="font-mono"><strong>Blockchain Networks:</strong> Ethereum and compatible networks for NFT transactions</li>
              <li className="font-mono"><strong>Analytics:</strong> Sentry for error tracking and monitoring</li>
            </ul>

            <h3 className="text-xl font-medium font-mono text-[#ea5c2a] mb-3 mt-4">4.2 Public Information</h3>
            <p className="mb-2">The following information is publicly visible:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono">Blockchain wallet addresses</li>
              <li className="font-mono">NFT metadata and content</li>
              <li className="font-mono">Public profile information (username, bio, avatar)</li>
              <li className="font-mono">Public comments and interactions</li>
              <li className="font-mono">Transaction history on blockchain</li>
            </ul>

            <h3 className="text-xl font-medium font-mono text-[#ea5c2a] mb-3 mt-4">4.3 Legal Requirements</h3>
            <p>We may disclose information when required by law, court order, or to protect our rights and safety.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 5. YOUR_RIGHTS_(GDPR)</h2>
            <p className="mb-3">If you are in the EEA, you have the following rights:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono"><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li className="font-mono"><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li className="font-mono"><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li className="font-mono"><strong>Right to Restriction:</strong> Limit how we use your data</li>
              <li className="font-mono"><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li className="font-mono"><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li className="font-mono"><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@kobo-nft.com" className="text-[#ea5c2a] hover:underline">privacy@kobo-nft.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 6. DATA_RETENTION</h2>
            <p className="mb-3">We retain your information for as long as necessary to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono">Provide our services to you</li>
              <li className="font-mono">Comply with legal obligations</li>
              <li className="font-mono">Resolve disputes and enforce agreements</li>
            </ul>
            <p className="mt-4">
              <strong>Blockchain Data:</strong> Information stored on blockchain is permanent and cannot be deleted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 7. DATA_SECURITY</h2>
            <p className="mb-3">We implement industry-standard security measures:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono">Encryption in transit (HTTPS/TLS)</li>
              <li className="font-mono">Encryption at rest for sensitive data</li>
              <li className="font-mono">Row Level Security (RLS) in database</li>
              <li className="font-mono">Regular security audits and updates</li>
              <li className="font-mono">Access controls and authentication</li>
              <li className="font-mono">Rate limiting and DDoS protection</li>
            </ul>
            <p className="mt-4 text-[#ea5c2a] font-mono">
              <strong>WARNING:</strong> NO_TRANSMISSION_METHOD_IS_100%_SECURE
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 8. COOKIES_AND_TRACKING</h2>
            <p className="mb-3">We use cookies and similar technologies for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono"><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
              <li className="font-mono"><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li className="font-mono"><strong>Analytics Cookies:</strong> Understand how you use our platform</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings. Disabling essential cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 9. CHILDREN'S_PRIVACY</h2>
            <p>
              Our platform is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 10. INTERNATIONAL_DATA_TRANSFERS</h2>
            <p className="mb-3">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="font-mono">Standard Contractual Clauses (SCCs) for EEA transfers</li>
              <li className="font-mono">Privacy Shield certification (where applicable)</li>
              <li className="font-mono">Adequate data protection measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 11. CHANGES_TO_THIS_POLICY</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li className="font-mono">Posting the updated policy on our platform</li>
              <li className="font-mono">Updating the "Last Updated" date</li>
              <li className="font-mono">Sending email notifications for material changes</li>
            </ul>
            <p className="mt-4">
              Continued use of our platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 12. CONTACT_US</h2>
            <p className="mb-3">For privacy-related questions or to exercise your rights:</p>
            <ul className="list-none space-y-2">
              <li className="font-mono"><strong>EMAIL:</strong> <a href="mailto:privacy@kobo-nft.com" className="text-[#ea5c2a] hover:underline">privacy@kobo-nft.com</a></li>
              <li className="font-mono"><strong>DPO:</strong> <a href="mailto:dpo@kobo-nft.com" className="text-[#ea5c2a] hover:underline">dpo@kobo-nft.com</a></li>
            </ul>
            <p className="mt-4">
              <strong>EU_REPRESENTATIVE:</strong> For users in the EEA, you may also contact our EU representative at <a href="mailto:eu-rep@kobo-nft.com" className="text-[#ea5c2a] hover:underline">eu-rep@kobo-nft.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-mono text-[#ea5c2a] mb-4">// 13. SUPERVISORY_AUTHORITY</h2>
            <p>
              If you are in the EEA and believe we have not addressed your privacy concerns adequately, you have the right to lodge a complaint with your local data protection supervisory authority.
            </p>
          </section>

          <section className="border-t border-[#333] pt-6 mt-8">
            <p className="text-sm text-gray-400 font-mono">
              By using our platform, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
