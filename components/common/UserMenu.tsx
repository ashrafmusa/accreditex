import React, { useState, useRef, useEffect } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { useTranslation } from '../../hooks/useTranslation';
import { NavigationState } from '../../types';

interface UserMenuProps {
    onLogout: () => void;
    setNavigation: (state: NavigationState) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout, setNavigation }) => {
    const { currentUser } = useUserStore();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!currentUser) return null;

    const handleLinkClick = (nav: NavigationState) => {
        setNavigation(nav);
        setIsOpen(false);
    }
    
    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 rtl:space-x-reverse focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-indigo-700 text-white flex items-center justify-center font-bold">
                    {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{currentUser.name}</div>
                    <div className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary">{currentUser.role}</div>
                </div>
            </button>

            {isOpen && (
                 <div className="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-48 bg-brand-surface dark:bg-dark-brand-surface rounded-md shadow-2xl border border-brand-border dark:border-dark-brand-border z-50 animate-[fadeInUp_0.2s_ease-out]">
                    <div className="p-2">
                        <button onClick={() => handleLinkClick({ view: 'userProfile', userId: currentUser.id })} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">{t('myProfile')}</button>
                        <button onClick={() => handleLinkClick({ view: 'settings' })} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">{t('settings')}</button>
                    </div>
                    <div className="border-t border-brand-border dark:border-dark-brand-border p-2">
                         <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">{t('logout')}</button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default UserMenu;
