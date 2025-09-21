import React, { useState, useEffect } from 'react';
import { Department } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface DepartmentModalProps {
  department: Department | null;
  onSave: (department: Department | Omit<Department, 'id'>) => void;
  onClose: () => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ department, onSave, onClose }) => {
  const { t, dir } = useTranslation();
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  
  const isEditMode = department !== null;

  useEffect(() => {
    if (isEditMode) {
      setNameEn(department.name.en);
      setNameAr(department.name.ar);
    }
  }, [department, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameEn && nameAr) {
      const deptData = { name: { en: nameEn, ar: nameAr } };
      if (isEditMode) {
        onSave({ id: department.id, ...deptData });
      } else {
        onSave(deptData);
      }
    }
  };
  
  const inputClasses = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center backdrop-blur-sm modal-enter" onClick={onClose}>
      <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-xl w-full max-w-md m-4 modal-content-enter border border-brand-border dark:border-dark-brand-border" onClick={(e) => e.stopPropagation()} dir={dir}>
          <form onSubmit={handleSubmit}>
          <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">{isEditMode ? t('editDepartment') : t('addNewDepartment')}</h3>
              <div className="mt-4 space-y-4">
              <div>
                  <label htmlFor="nameEn" className={labelClasses}>{t('departmentNameEn')}</label>
                  <input type="text" name="nameEn" id="nameEn" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                  <label htmlFor="nameAr" className={labelClasses}>{t('departmentNameAr')}</label>
                  <input type="text" name="nameAr" id="nameAr" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className={inputClasses} required dir="rtl" />
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

export default DepartmentModal;