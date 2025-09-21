import React from 'react';
import { NavigationState, Notification } from '@/types';
import { Bars3Icon } from '@/components/icons';
import HeaderTitle from './HeaderTitle';
import HeaderActions from './HeaderActions';
import NotificationButton from './NotificationButton';
import UserMenu from './UserMenu';

interface HeaderProps {
  navigation: NavigationState;
  notifications: Notification[];
  onToggleMobileMenu: () => void;
  onOpenCommandPalette: () => void;
  setNavigation: (state: NavigationState) => void;
  onMarkAsRead: (notificationId: string | 'all') => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ navigation, notifications, onToggleMobileMenu, onOpenCommandPalette, setNavigation, onMarkAsRead, onLogout }) => {
  return (
    <header className="h-16 bg-brand-surface dark:bg-dark-brand-surface border-b border-brand-border dark:border-dark-brand-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center">
        <button onClick={onToggleMobileMenu} className="sm:hidden p-2 text-brand-text-secondary dark:text-dark-brand-text-secondary">
          <Bars3Icon className="h-6 w-6" />
        </button>
        <HeaderTitle navigation={navigation} />
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
        <HeaderActions onOpenCommandPalette={onOpenCommandPalette} />
        <NotificationButton 
            notifications={notifications}
            setNavigation={setNavigation}
            onMarkAsRead={onMarkAsRead}
            navigation={navigation}
        />
        <UserMenu 
            onLogout={onLogout}
            setNavigation={setNavigation}
            navigation={navigation}
        />
      </div>
    </header>
  );
};

export default Header;