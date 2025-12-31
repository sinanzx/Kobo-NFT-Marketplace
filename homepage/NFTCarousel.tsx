import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const featuredNFTs = [
  {
    id: 1,
    tokenId: '#8024',
    title: 'KOBO #8024',
    collection: 'KOBO PRIME',
    price: '0.5 ETH',
    rarity: 'UNCOMMON',
    lastSale: '$450',
    rarityScore: 'Top 5%',
    image: 'https://robohash.org/kobo8024.png?set=set1&size=400x400',
  },
  {
    id: 2,
    tokenId: '#7891',
    title: 'KOBO #7891',
    collection: 'KOBO PRIME',
    price: '0.8 ETH',
    rarity: 'RARE',
    lastSale: '$720',
    rarityScore: 'Top 3%',
    image: 'https://robohash.org/kobo7891.png?set=set1&size=400x400',
  },
  {
    id: 3,
    tokenId: '#9102',
    title: 'KOBO #9102',
    collection: 'KOBO PRIME',
    price: '1.2 ETH',
    rarity: 'LEGENDARY',
    lastSale: '$1080',
    rarityScore: 'Top 1%',
    image: 'https://robohash.org/kobo9102.png?set=set1&size=400x400',
  },
  {
    id: 4,
    tokenId: '#6543',
    title: 'KOBO #6543',
    collection: 'KOBO PRIME',
    price: '0.6 ETH',
    rarity: 'UNCOMMON',
    lastSale: '$540',
    rarityScore: 'Top 8%',
    image: 'https://robohash.org/kobo6543.png?set=set1&size=400x400',
  },
  {
    id: 5,
    tokenId: '#8765',
    title: 'KOBO #8765',
    collection: 'KOBO PRIME',
    price: '0.9 ETH',
    rarity: 'RARE',
    lastSale: '$810',
    rarityScore: 'Top 4%',
    image: 'https://robohash.org/kobo8765.png?set=set1&size=400x400',
  },
  {
    id: 6,
    tokenId: '#7234',
    title: 'KOBO #7234',
    collection: 'KOBO PRIME',
    price: '1.1 ETH',
    rarity: 'LEGENDARY',
    lastSale: '$990',
    rarityScore: 'Top 2%',
    image: 'https://robohash.org/kobo7234.png?set=set1&size=400x400',
  },
];

