import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types
import { User, UserRole, Department, AppSettings } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface UserModalProps {
  user: User | null;
  departments: Department[];
  appSettings: AppSettings;
  onSave: (user: User | Omit<User, 'id'>) => void;
  onClose: () => void;
  disableRoleChange?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ user, departments, appSettings, onSave, onClose, disableRoleChange }) => {
  const { t, dir, lang } = useTranslation();
  const isEditMode = user !== null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(isEditMode ? user.role : appSettings.defaultUserRole);
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (isEditMode) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setDepartmentId(user.departmentId);
    }
  }, [user, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && role) {
      const userData = { name, email, role, departmentId: departmentId || undefined };
      if (isEditMode) {
        onSave({ ...user, ...userData });
      } else {
        // FIX: Add missing `competencies` property to satisfy the User type.
        onSave({ ...userData, competencies: [], trainingAssignments: [] });
      }
    }
  };
  
  const inputClasses = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center backdrop-blur-sm modal-enter" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-xl w-full max-w-md m-4 modal-content-enter border border-brand-border dark:border-dark-brand-border" onClick={(e) => e.stopPropagation()} dir={dir}>
          <form onSubmit={handleSubmit}>
          <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">{isEditMode ? t('editUser') : t('addNewUser')}</h3>
              <div className="mt-4 space-y-4">
              <div>
                  <label htmlFor="name" className={labelClasses}>{t('userName')}</label>
                  <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                  <label htmlFor="email" className={labelClasses}>{t('userEmail')}</label>
                  <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                  <label htmlFor="role" className={labelClasses}>{t('userRole')}</label>
                  <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClasses} disabled={disableRoleChange} title={disableRoleChange ? t('lastAdminRoleUnchangeable') : ''}>
                  {/* FIX: Correctly type the map function parameters. */}
                  {Object.values(UserRole).map((r) => (<option key={r} value={r}>{r}</option>))}
                  </select>
              </div>
              <div>
                  <label htmlFor="department" className={labelClasses}>{t('department')}</label>
                  <select id="department" name="department" value={departmentId || ''} onChange={(e) => setDepartmentId(e.target.value)} className={inputClasses}>
                  <option value="">{t('unassigned')}</option>
                  {/* FIX: Correctly type the map function parameters. */}
                  {departments.map((d) => (<option key={d.id} value={d.id}>{d.name[lang]}</option>))}
                  </select>
              </div>
              </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 px-4 sm:px-6 py-3 flex flex-wrap justify-end gap-3 rounded-b-lg">
              <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{t('cancel')}</button>
              <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{t('save')}</button>
          </div>
          </form>
      </div>
    </div>
  );
};

export default UserModal;