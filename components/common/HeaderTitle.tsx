import React from 'react';
import { NavigationState } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { 
    ChartPieIcon, ChartBarSquareIcon, LightBulbIcon, CalendarDaysIcon, FolderIcon, DocumentTextIcon, 
    ClipboardDocumentCheckIcon, ExclamationTriangleIcon, ClipboardDocumentSearchIcon, CircleStackIcon, 
    BuildingOffice2Icon, AcademicCapIcon, ShieldCheckIcon, Cog6ToothIcon, UsersIcon, GlobeAltIcon, IdentificationIcon
} from '../icons';

interface HeaderTitleProps {
    navigation: NavigationState;
}

const viewToIconMap: Record<string, React.FC<any>> = {
    dashboard: ChartPieIcon,
    analytics: ChartBarSquareIcon,
    qualityInsights: LightBulbIcon,
    calendar: CalendarDaysIcon,
    projects: FolderIcon,
    projectDetail: FolderIcon,
    createProject: FolderIcon,
    editProject: FolderIcon,
    documentControl: DocumentTextIcon,
    myTasks: ClipboardDocumentCheckIcon,
    risk: ExclamationTriangleIcon,
    auditHub: ClipboardDocumentSearchIcon,
    dataHub: CircleStackIcon,
    departments: BuildingOffice2Icon,
    departmentDetail: BuildingOffice2Icon,
    trainingHub: AcademicCapIcon,
    trainingDetail: AcademicCapIcon,
    certificate: AcademicCapIcon,
    standards: ShieldCheckIcon,
    mockSurvey: ClipboardDocumentSearchIcon,
    surveyReport: ClipboardDocumentSearchIcon,
    settings: Cog6ToothIcon,
    userProfile: UsersIcon,
};

const HeaderTitle: React.FC<HeaderTitleProps> = ({ navigation }) => {
    const { t } = useTranslation();

    const getTitleAndIcon = () => {
        let titleText = '';

        switch (navigation.view) {
          // FIX: Cast translation key to any
          case 'dashboard': titleText = t('dashboardOverview' as any); break;
          case 'projects': titleText = t('accreditationProjects'); break;
          case 'projectDetail': titleText = t('projectDetails'); break;
          case 'createProject': titleText = t('createNewProject'); break;
          // FIX: Cast translation key to any
          case 'editProject': titleText = t('editProject' as any); break;
          case 'standards': titleText = t('programStandards'); break;
          case 'myTasks': titleText = t('myTasks'); break;
          case 'departments': titleText = t('departmentsHub'); break;
          case 'departmentDetail': titleText = t('departmentDetails'); break;
          case 'settings':
            switch (navigation.section) {
              case 'users': titleText = t('userManagement'); break;
              case 'accreditationHub': titleText = t('accreditationHubTitle'); break;
              case 'security': titleText = t('security'); break;
              case 'general': titleText = t('general'); break;
              case 'profile': titleText = t('profile'); break;
              case 'competencies': titleText = t('competencies'); break;
              case 'data': titleText = t('dataManagement'); break;
              case 'about': titleText = t('about'); break;
              default: titleText = t('settings');
            }
            break;
          // FIX: Cast translation key to any
          case 'userProfile': titleText = t('userProfile' as any); break;
          // FIX: Cast translation key to any
          case 'trainingHub': titleText = t('trainingHubTitle' as any); break;
          // FIX: Cast translation key to any
          case 'trainingDetail': titleText = t('trainingDetailTitle' as any); break;
          // FIX: Cast translation key to any
          case 'certificate': titleText = t('certificateTitle' as any); break;
          // FIX: Cast translation key to any
          case 'mockSurvey': titleText = t('mockSurvey' as any); break;
          // FIX: Cast translation key to any
          case 'surveyReport': titleText = t('surveyReport' as any); break;
          // FIX: Cast translation key to any
          case 'analytics': titleText = t('analyticsHub' as any); break;
          // FIX: Cast translation key to any
          case 'calendar': titleText = t('complianceCalendar' as any); break;
          case 'risk': titleText = t('riskHubTitle'); break;
          case 'auditHub': titleText = t('auditHub'); break;
          case 'documentControl': titleText = t('documentControl'); break;
          // FIX: Cast translation key to any
          case 'qualityInsights': titleText = t('qualityInsightsHub' as any); break;
          case 'dataHub': titleText = t('dataHub'); break;
          default: titleText = 'AccreditEx';
        }
        
        const settingsIconMap: Record<string, React.FC<any>> = {
            users: UsersIcon,
            accreditationHub: GlobeAltIcon,
            competencies: IdentificationIcon,
        }
        
        let Icon = viewToIconMap[navigation.view];
        if(navigation.view === 'settings' && navigation.section && settingsIconMap[navigation.section]) {
            Icon = settingsIconMap[navigation.section];
        }

        return { title: titleText, Icon };
      };

    const { title, Icon } = getTitleAndIcon();

    return (
        <div className="flex items-center gap-3">
            {Icon && <Icon className="h-6 w-6 text-brand-primary hidden sm:block" />}
            <h1 className="text-xl font-semibold text-brand-text-primary dark:text-dark-brand-text-primary ltr:sm:ml-0 rtl:sm:mr-0 ltr:ml-2 rtl:mr-2 truncate">{title}</h1>
        </div>
    );
};

export default HeaderTitle;