import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] px-4">
      <main className="w-full max-w-md" role="main">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-mono tracking-widest text-[#ea5c2a] mb-2">
            // KŌBO_TERMINAL
          </h1>
          <p className="text-gray-400 font-mono text-sm tracking-wider">AUTHENTICATION_REQUIRED</p>
        </div>
        
        <div className="bg-[#252525] border border-[#ea5c2a] rounded-lg p-8" role="region" aria-label="Authentication form">
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#ea5c2a',
                    brandAccent: '#d14d1f',
                    defaultButtonBackground: '#1e1e1e',
                    defaultButtonBackgroundHover: '#252525',
                    defaultButtonBorder: '#333',
                    defaultButtonText: '#fff',
                    inputBackground: '#1e1e1e',
                    inputBorder: '#333',
                    inputBorderHover: '#ea5c2a',
                    inputBorderFocus: '#ea5c2a',
                    inputText: '#fff',
                    inputLabelText: '#999',
                    inputPlaceholder: '#666',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '12px',
                    baseButtonSize: '14px',
                  },
                  fonts: {
                    bodyFontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    buttonFontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    inputFontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    labelFontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  },
                  radii: {
                    borderRadiusButton: '4px',
                    buttonBorderRadius: '4px',
                    inputBorderRadius: '4px',
                  },
                },
              },
              style: {
                button: {
                  backgroundColor: '#ea5c2a',
                  color: '#000',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '12px 24px',
                },
                anchor: {
                  color: '#ea5c2a',
                  textDecoration: 'none',
                },
                message: {
                  color: '#ea5c2a',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #ea5c2a',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                },
              },
            }}
            theme="dark"
            localization={{
              variables: {
                sign_in: {
                  button_label: 'ACCESS_TERMINAL',
                },
                sign_up: {
                  button_label: 'REGISTER_ACCESS',
                },
              },
            }}
          />
        </div>

        <p className="text-center text-xs text-gray-500 mt-6 font-mono tracking-wider">
          // BY_ACCESSING_TERMINAL_YOU_AGREE_TO_TOS_AND_PRIVACY_POLICY
        </p>
      </main>
    </div>
  );
};

export default Login;