export function NFTCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });
  const autoPlayRef = useRef<number | null>(null);
  const centerCardRef = useRef<HTMLDivElement>(null);

  // Create circular buffer by tripling the array
  const circularNFTs = [...featuredNFTs, ...featuredNFTs, ...featuredNFTs];
  const totalItems = featuredNFTs.length;

  // Auto-rotation logic
  useEffect(() => {
    if (!isHovered) {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => prev + 1);
      }, 3000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered]);

  // Reset to middle section when reaching end to create infinite effect
  useEffect(() => {
    if (activeIndex >= totalItems * 2) {
      setTimeout(() => {
        setActiveIndex(totalItems);
      }, 500);
    }
  }, [activeIndex, totalItems]);

  // Holographic tilt effect for center card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!centerCardRef.current) return;
    
    const card = centerCardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateY = (mouseX / rect.width) * 20; // Max 20deg rotation
    const rotateX = -(mouseY / rect.height) * 20; // Inverted for natural feel
    
    setTiltStyle({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTiltStyle({ rotateX: 0, rotateY: 0 });
  };

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const isActive = diff === 0;
    
    // Hide cards too far away
    if (Math.abs(diff) > 3) {
      return {
        transform: 'translateX(0) scale(0) rotateY(0deg) translateZ(-500px)',
        zIndex: 0,
        opacity: 0,
        filter: 'brightness(0)',
        pointerEvents: 'none' as const,
      };
    }
    
    if (isActive) {
      // Apply holographic tilt to center card
      return {
        transform: `perspective(1000px) scale(1.15) rotateX(${tiltStyle.rotateX}deg) rotateY(${tiltStyle.rotateY}deg) translateZ(0px)`,
        zIndex: 10,
        opacity: 1,
        filter: 'brightness(1.1)',
        pointerEvents: 'auto' as const,
      };
    }
    
    if (diff < 0) {
      // Left side cards - more stacked
      return {
        transform: `translateX(${diff * 25}%) scale(${0.75 - Math.abs(diff) * 0.12}) rotateY(30deg) translateZ(-${Math.abs(diff) * 80}px)`,
        zIndex: 10 - Math.abs(diff),
        opacity: Math.max(0.2, 0.4 - Math.abs(diff) * 0.15),
        filter: 'brightness(0.5)',
        pointerEvents: 'auto' as const,
      };
    } else {
      // Right side cards - more stacked
      return {
        transform: `translateX(${diff * 25}%) scale(${0.75 - Math.abs(diff) * 0.12}) rotateY(-30deg) translateZ(-${Math.abs(diff) * 80}px)`,
        zIndex: 10 - Math.abs(diff),
        opacity: Math.max(0.2, 0.4 - Math.abs(diff) * 0.15),
        filter: 'brightness(0.5)',
        pointerEvents: 'auto' as const,
      };
    }
  };

  return (
    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Pulse Animation Keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div className="container relative z-10 px-4 mx-auto">
        {/* Section Header - Left Aligned with Live Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-6xl mx-auto"
        >
          <div className="flex items-center gap-3">
            {/* Live Status Indicator */}
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 10px #22c55e',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            
            <h2 
              className="text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: "'Courier New', monospace",
                color: '#ea5c2a',
                letterSpacing: '2px',
                fontWeight: 700,
              }}
            >
              // RECENTLY_FORGED_ASSETS
            </h2>
          </div>
        </motion.div>

        {/* 3D Cover Flow Carousel */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            perspective: '1000px',
            perspectiveOrigin: 'center center',
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {circularNFTs.map((nft, index) => {
              const isActive = index === activeIndex;
              const cardStyle = getCardStyle(index);
              
              return (
                <motion.div
                  key={`${nft.id}-${index}`}
                  ref={isActive ? centerCardRef : null}
                  onClick={() => setActiveIndex(index)}
                  onMouseMove={isActive ? handleMouseMove : undefined}
                  onMouseLeave={isActive ? handleMouseLeave : undefined}
                  animate={cardStyle}
                  transition={{ 
                    duration: 0.6, 
                    ease: [0.34, 1.56, 0.64, 1],
                    rotateX: { duration: 0.3, ease: 'easeOut' },
                    rotateY: { duration: 0.3, ease: 'easeOut' },
                  }}
                  className="absolute cursor-pointer"
                  style={{
                    width: '320px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Card Container with Reflection */}
                  <div
                    style={{
                      position: 'relative',
                      WebkitBoxReflect: 'below 10px linear-gradient(transparent 60%, rgba(0, 0, 0, 0.5))',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#1e1e1e',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: isActive ? '2px solid #ea5c2a' : '2px solid transparent',
                        boxShadow: isActive 
                          ? '0 0 30px rgba(234, 92, 42, 0.6), 0 20px 60px rgba(0, 0, 0, 0.8)' 
                          : '0 10px 40px rgba(0, 0, 0, 0.6)',
                        transition: 'all 0.5s ease',
                      }}
                    >
                      {/* Image Container */}
                      <div 
                        className="relative" 
                        style={{ 
                          height: '320px',
                          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        <img
                          src={nft.image}
                          alt={nft.title}
                          className="w-full h-full"
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center',
                          }}
                        />
                        
                        {/* Rarity Badge - Top Center */}
                        <div
                          className="absolute top-4 left-1/2 -translate-x-1/2"
                          style={{
                            backgroundColor: '#ea5c2a',
                            borderRadius: '20px',
                            padding: '6px 16px',
                            fontFamily: "'Courier New', monospace",
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            letterSpacing: '1px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                          }}
                        >
                          {nft.rarity}
                        </div>

                        {/* Network Icon - Top Right */}
                        <div
                          className="absolute top-4 right-4"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(234, 92, 42, 0.5)',
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ea5c2a">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                        </div>

                        {/* Price Tag - Bottom Center */}
                        <div
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '20px',
                            padding: '8px 20px',
                            fontFamily: "'Courier New', monospace",
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            letterSpacing: '0.5px',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {nft.price}
                        </div>
                      </div>

                      {/* Data Panel */}
                      <div className="p-6 pt-8">
                        {/* Title */}
                        <h3
                          style={{
                            fontFamily: "'Bruno Ace SC', cursive",
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            marginBottom: '8px',
                            letterSpacing: '1px',
                          }}
                        >
                          {nft.title}
                        </h3>

                        {/* Collection with Checkmark */}
                        <div className="flex items-center gap-2 mb-4">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ea5c2a">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          <span
                            style={{
                              fontFamily: "'Courier New', monospace",
                              fontSize: '0.8rem',
                              color: '#999999',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {nft.collection}
                          </span>
                        </div>

                        {/* Stats Grid */}
                        <div
                          className="grid grid-cols-2 gap-3 p-3 rounded-lg"
                          style={{
                            backgroundColor: '#0a0a0a',
                            border: '1px solid #2a2a2a',
                          }}
                        >
                          {/* Last Sale */}
                          <div>
                            <div
                              style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.65rem',
                                color: '#666666',
                                marginBottom: '4px',
                                letterSpacing: '0.5px',
                              }}
                            >
                              Last Sale
                            </div>
                            <div
                              style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.85rem',
                                color: '#ffffff',
                                fontWeight: 700,
                              }}
                            >
                              {nft.lastSale}
                            </div>
                          </div>

                          {/* Rarity Score */}
                          <div>
                            <div
                              style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.65rem',
                                color: '#666666',
                                marginBottom: '4px',
                                letterSpacing: '0.5px',
                              }}
                            >
                              Rarity Score
                            </div>
                            <div
                              style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.85rem',
                                color: '#ea5c2a',
                                fontWeight: 700,
                              }}
                            >
                              {nft.rarityScore}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>


      </div>
    </section>
  );
}
