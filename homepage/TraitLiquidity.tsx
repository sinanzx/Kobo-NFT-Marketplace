import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layers, Sparkles, Zap } from 'lucide-react';

export function TraitLiquidity() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Visual Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Abstract NFT Decomposition Illustration */}
              <div className="relative h-[400px] flex items-center justify-center">
                {/* Center NFT Frame */}
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute z-10"
                  style={{
                    width: '180px',
                    height: '180px',
                    backgroundColor: '#252525',
                    border: '2px solid #ea5c2a',
                    borderRadius: '12px',
                    boxShadow: '0 0 40px rgba(234, 92, 42, 0.3)',
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers size={64} style={{ color: '#ea5c2a' }} strokeWidth={1.5} />
                  </div>
                </motion.div>

                {/* Exploding Trait Pieces */}
                {/* Top Right - Background Trait */}
                <motion.div
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ 
                    x: [0, 120, 120],
                    y: [0, -80, -80],
                    opacity: [0, 1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeOut"
                  }}
                  className="absolute"
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #ea5c2a',
                    borderRadius: '8px',
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <Sparkles size={32} style={{ color: '#ea5c2a' }} strokeWidth={1.5} />
                    <span
                      className="mt-2 text-xs"
                      style={{
                        fontFamily: "'Courier New', monospace",
                        color: '#fcfaff',
                        fontSize: '0.65rem',
                      }}
                    >
                      BACKGROUND
                    </span>
                  </div>
                </motion.div>

                {/* Bottom Left - Body Trait */}
                <motion.div
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ 
                    x: [0, -120, -120],
                    y: [0, 80, 80],
                    opacity: [0, 1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeOut",
                    delay: 0.2
                  }}
                  className="absolute"
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #ea5c2a',
                    borderRadius: '8px',
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <Layers size={32} style={{ color: '#ea5c2a' }} strokeWidth={1.5} />
                    <span
                      className="mt-2 text-xs"
                      style={{
                        fontFamily: "'Courier New', monospace",
                        color: '#fcfaff',
                        fontSize: '0.65rem',
                      }}
                    >
                      BODY
                    </span>
                  </div>
                </motion.div>

                {/* Top Left - Accessory Trait */}
                <motion.div
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ 
                    x: [0, -100, -100],
                    y: [0, -100, -100],
                    opacity: [0, 1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeOut",
                    delay: 0.4
                  }}
                  className="absolute"
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #ea5c2a',
                    borderRadius: '8px',
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <Zap size={32} style={{ color: '#ea5c2a' }} strokeWidth={1.5} />
                    <span
                      className="mt-2 text-xs"
                      style={{
                        fontFamily: "'Courier New', monospace",
                        color: '#fcfaff',
                        fontSize: '0.65rem',
                      }}
                    >
                      ACCESSORY
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Section Label */}
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.85rem',
                  color: '#ea5c2a',
                  letterSpacing: '1px',
                  fontWeight: 600,
                }}
              >
                // TRAIT_LIQUIDITY_LAYER //
              </div>

              {/* Headline */}
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                style={{
                  fontFamily: "'Bruno Ace SC', cursive",
                  color: '#fcfaff',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                LIQUIDITY AT THE ATOMIC LEVEL
              </h2>

              {/* Subtext */}
              <p
                className="text-base md:text-lg leading-relaxed"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  color: '#d1d1d1',
                  lineHeight: '1.8',
                }}
              >
                Don't just trade the asset. Trade the traits. Our granular marketplace enables God-Tier liquidity for individual attributes.
              </p>

              {/* CTA Button */}
              <div className="pt-4">
                <Link to="/trait-marketplace">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 transition-all duration-300"
                    style={{
                      fontFamily: "'Bruno Ace SC', cursive",
                      fontSize: '1rem',
                      color: '#ea5c2a',
                      backgroundColor: 'transparent',
                      border: '2px solid #ea5c2a',
                      borderRadius: '4px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ea5c2a';
                      e.currentTarget.style.color = '#000000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#ea5c2a';
                    }}
                  >
                    Enter Trait Market
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
