import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useToast, toast } from '@/hooks/use-toast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test',
      });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    expect(result.current.toasts[0].description).toBe('This is a test');
  });

  it('should limit toasts to TOAST_LIMIT', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
    });
    
    // TOAST_LIMIT is 1, so only the most recent toast should remain
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 2');
  });

  it('should dismiss a specific toast', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    act(() => {
      const { id } = result.current.toast({ title: 'Test Toast' });
      toastId = id;
    });
    
    expect(result.current.toasts[0].open).toBe(true);
    
    act(() => {
      result.current.dismiss(toastId!);
    });
    
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should dismiss all toasts when no id provided', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });
    
    act(() => {
      result.current.dismiss();
    });
    
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should remove toast after TOAST_REMOVE_DELAY', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    act(() => {
      const { id } = result.current.toast({ title: 'Test Toast' });
      toastId = id;
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.dismiss(toastId!);
    });
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000000);
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should update toast', () => {
    const { result } = renderHook(() => useToast());
    
    let toastInstance: ReturnType<typeof toast>;
    act(() => {
      toastInstance = result.current.toast({ title: 'Original Title' });
    });
    
    expect(result.current.toasts[0].title).toBe('Original Title');
    
    act(() => {
      toastInstance.update({ id: result.current.toasts[0].id, title: 'Updated Title' });
    });
    
    expect(result.current.toasts[0].title).toBe('Updated Title');
  });

  it('should handle toast with action', () => {
    const { result } = renderHook(() => useToast());
    
    const mockAction = {
      label: 'Undo',
      onClick: vi.fn(),
    };
    
    act(() => {
      result.current.toast({
        title: 'Action Toast',
        action: mockAction as any,
      });
    });
    
    expect(result.current.toasts[0].action).toEqual(mockAction);
  });

  it('should handle toast variants', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Error Toast',
        variant: 'destructive',
      });
    });
    
    expect(result.current.toasts[0].variant).toBe('destructive');
  });

  it('should call onOpenChange when dismissing', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    act(() => {
      const { id } = result.current.toast({ title: 'Test Toast' });
      toastId = id;
    });
    
    const toast = result.current.toasts[0];
    expect(toast.onOpenChange).toBeDefined();
    
    act(() => {
      toast.onOpenChange?.(false);
    });
    
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should generate unique ids for toasts', () => {
    const { result } = renderHook(() => useToast());
    
    const ids: string[] = [];
    
    act(() => {
      const toast1 = result.current.toast({ title: 'Toast 1' });
      ids.push(toast1.id);
    });
    
    act(() => {
      vi.advanceTimersByTime(1000000);
    });
    
    act(() => {
      const toast2 = result.current.toast({ title: 'Toast 2' });
      ids.push(toast2.id);
    });
    
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('should work with standalone toast function', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({ title: 'Standalone Toast' });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Standalone Toast');
  });

  it('should handle multiple listeners', () => {
    const { result: result1 } = renderHook(() => useToast());
    const { result: result2 } = renderHook(() => useToast());
    
    act(() => {
      result1.current.toast({ title: 'Shared Toast' });
    });
    
    expect(result1.current.toasts).toHaveLength(1);
    expect(result2.current.toasts).toHaveLength(1);
    expect(result1.current.toasts[0].id).toBe(result2.current.toasts[0].id);
  });
});
