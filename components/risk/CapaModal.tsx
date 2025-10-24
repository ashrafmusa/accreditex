import React, { useState, useEffect, FC } from 'react';
import { CAPAReport, User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import DatePicker from '../ui/DatePicker';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';

interface CapaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (capa: Omit<CAPAReport, 'id'>, projectId: string) => void;
  users: User[];
  existingCapa: (CAPAReport & { projectId: string }) | null;
}

const CapaModal: FC<CapaModalProps> = ({ isOpen, onClose, onSave, users, existingCapa }) => {
  const { t } = useTranslation();
  const isEditMode = !!existingCapa;

  const [description, setDescription] = useState('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<'Open' | 'Closed'>('Open');
  
  useEffect(() => {
    if (existingCapa) {
      setDescription(existingCapa.description);
      setRootCauseAnalysis(existingCapa.rootCauseAnalysis);
      setActionPlan(existingCapa.actionPlan);
      setAssignedTo(existingCapa.assignedTo);
      setDueDate(new Date(existingCapa.dueDate));
      setStatus(existingCapa.status);
    }
  }, [existingCapa, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !existingCapa) return;
    
    const capaData = {
        ...existingCapa,
        description,
        rootCauseAnalysis,
        actionPlan,
        assignedTo,
        dueDate: dueDate!.toISOString().split('T')[0],
        status
    };
    const { projectId, ...rest } = capaData;
    onSave(rest, projectId);
  };

  const footer = (
    <>
      <button type="button" onClick={onClose} className="py-2 px-4 border rounded-md">{t('cancel')}</button>
      <button type="submit" form="capa-form" className="py-2 px-4 border rounded-md text-white bg-brand-primary">{t('save')}</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('capaReport')} footer={footer} size="2xl">
      <form id="capa-form" onSubmit={handleSubmit} className="space-y-4">
        <div><label className={labelClasses}>{t('description')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClasses} required /></div>
        <div><label className={labelClasses}>{t('rootCauseAnalysis')}</label><textarea value={rootCauseAnalysis} onChange={e => setRootCauseAnalysis(e.target.value)} rows={3} className={inputClasses}/></div>
        <div><label className={labelClasses}>{t('actionPlan')}</label><textarea value={actionPlan} onChange={e => setActionPlan(e.target.value)} rows={3} className={inputClasses}/></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClasses}>{t('assignedTo')}</label><select value={assignedTo || ''} onChange={e => setAssignedTo(e.target.value || null)} className={inputClasses}><option value="">{t('unassigned')}</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
          <div><label className={labelClasses}>{t('dueDate')}</label><DatePicker date={dueDate} setDate={setDueDate} /></div>
        </div>
        {/* FIX: Cast translation keys to any */}
        <div><label className={labelClasses}>{t('status')}</label><select value={status} onChange={e => setStatus(e.target.value as any)} className={inputClasses}><option value="Open">{t('open' as any)}</option><option value="Closed">{t('closed' as any)}</option></select></div>
      </form>
    </Modal>
  );
};

export default CapaModal;
