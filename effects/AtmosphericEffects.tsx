import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

export function FogLayer() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <motion.div
        className="absolute w-full h-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        }}
        animate={{
          x: ['-10%', '10%'],
          y: ['0%', '-5%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-full h-full"
        style={{
          background: 'radial-gradient(ellipse at 70% 50%, rgba(236, 72, 153, 0.08) 0%, transparent 60%)',
        }}
        animate={{
          x: ['10%', '-10%'],
          y: ['-5%', '5%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

export function LightBeams({ count = 5 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-full w-0.5"
          style={{
            left: `${(i + 1) * (100 / (count + 1))}%`,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scaleY: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

export function ParticleSystem({ count = 20 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 10,
      size: 1 + Math.random() * 2,
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/50"
          style={{
            left: `${particle.x}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          initial={{ y: '100vh', opacity: 0 }}
          animate={{
            y: '-100vh',
            x: [0, 20, -10, 20, 0],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export function GlowOrb({ 
  color = 'purple', 
  size = 'lg',
  position = 'center' 
}: { 
  color?: 'purple' | 'pink' | 'cyan' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const colorMap = {
    purple: 'rgba(139, 92, 246, 0.3)',
    pink: 'rgba(236, 72, 153, 0.3)',
    cyan: 'rgba(6, 182, 212, 0.3)',
    blue: 'rgba(59, 130, 246, 0.3)',
  };

  const sizeMap = {
    sm: '300px',
    md: '500px',
    lg: '800px',
  };

  const positionMap = {
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    'top-left': { top: '0%', left: '0%', transform: 'translate(-50%, -50%)' },
    'top-right': { top: '0%', right: '0%', transform: 'translate(50%, -50%)' },
    'bottom-left': { bottom: '0%', left: '0%', transform: 'translate(-50%, 50%)' },
    'bottom-right': { bottom: '0%', right: '0%', transform: 'translate(50%, 50%)' },
  };

  return (
    <motion.div
      className="absolute pointer-events-none rounded-full blur-3xl"
      style={{
        ...positionMap[position],
        width: sizeMap[size],
        height: sizeMap[size],
        background: `radial-gradient(circle, ${colorMap[color]} 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function GridPattern() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-10"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
  );
}

export function ReflectiveCylinder({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            linear-gradient(90deg,
              rgba(255, 255, 255, 0.05) 0%,
              rgba(255, 255, 255, 0.15) 25%,
              rgba(255, 255, 255, 0.05) 50%,
              rgba(255, 255, 255, 0.15) 75%,
              rgba(255, 255, 255, 0.05) 100%
            )
          `,
          boxShadow: `
            inset -10px 0 20px rgba(0, 0, 0, 0.3),
            inset 10px 0 20px rgba(255, 255, 255, 0.1)
          `,
        }}
      />
    </div>
  );
}

export function MetalShine() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
      }}
      animate={{
        x: ['-200%', '200%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}
