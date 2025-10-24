import React, { useState, useEffect, FC } from 'react';
import { IncidentReport } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import DatePicker from '../ui/DatePicker';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: IncidentReport | Omit<IncidentReport, 'id'>) => void;
  existingReport: IncidentReport | null;
}

const IncidentModal: FC<IncidentModalProps> = ({ isOpen, onClose, onSave, existingReport }) => {
  const { t } = useTranslation();
  const isEditMode = !!existingReport;

  const [incidentDate, setIncidentDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState('');
  const [type, setType] = useState<IncidentReport['type']>('Patient Safety');
  const [severity, setSeverity] = useState<IncidentReport['severity']>('Minor');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IncidentReport['status']>('Open');
  
  useEffect(() => {
    if (existingReport) {
        setIncidentDate(new Date(existingReport.incidentDate));
        setLocation(existingReport.location);
        setType(existingReport.type);
        setSeverity(existingReport.severity);
        setDescription(existingReport.description);
        setStatus(existingReport.status);
    } else {
        setIncidentDate(new Date());
        setLocation('');
        setType('Patient Safety');
        setSeverity('Minor');
        setDescription('');
        setStatus('Open');
    }
  }, [existingReport, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDate || !location || !description) return;
    
    const reportData = {
        incidentDate: incidentDate.toISOString().split('T')[0], 
        location, 
        type, 
        severity, 
        description, 
        status,
        reportedBy: '', // This will be set by the store/backend
        correctiveActionIds: existingReport?.correctiveActionIds || [],
    };

    if (isEditMode) {
      onSave({ ...reportData, id: existingReport.id });
    } else {
      onSave(reportData);
    }
  };
  
  const footer = (
    <>
        <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md text-sm">{t('cancel')}</button>
        <button type="submit" form="incident-form" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('save')}</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('editIncident') : t('reportNewIncident')} footer={footer} size="lg">
      <form id="incident-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="date" className={labelClasses}>{t('incidentDate')}</label>
                <DatePicker date={incidentDate} setDate={setIncidentDate} />
            </div>
            <div><label htmlFor="location" className={labelClasses}>{t('location')}</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} id="location" className={inputClasses} required /></div>
            <div>
                <label htmlFor="type" className={labelClasses}>{t('incidentType')}</label>
                <select id="type" value={type} onChange={e => setType(e.target.value as any)} className={inputClasses}>
                    <option value="Patient Safety">{t('patientSafety')}</option>
                    <option value="Staff Injury">{t('staffInjury')}</option>
                    <option value="Facility Issue">{t('facilityIssue')}</option>
                    <option value="Medication Error">{t('medicationError')}</option>
                    <option value="Other">{t('other')}</option>
                </select>
            </div>
            <div>
                <label htmlFor="severity" className={labelClasses}>{t('severity')}</label>
                <select id="severity" value={severity} onChange={e => setSeverity(e.target.value as any)} className={inputClasses}>
                    <option value="Minor">{t('minor')}</option>
                    <option value="Moderate">{t('moderate')}</option>
                    <option value="Severe">{t('severe')}</option>
                    <option value="Sentinel Event">{t('sentinelEvent')}</option>
                </select>
            </div>
            {isEditMode && <div>
                <label htmlFor="status" className={labelClasses}>{t('status')}</label>
                {/* FIX: Cast translation keys to any */}
                <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} className={inputClasses}>
                    <option value="Open">{t('open' as any)}</option>
                    <option value="Under Investigation">{t('underInvestigation')}</option>
                    <option value="Closed">{t('closed' as any)}</option>
                </select>
            </div>}
        </div>
        <div>
            <label htmlFor="desc" className={labelClasses}>{t('description')}</label>
            <textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputClasses} required />
        </div>
      </form>
    </Modal>
  );
};

export default IncidentModal;