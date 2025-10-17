import { create } from 'zustand';
import {
    User,
    Department,
    Standard,
    AccreditationProgram,
    TrainingProgram,
    AppDocument,
    CustomCalendarEvent,
    AppSettings,
    Competency,
    Risk,
    IncidentReport,
    AuditPlan,
    Audit,
    UserTrainingStatus,
    CertificateData
} from '../types';
import { dataService } from '../services/data';

interface AppState {
    users: User[];
    departments: Department[];
    standards: Standard[];
    accreditationPrograms: AccreditationProgram[];
    trainingPrograms: TrainingProgram[];
    documents: AppDocument[];
    customEvents: CustomCalendarEvent[];
    appSettings: AppSettings | null;
    competencies: Competency[];
    risks: Risk[];
    incidentReports: IncidentReport[];
    auditPlans: AuditPlan[];
    audits: Audit[];
    userTrainingStatuses: { [userId: string]: UserTrainingStatus };
    certificates: CertificateData[];
    loading: boolean;
    error: string | null;

    fetchAllData: () => Promise<void>;

    addDepartment: (department: Omit<Department, 'id'>) => Promise<void>;
    updateDepartment: (department: Department) => Promise<void>;
    deleteDepartment: (departmentId: string) => Promise<void>;

    addStandard: (standard: Omit<Standard, 'id'>) => Promise<void>;
    updateStandard: (standard: Standard) => Promise<void>;
    deleteStandard: (standardId: string) => Promise<void>;

    addAccreditationProgram: (program: Omit<AccreditationProgram, 'id'>) => Promise<void>;
    updateAccreditationProgram: (program: AccreditationProgram) => Promise<void>;
    deleteAccreditationProgram: (programId: string) => Promise<void>;

    addTrainingProgram: (program: Omit<TrainingProgram, 'id'>) => Promise<void>;
    updateTrainingProgram: (program: TrainingProgram) => Promise<void>;
    deleteTrainingProgram: (programId: string) => Promise<void>;

    addDocument: (doc: Omit<AppDocument, 'id'>) => Promise<void>;
    updateDocument: (doc: AppDocument) => Promise<void>;
    deleteDocument: (docId: string) => Promise<void>;

    addCustomEvent: (event: Omit<CustomCalendarEvent, 'id'>) => Promise<void>;
    updateCustomEvent: (event: CustomCalendarEvent) => Promise<void>;
    deleteCustomEvent: (eventId: string) => Promise<void>;

    addCompetency: (competency: Omit<Competency, 'id'>) => Promise<void>;
    updateCompetency: (competency: Competency) => Promise<void>;
    deleteCompetency: (competencyId: string) => Promise<void>;

    addRisk: (risk: Omit<Risk, 'id'>) => Promise<void>;
    updateRisk: (risk: Risk) => Promise<void>;
    deleteRisk: (riskId: string) => Promise<void>;

    addIncidentReport: (report: Omit<IncidentReport, 'id'>) => Promise<void>;
    updateIncidentReport: (report: IncidentReport) => Promise<void>;
    deleteIncidentReport: (reportId: string) => Promise<void>;

    addAuditPlan: (plan: Omit<AuditPlan, 'id'>) => Promise<void>;
    updateAuditPlan: (plan: AuditPlan) => Promise<void>;
    deleteAuditPlan: (planId: string) => Promise<void>;

