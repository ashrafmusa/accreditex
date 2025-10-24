import { create } from 'zustand';
import { AppSettings, NavigationState, User, AppDocument, Standard, AccreditationProgram, Department, Competency, TrainingProgram, CustomCalendarEvent, UserRole, Risk, IncidentReport } from '../types';
import { initialDataService } from '../services/initialData';
import { useUserStore } from './useUserStore';

interface AppState {
  navigation: NavigationState;
  appSettings: AppSettings | null;
  users: User[];
  documents: AppDocument[];
  standards: Standard[];
  programs: AccreditationProgram[];
  departments: Department[];
  competencies: Competency[];
  trainings: TrainingProgram[];
  customEvents: CustomCalendarEvent[];
  risks: Risk[];
  incidents: IncidentReport[];
  
  initialize: (data: ReturnType<typeof initialDataService.loadInitialData>) => void;
  setNavigation: (navigationState: NavigationState) => void;
  
  // Settings
  updateAppSettings: (settings: AppSettings) => void;

  // Users
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;

  // Documents
  addDocument: (doc: Omit<AppDocument, 'id' | 'versionHistory'>) => void;
  updateDocument: (doc: AppDocument) => void;
  deleteDocument: (docId: string) => void;
  approveDocument: (docId: string, userName: string) => void;
  addProcessMap: (data: { name: { en: string; ar: string } }) => void;

  // Accreditation Hub
  addProgram: (program: Omit<AccreditationProgram, 'id'>) => void;
  updateProgram: (program: AccreditationProgram) => void;
  deleteProgram: (programId: string) => void;
  addStandard: (standard: Standard) => void;
  updateStandard: (standard: Standard) => void;
  deleteStandard: (programId: string, standardId: string) => void;
  importStandards: (programId: string, standards: Standard[]) => void;

  // Departments
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (dept: Department) => void;
  deleteDepartment: (deptId: string) => void;

  // Competencies
  addCompetency: (comp: Omit<Competency, 'id'>) => void;
  updateCompetency: (comp: Competency) => void;
  deleteCompetency: (compId: string) => void;
  
  // Training
  addTraining: (program: Omit<TrainingProgram, 'id'>) => Promise<void>;
  updateTraining: (program: TrainingProgram) => Promise<void>;
  deleteTraining: (programId: string) => Promise<void>;
  assignTraining: (data: { trainingId: string; userIds: string[]; departmentIds: string[]; dueDate?: string }) => Promise<void>;

  // Calendar
  addCustomEvent: (event: Omit<CustomCalendarEvent, 'id' | 'type'>) => void;
  updateCustomEvent: (event: CustomCalendarEvent) => void;
  deleteCustomEvent: (eventId: string) => void;
  
