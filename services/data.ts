import {
  Project, User, Standard, AppDocument, Department, TrainingProgram,
  CertificateData, AccreditationProgram, MockSurvey, CustomCalendarEvent, Notification,
  AppSettings, Competency, Risk, IncidentReport, AuditPlan, Audit, UserTrainingStatus, UserRole
} from '../types';

// Importing seed data from JSON files
import initialProjects from '../data/projects.json';
import initialUsers from '../data/users.json';
import initialStandards from '../data/standards.json';
import initialDocuments from '../data/documents.json';
import initialDepartments from '../data/departments.json';
import initialPrograms from '../data/programs.json';
import initialTrainings from '../data/trainings.json';
import initialSettings from '../data/settings.json';
import initialCompetencies from '../data/competencies.json';
import initialRisks from '../data/risks.json';

const DB_KEY = 'accreditex_db';
const SEED_FLAG_KEY = 'accreditex_db_seeded_v2';

interface AppDatabase {
  projects: Project[];
  users: User[];
  standards: Standard[];
  documents: AppDocument[];
  departments: Department[];
  accreditationPrograms: AccreditationProgram[];
  trainingPrograms: TrainingProgram[];
  certificates: CertificateData[];
  customEvents: CustomCalendarEvent[];
  notifications: Notification[];
  appSettings: AppSettings;
  competencies: Competency[];
  risks: Risk[];
  incidentReports: IncidentReport[];
  auditPlans: AuditPlan[];
  audits: Audit[];
  userTrainingStatuses: { [userId: string]: UserTrainingStatus };
}

const defaultAppSettings: AppSettings = {
  appName: 'AccreditEx',
  primaryColor: '#4f46e5',
  defaultLanguage: 'en',
  logoUrl: '',
  defaultUserRole: initialSettings.defaultUserRole as UserRole,
  passwordPolicy: initialSettings.passwordPolicy,
  globeSettings: {
    baseColor: '#1e293b',
    markerColor: '#4f46e5',
    glowColor: '#6366f1',
    scale: 2.5,
    darkness: 0.9,
    lightIntensity: 6,
    rotationSpeed: 0.02,
  },
};

class DataService {
  private db: AppDatabase = this.loadDatabase();

  private loadDatabase(): AppDatabase {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : this.getInitialState();
  }

  private getInitialState(): AppDatabase {
    return {
      projects: [],
      users: [],
      standards: [],
      documents: [],
      departments: [],
      accreditationPrograms: [],
      trainingPrograms: [],
      certificates: [],
      customEvents: [],
      notifications: [],
      appSettings: defaultAppSettings,
      competencies: [],
      risks: [],
      incidentReports: [],
      auditPlans: [],
      audits: [],
      userTrainingStatuses: {},
    };
  }

