import React, { useState, useEffect, FC } from 'react';
import { AccreditationProgram } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (program: AccreditationProgram | Omit<AccreditationProgram, 'id'>) => void;
  existingProgram: AccreditationProgram | null;
}

const ProgramModal: FC<ProgramModalProps> = ({ isOpen, onClose, onSave, existingProgram }) => {
  const { t } = useTranslation();
  const isEditMode = !!existingProgram;

  const [name, setName] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');

  useEffect(() => {
    if (existingProgram) {
      setName(existingProgram.name);
      setDescriptionEn(existingProgram.description.en);
      setDescriptionAr(existingProgram.description.ar);
    } else {
      setName('');
      setDescriptionEn('');
      setDescriptionAr('');
    }
  }, [existingProgram, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !descriptionEn || !descriptionAr) return;
    
    const data = {
        name,
        description: { en: descriptionEn, ar: descriptionAr },
    };

    if(isEditMode) {
        onSave({ id: existingProgram.id, ...data });
    } else {
        onSave(data);
    }
  };
  
  const footer = (
    <>
        <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">{t('cancel')}</button>
        <button type="submit" form="program-form" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('save')}</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('editProgram') : t('addNewProgram')} footer={footer} size="lg">
      <form id="program-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClasses}>{t('programName')}</label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
        </div>
        <div>
          <label htmlFor="descEn" className={labelClasses}>{t('programDescriptionEn')}</label>
          <textarea id="descEn" value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} rows={3} className={inputClasses} required />
        </div>
        <div>
          <label htmlFor="descAr" className={labelClasses}>{t('programDescriptionAr')}</label>
          <textarea id="descAr" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} rows={3} className={inputClasses} required dir="rtl"/>
        </div>
      </form>
    </Modal>
  );
};

export default ProgramModal;
