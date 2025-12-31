import { FileCode, Package, Shield, ExternalLink } from 'lucide-react';

export default function Licenses() {
  const openSourceLicenses = [
    {
      name: 'React',
      version: '^18.3.1',
      license: 'MIT',
      author: 'Meta Platforms, Inc.',
      description: 'A JavaScript library for building user interfaces',
      url: 'https://react.dev/'
    },
    {
      name: 'Vite',
      version: '^5.4.11',
      license: 'MIT',
      author: 'Evan You',
      description: 'Next generation frontend tooling',
      url: 'https://vitejs.dev/'
    },
    {
      name: 'TypeScript',
      version: '^5.6.2',
      license: 'Apache-2.0',
      author: 'Microsoft Corporation',
      description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output',
      url: 'https://www.typescriptlang.org/'
    },
    {
      name: 'Tailwind CSS',
      version: '^3.4.15',
      license: 'MIT',
      author: 'Tailwind Labs',
      description: 'A utility-first CSS framework',
      url: 'https://tailwindcss.com/'
    },
    {
      name: 'Framer Motion',
      version: '^11.11.17',
      license: 'MIT',
      author: 'Framer',
      description: 'Production-ready motion library for React',
      url: 'https://www.framer.com/motion/'
    },
    {
      name: 'Ethers.js',
      version: '^6.13.4',
      license: 'MIT',
      author: 'Richard Moore',
      description: 'Complete Ethereum library and wallet implementation',
      url: 'https://docs.ethers.org/'
    },
    {
      name: 'Wagmi',
      version: '^2.12.25',
      license: 'MIT',
      author: 'Wevm',
      description: 'React Hooks for Ethereum',
      url: 'https://wagmi.sh/'
    },
    {
      name: 'Lucide React',
      version: '^0.468.0',
      license: 'ISC',
      author: 'Lucide Contributors',
      description: 'Beautiful & consistent icon toolkit',
      url: 'https://lucide.dev/'
    },
    {
      name: 'React Router',
      version: '^6.28.0',
      license: 'MIT',
      author: 'Remix Software Inc.',
      description: 'Declarative routing for React',
      url: 'https://reactrouter.com/'
    },
    {
      name: 'Radix UI',
      version: 'Various',
      license: 'MIT',
      author: 'WorkOS',
      description: 'Unstyled, accessible components for building high‑quality design systems',
      url: 'https://www.radix-ui.com/'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FileCode className="w-8 h-8 text-[#ea5c2a]" />
            <h1 className="text-4xl font-bold text-[#ea5c2a] font-mono">
              // CLASSIFIED_SYSTEM_DOCUMENT
            </h1>
          </div>
          <p className="text-gray-400 font-mono text-sm mb-2">
            &gt; OPEN_SOURCE_LICENSES.txt
          </p>
          <p className="text-gray-300 leading-relaxed">
            This platform is built with amazing open source software
          </p>
          <div className="mt-4 text-xs text-gray-500 font-mono">
            LAST_MODIFIED: 2024-11-26 | CLASSIFICATION: PUBLIC
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="border-t border-dashed border-gray-700 my-8" />

        {/* Acknowledgments */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
            // SECTION_1.0_ACKNOWLEDGMENTS
          </h2>
          <div className="text-gray-300 space-y-3 leading-relaxed">
            <p>
              We are grateful to the open source community for creating and maintaining the incredible libraries and tools that power this platform. Below is a list of the major open source dependencies we use, along with their respective licenses.
            </p>
            <p className="text-sm">
              All third-party software is used in accordance with their respective licenses. For complete license texts and additional dependencies, please refer to the package.json file in our repository.
            </p>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-700 my-8" />

        {/* License List */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-6">
            // SECTION_2.0_THIRD_PARTY_LIBRARIES
          </h2>

          {openSourceLicenses.map((lib, index) => (
            <div key={index}>
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-white font-mono">
                    &gt; {lib.name}
                  </h3>
                  <span className="px-3 py-1 bg-[#252525] border border-gray-700 rounded text-gray-400 text-xs font-mono">
                    {lib.version}
                  </span>
                  <span className="px-3 py-1 bg-[#252525] border border-gray-700 rounded text-[#ea5c2a] text-xs font-mono flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {lib.license}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  {lib.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 font-mono">
                  <span>by {lib.author}</span>
                  <a 
                    href={lib.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#ea5c2a] hover:text-[#ea5c2a]/80 transition-colors"
                  >
                    Visit Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              
              {index < openSourceLicenses.length - 1 && (
                <div className="border-t border-dashed border-gray-700 my-6" />
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-700 my-8" />

        {/* License Types */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-6">
            // SECTION_3.0_LICENSE_TYPES
          </h2>

          <div>
            <h3 className="text-lg font-bold text-white font-mono mb-2">
              &gt; MIT_LICENSE
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              A permissive license that allows commercial use, modification, distribution, and private use. It requires preservation of copyright and license notices.
            </p>
          </div>

          <div className="border-t border-dashed border-gray-700 my-6" />

          <div>
            <h3 className="text-lg font-bold text-white font-mono mb-2">
              &gt; APACHE_2.0_LICENSE
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              A permissive license similar to MIT but also provides an express grant of patent rights from contributors to users.
            </p>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-700 my-8" />

        {/* Footer Note */}
        <div>
          <h2 className="text-2xl font-bold text-[#ea5c2a] font-mono mb-4">
            // SECTION_4.0_COMPLETE_LICENSE_INFO
          </h2>
          <div className="text-gray-300 space-y-3 leading-relaxed">
            <p>
              This page lists the major open source dependencies. For a complete list of all dependencies and their licenses, including transitive dependencies, please refer to the <code className="px-2 py-1 bg-[#252525] rounded text-[#ea5c2a] text-xs font-mono">package.json</code> and <code className="px-2 py-1 bg-[#252525] rounded text-[#ea5c2a] text-xs font-mono">pnpm-lock.yaml</code> files in our repository.
            </p>
            <p className="text-xs text-gray-500">
              All trademarks and registered trademarks are the property of their respective owners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