  private saveDatabase() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.db));
  }

  public async initialize(): Promise<void> {
    const isSeeded = localStorage.getItem(SEED_FLAG_KEY);
    if (!isSeeded) {
      console.log("Seeding database from JSON files...");
      this.db = {
        projects: initialProjects as Project[],
        users: initialUsers.map(u => ({ ...u, password: 'password123' })) as User[],
        standards: initialStandards as Standard[],
        documents: initialDocuments as AppDocument[],
        departments: initialDepartments as Department[],
        accreditationPrograms: initialPrograms as AccreditationProgram[],
        trainingPrograms: initialTrainings as TrainingProgram[],
        certificates: [],
        customEvents: [],
        notifications: [],
        appSettings: defaultAppSettings,
        competencies: initialCompetencies as Competency[],
        risks: initialRisks as Risk[],
        incidentReports: [],
        auditPlans: [],
        audits: [],
        userTrainingStatuses: {},
      };
      this.saveDatabase();
      localStorage.setItem(SEED_FLAG_KEY, 'true');
    }
  }

  // Generic getters and setters for simplicity
  getProjects = (): Project[] => this.db.projects;
  setProjects = (data: Project[]): Promise<void> => { this.db.projects = data; this.saveDatabase(); return Promise.resolve(); };
  getUsers = (): User[] => this.db.users;
  setUsers = (data: User[]): Promise<void> => { this.db.users = data; this.saveDatabase(); return Promise.resolve(); };
  getStandards = (): Standard[] => this.db.standards;
  setStandards = (data: Standard[]): Promise<void> => { this.db.standards = data; this.saveDatabase(); return Promise.resolve(); };
  getDocuments = (): AppDocument[] => this.db.documents;
  setDocuments = (data: AppDocument[]): Promise<void> => { this.db.documents = data; this.saveDatabase(); return Promise.resolve(); };
  getDepartments = (): Department[] => this.db.departments;
  setDepartments = (data: Department[]): Promise<void> => { this.db.departments = data; this.saveDatabase(); return Promise.resolve(); };
  getAccreditationPrograms = (): AccreditationProgram[] => this.db.accreditationPrograms;
  setAccreditationPrograms = (data: AccreditationProgram[]): Promise<void> => { this.db.accreditationPrograms = data; this.saveDatabase(); return Promise.resolve(); };
  getTrainingPrograms = (): TrainingProgram[] => this.db.trainingPrograms;
  setTrainingPrograms = (data: TrainingProgram[]): Promise<void> => { this.db.trainingPrograms = data; this.saveDatabase(); return Promise.resolve(); };
  getCertificates = (): CertificateData[] => this.db.certificates;
  setCertificates = (data: CertificateData[]): Promise<void> => { this.db.certificates = data; this.saveDatabase(); return Promise.resolve(); };
  getCustomEvents = (): CustomCalendarEvent[] => this.db.customEvents;
  setCustomEvents = (data: CustomCalendarEvent[]): Promise<void> => { this.db.customEvents = data; this.saveDatabase(); return Promise.resolve(); };
  getNotifications = (): Notification[] => this.db.notifications;
  setNotifications = (data: Notification[]): Promise<void> => { this.db.notifications = data; this.saveDatabase(); return Promise.resolve(); };
  getAppSettings = (): AppSettings => this.db.appSettings;
  setAppSettings = (data: AppSettings): Promise<void> => { this.db.appSettings = data; this.saveDatabase(); return Promise.resolve(); };
  getCompetencies = (): Competency[] => this.db.competencies;
  setCompetencies = (data: Competency[]): Promise<void> => { this.db.competencies = data; this.saveDatabase(); return Promise.resolve(); };
  getRisks = (): Risk[] => this.db.risks;
  setRisks = (data: Risk[]): Promise<void> => { this.db.risks = data; this.saveDatabase(); return Promise.resolve(); };
  getIncidentReports = (): IncidentReport[] => this.db.incidentReports;
  setIncidentReports = (data: IncidentReport[]): Promise<void> => { this.db.incidentReports = data; this.saveDatabase(); return Promise.resolve(); };
  getAuditPlans = (): AuditPlan[] => this.db.auditPlans;
  setAuditPlans = (data: AuditPlan[]): Promise<void> => { this.db.auditPlans = data; this.saveDatabase(); return Promise.resolve(); };
  getAudits = (): Audit[] => this.db.audits;
  setAudits = (data: Audit[]): Promise<void> => { this.db.audits = data; this.saveDatabase(); return Promise.resolve(); };
  getUserTrainingStatuses = (): { [userId: string]: UserTrainingStatus } => this.db.userTrainingStatuses;
  setUserTrainingStatuses = (data: { [userId: string]: UserTrainingStatus }): Promise<void> => { this.db.userTrainingStatuses = data; this.saveDatabase(); return Promise.resolve(); };

  // Data Management
  exportAllData = (): string => {
    return JSON.stringify(this.db, null, 2);
  }

  importAllData = async (jsonData: string): Promise<void> => {
    try {
      const importedDb = JSON.parse(jsonData) as AppDatabase;
      // Basic validation
      if (importedDb.projects && importedDb.users && importedDb.appSettings) {
        this.db = importedDb;
        this.saveDatabase();
        localStorage.setItem(SEED_FLAG_KEY, 'true'); // Mark as "seeded" to prevent overwrite on reload
      } else {
        throw new Error("Invalid database file format.");
      }
    } catch (error) {
      console.error("Failed to parse or validate imported data:", error);
      throw error;
    }
  }

  resetApplication = async (): Promise<void> => {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SEED_FLAG_KEY);
    this.db = this.getInitialState();
    await this.initialize();
  }
}

export const dataService = new DataService();