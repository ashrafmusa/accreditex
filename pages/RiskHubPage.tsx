import React, { useState } from 'react';
import { NavigationState } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { ExclamationTriangleIcon } from '@/components/icons';
import CapaReportsTab from '@/components/risk/CapaReportsTab';
import RiskRegisterTab from '@/components/risk/RiskRegisterTab';
import EffectivenessChecksTab from '@/components/risk/EffectivenessChecksTab';
import IncidentReportingTab from '@/components/risk/IncidentReportingTab';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUserStore } from '@/stores/useUserStore';
import { useAppStore } from '@/stores/useAppStore';

type ActiveTab = 'capa' | 'risk' | 'effectiveness' | 'incidents';

interface RiskHubPageProps {
  setNavigation: (state: NavigationState) => void;
}

const RiskHubPage: React.FC<RiskHubPageProps> = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>('incidents');
  
  const projects = useProjectStore(state => state.projects);
  const users = useUserStore(state => state.users);
  const currentUser = useUserStore(state => state.currentUser)!;
  const { 
    risks, trainingPrograms, addRisk, updateRisk, deleteRisk, 
// FIX: Add missing properties related to incident reporting from the app store.
    incidentReports, addIncidentReport, updateIncidentReport, deleteIncidentReport 
  } = useAppStore();
  const updateCapa = useProjectStore(state => state.updateCapa);
  const createCapaReport = useProjectStore(state => state.createCapaReport);

  const tabButtonClasses = (tabName: ActiveTab) => 
    `px-4 py-2 text-sm font-semibold rounded-md ${
        activeTab === tabName 
        ? 'bg-brand-primary text-white' 
        : 'text-brand-text-secondary dark:text-dark-brand-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  const renderContent = () => {
    switch (activeTab) {
      case 'incidents':
        return <IncidentReportingTab 
          incidentReports={incidentReports}
          users={users}
          currentUser={currentUser}
          onCreate={addIncidentReport}
          onUpdate={updateIncidentReport}
          onDelete={deleteIncidentReport}
          onCreateCapa={createCapaReport}
          trainingPrograms={trainingPrograms}
        />;
      case 'capa':
        return <CapaReportsTab projects={projects} users={users} />;
      case 'risk':
        return <RiskRegisterTab 
          risks={risks} 
          users={users} 
          trainingPrograms={trainingPrograms}
          currentUser={currentUser}
          onCreateRisk={addRisk}
          onUpdateRisk={updateRisk}
          onDeleteRisk={deleteRisk}
        />;
      case 'effectiveness':
        return <EffectivenessChecksTab projects={projects} onUpdateCapa={updateCapa} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <ExclamationTriangleIcon className="h-8 w-8 text-brand-primary" />
          <div>
            <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('riskHubTitle')}</h1>
            <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('riskHubDescription')}</p>
          </div>
        </div>
      
      <div className="flex items-center border-b border-gray-200 dark:border-dark-brand-border">
          {/* FIX: Add missing translation key to resolve type error. */}
          <button onClick={() => setActiveTab('incidents')} className={tabButtonClasses('incidents')}>{t('incidentReporting')}</button>
          <button onClick={() => setActiveTab('capa')} className={tabButtonClasses('capa')}>{t('capaReports')}</button>
          <button onClick={() => setActiveTab('risk')} className={tabButtonClasses('risk')}>{t('riskRegister')}</button>
          <button onClick={() => setActiveTab('effectiveness')} className={tabButtonClasses('effectiveness')}>{t('effectivenessChecks')}</button>
      </div>

      {renderContent()}
    </div>
  );
};

export default RiskHubPage;