  // Risk & Incidents
  addRisk: (risk: Omit<Risk, 'id'>) => void;
  updateRisk: (risk: Risk) => void;
  deleteRisk: (riskId: string) => void;
  addIncident: (incident: Omit<IncidentReport, 'id'>) => void;
  updateIncident: (incident: IncidentReport) => void;
  deleteIncident: (incidentId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  navigation: { view: 'dashboard' },
  appSettings: null,
  users: [],
  documents: [],
  standards: [],
  programs: [],
  departments: [],
  competencies: [],
  trainings: [],
  customEvents: [],
  risks: [],
  incidents: [],

  initialize: (data) => set(data),
  setNavigation: (navigationState) => set({ navigation: navigationState }),
  
  // Settings
  updateAppSettings: (settings) => {
    initialDataService.updateAppSettings(settings);
    set({ appSettings: settings });
  },

  // Users
  addUser: (user) => {
    const newUser = initialDataService.addUser(user);
    set(state => ({ users: [...state.users, newUser] }));
  },
  updateUser: (user) => {
    const updatedUser = initialDataService.updateUser(user);
    set(state => ({
      users: state.users.map(u => u.id === user.id ? updatedUser : u)
    }));
    // If updating the current user, update the user store as well
    const currentUser = useUserStore.getState().currentUser;
    if(currentUser && currentUser.id === user.id) {
        useUserStore.getState().login(updatedUser);
    }
  },
  deleteUser: (userId) => {
    initialDataService.deleteUser(userId);
    set(state => ({ users: state.users.filter(u => u.id !== userId) }));
  },

  // Documents
  addDocument: (doc) => {
    const newDoc = initialDataService.addDocument(doc);
    set(state => ({ documents: [...state.documents, newDoc] }));
  },
  updateDocument: (doc) => {
    const updatedDoc = initialDataService.updateDocument(doc);
    set(state => ({
      documents: state.documents.map(d => d.id === doc.id ? updatedDoc : d)
    }));
  },
  deleteDocument: (docId) => {
    initialDataService.deleteDocument(docId);
    set(state => ({ documents: state.documents.filter(d => d.id !== docId) }));
  },
  approveDocument: (docId, userName) => {
    const approvedDoc = initialDataService.approveDocument(docId, userName);
    set(state => ({
        documents: state.documents.map(d => d.id === docId ? approvedDoc : d)
    }));
  },
  addProcessMap: (data) => {
    const newMap = initialDataService.addProcessMap(data);
    set(state => ({ documents: [...state.documents, newMap] }));
  },

  // Accreditation Hub
  addProgram: (program) => {
    const newProgram = initialDataService.addProgram(program);
    set(state => ({ programs: [...state.programs, newProgram] }));
  },
  updateProgram: (program) => {
    const updatedProgram = initialDataService.updateProgram(program);
    set(state => ({ programs: state.programs.map(p => p.id === program.id ? updatedProgram : p) }));
  },
  deleteProgram: (programId) => {
    initialDataService.deleteProgram(programId);
    set(state => ({ programs: state.programs.filter(p => p.id !== programId) }));
  },
  addStandard: (standard) => {
    const newStandard = initialDataService.addStandard(standard);
    set(state => ({ standards: [...state.standards, newStandard] }));
  },
  updateStandard: (standard) => {
    const updatedStandard = initialDataService.updateStandard(standard);
    set(state => ({ standards: state.standards.map(s => s.programId === standard.programId && s.standardId === standard.standardId ? updatedStandard : s) }));
  },
  deleteStandard: (programId, standardId) => {
    initialDataService.deleteStandard(programId, standardId);
    set(state => ({ standards: state.standards.filter(s => s.programId !== programId || s.standardId !== standardId) }));
  },
  importStandards: (programId, standards) => {
    const newStandards = initialDataService.importStandards(programId, standards);
    set(state => ({ standards: [...state.standards, ...newStandards] }));
  },

  // Departments
  addDepartment: (dept) => {
    const newDept = initialDataService.addDepartment(dept);
    set(state => ({ departments: [...state.departments, newDept] }));
  },
  updateDepartment: (dept) => {
    const updatedDept = initialDataService.updateDepartment(dept);
    set(state => ({ departments: state.departments.map(d => d.id === dept.id ? updatedDept : d) }));
  },
  deleteDepartment: (deptId) => {
    initialDataService.deleteDepartment(deptId);
    set(state => ({ departments: state.departments.filter(d => d.id !== deptId) }));
  },
  
  // Competencies
  addCompetency: (comp) => {
    const newComp = initialDataService.addCompetency(comp);
    set(state => ({ competencies: [...state.competencies, newComp] }));
  },
  updateCompetency: (comp) => {
    const updatedComp = initialDataService.updateCompetency(comp);
    set(state => ({ competencies: state.competencies.map(c => c.id === comp.id ? updatedComp : c) }));
  },
  deleteCompetency: (compId) => {
    initialDataService.deleteCompetency(compId);
    set(state => ({ competencies: state.competencies.filter(c => c.id !== compId) }));
  },

  // Training
  addTraining: async (program) => {
    const newTraining = initialDataService.addTraining(program);
    set(state => ({ trainings: [...state.trainings, newTraining] }));
  },
  updateTraining: async (program) => {
    const updatedTraining = initialDataService.updateTraining(program);
    set(state => ({ trainings: state.trainings.map(t => t.id === program.id ? updatedTraining : t) }));
  },
  deleteTraining: async (programId) => {
    initialDataService.deleteTraining(programId);
    set(state => ({ trainings: state.trainings.filter(t => t.id !== programId) }));
  },
  assignTraining: async (data) => {
    const updatedUsers = initialDataService.assignTraining(data);
    set(state => ({
        users: state.users.map(u => updatedUsers.find(up => up.id === u.id) || u)
    }));
  },

  // Calendar
  addCustomEvent: (event) => {
    const newEvent = initialDataService.addCustomEvent(event);
    set(state => ({ customEvents: [...state.customEvents, newEvent] }));
  },
  updateCustomEvent: (event) => {
    const updatedEvent = initialDataService.updateCustomEvent(event);
    set(state => ({ customEvents: state.customEvents.map(e => e.id === event.id ? updatedEvent : e) }));
  },
  deleteCustomEvent: (eventId) => {
    initialDataService.deleteCustomEvent(eventId);
    set(state => ({ customEvents: state.customEvents.filter(e => e.id !== eventId) }));
  },
  
  // Risk & Incidents
  addRisk: (risk) => {
    const newRisk = initialDataService.addRisk(risk);
    set(state => ({ risks: [...state.risks, newRisk] }));
  },
  updateRisk: (risk) => {
    const updatedRisk = initialDataService.updateRisk(risk);
    set(state => ({ risks: state.risks.map(r => r.id === risk.id ? updatedRisk : r) }));
  },
  deleteRisk: (riskId) => {
    initialDataService.deleteRisk(riskId);
    set(state => ({ risks: state.risks.filter(r => r.id !== riskId) }));
  },
  addIncident: (incident) => {
    const newIncident = initialDataService.addIncident(incident);
    set(state => ({ incidents: [...state.incidents, newIncident] }));
  },
  updateIncident: (incident) => {
    const updatedIncident = initialDataService.updateIncident(incident);
    set(state => ({ incidents: state.incidents.map(i => i.id === incident.id ? updatedIncident : i) }));
  },
  deleteIncident: (incidentId) => {
    initialDataService.deleteIncident(incidentId);
    set(state => ({ incidents: state.incidents.filter(i => i.id !== incidentId) }));
  },
}));
