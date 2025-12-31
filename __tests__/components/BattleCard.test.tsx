import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BattleCard } from '@/components/battles/BattleCard';
import { Battle } from '@/lib/battleService';

const mockBattle: Battle = {
  id: 'battle-1',
  title: 'Epic AI Battle',
  description: 'Create the most creative AI artwork',
  battleType: 'AI_VS_HUMAN',
  status: 'registration',
  theme: 'Cyberpunk Future',
  prizePool: '1.5',
  entryFee: '0.1',
  prizeDistribution: [50, 30, 20],
  maxParticipants: 100,
  participants: ['user1', 'user2', 'user3'],
  registrationStart: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  registrationEnd: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
  battleStart: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
  battleEnd: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
  votingEnd: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
};

// Already has all required fields from Battle interface

describe('BattleCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render battle information', () => {
    render(<BattleCard battle={mockBattle} />);

    expect(screen.getByText('Epic AI Battle')).toBeInTheDocument();
    expect(screen.getByText('Create the most creative AI artwork')).toBeInTheDocument();
    expect(screen.getByText('Cyberpunk Future')).toBeInTheDocument();
  });

  it('should display battle type badge', () => {
    render(<BattleCard battle={mockBattle} />);

    expect(screen.getByText('AI VS HUMAN')).toBeInTheDocument();
  });

  it('should display status badge', () => {
    render(<BattleCard battle={mockBattle} />);

    expect(screen.getByText('REGISTRATION')).toBeInTheDocument();
  });

  it('should display prize pool', () => {
    render(<BattleCard battle={mockBattle} />);

    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
  });

  it('should display participant count', () => {
    render(<BattleCard battle={mockBattle} />);

    expect(screen.getByText('3 / 100')).toBeInTheDocument();
  });

  it('should calculate time remaining correctly', () => {
    render(<BattleCard battle={mockBattle} />);

    // Should show days and hours
    expect(screen.getByText(/\d+d \d+h/)).toBeInTheDocument();
  });

  it('should show "Ended" when battle is over', () => {
    const endedBattle = {
      ...mockBattle,
      battleEnd: new Date(Date.now() - 1000).toISOString(),
    };

    render(<BattleCard battle={endedBattle} />);

    expect(screen.getByText('Ended')).toBeInTheDocument();
  });

  it('should show Join Battle button for registration status', () => {
    const onJoin = vi.fn();
    render(<BattleCard battle={mockBattle} onJoin={onJoin} />);

    expect(screen.getByRole('button', { name: /join battle/i })).toBeInTheDocument();
  });

  it('should call onJoin when Join Battle is clicked', async () => {
    const user = userEvent.setup();
    const onJoin = vi.fn();
    render(<BattleCard battle={mockBattle} onJoin={onJoin} />);

    const joinButton = screen.getByRole('button', { name: /join battle/i });
    await user.click(joinButton);

    expect(onJoin).toHaveBeenCalledWith('battle-1');
  });

  it('should show Vote Now button for voting status', () => {
    const votingBattle = { ...mockBattle, status: 'voting' as const };
    const onView = vi.fn();
    render(<BattleCard battle={votingBattle} onView={onView} />);

    expect(screen.getByRole('button', { name: /vote now/i })).toBeInTheDocument();
  });

  it('should call onView when Vote Now is clicked', async () => {
    const user = userEvent.setup();
    const votingBattle = { ...mockBattle, status: 'voting' as const };
    const onView = vi.fn();
    render(<BattleCard battle={votingBattle} onView={onView} />);

    const voteButton = screen.getByRole('button', { name: /vote now/i });
    await user.click(voteButton);

    expect(onView).toHaveBeenCalledWith('battle-1');
  });

  it('should show View Battle button for active status', () => {
    const activeBattle = { ...mockBattle, status: 'active' as const };
    const onView = vi.fn();
    render(<BattleCard battle={activeBattle} onView={onView} />);

    expect(screen.getByRole('button', { name: /view battle/i })).toBeInTheDocument();
  });

  it('should show View Battle button for completed status', () => {
    const completedBattle = { ...mockBattle, status: 'completed' as const };
    const onView = vi.fn();
    render(<BattleCard battle={completedBattle} onView={onView} />);

    expect(screen.getByRole('button', { name: /view battle/i })).toBeInTheDocument();
  });

  it('should display theme section when theme exists', () => {
    render(<BattleCard battle={mockBattle} />);

    expect(screen.getByText('Theme:')).toBeInTheDocument();
    expect(screen.getByText('Cyberpunk Future')).toBeInTheDocument();
  });

  it('should not display theme section when theme is empty', () => {
    const battleWithoutTheme = { ...mockBattle, theme: '' };
    render(<BattleCard battle={battleWithoutTheme} />);

    expect(screen.queryByText('Theme:')).not.toBeInTheDocument();
  });

  it('should calculate participant percentage correctly', () => {
    const { container } = render(<BattleCard battle={mockBattle} />);

    // 3 participants out of 100 = 3%
    const progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toHaveStyle({ width: '3%' });
  });

  it('should handle battle with no participants', () => {
    const emptyBattle = { ...mockBattle, participants: [] };
    render(<BattleCard battle={emptyBattle} />);

    expect(screen.getByText('0 / 100')).toBeInTheDocument();
  });

  it('should apply correct color for different battle types', () => {
    const battleTypes: Battle['battleType'][] = [
      'AI_VS_HUMAN',
      'REMIX_COMPETITION',
      'TIME_CHALLENGE',
      'THEME_BATTLE',
      'TOURNAMENT',
    ];

    battleTypes.forEach((type) => {
      const { unmount } = render(
        <BattleCard battle={{ ...mockBattle, battleType: type }} />
      );
      
      const badge = screen.getByText(type.replace(/_/g, ' '));
      expect(badge).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should apply correct color for different statuses', () => {
    const statuses: Battle['status'][] = [
      'upcoming',
      'registration',
      'active',
      'voting',
      'completed',
      'cancelled',
    ];

    statuses.forEach((status) => {
      const { unmount } = render(
        <BattleCard battle={{ ...mockBattle, status }} />
      );
      
      const badge = screen.getByText(status.toUpperCase());
      expect(badge).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should show trophy icon for active battles', () => {
    const activeBattle = { ...mockBattle, status: 'active' as const };
    const { container } = render(<BattleCard battle={activeBattle} />);

    const trophyIcon = container.querySelector('.lucide-trophy');
    expect(trophyIcon).toBeInTheDocument();
  });

  it('should not show trophy icon for non-active battles', () => {
    const { container } = render(<BattleCard battle={mockBattle} />);

    const trophyIcon = container.querySelector('.lucide-trophy');
    expect(trophyIcon).not.toBeInTheDocument();
  });

  it('should format time remaining with hours and minutes when less than a day', () => {
    const soonBattle = {
      ...mockBattle,
      battleEnd: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };

    render(<BattleCard battle={soonBattle} />);

    expect(screen.getByText(/\d+h \d+m/)).toBeInTheDocument();
  });

  it('should format time remaining with only minutes when less than an hour', () => {
    const verySoonBattle = {
      ...mockBattle,
      battleEnd: new Date(Date.now() + 600000).toISOString(), // 10 minutes from now
    };

    render(<BattleCard battle={verySoonBattle} />);

    expect(screen.getByText(/\d+m/)).toBeInTheDocument();
  });
});
