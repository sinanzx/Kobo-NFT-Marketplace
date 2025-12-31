import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFeatureTour, TourStep } from '@/hooks/useFeatureTour';

const mockSteps: TourStep[] = [
  {
    id: 'step1',
    target: '#element1',
    title: 'Step 1',
    description: 'First step description',
    position: 'bottom',
  },
  {
    id: 'step2',
    target: '#element2',
    title: 'Step 2',
    description: 'Second step description',
    position: 'top',
  },
  {
    id: 'step3',
    target: '#element3',
    title: 'Step 3',
    description: 'Third step description',
  },
];

describe('useFeatureTour', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.totalSteps).toBe(3);
  });

  it('should start tour correctly', () => {
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    act(() => {
      result.current.startTour();
    });
    
    expect(result.current.isActive).toBe(true);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.currentStepData).toEqual(mockSteps[0]);
  });

  it('should navigate to next step', () => {
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    act(() => {
      result.current.startTour();
    });
    
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(1);
    expect(result.current.currentStepData).toEqual(mockSteps[1]);
  });

  it('should navigate to previous step', () => {
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    act(() => {
      result.current.startTour();
    });
    
    act(() => {
      result.current.nextStep();
    });
    
    act(() => {
      result.current.prevStep();
    });
    
    expect(result.current.currentStep).toBe(0);
  });

  it('should not go to previous step when at first step', () => {
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    act(() => {
      result.current.startTour();
    });
    
    act(() => {
      result.current.prevStep();
    });
    
    expect(result.current.currentStep).toBe(0);
  });

  it('should complete tour when reaching last step and calling nextStep', () => {
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    act(() => {
      result.current.startTour();
    });
    
    // Navigate to last step
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(2);
    
    // Complete tour
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.isCompleted).toBe(true);
    expect(localStorage.getItem('kobo_feature_tour_completed')).toBe('true');
  });

  it('should skip tour and mark as dismissed', () => {
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    act(() => {
      result.current.startTour();
    });
    
    act(() => {
      result.current.skipTour();
    });
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.isCompleted).toBe(true);
    expect(localStorage.getItem('kobo_feature_tour_dismissed')).toBe('true');
  });

  it('should reset tour correctly', () => {
    localStorage.setItem('kobo_feature_tour_completed', 'true');
    
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    act(() => {
      result.current.resetTour();
    });
    
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(localStorage.getItem('kobo_feature_tour_completed')).toBeNull();
    expect(localStorage.getItem('kobo_feature_tour_dismissed')).toBeNull();
  });

  it('should load completed state from localStorage', () => {
    localStorage.setItem('kobo_feature_tour_completed', 'true');
    
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    expect(result.current.isCompleted).toBe(true);
  });

  it('should load dismissed state from localStorage', () => {
    localStorage.setItem('kobo_feature_tour_dismissed', 'true');
    
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    expect(result.current.isCompleted).toBe(true);
  });

  it('should clear dismissed flag when starting tour', () => {
    localStorage.setItem('kobo_feature_tour_dismissed', 'true');
    
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    act(() => {
      result.current.startTour();
    });
    
    expect(localStorage.getItem('kobo_feature_tour_dismissed')).toBeNull();
    expect(result.current.isActive).toBe(true);
  });

  it('should provide correct current step data', () => {
    const { result } = renderHook(() => useFeatureTour(mockSteps));
    
    act(() => {
      result.current.startTour();
    });
    
    expect(result.current.currentStepData).toEqual(mockSteps[0]);
    
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.currentStepData).toEqual(mockSteps[1]);
  });
});
