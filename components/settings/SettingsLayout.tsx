import React from 'react';
import { NavigationState, SettingsSection } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Cog6ToothIcon, UserCircleIcon, UserGroupIcon, CircleStackIcon, InformationCircleIcon, ShieldCheckIcon, IdentificationIcon, KeyIcon } from '../icons';
import UsersPage from '../../pages/UsersPage';
import AccreditationHubPage from '../../pages/AccreditationHubPage';
import CompetencyLibraryPage from '../competencies/CompetencyLibraryPage';
import GeneralSettingsPage from './GeneralSettingsPage';
import ProfileSettingsPage from './ProfileSettingsPage';
import DataSettingsPage from './DataSettingsPage';
import AboutSettingsPage from './AboutSettingsPage';
import SecuritySettingsPage from './SecuritySettingsPage';


interface SettingsLayoutProps {
  section?: SettingsSection;
  setNavigation: (state: NavigationState) => void;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ section, setNavigation }) => {
  const { t } = useTranslation();
  const activeSection = section || 'general';
  
  const navItems = [
    { id: 'general', label: t('general'), icon: Cog6ToothIcon },
    { id: 'profile', label: t('profile'), icon: UserCircleIcon },
    { id: 'security', label: t('security'), icon: KeyIcon },
    { id: 'users', label: t('users'), icon: UserGroupIcon },
    { id: 'accreditationHub', label: t('accreditationHub'), icon: ShieldCheckIcon },
    { id: 'competencies', label: t('competencies'), icon: IdentificationIcon },
    { id: 'data', label: t('dataManagement'), icon: CircleStackIcon },
    { id: 'about', label: t('about'), icon: InformationCircleIcon },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'general': return <GeneralSettingsPage />;
      case 'profile': return <ProfileSettingsPage />;
      case 'security': return <SecuritySettingsPage />;
      case 'users': return <UsersPage setNavigation={setNavigation} />;
      case 'accreditationHub': return <AccreditationHubPage setNavigation={setNavigation} />;
      case 'competencies': return <CompetencyLibraryPage />;
      case 'data': return <DataSettingsPage />;
      case 'about': return <AboutSettingsPage />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <Cog6ToothIcon className="h-8 w-8 text-brand-primary" />
        <div>
          <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('settings')}</h1>
          <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('settingsPageDescription')}</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
          <aside className="w-full md:w-1/4 lg:w-1/5">
              <nav className="space-y-1">
                  {navItems.map(item => (
                      <button 
                          key={item.id}
                          onClick={() => setNavigation({ view: 'settings', section: item.id as SettingsSection })}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              activeSection === item.id 
                                ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-indigo-300' 
                                : 'text-brand-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                      </button>
                  ))}
              </nav>
          </aside>
          <main className="w-full md:w-3/4 lg:w-4/5 settings-page">
            {renderSection()}
          </main>
      </div>
    </div>
  );
};

export default SettingsLayout;