import React, { useState, useEffect, FC } from 'react';
import { User, UserRole, Department } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import { labelClasses, inputClasses } from '../ui/constants';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User | Omit<User, 'id'>) => void;
  existingUser: User | null;
  departments: Department[];
  isLastAdmin: boolean;
}

const UserModal: FC<UserModalProps> = ({ isOpen, onClose, onSave, existingUser, departments, isLastAdmin }) => {
  const { t, lang } = useTranslation();
  const isEditMode = !!existingUser;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TeamMember);
  const [departmentId, setDepartmentId] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (existingUser) {
      setName(existingUser.name);
      setEmail(existingUser.email);
      setRole(existingUser.role);
      setDepartmentId(existingUser.departmentId || '');
      setPassword('');
    } else {
        setName('');
        setEmail('');
        setRole(UserRole.TeamMember);
        setDepartmentId('');
        setPassword('');
    }
  }, [existingUser, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUserData = {
        name,
        email,
        role,
        departmentId: departmentId || undefined,
    };
    if (isEditMode) {
      onSave({ 
        ...existingUser!, 
        ...baseUserData,
        ...(password && { password })
      });
    } else {
      // FIX: Ensure new user object has all required properties
      const newUserData: Omit<User, 'id'> = {
          ...baseUserData,
          password: password || 'password123',
          competencies: [],
          trainingAssignments: [],
          readAndAcknowledge: [],
      };
      onSave(newUserData);
    }
  };
  
  const footer = (
    <>
      <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">{t('cancel')}</button>
      <button type="submit" form="user-form" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('save')}</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('editUser' as any) : t('addNewUser' as any)} footer={footer} size="lg">
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClasses}>{t('name')}</label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>{t('userEmail' as any)}</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div title={isLastAdmin ? t('lastAdminRoleChange' as any) : ''}>
                <label htmlFor="role" className={labelClasses}>{t('role')}</label>
                <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className={inputClasses} disabled={isLastAdmin}>
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div>
                {/* FIX: Cast translation key to any */}
                <label htmlFor="department" className={labelClasses}>{t('department' as any)}</label>
                <select id="department" value={departmentId} onChange={e => setDepartmentId(e.target.value)} className={inputClasses}>
                    <option value="">{t('unassigned')}</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}
                </select>
            </div>
        </div>
        <div>
          <label htmlFor="password" className={labelClasses}>{isEditMode ? t('newPasswordOptional' as any) : t('password')}</label>
          <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} placeholder={isEditMode ? t('leaveBlank' as any) : ''} required={!isEditMode} />
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
