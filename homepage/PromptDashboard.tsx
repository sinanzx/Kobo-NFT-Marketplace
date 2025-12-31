import { motion } from 'framer-motion';
import { useState } from 'react';
import { Sparkles, TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SciFiKeyboard } from '@/components/ui/sci-fi-keyboard';

const trendingPrompts = [
  {
    text: 'Cyberpunk samurai in neon-lit Tokyo',
    category: 'Image',
    uses: 1247,
    trending: true,
  },
  {
    text: 'Abstract liquid metal flowing through space',
    category: 'Video',
    uses: 892,
    trending: true,
  },
  {
    text: 'Epic orchestral soundtrack with Japanese instruments',
    category: 'Audio',
    uses: 756,
    trending: false,
  },
  {
    text: 'Futuristic glass architecture in a forest',
    category: 'Image',
    uses: 634,
    trending: true,
  },
  {
    text: 'Ambient electronic music with nature sounds',
    category: 'Audio',
    uses: 521,
    trending: false,
  },
  {
    text: 'Time-lapse of blooming digital flowers',
    category: 'Video',
    uses: 489,
    trending: false,
  },
];

const suggestions = [
  'A mystical portal opening in ancient ruins',
  'Holographic butterflies in a digital garden',
  'Steampunk airship sailing through clouds',
  'Bioluminescent creatures in deep ocean',
  'Crystal formations growing in zero gravity',
];

export function PromptDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [promptInput, setPromptInput] = useState('');

  const categories = ['All', 'Image', 'Video', 'Audio'];

  const filteredPrompts = selectedCategory === 'All' 
    ? trendingPrompts 
    : trendingPrompts.filter(p => p.category === selectedCategory);

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Community Favorites</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Prompt Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover trending prompts and get inspired by what the community is creating
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sci-Fi Prompt Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 mb-8"
          >
            <SciFiKeyboard
              value={promptInput}
              onChange={setPromptInput}
              placeholder="Enter your creative vision... (e.g., 'A cyberpunk samurai in neon-lit Tokyo')"
              suggestions={suggestions}
              trendingPrompts={trendingPrompts}
              onSuggestionSelect={(suggestion) => {
                setPromptInput(suggestion);
                console.log('Selected:', suggestion);
              }}
            />
          </motion.div>

          {/* Trending Prompts */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex gap-2 mb-6 overflow-x-auto pb-2"
            >
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category 
                      ? 'shadow-lg shadow-primary/25' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </motion.div>

            {/* Prompt Cards */}
            <div className="space-y-4">
              {filteredPrompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="group p-6 border-border/40 hover:border-primary/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {prompt.category}
                          </Badge>
                          {prompt.trending && (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <TrendingUp className="w-3 h-3" />
                              <span>Trending</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-base font-medium mb-3 group-hover:text-primary transition-colors leading-relaxed">
                          "{prompt.text}"
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>{prompt.uses.toLocaleString()} uses</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Last used 2h ago</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                      >
                        Try It
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Auto-Suggest Sidebar */}
          <div className="space-y-6">
            {/* Quick Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">Quick Suggestions</h3>
                </div>

                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group p-3 rounded-lg bg-muted/30 hover:bg-primary/10 border border-transparent hover:border-primary/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-primary/5"
                    >
                      <p className="text-sm group-hover:text-primary transition-colors">
                        {suggestion}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <Button className="w-full mt-6 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300" variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate More Ideas
                </Button>
              </Card>
            </motion.div>

            {/* Prompt Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6 border-border/40 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-4 text-foreground">Pro Tips</h3>
                <ul className="space-y-3 text-sm text-muted-foreground/90">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Be specific with details and style preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Use descriptive adjectives for better results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Mention lighting, mood, and atmosphere</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Reference art styles or artists for inspiration</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
