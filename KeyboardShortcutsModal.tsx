import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['Alt', 'H'], description: 'Go to homepage' },
  { keys: ['Alt', 'C'], description: 'Go to create page' },
  { keys: ['Alt', 'G'], description: 'Go to gallery' },
  { keys: ['Alt', 'B'], description: 'Go to battles' },
  { keys: ['Alt', 'D'], description: 'Go to dashboard' },
  { keys: ['Ctrl', '/'], description: 'Show this help dialog' },
  { keys: ['Esc'], description: 'Close dialogs and modals' },
  { keys: ['Tab'], description: 'Navigate between interactive elements' },
  { keys: ['Shift', 'Tab'], description: 'Navigate backwards' },
  { keys: ['Enter'], description: 'Activate focused element' },
  { keys: ['Space'], description: 'Activate buttons and checkboxes' },
];

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShowModal = () => setIsOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('show-shortcuts-modal', handleShowModal);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('show-shortcuts-modal', handleShowModal);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
          >
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto bg-background border-border shadow-2xl">
              <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-6 h-6 text-primary" aria-hidden="true" />
                  <h2 id="shortcuts-title" className="text-2xl font-bold">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close keyboard shortcuts dialog"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </Button>
              </div>

              <div className="p-6">
                <p className="text-muted-foreground mb-6">
                  Use these keyboard shortcuts to navigate the application more efficiently.
                </p>

                <div className="space-y-3">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Tip:</strong> Press{' '}
                    <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                      Ctrl
                    </kbd>{' '}
                    +{' '}
                    <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                      /
                    </kbd>{' '}
                    anytime to view this help dialog.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
