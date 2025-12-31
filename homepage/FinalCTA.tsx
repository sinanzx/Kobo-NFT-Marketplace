import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section 
      className="relative py-32 overflow-hidden"
      style={{ backgroundColor: '#ea5c2a' }}
    >
      <div className="container relative z-10 px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 
            className="text-5xl md:text-7xl font-bold mb-12"
            style={{
              fontFamily: "'Bruno Ace SC', cursive",
              color: '#000000',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            READY TO FORGE?
          </h2>

          <Button
            size="lg"
            onClick={() => navigate('/create')}
            className="group relative overflow-hidden transition-all duration-300"
            style={{
              background: '#000000',
              border: '2px solid #000000',
              padding: '20px 60px',
              borderRadius: '0px',
              clipPath: 'polygon(0 0, 90% 0, 100% 30%, 100% 100%, 0 100%)',
              color: '#ea5c2a',
              fontFamily: "'Bruno Ace SC', cursive",
              fontWeight: 400,
              letterSpacing: '2px',
              fontSize: '1.1rem',
              textTransform: 'uppercase',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1e1e1e';
              e.currentTarget.style.border = '2px solid #000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#000000';
              e.currentTarget.style.border = '2px solid #000000';
            }}
            aria-label="Start creating AI-powered NFTs"
          >
            <span className="relative z-10 flex items-center gap-3" style={{
              borderLeft: '2px solid currentColor',
              borderRight: '2px solid currentColor',
              paddingLeft: '16px',
              paddingRight: '16px',
            }}>
              START CREATING
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
