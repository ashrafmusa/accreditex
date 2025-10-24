import React, { useState, useEffect, FC } from 'react';
import { Risk, User, TrainingProgram } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (risk: Risk | Omit<Risk, 'id'>) => void;
  users: User[];
  trainingPrograms: TrainingProgram[];
  existingRisk: Risk | null;
}

const RiskModal: FC<RiskModalProps> = ({ isOpen, onClose, onSave, users, trainingPrograms, existingRisk }) => {
  const { t, lang } = useTranslation();
  const isEditMode = !!existingRisk;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [likelihood, setLikelihood] = useState(3);
  const [impact, setImpact] = useState(3);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [status, setStatus] = useState<'Open' | 'Mitigated' | 'Closed'>('Open');
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [rootCauseCategory, setRootCauseCategory] = useState('');
  const [trainingRecommendationId, setTrainingRecommendationId] = useState('');

  const rootCauseCategories = [
    { key: 'processFailure', label: t('processFailure') },
    { key: 'humanError', label: t('humanError') },
    { key: 'equipmentMalfunction', label: t('equipmentMalfunction') },
    { key: 'externalFactors', label: t('externalFactors') },
    { key: 'other', label: t('other') },
  ];

  useEffect(() => {
    if (existingRisk) {
      setTitle(existingRisk.title);
      setDescription(existingRisk.description);
      setLikelihood(existingRisk.likelihood);
      setImpact(existingRisk.impact);
      setOwnerId(existingRisk.ownerId);
      setStatus(existingRisk.status);
      setMitigationPlan(existingRisk.mitigationPlan);
      setRootCauseCategory(existingRisk.rootCauseCategory || '');
      setTrainingRecommendationId(existingRisk.trainingRecommendationId || '');
    } else {
      setTitle('');
      setDescription('');
      setLikelihood(3);
      setImpact(3);
      setOwnerId(null);
      setStatus('Open');
      setMitigationPlan('');
      setRootCauseCategory('');
      setTrainingRecommendationId('');
    }
  }, [existingRisk, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    const riskData = {
      title,
      description,
      likelihood,
      impact,
      ownerId,
      status,
      mitigationPlan,
      rootCauseCategory: rootCauseCategory || undefined,
      trainingRecommendationId: trainingRecommendationId || undefined,
      createdAt: isEditMode ? existingRisk.createdAt : new Date().toISOString(),
    };

    if (isEditMode) {
      onSave({ ...riskData, id: existingRisk.id });
    } else {
      onSave(riskData);
    }
  };

  const footer = (
    <>
        <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">{t('cancel')}</button>
        <button type="submit" form="risk-form" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('save')}</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('edit') : t('addNewRisk')} footer={footer} size="2xl">
      <form id="risk-form" onSubmit={handleSubmit} className="space-y-4">
        <div><label htmlFor="title" className={labelClasses}>{t('riskTitle')}</label><input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} required /></div>
        <div><label htmlFor="description" className={labelClasses}>{t('description')}</label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClasses} required /></div>
        
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label htmlFor="likelihood" className={labelClasses}>{t('likelihood')} ({likelihood})</label>
                <input type="range" id="likelihood" min="1" max="5" value={likelihood} onChange={e => setLikelihood(parseInt(e.target.value))} className="w-full mt-2" />
            </div>
              <div>
                <label htmlFor="impact" className={labelClasses}>{t('impact')} ({impact})</label>
                <input type="range" id="impact" min="1" max="5" value={impact} onChange={e => setImpact(parseInt(e.target.value))} className="w-full mt-2" />
            </div>
        </div>

        <div>
          <label htmlFor="rootCauseCategory" className={labelClasses}>{t('rootCauseCategory')}</label>
          <select id="rootCauseCategory" value={rootCauseCategory} onChange={e => setRootCauseCategory(e.target.value)} className={inputClasses}>
            <option value="">{t('selectCategory')}</option>
            {rootCauseCategories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>

        <div><label htmlFor="mitigationPlan" className={labelClasses}>{t('mitigationPlan')}</label><textarea id="mitigationPlan" value={mitigationPlan} onChange={e => setMitigationPlan(e.target.value)} rows={3} className={inputClasses}/></div>

          <div>
            <label htmlFor="training" className={labelClasses}>{t('recommendedTraining')}</label>
            <select id="training" value={trainingRecommendationId} onChange={e => setTrainingRecommendationId(e.target.value)} className={inputClasses}>
                <option value="">{t('noTrainingRecommended')}</option>
                {trainingPrograms.map(p => <option key={p.id} value={p.id}>{p.title[lang]}</option>)}
            </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="owner" className={labelClasses}>{t('owner')}</label>
                <select id="owner" value={ownerId || ''} onChange={e => setOwnerId(e.target.value || null)} className={inputClasses}>
                    <option value="">{t('unassigned')}</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="status" className={labelClasses}>{t('status')}</label>
                  {/* FIX: Cast translation keys to any */}
                  <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} className={inputClasses}>
                    <option value="Open">{t('open' as any)}</option>
                    <option value="Mitigated">{t('mitigated')}</option>
                    <option value="Closed">{t('closed' as any)}</option>
                </select>
              </div>
        </div>
      </form>
    </Modal>
  );
};

export default RiskModal;