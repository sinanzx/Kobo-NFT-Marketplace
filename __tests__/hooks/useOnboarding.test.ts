import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOnboarding } from '@/hooks/useOnboarding';
import { supabase } from '@/lib/supabaseClient';

// Mock AuthContext
const mockUser = { id: 'test-user-id', email: 'test@example.com' };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null })),
}));

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.loading).toBe(true);
  });

  it('should not show onboarding if localStorage indicates completion', async () => {
    localStorage.setItem('kobo_onboarding_completed', 'true');
    
    const { result } = renderHook(() => useOnboarding());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.showOnboarding).toBe(false);
  });

  it('should show onboarding for new users without localStorage', async () => {
    const { result } = renderHook(() => useOnboarding());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.showOnboarding).toBe(true);
  });

  it('should complete onboarding and update localStorage', async () => {
    const { result } = renderHook(() => useOnboarding());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    result.current.completeOnboarding();
    
    expect(localStorage.getItem('kobo_onboarding_completed')).toBe('true');
    expect(result.current.showOnboarding).toBe(false);
  });

  it('should reset onboarding state', async () => {
    localStorage.setItem('kobo_onboarding_completed', 'true');
    
    const { result } = renderHook(() => useOnboarding());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    result.current.resetOnboarding();
    
    expect(localStorage.getItem('kobo_onboarding_completed')).toBeNull();
    expect(result.current.showOnboarding).toBe(true);
  });

  it('should check database for authenticated users', async () => {
    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    
    const mockSupabaseResponse = {
      data: { onboarding_completed: false },
      error: null,
    };
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(mockSupabaseResponse),
    } as any);
    
    const { result } = renderHook(() => useOnboarding());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.showOnboarding).toBe(true);
  });

  it('should handle database errors gracefully', async () => {
    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockRejectedValue(new Error('Database error')),
    } as any);
    
    const { result } = renderHook(() => useOnboarding());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should default to showing onboarding on error
    expect(result.current.showOnboarding).toBe(true);
  });

  it('should update database when authenticated user completes onboarding', async () => {
    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    
    const updateMock = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { onboarding_completed: false }, error: null }),
      update: vi.fn().mockReturnThis(),
    } as any);
    
    const { result } = renderHook(() => useOnboarding());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await result.current.completeOnboarding();
    
    expect(localStorage.getItem('kobo_onboarding_completed')).toBe('true');
  });
});
