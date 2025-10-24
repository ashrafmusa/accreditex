
// This service simulates a backend by loading data from JSON files into memory.
// All "write" operations modify this in-memory data.
// The data is reset on every page refresh.

import projectsData from '../data/projects.json';
import standardsData from '../data/standards.json';
import usersData from '../data/users.json';
import documentsData from '../data/documents.json';
import departmentsData from '../data/departments.json';
import trainingsData from '../data/trainings.json';
import programsData from '../data/programs.json';
import settingsData from '../data/settings.json';
import competenciesData from '../data/competencies.json';
import risksData from '../data/risks.json';
import { 
    Project, User, Standard, AppDocument, Department, TrainingProgram, 
    AccreditationProgram, AppSettings, Competency, Risk, IncidentReport, 
    CustomCalendarEvent, UserTrainingStatus, ChecklistItem, CertificateData, 
    Comment, LocalizedString, ProjectStatus, UserRole, ComplianceStatus, MockSurvey
} from '../types';

class InitialDataService {
    private _projects: Project[] = [];
    private _standards: Standard[] = [];
    private _users: User[] = [];
    private _documents: AppDocument[] = [];
    private _departments: Department[] = [];
    private _trainings: TrainingProgram[] = [];
    private _programs: AccreditationProgram[] = [];
    private _settings: AppSettings = settingsData as AppSettings;
    private _competencies: Competency[] = [];
    private _risks: Risk[] = [];
    private _incidents: IncidentReport[] = [];
    private _customEvents: CustomCalendarEvent[] = [];
    private _notifications: any[] = []; // Simplified for mock
    private _userTrainingStatuses: { [userId: string]: UserTrainingStatus } = {};
    private _certificates: CertificateData[] = [];

    constructor() {
        this._projects = JSON.parse(JSON.stringify(projectsData));
        this._standards = JSON.parse(JSON.stringify(standardsData));
        this._users = JSON.parse(JSON.stringify(usersData));
        this._documents = JSON.parse(JSON.stringify(documentsData));
        this._departments = JSON.parse(JSON.stringify(departmentsData));
        this._trainings = JSON.parse(JSON.stringify(trainingsData));
        this._programs = JSON.parse(JSON.stringify(programsData));
        this._settings = JSON.parse(JSON.stringify(settingsData));
        this._competencies = JSON.parse(JSON.stringify(competenciesData));
        this._risks = JSON.parse(JSON.stringify(risksData));
        this._initializeTrainingStatuses();
    }

    private _initializeTrainingStatuses() {
        this._users.forEach(user => {
            const userStatus: UserTrainingStatus = {};
            user.trainingAssignments?.forEach(assignment => {
                userStatus[assignment.trainingId] = { status: 'Not Started' };
            });
            this._userTrainingStatuses[user.id] = userStatus;
        });
    }

    loadInitialData() {
        return {
            projects: this._projects,
            standards: this._standards,
            users: this._users,
            documents: this._documents,
            departments: this._departments,
            trainings: this._trainings,
            programs: this._programs,
            appSettings: this._settings,
            competencies: this._competencies,
            risks: this._risks,
            incidents: this._incidents,
            customEvents: this._customEvents,
            notifications: this._notifications,
            userTrainingStatuses: this._userTrainingStatuses,
            certificates: this._certificates,
        };
    }

