import React, { useState } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { useAppStore } from '../stores/useAppStore';
import { useUserStore } from '../stores/useUserStore';
import { NavigationState, ProjectDetailView } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import ProjectDetailHeader from '../components/projects/ProjectDetailHeader';
import ProjectDetailSidebar from '../components/projects/ProjectDetailSidebar';
import ProjectOverview from './ProjectOverview';
import ProjectChecklist from '../components/projects/ProjectChecklist';
import SignatureModal from '../components/common/SignatureModal';
import GenerateReportModal from '../components/documents/GenerateReportModal';
import { useToast } from '../hooks/useToast';

const ProjectDetailPage: React.FC<{ navigation: NavigationState & { view: 'projectDetail' } }> = ({ navigation }) => {
  const { t, lang } = useTranslation();
  const toast = useToast();
  const { projects, finalizeProject, updateChecklistItem, addCommentToChecklistItem, createEvidenceAndLink } = useProjectStore();
  const { programs, standards, users, documents, addDocument } = useAppStore();
  const { currentUser } = useUserStore();
  const [view, setView] = useState<ProjectDetailView>('overview');
  const [isFinalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);

  const project = projects.find(p => p.id === navigation.projectId);
  const program = programs.find(p => p.id === project?.programId);

  if (!project || !program || !currentUser) {
    // FIX: Cast 'projectNotFound' to any to resolve incorrect type error for translation key
    return <div>{t('projectNotFound' as any)}</div>;
  }

  const handleFinalizeConfirm = (password: string) => {
    // In a real app, you'd verify the password against the backend
    if (password === 'password') { // Placeholder for password check
      finalizeProject(project.id, currentUser.name);
      toast.success(t('projectFinalizedSuccess'));
      setFinalizeModalOpen(false);
    } else {
      toast.error(t('incorrectPassword' as any));
    }
  };

  const handleGenerateReport = (reportType: string) => {
    const reportContent = `<h1>${project.name} - ${t('complianceSummaryReport')}</h1><p>Compliance: ${project.progress}%</p>`;
    const newReport = {
        name: { en: `${project.name} - Compliance Summary`, ar: `ملخص الامتثال - ${project.name}` },
        type: 'Report' as const,
        isControlled: true,
        status: 'Draft' as const,
        content: { en: reportContent, ar: reportContent },
        currentVersion: 1,
        versionHistory: [],
        uploadedAt: new Date().toISOString(),
    };
    addDocument(newReport);
    toast.success(t('reportGeneratedSuccess'));
  }

  const renderView = () => {
    switch (view) {
      case 'overview':
        return <ProjectOverview project={project} />;
      case 'checklist':
        return <ProjectChecklist 
                  project={project} 
                  standards={standards.filter(s => s.programId === project.programId)}
                  users={users}
                  currentUser={currentUser}
                  onUpdateItem={updateChecklistItem}
                  onAddComment={addCommentToChecklistItem}
                  onUploadEvidence={createEvidenceAndLink}
               />;
      // Add other views like documents, audit_log etc. here
      default:
        return <ProjectOverview project={project} />;
    }
  };

  return (
    <div className="space-y-6">
      <ProjectDetailHeader 
        project={project}
        programName={program.name}
        currentUser={currentUser}
        onFinalize={() => setFinalizeModalOpen(true)}
        onGenerateReport={() => setReportModalOpen(true)}
      />
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <ProjectDetailSidebar
          currentView={view}
          onSetView={setView}
          isFinalized={project.status === 'Finalized'}
        />
        <div className="flex-grow w-full">
          {renderView()}
        </div>
      </div>

      <SignatureModal
        isOpen={isFinalizeModalOpen}
        onClose={() => setFinalizeModalOpen(false)}
        onConfirm={handleFinalizeConfirm}
        actionTitle={`${t('finalizeProject')}: ${project.name}`}
        signatureStatement={t('signatureStatementProject' as any)}
        confirmActionText={t('signAndFinalize' as any)}
      />
      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onGenerate={handleGenerateReport}
      />
    </div>
  );
};

export default ProjectDetailPage;
