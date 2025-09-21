import {
  Project, User, Standard, AppDocument, Department, TrainingProgram, UserTrainingStatus,
  CertificateData, AccreditationProgram, MockSurvey, CustomCalendarEvent, Notification,
  AppSettings, Competency, Risk, UserRole, IncidentReport,
} from '@/types';

const defaultAppSettings: AppSettings = {
  defaultUserRole: UserRole.TeamMember,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: false,
    requireNumber: false,
  },
  primaryColor: '#4f46e5',
};

const defaultTrainingPrograms: TrainingProgram[] = [
  {
    "id": "train-1",
    "title": {
      "en": "Hand Hygiene and Infection Control",
      "ar": "نظافة اليدين ومكافحة العدوى"
    },
    "description": {
      "en": "Learn the fundamental principles of hand hygiene and its critical role in preventing healthcare-associated infections.",
      "ar": "تعلم المبادئ الأساسية لنظافة اليدين ودورها الحاسم في الوقاية من العدوى المرتبطة بالرعاية الصحية."
    },
    "content": {
      "en": "<h3>Introduction</h3><p>Hand hygiene is the single most important factor in preventing the spread of infections. This module covers the WHO's '5 Moments for Hand Hygiene'.</p><h3>Key Concepts</h3><ul><li>Moment 1: Before touching a patient.</li><li>Moment 2: Before a clean/aseptic procedure.</li><li>Moment 3: After body fluid exposure risk.</li><li>Moment 4: After touching a patient.</li><li>Moment 5: After touching patient surroundings.</li></ul><p>Proper technique involves using an alcohol-based handrub or soap and water, covering all surfaces of the hands, and rubbing for at least 20 seconds.</p>",
      "ar": "<h3>مقدمة</h3><p>تعتبر نظافة اليدين أهم عامل منفرد في منع انتشار العدوى. تغطي هذه الوحدة 'اللحظات الخمس لنظافة اليدين' لمنظمة الصحة العالمية.</p><h3>المفاهيم الرئيسية</h3><ul><li>اللحظة 1: قبل لمس المريض.</li><li>اللحظة 2: قبل إجراء نظيف/معقم.</li><li>اللحظة 3: بعد خطر التعرض لسوائل الجسم.</li><li>اللحظة 4: بعد لمس المريض.</li><li>اللحظة 5: بعد لمس محيط المريض.</li></ul><p>تتضمن التقنية الصحيحة استخدام مطهر كحولي لليدين أو الصابون والماء، وتغطية جميع أسطح اليدين، والفرك لمدة 20 ثانية على الأقل.</p>"
    },
    "passingScore": 80,
    "quiz": [
      {
        "id": "q1-1",
        "question": {
          "en": "Which of the following is NOT one of the '5 Moments for Hand Hygiene'?",
          "ar": "أي مما يلي ليس من 'اللحظات الخمس لنظافة اليدين'؟"
        },
        "options": [
          { "en": "Before touching a patient", "ar": "قبل لمس المريض" },
          { "en": "After using the restroom", "ar": "بعد استخدام دورة المياه" },
          { "en": "After touching patient surroundings", "ar": "بعد لمس محيط المريض" }
        ],
        "correctOptionIndex": 1
      },
      {
        "id": "q1-2",
        "question": {
          "en": "What is the minimum recommended time for rubbing hands with soap and water?",
          "ar": "ما هو الحد الأدنى للوقت الموصى به لفرك اليدين بالصابون والماء؟"
        },
        "options": [
          { "en": "5 seconds", "ar": "5 ثوان" },
          { "en": "10 seconds", "ar": "10 ثوان" },
          { "en": "20 seconds", "ar": "20 ثانية" }
        ],
        "correctOptionIndex": 2
      }
    ]
  },
  {
    "id": "train-2",
    "title": {
      "en": "Patient Identification",
      "ar": "تحديد هوية المريض"
    },
    "description": {
      "en": "Master the correct procedures for patient identification to ensure patient safety as per JCI standards.",
      "ar": "إتقان الإجراءات الصحيحة لتحديد هوية المريض لضمان سلامة المرضى وفقًا لمعايير اللجنة المشتركة الدولية."
    },
    "content": {
      "en": "<h3>Core Principle</h3><p>The core principle of patient identification is to reliably identify the individual as the person for whom the service or treatment is intended and to match the service or treatment to that individual.</p><h3>Procedure</h3><p>At least two patient identifiers must be used when administering medications, blood, or other treatments. Acceptable identifiers include:</p><ul><li>Patient's full name</li><li>Date of birth</li><li>Medical record number</li></ul><p>The patient's room number or location is NOT an acceptable identifier.</p>",
      "ar": "<h3>المبدأ الأساسي</h3><p>المبدأ الأساسي لتحديد هوية المريض هو تحديد الفرد بشكل موثوق به كشخص مقصود للخدمة أو العلاج ومطابقة الخدمة أو العلاج مع ذلك الفرد.</p><h3>الإجراء</h3><p>يجب استخدام معرفين على الأقل للمريض عند إعطاء الأدوية أو الدم أو العلاجات الأخرى. تشمل المعرفات المقبولة:</p><ul><li>الاسم الكامل للمريض</li><li>تاريخ الميلاد</li><li>رقم السجل الطبي</li></ul><p>رقم غرفة المريض أو موقعه ليس معرفًا مقبولاً.</p>"
    },
    "passingScore": 100,
    "quiz": [
      {
        "id": "q2-1",
        "question": {
          "en": "How many patient identifiers are required at minimum before administering medication?",
          "ar": "كم عدد معرفات المريض المطلوبة كحد أدنى قبل إعطاء الدواء؟"
        },
        "options": [
          { "en": "One", "ar": "واحد" },
          { "en": "Two", "ar": "اثنان" },
          { "en": "Three", "ar": "ثلاثة" }
        ],
        "correctOptionIndex": 1
      },
      {
        "id": "q2-2",
        "question": {
          "en": "Which of the following is NOT an acceptable patient identifier?",
          "ar": "أي مما يلي ليس معرفًا مقبولاً للمريض؟"
        },
        "options": [
          { "en": "Full Name", "ar": "الاسم الكامل" },
          { "en": "Date of Birth", "ar": "تاريخ الميلاد" },
          { "en": "Room Number", "ar": "رقم الغرفة" }
        ],
        "correctOptionIndex": 2
      }
    ]
  }
];

