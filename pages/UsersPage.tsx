import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useUserStore } from '../stores/useUserStore';
import { useTranslation } from '../hooks/useTranslation';
import { UsersIcon, PlusIcon, SearchIcon } from '../components/icons';
import { User, UserRole, Department, NavigationState } from '../types';
import UserRow from '../components/users/UserRow';
import UserModal from '../components/users/UserModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useToast } from '../hooks/useToast';

interface UsersPageProps {
  setNavigation: (state: NavigationState) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ setNavigation }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const { users, departments, addUser, updateUser, deleteUser } = useAppStore();
    const { currentUser } = useUserStore();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const usersWithDepartments = useMemo(() => 
        users.map(user => ({
            ...user,
            department: departments.find(d => d.id === user.departmentId)
        })), [users, departments]);
    
    const filteredUsers = useMemo(() => 
        usersWithDepartments.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        }), [usersWithDepartments, searchTerm, roleFilter]);

    const handleSaveUser = (user: User | Omit<User, 'id'>) => {
        if('id' in user) {
            updateUser(user);
            toast.success(t('userUpdated'));
        } else {
            addUser(user);
            toast.success(t('userAdded'));
        }
        setIsUserModalOpen(false);
    };

    const handleDeleteUser = () => {
        if (deletingUser && currentUser?.id !== deletingUser.id) {
            deleteUser(deletingUser.id);
            toast.success(t('userDeleted'));
            setDeletingUser(null);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold">{t('userManagement')}</h2>
                <button onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-semibold shadow-sm w-full sm:w-auto">
                    <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('addNewUser')}
                </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder={t('searchUsers')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full ltr:pl-10 rtl:pr-10 px-4 py-2 border rounded-lg" />
                </div>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full sm:w-48 border rounded-lg py-2 px-3">
                    <option value="all">{t('allRoles')}</option>
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
            </div>

            <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('name')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('userEmail')}</th>
                            {/* FIX: Cast translation key to any */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('department' as any)}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('role')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('actions')}</span></th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
                        {filteredUsers.map((user) => (
                            <UserRow 
                                key={user.id} 
                                user={user}
                                currentUser={currentUser!}
                                onSelect={(id) => setNavigation({ view: 'userProfile', userId: id })}
                                onEdit={() => { setEditingUser(user); setIsUserModalOpen(true); }}
                                onDelete={() => setDeletingUser(user)}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isUserModalOpen && (
                <UserModal 
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                    onSave={handleSaveUser}
                    existingUser={editingUser}
                    departments={departments}
                    isLastAdmin={users.filter(u => u.role === UserRole.Admin).length === 1 && editingUser?.role === UserRole.Admin}
                />
            )}

            {deletingUser && (
                <ConfirmationModal
                    isOpen={!!deletingUser}
                    onClose={() => setDeletingUser(null)}
                    onConfirm={handleDeleteUser}
                    title={t('deleteUser')}
                    message={t('areYouSureDeleteUser').replace('{name}', deletingUser.name)}
                    confirmationText={t('delete')}
                />
            )}
        </div>
    );
};

export default UsersPage;