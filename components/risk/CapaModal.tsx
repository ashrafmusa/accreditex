import React, { useState, useEffect, FC } from 'react';
import { ChecklistItem, User, CAPAReport, TrainingProgram, IncidentReport, Project } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { SparklesIcon } from '@/components/icons';
import { backendService } from '@/services/BackendService';
import { useToast } from '@/hooks/useToast';

interface CapaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (capa: Omit<CAPAReport, 'id'>) => void;
  users: User[];
  trainingPrograms: TrainingProgram[];
  sourceItem: ChecklistItem | IncidentReport;
  projectId?: string;
  projects?: Project[];
}

const CapaModal: FC<CapaModalProps> = ({ isOpen, onClose, onSave, users, trainingPrograms, sourceItem, projectId, projects = [] }) => {
  const { t, dir, lang } = useTranslation();
  const toast = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [type, setType] = useState<'Corrective' | 'Preventive'>('Corrective');
  const [rootCause, setRootCause] = useState('');
  const [rootCauseCategory, setRootCauseCategory] = useState('');
  const [trainingRecommendationId, setTrainingRecommendationId] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [effectivenessCheckRequired, setEffectivenessCheckRequired] = useState(false);
  const [effectivenessCheckDueDate, setEffectivenessCheckDueDate] = useState('');
  
  const isIncidentSource = 'incidentDate' in sourceItem;
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  
  const rootCauseCategories = [
    { key: 'processFailure', label: t('processFailure') },
    { key: 'humanError', label: t('humanError') },
    { key: 'equipmentMalfunction', label: t('equipmentMalfunction') },
    { key: 'externalFactors', label: t('externalFactors') },
    { key: 'other', label: t('other') },
  ];

  useEffect(() => {
    if (isOpen) {
      setType('Corrective');
      setRootCause('');
      setRootCauseCategory('');
      setTrainingRecommendationId('');
      setActionPlan('');
      setAssignedTo(null);
      setDueDate('');
      setEffectivenessCheckRequired(false);
      setEffectivenessCheckDueDate('');
      setSelectedProjectId(projectId || '');
    }
  }, [isOpen, projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootCause || !actionPlan || !dueDate || (isIncidentSource && !selectedProjectId) || (effectivenessCheckRequired && !effectivenessCheckDueDate)) {
        toast.error(t('pleaseFillRequired'));
        return;
    }
    
    const baseCapa = {
// FIX: Added 'as const' to ensure TypeScript infers the literal type 'Open', not 'string', satisfying the CAPAReport type definition.
        status: 'Open' as const,
        type,
        description: isIncidentSource ? (sourceItem as IncidentReport).description : (sourceItem as ChecklistItem).item,
        rootCauseAnalysis: rootCause,
        rootCauseCategory: rootCauseCategory || undefined,
        trainingRecommendationId: trainingRecommendationId || undefined,
        actionPlan,
        assignedTo,
        dueDate,
        createdAt: new Date().toISOString(),
        effectivenessCheck: effectivenessCheckRequired
            ? { required: true, dueDate: effectivenessCheckDueDate, completed: false, notes: '' }
            : undefined,
    };

    if (isIncidentSource) {
        onSave({
            ...baseCapa,
            sourceProjectId: selectedProjectId,
            sourceIncidentId: sourceItem.id,
        });
    } else {
        onSave({
            ...baseCapa,
            sourceProjectId: projectId!,
            sourceChecklistItemId: sourceItem.id,
            sourceStandardId: (sourceItem as ChecklistItem).standardId,
        });
    }
  };

  const handleSuggestRootCause = async () => {
    setIsAiLoading(true);
    try {
      const description = isIncidentSource ? (sourceItem as IncidentReport).description : (sourceItem as ChecklistItem).item;
      const notes = isIncidentSource ? '' : (sourceItem as ChecklistItem).notes;
      const suggestion = await backendService.suggestRootCause(description, notes);
      setRootCause(suggestion);
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast.error(t('rootCauseError'));
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClasses = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm modal-enter" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-xl w-full max-w-2xl m-4 modal-content-enter border border-brand-border dark:border-dark-brand-border" onClick={e => e.stopPropagation()} dir={dir}>
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
          <div className="p-6 border-b dark:border-dark-brand-border">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">{t('createCapaReport')}</h3>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div>
              <h4 className={labelClasses}>{isIncidentSource ? t('incidentSource') : t('nonComplianceSource')}</h4>
              <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
                  {!isIncidentSource && <p className="font-semibold">{(sourceItem as ChecklistItem).standardId}</p>}
                  <p className="text-gray-600 dark:text-gray-300">{isIncidentSource ? (sourceItem as IncidentReport).description : (sourceItem as ChecklistItem).item}</p>
              </div>
              </div>
              {isIncidentSource && (
                <div>
                  <label htmlFor="project" className={labelClasses}>{t('linkToProject')}</label>
                  <select id="project" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className={inputClasses} required>
                    <option value="">{t('selectAProject')}</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <label htmlFor="capaType" className={labelClasses}>{t('capaType')}</label>
                  <select id="capaType" value={type} onChange={e => setType(e.target.value as 'Corrective' | 'Preventive')} className={inputClasses}>
                      <option value="Corrective">{t('corrective')}</option>
                      <option value="Preventive">{t('preventive')}</option>
                  </select>
                  </div>
                  <div>
                  <label htmlFor="rootCauseCategory" className={labelClasses}>{t('rootCauseCategory')}</label>
                  <select id="rootCauseCategory" value={rootCauseCategory} onChange={e => setRootCauseCategory(e.target.value)} className={inputClasses}>
                      <option value="">{t('selectCategory')}</option>
                      {rootCauseCategories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                  </div>
              </div>
              <div>
              <div className="flex justify-between items-center">
                  <label htmlFor="rootCause" className={labelClasses}>{t('rootCauseAnalysis')}</label>
                  <button type="button" onClick={handleSuggestRootCause} disabled={isAiLoading} className="inline-flex items-center text-xs font-medium text-brand-primary hover:underline disabled:text-gray-400">
                  <SparklesIcon className="h-4 w-4 mr-1"/>
                  {isAiLoading ? t('generating') : t('suggestWithAI')}
                  </button>
              </div>
              <textarea id="rootCause" value={rootCause} onChange={e => setRootCause(e.target.value)} rows={3} className={inputClasses} placeholder={t('rootCausePlaceholder')} required />
              </div>
              <div>
              <label htmlFor="actionPlan" className={labelClasses}>{t('actionPlan')}</label>
              <textarea id="actionPlan" value={actionPlan} onChange={e => setActionPlan(e.target.value)} rows={3} className={inputClasses} placeholder={t('capaActionPlanPlaceholder')} required />
              </div>
              <div>
                  <label htmlFor="training" className={labelClasses}>{t('recommendedTraining')}</label>
                  <select id="training" value={trainingRecommendationId} onChange={e => setTrainingRecommendationId(e.target.value)} className={inputClasses}>
                      <option value="">{t('noTrainingRecommended')}</option>
                      {trainingPrograms.map(p => <option key={p.id} value={p.id}>{p.title[lang]}</option>)}
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
              <div>
                  <label htmlFor="assignedTo" className={labelClasses}>{t('assignedTo')}</label>
                  <select id="assignedTo" value={assignedTo || ''} onChange={e => setAssignedTo(e.target.value || null)} className={inputClasses}>
                  <option value="">{t('unassigned')}</option>
                  {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                  </select>
              </div>
              <div>
                  <label htmlFor="dueDate" className={labelClasses}>{t('dueDate')}</label>
                  <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClasses} required />
              </div>
              </div>
              <div className="border-t dark:border-dark-brand-border pt-4 mt-4">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                      <input
                          type="checkbox"
                          checked={effectivenessCheckRequired}
                          onChange={(e) => setEffectivenessCheckRequired(e.target.checked)}
                          className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                      />
                      <span className={labelClasses}>{t('effectivenessChecks')}</span>
                  </label>
              </div>
              {effectivenessCheckRequired && (
                  <div className="mt-4 animate-[fadeInUp_0.3s_ease-out]">
                      <label htmlFor="effectivenessDueDate" className={labelClasses}>{t('checkDueDate')}</label>
                      <input
                          type="date"
                          id="effectivenessDueDate"
                          value={effectivenessCheckDueDate}
                          onChange={(e) => setEffectivenessCheckDueDate(e.target.value)}
                          className={inputClasses}
                          required={effectivenessCheckRequired}
                          min={dueDate || new Date().toISOString().split('T')[0]}
                      />
                  </div>
              )}
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 px-4 sm:px-6 py-3 flex flex-wrap justify-end gap-3 border-t dark:border-dark-brand-border rounded-b-lg">
              <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">{t('cancel')}</button>
              <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('save')}</button>
          </div>
          </form>
      </div>
    </div>
  );
};

export default CapaModal;