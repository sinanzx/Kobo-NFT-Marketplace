import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCopyrightPrecheck } from '@/hooks/useCopyrightPrecheck';
import { supabase } from '@/lib/supabaseClient';

describe('useCopyrightPrecheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useCopyrightPrecheck());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should perform successful precheck', async () => {
    const mockResponse = {
      success: true,
      outputId: 'output-123',
      complianceStatus: 'approved',
    };
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockResponse,
      error: null,
    });
    
    const { result } = renderHook(() => useCopyrightPrecheck());
    
    const precheckParams = {
      promptText: 'A beautiful landscape',
      aiEngine: 'stable-diffusion',
      outputType: 'image' as const,
    };
    
    let precheckResult;
    await waitFor(async () => {
      precheckResult = await result.current.performPrecheck(precheckParams);
    });
    
    expect(precheckResult).toEqual({
      success: true,
      outputId: 'output-123',
      complianceStatus: 'approved',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle TOS not accepted error', async () => {
    const mockResponse = {
      success: false,
      error: 'TOS_NOT_ACCEPTED',
      message: 'Terms of service not accepted',
      tosRequired: [
        { type: 'platform', version: '1.0' },
        { type: 'stable-diffusion', version: '2.1' },
      ],
    };
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockResponse,
      error: null,
    });
    
    const { result } = renderHook(() => useCopyrightPrecheck());
    
    const precheckParams = {
      promptText: 'Test prompt',
      aiEngine: 'stable-diffusion',
      outputType: 'image' as const,
    };
    
    let precheckResult;
    await waitFor(async () => {
      precheckResult = await result.current.performPrecheck(precheckParams);
    });
    
    expect(precheckResult).toEqual({
      success: false,
      error: 'Terms of service not accepted',
      errorType: 'TOS_NOT_ACCEPTED',
      tosRequired: mockResponse.tosRequired,
      flaggedTerms: undefined,
      categories: undefined,
      scanResult: undefined,
    });
    expect(result.current.error).toBe('Terms of service not accepted');
  });

  it('should handle restricted content error', async () => {
    const mockResponse = {
      success: false,
      error: 'RESTRICTED_CONTENT',
      message: 'Content contains restricted terms',
      flaggedTerms: ['violence', 'explicit'],
      categories: ['violence', 'adult'],
    };
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockResponse,
      error: null,
    });
    
    const { result } = renderHook(() => useCopyrightPrecheck());
    
    const precheckParams = {
      promptText: 'Restricted content',
      aiEngine: 'stable-diffusion',
      outputType: 'image' as const,
    };
    
    let precheckResult;
    await waitFor(async () => {
      precheckResult = await result.current.performPrecheck(precheckParams);
    });
    
    expect(precheckResult).toEqual({
      success: false,
      error: 'Content contains restricted terms',
      errorType: 'RESTRICTED_CONTENT',
      tosRequired: undefined,
      flaggedTerms: ['violence', 'explicit'],
      categories: ['violence', 'adult'],
      scanResult: undefined,
    });
  });

  it('should handle copyright violation error', async () => {
    const mockScanResult = {
      matches: [
        { source: 'Getty Images', similarity: 0.95 },
      ],
    };
    
    const mockResponse = {
      success: false,
      error: 'COPYRIGHT_VIOLATION',
      message: 'Potential copyright violation detected',
      scanResult: mockScanResult,
    };
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockResponse,
      error: null,
    });
    
    const { result } = renderHook(() => useCopyrightPrecheck());
    
    const precheckParams = {
      promptText: 'Test',
      aiEngine: 'stable-diffusion',
      outputType: 'image' as const,
      outputUrl: 'https://example.com/image.jpg',
    };
    
    let precheckResult;
    await waitFor(async () => {
      precheckResult = await result.current.performPrecheck(precheckParams);
    });
    
    expect(precheckResult).toEqual({
      success: false,
      error: 'Potential copyright violation detected',
      errorType: 'COPYRIGHT_VIOLATION',
      tosRequired: undefined,
      flaggedTerms: undefined,
      categories: undefined,
      scanResult: mockScanResult,
    });
  });

  it('should handle network errors', async () => {
    vi.mocked(supabase.functions.invoke).mockRejectedValue(
      new Error('Network error')
    );
    
    const { result } = renderHook(() => useCopyrightPrecheck());
    
    const precheckParams = {
      promptText: 'Test',
      aiEngine: 'stable-diffusion',
      outputType: 'image' as const,
    };
    
    let precheckResult;
    await waitFor(async () => {
      precheckResult = await result.current.performPrecheck(precheckParams);
    });
    
    expect(precheckResult).toEqual({
      success: false,
      error: 'Network error',
    });
    expect(result.current.error).toBe('Network error');
  });

  it('should handle remix precheck', async () => {
    const mockResponse = {
      success: true,
      outputId: 'remix-output-123',
      complianceStatus: 'approved',
    };
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockResponse,
      error: null,
    });
    
    const { result } = renderHook(() => useCopyrightPrecheck());
    
    const precheckParams = {
      promptText: 'Remix of original',
      aiEngine: 'stable-diffusion',
      outputType: 'image' as const,
      isRemix: true,
      parentOutputId: 'parent-123',
    };
    
    let precheckResult;
    await waitFor(async () => {
      precheckResult = await result.current.performPrecheck(precheckParams);
    });
    
    expect(precheckResult?.success).toBe(true);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('copyright-precheck', {
      body: precheckParams,
    });
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useCopyrightPrecheck());
    
    // Manually set error
    result.current.performPrecheck({
      promptText: 'Test',
      aiEngine: 'test',
      outputType: 'image',
    });
    
    result.current.clearError();
    
    expect(result.current.error).toBeNull();
  });

  it('should set loading state during precheck', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.mocked(supabase.functions.invoke).mockReturnValue(promise as any);
    
    const { result } = renderHook(() => useCopyrightPrecheck());
    
    const precheckPromise = result.current.performPrecheck({
      promptText: 'Test',
      aiEngine: 'test',
      outputType: 'image',
    });
    
    // Should be loading
    expect(result.current.loading).toBe(true);
    
    // Resolve the promise
    resolvePromise!({ data: { success: true }, error: null });
    await precheckPromise;
    
    // Should no longer be loading
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
