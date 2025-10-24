import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useUserStore } from '../../stores/useUserStore';
import Header from './Header';
import NavigationRail from './NavigationRail';
// FIX: Added file extension to resolve module error
import MobileSidebar from './MobileSidebar.tsx';
import MainRouter from './MainRouter';
import CommandPalette from './CommandPalette';
import { useProjectStore } from '../../stores/useProjectStore';

const Layout: React.FC = () => {
  const { navigation, setNavigation } = useAppStore();
  const { currentUser, logout, notifications, markNotificationAsRead } = useUserStore();
  const { projects } = useProjectStore();
  const { users, documents, standards, programs } = useAppStore();
  
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  if (!currentUser) {
    return null; // or a redirect to login
  }

  return (
    <div className="flex h-screen bg-brand-background dark:bg-dark-brand-background text-brand-text-primary dark:text-dark-brand-text-primary">
      <NavigationRail
        navigation={navigation}
        setNavigation={setNavigation}
        isExpanded={isNavExpanded}
        setIsExpanded={setIsNavExpanded}
      />
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        navigation={navigation}
        setNavigation={setNavigation}
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isNavExpanded ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <Header
          navigation={navigation}
          notifications={notifications}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          setNavigation={setNavigation}
          onMarkAsRead={markNotificationAsRead}
          onLogout={logout}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <MainRouter />
        </main>
      </div>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        setIsOpen={setCommandPaletteOpen}
        setNavigation={setNavigation}
        projects={projects}
        users={users}
        documents={documents}
        standards={standards}
        programs={programs}
      />
    </div>
  );
};

export default Layout;
