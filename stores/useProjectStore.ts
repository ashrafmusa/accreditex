import { create } from 'zustand';
import { Project, CAPAReport, DesignControlItem, AppDocument, Comment, ComplianceStatus } from '../types';
import { dataService } from '../services/data';
import { useAppStore } from './useAppStore';
import { useUserStore } from './useUserStore';

type NewProjectDataType = Omit<Project, 'id' | 'checklist' | 'status' | 'progress' | 'projectLead' | 'activityLog' | 'mockSurveys' | 'capaReports' | 'designControls'> & { leadId?: string };

const calculateProgress = (checklist: Project['checklist']): number => {
  const applicableItems = checklist.filter(c => c.status !== ComplianceStatus.NotApplicable);
  if (applicableItems.length === 0) return 100;

  const score = applicableItems.reduce((acc, item) => {
    if (item.status === ComplianceStatus.Compliant) return acc + 1;
    if (item.status === ComplianceStatus.PartiallyCompliant) return acc + 0.5;
    return acc;
  }, 0);

  return (score / applicableItems.length) * 100;
};


interface ProjectState {
  projects: Project[];
  fetchProjects: () => Promise<void>;
  addProject: (newProjectData: NewProjectDataType) => Promise<void>;
  updateProject: (updatedProject: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addComment: (projectId: string, checklistItemId: string, text: string) => Promise<void>;
  createCapaReport: (capaData: Omit<CAPAReport, 'id'>) => Promise<void>;
  finalizeProject: (projectId: string, passwordAttempt: string) => Promise<void>;
  updateDesignControls: (projectId: string, designControls: DesignControlItem[]) => Promise<void>;
  uploadEvidence: (projectId: string, checklistItemId: string, docData: { name: { en: string; ar: string }, uploadedFile: { name: string, type: string } }) => Promise<void>;
  generateReport: (projectId: string, reportType: string) => Promise<void>;
  updateCapa: (projectId: string, updatedCapa: CAPAReport) => Promise<void>;
  startMockSurvey: (projectId: string) => Promise<{ updatedProject: Project, newSurvey: any }>;
  updateMockSurvey: (projectId: string, survey: any) => Promise<void>;
  applySurveyFindingsToProject: (projectId: string, surveyId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  fetchProjects: async () => {
    const projects = dataService.getProjects().map(p => ({
      ...p,
      progress: calculateProgress(p.checklist)
    }));
    set({ projects });
  },
  addProject: async (newProjectData) => {
    const projects = get().projects;
    const newProject = { ...newProjectData, id: Date.now().toString(), checklist: [], status: 'On Track', progress: 0, projectLead: '', activityLog: [], mockSurveys: [], capaReports: [], designControls: [] };
    dataService.setProjects([...projects, newProject]);
    set({ projects: [...projects, newProject] });
  },
  updateProject: async (updatedProject) => {
    const projectWithProgress = {
      ...updatedProject,
      progress: calculateProgress(updatedProject.checklist)
    };

    const projects = get().projects.map(p => p.id === projectWithProgress.id ? projectWithProgress : p);
    dataService.setProjects(projects);
    set({ projects });
  },
  deleteProject: async (projectId) => {
    const projects = get().projects.filter(p => p.id !== projectId);
    dataService.setProjects(projects);
    set({ projects });
  },
  addComment: async (projectId, checklistItemId, text) => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) return;
    const commentData: Omit<Comment, 'id'> = {
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      text,
    };
    const projects = get().projects;
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const checklistItem = project.checklist.find(c => c.id === checklistItemId);
      if (checklistItem) {
        const newComment = { ...commentData, id: Date.now().toString() };
        checklistItem.comments.push(newComment);
        get().updateProject(project);
      }
    }
  },
  createCapaReport: async (capaData) => {
    const projects = get().projects;
    const project = projects.find(p => p.id === capaData.sourceProjectId);
    if (project) {
      const newCapa = { ...capaData, id: Date.now().toString() };
      project.capaReports.push(newCapa);
      get().updateProject(project);
    }
  },
  finalizeProject: async (projectId, passwordAttempt) => {
    // This is a complex action that might need more than just data service
    // For now, we just update the project status
    const projects = get().projects;
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.status = 'Finalized';
      get().updateProject(project);
    }
  },
  updateDesignControls: async (projectId, designControls) => {
    const projects = get().projects;
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.designControls = designControls;
      get().updateProject(project);
    }
  },
  uploadEvidence: async (projectId, checklistItemId, docData) => {
    // This is a complex action that might need more than just data service
    // For now, we just update the project
    const projects = get().projects;
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const checklistItem = project.checklist.find(c => c.id === checklistItemId);
      if (checklistItem) {
        const newDoc = { ...docData, id: Date.now().toString(), uploadedBy: useUserStore.getState().currentUser?.name || 'System', uploadDate: new Date().toISOString(), fileType: docData.uploadedFile.type, url: '' };
        checklistItem.evidence.push(newDoc);
        get().updateProject(project);
        useAppStore.getState().addDocument(newDoc as AppDocument);
      }
    }
  },
  generateReport: async (projectId, reportType) => {
    // This is a complex action that might need more than just data service
    // For now, we do nothing
  },
  updateCapa: async (projectId, updatedCapa) => {
    const projects = get().projects;
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.capaReports = project.capaReports.map(c => c.id === updatedCapa.id ? updatedCapa : c);
      get().updateProject(project);
    }
  },
  startMockSurvey: async (projectId: string) => {
    // This is a complex action that might need more than just data service
    // For now, we do nothing
    const project = get().projects.find(p => p.id === projectId);
    return { updatedProject: project, newSurvey: {} };
  },
  updateMockSurvey: async (projectId: string, survey: any) => {
    // This is a complex action that might need more than just data service
    // For now, we do nothing
  },
  applySurveyFindingsToProject: async (projectId, surveyId) => {
    // This is a complex action that might need more than just data service
    // For now, we do nothing
  },
}));