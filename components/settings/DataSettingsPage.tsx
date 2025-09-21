import React, { useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import SettingsCard from './SettingsCard';
import { useAppStore } from '../../stores/useAppStore';
import { useToast } from '../../hooks/useToast';
import { ArrowUpOnSquareIcon, ArrowDownOnSquareIcon } from '../icons';
import ConfirmationModal from '../common/ConfirmationModal';

const DataSettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const importFileRef = useRef<HTMLInputElement>(null);
    const { importAllData, deleteAllProgramsAndStandards, deleteAllTrainingsAndRecords } = useAppStore();
    const toast = useToast();

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        onConfirm: () => void;
        title: string;
        message: string;
        confirmationText: string;
    } | null>(null);

    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction.onConfirm();
        }
        setIsConfirmModalOpen(false);
        setConfirmAction(null);
    };

    const triggerConfirmation = (action: () => void, title: string, message: string, confirmationText: string) => {
        setConfirmAction({ onConfirm: action, title, message, confirmationText });
        setIsConfirmModalOpen(true);
    };
    
    const onAppReset = () => {
        triggerConfirmation(
            () => {
                localStorage.clear();
                window.location.reload();
            },
            t('resetApplication'),
            t('resetApplicationConfirmation'),
            'RESET'
        );
    };

    const handleExport = () => {
        const data = useAppStore.getState().exportAllData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'accreditex_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        importFileRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const text = e.target?.result;
                if (typeof text === 'string') {
                     triggerConfirmation(
                        async () => {
                            await importAllData(text);
                            toast.success('Data imported successfully. The app will now reload.');
                            setTimeout(() => window.location.reload(), 1500);
                        },
                        t('importData'),
                        t('importWarningWithCaveat'),
                        'IMPORT'
                    );
                }
            };
            reader.readAsText(file);
        }
        if(importFileRef.current) importFileRef.current.value = "";
    };

    const handleDeletePrograms = async () => {
        await deleteAllProgramsAndStandards();
        toast.success(t('deleteProgramsSuccess'));
    };

    const handleDeleteTrainings = async () => {
        await deleteAllTrainingsAndRecords();
        toast.success(t('deleteTrainingsSuccess'));
    };

    const buttonClasses = "inline-flex items-center justify-center gap-2 py-2 px-4 border border-brand-border dark:border-dark-brand-border shadow-sm text-sm font-medium rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 w-full sm:w-auto";

    return (
        <>
            <div className="space-y-6">
                <SettingsCard title={t('backupAndRestore')} description={t('backupAndRestoreDescription')}>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={handleExport} className={buttonClasses}>
                            <ArrowUpOnSquareIcon className="w-5 h-5" />
                            {t('exportButton')}
                        </button>
                        <button onClick={handleImportClick} className={buttonClasses}>
                            <ArrowDownOnSquareIcon className="w-5 h-5" />
                            {/* FIX: Corrected translation key from 'importButton' to 'importData' to match existing keys. */}
                            {t('importData')}
                        </button>
                    </div>
                </SettingsCard>
                
                <div className="rounded-xl border-2 border-red-500/50 dark:border-red-500/30 bg-red-50/50 dark:bg-red-900/10">
                    <div className="p-6 border-b border-red-500/50 dark:border-red-500/30">
                        <h3 className="text-lg font-bold text-red-700 dark:text-red-300">{t('dangerZone')}</h3>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{t('dangerZoneDescription')}</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <h4 className="font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{t('deleteAllProjects')}</h4>
                                <p className="mt-1 text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('deleteProgramsDescription')}</p>
                            </div>
                            <button onClick={() => triggerConfirmation(handleDeletePrograms, t('deleteAllProjects'), t('deleteProgramsConfirmation'), 'DELETE')} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 px-4 py-2 text-sm font-semibold rounded-lg mt-2 sm:mt-0 flex-shrink-0 w-full sm:w-auto">{t('deleteAllProjects')}</button>
                        </div>
                        
                        <div className="border-t border-red-500/50 dark:border-red-500/30"></div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <h4 className="font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{t('deleteAllTrainingData')}</h4>
                                <p className="mt-1 text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('deleteTrainingsDescription')}</p>
                            </div>
                            <button onClick={() => triggerConfirmation(handleDeleteTrainings, t('deleteAllTrainingData'), t('deleteTrainingsConfirmation'), 'DELETE')} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 px-4 py-2 text-sm font-semibold rounded-lg mt-2 sm:mt-0 flex-shrink-0 w-full sm:w-auto">{t('deleteAllTrainingData')}</button>
                        </div>
                        
                        <div className="border-t border-red-500/50 dark:border-red-500/30"></div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <h4 className="font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{t('resetApplication')}</h4>
                                <p className="mt-1 text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('resetApplicationDescription')}</p>
                            </div>
                            <button onClick={onAppReset} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 px-4 py-2 text-sm font-semibold rounded-lg mt-2 sm:mt-0 flex-shrink-0 w-full sm:w-auto">{t('resetApp')}</button>
                        </div>
                    </div>
                </div>
            </div>
            <input type="file" ref={importFileRef} onChange={handleFileChange} accept=".json" className="hidden" />
            
            {isConfirmModalOpen && confirmAction && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirm}
                    title={confirmAction.title}
                    message={confirmAction.message}
                    confirmationText={confirmAction.confirmationText}
                />
            )}
        </>
    );
};

export default DataSettingsPage;