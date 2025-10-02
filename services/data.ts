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
import smcsRaw from '../SMCS SATool (2).json';

const DB_KEY = 'accreditex_db';
const SEED_FLAG_KEY = 'accreditex_db_seeded_v3';

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
  smcsValidationReport: any | null;
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

// Convert the SMCS SATool JSON into app Standards for a single accreditation program.
function convertSMCS(smcs: any, programId: string): Standard[] {
  const standardsMap = new Map<string, Standard>();
  let currentChapter = '';
  const getText = (row: any) => row.Column2 || row["Column2"] || '';
  const getIdCell = (row: any) => (row[" Quality Assurance Center "] || '').trim();
  const normalizeId = (id: string) => id.replace(/^SMCS(\d+)/, 'SMCS.$1').replace(/^SMCS\s*(\d+)/, 'SMCS.$1').replace(/\s+$/, '');

  for (const [sectionKey, rows] of Object.entries(smcs)) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows as any[]) {
      const idCell = getIdCell(row);
      if (!idCell) {
        if (getText(row)) {
          currentChapter = getText(row);
        }
        continue;
      }
      const id = normalizeId(idCell);
      const stdMatch = id.match(/^SMCS\.(\d+)\s*$/);
      const epMatch = id.match(/^SMCS\.(\d+)\.([a-z])$/i);
      if (stdMatch) {
        const stdId = `SMCS.${stdMatch[1]}`;
        const description = getText(row) || '';
        standardsMap.set(stdId, {
          programId,
          standardId: stdId,
          description,
          section: currentChapter || 'SMCS',
          subStandards: []
        });
      } else if (epMatch) {
        const stdId = `SMCS.${epMatch[1]}`;
        const subId = `${stdId}.${epMatch[2]}`;
        const parent = standardsMap.get(stdId);
        if (parent) {
          parent.subStandards = parent.subStandards || [];
          parent.subStandards.push({ id: subId, description: getText(row) || '' });
        } else {
          standardsMap.set(stdId, {
            programId,
            standardId: stdId,
            description: '',
            section: currentChapter || 'SMCS',
            subStandards: [{ id: subId, description: getText(row) || '' }]
          });
        }
      }
    }
  }
  return Array.from(standardsMap.values());
}

