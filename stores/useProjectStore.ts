import { create } from 'zustand';
import { Project, CAPAReport, DesignControlItem, AppDocument, Comment, ComplianceStatus } from '@/types';
import { backendService } from '../services/BackendService';
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
  
  return parseFloat(((score / applicableItems.length) * 100).toFixed(1));
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
    const projects = backendService.getProjects().map(p => ({
        ...p,
        progress: calculateProgress(p.checklist)
    }));
    set({ projects });
  },
  addProject: async (newProjectData) => {
    const newProject = await backendService.createProject(newProjectData);
    if (newProject) {
      set(state => ({ projects: [newProject, ...state.projects] }));
    }
  },
  updateProject: async (updatedProject) => {
    const projectWithProgress = { 
        ...updatedProject, 
        progress: calculateProgress(updatedProject.checklist)
    };

    const projectWithLogs = await backendService.updateProject(projectWithProgress);
    set(state => ({
      projects: state.projects.map(p => p.id === projectWithLogs.id ? projectWithLogs : p)
    }));
  },
  deleteProject: async (projectId) => {
    await backendService.deleteProject(projectId);
    set(state => ({ projects: state.projects.filter(p => p.id !== projectId) }));
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
    const updatedProject = await backendService.addComment(projectId, checklistItemId, commentData);
    get().updateProject(updatedProject);
  },
  createCapaReport: async (capaData) => {
    const updatedProject = await backendService.addCapaReport(capaData.sourceProjectId, capaData);
    get().updateProject(updatedProject);
  },
  finalizeProject: async (projectId, passwordAttempt) => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) throw new Error("User not logged in.");
    const updatedProject = await backendService.finalizeProject(projectId, currentUser.id, passwordAttempt);
    get().updateProject(updatedProject);
  },
  updateDesignControls: async (projectId, designControls) => {
    const updatedProject = await backendService.updateDesignControls(projectId, designControls);
    get().updateProject(updatedProject);
  },
  uploadEvidence: async (projectId, checklistItemId, docData) => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) return;
    const { updatedProject, newDocument } = await backendService.uploadEvidenceDocument(projectId, checklistItemId, docData, currentUser.name);
    get().updateProject(updatedProject);
    useAppStore.getState().addDocument(newDocument);
  },
  generateReport: async (projectId, reportType) => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) return;
    const project = get().projects.find(p => p.id === projectId);
    if (!project) return;
    const newDoc = await backendService.generateProjectReport(project, reportType, currentUser.name);
    useAppStore.getState().addDocument(newDoc);
  },
  updateCapa: async (projectId, updatedCapa) => {
    const updatedProject = await backendService.updateCapa(projectId, updatedCapa);
    get().updateProject(updatedProject);
  },
  startMockSurvey: async (projectId: string) => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) throw new Error("User not authenticated");
    const { updatedProject, newSurvey } = await backendService.startMockSurvey(projectId, currentUser.id);
    get().updateProject(updatedProject);
    return { updatedProject, newSurvey };
  },
  updateMockSurvey: async (projectId: string, survey: any) => {
    const updatedProject = await backendService.updateMockSurvey(projectId, survey);
    get().updateProject(updatedProject);
  },
  applySurveyFindingsToProject: async (projectId, surveyId) => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) return;
    const updatedProject = await backendService.applySurveyFindingsToProject(projectId, surveyId, currentUser.name);
    get().updateProject(updatedProject);
  },
}));
