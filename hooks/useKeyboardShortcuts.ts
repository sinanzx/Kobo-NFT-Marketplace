import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

/**
 * Keyboard Shortcuts Hook
 * Manages global keyboard shortcuts for improved accessibility
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!event.key) return;
      const matchingShortcut = shortcuts.find(
        (shortcut) =>
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrl === event.ctrlKey &&
          !!shortcut.alt === event.altKey &&
          !!shortcut.shift === event.shiftKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Global keyboard shortcuts for the application
 */
export function useGlobalKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      alt: true,
      description: 'Go to homepage',
      action: () => navigate('/'),
    },
    {
      key: 'c',
      alt: true,
      description: 'Go to create page',
      action: () => navigate('/create'),
    },
    {
      key: 'g',
      alt: true,
      description: 'Go to gallery',
      action: () => navigate('/gallery'),
    },
    {
      key: 'b',
      alt: true,
      description: 'Go to battles',
      action: () => navigate('/battles'),
    },
    {
      key: 'd',
      alt: true,
      description: 'Go to dashboard',
      action: () => navigate('/dashboard'),
    },
    {
      key: '/',
      ctrl: true,
      description: 'Show keyboard shortcuts help',
      action: () => {
        const event = new CustomEvent('show-shortcuts-modal');
        window.dispatchEvent(event);
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
