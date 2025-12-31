import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTOSManagement } from '@/hooks/useTOSManagement';
import { supabase } from '@/lib/supabaseClient';

describe('useTOSManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useTOSManagement());
    
    expect(result.current.requiredTOS).toEqual([]);
    expect(result.current.tosStatus).toBeNull();
    expect(result.current.hasOutstanding).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should check required TOS on mount', async () => {
    const mockTOSData = {
      requiredTOS: [
        {
          type: 'platform',
          version: '1.0',
          url: 'https://example.com/tos',
          description: 'Platform TOS',
        },
      ],
      hasOutstanding: true,
    };
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockTOSData,
      error: null,
    });
    
    const { result } = renderHook(() => useTOSManagement());
    
    await waitFor(() => {
      expect(result.current.requiredTOS).toEqual(mockTOSData.requiredTOS);
      expect(result.current.hasOutstanding).toBe(true);
    });
  });

  it('should fetch TOS status', async () => {
    const mockTOSStatus = {
      tosStatus: {
        platform: {
          accepted: true,
          acceptedAt: '2024-01-01',
          version: '1.0',
        },
        engines: {
          'stable-diffusion': {
            accepted: false,
            acceptedAt: null,
            currentVersion: '2.1',
            acceptedVersion: null,
            needsUpdate: true,
            tosUrl: 'https://example.com/sd-tos',
            requiresAcceptance: true,
          },
        },
      },
    };
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockTOSStatus,
      error: null,
    });
    
    const { result } = renderHook(() => useTOSManagement());
    
    await result.current.fetchTOSStatus();
    
    await waitFor(() => {
      expect(result.current.tosStatus).toEqual(mockTOSStatus.tosStatus);
    });
  });

  it('should accept TOS successfully', async () => {
    const mockAcceptResponse = {
      success: true,
      message: 'TOS accepted',
    };
    
    const mockRequiredTOSResponse = {
      requiredTOS: [],
      hasOutstanding: false,
    };
    
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({ data: { requiredTOS: [], hasOutstanding: false }, error: null })
      .mockResolvedValueOnce({ data: mockAcceptResponse, error: null })
      .mockResolvedValueOnce({ data: mockRequiredTOSResponse, error: null });
    
    const { result } = renderHook(() => useTOSManagement());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const acceptResult = await result.current.acceptTOS('platform', '1.0');
    
    expect(acceptResult.success).toBe(true);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('tos-management/accept', {
      body: {
        tosType: 'platform',
        tosVersion: '1.0',
        userAgent: expect.any(String),
      },
    });
  });

  it('should handle TOS acceptance error', async () => {
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({ data: { requiredTOS: [], hasOutstanding: false }, error: null })
      .mockRejectedValueOnce(new Error('Failed to accept TOS'));
    
    const { result } = renderHook(() => useTOSManagement());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const acceptResult = await result.current.acceptTOS('platform', '1.0');
    
    expect(acceptResult.success).toBe(false);
    expect(acceptResult.error).toBe('Failed to accept TOS');
  });

  it('should check specific TOS', async () => {
    const mockSpecificTOS = {
      accepted: true,
      version: '2.1',
      acceptedAt: '2024-01-01',
    };
    
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({ data: { requiredTOS: [], hasOutstanding: false }, error: null })
      .mockResolvedValueOnce({ data: mockSpecificTOS, error: null });
    
    const { result } = renderHook(() => useTOSManagement());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const specificTOS = await result.current.checkSpecificTOS('stable-diffusion');
    
    expect(specificTOS).toEqual(mockSpecificTOS);
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'tos-management/status?tosType=stable-diffusion'
    );
  });

  it('should handle specific TOS check error', async () => {
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({ data: { requiredTOS: [], hasOutstanding: false }, error: null })
      .mockRejectedValueOnce(new Error('Failed to check TOS'));
    
    const { result } = renderHook(() => useTOSManagement());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const specificTOS = await result.current.checkSpecificTOS('stable-diffusion');
    
    expect(specificTOS).toBeNull();
  });

  it('should handle checkRequiredTOS error', async () => {
    vi.mocked(supabase.functions.invoke).mockRejectedValue(
      new Error('Network error')
    );
    
    const { result } = renderHook(() => useTOSManagement());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should not throw, just log error
    expect(result.current.requiredTOS).toEqual([]);
    expect(result.current.hasOutstanding).toBe(false);
  });

  it('should handle fetchTOSStatus error', async () => {
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({ data: { requiredTOS: [], hasOutstanding: false }, error: null })
      .mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useTOSManagement());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await result.current.fetchTOSStatus();
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should not throw, just log error
    expect(result.current.tosStatus).toBeNull();
  });

  it('should set loading state correctly', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.mocked(supabase.functions.invoke).mockReturnValue(promise as any);
    
    const { result } = renderHook(() => useTOSManagement());
    
    // Should be loading during initial check
    expect(result.current.loading).toBe(true);
    
    // Resolve the promise
    resolvePromise!({ data: { requiredTOS: [], hasOutstanding: false }, error: null });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should refresh required TOS after acceptance', async () => {
    const initialTOS = {
      requiredTOS: [{ type: 'platform', version: '1.0', url: '', description: '' }],
      hasOutstanding: true,
    };
    
    const updatedTOS = {
      requiredTOS: [],
      hasOutstanding: false,
    };
    
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({ data: initialTOS, error: null })
      .mockResolvedValueOnce({ data: { success: true }, error: null })
      .mockResolvedValueOnce({ data: updatedTOS, error: null });
    
    const { result } = renderHook(() => useTOSManagement());
    
    await waitFor(() => {
      expect(result.current.hasOutstanding).toBe(true);
    });
    
    await result.current.acceptTOS('platform', '1.0');
    
    await waitFor(() => {
      expect(result.current.hasOutstanding).toBe(false);
      expect(result.current.requiredTOS).toEqual([]);
    });
  });
});
