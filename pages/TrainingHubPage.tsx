import React, { useState } from 'react';
import { TrainingProgram, UserTrainingStatus, User, Department, NavigationState, UserRole } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { AcademicCapIcon } from '../components/icons';
import MyTrainingTab from '../components/training/MyTrainingTab';
import TrainingAdminTab from '../components/training/TrainingAdminTab';

interface TrainingHubPageProps {
  trainingPrograms: TrainingProgram[];
  userTrainingStatus: UserTrainingStatus;
  currentUser: User;
  setNavigation: (state: NavigationState) => void;
  // Admin props
  users: User[];
  departments: Department[];
  onAssign: (data: { trainingId: string; userIds: string[]; departmentIds: string[]; dueDate?: string }) => Promise<void>;
  onCreate: (program: Omit<TrainingProgram, 'id'>) => Promise<void>;
  onUpdate: (program: TrainingProgram) => Promise<void>;
  onDelete: (programId: string) => Promise<void>;
}

const TrainingHubPage: React.FC<TrainingHubPageProps> = (props) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('myTraining');
  const isAdmin = props.currentUser.role === UserRole.Admin;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
        <AcademicCapIcon className="h-8 w-8 text-brand-primary" />
        <div>
          {/* FIX: Cast translation key to any */}
          <h1 className="text-3xl font-bold">{t('trainingHubTitle' as any)}</h1>
          <p className="text-brand-text-secondary mt-1">{t('trainingPageDescription')}</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 rtl:space-x-reverse" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('myTraining')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'myTraining' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}
          >
            {t('myTraining')}
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'admin' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}
            >
              {t('trainingAdministration')}
            </button>
          )}
        </nav>
      </div>

      <div>
        {activeTab === 'myTraining' && (
          <MyTrainingTab
            trainingPrograms={props.trainingPrograms}
            userTrainingStatus={props.userTrainingStatus}
            currentUser={props.currentUser}
            setNavigation={props.setNavigation}
          />
        )}
        {activeTab === 'admin' && isAdmin && (
          <TrainingAdminTab 
            trainingPrograms={props.trainingPrograms}
            users={props.users}
            departments={props.departments}
            onAssign={props.onAssign}
            onCreate={props.onCreate}
            onUpdate={props.onUpdate}
            onDelete={props.onDelete}
          />
        )}
      </div>
    </div>
  );
};

export default TrainingHubPage;