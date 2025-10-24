import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../stores/useAppStore';
import { useProjectStore } from '../stores/useProjectStore';
import { ClipboardDocumentSearchIcon, PlusIcon, PlayCircleIcon, PencilIcon, TrashIcon } from '../components/icons';
import { AuditPlan } from '../types';
import AuditPlanModal from '../components/audits/AuditPlanModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import EmptyState from '../components/common/EmptyState';

const AuditHubPage: React.FC = () => {
    const { t } = useTranslation();
    const { users } = useAppStore();
    const { projects } = useProjectStore();
    
    // This state would normally be in a store
    const [auditPlans, setAuditPlans] = useState<AuditPlan[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<AuditPlan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<AuditPlan | null>(null);

    const handleSave = (plan: AuditPlan | Omit<AuditPlan, 'id'>) => {
        if('id' in plan) {
            setAuditPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
        } else {
            setAuditPlans(prev => [...prev, { ...plan, id: `plan-${Date.now()}` }]);
        }
        setIsModalOpen(false);
    };
    
    const handleDelete = () => {
        if (deletingPlan) {
            setAuditPlans(prev => prev.filter(p => p.id !== deletingPlan.id));
            setDeletingPlan(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                    <ClipboardDocumentSearchIcon className="h-8 w-8 text-brand-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">{t('auditHub')}</h1>
                        <p className="text-brand-text-secondary mt-1">{t('auditHubDescription')}</p>
                    </div>
                </div>
                <button onClick={() => { setEditingPlan(null); setIsModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-semibold shadow-sm w-full md:w-auto">
                    <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> {t('newAuditPlan')}
                </button>
            </div>
            
            <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('planName')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('project')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('assignAuditor')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('frequency')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('actions')}</span></th>
                        </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
                            {auditPlans.map(plan => (
                                <tr key={plan.id}>
                                    <td className="px-6 py-4 font-medium">{plan.name}</td>
                                    <td className="px-6 py-4 text-sm">{projects.find(p => p.id === plan.projectId)?.name}</td>
                                    <td className="px-6 py-4 text-sm">{users.find(u => u.id === plan.assignedAuditorId)?.name}</td>
                                    <td className="px-6 py-4 text-sm capitalize">{t(plan.frequency)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button className="text-sm font-semibold text-brand-primary flex items-center gap-1"><PlayCircleIcon className="w-5 h-5"/>{t('runAudit')}</button>
                                            <button onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-brand-primary"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setDeletingPlan(plan)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {auditPlans.length === 0 && <EmptyState icon={ClipboardDocumentSearchIcon} title={t('noAuditPlans')} message="" />}
                </div>
            </div>

            {isModalOpen && <AuditPlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingPlan={editingPlan} projects={projects} users={users} />}
            {/* FIX: Cast translation key to any */}
            {deletingPlan && <ConfirmationModal isOpen={!!deletingPlan} onClose={() => setDeletingPlan(null)} onConfirm={handleDelete} title={t('deleteAuditPlan' as any)} message={t('areYouSureDeleteAuditPlan')} confirmationText={t('delete')} />}
        </div>
    );
};

export default AuditHubPage;