import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient'
import { setSentryUser, clearSentryUser } from '@/lib/sentry'
import { withAsyncErrorTracking } from '@/lib/asyncErrorHandler';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Get initial session
    withAsyncErrorTracking('auth:getSession', async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      // Set Sentry user context
      if (session?.user) {
        setSentryUser({
          id: session.user.id,
          email: session.user.email,
        });
      }
      
      if (error) setError(error);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // Update Sentry user context
      if (session?.user) {
        setSentryUser({
          id: session.user.id,
          email: session.user.email,
        });
      } else {
        clearSentryUser();
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await withAsyncErrorTracking('auth:signOut', async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error);
      } else {
        setError(null);
        clearSentryUser();
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
