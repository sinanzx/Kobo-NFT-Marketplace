import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SciFiKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  trendingPrompts?: Array<{
    text: string;
    category: string;
    uses: number;
  }>;
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
}

export function SciFiKeyboard({
  value,
  onChange,
  placeholder = 'Describe your vision...',
  suggestions = [],
  trendingPrompts = [],
  onSuggestionSelect,
  className,
}: SciFiKeyboardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-rotate trending carousel
  useEffect(() => {
    if (trendingPrompts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % trendingPrompts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [trendingPrompts.length]);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 5);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Show suggestions on Ctrl+Space
    if (e.ctrlKey && e.key === ' ') {
      e.preventDefault();
      setShowSuggestions(!showSuggestions);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Main Input Container */}
      <motion.div
        className={cn(
          'relative rounded-2xl border-2 backdrop-blur-xl transition-all duration-300',
          isFocused
            ? 'border-primary/60 bg-background/80 shadow-[0_0_30px_rgba(120,119,198,0.25)]'
            : 'border-border/50 bg-background/60 shadow-[0_0_15px_rgba(120,119,198,0.1)]'
        )}
        animate={{
          boxShadow: isFocused
            ? [
                '0 0 30px rgba(120, 119, 198, 0.25)',
                '0 0 40px rgba(120, 119, 198, 0.35)',
                '0 0 30px rgba(120, 119, 198, 0.25)',
              ]
            : '0 0 15px rgba(120, 119, 198, 0.1)',
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Glowing corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/60 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/60 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/60 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/60 rounded-br-2xl" />

        {/* Scanning line effect */}
        {isFocused && (
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            animate={{
              top: ['0%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={4}
          className={cn(
            'w-full px-6 py-4 bg-transparent text-foreground placeholder-muted-foreground/60',
            'text-base leading-relaxed resize-none outline-none',
            'selection:bg-primary/20'
          )}
          style={{
            textShadow: isFocused ? '0 0 8px rgba(120, 119, 198, 0.3)' : 'none',
          }}
        />

        {/* Character count & shortcuts */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
            <span>{value.length} characters</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted/50 border border-border/40 rounded text-[10px] text-foreground/80">
                Ctrl
              </kbd>
              +
              <kbd className="px-1.5 py-0.5 bg-muted/50 border border-border/40 rounded text-[10px] text-foreground/80">
                Space
              </kbd>
              <span className="ml-1">for suggestions</span>
            </span>
          </div>
          <motion.button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-3 h-3" />
            Auto-suggest
          </motion.button>
        </div>
      </motion.div>

      {/* Auto-suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-[0_0_30px_rgba(120,119,198,0.2)] overflow-hidden"
          >
            <div className="p-2 border-b border-border/30 flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="w-3 h-3 text-primary" />
              Quick Suggestions
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all border-l-2 border-transparent hover:border-primary"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trending Prompts Carousel */}
      {trendingPrompts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-border/40 bg-background/40 backdrop-blur-md p-4"
        >
          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-primary" />
            Trending Now
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentCarouselIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-foreground/90 mb-2">
                    "{trendingPrompts[currentCarouselIndex].text}"
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary">
                      {trendingPrompts[currentCarouselIndex].category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {trendingPrompts[currentCarouselIndex].uses.toLocaleString()} uses
                    </span>
                  </div>
                </div>
                <motion.button
                  onClick={() => handleSuggestionClick(trendingPrompts[currentCarouselIndex].text)}
                  className="px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-lg text-xs text-primary hover:bg-primary/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try It
                </motion.button>
              </div>

              {/* Carousel indicators */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                {trendingPrompts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCarouselIndex(index)}
                    className={cn(
                      'h-1 rounded-full transition-all',
                      index === currentCarouselIndex
                        ? 'w-6 bg-primary'
                        : 'w-1.5 bg-primary/30 hover:bg-primary/50'
                    )}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
