import React, { useState } from 'react';
import { IncidentReport, User, CAPAReport, TrainingProgram } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from '../icons';
import IncidentModal from './IncidentModal';
import CapaModal from './CapaModal';
import { useProjectStore } from '../../stores/useProjectStore';

interface Props {
  incidentReports: IncidentReport[];
  users: User[];
  currentUser: User;
  trainingPrograms: TrainingProgram[];
  onCreate: (report: Omit<IncidentReport, 'id'>) => Promise<void>;
  onUpdate: (report: IncidentReport) => Promise<void>;
  onDelete: (reportId: string) => Promise<void>;
  onCreateCapa: (capa: Omit<CAPAReport, 'id'>) => Promise<void>;
}

const IncidentReportingTab: React.FC<Props> = ({ incidentReports, users, currentUser, trainingPrograms, onCreate, onUpdate, onDelete, onCreateCapa }) => {
  const { t } = useTranslation();
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<IncidentReport | null>(null);
  const [isCapaModalOpen, setIsCapaModalOpen] = useState(false);
  const [capaSourceItem, setCapaSourceItem] = useState<IncidentReport | null>(null);
  const projects = useProjectStore(state => state.projects);

  const handleSaveIncident = (report: IncidentReport | Omit<IncidentReport, 'id'>) => {
    const reportWithUser = { ...report, reportedBy: currentUser.id };
    if ('id' in report) {
      onUpdate(reportWithUser as IncidentReport);
    } else {
      onCreate(reportWithUser);
    }
    setIsIncidentModalOpen(false);
  };

  const handleDelete = (reportId: string) => {
    if (window.confirm(t('areYouSureDeleteIncident'))) {
      onDelete(reportId);
    }
  };

  const handleTriggerCreateCapa = (incident: IncidentReport) => {
    setCapaSourceItem(incident);
    setIsCapaModalOpen(true);
  };
  
  const handleSaveCapa = (capaData: Omit<CAPAReport, 'id'>) => {
    onCreateCapa(capaData);
    setIsCapaModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => { setEditingReport(null); setIsIncidentModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center font-semibold shadow-sm">
          <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('reportNewIncident')}
        </button>
      </div>
      <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('incidentDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('incidentType')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('severity')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('reportedBy')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-brand-border">
              {incidentReports.map(report => {
                const reporter = users.find(u => u.id === report.reportedBy);
                return (
                  <tr key={report.id}>
                    <td className="px-6 py-4 text-sm">{new Date(report.incidentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">{t(report.type.charAt(0).toLowerCase() + report.type.slice(1).replace(' ', '') as any)}</td>
                    <td className="px-6 py-4 text-sm">{t(report.severity.charAt(0).toLowerCase() + report.severity.slice(1).replace(' ', '') as any)}</td>
                    <td className="px-6 py-4 text-sm">{t(report.status.charAt(0).toLowerCase() + report.status.slice(1).replace(' ', '') as any)}</td>
                    <td className="px-6 py-4 text-sm">{reporter?.name || '...'}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                          <button onClick={() => handleTriggerCreateCapa(report)} className="p-1 text-gray-500 hover:text-red-500" title={t('createCapa')}><ExclamationTriangleIcon className="w-4 h-4" /></button>
                          <button onClick={() => { setEditingReport(report); setIsIncidentModalOpen(true); }} className="p-1 text-gray-500 hover:text-brand-primary" title={t('edit')}><PencilIcon className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(report.id)} className="p-1 text-gray-500 hover:text-red-500" title={t('delete')}><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {incidentReports.length === 0 && <p className="text-center py-8 text-gray-500">{t('noIncidentsReported')}</p>}
        </div>
      </div>

      {isIncidentModalOpen && <IncidentModal isOpen={isIncidentModalOpen} onClose={() => setIsIncidentModalOpen(false)} onSave={handleSaveIncident} existingReport={editingReport} />}
      
      {isCapaModalOpen && capaSourceItem && (
        <CapaModal
            isOpen={isCapaModalOpen}
            onClose={() => setIsCapaModalOpen(false)}
            onSave={handleSaveCapa}
            users={users}
            trainingPrograms={trainingPrograms}
            sourceItem={capaSourceItem}
            projects={projects}
        />
      )}
    </div>
  );
};

export default IncidentReportingTab;