class DataService {
  private _projects: Project[] = [];
  private _users: User[] = [];
  private _standards: Standard[] = [];
  private _documents: AppDocument[] = [];
  private _departments: Department[] = [];
  private _accreditationPrograms: AccreditationProgram[] = [];
  private _trainingPrograms: TrainingProgram[] = [];
  private _competencies: Competency[] = [];
  private _risks: Risk[] = [];
  private _incidentReports: IncidentReport[] = [];
  private _userTrainingStatuses: { [userId: string]: UserTrainingStatus } = {};
  private _certificates: CertificateData[] = [];
  private _customEvents: CustomCalendarEvent[] = [];
  private _notifications: Notification[] = [];
  private _appSettings: AppSettings | null = null;
  private _isInitialized = false;

  public async initialize(): Promise<void> {
    if (this._isInitialized) return;
  
    const rawDb = localStorage.getItem('accreditex_db');
    
    if (rawDb) {
        // Data exists, load it from localStorage
        const db = JSON.parse(rawDb);
        this._projects = db.projects || [];
        this._users = db.users || [];
        this._standards = db.standards || [];
        this._documents = db.documents || [];
        this._departments = db.departments || [];
        this._accreditationPrograms = db.accreditationPrograms || [];
        this._trainingPrograms = db.trainingPrograms || [];
        this._competencies = db.competencies || [];
        this._risks = db.risks || [];
        this._incidentReports = db.incidentReports || [];
        this._userTrainingStatuses = db.userTrainingStatuses || {};
        this._certificates = db.certificates || [];
        this._customEvents = db.customEvents || [];
        this._notifications = db.notifications || [];
        this._appSettings = db.appSettings || defaultAppSettings;
    } else {
        // First run: Seed only essential data for the app to be usable.
        this._appSettings = defaultAppSettings;
        
        this._users = [{
            id: "user-1",
            name: "Dr. Evelyn Reed",
            email: "e.reed@healthcare.com",
            password: "password123", // Add password for demo login
            role: UserRole.Admin,
            departmentId: "dep-7",
            jobTitle: "Chief Medical Officer",
            hireDate: "2018-03-12",
            competencies: [],
            trainingAssignments: []
        }];
        
        this._departments = [{
            "id": "dep-7",
            "name": {
              "en": "Administration",
              "ar": "الإدارة"
            }
        }];
        
        this._trainingPrograms = defaultTrainingPrograms;
        
        // Initialize all other data as empty arrays
        this._projects = [];
        this._standards = [];
        this._documents = [];
        this._accreditationPrograms = [];
        this._competencies = [];
        this._risks = [];
        this._incidentReports = [];
        this._userTrainingStatuses = {};
        this._certificates = [];
        this._customEvents = [];
        this._notifications = [];

        await this._persistDb();
    }
    
    this._isInitialized = true;
  }
  
  private async _persistDb(): Promise<void> {
    const allData = {
        projects: this._projects,
        users: this._users,
        standards: this._standards,
        documents: this._documents,
        departments: this._departments,
        accreditationPrograms: this._accreditationPrograms,
        trainingPrograms: this._trainingPrograms,
        competencies: this._competencies,
        risks: this._risks,
        incidentReports: this._incidentReports,
        userTrainingStatuses: this._userTrainingStatuses,
        certificates: this._certificates,
        customEvents: this._customEvents,
        notifications: this._notifications,
        appSettings: this._appSettings,
    };
    localStorage.setItem('accreditex_db', JSON.stringify(allData));
    return Promise.resolve();
  }
  