    findUserByCredentials(email: string, pass: string): User | undefined {
        if (pass !== 'password123') return undefined;
        return this._users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    // --- Projects ---
    getProjects = () => this._projects;
    updateProject = (project: Project) => { this._projects = this._projects.map(p => p.id === project.id ? project : p); return project; };
    addProject = (projectData: Omit<Project, 'id' | 'progress' | 'checklist' | 'activityLog' | 'mockSurveys' | 'capaReports' | 'designControls'>): Project => {
        const programStandards = this._standards.filter(s => s.programId === projectData.programId);
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            ...projectData,
            progress: 0,
            activityLog: [{ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), user: projectData.projectLead.name, action: { en: 'Project Created', ar: 'تم إنشاء المشروع' } }],
            mockSurveys: [],
            capaReports: [],
            designControls: [],
            checklist: programStandards.flatMap(s => 
                (s.subStandards && s.subStandards.length > 0)
                ? s.subStandards.map(sub => ({
                    id: `cl-${Date.now()}-${sub.id}`,
                    item: sub.description,
                    standardId: sub.id,
                    status: ComplianceStatus.NonCompliant,
                    assignedTo: null,
                    dueDate: null,
                    actionPlan: '',
                    notes: '',
                    evidenceFiles: [],
                    comments: [],
                }))
                : [{
                    id: `cl-${Date.now()}-${s.standardId}`,
                    item: s.description,
                    standardId: s.standardId,
                    status: ComplianceStatus.NonCompliant,
                    assignedTo: null,
                    dueDate: null,
                    actionPlan: '',
                    notes: '',
                    evidenceFiles: [],
                    comments: [],
                }]
            ),
        };
        this._projects.push(newProject);
        return newProject;
    };
    deleteProject = (projectId: string) => { this._projects = this._projects.filter(p => p.id !== projectId); };
    finalizeProject = (projectId: string, userName: string) => {
        const project = this._projects.find(p => p.id === projectId);
        if(!project) throw new Error("Project not found");
        project.status = ProjectStatus.Finalized;
        project.finalizedBy = userName;
        project.finalizationDate = new Date().toISOString();
        return { status: project.status, finalizedBy: project.finalizedBy, finalizationDate: project.finalizationDate };
    };
    updateChecklistItem = (projectId: string, itemId: string, updates: Partial<ChecklistItem>) => { /* handled in store for mock */ };
    addCommentToChecklistItem = (projectId: string, itemId: string, commentText: string, user: User): Comment => {
        return {
            id: `comment-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString(),
            text: commentText,
        };
    };
    createEvidenceAndLink = (projectId: string, checklistItemId: string, fileData: any) => {
        const newDocument: Omit<AppDocument, 'id' | 'versionHistory'> = {
            name: fileData.name,
            type: 'Evidence',
            isControlled: false,
            status: 'Approved',
            content: { en: `<p>Uploaded file: ${fileData.uploadedFile.name}</p>`, ar: `<p>الملف المرفوع: ${fileData.uploadedFile.name}</p>` },
            currentVersion: 1,
            uploadedAt: new Date().toISOString(),
        };
        const addedDoc = this.addDocument(newDocument);
        
        const project = this._projects.find(p => p.id === projectId)!;
        const checklistItem = project.checklist.find(c => c.id === checklistItemId)!;
        checklistItem.evidenceFiles.push(addedDoc.id);

        return { newDocument: addedDoc, updatedProject: project };
    }
    updateCapaReport = (projectId: string, capa: any) => { /* handled in store */ }

    addMockSurvey = (projectId: string, surveyorId: string): Project => {
        const project = this._projects.find(p => p.id === projectId);
        if (!project) throw new Error("Project not found");
        const newSurvey: MockSurvey = {
            id: `survey-${Date.now()}`,
            date: new Date().toISOString(),
            surveyorId: surveyorId,
            status: 'In Progress',
            results: [],
        };
        project.mockSurveys.push(newSurvey);
        return project;
    };

    updateMockSurvey = (projectId: string, surveyId: string, updates: Partial<MockSurvey>): Project => {
        const project = this._projects.find(p => p.id === projectId);
        if (!project) throw new Error("Project not found");
        const surveyIndex = project.mockSurveys.findIndex(s => s.id === surveyId);
        if (surveyIndex === -1) throw new Error("Survey not found");
        project.mockSurveys[surveyIndex] = { ...project.mockSurveys[surveyIndex], ...updates };
        return project;
    };

    // --- Users ---
    getUsers = () => this._users;
    addUser = (user: Omit<User, 'id'>): User => {
        const newUser: User = { id: `user-${Date.now()}`, competencies: [], trainingAssignments: [], ...user };
        this._users.push(newUser);
        return newUser;
    };
    updateUser = (user: User) => { this._users = this._users.map(u => u.id === user.id ? user : u); return user; };
    deleteUser = (userId: string) => { this._users = this._users.filter(u => u.id !== userId); };

    // --- Documents ---
    getDocuments = () => this._documents;
    addDocument = (doc: Omit<AppDocument, 'id' | 'versionHistory'>): AppDocument => {
        const newDoc: AppDocument = {
            id: `doc-${Date.now()}`,
            versionHistory: [],
            ...doc
        };
        this._documents.push(newDoc);
        return newDoc;
    };
    updateDocument = (doc: AppDocument) => { this._documents = this._documents.map(d => d.id === doc.id ? doc : d); return doc; };
    deleteDocument = (docId: string) => { this._documents = this._documents.filter(d => d.id !== docId); };
    approveDocument = (docId: string, userName: string): AppDocument => {
        const doc = this._documents.find(d => d.id === docId);
        if(!doc) throw new Error("Document not found");
        doc.status = 'Approved';
        doc.approvedBy = userName;
        doc.approvalDate = new Date().toISOString();
        return doc;
    };
    addProcessMap = (data: { name: LocalizedString }): AppDocument => {
        const newDoc: AppDocument = {
            id: `procmap-${Date.now()}`,
            name: data.name,
            type: 'Process Map',
            isControlled: true,
            status: 'Draft',
            content: {en: '', ar: ''},
            processMapContent: { nodes: [], edges: [] },
            currentVersion: 1,
            versionHistory: [],
            uploadedAt: new Date().toISOString(),
        };
        this._documents.push(newDoc);
        return newDoc;
    }

    // --- Standards & Programs ---
    getStandards = () => this._standards;
    getPrograms = () => this._programs;
    addProgram = (program: Omit<AccreditationProgram, 'id'>) => {
        const newProgram = { id: `prog-${Date.now()}`, ...program };
        this._programs.push(newProgram);
        return newProgram;
    };
    updateProgram = (program: AccreditationProgram) => { this._programs = this._programs.map(p => p.id === program.id ? program : p); return program; };
    deleteProgram = (programId: string) => { this._programs = this._programs.filter(p => p.id !== programId); };
    addStandard = (standard: Standard) => { this._standards.push(standard); return standard; };
    updateStandard = (standard: Standard) => { this._standards = this._standards.map(s => s.programId === standard.programId && s.standardId === standard.standardId ? standard : s); return standard; };
    deleteStandard = (programId: string, standardId: string) => { this._standards = this._standards.filter(s => s.programId !== programId || s.standardId !== standardId); };
    importStandards = (programId: string, standards: Standard[]) => {
        const newStandards = standards.map(s => ({...s, programId}));
        this._standards.push(...newStandards);
        return newStandards;
    }
    
    // --- Departments, Competencies, Trainings ---
    getDepartments = () => this._departments;
    addDepartment = (dept: Omit<Department, 'id'>) => { const newDept = {id: `dept-${Date.now()}`, ...dept}; this._departments.push(newDept); return newDept; };
    updateDepartment = (dept: Department) => { this._departments = this._departments.map(d => d.id === dept.id ? dept : d); return dept; };
    deleteDepartment = (deptId: string) => { this._departments = this._departments.filter(d => d.id !== deptId); };

    getCompetencies = () => this._competencies;
    addCompetency = (comp: Omit<Competency, 'id'>) => { const newComp = {id: `comp-${Date.now()}`, ...comp}; this._competencies.push(newComp); return newComp; };
    updateCompetency = (comp: Competency) => { this._competencies = this._competencies.map(c => c.id === comp.id ? comp : c); return comp; };
    deleteCompetency = (compId: string) => { this._competencies = this._competencies.filter(c => c.id !== compId); };

    getTrainings = () => this._trainings;
    addTraining = (program: Omit<TrainingProgram, 'id'>) => { const newProg = {id: `train-${Date.now()}`, ...program}; this._trainings.push(newProg); return newProg; };
    updateTraining = (program: TrainingProgram) => { this._trainings = this._trainings.map(p => p.id === program.id ? program : p); return program; };
    deleteTraining = (programId: string) => { this._trainings = this._trainings.filter(p => p.id !== programId); };
    assignTraining = (data: { trainingId: string; userIds: string[]; departmentIds: string[]; dueDate?: string }) => {
        const userIdsToUpdate = new Set(data.userIds);
        this._users.forEach(u => {
            if(data.departmentIds.includes(u.departmentId!)) {
                userIdsToUpdate.add(u.id);
            }
        });
        const updatedUsers: User[] = [];
        this._users.forEach(u => {
            if(userIdsToUpdate.has(u.id)) {
                const newAssignment = { trainingId: data.trainingId, assignedDate: new Date().toISOString(), dueDate: data.dueDate };
                if (!u.trainingAssignments.find(a => a.trainingId === data.trainingId)) {
                    u.trainingAssignments.push(newAssignment);
                    updatedUsers.push(u);
                }
            }
        });
        return updatedUsers;
    };
    
    // --- Risks, Incidents, Calendar ---
    getRisks = () => this._risks;
    addRisk = (risk: Omit<Risk, 'id'>) => { const newRisk = {id: `risk-${Date.now()}`, ...risk}; this._risks.push(newRisk); return newRisk; };
    updateRisk = (risk: Risk) => { this._risks = this._risks.map(r => r.id === risk.id ? risk : r); return risk; };
    deleteRisk = (riskId: string) => { this._risks = this._risks.filter(r => r.id !== riskId); };

    getIncidents = () => this._incidents;
    addIncident = (incident: Omit<IncidentReport, 'id'>) => { const newIncident = {id: `inc-${Date.now()}`, ...incident}; this._incidents.push(newIncident); return newIncident; };
    updateIncident = (incident: IncidentReport) => { this._incidents = this._incidents.map(i => i.id === incident.id ? incident : i); return incident; };
    deleteIncident = (incidentId: string) => { this._incidents = this._incidents.filter(i => i.id !== incidentId); };
    
    getCustomEvents = () => this._customEvents;
    addCustomEvent = (event: Omit<CustomCalendarEvent, 'id' | 'type'>) => { const newEvent = {id: `event-${Date.now()}`, type: 'Custom' as const, ...event}; this._customEvents.push(newEvent); return newEvent; };
    updateCustomEvent = (event: CustomCalendarEvent) => { this._customEvents = this._customEvents.map(e => e.id === event.id ? event : e); return event; };
    deleteCustomEvent = (eventId: string) => { this._customEvents = this._customEvents.filter(e => e.id !== eventId); };
    
    // --- App Settings ---
    getAppSettings = () => this._settings;
    updateAppSettings = (settings: AppSettings) => { this._settings = settings; };

    // --- Training Status ---
    updateUserTrainingStatus = (userId: string, trainingId: string, status: 'Not Started' | 'In Progress' | 'Completed', score?: number) => {
        if (!this._userTrainingStatuses[userId]) this._userTrainingStatuses[userId] = {};
        this._userTrainingStatuses[userId][trainingId] = {
            ...this._userTrainingStatuses[userId][trainingId],
            status,
            score,
            completionDate: status === 'Completed' ? new Date().toISOString() : undefined
        };
        return this._userTrainingStatuses[userId];
    };

    generateCertificate = (userId: string, trainingId: string, score: number) => {
        const user = this._users.find(u => u.id === userId);
        const training = this._trainings.find(t => t.id === trainingId);
        if (!user || !training) throw new Error("User or training not found");

        const newCertificate: CertificateData = {
            id: `cert-${Date.now()}`,
            userId,
            userName: user.name,
            trainingId,
            trainingTitle: training.title,
            completionDate: new Date().toISOString(),
            score,
        };
        this._certificates.push(newCertificate);
        
        const updatedStatus = this.updateUserTrainingStatus(userId, trainingId, 'Completed', score);
        updatedStatus[trainingId].certificateId = newCertificate.id;

        return { updatedStatus, newCertificate };
    };
}

export const initialDataService = new InitialDataService();
