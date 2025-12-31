import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  const mockMatchMedia = (matches: boolean) => {
    const listeners: ((e: MediaQueryListEvent) => void)[] = [];
    
    return {
      matches,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          listeners.push(listener);
        }
      }),
      removeEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          const index = listeners.indexOf(listener);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      }),
      dispatchEvent: vi.fn(),
      trigger: (newMatches: boolean) => {
        listeners.forEach(listener => {
          listener({ matches: newMatches } as MediaQueryListEvent);
        });
      },
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false for desktop viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    const mql = mockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as any);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should return true for mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    const mql = mockMatchMedia(true);
    window.matchMedia = vi.fn(() => mql as any);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should return true for tablet viewport (767px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    });
    
    const mql = mockMatchMedia(true);
    window.matchMedia = vi.fn(() => mql as any);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should return false for viewport at breakpoint (768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    const mql = mockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as any);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should update when viewport changes from desktop to mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    const mql = mockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as any);
    
    const { result, rerender } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
    
    // Simulate viewport change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    act(() => {
      mql.trigger(true);
    });
    
    expect(result.current).toBe(true);
  });

  it('should update when viewport changes from mobile to desktop', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    const mql = mockMatchMedia(true);
    window.matchMedia = vi.fn(() => mql as any);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
    
    // Simulate viewport change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    act(() => {
      mql.trigger(false);
    });
    
    expect(result.current).toBe(false);
  });

  it('should cleanup event listener on unmount', () => {
    const mql = mockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as any);
    
    const { unmount } = renderHook(() => useIsMobile());
    
    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    
    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should use correct media query', () => {
    const mql = mockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as any);
    
    renderHook(() => useIsMobile());
    
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('should handle undefined initial state', () => {
    const mql = mockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as any);
    
    const { result } = renderHook(() => useIsMobile());
    
    // After effect runs, should have a boolean value
    expect(typeof result.current).toBe('boolean');
  });
});
