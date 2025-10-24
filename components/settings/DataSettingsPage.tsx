import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import SettingsCard from './SettingsCard';
import DataActionButton from './DataActionButton';
import { useToast } from '../../hooks/useToast';
import { initialDataService } from '../../services/initialData';

const DataSettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const toast = useToast();

    const handleExport = () => {
        const allData = initialDataService.loadInitialData();
        const jsonString = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accreditex_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('dataExported'));
    };
    
    const handleImport = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            // In a real app, you would send this to the backend to process
            console.log(reader.result);
            toast.info(t('importStarted'));
            // Simulate import and refresh
            setTimeout(() => window.location.reload(), 2000);
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (window.confirm(t('confirmReset'))) {
            // In a mock setup, this is best done by clearing localStorage and reloading
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <SettingsCard title={t('dataManagement')} description={t('dataManagementDescription')}>
            <DataActionButton 
                title={t('exportData')}
                description={t('exportDataDescription')}
                buttonText={t('export')}
                onAction={handleExport}
            />
             <DataActionButton 
                title={t('importData')}
                description={t('importDataDescription')}
                buttonText={t('import')}
                onFileAction={handleImport}
                isFileInput
            />
             <DataActionButton 
                title={t('resetData')}
                description={t('resetDataDescription')}
                buttonText={t('reset')}
                onAction={handleReset}
                isDestructive
            />
        </SettingsCard>
    );
};

export default DataSettingsPage;
