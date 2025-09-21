import React from 'react';
import { LogoIcon } from '../icons';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-brand-background dark:bg-dark-brand-background">
      <div className="animate-pulse">
        <LogoIcon className="h-16 w-16" />
      </div>
      <h1 className="text-3xl font-bold mt-4 animate-pulse">
        <span className="text-brand-text-primary dark:text-dark-brand-text-primary">Accredit</span>
        <span className="text-brand-primary">Ex</span>
      </h1>
    </div>
  );
};

export default LoadingScreen;