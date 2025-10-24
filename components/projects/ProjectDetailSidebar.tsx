import React from 'react';
import { ProjectDetailView } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { ChartPieIcon, ClipboardDocumentCheckIcon, DocumentTextIcon, ClockIcon, ClipboardDocumentSearchIcon, BeakerIcon } from '../icons';

interface ProjectDetailSidebarProps {
  currentView: ProjectDetailView;
  onSetView: (view: ProjectDetailView) => void;
  isFinalized: boolean;
}

const ProjectDetailSidebar: React.FC<ProjectDetailSidebarProps> = ({ currentView, onSetView, isFinalized }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'overview', label: t('overview'), icon: ChartPieIcon },
    { id: 'checklist', label: t('checklist'), icon: ClipboardDocumentCheckIcon },
    { id: 'documents', label: t('documents'), icon: DocumentTextIcon },
    { id: 'audit_log', label: t('auditLog'), icon: ClockIcon },
    { id: 'mock_surveys', label: t('mockSurveys'), icon: ClipboardDocumentSearchIcon },
    { id: 'design_controls', label: t('designControls'), icon: BeakerIcon },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <nav className="space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSetView(item.id as ProjectDetailView)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              currentView === item.id
                ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20'
                : 'text-brand-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default ProjectDetailSidebar;
