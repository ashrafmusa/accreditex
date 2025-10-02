import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import { User, UserRole, NavigationState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { PlusIcon, UsersIcon } from '../components/icons';
import UserModal from '../components/users/UserModal';
import UserRow from '../components/users/UserRow';
import EmptyState from '../components/common/EmptyState';
import { useUserStore } from '../stores/useUserStore';
import { useAppStore } from '../stores/useAppStore';

interface UsersPageProps {
  setNavigation: (state: NavigationState) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ setNavigation }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { users, currentUser, addUser: onCreateUser, updateUser: onUpdateUser, deleteUser: onDeleteUser } = useUserStore();
  const { departments, appSettings } = useAppStore();

  const handleOpenUserModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingUser(null); };

  const handleSaveUser = (user: User | Omit<User, 'id'>) => {
    if ('id' in user) { onUpdateUser(user); } else { onCreateUser(user); }
    handleCloseModal();
  };
  
  const handleDelete = (userId: string) => { if (window.confirm(t('areYouSureDeleteUser'))) { onDeleteUser(userId); } }

  const handleSelectUser = (userId: string) => {
    setNavigation({ view: 'userProfile', userId });
  };

  const usersWithDepartments = useMemo(() => 
    users.map(user => ({...user, department: departments.find(d => d.id === user.departmentId)})), 
  [users, departments]);

  const isLastAdmin = useMemo(() => {
    return users.filter(u => u.role === UserRole.Admin).length === 1;
  }, [users]);

  if (!currentUser || !appSettings) {
    return null; // or a loading indicator
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
          <UsersIcon className="h-8 w-8 text-brand-primary" />
          <div>
            <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('userManagement')}</h1>
            <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('usersPageDescription')}</p>
          </div>
        </div>
        {currentUser.role === UserRole.Admin && (<button onClick={() => handleOpenUserModal()} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center font-semibold shadow-sm w-full md:w-auto"><PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('addNewUser')}</button>)}
      </div>
      
      <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('userName')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('userEmail')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('department')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('userRole')}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
              {usersWithDepartments.length > 0 ? usersWithDepartments.map((user) => (
                <UserRow key={user.id} user={user} currentUser={currentUser} onSelect={handleSelectUser} onEdit={() => handleOpenUserModal(user)} onDelete={handleDelete} />
              )) : (
                <tr>
                    <td colSpan={5}>
                        <EmptyState icon={UsersIcon} title={t('noUsersFound')} message="Add a new user to start building your team."/>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (<UserModal user={editingUser} departments={departments} onSave={handleSaveUser} onClose={handleCloseModal} appSettings={appSettings} disableRoleChange={isLastAdmin && editingUser?.role === UserRole.Admin} />)}
    </div>
  );
};

export default UsersPage;