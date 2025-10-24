import React, { useState, useEffect, FC } from 'react';
import { AuditPlan, Project, User, UserRole } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import { labelClasses, inputClasses } from '../ui/constants';

interface AuditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: AuditPlan | Omit<AuditPlan, 'id'>) => void;
  existingPlan: AuditPlan | null;
  projects: Project[];
  users: User[];
}

const AuditPlanModal: FC<AuditPlanModalProps> = (props) => {
    const { isOpen, onClose, onSave, existingPlan, projects, users } = props;
    const { t } = useTranslation();
    const isEditMode = !!existingPlan;

    const [name, setName] = useState('');
    const [projectId, setProjectId] = useState('');
    const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
    const [itemCount, setItemCount] = useState(10);
    const [assignedAuditorId, setAssignedAuditorId] = useState('');

    const auditors = users.filter(u => u.role === UserRole.Admin || u.role === UserRole.Auditor);

    useEffect(() => {
        if (existingPlan) {
            setName(existingPlan.name);
            setProjectId(existingPlan.projectId);
            setFrequency(existingPlan.frequency);
            setItemCount(existingPlan.itemCount);
            setAssignedAuditorId(existingPlan.assignedAuditorId);
        } else {
            setName('');
            setProjectId('');
            setFrequency('monthly');
            setItemCount(10);
            setAssignedAuditorId('');
        }
    }, [existingPlan, isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { name, projectId, frequency, itemCount, assignedAuditorId, standardSection: '' };
        if (isEditMode) { onSave({ ...existingPlan, ...data }); } else { onSave(data); }
    };

    const footer = (
        <>
            <button type="button" onClick={onClose} className="py-2 px-4 border rounded-md">{t('cancel')}</button>
            <button type="submit" form="audit-plan-form" className="py-2 px-4 border rounded-md text-white bg-brand-primary">{t('save')}</button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('editAuditPlan') : t('newAuditPlan')} footer={footer} size="lg">
            <form id="audit-plan-form" onSubmit={handleSubmit} className="space-y-4">
                <div><label htmlFor="name" className={labelClasses}>{t('planName')}</label><input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required /></div>
                <div>
                    <label htmlFor="project" className={labelClasses}>{t('targetProject')}</label>
                    <select id="project" value={projectId} onChange={e => setProjectId(e.target.value)} className={inputClasses} required>
                        {/* FIX: Cast translation key to any */}
                        <option value="">{t('selectProject' as any)}</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="frequency" className={labelClasses}>{t('frequency')}</label>
                        <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as any)} className={inputClasses}>
                            <option value="weekly">{t('weekly')}</option>
                            <option value="monthly">{t('monthly')}</option>
                        </select>
                    </div>
                     <div><label htmlFor="items" className={labelClasses}>{t('itemsToAudit')}</label><input type="number" id="items" value={itemCount} onChange={e => setItemCount(parseInt(e.target.value))} className={inputClasses} min="1" /></div>
                </div>
                 <div>
                    <label htmlFor="auditor" className={labelClasses}>{t('assignAuditor')}</label>
                    <select id="auditor" value={assignedAuditorId} onChange={e => setAssignedAuditorId(e.target.value)} className={inputClasses} required>
                        <option value="">{t('selectUser')}</option>
                        {auditors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            </form>
        </Modal>
    );
};

export default AuditPlanModal;