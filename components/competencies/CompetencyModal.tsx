import React, { useState, useEffect, FC } from 'react';
import { Competency } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';

interface CompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (competency: Competency | Omit<Competency, 'id'>) => void;
  existingCompetency: Competency | null;
}

const CompetencyModal: FC<CompetencyModalProps> = ({ isOpen, onClose, onSave, existingCompetency }) => {
  const { t } = useTranslation();
  const isEditMode = !!existingCompetency;

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');

  useEffect(() => {
    if (isEditMode && existingCompetency) {
      setNameEn(existingCompetency.name.en);
      setNameAr(existingCompetency.name.ar);
      setDescriptionEn(existingCompetency.description.en);
      setDescriptionAr(existingCompetency.description.ar);
    } else {
        setNameEn('');
        setNameAr('');
        setDescriptionEn('');
        setDescriptionAr('');
    }
  }, [existingCompetency, isOpen, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameAr || !descriptionEn || !descriptionAr) return;
    
    const data = {
        name: { en: nameEn, ar: nameAr },
        description: { en: descriptionEn, ar: descriptionAr },
    };

    if(isEditMode) {
        onSave({ id: existingCompetency.id, ...data });
    } else {
        onSave(data);
    }
  };
  
  const footer = (
    <>
        <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">{t('cancel')}</button>
        <button type="submit" form="competency-lib-form" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('save')}</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('editCompetency') : t('addCompetency')} footer={footer} size="lg">
      <form id="competency-lib-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nameEn" className={labelClasses}>{t('competencyNameEn')}</label>
          <input type="text" id="nameEn" value={nameEn} onChange={e => setNameEn(e.target.value)} className={inputClasses} required />
        </div>
        <div>
          <label htmlFor="nameAr" className={labelClasses}>{t('competencyNameAr')}</label>
          <input type="text" id="nameAr" value={nameAr} onChange={e => setNameAr(e.target.value)} className={inputClasses} required dir="rtl"/>
        </div>
        <div>
          <label htmlFor="descEn" className={labelClasses}>{t('competencyDescriptionEn')}</label>
          <textarea id="descEn" value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} rows={3} className={inputClasses} required />
        </div>
        <div>
          <label htmlFor="descAr" className={labelClasses}>{t('competencyDescriptionAr')}</label>
          <textarea id="descAr" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} rows={3} className={inputClasses} required dir="rtl"/>
        </div>
      </form>
    </Modal>
  );
};

export default CompetencyModal;