import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  onLoad?: () => void;
}

export const ProgressiveImage = ({
  src,
  alt,
  className,
  placeholderSrc,
  onLoad,
}: ProgressiveImageProps) => {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
      onLoad?.();
    };
  }, [src, onLoad]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.img
        src={imgSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover',
          isLoading && 'blur-sm scale-105'
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse" />
      )}
    </div>
  );
};

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  threshold?: number;
}

export const LazyImage = ({
  src,
  alt,
  className,
  threshold = 0.1,
}: LazyImageProps) => {
  const [isInView, setIsInView] = useState(false);
  const [imgRef, setImgRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!imgRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(imgRef);

    return () => observer.disconnect();
  }, [imgRef, threshold]);

  return (
    <div ref={setImgRef} className={className}>
      {isInView ? (
        <ProgressiveImage src={src} alt={alt} className="w-full h-full" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse" />
      )}
    </div>
  );
};
