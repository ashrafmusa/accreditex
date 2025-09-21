import React, { useState, FormEvent } from "react";
import { User } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import {
  LogoIcon,
  EyeIcon,
  EyeSlashIcon,
  SpinnerIcon,
} from "@/components/icons";
import { useToast } from "@/hooks/useToast";
import { useUserStore } from "@/stores/useUserStore";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const login = useUserStore((state) => state.login);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(async () => {
      const user = await login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError(t("invalidCredentials"));
        toast.error(t("invalidCredentials"));
      }
      setIsLoading(false);
    }, 500);
  };

  const handleDemoLogin = () => {
    setEmail("e.reed@healthcare.com");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 overflow-hidden relative bg-gradient-to-br from-slate-950 to-slate-800">
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <LogoIcon className="h-12 w-12 mx-auto" />
          <h1 className="text-3xl font-bold mt-4">
            <span className="text-slate-100">Accredit</span>
            <span className="text-brand-primary">Ex</span>
          </h1>
        </div>
        <div className="bg-dark-brand-surface/50 border border-dark-brand-border rounded-xl shadow-2xl backdrop-blur-sm">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-center text-slate-100">
              {t("login")}
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-400"
                >
                  {t("emailAddress")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-800 text-slate-100"
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-400"
                >
                  {t("password")}
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-800 text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-500 text-center animate-[fadeIn_0.3s_ease-out]">
                  {error}
                </p>
              )}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
                >
                  {isLoading && (
                    <SpinnerIcon className="animate-spin h-5 w-5 text-white" />
                  )}
                  {isLoading ? "..." : t("loginButton")}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={handleDemoLogin}
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            Use Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;