import React, { useState, useEffect, useRef } from "react";
// FIX: Corrected import path for types
import { NavigationState, User } from "./types";
import { backendService } from "./services/BackendService";
import Layout from "./components/common/Layout";
import { LanguageProvider } from "./components/common/LanguageProvider";
import { ThemeProvider } from "./components/common/ThemeProvider";
import { ToastProvider } from "./components/common/Toast";
import { useToast } from "./hooks/useToast";
import MainRouter from "./components/common/MainRouter";
import OnboardingPage from "./pages/OnboardingPage";
// FIX: Corrected import path for LoginPage
import LoginPage from "./pages/LoginPage";
import LoadingScreen from "./components/common/LoadingScreen";
import { useProjectStore } from "./stores/useProjectStore";
import { useUserStore } from "./stores/useUserStore";
import { useAppStore } from "./stores/useAppStore";

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
  console.log("DEBUG: Rendering AppInitializer");
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const initialized = useRef(false);

  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const fetchAllAppData = useAppStore((state) => state.fetchAllData);
  const appSettings = useAppStore((state) => state.appSettings);

  useEffect(() => {
    console.log("DEBUG: Running initializeApp useEffect - SHOULD RUN ONCE");
    const initializeApp = async () => {
      if (initialized.current) {
        return;
      }
      initialized.current = true;

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

    const handleOnline = async () => {
      toast.info("You are back online. Syncing changes...");
      try {
        await backendService.processOfflineQueue();
        // Refetch all data to ensure UI is consistent after sync
        await fetchAllAppData();
        await fetchProjects();
        await fetchUsers();
        toast.success("Offline changes synced successfully!");
      } catch (error) {
        console.error("Failed to sync offline changes:", error);
        toast.error("Failed to sync some offline changes.");
      }
    };

    const handleOffline = () => {
      toast.info("You are offline. Changes will be saved and synced later.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Set the primary color theme variable when app settings load/change.
  useEffect(() => {
    console.log("DEBUG: Running primaryColor useEffect");
    if (appSettings?.primaryColor) {
      document.documentElement.style.setProperty(
        "--brand-primary-color",
        appSettings.primaryColor
      );
    }
  }, [appSettings?.primaryColor]);

  if (isLoading || !appSettings) {
    return <LoadingScreen />;
  }

  return <AppManager />;
};

const AppManager: React.FC = () => {
  console.log("DEBUG: Rendering AppManager");
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
