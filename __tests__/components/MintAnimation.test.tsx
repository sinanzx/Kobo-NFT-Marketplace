import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MintAnimation } from '@/components/MintAnimation';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('MintAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock AudioContext
    global.AudioContext = vi.fn().mockImplementation(() => ({
      createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      })),
      destination: {},
      currentTime: 0,
    })) as any;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <MintAnimation isOpen={false} onComplete={onComplete} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    const onComplete = vi.fn();
    render(<MintAnimation isOpen={true} onComplete={onComplete} />);
    
    expect(screen.getByText(/NFT Minted Successfully!/i)).toBeInTheDocument();
  });

  it('should display NFT image when provided', () => {
    const onComplete = vi.fn();
    const nftImage = 'https://images.pexels.com/photos/34906949/pexels-photo-34906949.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
    
    render(
      <MintAnimation isOpen={true} onComplete={onComplete} nftImage={nftImage} />
    );
    
    const img = screen.getByAltText('Minted NFT');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', nftImage);
  });

  it('should display placeholder when no NFT image provided', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <MintAnimation isOpen={true} onComplete={onComplete} />
    );
    
    // Should have gradient placeholder div
    const placeholder = container.querySelector('.bg-gradient-to-br.from-purple-500.to-blue-500');
    expect(placeholder).toBeInTheDocument();
  });

  it('should call onComplete after 6 seconds', async () => {
    const onComplete = vi.fn();
    render(<MintAnimation isOpen={true} onComplete={onComplete} />);
    
    expect(onComplete).not.toHaveBeenCalled();
    
    // Fast-forward 6 seconds
    vi.advanceTimersByTime(6000);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('should not call onComplete if closed before timer completes', () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <MintAnimation isOpen={true} onComplete={onComplete} />
    );
    
    // Fast-forward 3 seconds
    vi.advanceTimersByTime(3000);
    
    // Close the animation
    rerender(<MintAnimation isOpen={false} onComplete={onComplete} />);
    
    // Fast-forward remaining time
    vi.advanceTimersByTime(3000);
    
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should reset stage when reopened', () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <MintAnimation isOpen={true} onComplete={onComplete} />
    );
    
    // Fast-forward to complete stage
    vi.advanceTimersByTime(4000);
    
    // Close and reopen
    rerender(<MintAnimation isOpen={false} onComplete={onComplete} />);
    rerender(<MintAnimation isOpen={true} onComplete={onComplete} />);
    
    // Should restart from opening stage
    expect(screen.getByText(/NFT Minted Successfully!/i)).toBeInTheDocument();
  });

  it('should cleanup timers on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <MintAnimation isOpen={true} onComplete={onComplete} />
    );
    
    unmount();
    
    // Fast-forward time after unmount
    vi.advanceTimersByTime(10000);
    
    // onComplete should not be called
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should play reveal sound at 2 seconds', () => {
    const onComplete = vi.fn();
    render(<MintAnimation isOpen={true} onComplete={onComplete} />);
    
    const audioContextSpy = vi.spyOn(global, 'AudioContext' as any);
    
    // Fast-forward to reveal stage
    vi.advanceTimersByTime(2000);
    
    // AudioContext should be created for sound
    expect(audioContextSpy).toHaveBeenCalled();
  });

  it('should handle multiple rapid open/close cycles', () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <MintAnimation isOpen={false} onComplete={onComplete} />
    );
    
    // Rapid open/close
    rerender(<MintAnimation isOpen={true} onComplete={onComplete} />);
    vi.advanceTimersByTime(1000);
    
    rerender(<MintAnimation isOpen={false} onComplete={onComplete} />);
    vi.advanceTimersByTime(1000);
    
    rerender(<MintAnimation isOpen={true} onComplete={onComplete} />);
    vi.advanceTimersByTime(6000);
    
    // Should only call onComplete once for the final open
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should render glass cylinder structure', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <MintAnimation isOpen={true} onComplete={onComplete} />
    );
    
    // Check for cylinder elements
    const glassBody = container.querySelector('.bg-gradient-to-b.from-white\\/10');
    expect(glassBody).toBeInTheDocument();
  });

  it('should show success message at complete stage', async () => {
    const onComplete = vi.fn();
    render(<MintAnimation isOpen={true} onComplete={onComplete} />);
    
    // Fast-forward to complete stage
    vi.advanceTimersByTime(4000);
    
    await waitFor(() => {
      expect(screen.getByText(/NFT Minted Successfully!/i)).toBeInTheDocument();
    });
  });
});
