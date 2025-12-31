import { motion } from 'framer-motion';

/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts to main content areas
 * Visible only when focused for screen reader and keyboard users
 */
export function SkipLinks() {
  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#footer', label: 'Skip to footer' },
  ];

  return (
    <div className="sr-only focus-within:not-sr-only">
      <nav aria-label="Skip links" className="fixed top-0 left-0 z-[100] bg-primary text-primary-foreground p-2 flex gap-2">
        {skipLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="px-4 py-2 bg-background text-foreground rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-accent transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
