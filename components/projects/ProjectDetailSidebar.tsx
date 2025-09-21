
import React from 'react';
import { ProjectDetailView } from '@/types';
import { InformationCircleIcon, ClipboardDocumentListIcon, ArchiveBoxIcon, RectangleStackIcon, ClipboardDocumentSearchIcon, BeakerIcon } from '@/components/icons';
import { useTranslation } from '@/hooks/useTranslation';

interface ProjectDetailSidebarProps {
  activeView: ProjectDetailView;
  setView: (view: ProjectDetailView) => void;
}

const ProjectDetailSidebar: React.FC<ProjectDetailSidebarProps> = ({ activeView, setView }) => {
  const { t } = useTranslation();

  const navItems = [
    { view: 'overview', label: t('overview'), icon: InformationCircleIcon },
    { view: 'checklist', label: t('checklist'), icon: ClipboardDocumentListIcon },
    { view: 'documents', label: t('documents'), icon: ArchiveBoxIcon },
    { view: 'design_controls', label: t('designControls'), icon: BeakerIcon },
    { view: 'mock_surveys', label: t('mockSurveys'), icon: ClipboardDocumentSearchIcon },
    { view: 'audit_log', label: t('auditLog'), icon: RectangleStackIcon },
  ];

  return (
    <div className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
      <nav>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => setView(item.view as ProjectDetailView)}
                className={`w-full text-left flex items-center px-3 py-2.5 my-1 rounded-md text-sm transition-colors duration-200 ${
                  activeView === item.view
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-brand-primary dark:text-indigo-300 font-semibold'
                    : 'text-brand-text-secondary dark:text-dark-brand-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5 ltr:mr-3 rtl:ml-3" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ProjectDetailSidebar;