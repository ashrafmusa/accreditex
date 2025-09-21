import React, { useState, useEffect } from "react";
import { NavigationState, User } from "@/types";
import { backendService } from "@/services/BackendService";
import Layout from "@/components/common/Layout";
import { LanguageProvider } from "@/components/common/LanguageProvider";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { ToastProvider } from "@/components/common/Toast";
import { useToast } from "@/hooks/useToast";
import MainRouter from "@/components/common/MainRouter";
import OnboardingPage from "@/pages/OnboardingPage";
import LoginPage from "@/pages/LoginPage";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useProjectStore } from "@/stores/useProjectStore";
import { useUserStore } from "@/stores/useUserStore";
import { useAppStore } from "@/stores/useAppStore";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppInitializer />
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

const AppInitializer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const fetchAllAppData = useAppStore((state) => state.fetchAllData);
  const appSettings = useAppStore((state) => state.appSettings);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await backendService.initialize();
        await fetchAllAppData();
        await fetchProjects();
        await fetchUsers();
      } catch (error) {
        console.error("Failed to initialize application:", error);
        toast.error("Failed to load application data. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (appSettings?.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary-color', appSettings.primaryColor);
    }
  }, [appSettings?.primaryColor]);

  if (isLoading || !appSettings) {
    return <LoadingScreen />;
  }

  return <AppManager />;
};

const AppManager: React.FC = () => {
  const [navigation, setNavigation] = useState<NavigationState>({
    view: "dashboard",
  });

  const currentUser = useUserStore((state) => state.currentUser);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(
    () => !localStorage.getItem("accreditex-onboarding-complete")
  );

  const handleLogin = async (user: User) => {
    if (!showOnboarding) {
      setNavigation({ view: "dashboard" });
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("accreditex-onboarding-complete", "true");
    setShowOnboarding(false);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (showOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-brand-background dark:bg-dark-brand-background text-brand-text-primary dark:text-dark-brand-text-primary">
      <Layout setNavigation={setNavigation} navigation={navigation}>
        <MainRouter navigation={navigation} setNavigation={setNavigation} />
      </Layout>
    </div>
  );
};

export default App;