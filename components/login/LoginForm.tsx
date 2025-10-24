
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppStore } from '../../stores/useAppStore';
import { LogoIcon, EyeIcon, EyeSlashIcon, SpinnerIcon } from '../icons';

interface LoginFormProps {
    onLogin: (email: string, pass: string) => void;
    isLoggingIn: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoggingIn }) => {
    const { t } = useTranslation();
    const { appSettings } = useAppStore();
    const [email, setEmail] = useState('e.reed@healthcare.com');
    const [password, setPassword] = useState('password123');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <>
            <div className="flex items-center justify-center mb-8">
                {appSettings?.logoUrl ? <img src={appSettings.logoUrl} alt="Logo" className="h-12"/> : <LogoIcon className="h-12 w-12 text-brand-primary"/>}
                <h1 className="text-4xl font-bold ml-3">
                    <span className="text-brand-text-primary dark:text-dark-brand-text-primary">Accredit</span><span className="text-brand-primary">Ex</span>
                </h1>
            </div>
            <h2 className="text-2xl font-semibold text-center text-brand-text-primary dark:text-dark-brand-text-primary">{t('login')}</h2>
            <p className="text-sm text-center text-brand-text-secondary dark:text-dark-brand-text-secondary mt-2 mb-8">{t('welcomeBack')}</p>
        
            <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('email')}</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                        required
                        autoComplete="email"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
                    <div className="relative mt-1">
                        <input
                            type={isPasswordVisible ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                            required
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                        >
                            {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-indigo-400"
                >
                    {isLoggingIn ? <SpinnerIcon className="animate-spin h-5 w-5 text-white" /> : t('login')}
                </button>
            </form>
        </>
    );
};

export default LoginForm;
