import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { setSentryUser, clearSentryUser } from '@/lib/sentry';

vi.mock('@/lib/supabaseClient');
vi.mock('@/lib/sentry');

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading, error, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (user) {
    return (
      <div>
        <div>User: {user.email}</div>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  }
  return <div>No user</div>;
};

describe('AuthContext Integration', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide auth context to children', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });

  it('should load user from session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: 'token',
          refresh_token: 'refresh',
        },
      },
      error: null,
    } as any);

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });

    expect(setSentryUser).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'test@example.com',
    });
  });

  it('should handle session errors', async () => {
    const mockError = { message: 'Session error', name: 'AuthError', status: 500 };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: mockError,
    } as any);

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Session error')).toBeInTheDocument();
    });
  });

  it('should update user on auth state change', async () => {
    let authCallback: any;

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      } as any;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });

    // Simulate auth state change
    authCallback('SIGNED_IN', {
      user: mockUser,
      access_token: 'token',
      refresh_token: 'refresh',
    });

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });

    expect(setSentryUser).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'test@example.com',
    });
  });

  it('should clear user on sign out', async () => {
    let authCallback: any;

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: 'token',
          refresh_token: 'refresh',
        },
      },
      error: null,
    } as any);

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      } as any;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });

    // Simulate sign out
    authCallback('SIGNED_OUT', null);

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });

    expect(clearSentryUser).toHaveBeenCalled();
  });

  it('should handle signOut function', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: 'token',
          refresh_token: 'refresh',
        },
      },
      error: null,
    } as any);

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any);

    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null,
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    signOutButton.click();

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    expect(clearSentryUser).toHaveBeenCalled();
  });

  it('should handle signOut errors', async () => {
    const mockError = { message: 'Sign out failed', name: 'AuthError', status: 500 };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: 'token',
          refresh_token: 'refresh',
        },
      },
      error: null,
    } as any);

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any);

    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: mockError,
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    signOutButton.click();

    await waitFor(() => {
      expect(screen.getByText('Error: Sign out failed')).toBeInTheDocument();
    });
  });

  it('should unsubscribe from auth changes on unmount', async () => {
    const unsubscribeMock = vi.fn();

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    } as any);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow();

    consoleErrorSpy.mockRestore();
  });

  it('should handle multiple auth state changes', async () => {
    let authCallback: any;

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      } as any;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });

    // Sign in
    authCallback('SIGNED_IN', {
      user: mockUser,
      access_token: 'token',
      refresh_token: 'refresh',
    });

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });

    // Sign out
    authCallback('SIGNED_OUT', null);

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });

    // Sign in again
    authCallback('SIGNED_IN', {
      user: { ...mockUser, email: 'new@example.com' },
      access_token: 'token2',
      refresh_token: 'refresh2',
    });

    await waitFor(() => {
      expect(screen.getByText('User: new@example.com')).toBeInTheDocument();
    });
  });
});
