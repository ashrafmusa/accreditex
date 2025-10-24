import { initialDataService } from './initialData';
import { aiService } from './ai';
import { Project, User, AppDocument, Standard, AccreditationProgram, ChecklistItem, Comment, ComplianceStatus, CAPAReport, Risk, IncidentReport, Department, TrainingProgram, UserTrainingStatus, Competency, CustomCalendarEvent, AIQualityBriefing, Language } from '../types';

class BackendService {
    // This class acts as a singleton wrapper around the mock data service.
    // In a real application, this is where you would place your fetch() calls
    // to a live backend API, replacing the calls to initialDataService.

    // AUTH
    authenticateUser = (email: string, pass: string): User | undefined => initialDataService.findUserByCredentials(email, pass);
    
    // APP SETTINGS
    getAppSettings = () => initialDataService.getAppSettings();
    updateAppSettings = (settings: any) => initialDataService.updateAppSettings(settings);

    // USERS
    getUsers = () => initialDataService.getUsers();
    updateUser = (user: User) => initialDataService.updateUser(user);
    addUser = (user: Omit<User, 'id'>) => initialDataService.addUser(user);
    deleteUser = (userId: string) => initialDataService.deleteUser(userId);

    // PROJECTS
    getProjects = () => initialDataService.getProjects();
    updateProject = (project: Project) => initialDataService.updateProject(project);
    addProject = (project: Omit<Project, 'id' | 'progress' | 'checklist' | 'activityLog' | 'mockSurveys' | 'capaReports' | 'designControls'>) => initialDataService.addProject(project);
    deleteProject = (projectId: string) => initialDataService.deleteProject(projectId);
    finalizeProject = (projectId: string, userName: string) => initialDataService.finalizeProject(projectId, userName);
    updateChecklistItem = (projectId: string, itemId: string, updates: Partial<ChecklistItem>) => initialDataService.updateChecklistItem(projectId, itemId, updates);
    addCommentToChecklistItem = (projectId: string, itemId: string, commentText: string, user: User) => initialDataService.addCommentToChecklistItem(projectId, itemId, commentText, user);
    createEvidenceAndLink = (projectId: string, checklistItemId: string, fileData: any) => initialDataService.createEvidenceAndLink(projectId, checklistItemId, fileData);
    updateCapaReport = (projectId: string, capa: CAPAReport) => initialDataService.updateCapaReport(projectId, capa);

    // DOCUMENTS
    getDocuments = () => initialDataService.getDocuments();
    addDocument = (doc: Omit<AppDocument, 'id' | 'versionHistory'>) => initialDataService.addDocument(doc);
    updateDocument = (doc: AppDocument) => initialDataService.updateDocument(doc);
    deleteDocument = (docId: string) => initialDataService.deleteDocument(docId);
    approveDocument = (docId: string, userName: string) => initialDataService.approveDocument(docId, userName);
    addProcessMap = (data: { name: { en: string; ar: string } }) => initialDataService.addProcessMap(data);

    // STANDARDS & PROGRAMS
    getStandards = () => initialDataService.getStandards();
    getPrograms = () => initialDataService.getPrograms();
    addProgram = (program: Omit<AccreditationProgram, 'id'>) => initialDataService.addProgram(program);
    updateProgram = (program: AccreditationProgram) => initialDataService.updateProgram(program);
    deleteProgram = (programId: string) => initialDataService.deleteProgram(programId);
    addStandard = (standard: Omit<Standard, ''>) => initialDataService.addStandard(standard);
    updateStandard = (standard: Standard) => initialDataService.updateStandard(standard);
    deleteStandard = (programId: string, standardId: string) => initialDataService.deleteStandard(programId, standardId);
    importStandards = (programId: string, standards: Standard[]) => initialDataService.importStandards(programId, standards);

    // DEPARTMENTS
    getDepartments = () => initialDataService.getDepartments();
    addDepartment = (dept: Omit<Department, 'id'>) => initialDataService.addDepartment(dept);
    updateDepartment = (dept: Department) => initialDataService.updateDepartment(dept);
    deleteDepartment = (deptId: string) => initialDataService.deleteDepartment(deptId);

    // TRAINING
    getTrainings = () => initialDataService.getTrainings();
    addTraining = (program: Omit<TrainingProgram, 'id'>) => initialDataService.addTraining(program);
    updateTraining = (program: TrainingProgram) => initialDataService.updateTraining(program);
    deleteTraining = (programId: string) => initialDataService.deleteTraining(programId);
    assignTraining = (data: { trainingId: string; userIds: string[]; departmentIds: string[]; dueDate?: string }) => initialDataService.assignTraining(data);

    // RISKS, INCIDENTS, CAPAs
    getRisks = () => initialDataService.getRisks();
    addRisk = (risk: Omit<Risk, 'id'>) => initialDataService.addRisk(risk);
    updateRisk = (risk: Risk) => initialDataService.updateRisk(risk);
    deleteRisk = (riskId: string) => initialDataService.deleteRisk(riskId);
    getIncidents = () => initialDataService.getIncidents();
    addIncident = (incident: Omit<IncidentReport, 'id'>) => initialDataService.addIncident(incident);
    updateIncident = (incident: IncidentReport) => initialDataService.updateIncident(incident);
    deleteIncident = (incidentId: string) => initialDataService.deleteIncident(incidentId);

    // COMPETENCIES
    getCompetencies = () => initialDataService.getCompetencies();
    addCompetency = (comp: Omit<Competency, 'id'>) => initialDataService.addCompetency(comp);
    updateCompetency = (comp: Competency) => initialDataService.updateCompetency(comp);
    deleteCompetency = (compId: string) => initialDataService.deleteCompetency(compId);

    // CALENDAR
    getCustomEvents = () => initialDataService.getCustomEvents();
    addCustomEvent = (event: Omit<CustomCalendarEvent, 'id'|'type'>) => initialDataService.addCustomEvent(event);
    updateCustomEvent = (event: CustomCalendarEvent) => initialDataService.updateCustomEvent(event);
    deleteCustomEvent = (eventId: string) => initialDataService.deleteCustomEvent(eventId);

    // AI methods
    generateQualityBriefing = (projects: Project[], risks: Risk[], users: User[], departments: Department[], competencies: Competency[]) => 
        aiService.generateQualityBriefing(projects, risks, users, departments, competencies);

    suggestActionPlan = (standardDescription: string): Promise<string> => aiService.suggestActionPlan(standardDescription);
    suggestRootCause = (standardDescription: string, notes: string): Promise<string> => aiService.suggestRootCause(standardDescription, notes);
    generatePolicyFromStandard = (standard: Standard, lang: Language): Promise<string> => aiService.generatePolicyFromStandard(standard, lang);
}

export const backendService = new BackendService();
