import React, { useState } from 'react';
import { IncidentReport } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import IncidentModal from './IncidentModal';
import ConfirmationModal from '../common/ConfirmationModal';
import { PencilIcon, PlusIcon, TrashIcon } from '../icons';

interface IncidentReportingTabProps {
  incidents: IncidentReport[];
  onAdd: (report: Omit<IncidentReport, 'id'>) => void;
  onUpdate: (report: IncidentReport) => void;
  onDelete: (reportId: string) => void;
}

const IncidentReportingTab: React.FC<IncidentReportingTabProps> = (props) => {
    const { incidents, onAdd, onUpdate, onDelete } = props;
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<IncidentReport | null>(null);
    const [deletingReport, setDeletingReport] = useState<IncidentReport | null>(null);

    const handleSave = (report: IncidentReport | Omit<IncidentReport, 'id'>) => {
        if ('id' in report) { onUpdate(report); } else { onAdd(report); }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if(deletingReport) { onDelete(deletingReport.id); setDeletingReport(null); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={() => { setEditingReport(null); setIsModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center font-semibold shadow-sm">
                    <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('reportNewIncident')}
                </button>
            </div>
            
             <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('incidentDate')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('incidentType')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('severity')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('status')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
                            {incidents.map(report => (
                                <tr key={report.id}>
                                    <td className="px-6 py-4">{new Date(report.incidentDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{t((report.type.charAt(0).toLowerCase() + report.type.slice(1).replace(' ', '')) as any)}</td>
                                    <td className="px-6 py-4">{t((report.severity.charAt(0).toLowerCase() + report.severity.slice(1).replace(' ', '')) as any)}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">{t((report.status.charAt(0).toLowerCase() + report.status.slice(1).replace(' ', '')) as any)}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setEditingReport(report); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-brand-primary"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setDeletingReport(report)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <IncidentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingReport={editingReport} />}
            {deletingReport && <ConfirmationModal isOpen={!!deletingReport} onClose={() => setDeletingReport(null)} onConfirm={handleDelete} title={t('deleteIncident')} message={t('areYouSureDeleteIncident')} confirmationText={t('delete')} />}
        </div>
    );
};

export default IncidentReportingTab;
