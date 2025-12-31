import { motion } from 'framer-motion';
import { Sparkles, Eye, Hammer, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Sparkles,
    title: 'GENERATE_OR_UPLOAD',
    description: 'Synthesize new assets using our AI models or upload existing high-res media files directly to the forge.',
    color: 'from-blue-500 to-cyan-500',
    delay: 0.2,
  },
  {
    icon: Eye,
    title: 'VALIDATE_METADATA',
    description: 'Inspect asset details. Regenerate AI outputs if needed, or lock in metadata attributes for uploaded files before hashing.',
    color: 'from-purple-500 to-pink-500',
    delay: 0.4,
  },
  {
    icon: Hammer,
    title: 'ON_CHAIN_MINT',
    description: 'Execute the mint transaction. Permanently inscribe ownership and provenance history on the blockchain.',
    color: 'from-orange-500 to-red-500',
    delay: 0.6,
  },
  {
    icon: Rocket,
    title: 'TRADE_&_DECOMPOSE',
    description: 'List the complete asset or break it down to sell individual traits on our liquidity layer.',
    color: 'from-green-500 to-emerald-500',
    delay: 0.8,
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Animated Gradient Keyframes */}
      <style>{`
        @keyframes flowGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes dataFlow {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(400%); opacity: 0; }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
      
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
            // PROCESS_VIEW //
          </div>

          <h2 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: "'Bruno Ace SC', cursive",
              color: '#fcfaff',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            How It Works
          </h2>
          <p 
            className="text-xl max-w-2xl mx-auto"
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            Four simple steps to create and own your unique AI-powered NFT
          </p>
        </motion.div>

        {/* High-Voltage Cable - Glowing Pipeline */}
        <div className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2 z-0">
          {/* Main Cable */}
          <div 
            className="w-full h-2"
            style={{
              background: '#ea5c2a',
              boxShadow: '0 0 15px #ea5c2a, 0 0 30px rgba(234, 92, 42, 0.5)',
              position: 'relative'
            }}
          >
            {/* Data Flow Animation - White Light Dash */}
            <div
              style={{
                position: 'absolute',
                top: '-2px',
                left: 0,
                width: '60px',
                height: '6px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent)',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                animation: 'dataFlow 3s ease-in-out infinite',
                borderRadius: '2px'
              }}
            />
          </div>
        </div>

        {/* Industrial Gauges - Power Nodes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
          {steps.map((step, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: step.delay }}
                className="relative flex flex-col items-center"
              >
                {/* Industrial Gauge Node */}
                <div className="relative mb-6">
                  {/* Floating Stencil Number - Top Right */}
                  <motion.div
                    className="absolute -top-4 -right-4 z-20"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: step.delay + 0.2 }}
                    style={{
                      fontFamily: "'Bruno Ace SC', cursive",
                      fontSize: '3rem',
                      fontWeight: 700,
                      color: '#ea5c2a',
                      textShadow: '0 0 20px rgba(234, 92, 42, 0.6)',
                      lineHeight: 1
                    }}
                  >
                    {index + 1}
                  </motion.div>

                  {/* Main Gauge Circle */}
                  <motion.div
                    className="relative flex items-center justify-center group"
                    style={{
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      background: '#000000',
                      border: '3px solid #ea5c2a',
                      boxShadow: '0 0 0 rgba(234, 92, 42, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.8)'
                    }}
                    whileHover={{ 
                      boxShadow: '0 0 30px rgba(234, 92, 42, 0.8), inset 0 0 30px rgba(234, 92, 42, 0.2)'
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {/* Icon with Pulse on Hover */}
                    <motion.div
                      whileHover={{ animation: 'iconPulse 0.6s ease-in-out infinite' }}
                    >
                      <step.icon 
                        className="w-14 h-14" 
                        style={{
                          color: '#ea5c2a',
                          filter: 'drop-shadow(0 0 8px rgba(234, 92, 42, 0.6))'
                        }}
                      />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Typography */}
                <div className="text-center mt-6">
                  {/* Technical Label */}
                  <div
                    className="mb-2"
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '0.75rem',
                      color: '#ea5c2a',
                      letterSpacing: '1px',
                      fontWeight: 600
                    }}
                  >
                    // PHASE_0{index + 1}
                  </div>

                  <h3 
                    className="mb-3"
                    style={{
                      fontFamily: "'Bruno Ace SC', cursive",
                      fontWeight: 400,
                      fontSize: '1.25rem',
                      color: '#fcfaff',
                      letterSpacing: '1px'
                    }}
                  >
                    {step.title}
                  </h3>
                  <p 
                    className="leading-relaxed max-w-[240px]"
                    style={{ 
                      fontSize: '0.95rem',
                      color: '#999999'
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-6">
            Ready to create your first NFT?
          </p>
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-medium">Get Started Now</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
