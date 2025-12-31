import { motion } from 'framer-motion';

const specifications = [
  {
    label: 'STORAGE_ENGINE',
    value: 'Enumerable Mappings',
    sub: 'O(1) Gas Efficient Lookups',
  },
  {
    label: 'DATA_LAYER',
    value: 'Graph Subgraph',
    sub: 'Instant Event Querying',
  },
  {
    label: 'MARKET_LOGIC',
    value: 'ERC-2981 Royalties',
    sub: 'Enforced Creator Payouts',
  },
  {
    label: 'PROTECTION',
    value: 'NetworkGuard Active',
    sub: 'Auto-Chain Verification',
  },
];

export function ProtocolSpecs() {
  return (
    <section 
      className="relative py-8 overflow-hidden"
      style={{
        backgroundColor: '#151515',
        borderTop: '1px solid #ea5c2a',
        borderBottom: '1px solid #ea5c2a',
      }}
    >
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Horizontal Row of Data Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {specifications.map((spec, index) => (
              <motion.div
                key={spec.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center lg:text-left"
              >
                {/* Label */}
                <div
                  className="mb-2"
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.75rem',
                    color: '#ea5c2a',
                    letterSpacing: '1px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {spec.label}
                </div>

                {/* Value */}
                <div
                  className="mb-1"
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.95rem',
                    color: '#ea5c2a',
                    letterSpacing: '0.5px',
                    fontWeight: 700,
                  }}
                >
                  {spec.value}
                </div>

                {/* Sub */}
                <div
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.7rem',
                    color: '#ea5c2a',
                    letterSpacing: '0.5px',
                    fontWeight: 400,
                    opacity: 0.8,
                  }}
                >
                  {spec.sub}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
