import React, { useState, useEffect } from 'react';
import { useUserStore } from './stores/useUserStore';
import { useAppStore } from './stores/useAppStore';
import { LanguageProvider } from './components/common/LanguageProvider';
import { ThemeProvider } from './components/common/ThemeProvider';
import { ToastProvider } from './components/common/Toast';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import Layout from './components/common/Layout';
// FIX: Added file extension to resolve module error
import LoadingScreen from './components/common/LoadingScreen.tsx';
import { useFirebaseAuth } from './firebase/firebaseHooks';
import { initialDataService } from './services/initialData';
import { useProjectStore } from './stores/useProjectStore';

const App: React.FC = () => {
  const { currentUser, isLoggingIn, login } = useUserStore();
  const { initialize: initializeAppSettings } = useAppStore();
  const { initialize: initializeProjectStore } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useFirebaseAuth();

  useEffect(() => {
    const initializeApp = async () => {
      const data = initialDataService.loadInitialData();
      initializeAppSettings(data.appSettings);
      // FIX: Pass the entire data object to initializeProjectStore, not just appSettings.
      initializeProjectStore(data);

      const hasOnboarded = localStorage.getItem('accreditex-onboarded') === 'true';
      if (!hasOnboarded) {
        setShowOnboarding(true);
      }
      setIsLoading(false);
    };
    initializeApp();
  }, [initializeAppSettings, initializeProjectStore]);

  const handleLogin = (email: string, pass: string) => {
    const user = initialDataService.findUserByCredentials(email, pass);
    if (user) {
      login(user);
    } else {
      // In a real app, this would be a proper error message
      alert('Invalid credentials');
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('accreditex-onboarded', 'true');
    setShowOnboarding(false);
  };

  if (isLoading || isLoggingIn) {
    return <LoadingScreen />;
  }
  
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ToastProvider>
          {!currentUser ? (
            <LoginPage onLogin={handleLogin} />
          ) : showOnboarding ? (
            <OnboardingPage onComplete={handleOnboardingComplete} />
          ) : (
            <Layout />
          )}
        </ToastProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
