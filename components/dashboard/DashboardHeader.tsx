import React from 'react';
import { User, NavigationState } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface DashboardHeaderProps {
  currentUser: User;
  setNavigation: (state: NavigationState) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentUser, setNavigation }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary">
        {t('welcomeBack').replace('{name}', currentUser.name.split(' ')[0])}
      </h1>
      <p className="mt-1 text-brand-text-secondary dark:text-dark-brand-text-secondary">
        {t('dashboardGreeting')}
      </p>
    </div>
  );
};

export default DashboardHeader;
