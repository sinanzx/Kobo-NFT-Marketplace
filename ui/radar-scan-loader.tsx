import { motion } from 'framer-motion';

interface RadarScanLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RadarScanLoader({ size = 'md', className = '' }: RadarScanLoaderProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const dotSize = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-[#ea5c2a]/30" />
      
      {/* Middle ring */}
      <div className="absolute inset-[15%] rounded-full border border-[#ea5c2a]/20" />
      
      {/* Inner ring */}
      <div className="absolute inset-[30%] rounded-full border border-[#ea5c2a]/10" />
      
      {/* Rotating scan line */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left bg-gradient-to-r from-[#ea5c2a] to-transparent" />
      </motion.div>
      
      {/* Blip dots */}
      <motion.div
        className={`absolute top-[25%] left-[25%] ${dotSize[size]} rounded-full bg-[#ea5c2a]`}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0
        }}
      />
      <motion.div
        className={`absolute top-[35%] right-[30%] ${dotSize[size]} rounded-full bg-[#ea5c2a]`}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5
        }}
      />
      <motion.div
        className={`absolute bottom-[30%] left-[40%] ${dotSize[size]} rounded-full bg-[#ea5c2a]`}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      />
      
      {/* Center dot */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${dotSize[size]} rounded-full bg-[#ea5c2a]`} />
    </div>
  );
}
