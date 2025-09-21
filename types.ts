
export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export type Direction = 'ltr' | 'rtl';

export enum UserRole {
  Admin = 'Admin',
  ProjectLead = 'ProjectLead',
  TeamMember = 'TeamMember',
  Auditor = 'Auditor'
}

export enum ProjectStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
  Finalized = 'Finalized'
}

export enum ComplianceStatus {
  Compliant = 'Compliant',
  PartiallyCompliant = 'Partially Compliant',
  NonCompliant = 'Non-Compliant',
  NotApplicable = 'Not Applicable'
}

export enum StandardCriticality {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export interface LocalizedString {
  en: string;
  ar: string;
}

export interface UserCompetency {
  competencyId: string;
  issueDate: string;
  expiryDate?: string;
  evidenceDocumentId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  departmentId?: string;
  jobTitle?: string;
  hireDate?: string;
  competencies?: UserCompetency[];
  trainingAssignments?: {
    trainingId: string;
    assignedDate: string;
    assignedBy: string; // User ID
    dueDate?: string;
  }[];
  readAndAcknowledge?: { documentId: string; assignedDate: string; acknowledgedDate?: string }[];
}

export interface Department {
  id: string;
  name: LocalizedString;
  requiredCompetencyIds?: string[];
}

export interface SubStandard {
  id: string;
  description: string;
}

export interface Standard {
  standardId: string;
  programId: string;
  description: string;
  section?: string;
  totalMeasures?: number;
  subStandards?: SubStandard[];
  criticality?: StandardCriticality;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  text: string;
}

export interface ChecklistItem {
  id: string;
  standardId: string;
  item: string;
  status: ComplianceStatus;
  assignedTo: string | null;
  notes: string;
  evidenceFiles: string[];
  actionPlan: string | null;
  comments: Comment[];
  dueDate?: string | null;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: LocalizedString;
  details?: LocalizedString;
  signature?: {
    userId: string;
    userName: string;
    statement: LocalizedString;
  };
}

export interface MockSurveyResult {
  checklistItemId: string;
  result: 'Pass' | 'Fail' | 'Not Applicable';
  notes: string;
}

export interface MockSurvey {
  id: string;
  surveyorId: string;
  date: string;
  status: 'In Progress' | 'Completed';
  results: MockSurveyResult[];
}

export interface CAPAReport {
  id: string;
  sourceProjectId: string;
  sourceChecklistItemId?: string;
  sourceStandardId?: string;
  sourceIncidentId?: string;
  status: 'Open' | 'Closed';
  type: 'Corrective' | 'Preventive';
  description: string;
  rootCauseAnalysis: string;
  rootCauseCategory?: string;
  trainingRecommendationId?: string;
  actionPlan: string;
  assignedTo: string | null;
  dueDate: string;
  createdAt: string;
  effectivenessCheck?: {
    required: boolean;
    dueDate: string;
    completed: boolean;
    notes: string;
  };
}

export interface DesignControlItem {
  id: string;
  userNeed: string;
  designInput: string;
  designOutput: string;
  verification: string;
  validation: string;
  linkedDocumentIds: string[];
}

export interface Project {
  id: string;
  name: string;
  programId: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  projectLead: User;
  status: ProjectStatus;
  progress: number;
  checklist: ChecklistItem[];
  activityLog: ActivityLogItem[];
  mockSurveys: MockSurvey[];
  capaReports: CAPAReport[];
  designControls: DesignControlItem[];
  finalizedBy?: string;
  finalizationDate?: string;
}

export interface ProcessNode {
    id: string;
    type: 'start' | 'process' | 'decision' | 'end';
    text: string;
    position: { x: number; y: number };
}

export interface ProcessEdge {
    id: string;
    source: string;
    target: string;
}

export interface AppDocument {
  id: string;
  name: LocalizedString;
  type: 'Policy' | 'Procedure' | 'Report' | 'Evidence' | 'Process Map';
  uploadedAt: string;
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Archived';
  link: string;
  currentVersion: string;
  versionHistory: { version: string; date: string; uploadedBy: string }[];
  isControlled: boolean;
  reviewDate?: string;
  approvedBy?: string;
  approvalDate?: string;
  content?: LocalizedString;
  processMapContent?: { nodes: ProcessNode[]; edges: ProcessEdge[] };
  uploadedFile?: { name: string; type: string };
}

export interface TrainingProgram {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  content: LocalizedString;
  passingScore: number;
  quiz: {
    id: string;
    question: LocalizedString;
    options: LocalizedString[];
    correctOptionIndex: number;
  }[];
}

export interface UserTrainingStatus {
  [trainingId: string]: {
    status: 'Not Started' | 'In Progress' | 'Completed';
    score?: number;
    completionDate?: string | null;
    certificateId?: string | null;
  };
}

export interface CertificateData {
  id: string;
  userId: string;
  userName: string;
  trainingId: string;
  trainingTitle: LocalizedString;
  completionDate: string;
}

export interface AccreditationProgram {
  id: string;
  name: string;
  description: LocalizedString;
}

export interface CustomCalendarEvent {
  id: string;
  date: string;
  title: LocalizedString;
  description?: LocalizedString;
  type: 'Custom';
}

export type SettingsSection = 'general' | 'profile' | 'users' | 'accreditationHub' | 'competencies' | 'data' | 'about';

export type NavigationState =
  | { view: 'dashboard' }
  | { view: 'analytics' }
  | { view: 'qualityInsights' }
  | { view: 'calendar' }
  | { view: 'risk' }
  | { view: 'documentControl' }
  | { view: 'myTasks' }
  | { view: 'projects' }
  | { view: 'projectDetail', projectId: string }
  | { view: 'createProject' }
  | { view: 'editProject', projectId: string }
  | { view: 'settings', section?: SettingsSection }
  | { view: 'userProfile', userId: string }
  | { view: 'departments' }
  | { view: 'departmentDetail', departmentId: string }
  | { view: 'standards', programId: string }
  | { view: 'trainingHub' }
  | { view: 'trainingDetail', trainingId: string }
  | { view: 'certificate', certificateId: string }
  | { view: 'mockSurvey', projectId: string, surveyId: string }
  | { view: 'surveyReport', projectId: string, surveyId: string };

export interface Notification {
  id: string;
  userId: string;
  message: LocalizedString;
  timestamp: string;
  link: NavigationState;
  read: boolean;
}

export interface AppSettings {
  defaultUserRole: UserRole;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumber: boolean;
  };
  primaryColor: string;
  logoUrl?: string;
}

export interface Competency {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  grantingTrainingId?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  ownerId: string | null;
  status: 'Open' | 'Mitigated' | 'Closed';
  mitigationPlan: string;
  createdAt: string;
  rootCauseCategory?: string;
  trainingRecommendationId?: string;
}

export interface IncidentReport {
  id: string;
  incidentDate: string;
  location: string;
  type: 'Patient Safety' | 'Staff Injury' | 'Facility Issue' | 'Medication Error' | 'Other';
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Sentinel Event';
  description: string;
  reportedBy: string;
  status: 'Open' | 'Under Investigation' | 'Closed';
  correctiveActionIds: string[];
}

export type ProjectDetailView = 'overview' | 'checklist' | 'documents' | 'audit_log' | 'mock_surveys' | 'design_controls';

export interface AIQualityBriefing {
  strengths: string[];
  concerns: string[];
  recommendations: {
    title: string;
    details: string;
  }[];
}