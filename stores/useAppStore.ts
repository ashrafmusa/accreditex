import { create } from 'zustand';
import { Standard, AppDocument, Department, AccreditationProgram, TrainingProgram, UserTrainingStatus, Competency, Risk, CustomCalendarEvent, AppSettings, User, CertificateData, IncidentReport } from '@/types';
import { backendService } from '../services/BackendService';
import { useUserStore } from './useUserStore';
import { useProjectStore } from './useProjectStore';

interface AppState {
    standards: Standard[];
    documents: AppDocument[];
    departments: Department[];
    accreditationPrograms: AccreditationProgram[];
    trainingPrograms: TrainingProgram[];
    userTrainingStatuses: { [userId: string]: UserTrainingStatus };
    competencies: Competency[];
    risks: Risk[];
    incidentReports: IncidentReport[];
    customEvents: CustomCalendarEvent[];
    appSettings: AppSettings | null;
    certificates: CertificateData[];

    fetchAllData: () => Promise<void>;
    exportAllData: () => string;

    updateDocument: (updatedDocument: AppDocument) => Promise<void>;
    addDocument: (doc: AppDocument) => void;
    deleteDocument: (docId: string) => Promise<void>;
    approveDocument: (docId: string, passwordAttempt: string, projectId?: string) => Promise<void>;
    addControlledDocument: (docData: { name: { en: string; ar: string }, type: AppDocument['type'] }) => Promise<void>;
    addProcessMap: (docData: { name: { en: string; ar: string } }) => Promise<void>;

    addDepartment: (deptData: Omit<Department, 'id'>) => Promise<void>;
    updateDepartment: (updatedDept: Department) => Promise<void>;
    deleteDepartment: (deptId: string) => Promise<void>;

    addProgram: (programData: Omit<AccreditationProgram, 'id'>) => Promise<void>;
    updateProgram: (updatedProgram: AccreditationProgram) => Promise<void>;
    deleteProgram: (programId: string) => Promise<void>;
    deleteAllProgramsAndStandards: () => Promise<void>;

    addStandard: (standardData: Standard) => Promise<void>;
    updateStandard: (updatedStandard: Standard) => Promise<void>;
    deleteStandard: (standardId: string) => Promise<void>;
    importStandards: (jsonText: string, programId: string) => Promise<{ success: boolean; count: number; error?: string }>;

    addCompetency: (compData: Omit<Competency, 'id'>) => Promise<void>;
    updateCompetency: (updatedComp: Competency) => Promise<void>;
    deleteCompetency: (compId: string) => Promise<void>;

    addRisk: (riskData: Omit<Risk, 'id'>) => Promise<void>;
    updateRisk: (updatedRisk: Risk) => Promise<void>;
    deleteRisk: (riskId: string) => Promise<void>;

    addIncidentReport: (reportData: Omit<IncidentReport, 'id'>) => Promise<void>;
    updateIncidentReport: (report: IncidentReport) => Promise<void>;
    deleteIncidentReport: (reportId: string) => Promise<void>;

    addCustomEvent: (eventData: Omit<CustomCalendarEvent, 'id' | 'type'>) => Promise<void>;
    updateCustomEvent: (event: CustomCalendarEvent) => Promise<void>;
    deleteCustomEvent: (eventId: string) => Promise<void>;

    updateAppSettings: (settings: AppSettings) => Promise<void>;
    submitQuiz: (trainingId: string, answers: { [questionId: string]: number }) => Promise<{ score: number; passed: boolean; certificateId: string | null; }>;
// FIX: Add missing properties for training management.
    addTrainingProgram: (program: Omit<TrainingProgram, 'id'>) => Promise<void>;
    updateTrainingProgram: (program: TrainingProgram) => Promise<void>;
    deleteTrainingProgram: (programId: string) => Promise<void>;
    assignTraining: (data: { trainingId: string; userIds: string[]; departmentIds: string[]; dueDate?: string }) => Promise<void>;
    deleteAllTrainingsAndRecords: () => Promise<void>;

