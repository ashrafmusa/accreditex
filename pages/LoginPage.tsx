import React, { useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { LogoIcon } from "../components/icons";
import { useUserStore } from "../stores/useUserStore";
import { useAppStore } from "../stores/useAppStore";
import Globe from "../components/ui/Globe";
import LoginForm from "../components/auth/LoginForm";

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useUserStore((state) => state.login);
  const appSettings = useAppStore((state) => state.appSettings);

  const handleLogin = async (email, password) => {
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (!user) {
        setError(t("invalidCredentials"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!appSettings) {
    return null; // Or a loading state
  }

  const globeSettings = appSettings.globeSettings;
  const userLocation = { lat: 24.7136, long: 46.6753 }; // Riyadh, Saudi Arabia

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-900">
      {/* Left Side: Form */}
      <div className="flex flex-col justify-center items-center p-8 relative z-10">
        <div className="w-full max-w-sm">
          <div className="bg-brand-surface dark:bg-dark-brand-surface p-10 rounded-2xl shadow-2xl border border-brand-border dark:border-dark-brand-border animate-[fadeInUp_0.5s_ease-out]">
            <div className="flex flex-col items-center text-center gap-3 mb-8 animate-[scaleIn_0.5s_ease-out]">
              {appSettings?.logoUrl ? (
                <img
                  src={appSettings.logoUrl}
                  alt="App Logo"
                  className="h-12 w-12"
                />
              ) : (
                <LogoIcon className="h-12 w-12 text-brand-primary" />
              )}
              <h1 className="text-3xl font-bold">
                <span className="text-brand-text-primary dark:text-dark-brand-text-primary">
                  Accredit
                </span>
                <span className="text-brand-primary">Ex</span>
              </h1>
            </div>
            <LoginForm onLogin={handleLogin} loading={loading} error={error} />
          </div>
        </div>
      </div>

      {/* Right Side: Globe */}
      <div className="hidden lg:flex relative items-center justify-center p-8 dot-grid overflow-hidden">
        <div className="w-[700px] h-[700px] max-w-full max-h-full">
          <Globe
            width={700}
            height={700}
            {...globeSettings}
            userLocation={userLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
