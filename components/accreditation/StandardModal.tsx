import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types
import { Standard, SubStandard, StandardCriticality } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { PlusIcon, TrashIcon } from '../icons';

interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (standard: Standard) => void;
  programId: string;
  existingStandard: Standard | null;
}

const StandardModal: React.FC<StandardModalProps> = ({ isOpen, onClose, onSave, programId, existingStandard }) => {
  const { t, dir } = useTranslation();
  
  const isEditMode = !!existingStandard;
  
  const [standardId, setStandardId] = useState('');
  const [description, setDescription] = useState('');
  const [section, setSection] = useState('');
  const [criticality, setCriticality] = useState<StandardCriticality>(StandardCriticality.Medium);
  const [totalMeasures, setTotalMeasures] = useState<number | undefined>(undefined);
  const [subStandards, setSubStandards] = useState<SubStandard[]>([]);

  useEffect(() => {
    if (isEditMode && existingStandard) {
      setStandardId(existingStandard.standardId);
      setDescription(existingStandard.description);
      setSection(existingStandard.section || '');
      setCriticality(existingStandard.criticality || StandardCriticality.Medium);
      setTotalMeasures(existingStandard.totalMeasures);
      setSubStandards(existingStandard.subStandards || []);
    } else {
      // Reset form for create mode
      setStandardId('');
      setDescription('');
      setSection('');
      setCriticality(StandardCriticality.Medium);
      setTotalMeasures(undefined);
      setSubStandards([]);
    }
  }, [existingStandard, isEditMode, isOpen]);

  const handleSubStandardChange = (index: number, field: keyof SubStandard, value: string) => {
    const newSubStandards = [...subStandards];
    newSubStandards[index] = { ...newSubStandards[index], [field]: value };
    setSubStandards(newSubStandards);
  };
  
  const addSubStandard = () => {
    setSubStandards([...subStandards, { id: '', description: '' }]);
  };

  const removeSubStandard = (index: number) => {
    setSubStandards(subStandards.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardId || !description) return;
    
    onSave({
      standardId,
      programId,
      description,
      section,
      criticality,
      totalMeasures: totalMeasures || subStandards.length || undefined,
      subStandards: subStandards.length > 0 ? subStandards : undefined,
    });
  };
  
  const inputClasses = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center backdrop-blur-sm modal-enter" onClick={onClose}>
      <div className="bg-white dark:bg-dark-brand-surface rounded-lg shadow-xl w-full max-w-2xl m-4 modal-content-enter" onClick={(e) => e.stopPropagation()} dir={dir}>
        <form onSubmit={handleSubmit} className="flex flex-col h-[90vh]">
          <div className="p-6 border-b dark:border-dark-brand-border">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">{isEditMode ? t('editStandard') : t('addStandard')}</h3>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="standardId" className={labelClasses}>{t('standardId')}</label>
                <input type="text" id="standardId" value={standardId} onChange={(e) => setStandardId(e.target.value)} className={inputClasses} required disabled={isEditMode} />
              </div>
              <div>
                <label htmlFor="section" className={labelClasses}>{t('section')}</label>
                <input type="text" id="section" value={section} onChange={(e) => setSection(e.target.value)} className={inputClasses} />
              </div>
            </div>
            <div>
              <label htmlFor="description" className={labelClasses}>{t('standardDescription')}</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClasses} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="totalMeasures" className={labelClasses}>{t('totalMeasures')}</label>
                    <input type="number" id="totalMeasures" value={totalMeasures || ''} onChange={(e) => setTotalMeasures(parseInt(e.target.value) || undefined)} className={inputClasses} placeholder="Optional, calculated if empty" />
                </div>
                <div>
                    <label htmlFor="criticality" className={labelClasses}>{t('criticality')}</label>
                    <select id="criticality" value={criticality} onChange={e => setCriticality(e.target.value as StandardCriticality)} className={inputClasses}>
                        <option value={StandardCriticality.Low}>{t('low')}</option>
                        <option value={StandardCriticality.Medium}>{t('medium')}</option>
                        <option value={StandardCriticality.High}>{t('high')}</option>
                    </select>
                </div>
            </div>
            <div className='border-t dark:border-dark-brand-border pt-4'>
                <h4 className='font-medium mb-2'>{t('measuresSubStandards')}</h4>
                <div className='space-y-3 max-h-60 overflow-y-auto pr-2'>
                {subStandards.map((sub, index) => (
                    <div key={index} className='flex items-start gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-900/50'>
                        <div className='flex-grow'>
                            <label className='text-xs text-gray-500'>{t('measureId')}</label>
                            <input type="text" value={sub.id} onChange={e => handleSubStandardChange(index, 'id', e.target.value)} className={inputClasses} />
                        </div>
                        <div className='flex-grow-[2]'>
                            <label className='text-xs text-gray-500'>{t('measureDescription')}</label>
                            <input type="text" value={sub.description} onChange={e => handleSubStandardChange(index, 'description', e.target.value)} className={inputClasses} />
                        </div>
                        <button type="button" onClick={() => removeSubStandard(index)} className='mt-6 p-1 text-red-500 hover:text-red-700'> <TrashIcon className='w-5 h-5'/> </button>
                    </div>
                ))}
                </div>
                <button type="button" onClick={addSubStandard} className='mt-2 text-sm text-brand-primary hover:underline flex items-center'><PlusIcon className='w-4 h-4 mr-1'/> {t('addMeasure')}</button>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 px-4 sm:px-6 py-3 flex flex-wrap justify-end gap-3 border-t dark:border-dark-brand-border">
            <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">{t('cancel')}</button>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StandardModal;