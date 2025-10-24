

import { create } from 'zustand';
import { Project, ChecklistItem, ComplianceStatus, MockSurvey } from '../types';
import { initialDataService } from '../services/initialData';
import { useUserStore } from './useUserStore';
// FIX: Replace dynamic require with a standard import
import { useAppStore } from './useAppStore';

interface ProjectState {
  projects: Project[];
  initialize: (data: ReturnType<typeof initialDataService.loadInitialData>) => void;
  addProject: (projectData: Omit<Project, 'id' | 'progress' | 'checklist' | 'activityLog' | 'mockSurveys' | 'capaReports' | 'designControls'>) => void;
  finalizeProject: (projectId: string, userName: string) => void;
  updateChecklistItem: (projectId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  addCommentToChecklistItem: (projectId: string, itemId: string, commentText: string) => void;
  createEvidenceAndLink: (projectId: string, checklistItemId: string, fileData: any) => void;
  addMockSurvey: (projectId: string, surveyorId: string) => void;
  updateMockSurvey: (projectId: string, surveyId: string, updates: Partial<MockSurvey>) => void;
}

const calculateProgress = (checklist: ChecklistItem[]): number => {
    const applicableItems = checklist.filter(item => item.status !== ComplianceStatus.NotApplicable);
    if (applicableItems.length === 0) return 0;
    const score = applicableItems.reduce((acc, item) => {
        if (item.status === ComplianceStatus.Compliant) return acc + 1;
        if (item.status === ComplianceStatus.PartiallyCompliant) return acc + 0.5;
        return acc;
    }, 0);
    return (score / applicableItems.length) * 100;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  initialize: (data) => set({ projects: data.projects.map(p => ({...p, progress: calculateProgress(p.checklist)})) }),
  
  addProject: (projectData) => {
    const newProject = initialDataService.addProject(projectData);
    set(state => ({
      projects: [...state.projects, {...newProject, progress: calculateProgress(newProject.checklist) }]
    }));
  },

  finalizeProject: (projectId, userName) => {
    const updatedProject = initialDataService.finalizeProject(projectId, userName);
    set(state => ({
        projects: state.projects.map(p => p.id === projectId ? {...p, ...updatedProject} : p)
    }));
  },
  
  updateChecklistItem: (projectId, itemId, updates) => {
    const project = get().projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedChecklist = project.checklist.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    const updatedProject = { ...project, checklist: updatedChecklist, progress: calculateProgress(updatedChecklist) };
    initialDataService.updateProject(updatedProject); // Persist change to mock backend
    set(state => ({
      projects: state.projects.map(p => p.id === projectId ? updatedProject : p)
    }));
  },

  addCommentToChecklistItem: (projectId, itemId, commentText) => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) return;

    const project = get().projects.find(p => p.id === projectId);
    if (!project) return;

    const newComment = initialDataService.addCommentToChecklistItem(projectId, itemId, commentText, currentUser);
    
    const updatedChecklist = project.checklist.map(item =>
      item.id === itemId ? { ...item, comments: [...item.comments, newComment] } : item
    );
    const updatedProject = { ...project, checklist: updatedChecklist };

    initialDataService.updateProject(updatedProject);
    set(state => ({
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p)
    }));
  },

  createEvidenceAndLink: (projectId, checklistItemId, fileData) => {
      const { newDocument, updatedProject } = initialDataService.createEvidenceAndLink(projectId, checklistItemId, fileData);
      
      // We need to update both projects in this store and documents in the app store
      // This is a limitation of separating stores this way but is manageable
      // In a real app with a backend, we'd probably just refetch the project
      // FIX: Use getState() for inter-store communication to avoid circular dependency issues
      useAppStore.getState().addDocument(newDocument);

      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? {...updatedProject, progress: calculateProgress(updatedProject.checklist)} : p)
      }));
  },

  addMockSurvey: (projectId, surveyorId) => {
    const updatedProject = initialDataService.addMockSurvey(projectId, surveyorId);
    set(state => ({
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p)
    }));
  },

  updateMockSurvey: (projectId, surveyId, updates) => {
    const updatedProject = initialDataService.updateMockSurvey(projectId, surveyId, updates);
     set(state => ({
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p)
    }));
  }
}));
