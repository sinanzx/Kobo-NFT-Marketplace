import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export function Hero() {
  const navigate = useNavigate();

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20"
      aria-labelledby="hero-heading"
    >
      {/* Solid Industrial Charcoal Background */}
      <div className="absolute inset-0 bg-[#1e1e1e]" />



      {/* Technical Blueprint Dotted Grid */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.05
        }}
      />

      {/* Centered Monolith Layout */}
      <div className="container relative px-6 md:px-12 mx-auto" style={{ zIndex: 10 }}>
        <div className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto">
          
          {/* Content Wrapper - No Box, Just Floating Typography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full"
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
            }}
          >
            {/* Barcode Serial Number Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-4"
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '0.85rem',
                color: '#ea5c2a',
                letterSpacing: '1px',
                fontWeight: 600,
              }}
            >
              // SYS.ID: K-084 //
            </motion.div>

            {/* Massive Centered Headline - Hard Block Shadow */}
            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-8 uppercase"
              style={{
                fontFamily: "'Bruno Ace SC', cursive",
                fontWeight: 400,
                fontSize: 'clamp(4rem, 12vw, 6rem)',
                lineHeight: 1.05,
                letterSpacing: '4px',
                fontStyle: 'normal',
                color: '#fcfaff',
                textShadow: '4px 4px 0px #ea5c2a',
                textTransform: 'uppercase',
              }}
            >
              FORGE UNIQUE NFTs
            </motion.h1>

            {/* Subtext - Subtle and Minimal */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl mb-16 max-w-2xl mx-auto leading-relaxed"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Create AI-powered NFTs with provenance tracking and social features. 
              Unleash creator uniqueness.
            </motion.p>

            {/* High-Voltage Button - Glowing Cyan Border with Inner Glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center"
            >
            <Button
              size="lg"
              onClick={() => navigate('/create')}
              className="group relative overflow-hidden transition-all duration-300"
              style={{
                background: '#ea5c2a',
                border: '2px solid #ea5c2a',
                padding: '15px 40px',
                borderRadius: '0px',
                clipPath: 'polygon(0 0, 90% 0, 100% 30%, 100% 100%, 0 100%)',
                color: '#000000',
                fontFamily: "'Bruno Ace SC', cursive",
                fontWeight: 400,
                letterSpacing: '2px',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#ea5c2a';
                e.currentTarget.style.border = '2px solid #ea5c2a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ea5c2a';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.border = '2px solid #ea5c2a';
              }}
              data-tour="create-button"
              aria-label="Start creating AI-powered NFTs"
            >
              <span className="relative z-10 flex items-center gap-2" style={{
                borderLeft: '2px solid currentColor',
                borderRight: '2px solid currentColor',
                paddingLeft: '12px',
                paddingRight: '12px',
              }}>
                START CREATING
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </motion.div>
          </motion.div>

        </div>
      </div>


    </section>
  );
}
