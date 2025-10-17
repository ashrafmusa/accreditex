
import {
    Project,
    User,
    Standard,
    AppDocument,
    Department,
    TrainingProgram,
    AccreditationProgram,
    Competency,
    Risk,
    IncidentReport,
    AuditPlan,
    Audit,
    UserTrainingStatus,
    CertificateData,
    CustomCalendarEvent,
    Notification,
    AppSettings,
} from '../types';

// Import mock data
import initialProjects from '../data/projects.json';
import initialUsers from '../data/users.json';
import initialStandards from '../data/standards.json';
import initialDocuments from '../data/documents.json';
import initialDepartments from '../data/departments.json';
import initialTrainingPrograms from '../data/trainings.json';
import initialAccreditationPrograms from '../data/programs.json';
import initialCompetencies from '../data/competencies.json';
import initialRisks from '../data/risks.json';
import initialSettings from '../data/settings.json';

const LOCAL_STORAGE_PREFIX = 'accreditex_';

class DataService {
    private memoryCache: { [key: string]: any } = {};

    private _get<T>(key: string, defaultValue: T): T {
        if (this.memoryCache[key]) {
            return this.memoryCache[key] as T;
        }
        try {
            const item = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
            const parsedItem = item ? JSON.parse(item) : defaultValue;
            this.memoryCache[key] = parsedItem;
            return parsedItem;
        } catch (error) {
            console.error(`Error reading from localStorage for key: ${key}`, error);
            return defaultValue;
        }
    }

    private _set<T>(key: string, value: T): void {
        try {
            this.memoryCache[key] = value;
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage for key: ${key}`, error);
        }
    }

    public async initialize(): Promise<void> {
        // Pre-warm the cache
        this.getProjects();
        this.getUsers();
        this.getStandards();
        this.getDocuments();
        this.getDepartments();
        this.getTrainingPrograms();
        this.getAccreditationPrograms();
        this.getCompetencies();
        this.getRisks();
        this.getIncidentReports();
        this.getAuditPlans();
        this.getAudits();
        this.getUserTrainingStatuses();
        this.getCertificates();
        this.getCustomEvents();
        this.getNotifications();
        this.getAppSettings();
    }

    // Getters
    getProjects = (): Project[] => this._get('projects', initialProjects as Project[]);
    getUsers = (): User[] => this._get('users', initialUsers as User[]);
    getStandards = (): Standard[] =>
        this._get('standards', initialStandards as Standard[]);
    getDocuments = (): AppDocument[] =>
        this._get('documents', initialDocuments as AppDocument[]);
    getDepartments = (): Department[] =>
        this._get('departments', initialDepartments as Department[]);
    getTrainingPrograms = (): TrainingProgram[] =>
        this._get('trainingPrograms', initialTrainingPrograms as TrainingProgram[]);
    getAccreditationPrograms = (): AccreditationProgram[] =>
        this._get(
            'accreditationPrograms',
            initialAccreditationPrograms as AccreditationProgram[]
        );
    getCompetencies = (): Competency[] =>
        this._get('competencies', initialCompetencies as Competency[]);
    getRisks = (): Risk[] => this._get('risks', initialRisks as Risk[]);
    getIncidentReports = (): IncidentReport[] =>
        this._get('incidentReports', [] as IncidentReport[]);
    getAuditPlans = (): AuditPlan[] => this._get('auditPlans', [] as AuditPlan[]);
    getAudits = (): Audit[] => this._get('audits', [] as Audit[]);
    getUserTrainingStatuses = (): { [userId: string]: UserTrainingStatus } =>
        this._get('userTrainingStatuses', {});
    getCertificates = (): CertificateData[] =>
        this._get('certificates', [] as CertificateData[]);
    getCustomEvents = (): CustomCalendarEvent[] =>
        this._get('customEvents', [] as CustomCalendarEvent[]);
    getNotifications = (): Notification[] =>
        this._get('notifications', [] as Notification[]);
    getAppSettings = (): AppSettings | null =>
        this._get('appSettings', initialSettings as AppSettings);

    // Setters
    setProjects = (data: Project[]) => this._set('projects', data);
    setUsers = (data: User[]) => this._set('users', data);
    setStandards = (data: Standard[]) => this._set('standards', data);
    setDocuments = (data: AppDocument[]) => this._set('documents', data);
    setDepartments = (data: Department[]) => this._set('departments', data);
    setTrainingPrograms = (data: TrainingProgram[]) =>
        this._set('trainingPrograms', data);
    setAccreditationPrograms = (data: AccreditationProgram[]) =>
        this._set('accreditationPrograms', data);
    setCompetencies = (data: Competency[]) => this._set('competencies', data);
    setRisks = (data: Risk[]) => this._set('risks', data);
    setIncidentReports = (data: IncidentReport[]) =>
        this._set('incidentReports', data);
    setAuditPlans = (data: AuditPlan[]) => this._set('auditPlans', data);
    setAudits = (data: Audit[]) => this._set('audits', data);
    setUserTrainingStatuses = (data: { [userId: string]: UserTrainingStatus }) =>
        this._set('userTrainingStatuses', data);
    setCertificates = (data: CertificateData[]) => this._set('certificates', data);
    setCustomEvents = (data: CustomCalendarEvent[]) =>
        this._set('customEvents', data);
    setNotifications = (data: Notification[]) => this._set('notifications', data);
    setAppSettings = (data: AppSettings) => this._set('appSettings', data);

    // Data Management
    exportAllData = (): string => {
        const allData: { [key: string]: any } = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(LOCAL_STORAGE_PREFIX)) {
                allData[key.replace(LOCAL_STORAGE_PREFIX, '')] = this._get(
                    key.replace(LOCAL_STORAGE_PREFIX, ''),
                    null
                );
            }
        });
        return JSON.stringify(allData, null, 2);
    };

    importAllData = async (jsonData: string): Promise<void> => {
        const allData = JSON.parse(jsonData);
        for (const key in allData) {
            this._set(key, allData[key]);
        }
        // Re-initialize to load imported data into the cache
        await this.initialize();
    };

    resetApplication = async (): Promise<void> => {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(LOCAL_STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        this.memoryCache = {};
        // Re-initialize to load default data
        await this.initialize();
    };
}

export const dataService = new DataService();