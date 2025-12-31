import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIGenerator } from '@/components/AIGenerator';
import { NFTType } from '@/utils/evmConfig';

// Mock child components
vi.mock('@/components/ImageGenerator', () => ({
  ImageGenerator: ({ onImageGenerated }: any) => (
    <div data-testid="image-generator">
      <button onClick={() => onImageGenerated(
        { url: 'test-image.jpg', blob: new Blob() },
        'test prompt'
      )}>
        Generate Image
      </button>
    </div>
  ),
}));

vi.mock('@/components/AudioGenerator', () => ({
  AudioGenerator: ({ onAudioGenerated }: any) => (
    <div data-testid="audio-generator">
      <button onClick={() => onAudioGenerated({
        url: 'test-audio.mp3',
        blob: new Blob(),
        duration: 30,
      })}>
        Generate Audio
      </button>
    </div>
  ),
}));

vi.mock('@/components/VideoGenerator', () => ({
  VideoGenerator: ({ onVideoGenerated }: any) => (
    <div data-testid="video-generator">
      <button onClick={() => onVideoGenerated({
        status: 'completed',
        url: 'test-video.mp4',
        blob: new Blob(),
        duration: 60,
      })}>
        Generate Video
      </button>
    </div>
  ),
}));

describe('AIGenerator', () => {
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with image tab active by default', () => {
    render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    expect(screen.getByText('AI Generator')).toBeInTheDocument();
    expect(screen.getByTestId('image-generator')).toBeInTheDocument();
  });

  it('should display all three tabs', () => {
    render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    expect(screen.getByRole('tab', { name: /image/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /audio/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /video/i })).toBeInTheDocument();
  });

  it('should switch to audio tab when clicked', () => {
    render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    const audioTab = screen.getByRole('tab', { name: /audio/i });
    fireEvent.click(audioTab);
    
    expect(screen.getByTestId('audio-generator')).toBeInTheDocument();
  });

  it('should switch to video tab when clicked', () => {
    render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    const videoTab = screen.getByRole('tab', { name: /video/i });
    fireEvent.click(videoTab);
    
    expect(screen.getByTestId('video-generator')).toBeInTheDocument();
  });

  it('should call onGenerate with correct data for image generation', () => {
    render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);
    
    expect(mockOnGenerate).toHaveBeenCalledWith(
      NFTType.IMAGE,
      expect.objectContaining({
        url: 'test-image.jpg',
        prompt: 'test prompt',
        type: NFTType.IMAGE,
        model: 'stabilityai/stable-diffusion-2-1',
      })
    );
  });

  it('should call onGenerate with correct data for audio generation', () => {
    render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    // Switch to audio tab
    const audioTab = screen.getByRole('tab', { name: /audio/i });
    fireEvent.click(audioTab);
    
    const generateButton = screen.getByText('Generate Audio');
    fireEvent.click(generateButton);
    
    expect(mockOnGenerate).toHaveBeenCalledWith(
      NFTType.AUDIO,
      expect.objectContaining({
        url: 'test-audio.mp3',
        type: NFTType.AUDIO,
        model: 'elevenlabs-tts',
        duration: 30,
      })
    );
  });

  it('should call onGenerate with correct data for video generation', () => {
    render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    // Switch to video tab
    const videoTab = screen.getByRole('tab', { name: /video/i });
    fireEvent.click(videoTab);
    
    const generateButton = screen.getByText('Generate Video');
    fireEvent.click(generateButton);
    
    expect(mockOnGenerate).toHaveBeenCalledWith(
      NFTType.VIDEO,
      expect.objectContaining({
        url: 'test-video.mp4',
        type: NFTType.VIDEO,
        model: 'runway-ml',
        duration: 60,
      })
    );
  });

  it('should not call onGenerate for incomplete video generation', () => {
    vi.mocked(require('@/components/VideoGenerator').VideoGenerator).mockImplementation(
      ({ onVideoGenerated }: any) => (
        <div data-testid="video-generator">
          <button onClick={() => onVideoGenerated({
            status: 'processing',
            url: null,
          })}>
            Generate Video
          </button>
        </div>
      )
    );
    
    render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    const videoTab = screen.getByRole('tab', { name: /video/i });
    fireEvent.click(videoTab);
    
    const generateButton = screen.getByText('Generate Video');
    fireEvent.click(generateButton);
    
    expect(mockOnGenerate).not.toHaveBeenCalled();
  });

  it('should include blob in generated content when available', () => {
    render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);
    
    expect(mockOnGenerate).toHaveBeenCalledWith(
      NFTType.IMAGE,
      expect.objectContaining({
        blob: expect.any(Blob),
      })
    );
  });

  it('should maintain tab state across interactions', () => {
    render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    // Switch to audio
    fireEvent.click(screen.getByRole('tab', { name: /audio/i }));
    expect(screen.getByTestId('audio-generator')).toBeInTheDocument();
    
    // Switch to video
    fireEvent.click(screen.getByRole('tab', { name: /video/i }));
    expect(screen.getByTestId('video-generator')).toBeInTheDocument();
    
    // Switch back to image
    fireEvent.click(screen.getByRole('tab', { name: /image/i }));
    expect(screen.getByTestId('image-generator')).toBeInTheDocument();
  });

  it('should render with proper styling classes', () => {
    const { container } = render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    const card = container.querySelector('.p-5.border-border\\/50');
    expect(card).toBeInTheDocument();
  });

  it('should display Sparkles icon', () => {
    const { container } = render(<AIGenerator onGenerate={mockOnGenerate} />);
    
    const sparklesIcon = container.querySelector('svg');
    expect(sparklesIcon).toBeInTheDocument();
  });
});