// Convert and validate SMCS SATool JSON to standards and produce a validation report
function convertAndValidateSMCS(smcs: any, programId: string): { standards: Standard[]; report: any } {
  const standardsMap = new Map<string, Standard>();
  const totalsMap = new Map<string, number>();
  let currentChapter = '';
  const getText = (row: any) => row.Column2 || row["Column2"] || '';
  const getIdCell = (row: any) => (row[" Quality Assurance Center "] || '').trim();
  const normalizeId = (id: string) => id.replace(/^SMCS(\d+)/, 'SMCS.$1').replace(/^SMCS\s*(\d+)/, 'SMCS.$1').replace(/\s+$/, '');

  for (const [, rows] of Object.entries(smcs)) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows as any[]) {
      const idCell = getIdCell(row);
      if (!idCell) {
        if (getText(row)) currentChapter = getText(row);
        continue;
      }
      const id = normalizeId(idCell);
      const stdMatch = id.match(/^SMCS\.(\d+)\s*$/);
      const epMatch = id.match(/^SMCS\.(\d+)\.([a-z])$/i);
      if (stdMatch) {
        const stdId = `SMCS.${stdMatch[1]}`;
        const description = getText(row) || '';
        const c3 = (row.Column3 || row["Column3"] || '') as string;
        const m = /Total\s*Measures\s*:\s*(\d+)/i.exec(c3);
        if (m) totalsMap.set(stdId, parseInt(m[1], 10));
        standardsMap.set(stdId, {
          programId,
          standardId: stdId,
          description,
          section: currentChapter || 'SMCS',
          subStandards: []
        });
      } else if (epMatch) {
        const stdId = `SMCS.${epMatch[1]}`;
        const subId = `${stdId}.${epMatch[2]}`;
        const parent = standardsMap.get(stdId);
        if (parent) {
          parent.subStandards = parent.subStandards || [];
          parent.subStandards.push({ id: subId, description: getText(row) || '' });
        } else {
          standardsMap.set(stdId, {
            programId,
            standardId: stdId,
            description: '',
            section: currentChapter || 'SMCS',
            subStandards: [{ id: subId, description: getText(row) || '' }]
          });
        }
      }
    }
  }

  const standards = Array.from(standardsMap.values());

  const mismatches: { standardId: string; section?: string; parsedTotal?: number; epCount: number }[] = [];
  const duplicateDetails: { standardId: string; subId: string; description: string }[] = [];

  for (const std of standards) {
    const epCount = (std.subStandards || []).length;
    const parsedTotal = totalsMap.get(std.standardId);
    if (typeof parsedTotal === 'number' && parsedTotal !== epCount) {
      mismatches.push({ standardId: std.standardId, section: std.section, parsedTotal, epCount });
    }
    const seen = new Map<string, string[]>();
    for (const ep of std.subStandards || []) {
      const key = (ep.description || '').trim().toLowerCase();
      if (!key) continue;
      const arr = seen.get(key) || [];
      arr.push(ep.id);
      seen.set(key, arr);
    }
    for (const [descKey, ids] of seen.entries()) {
      if (ids.length > 1) {
        ids.forEach(id => duplicateDetails.push({ standardId: std.standardId, subId: id, description: descKey }));
      }
    }
  }

  const csvLines = [
    'standardId,section,parsedTotal,epCount,duplicateDescriptionsCount'
  ];
  for (const std of standards) {
    const epCount = (std.subStandards || []).length;
    const parsedTotal = totalsMap.get(std.standardId) ?? '';
    const dupCount = new Set(duplicateDetails.filter(d => d.standardId === std.standardId).map(d => d.description)).size;
    const sec = (std.section || '').replace(/[,\n]/g, ' ');
    csvLines.push(`${std.standardId},${sec},${parsedTotal},${epCount},${dupCount}`);
  }

  const report = {
    createdAt: new Date().toISOString(),
    summary: {
      totalStandards: standards.length,
      mismatchedCount: mismatches.length,
      duplicatesCount: duplicateDetails.length,
    },
    mismatches,
    duplicates: duplicateDetails,
    csv: csvLines.join('\n')
  };

  return { standards, report };
}

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
      smcsValidationReport: null,
    };
  }

  private saveDatabase() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.db));
  }
  
  public async initialize(): Promise<void> {
    const isSeeded = localStorage.getItem(SEED_FLAG_KEY);
    if (!isSeeded) {
      console.log("Seeding database for fresh start with SMCS standards...");
      const program: AccreditationProgram = {
        id: 'prog-oman-smcs',
        name: 'OMAN HEALTHCARE ACCREDITATION PROGRAM',
        description: { en: 'Specialized Medical Care Services (SMCS)', ar: 'خدمات الرعاية الطبية المتخصصة (SMCS)' }
      };
      const { standards: smcsStandards, report: smcsReport } = convertAndValidateSMCS(smcsRaw as any, program.id);
      this.db = {
        projects: [],
        users: [],
        standards: smcsStandards as Standard[],
        documents: [],
        departments: [],
        accreditationPrograms: [program],
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
        smcsValidationReport: smcsReport,
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

  // SMCS Validation Report accessors and re-import
  getSmcsValidationReport = (): any | null => this.db.smcsValidationReport || null;

  importSmcsData = async (jsonData: string): Promise<void> => {
    try {
      const parsed = JSON.parse(jsonData);
      const program = this.db.accreditationPrograms.find(p => p.id === 'prog-oman-smcs') || {
        id: 'prog-oman-smcs',
        name: 'OMAN HEALTHCARE ACCREDITATION PROGRAM',
        description: { en: 'Specialized Medical Care Services (SMCS)', ar: 'خدمات الرعاية الطبية المتخصصة (SMCS)' }
      } as AccreditationProgram;
      if (!this.db.accreditationPrograms.find(p => p.id === program.id)) {
        this.db.accreditationPrograms.push(program);
      }
      const { standards, report } = convertAndValidateSMCS(parsed, program.id);
      this.db.standards = standards;
      this.db.smcsValidationReport = report;
      this.saveDatabase();
    } catch (e) {
      console.error('Failed to import SMCS data:', e);
      throw e;
    }
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