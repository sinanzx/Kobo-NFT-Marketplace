import { motion } from 'framer-motion';
import { Image, Video, Music, Sparkles, Zap, Cpu } from 'lucide-react';


const engines = [
  {
    icon: Image,
    title: 'Image Generation',
    model: 'Stable Diffusion 2.1',
    description: 'Create stunning, high-resolution images from text prompts using state-of-the-art diffusion models.',
    features: ['4K Resolution', 'Style Transfer', 'Negative Prompts', 'Fast Generation'],
    color: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    status: 'Active',
  },
  {
    icon: Video,
    title: 'Video Synthesis',
    model: 'Open-Sora',
    description: 'Generate dynamic video content with AI. Perfect for animated NFTs and motion graphics.',
    features: ['HD Quality', 'Custom Duration', 'Scene Control', 'Smooth Motion'],
    color: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    status: 'Beta',
  },
  {
    icon: Music,
    title: 'Audio Creation',
    model: 'MusicGen',
    description: 'Compose original music and soundscapes. From ambient to electronic, AI creates it all.',
    features: ['Multiple Genres', 'Custom Length', 'High Fidelity', 'Royalty Free'],
    color: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/10 to-red-500/10',
    status: 'Active',
  },
];

export function AIEngineHub() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.1),transparent_50%)]" />
      </div>

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
            // SERVER_RACK_OVERVIEW //
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
            AI Engine Hub
          </h2>
          <p 
            className="text-xl max-w-2xl mx-auto"
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            Choose your creative medium and let cutting-edge AI models bring your vision to life
          </p>
        </motion.div>

        {/* Server Rack Units */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {engines.map((engine, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Server Rack Unit */}
              <motion.div
                className="relative overflow-hidden h-full"
                style={{
                  background: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                }}
                whileHover={{
                  y: -12,
                  borderColor: '#ea5c2a',
                  boxShadow: '0 0 30px rgba(234, 92, 42, 0.6), 0 20px 40px rgba(0, 0, 0, 0.6)'
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Cooling Vents - Striped Texture on Side */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-3"
                  style={{
                    background: 'repeating-linear-gradient(0deg, #1a1a1a 0px, #1a1a1a 3px, #333 3px, #333 6px)',
                  }}
                />

                <div className="relative p-8 pl-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8">
                    {/* Icon */}
                    <motion.div
                      className="relative flex items-center justify-center"
                      style={{
                        width: '70px',
                        height: '70px',
                        border: '2px solid #ea5c2a',
                        borderRadius: '4px',
                        background: '#1a1a1a',
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <engine.icon 
                        className="w-9 h-9" 
                        style={{
                          color: '#ea5c2a',
                        }}
                      />
                    </motion.div>

                    {/* LED Status Light */}
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: engine.status === 'Active' ? '#22c55e' : '#ea5c2a',
                          boxShadow: engine.status === 'Active'
                            ? '0 0 12px #22c55e, 0 0 24px rgba(34, 197, 94, 0.5)'
                            : '0 0 12px #ea5c2a, 0 0 24px rgba(234, 92, 42, 0.5)',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#888',
                          fontFamily: "'Courier New', monospace",
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {engine.status}
                      </span>
                    </div>
                  </div>

                  {/* Typography */}
                  <h3 
                    className="text-xl mb-3"
                    style={{
                      fontFamily: "'Bruno Ace SC', cursive",
                      fontWeight: 400,
                      color: '#fcfaff',
                      letterSpacing: '1px'
                    }}
                  >
                    {engine.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4" style={{ color: '#ea5c2a' }} />
                    <span 
                      style={{
                        fontSize: '0.85rem',
                        color: '#999',
                        fontFamily: "'Courier New', monospace"
                      }}
                    >
                      {engine.model}
                    </span>
                  </div>

                  <p 
                    style={{
                      color: '#999',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      marginBottom: '1.5rem'
                    }}
                  >
                    {engine.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    <div 
                      className="mb-3 flex items-center gap-2"
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: "'Courier New', monospace",
                        color: '#ea5c2a',
                        letterSpacing: '1px',
                        fontWeight: 600
                      }}
                    >
                      <Sparkles className="w-3 h-3" style={{ color: '#ea5c2a' }} />
                      // CAPABILITIES
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {engine.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2 + i * 0.1 }}
                          className="flex items-center gap-2"
                          style={{ fontSize: '0.85rem' }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ea5c2a' }} />
                          <span style={{ color: '#999' }}>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Models Available', value: '15+' },
            { label: 'Avg. Generation Time', value: '~30s' },
            { label: 'Success Rate', value: '99.2%' },
            { label: 'Daily Generations', value: '5K+' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
