import React, { useState, useEffect, FC } from 'react';
import { Department, Competency } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import { labelClasses, inputClasses } from '../ui/constants';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Department | Omit<Department, 'id'>) => void;
  existingDepartment: Department | null;
  competencies: Competency[];
}

const DepartmentModal: FC<DepartmentModalProps> = ({ isOpen, onClose, onSave, existingDepartment, competencies }) => {
  const { t, lang } = useTranslation();
  const isEditMode = !!existingDepartment;

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [requiredCompetencyIds, setRequiredCompetencyIds] = useState<string[]>([]);

  useEffect(() => {
    if (existingDepartment) {
      setNameEn(existingDepartment.name.en);
      setNameAr(existingDepartment.name.ar);
      setRequiredCompetencyIds(existingDepartment.requiredCompetencyIds || []);
    } else {
        setNameEn('');
        setNameAr('');
        setRequiredCompetencyIds([]);
    }
  }, [existingDepartment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameAr) return;
    
    const data = {
        name: { en: nameEn, ar: nameAr },
        requiredCompetencyIds: requiredCompetencyIds.length > 0 ? requiredCompetencyIds : undefined,
    };

    if(isEditMode) {
        onSave({ id: existingDepartment.id, ...data });
    } else {
        onSave(data);
    }
  };
  
  const footer = (
    <>
        <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">{t('cancel')}</button>
        <button type="submit" form="dept-form" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('save')}</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('editDepartment') : t('addNewDepartment')} footer={footer} size="lg">
      <form id="dept-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nameEn" className={labelClasses}>{t('departmentNameEn')}</label>
          <input type="text" id="nameEn" value={nameEn} onChange={e => setNameEn(e.target.value)} className={inputClasses} required />
        </div>
        <div>
          <label htmlFor="nameAr" className={labelClasses}>{t('departmentNameAr')}</label>
          <input type="text" id="nameAr" value={nameAr} onChange={e => setNameAr(e.target.value)} className={inputClasses} required dir="rtl"/>
        </div>
        <div>
            <label htmlFor="competencies" className={labelClasses}>{t('requiredCompetencies')}</label>
            <select
                id="competencies"
                multiple
                value={requiredCompetencyIds}
                onChange={e => setRequiredCompetencyIds(Array.from(e.target.selectedOptions, (opt: HTMLOptionElement) => opt.value))}
                className={`${inputClasses} h-32`}
            >
                {competencies.map(c => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
            </select>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentModal;
