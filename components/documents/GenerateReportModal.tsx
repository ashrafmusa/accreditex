import React, { useState, FC } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (reportType: string) => void;
}

const GenerateReportModal: FC<GenerateReportModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const { t } = useTranslation();
    const [reportType, setReportType] = useState('complianceSummary');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(reportType);
        onClose();
    };

    const footer = (
      <>
        <button type="button" onClick={onClose} className="py-2 px-4 border rounded-md text-sm">{t('cancel')}</button>
        {/* FIX: Cast translation key to any */}
        <button type="submit" form="report-form" className="py-2 px-4 border rounded-md text-sm text-white bg-brand-primary">{t('generate' as any)}</button>
      </>
    );
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('generateReport')} footer={footer}>
        <form id="report-form" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">{t('documentType')}</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md">
              <option value="complianceSummary">{t('complianceSummaryReport')}</option>
            </select>
          </div>
        </form>
      </Modal>
    );
}

export default GenerateReportModal;
