import React, { useState } from 'react';
import { TrainingProgram, User, NavigationState, UserRole } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { AcademicCapIcon } from '@/components/icons';
import MyTrainingTab from '@/components/training/MyTrainingTab';
import TrainingAdminTab from '@/components/training/TrainingAdminTab';
import { useAppStore } from '@/stores/useAppStore';
import { useUserStore } from '@/stores/useUserStore';

interface TrainingHubPageProps {
  setNavigation: (state: NavigationState) => void;
}

type ActiveTab = 'myTraining' | 'admin';

const TrainingHubPage: React.FC<TrainingHubPageProps> = ({ setNavigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>('myTraining');

  const { currentUser, users } = useUserStore();
  const { 
    trainingPrograms, 
    userTrainingStatuses,
    departments,
    addTrainingProgram,
    updateTrainingProgram,
    deleteTrainingProgram,
    assignTraining,
  } = useAppStore();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === UserRole.Admin;
  const userTrainingStatus = userTrainingStatuses[currentUser.id] || {};

  const tabButtonClasses = (tabName: ActiveTab) => 
    `px-4 py-2 text-sm font-semibold rounded-md ${
        activeTab === tabName 
        ? 'bg-brand-primary text-white' 
        : 'text-brand-text-secondary dark:text-dark-brand-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;
    
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
          <AcademicCapIcon className="h-8 w-8 text-brand-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary">{t('trainingHub')}</h1>
            <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('trainingHubDescription')}</p>
          </div>
        </div>
      </div>
      
      {isAdmin && (
        <div className="flex items-center border-b border-gray-200 dark:border-dark-brand-border">
            <button onClick={() => setActiveTab('myTraining')} className={tabButtonClasses('myTraining')}>{t('myTraining')}</button>
            <button onClick={() => setActiveTab('admin')} className={tabButtonClasses('admin')}>{t('trainingAdministration')}</button>
        </div>
      )}

      {activeTab === 'myTraining' && (
        <MyTrainingTab
            trainingPrograms={trainingPrograms}
            userTrainingStatus={userTrainingStatus}
            currentUser={currentUser}
            setNavigation={setNavigation}
        />
      )}

      {isAdmin && activeTab === 'admin' && (
        <TrainingAdminTab
            trainingPrograms={trainingPrograms}
            users={users}
            departments={departments}
            onAssign={assignTraining}
            onCreate={addTrainingProgram}
            onUpdate={updateTrainingProgram}
            onDelete={deleteTrainingProgram}
        />
      )}
    </div>
  );
};

export default TrainingHubPage;