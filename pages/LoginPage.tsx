
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../stores/useAppStore';
import { useUserStore } from '../stores/useUserStore';
import Globe from '../components/ui/Globe';
import LoginForm from '../components/login/LoginForm';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const { appSettings } = useAppStore();
  const { isLoggingIn } = useUserStore();
  const [location, setLocation] = useState<{ lat: number, long: number } | undefined>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, long: pos.coords.longitude }),
      () => console.warn("Could not get user location for globe.")
    );
  }, []);

  if (!appSettings) {
    return null; // or a minimal loading state
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:flex items-center justify-center bg-dark-brand-background dot-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent"></div>
        <div className="relative z-10 w-full h-full max-w-2xl max-h-screen flex items-center justify-center">
            <Globe 
                width={800} 
                height={800}
                {...appSettings.globeSettings}
                userLocation={location}
            />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center bg-brand-surface dark:bg-dark-brand-surface p-8">
        <div className="w-full max-w-sm">
            <LoginForm onLogin={onLogin} isLoggingIn={isLoggingIn} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
