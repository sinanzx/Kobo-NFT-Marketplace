import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_STORAGE_KEY = 'kobo_onboarding_completed';

export const useOnboarding = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Check localStorage first for quick response
      const localCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      
      if (localCompleted === 'true') {
        setShowOnboarding(false);
        setLoading(false);
        return;
      }

      // If user is authenticated, check database
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          const completed = data?.onboarding_completed ?? false;
          
          if (completed) {
            localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
            setShowOnboarding(false);
          } else {
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Default to showing onboarding if there's an error
          setShowOnboarding(true);
        }
      } else {
        // For non-authenticated users, show onboarding if not completed locally
        setShowOnboarding(localCompleted !== 'true');
      }

      setLoading(false);
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = async () => {
    // Set localStorage immediately
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);

    // Update database if user is authenticated
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating onboarding status:', error);
      }
    }
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    loading,
    completeOnboarding,
    resetOnboarding,
  };
};
