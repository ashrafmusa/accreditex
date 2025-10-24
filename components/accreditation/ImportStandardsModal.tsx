import React, { useState, FC, useMemo } from 'react';
import { AccreditationProgram } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';

interface ImportStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (programId: string) => void;
  fileContent: string;
  programs: AccreditationProgram[];
}

const ImportStandardsModal: FC<ImportStandardsModalProps> = ({ isOpen, onClose, onImport, fileContent, programs }) => {
    const { t } = useTranslation();
    const [selectedProgramId, setSelectedProgramId] = useState('');

    const detectedCount = useMemo(() => {
        try {
            const data = JSON.parse(fileContent);
            return Object.keys(data).length;
        } catch (e) {
            return 0;
        }
    }, [fileContent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedProgramId) return;
        onImport(selectedProgramId);
    }
    
    const footer = (
        <>
            <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md text-sm">{t('cancel')}</button>
            <button type="submit" form="import-form" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700" disabled={!selectedProgramId}>{t('importData')}</button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('importStandards')} footer={footer}>
            <form id="import-form" onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-500">{t('standardsFound').replace('{count}', detectedCount.toString())}</p>
                <div>
                    <label htmlFor="program" className={labelClasses}>{t('importToProgram')}</label>
                    <select id="program" value={selectedProgramId} onChange={e => setSelectedProgramId(e.target.value)} className={inputClasses} required>
                        <option value="">{t('selectProgram')}</option>
                        {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </form>
        </Modal>
    );
};

export default ImportStandardsModal;