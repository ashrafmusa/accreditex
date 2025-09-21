

import React from 'react';
import { NavigationState, SettingsSection } from '@/types';
import { ChartPieIcon, FolderIcon, UsersIcon, LogoIcon, BuildingOffice2Icon, Cog6ToothIcon, AcademicCapIcon, ShieldCheckIcon, ClipboardDocumentCheckIcon, ChartBarSquareIcon, CalendarDaysIcon, ExclamationTriangleIcon, DocumentTextIcon, LightBulbIcon } from '@/components/icons';
import { useTranslation } from '@/hooks/useTranslation';

interface SidebarProps {
  setNavigation: (state: NavigationState) => void;
  navigation: NavigationState;
  isProjectsActive: boolean;
}

interface NavItemType {
  nav: NavigationState;
  key: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const Sidebar: React.FC<SidebarProps> = ({ setNavigation, navigation, isProjectsActive }) => {
  const { t } = useTranslation();
  const currentView = navigation.view;

  const navItems: NavItemType[] = [
    { nav: { view: 'dashboard' }, key: 'dashboard', label: t('dashboard'), icon: ChartPieIcon },
    { nav: { view: 'analytics' }, key: 'analytics', label: t('analytics'), icon: ChartBarSquareIcon },
    { nav: { view: 'qualityInsights' }, key: 'qualityInsights', label: t('qualityInsights'), icon: LightBulbIcon },
    { nav: { view: 'calendar' }, key: 'calendar', label: t('calendar'), icon: CalendarDaysIcon },
    { nav: { view: 'projects' }, key: 'projects', label: t('projects'), icon: FolderIcon },
    { nav: { view: 'documentControl' }, key: 'documentControl', label: t('documentControl'), icon: DocumentTextIcon },
    { nav: { view: 'myTasks' }, key: 'myTasks', label: t('myTasks'), icon: ClipboardDocumentCheckIcon },
    { nav: { view: 'risk' }, key: 'risk', label: t('riskHub'), icon: ExclamationTriangleIcon },
    { nav: { view: 'settings', section: 'users' }, key: 'users', label: t('userManagement'), icon: UsersIcon },
    { nav: { view: 'departments' }, key: 'departments', label: t('departments'), icon: BuildingOffice2Icon },
    { nav: { view: 'trainingHub' }, key: 'trainingHub', label: t('trainingHub'), icon: AcademicCapIcon },
  ];

  const bottomNavItems: NavItemType[] = [
    { nav: { view: 'settings' }, key: 'settings', label: t('settings'), icon: Cog6ToothIcon },
    { nav: { view: 'settings', section: 'accreditationHub' }, key: 'accreditationHub', label: t('accreditationHub'), icon: ShieldCheckIcon },
  ];

  const isActive = (key: string) => {
    if (key === 'projects') return isProjectsActive;

    if (navigation.view === 'settings') {
      const section = navigation.section;
      if (key === 'users') return section === 'users';
      if (key === 'accreditationHub') return section === 'accreditationHub' || currentView === 'standards';
      if (key === 'settings') return !section || ['general', 'profile', 'data', 'about'].includes(section || '');
    }
    
    return currentView === key;
  }

  return (
    <div className="w-64 bg-brand-text-primary text-white flex-col hidden sm:flex">
      <div className="flex items-center justify-center h-20 border-b border-white/10">
        <LogoIcon className="h-8 w-8 text-brand-primary" />
        <h1 className="text-2xl font-bold mx-3">
          <span className="text-gray-100">Accredit</span>
          <span className="text-brand-primary">Ex</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 flex flex-col justify-between">
        <ul>
          {navItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => setNavigation(item.nav)}
                className={`w-full text-left flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                  isActive(item.key)
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-6 w-6 ltr:mr-3 rtl:ml-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <ul>
        {bottomNavItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => setNavigation(item.nav)}
                className={`w-full text-left flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                  isActive(item.key)
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-6 w-6 ltr:mr-3 rtl:ml-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-gray-400">&copy; 2024 AccreditEx</p>
      </div>
    </div>
  );
};

export default Sidebar;