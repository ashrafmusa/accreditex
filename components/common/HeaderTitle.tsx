import React from 'react';
import { NavigationState } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface HeaderTitleProps {
    navigation: NavigationState;
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ navigation }) => {
    const { t } = useTranslation();

    const getTitle = () => {
        switch (navigation.view) {
          case 'dashboard': return t('dashboardOverview');
          case 'projects': return t('accreditationProjects');
          case 'projectDetail': return t('projectDetails');
          case 'createProject': return t('createNewProject');
          case 'editProject': return t('editProject');
          case 'standards': return t('programStandards');
          case 'myTasks': return t('myTasks');
          case 'departments': return t('departmentsHub');
          case 'departmentDetail': return t('departmentDetails');
          case 'settings':
            switch (navigation.section) {
              case 'users': return t('userManagement');
              case 'accreditationHub': return t('accreditationHubTitle');
              default: return t('settings');
            }
          case 'trainingHub': return t('trainingHubTitle');
          case 'trainingDetail': return t('trainingDetailTitle');
          case 'certificate': return t('certificateTitle');
          case 'mockSurvey': return t('mockSurvey');
          case 'surveyReport': return t('surveyReport');
          case 'analytics': return t('analyticsHub');
          case 'calendar': return t('complianceCalendar');
          case 'risk': return t('riskHubTitle');
          default: return 'AccreditEx';
        }
      };

    return (
        <h1 className="text-xl font-semibold text-brand-text-primary dark:text-dark-brand-text-primary ltr:sm:ml-0 rtl:sm:mr-0 ltr:ml-2 rtl:mr-2">{getTitle()}</h1>
    );
};

export default HeaderTitle;