    addAudit: (audit: Omit<Audit, 'id'>) => Promise<void>;
    updateAudit: (audit: Audit) => Promise<void>;
    deleteAudit: (auditId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    users: [],
    departments: [],
    standards: [],
    accreditationPrograms: [],
    trainingPrograms: [],
    documents: [],
    customEvents: [],
    appSettings: null,
    competencies: [],
    risks: [],
    incidentReports: [],
    auditPlans: [],
    audits: [],
    userTrainingStatuses: {},
    certificates: [],
    loading: true,
    error: null,

    fetchAllData: async () => {
        try {
            set({ loading: true, error: null });
            await dataService.initialize();
            set({
                users: dataService.getUsers(),
                departments: dataService.getDepartments(),
                standards: dataService.getStandards(),
                accreditationPrograms: dataService.getAccreditationPrograms(),
                trainingPrograms: dataService.getTrainingPrograms(),
                documents: dataService.getDocuments(),
                customEvents: dataService.getCustomEvents(),
                appSettings: dataService.getAppSettings(),
                competencies: dataService.getCompetencies(),
                risks: dataService.getRisks(),
                incidentReports: dataService.getIncidentReports(),
                auditPlans: dataService.getAuditPlans(),
                audits: dataService.getAudits(),
                userTrainingStatuses: dataService.getUserTrainingStatuses(),
                certificates: dataService.getCertificates(),
                loading: false
            });
        } catch (error) {
            set({ error: 'Failed to fetch data', loading: false });
        }
    },

    addDepartment: async (department) => {
        const departments = get().departments;
        const newDepartment = { ...department, id: Date.now().toString() };
        dataService.setDepartments([...departments, newDepartment]);
        set({ departments: [...departments, newDepartment] });
    },
    updateDepartment: async (department) => {
        const departments = get().departments.map(d => d.id === department.id ? department : d);
        dataService.setDepartments(departments);
        set({ departments });
    },
    deleteDepartment: async (departmentId) => {
        const departments = get().departments.filter(d => d.id !== departmentId);
        dataService.setDepartments(departments);
        set({ departments });
    },

    addStandard: async (standard) => {
        const standards = get().standards;
        const newStandard = { ...standard, id: Date.now().toString() };
        dataService.setStandards([...standards, newStandard]);
        set({ standards: [...standards, newStandard] });
    },
    updateStandard: async (standard) => {
        const standards = get().standards.map(s => s.id === standard.id ? standard : s);
        dataService.setStandards(standards);
        set({ standards });
    },
    deleteStandard: async (standardId) => {
        const standards = get().standards.filter(s => s.id !== standardId);
        dataService.setStandards(standards);
        set({ standards });
    },

    addAccreditationProgram: async (program) => {
        const programs = get().accreditationPrograms;
        const newProgram = { ...program, id: Date.now().toString() };
        dataService.setAccreditationPrograms([...programs, newProgram]);
        set({ accreditationPrograms: [...programs, newProgram] });
    },
    updateAccreditationProgram: async (program) => {
        const programs = get().accreditationPrograms.map(p => p.id === program.id ? program : p);
        dataService.setAccreditationPrograms(programs);
        set({ accreditationPrograms: programs });
    },
    deleteAccreditationProgram: async (programId) => {
        const programs = get().accreditationPrograms.filter(p => p.id !== programId);
        dataService.setAccreditationPrograms(programs);
        set({ accreditationPrograms: programs });
    },

    addTrainingProgram: async (program) => {
        const programs = get().trainingPrograms;
        const newProgram = { ...program, id: Date.now().toString() };
        dataService.setTrainingPrograms([...programs, newProgram]);
        set({ trainingPrograms: [...programs, newProgram] });
    },
    updateTrainingProgram: async (program) => {
        const programs = get().trainingPrograms.map(p => p.id === program.id ? program : p);
        dataService.setTrainingPrograms(programs);
        set({ trainingPrograms: programs });
    },
    deleteTrainingProgram: async (programId) => {
        const programs = get().trainingPrograms.filter(p => p.id !== programId);
        dataService.setTrainingPrograms(programs);
        set({ trainingPrograms: programs });
    },

    addDocument: async (doc) => {
        const documents = get().documents;
        const newDoc = { ...doc, id: Date.now().toString() };
        dataService.setDocuments([...documents, newDoc]);
        set({ documents: [...documents, newDoc] });
    },
    updateDocument: async (doc) => {
        const documents = get().documents.map(d => d.id === doc.id ? doc : d);
        dataService.setDocuments(documents);
        set({ documents });
    },
    deleteDocument: async (docId) => {
        const documents = get().documents.filter(d => d.id !== docId);
        dataService.setDocuments(documents);
        set({ documents });
    },

    addCustomEvent: async (event) => {
        const events = get().customEvents;
        const newEvent = { ...event, id: Date.now().toString() };
        dataService.setCustomEvents([...events, newEvent]);
        set({ customEvents: [...events, newEvent] });
    },
    updateCustomEvent: async (event) => {
        const events = get().customEvents.map(e => e.id === event.id ? event : e);
        dataService.setCustomEvents(events);
        set({ customEvents: events });
    },
    deleteCustomEvent: async (eventId) => {
        const events = get().customEvents.filter(e => e.id !== eventId);
        dataService.setCustomEvents(events);
        set({ customEvents: events });
    },

    addCompetency: async (competency) => {
        const competencies = get().competencies;
        const newCompetency = { ...competency, id: Date.now().toString() };
        dataService.setCompetencies([...competencies, newCompetency]);
        set({ competencies: [...competencies, newCompetency] });
    },
    updateCompetency: async (competency) => {
        const competencies = get().competencies.map(c => c.id === competency.id ? competency : c);
        dataService.setCompetencies(competencies);
        set({ competencies });
    },
    deleteCompetency: async (competencyId) => {
        const competencies = get().competencies.filter(c => c.id !== competencyId);
        dataService.setCompetencies(competencies);
        set({ competencies });
    },

    addRisk: async (risk) => {
        const risks = get().risks;
        const newRisk = { ...risk, id: Date.now().toString() };
        dataService.setRisks([...risks, newRisk]);
        set({ risks: [...risks, newRisk] });
    },
    updateRisk: async (risk) => {
        const risks = get().risks.map(r => r.id === risk.id ? risk : r);
        dataService.setRisks(risks);
        set({ risks });
    },
    deleteRisk: async (riskId) => {
        const risks = get().risks.filter(r => r.id !== riskId);
        dataService.setRisks(risks);
        set({ risks });
    },

    addIncidentReport: async (report) => {
        const reports = get().incidentReports;
        const newReport = { ...report, id: Date.now().toString() };
        dataService.setIncidentReports([...reports, newReport]);
        set({ incidentReports: [...reports, newReport] });
    },
    updateIncidentReport: async (report) => {
        const reports = get().incidentReports.map(r => r.id === report.id ? report : r);
        dataService.setIncidentReports(reports);
        set({ incidentReports: reports });
    },
    deleteIncidentReport: async (reportId) => {
        const reports = get().incidentReports.filter(r => r.id !== reportId);
        dataService.setIncidentReports(reports);
        set({ incidentReports: reports });
    },

    addAuditPlan: async (plan) => {
        const plans = get().auditPlans;
        const newPlan = { ...plan, id: Date.now().toString() };
        dataService.setAuditPlans([...plans, newPlan]);
        set({ auditPlans: [...plans, newPlan] });
    },
    updateAuditPlan: async (plan) => {
        const plans = get().auditPlans.map(p => p.id === plan.id ? plan : p);
        dataService.setAuditPlans(plans);
        set({ auditPlans: plans });
    },
    deleteAuditPlan: async (planId) => {
        const plans = get().auditPlans.filter(p => p.id !== planId);
        dataService.setAuditPlans(plans);
        set({ auditPlans: plans });
    },

    addAudit: async (audit) => {
        const audits = get().audits;
        const newAudit = { ...audit, id: Date.now().toString() };
        dataService.setAudits([...audits, newAudit]);
        set({ audits: [...audits, newAudit] });
    },
    updateAudit: async (audit) => {
        const audits = get().audits.map(a => a.id === audit.id ? audit : a);
        dataService.setAudits(audits);
        set({ audits });
    },
    deleteAudit: async (auditId) => {
        const audits = get().audits.filter(a => a.id !== auditId);
        dataService.setAudits(audits);
        set({ audits });
    },
}));