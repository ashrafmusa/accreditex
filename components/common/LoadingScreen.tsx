import React from 'react';
import { LogoIcon, SpinnerIcon } from '../icons';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-brand-background dark:bg-dark-brand-background">
      <div className="flex flex-col items-center space-y-4">
        <LogoIcon className="h-16 w-16 text-brand-primary animate-pulse" />
        <SpinnerIcon className="h-8 w-8 text-brand-text-secondary dark:text-dark-brand-text-secondary animate-spin" />
        <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary">Loading AccreditEx...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