    importAllData: (jsonData: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    standards: [],
    documents: [],
    departments: [],
    accreditationPrograms: [],
    trainingPrograms: [],
    userTrainingStatuses: {},
    competencies: [],
    risks: [],
    incidentReports: [],
    customEvents: [],
    appSettings: null,
    certificates: [],

    fetchAllData: async () => {
        // Simulating an async operation to allow the app to correctly await this
        set({
            standards: backendService.getStandards(),
            documents: backendService.getDocuments(),
            departments: backendService.getDepartments(),
            accreditationPrograms: backendService.getAccreditationPrograms(),
            trainingPrograms: backendService.getTrainingPrograms(),
            userTrainingStatuses: backendService.getUserTrainingStatuses(),
            competencies: backendService.getCompetencies(),
            risks: backendService.getRisks(),
            incidentReports: backendService.getIncidentReports(),
            customEvents: backendService.getCustomEvents(),
            appSettings: backendService.getAppSettings(),
            certificates: backendService.getCertificates(),
        });
    },
    exportAllData: () => {
      return backendService.exportAllData();
    },
    updateDocument: async (updatedDocument) => {
        await backendService.updateDocument(updatedDocument);
        set(state => ({
            documents: state.documents.map(d => d.id === updatedDocument.id ? updatedDocument : d)
        }));
    },
    addDocument: (doc) => {
        set(state => ({ documents: [doc, ...state.documents] }));
    },
    deleteDocument: async (docId) => {
        await backendService.deleteDocument(docId);
        set({ documents: backendService.getDocuments() });
        useProjectStore.getState().fetchProjects();
    },
    approveDocument: async (docId, passwordAttempt, projectId) => {
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) throw new Error("User not authenticated");

        const { updatedDocument, updatedProject, updatedUsers } = await backendService.approveDocument(docId, currentUser.id, passwordAttempt, projectId);

        set(state => ({ documents: state.documents.map(d => d.id === updatedDocument.id ? updatedDocument : d) }));
        useUserStore.setState({ users: updatedUsers });

        if (updatedProject) {
            useProjectStore.getState().updateProject(updatedProject);
        }
    },
    addControlledDocument: async (docData) => {
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) return;
        const newDoc = await backendService.addControlledDocument({ ...docData, uploadedBy: currentUser.name });
        set(state => ({ documents: [newDoc, ...state.documents] }));
    },
    addProcessMap: async (docData) => {
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) return;
        const newDoc = await backendService.addProcessMap(docData, currentUser.name);
        set(state => ({ documents: [newDoc, ...state.documents] }));
    },
    addDepartment: async (deptData) => {
        const newDept = await backendService.addDepartment(deptData);
        set(state => ({ departments: [...state.departments, newDept] }));
    },
    updateDepartment: async (updatedDept) => {
        await backendService.updateDepartment(updatedDept);
        set(state => ({ departments: state.departments.map(d => d.id === updatedDept.id ? updatedDept : d) }));
    },
    deleteDepartment: async (deptId) => {
        await backendService.deleteDepartment(deptId);
        set({ departments: backendService.getDepartments() });
        useUserStore.setState({ users: backendService.getUsers() });
    },
    addProgram: async (programData) => {
        const newProgram = await backendService.addProgram(programData);
        set(state => ({ accreditationPrograms: [...state.accreditationPrograms, newProgram] }));
    },
    updateProgram: async (updatedProgram) => {
        await backendService.updateProgram(updatedProgram);
        set(state => ({ accreditationPrograms: state.accreditationPrograms.map(p => p.id === updatedProgram.id ? updatedProgram : p) }));
    },
    deleteProgram: async (programId) => {
        await backendService.deleteProgram(programId);
        set({ accreditationPrograms: backendService.getAccreditationPrograms(), standards: backendService.getStandards() });
    },
    deleteAllProgramsAndStandards: async () => {
        await backendService.deleteAllProgramsAndStandards();
        set({ accreditationPrograms: [], standards: [] });
        useProjectStore.getState().fetchProjects();
    },
    addStandard: async (standardData) => {
        const newStandard = await backendService.addStandard(standardData);
        set(state => ({ standards: [...state.standards, newStandard] }));
    },
    updateStandard: async (updatedStandard) => {
        await backendService.updateStandard(updatedStandard);
        set(state => ({ standards: state.standards.map(s => s.standardId === updatedStandard.standardId ? updatedStandard : s) }));
    },
    deleteStandard: async (standardId) => {
        await backendService.deleteStandard(standardId);
        set({ standards: backendService.getStandards() });
    },
    importStandards: async (jsonText, programId) => {
        const result = await backendService.importStandards(jsonText, programId);
        if (result.success && result.count > 0) {
            set({ standards: backendService.getStandards() });
        }
        return result;
    },
    addCompetency: async (compData) => {
        const newComp = await backendService.addCompetency(compData);
        set(state => ({ competencies: [...state.competencies, newComp] }));
    },
    updateCompetency: async (updatedComp) => {
        await backendService.updateCompetency(updatedComp);
        set(state => ({ competencies: state.competencies.map(c => c.id === updatedComp.id ? updatedComp : c) }));
    },
    deleteCompetency: async (compId) => {
        await backendService.deleteCompetency(compId);
        set({ competencies: backendService.getCompetencies() });
        useUserStore.setState({ users: backendService.getUsers() });
    },
    addRisk: async (riskData) => {
        const newRisk = await backendService.addRisk(riskData);
        set(state => ({ risks: [...state.risks, newRisk] }));
    },
    updateRisk: async (updatedRisk) => {
        await backendService.updateRisk(updatedRisk);
        set(state => ({ risks: state.risks.map(r => r.id === updatedRisk.id ? updatedRisk : r) }));
    },
    deleteRisk: async (riskId) => {
        await backendService.deleteRisk(riskId);
        set({ risks: backendService.getRisks() });
    },
    addIncidentReport: async (reportData) => {
        const newReport = await backendService.addIncidentReport(reportData);
        set(state => ({ incidentReports: [newReport, ...state.incidentReports] }));
    },
    updateIncidentReport: async (report) => {
        await backendService.updateIncidentReport(report);
        set(state => ({ incidentReports: state.incidentReports.map(r => r.id === report.id ? report : r) }));
    },
    deleteIncidentReport: async (reportId) => {
        await backendService.deleteIncidentReport(reportId);
        set(state => ({ incidentReports: state.incidentReports.filter(r => r.id !== reportId) }));
    },
    addCustomEvent: async (eventData) => {
        const newEvent = await backendService.addCustomEvent(eventData);
        set(state => ({ customEvents: [...state.customEvents, newEvent] }));
    },
    updateCustomEvent: async (event) => {
        const updatedEvent = await backendService.updateCustomEvent(event);
        set(state => ({ customEvents: state.customEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e) }));
    },
    deleteCustomEvent: async (eventId) => {
        await backendService.deleteCustomEvent(eventId);
        set({ customEvents: backendService.getCustomEvents() });
    },
    updateAppSettings: async (settings) => {
        const updatedSettings = await backendService.updateAppSettings(settings);
        set({ appSettings: updatedSettings });
    },
    submitQuiz: async (trainingId, answers) => {
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) throw new Error("User not authenticated.");
        const result = await backendService.submitQuiz(trainingId, currentUser.id, answers);
        set({ userTrainingStatuses: backendService.getUserTrainingStatuses() });
        return result;
    },
