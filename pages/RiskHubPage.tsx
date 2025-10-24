import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../stores/useAppStore';
import { useProjectStore } from '../stores/useProjectStore';
import { ExclamationTriangleIcon } from '../components/icons';
import RiskRegisterTab from '../components/risk/RiskRegisterTab';
import IncidentReportingTab from '../components/risk/IncidentReportingTab';
import CapaReportsTab from '../components/risk/CapaReportsTab';
import EffectivenessChecksTab from '../components/risk/EffectivenessChecksTab';

const RiskHubPage: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('register');
    const { risks, incidents, addRisk, updateRisk, deleteRisk, addIncident, updateIncident, deleteIncident, users, trainings } = useAppStore();
    const { projects } = useProjectStore();
    // Placeholder for CAPA updates - in a real app this would go through a store
    const updateCapa = (projectId: string, capa: any) => console.log("Update CAPA", projectId, capa);

    const tabs = [
        { id: 'register', label: t('riskRegister') },
        { id: 'incidents', label: t('incidentReporting') },
        { id: 'capa', label: t('capaReports') },
        { id: 'effectiveness', label: t('effectivenessChecks') },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                <ExclamationTriangleIcon className="h-8 w-8 text-brand-primary" />
                <div>
                    <h1 className="text-3xl font-bold">{t('riskHubTitle')}</h1>
                    <p className="text-brand-text-secondary mt-1">{t('riskHubDescription')}</p>
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'register' && <RiskRegisterTab risks={risks} users={users} trainingPrograms={trainings} onAdd={addRisk} onUpdate={updateRisk} onDelete={deleteRisk} />}
                {activeTab === 'incidents' && <IncidentReportingTab incidents={incidents} onAdd={addIncident} onUpdate={updateIncident} onDelete={deleteIncident} />}
                {activeTab === 'capa' && <CapaReportsTab projects={projects} users={users} onUpdateCapa={updateCapa} />}
                {activeTab === 'effectiveness' && <EffectivenessChecksTab projects={projects} onUpdateCapa={updateCapa} />}
            </div>
        </div>
    );
};

export default RiskHubPage;
