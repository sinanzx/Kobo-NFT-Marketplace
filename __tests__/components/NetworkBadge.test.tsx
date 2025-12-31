import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NetworkBadge from '@/components/NetworkBadge';

// Mock wagmi hooks
const mockUseAccount = vi.fn();
const mockUseChainId = vi.fn();
const mockUseSwitchChain = vi.fn();

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useChainId: () => mockUseChainId(),
  useSwitchChain: () => mockUseSwitchChain(),
}));

vi.mock('wagmi/chains', () => ({
  mainnet: { id: 1, name: 'Ethereum' },
  sepolia: { id: 11155111, name: 'Sepolia' },
  polygon: { id: 137, name: 'Polygon' },
  polygonAmoy: { id: 80002, name: 'Polygon Amoy' },
  arbitrum: { id: 42161, name: 'Arbitrum' },
  arbitrumSepolia: { id: 421614, name: 'Arbitrum Sepolia' },
  base: { id: 8453, name: 'Base' },
  baseSepolia: { id: 84532, name: 'Base Sepolia' },
}));

vi.mock('../utils/wagmiConfig', () => ({
  currentChain: { id: 11155111, name: 'Sepolia' },
}));

describe('NetworkBadge', () => {
  const mockSwitchChain = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSwitchChain.mockReturnValue({
      chains: [
        { id: 1, name: 'Ethereum' },
        { id: 11155111, name: 'Sepolia' },
        { id: 137, name: 'Polygon' },
      ],
      switchChain: mockSwitchChain,
    });
  });

  it('should not render when wallet is not connected', () => {
    mockUseAccount.mockReturnValue({ isConnected: false });
    mockUseChainId.mockReturnValue(1);

    const { container } = render(<NetworkBadge />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when wallet is connected', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    render(<NetworkBadge />);
    expect(screen.getByText('Sepolia')).toBeInTheDocument();
  });

  it('should show correct chain badge for current network', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    render(<NetworkBadge />);
    
    const badge = screen.getByText('Sepolia').closest('button');
    expect(badge).toHaveClass('bg-purple-500');
  });

  it('should show warning badge when on wrong network', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(1); // Ethereum instead of Sepolia

    render(<NetworkBadge />);
    
    const badge = screen.getByText('Ethereum').closest('button');
    expect(badge).toHaveClass('bg-red-500', 'animate-pulse');
  });

  it('should toggle dropdown when clicked', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    render(<NetworkBadge />);
    
    const button = screen.getByText('Sepolia').closest('button');
    
    // Dropdown should not be visible initially
    expect(screen.queryByText('Switch Network')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(button!);
    expect(screen.getByText('Switch Network')).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    render(<NetworkBadge />);
    
    const button = screen.getByText('Sepolia').closest('button');
    fireEvent.click(button!);
    
    expect(screen.getByText('Switch Network')).toBeInTheDocument();
    
    // Click outside
    const overlay = document.querySelector('.fixed.inset-0');
    fireEvent.click(overlay!);
    
    expect(screen.queryByText('Switch Network')).not.toBeInTheDocument();
  });

  it('should display all available chains in dropdown', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    render(<NetworkBadge />);
    
    const button = screen.getByText('Sepolia').closest('button');
    fireEvent.click(button!);
    
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Sepolia')).toBeInTheDocument();
    expect(screen.getByText('Polygon')).toBeInTheDocument();
  });

  it('should call switchChain when selecting a different network', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    render(<NetworkBadge />);
    
    const button = screen.getByText('Sepolia').closest('button');
    fireEvent.click(button!);
    
    const ethereumOption = screen.getByText('Ethereum').closest('button');
    fireEvent.click(ethereumOption!);
    
    expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 1 });
  });

  it('should close dropdown after switching network', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    render(<NetworkBadge />);
    
    const button = screen.getByText('Sepolia').closest('button');
    fireEvent.click(button!);
    
    const polygonOption = screen.getByText('Polygon').closest('button');
    fireEvent.click(polygonOption!);
    
    expect(screen.queryByText('Switch Network')).not.toBeInTheDocument();
  });

  it('should disable current chain option', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    render(<NetworkBadge />);
    
    const button = screen.getByText('Sepolia').closest('button');
    fireEvent.click(button!);
    
    const sepoliaOption = screen.getByText('Sepolia').closest('button');
    expect(sepoliaOption).toBeDisabled();
  });

  it('should show target network indicator', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(1);

    render(<NetworkBadge />);
    
    const button = screen.getByText('Ethereum').closest('button');
    fireEvent.click(button!);
    
    expect(screen.getByText('Target network')).toBeInTheDocument();
  });

  it('should show warning message when on wrong network', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(1);

    render(<NetworkBadge />);
    
    const button = screen.getByText('Ethereum').closest('button');
    fireEvent.click(button!);
    
    expect(screen.getByText(/Please switch to Sepolia/i)).toBeInTheDocument();
  });

  it('should not show warning when on correct network', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    render(<NetworkBadge />);
    
    const button = screen.getByText('Sepolia').closest('button');
    fireEvent.click(button!);
    
    expect(screen.queryByText(/Please switch to/i)).not.toBeInTheDocument();
  });

  it('should show Network icon when on correct chain', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    const { container } = render(<NetworkBadge />);
    
    const networkIcon = container.querySelector('svg');
    expect(networkIcon).toBeInTheDocument();
  });

  it('should show AlertCircle icon when on wrong chain', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(1);

    const { container } = render(<NetworkBadge />);
    
    const alertIcon = container.querySelector('svg');
    expect(alertIcon).toBeInTheDocument();
  });

  it('should rotate chevron when dropdown is open', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(11155111);

    const { container } = render(<NetworkBadge />);
    
    const button = screen.getByText('Sepolia').closest('button');
    const chevron = container.querySelector('.transition-transform');
    
    expect(chevron).not.toHaveClass('rotate-180');
    
    fireEvent.click(button!);
    
    expect(chevron).toHaveClass('rotate-180');
  });

  it('should handle unknown chain gracefully', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });
    mockUseChainId.mockReturnValue(99999); // Unknown chain

    render(<NetworkBadge />);
    
    // Should still render with fallback
    const badge = screen.getByRole('button');
    expect(badge).toBeInTheDocument();
  });
});