// FIX: Add implementation for training management functions.
    addTrainingProgram: async (programData) => {
        const newProgram = await backendService.addTrainingProgram(programData);
        set(state => ({ trainingPrograms: [...state.trainingPrograms, newProgram] }));
    },
    updateTrainingProgram: async (updatedProgram) => {
        await backendService.updateTrainingProgram(updatedProgram);
        set(state => ({
            trainingPrograms: state.trainingPrograms.map(p => p.id === updatedProgram.id ? updatedProgram : p)
        }));
    },
    deleteTrainingProgram: async (programId) => {
        await backendService.deleteTrainingProgram(programId);
        set({ trainingPrograms: backendService.getTrainingPrograms() });
        useUserStore.getState().fetchUsers(); // to reflect removed assignments
    },
    assignTraining: async (data) => {
        await backendService.assignTraining(data);
        useUserStore.getState().fetchUsers(); // to reflect new assignments
    },
    deleteAllTrainingsAndRecords: async () => {
        await backendService.deleteAllTrainingsAndRecords();
        set({
            trainingPrograms: [],
            userTrainingStatuses: {},
            certificates: [],
            competencies: backendService.getCompetencies(),
        });
        useUserStore.getState().fetchUsers(); // To get updated users with no assignments
    },
    importAllData: async (jsonData: string) => {
        await backendService.importAllData(jsonData);
        get().fetchAllData(); // Re-fetch all data into the store
        useUserStore.getState().fetchUsers();
        useProjectStore.getState().fetchProjects();
    }
}));