  // Getters
  getProjects = (): Project[] => this._projects;
  getUsers = (): User[] => this._users;
  getStandards = (): Standard[] => this._standards;
  getDocuments = (): AppDocument[] => this._documents;
  getDepartments = (): Department[] => this._departments;
  getAccreditationPrograms = (): AccreditationProgram[] => this._accreditationPrograms;
  getTrainingPrograms = (): TrainingProgram[] => this._trainingPrograms;
  getCompetencies = (): Competency[] => this._competencies;
  getRisks = (): Risk[] => this._risks;
  getIncidentReports = (): IncidentReport[] => this._incidentReports;
  getUserTrainingStatuses = (): { [userId: string]: UserTrainingStatus } => this._userTrainingStatuses;
  getCertificates = (): CertificateData[] => this._certificates;
  getCustomEvents = (): CustomCalendarEvent[] => this._customEvents;
  getNotifications = (): Notification[] => this._notifications;
  getAppSettings = (): AppSettings | null => this._appSettings;
  
  // Setters
  async setProjects(data: Project[]): Promise<void> { this._projects = data; await this._persistDb(); }
  async setUsers(data: User[]): Promise<void> { this._users = data; await this._persistDb(); }
  async setStandards(data: Standard[]): Promise<void> { this._standards = data; await this._persistDb(); }
  async setDocuments(data: AppDocument[]): Promise<void> { this._documents = data; await this._persistDb(); }
  async setDepartments(data: Department[]): Promise<void> { this._departments = data; await this._persistDb(); }
  async setAccreditationPrograms(data: AccreditationProgram[]): Promise<void> { this._accreditationPrograms = data; await this._persistDb(); }
  async setTrainingPrograms(data: TrainingProgram[]): Promise<void> { this._trainingPrograms = data; await this._persistDb(); }
  async setCompetencies(data: Competency[]): Promise<void> { this._competencies = data; await this._persistDb(); }
  async setRisks(data: Risk[]): Promise<void> { this._risks = data; await this._persistDb(); }
  async setIncidentReports(data: IncidentReport[]): Promise<void> { this._incidentReports = data; await this._persistDb(); }
  async setUserTrainingStatuses(data: { [userId: string]: UserTrainingStatus }): Promise<void> { this._userTrainingStatuses = data; await this._persistDb(); }
  async setCertificates(data: CertificateData[]): Promise<void> { this._certificates = data; await this._persistDb(); }
  async setCustomEvents(data: CustomCalendarEvent[]): Promise<void> { this._customEvents = data; await this._persistDb(); }
  async setNotifications(data: Notification[]): Promise<void> { this._notifications = data; await this._persistDb(); }
  async setAppSettings(data: AppSettings | null): Promise<void> { this._appSettings = data; await this._persistDb(); }

  async deleteAllProgramsAndStandards(): Promise<void> {
    this._projects = [];
    this._accreditationPrograms = [];
    this._standards = [];
    await this._persistDb();
  }

  async deleteAllTrainingsAndRecords(): Promise<void> {
    this._trainingPrograms = [];
    this._userTrainingStatuses = {};
    this._certificates = [];
    this._users = this._users.map(u => ({ ...u, trainingAssignments: [] }));
    // Also unlink any competencies granted by training
    this._competencies = this._competencies.map(c => {
        const { grantingTrainingId, ...rest } = c;
        return rest;
    });
    await this._persistDb();
  }

  // Import / Export
  exportAllData(): string {
    const allData = {
        projects: this._projects, users: this._users, standards: this._standards,
        documents: this._documents, departments: this._departments, accreditationPrograms: this._accreditationPrograms,
        trainingPrograms: this._trainingPrograms, competencies: this._competencies, risks: this._risks,
        incidentReports: this._incidentReports,
        userTrainingStatuses: this._userTrainingStatuses, certificates: this._certificates, customEvents: this._customEvents,
        notifications: this._notifications, appSettings: this._appSettings,
    };
    return JSON.stringify(allData, null, 2);
  }

  async importAllData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    this._projects = data.projects || [];
    this._users = data.users || [];
    this._standards = data.standards || [];
    this._documents = data.documents || [];
    this._departments = data.departments || [];
    this._accreditationPrograms = data.accreditationPrograms || [];
    this._trainingPrograms = data.trainingPrograms || [];
    this._competencies = data.competencies || [];
    this._risks = data.risks || [];
    this._incidentReports = data.incidentReports || [];
    this._userTrainingStatuses = data.userTrainingStatuses || {};
    this._certificates = data.certificates || [];
    this._customEvents = data.customEvents || [];
    this._notifications = data.notifications || [];
    this._appSettings = data.appSettings || defaultAppSettings;
    await this._persistDb();
  }
}

export const dataService = new DataService();
