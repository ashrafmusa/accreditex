import React, { useState, useEffect } from 'react';
import Header from './Header';
// FIX: Corrected import path for types
import { NavigationState, Notification } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import MobileSidebar from './MobileSidebar';
import NavigationRail from './NavigationRail';
import CommandPalette from './CommandPalette';
import { backendService } from '../../services/BackendService';
import { useUserStore } from '../../stores/useUserStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useAppStore } from '../../stores/useAppStore';

interface LayoutProps {
  navigation: NavigationState;
  setNavigation: (state: NavigationState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ navigation, setNavigation, children }) => {
  console.log("DEBUG: Rendering Layout component");
  const { dir } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const currentUser = useUserStore(state => state.currentUser)!;
  const projects = useProjectStore(state => state.projects);
  const logout = useUserStore(state => state.logout);
  const users = useUserStore(state => state.users);
  
  // FIX: Split combined selector to prevent unnecessary re-renders from new object references.
  const documents = useAppStore(state => state.documents);
  const standards = useAppStore(state => state.standards);
  const accreditationPrograms = useAppStore(state => state.accreditationPrograms);


  useEffect(() => {
    console.log("DEBUG: Running fetchNotifications useEffect in Layout");
    const fetchNotifications = () => {
        const userNotifications = backendService.getNotifications(currentUser.id);
        // FIX: Only set state if notifications have actually changed to prevent re-renders every 5s.
        setNotifications(prevNotifications => {
          if (JSON.stringify(prevNotifications) !== JSON.stringify(userNotifications)) {
            return userNotifications;
          }
          return prevNotifications;
        });
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const handleMarkAsRead = (notificationId: string | 'all') => {
    if (notificationId === 'all') {
      backendService.markAllNotificationsAsRead(currentUser.id);
    } else {
      backendService.markNotificationAsRead(currentUser.id, notificationId);
    }
    const userNotifications = backendService.getNotifications(currentUser.id);
    setNotifications(userNotifications);
  };

  const isProjectsActive = ['projects', 'projectDetail', 'createProject', 'editProject'].includes(navigation.view);
  const isSettingsActive = navigation.view === 'settings';

  return (
    <>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        setIsOpen={setIsCommandPaletteOpen}
        setNavigation={setNavigation}
        projects={projects}
        users={users}
        documents={documents}
        standards={standards}
        programs={accreditationPrograms}
      />
      <div className={`flex h-screen ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <div className="hidden sm:block">
          <NavigationRail 
              setNavigation={setNavigation} 
              navigation={navigation}
              isExpanded={isNavExpanded}
              setIsExpanded={setIsNavExpanded}
          />
        </div>
        <MobileSidebar 
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
          setNavigation={setNavigation}
          navigation={navigation}
          isProjectsActive={isProjectsActive}
          isSettingsActive={isSettingsActive}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            navigation={navigation} 
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            notifications={notifications}
            setNavigation={setNavigation}
            onLogout={logout}
            onMarkAsRead={handleMarkAsRead}
          />
          <main className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-brand-background dark:bg-dark-brand-background page-enter-active transition-all duration-300 ${isNavExpanded ? 'sm:ml-64' : 'sm:ml-20'}`}>
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;