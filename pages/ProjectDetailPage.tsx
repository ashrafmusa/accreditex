

import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import { Project, User, AppDocument, ProjectDetailView, Department, Standard, AccreditationProgram, NavigationState, ChecklistItem, CAPAReport, ProjectStatus, UserRole, DesignControlItem, TrainingProgram } from '../types';
import ProjectDetailSidebar from '../components/projects/ProjectDetailSidebar';
import ProjectChecklist from '../components/projects/ProjectChecklist';
import DocumentsPage from './DocumentsPage';
import ProjectOverview from './ProjectOverview';
import MockSurveyListPage from './MockSurveyListPage';
import CapaModal from '../components/risk/CapaModal';
import { useTranslation } from '../hooks/useTranslation';
import AuditLogPage from './AuditLogPage';
import SignatureModal from '../components/common/SignatureModal';
import DesignControlsPage from './DesignControlsPage';
import ProjectDetailHeader from '../components/projects/ProjectDetailHeader';
import GenerateReportModal from '../components/documents/GenerateReportModal';
import { useProjectStore } from '../stores/useProjectStore';
import { useUserStore } from '../stores/useUserStore';
import { useAppStore } from '../stores/useAppStore';

interface ProjectDetailPageProps {
  setNavigation: (state: NavigationState) => void;
  navigation: NavigationState;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ setNavigation, navigation }) => {
  const [activeView, setActiveView] = useState<ProjectDetailView>('checklist');
  const [isCapaModalOpen, setIsCapaModalOpen] = useState(false);
  const [capaSourceItem, setCapaSourceItem] = useState<ChecklistItem | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { t } = useTranslation();
  
  const { projectId } = navigation as { view: 'projectDetail', projectId: string };
  const { 
      projects, updateProject, addComment, createCapaReport, finalizeProject,
      updateDesignControls, uploadEvidence, generateReport, startMockSurvey
  } = useProjectStore();
  const { users, currentUser } = useUserStore();
  const { 
      documents, departments, standards, accreditationPrograms: programs, 
      trainingPrograms, updateDocument, approveDocument 
  } = useAppStore();
  
  const project = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);
  const program = useMemo(() => programs.find(p => p.id === project?.programId), [programs, project]);
  
  const handleTriggerCreateCapa = (item: ChecklistItem) => {
    setCapaSourceItem(item);
    setIsCapaModalOpen(true);
  };
  
  const handleSaveCapa = (capaData: Omit<CAPAReport, 'id'>) => {
    createCapaReport(capaData);
    setIsCapaModalOpen(false);
    setCapaSourceItem(null);
  };

  const handleConfirmSignature = (password: string) => {
    if (project) {
        finalizeProject(project.id, password);
    }
    setIsSignatureModalOpen(false);
  }

  const projectDocuments = useMemo(() => {
    if (!project) return [];
    const linkedDocIds = new Set(project.checklist.flatMap(item => item.evidenceFiles));
    return documents.filter(doc => linkedDocIds.has(doc.id));
  }, [documents, project]);

  const handleEvidenceUpload = (checklistItemId: string, docData: { name: { en: string; ar: string }, uploadedFile: { name: string, type: string }}) => {
    if (project) {
        uploadEvidence(project.id, checklistItemId, docData);
    }
  }

  if (!project || !currentUser) {
      // Optional: Add a loading state or redirect
      if (projects.length > 0) {
        setNavigation({ view: 'projects' });
      }
      return <div>Loading project...</div>;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <ProjectOverview project={project} />;
      case 'checklist':
        return <ProjectChecklist project={project} users={users} documents={documents} departments={departments} standards={standards} onUpdateProject={updateProject} programName={program?.name || ''} onAddComment={addComment} onCreateCapa={handleTriggerCreateCapa} currentUser={currentUser} isFinalized={project.status === ProjectStatus.Finalized} onUploadEvidence={handleEvidenceUpload} />;
      case 'documents':
        return <DocumentsPage documents={projectDocuments} onUpdateDocument={updateDocument} standards={standards} projectProgramId={project.programId} isFinalized={project.status === ProjectStatus.Finalized} currentUser={currentUser} onApproveDocument={(docId, pw) => approveDocument(docId, pw, project.id)} />;
      case 'audit_log':
        return <AuditLogPage activityLog={project.activityLog} />;
      case 'mock_surveys':
        return <MockSurveyListPage project={project} users={users} onStartMockSurvey={() => startMockSurvey(project.id)} setNavigation={setNavigation} />;
      case 'design_controls':
        return <DesignControlsPage project={project} documents={documents} onSave={(controls) => updateDesignControls(project.id, controls)} isFinalized={project.status === ProjectStatus.Finalized} />;
      default:
        return null;
    }
  }

  return (
    <>
      <div className="space-y-6">
        <ProjectDetailHeader
            project={project}
            programName={program?.name || ''}
            currentUser={currentUser}
            onFinalize={() => setIsSignatureModalOpen(true)}
            onGenerateReport={() => setIsReportModalOpen(true)}
        />
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/4 lg:w-1/5"><ProjectDetailSidebar activeView={activeView} setView={setActiveView} /></div>
          <div className="w-full md:w-3/4 lg:w-4/5">{renderContent()}</div>
        </div>
      </div>
      {isCapaModalOpen && capaSourceItem && (
        <CapaModal
          isOpen={isCapaModalOpen}
          onClose={() => setIsCapaModalOpen(false)}
          onSave={handleSaveCapa}
          users={users}
          trainingPrograms={trainingPrograms}
          sourceItem={capaSourceItem}
          projectId={project.id}
          projects={projects}
        />
      )}
      {isSignatureModalOpen && (
        <SignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onConfirm={handleConfirmSignature}
          actionTitle={t('finalizeProject')}
          signatureStatement={t('signatureStatementProject')}
          confirmActionText={t('signAndFinalize')}
        />
      )}
      {isReportModalOpen && (
        <GenerateReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onGenerate={(reportType) => generateReport(project.id, reportType)}
        />
      )}
    </>
  );
};

export default ProjectDetailPage;