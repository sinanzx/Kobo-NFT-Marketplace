import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { recordConsent, hasConsent } from '@/lib/gdprService';

const COOKIE_CONSENT_KEY = 'kobo_cookie_consent';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch {
        // Invalid data, show banner
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = async (prefs: CookiePreferences) => {
    try {
      // Record consents in Supabase
      const CONSENT_VERSION = '1.0.0';
      await Promise.all([
        recordConsent('cookies', true, CONSENT_VERSION),
        recordConsent('analytics', prefs.analytics, CONSENT_VERSION),
        recordConsent('marketing', prefs.preferences, CONSENT_VERSION),
      ]);
    } catch (error) {
      console.error('Failed to record consent in database:', error);
      // Continue with localStorage fallback
    }

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Apply preferences
    if (!prefs.analytics) {
      // Disable analytics cookies
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('_ga') || name.startsWith('_gid')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    }
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      preferences: true,
    });
  };

  const acceptEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      preferences: false,
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700 shadow-2xl"
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
      >
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 id="cookie-banner-title" className="text-lg font-semibold text-white mb-2">
                🍪 We use cookies
              </h2>
              <p id="cookie-banner-description" className="text-sm text-gray-300">
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to our use of cookies.{' '}
                <a
                  href="/privacy-policy"
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Customize cookie preferences"
              >
                Customize
              </button>
              <button
                onClick={acceptEssential}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Accept only essential cookies"
              >
                Essential Only
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                aria-label="Accept all cookies"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-labelledby="cookie-settings-title"
          aria-modal="true"
        >
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 id="cookie-settings-title" className="text-2xl font-bold text-white">
                  Cookie Preferences
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close cookie settings"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Essential Cookies
                      </h3>
                      <p className="text-sm text-gray-400">
                        Required for the platform to function. These cannot be disabled.
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 cursor-not-allowed"
                        aria-label="Essential cookies (always enabled)"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Examples: Authentication, session management, security
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Analytics Cookies
                      </h3>
                      <p className="text-sm text-gray-400">
                        Help us understand how visitors interact with our platform.
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({ ...preferences, analytics: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                        aria-label="Enable analytics cookies"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Examples: Google Analytics, error tracking (Sentry)
                  </p>
                </div>

                {/* Preference Cookies */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Preference Cookies
                      </h3>
                      <p className="text-sm text-gray-400">
                        Remember your settings and preferences for a better experience.
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.preferences}
                        onChange={(e) =>
                          setPreferences({ ...preferences, preferences: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                        aria-label="Enable preference cookies"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Examples: Language preference, theme settings, UI customization
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptEssential}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={saveCustom}
                  className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                >
                  Save Preferences
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                You can change your preferences at any time in your account settings.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
