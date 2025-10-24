import React, { useState, useEffect, FC } from 'react';
import { Standard, StandardCriticality, SubStandard } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';
import { PlusIcon, TrashIcon } from '../icons';

interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (standard: Omit<Standard, 'programId'>) => void;
  existingStandard: Standard | null;
}

const StandardModal: FC<StandardModalProps> = ({ isOpen, onClose, onSave, existingStandard }) => {
  const { t } = useTranslation();
  const isEditMode = !!existingStandard;

  const [standardId, setStandardId] = useState('');
  const [description, setDescription] = useState('');
  const [section, setSection] = useState('');
  const [criticality, setCriticality] = useState<StandardCriticality>(StandardCriticality.Medium);
  const [subStandards, setSubStandards] = useState<SubStandard[]>([]);

  useEffect(() => {
    if (existingStandard) {
        setStandardId(existingStandard.standardId);
        setDescription(existingStandard.description);
        setSection(existingStandard.section || '');
        setCriticality(existingStandard.criticality || StandardCriticality.Medium);
        setSubStandards(existingStandard.subStandards || []);
    } else {
        setStandardId('');
        setDescription('');
        setSection('');
        setCriticality(StandardCriticality.Medium);
        setSubStandards([]);
    }
  }, [existingStandard, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ standardId, description, section, criticality, subStandards: subStandards.length > 0 ? subStandards : undefined });
  };
  
  const handleSubStandardChange = (index: number, field: keyof SubStandard, value: string) => {
      const newSubs = [...subStandards];
      newSubs[index] = {...newSubs[index], [field]: value};
      setSubStandards(newSubs);
  };
  
  const addSubStandard = () => setSubStandards([...subStandards, {id: '', description: ''}]);
  const removeSubStandard = (index: number) => setSubStandards(subStandards.filter((_, i) => i !== index));

  const footer = (
    <>
        <button type="button" onClick={onClose} className="py-2 px-4 border rounded-md">{t('cancel')}</button>
        <button type="submit" form="standard-form" className="py-2 px-4 border rounded-md text-white bg-brand-primary">{t('save')}</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('editStandard') : t('addStandard')} footer={footer} size="2xl">
      <form id="standard-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1"><label htmlFor="id" className={labelClasses}>{t('standardId')}</label><input type="text" id="id" value={standardId} onChange={e => setStandardId(e.target.value)} className={inputClasses} required /></div>
            <div className="sm:col-span-2"><label htmlFor="section" className={labelClasses}>{t('section')}</label><input type="text" id="section" value={section} onChange={e => setSection(e.target.value)} className={inputClasses}/></div>
        </div>
        <div><label htmlFor="desc" className={labelClasses}>{t('description')}</label><textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClasses} required /></div>
        <div>
            <label htmlFor="criticality" className={labelClasses}>{t('criticality')}</label>
            <select id="criticality" value={criticality} onChange={e => setCriticality(e.target.value as StandardCriticality)} className={inputClasses}>
                {Object.values(StandardCriticality).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
        <div className="border-t pt-4">
            <h4 className="font-semibold">{t('subStandards')}</h4>
            <div className="space-y-3 mt-2 max-h-48 overflow-y-auto pr-2">
                {subStandards.map((sub, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <input type="text" value={sub.id} onChange={e => handleSubStandardChange(index, 'id', e.target.value)} placeholder="ID" className={`${inputClasses} w-24`} />
                        <textarea value={sub.description} onChange={e => handleSubStandardChange(index, 'description', e.target.value)} placeholder="Description" rows={1} className={`${inputClasses} flex-grow`} />
                        <button type="button" onClick={() => removeSubStandard(index)} className="p-2 text-red-500 mt-1"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addSubStandard} className="mt-2 text-sm text-brand-primary flex items-center gap-1"><PlusIcon className="w-4 h-4"/>{t('addSubStandard')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default StandardModal;
