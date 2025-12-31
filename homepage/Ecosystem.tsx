import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Swords, Box, Scale, Handshake } from 'lucide-react';

const ecosystemModules = [
  {
    id: 'MOD_01',
    title: 'NFT Battles',
    description: 'Competitive gameplay. Stake assets and win yield.',
    icon: Swords,
    link: '/battles',
    size: 'large', // Takes 2 rows on left
  },
  {
    id: 'MOD_02',
    title: 'AR Viewer',
    description: 'Visualize assets in real-world augmented reality.',
    icon: Box,
    link: '/ar-viewer',
    size: 'medium', // Top right
  },
  {
    id: 'MOD_03',
    title: 'DAO Governance',
    description: 'Community-led protocol control.',
    icon: Scale,
    link: '/dao',
    size: 'medium', // Bottom right
  },
  {
    id: 'MOD_04',
    title: 'Collab & Gifts',
    description: 'Social minting and community rewards.',
    icon: Handshake,
    link: '/collaborations',
    size: 'wide', // Full width bottom
  },
];

export function Ecosystem() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>
      <div className="container relative z-10 px-4 mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Barcode Label */}
          <div
            className="mb-4"
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '0.85rem',
              color: '#ea5c2a',
              letterSpacing: '1px',
              fontWeight: 600,
            }}
          >
            // SYSTEM_MODULES //
          </div>

          <h2 
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: "'Bruno Ace SC', cursive",
              color: '#fcfaff',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            The Ecosystem
          </h2>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Large Card - NFT Battles (Left, spans 2 rows) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:row-span-2"
            >
              <Link to={ecosystemModules[0].link}>
                <div
                  className="group relative h-full p-8 transition-all duration-300 hover:border-[#ea5c2a]"
                  style={{
                    backgroundColor: '#252525',
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    minHeight: '400px',
                  }}
                >
                  {/* Module ID */}
                  <div
                    className="mb-4"
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '0.7rem',
                      color: '#ea5c2a',
                      letterSpacing: '1px',
                      fontWeight: 600,
                    }}
                  >
                    [{ecosystemModules[0].id}]
                  </div>

                  {/* Icon */}
                  <div className="mb-6">
                    {(() => {
                      const IconComponent = ecosystemModules[0].icon;
                      return <IconComponent size={64} style={{ color: '#ea5c2a' }} strokeWidth={1.5} />;
                    })()}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{
                      fontFamily: "'Bruno Ace SC', cursive",
                      color: '#fcfaff',
                      letterSpacing: '1px',
                    }}
                  >
                    {ecosystemModules[0].title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-base md:text-lg"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      color: '#d1d1d1',
                      lineHeight: '1.6',
                    }}
                  >
                    {ecosystemModules[0].description}
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Medium Card - AR Viewer (Top Right) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link to={ecosystemModules[1].link}>
                <div
                  className="group relative h-full p-8 transition-all duration-300 hover:border-[#ea5c2a]"
                  style={{
                    backgroundColor: '#252525',
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    minHeight: '190px',
                  }}
                >
                  {/* Module ID */}
                  <div
                    className="mb-3"
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '0.7rem',
                      color: '#ea5c2a',
                      letterSpacing: '1px',
                      fontWeight: 600,
                    }}
                  >
                    [{ecosystemModules[1].id}]
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    {(() => {
                      const IconComponent = ecosystemModules[1].icon;
                      return <IconComponent size={48} style={{ color: '#ea5c2a' }} strokeWidth={1.5} />;
                    })()}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl md:text-2xl font-bold mb-3"
                    style={{
                      fontFamily: "'Bruno Ace SC', cursive",
                      color: '#fcfaff',
                      letterSpacing: '1px',
                    }}
                  >
                    {ecosystemModules[1].title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm md:text-base"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      color: '#d1d1d1',
                      lineHeight: '1.6',
                    }}
                  >
                    {ecosystemModules[1].description}
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Medium Card - DAO Governance (Bottom Right) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to={ecosystemModules[2].link}>
                <div
                  className="group relative h-full p-8 transition-all duration-300 hover:border-[#ea5c2a]"
                  style={{
                    backgroundColor: '#252525',
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    minHeight: '190px',
                  }}
                >
                  {/* Module ID */}
                  <div
                    className="mb-3"
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '0.7rem',
                      color: '#ea5c2a',
                      letterSpacing: '1px',
                      fontWeight: 600,
                    }}
                  >
                    [{ecosystemModules[2].id}]
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    {(() => {
                      const IconComponent = ecosystemModules[2].icon;
                      return <IconComponent size={48} style={{ color: '#ea5c2a' }} strokeWidth={1.5} />;
                    })()}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl md:text-2xl font-bold mb-3"
                    style={{
                      fontFamily: "'Bruno Ace SC', cursive",
                      color: '#fcfaff',
                      letterSpacing: '1px',
                    }}
                  >
                    {ecosystemModules[2].title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm md:text-base"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      color: '#d1d1d1',
                      lineHeight: '1.6',
                    }}
                  >
                    {ecosystemModules[2].description}
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Wide Card - Collab & Gifts (Full Width Bottom) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:col-span-2"
            >
              <Link to={ecosystemModules[3].link}>
                <div
                  className="group relative h-full p-8 transition-all duration-300 hover:border-[#ea5c2a]"
                  style={{
                    backgroundColor: '#252525',
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    minHeight: '180px',
                  }}
                >
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {(() => {
                        const IconComponent = ecosystemModules[3].icon;
                        return <IconComponent size={56} style={{ color: '#ea5c2a' }} strokeWidth={1.5} />;
                      })()}
                    </div>

                    <div className="flex-1">
                      {/* Module ID */}
                      <div
                        className="mb-3"
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: '0.7rem',
                          color: '#ea5c2a',
                          letterSpacing: '1px',
                          fontWeight: 600,
                        }}
                      >
                        [{ecosystemModules[3].id}]
                      </div>

                      {/* Title */}
                      <h3
                        className="text-xl md:text-2xl font-bold mb-3"
                        style={{
                          fontFamily: "'Bruno Ace SC', cursive",
                          color: '#fcfaff',
                          letterSpacing: '1px',
                        }}
                      >
                        {ecosystemModules[3].title}
                      </h3>

                      {/* Description */}
                      <p
                        className="text-sm md:text-base"
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          color: '#d1d1d1',
                          lineHeight: '1.6',
                        }}
                      >
                        {ecosystemModules[3].description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
