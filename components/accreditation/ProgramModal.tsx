import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types
import { AccreditationProgram } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface ProgramModalProps {
  program: AccreditationProgram | null;
  onSave: (program: AccreditationProgram | Omit<AccreditationProgram, 'id'>) => void;
  onClose: () => void;
}

const ProgramModal: React.FC<ProgramModalProps> = ({ program, onSave, onClose }) => {
  const { t, dir } = useTranslation();
  const [name, setName] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  
  const isEditMode = program !== null;

  useEffect(() => {
    if (isEditMode) {
      setName(program.name);
      setDescriptionEn(program.description.en);
      setDescriptionAr(program.description.ar);
    }
  }, [program, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && descriptionEn && descriptionAr) {
      const programData = { name, description: { en: descriptionEn, ar: descriptionAr } };
      if (isEditMode) {
        onSave({ id: program.id, ...programData });
      } else {
        onSave(programData);
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
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">{isEditMode ? t('editProgram') : t('createNewProgram')}</h3>
              <div className="mt-4 space-y-4">
              <div>
                  <label htmlFor="name" className={labelClasses}>{t('programName')}</label>
                  <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                  <label htmlFor="descriptionEn" className={labelClasses}>{t('programDescriptionEn')}</label>
                  <textarea name="descriptionEn" id="descriptionEn" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} className={inputClasses} required />
              </div>
              <div>
                  <label htmlFor="descriptionAr" className={labelClasses}>{t('programDescriptionAr')}</label>
                  <textarea name="descriptionAr" id="descriptionAr" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} rows={3} className={inputClasses} required dir="rtl" />
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

export default ProgramModal;