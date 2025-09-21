import {
  Project, User, Standard, ChecklistItem, ProjectStatus, UserRole, AppDocument, ActivityLogItem,
  Department, TrainingProgram, UserTrainingStatus, CertificateData, AccreditationProgram, MockSurvey,
  CustomCalendarEvent, CAPAReport, Comment, DesignControlItem, Notification, AppSettings, Competency, Risk,
  ComplianceStatus, IncidentReport, SubStandard
} from '@/types';
import { dataService } from '@/services/data';
import { aiService } from '@/services/ai';
import { useUserStore } from '@/stores/useUserStore';

type NewProjectData = Omit<Project, 'id' | 'checklist' | 'status' | 'projectLead' | 'progress' | 'activityLog' | 'mockSurveys' | 'capaReports' | 'designControls'> & { leadId?: string };

class BackendService {
  constructor() {
    // Initialization is now handled by the DataService
  }

  async initialize(): Promise<void> {
    await dataService.initialize();
  }

  // --- Auth Methods ---
  authenticateUser(email: string, passwordAttempt: string): User | null {
    const user = dataService.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === passwordAttempt) {
      return JSON.parse(JSON.stringify(user));
    }
    return null;
  }

  // --- AI Methods (Delegated) ---
  async suggestActionPlan(standardDescription: string): Promise<string> {
    return aiService.suggestActionPlan(standardDescription);
  }
  
  async suggestRootCause(standardDescription: string, notes: string): Promise<string> {
    return aiService.suggestRootCause(standardDescription, notes);
  }

  async generatePolicyFromStandard(standard: Standard, lang: 'en' | 'ar'): Promise<string> {
    return aiService.generatePolicyFromStandard(standard, lang);
  }

  async improveWriting(text: string, lang: 'en' | 'ar'): Promise<string> {
    return aiService.improveWriting(text, lang);
  }
  
  async translateText(text: string, targetLang: 'en' | 'ar'): Promise<string> {
    return aiService.translateText(text, targetLang);
  }
  
  async generateQualityBriefing(projects: Project[], risks: Risk[], users: User[], departments: Department[], competencies: Competency[]) {
    return aiService.generateQualityBriefing(projects, risks, users, departments, competencies);
  }

  // --- GETTERS (Synchronous read from DataService) ---
  getProjects = (): Project[] => JSON.parse(JSON.stringify(dataService.getProjects()));
  getUsers = (): User[] => JSON.parse(JSON.stringify(dataService.getUsers()));
  getDepartments = (): Department[] => JSON.parse(JSON.stringify(dataService.getDepartments()));
  getStandards = (): Standard[] => JSON.parse(JSON.stringify(dataService.getStandards()));
  getDocuments = (): AppDocument[] => JSON.parse(JSON.stringify(dataService.getDocuments()));
  getAccreditationPrograms = (): AccreditationProgram[] => JSON.parse(JSON.stringify(dataService.getAccreditationPrograms()));
  getTrainingPrograms = (): TrainingProgram[] => JSON.parse(JSON.stringify(dataService.getTrainingPrograms()));
  getCompetencies = (): Competency[] => JSON.parse(JSON.stringify(dataService.getCompetencies()));
  getRisks = (): Risk[] => JSON.parse(JSON.stringify(dataService.getRisks()));
  getIncidentReports = (): IncidentReport[] => JSON.parse(JSON.stringify(dataService.getIncidentReports()));
  getUserTrainingStatus = (userId: string): UserTrainingStatus => JSON.parse(JSON.stringify(dataService.getUserTrainingStatuses()[userId] || {}));
  getUserTrainingStatuses = (): { [userId: string]: UserTrainingStatus } => JSON.parse(JSON.stringify(dataService.getUserTrainingStatuses()));
  getCertificate = (certificateId: string): CertificateData | undefined => dataService.getCertificates().find(c => c.id === certificateId);
  getCertificates = (): CertificateData[] => JSON.parse(JSON.stringify(dataService.getCertificates()));
  getCustomEvents = (): CustomCalendarEvent[] => JSON.parse(JSON.stringify(dataService.getCustomEvents()));
  getNotifications = (userId: string): Notification[] => JSON.parse(JSON.stringify(dataService.getNotifications().filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())));
  getAppSettings = (): AppSettings | null => dataService.getAppSettings() ? JSON.parse(JSON.stringify(dataService.getAppSettings())) : null;

  // --- CUD OPERATIONS (Orchestration using DataService) ---

  async createProject(newProjectData: NewProjectData): Promise<Project | null> {
    const allUsers = dataService.getUsers();
    const relevantStandards = dataService.getStandards().filter(s => s.programId === newProjectData.programId);
    const newChecklist: ChecklistItem[] = relevantStandards.flatMap(standard => {
      if (standard.subStandards && standard.subStandards.length > 0) {
        return standard.subStandards.map(subStandard => ({ id: `cl-${Date.now()}-${subStandard.id}`, standardId: subStandard.id, item: subStandard.description, status: ComplianceStatus.NonCompliant, assignedTo: null, notes: '', evidenceFiles: [], actionPlan: null, comments: [] }));
      }
      return [{ id: `cl-${Date.now()}-${standard.standardId}`, standardId: standard.standardId, item: standard.description, status: ComplianceStatus.NonCompliant, assignedTo: null, notes: '', evidenceFiles: [], actionPlan: null, comments: [] }];
    });
    const projectLead = allUsers.find(u => u.id === newProjectData.leadId) || allUsers.find(u => u.role === UserRole.Admin);
    if (!projectLead) { console.error("Could not find a suitable project lead."); return null; }
    const newProject: Project = { ...newProjectData, id: `proj-${Date.now()}`, status: ProjectStatus.NotStarted, progress: 0, checklist: newChecklist, projectLead, activityLog: [{ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), user: projectLead.name, action: { en: 'Project Created', ar: 'تم إنشاء المشروع' } }], mockSurveys: [], capaReports: [], designControls: [] };
    
    const projects = dataService.getProjects();
    projects.unshift(newProject);
    await dataService.setProjects(projects);
    return newProject;
  }

  async updateProject(updatedProject: Project): Promise<Project> {
    const projects = dataService.getProjects();
    const projectIndex = projects.findIndex(p => p.id === updatedProject.id);
    if (projectIndex !== -1) {
      const originalProject = projects[projectIndex];
      const notifications = dataService.getNotifications();
      updatedProject.checklist.forEach(newItem => {
          const oldItem = originalProject.checklist.find(i => i.id === newItem.id);
          if (oldItem && oldItem.assignedTo !== newItem.assignedTo && newItem.assignedTo) {
              const assignee = dataService.getUsers().find(u => u.id === newItem.assignedTo);
              if (assignee) {
                  const newNotification: Notification = { id: `notif-${Date.now()}-${Math.random()}`, userId: assignee.id, message: { en: `New Task: You have been assigned to "${newItem.item.substring(0, 20)}..." in project "${updatedProject.name}".`, ar: `مهمة جديدة: تم تعيينك لمهمة "${newItem.item.substring(0, 20)}..." في مشروع "${updatedProject.name}".` }, timestamp: new Date().toISOString(), link: { view: 'projectDetail', projectId: updatedProject.id }, read: false, };
                  notifications.unshift(newNotification);
              }
          }
      });
      projects[projectIndex] = updatedProject;
      await dataService.setProjects(projects);
      await dataService.setNotifications(notifications);
    }
    return updatedProject;
  }
  
  async deleteProject(projectId: string): Promise<void> {
    const projects = dataService.getProjects().filter(p => p.id !== projectId);
    await dataService.setProjects(projects);
  }

  async finalizeProject(projectId: string, userId: string, passwordAttempt: string): Promise<Project> {
    const user = dataService.getUsers().find(u => u.id === userId);
    if (!user || user.password !== passwordAttempt) throw new Error("Incorrect password.");
    
    const project = dataService.getProjects().find(p => p.id === projectId);
    if (!project) throw new Error("Project not found.");

    const now = new Date().toISOString();
    const signatureLog: ActivityLogItem = { id: `log-${Date.now()}`, timestamp: now, user: user.name, action: { en: 'Project Finalized with Electronic Signature', ar: 'تم إنهاء المشروع بتوقيع إلكتروني' }, signature: { userId: user.id, userName: user.name, statement: { en: 'By signing, I attest that I have reviewed this project and confirm its contents are accurate and complete to the best of my knowledge.', ar: 'بالتوقيع، أقر بأنني راجعت هذا المشروع وأؤكد أن محتوياته دقيقة وكاملة حسب علمي.', } } };
    
    const updatedProject: Project = { ...project, status: ProjectStatus.Finalized, finalizedBy: user.name, finalizationDate: now, activityLog: [signatureLog, ...project.activityLog], };
    return this.updateProject(updatedProject);
  }

  async addUser(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = { ...userData, id: `user-${Date.now()}`, competencies: [] };
    const users = dataService.getUsers();
    users.push(newUser);
    await dataService.setUsers(users);
    return newUser;
  }

  async updateUser(updatedUser: User): Promise<User> {
    const users = dataService.getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) { users[userIndex] = updatedUser; await dataService.setUsers(users); }
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    const users = dataService.getUsers().filter(u => u.id !== userId);
    await dataService.setUsers(users);
  }

  async addDepartment(deptData: Omit<Department, 'id'>): Promise<Department> {
    const newDepartment: Department = { ...deptData, id: `dep-${Date.now()}` };
    const departments = dataService.getDepartments();
    departments.push(newDepartment);
    await dataService.setDepartments(departments);
    return newDepartment;
  }

  async updateDepartment(updatedDept: Department): Promise<Department> {
    const departments = dataService.getDepartments();
    const deptIndex = departments.findIndex(d => d.id === updatedDept.id);
    if (deptIndex !== -1) { departments[deptIndex] = updatedDept; await dataService.setDepartments(departments); }
    return updatedDept;
  }

  async deleteDepartment(deptId: string): Promise<void> {
    const departments = dataService.getDepartments().filter(d => d.id !== deptId);
    await dataService.setDepartments(departments);
    const users = dataService.getUsers().map(u => u.departmentId === deptId ? { ...u, departmentId: undefined } : u);
    await dataService.setUsers(users);
  }

  async addControlledDocument(docData: { name: { en: string; ar: string }, type: AppDocument['type'], uploadedBy: string }): Promise<AppDocument> {
    const now = new Date().toISOString();
    const newDocId = `doc-${Date.now()}`;
    const newDoc: AppDocument = { id: newDocId, name: docData.name, type: docData.type, uploadedAt: now, status: 'Draft', link: `/documents/${newDocId}`, currentVersion: '1.0', versionHistory: [{ version: '1.0', date: now, uploadedBy: docData.uploadedBy }], isControlled: true };
    const documents = dataService.getDocuments();
    documents.push(newDoc);
    await dataService.setDocuments(documents);
    return newDoc;
  }

  async deleteDocument(docId: string): Promise<void> {
    const documents = dataService.getDocuments().filter(d => d.id !== docId);
    await dataService.setDocuments(documents);
    const projects = dataService.getProjects().map(p => ({ ...p, checklist: p.checklist.map(item => ({ ...item, evidenceFiles: item.evidenceFiles.filter(fileId => fileId !== docId), })) }));
    await dataService.setProjects(projects);
  }

  async updateDocument(updatedDocument: AppDocument): Promise<AppDocument> {
    const documents = dataService.getDocuments();
    const docIndex = documents.findIndex(d => d.id === updatedDocument.id);
    if (docIndex !== -1) { documents[docIndex] = updatedDocument; await dataService.setDocuments(documents); }
    return updatedDocument;
  }

  async approveDocument(docId: string, userId: string, passwordAttempt: string, projectId?: string): Promise<{ updatedDocument: AppDocument, updatedProject: Project | null, updatedUsers: User[] }> {
      const user = dataService.getUsers().find(u => u.id === userId);
      if (!user || user.password !== passwordAttempt) throw new Error("Incorrect password.");

      const doc = dataService.getDocuments().find(d => d.id === docId);
      if (!doc) throw new Error("Document not found.");

      const now = new Date().toISOString();
      const updatedDocument: AppDocument = { ...doc, status: 'Approved', approvedBy: user.name, approvalDate: now };
      await this.updateDocument(updatedDocument);
      
      const readTask = { documentId: docId, assignedDate: now };
      const users = dataService.getUsers().map(u => ({ ...u, readAndAcknowledge: [...(u.readAndAcknowledge || []), readTask] }));
      await dataService.setUsers(users);

      let updatedProject: Project | null = null;
      if (projectId) {
        const project = dataService.getProjects().find(p => p.id === projectId);
        if (project) {
            const approvalLog: ActivityLogItem = { id: `log-${Date.now()}`, timestamp: now, user: user.name, action: { en: `Document '${doc.name.en}' Approved with Electronic Signature`, ar: `تمت الموافقة على مستند '${doc.name.ar}' بتوقيع إلكتروني` }, signature: { userId: user.id, userName: user.name, statement: { en: 'By signing, I attest that I have reviewed this document and approve it for use.', ar: 'بالتوقيع، أقر بأنني راجعت هذا المستند وأوافق عليه للاستخدام.' } } };
            updatedProject = { ...project, activityLog: [approvalLog, ...project.activityLog] };
            await this.updateProject(updatedProject);
        }
      }
      
      return { updatedDocument, updatedProject, updatedUsers: this.getUsers() };
  }
  
  async addProgram(programData: Omit<AccreditationProgram, 'id'>): Promise<AccreditationProgram> {
    const newProgram: AccreditationProgram = { ...programData, id: `prog-${Date.now()}` };
    const programs = dataService.getAccreditationPrograms();
    programs.push(newProgram);
    await dataService.setAccreditationPrograms(programs);
    return newProgram;
  }

  async updateProgram(updatedProgram: AccreditationProgram): Promise<AccreditationProgram> {
    const programs = dataService.getAccreditationPrograms();
    const programIndex = programs.findIndex(p => p.id === updatedProgram.id);
    if (programIndex !== -1) { programs[programIndex] = updatedProgram; await dataService.setAccreditationPrograms(programs); }
    return updatedProgram;
  }

  async deleteProgram(programId: string): Promise<void> {
    if (dataService.getProjects().some(p => p.programId === programId)) {
      alert("Cannot delete a program that is being used by active projects.");
      return;
    }
    const programs = dataService.getAccreditationPrograms().filter(p => p.id !== programId);
    await dataService.setAccreditationPrograms(programs);
    const standards = dataService.getStandards().filter(s => s.programId !== programId);
    await dataService.setStandards(standards);
  }

  async deleteAllProgramsAndStandards(): Promise<void> {
    await dataService.deleteAllProgramsAndStandards();
  }

  async deleteAllTrainingsAndRecords(): Promise<void> {
    await dataService.deleteAllTrainingsAndRecords();
  }

  async addStandard(standardData: Standard): Promise<Standard> {
    const standards = dataService.getStandards();
    standards.push(standardData);
    await dataService.setStandards(standards);
    return standardData;
  }

  async updateStandard(updatedStandard: Standard): Promise<Standard> {
    const standards = dataService.getStandards();
    const standardIndex = standards.findIndex(s => s.standardId === updatedStandard.standardId);
    if (standardIndex !== -1) { standards[standardIndex] = updatedStandard; await dataService.setStandards(standards); }
    return updatedStandard;
  }

  async deleteStandard(standardId: string): Promise<void> {
    const standards = dataService.getStandards().filter(s => s.standardId !== standardId);
    await dataService.setStandards(standards);
  }

  async importStandards(jsonText: string, programId: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        const data = JSON.parse(jsonText);
        let newStandards: Standard[] = [];
        const idFieldKey = ' Quality Assurance Center ';

        // Check if data is an array (new flat format) or an object (old grouped format)
        if (Array.isArray(data)) {
            // New format parser logic (flat array)
            let currentSection: string = 'Uncategorized';
            
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                if (!item[idFieldKey]) continue;

                const idField = item[idFieldKey].trim();
                
                // Check for section header (no other columns)
                const isSectionTitle = !item['Column2'] && !item['Column3'];
                if (isSectionTitle) {
                    currentSection = idField;
                    continue;
                }

                // Check for main standard
                if (item['Column3']?.toString().includes('Total Measures')) {
                    const mainStandardId = idField;
                    const subStandards: SubStandard[] = [];
                    let nextIndex = i + 1;

                    while (nextIndex < data.length) {
                        const nextItem = data[nextIndex];
                        const nextIdField = nextItem[idFieldKey]?.trim();
                        
                        // Stop if we hit another main standard or an invalid item
                        if (!nextIdField || nextItem['Column3']?.toString().includes('Total Measures')) {
                            break; 
                        }
                        
                        // Sub-standards must start with the main standard's code
                        if (nextIdField.startsWith(mainStandardId.split(' ')[0].replace(/\.$/, ''))) {
                             let description = nextItem['Column2']?.trim() || '';
                             let continuationIndex = nextIndex + 1;
                             while(continuationIndex < data.length && !data[continuationIndex][idFieldKey]) {
                                 if (data[continuationIndex]['Column2']) {
                                     description += `\n${data[continuationIndex]['Column2'].trim()}`;
                                 }
                                 continuationIndex++;
                             }
                             subStandards.push({ id: nextIdField, description });
                             nextIndex = continuationIndex;
                             continue;
                        }
                        
                        break;
                    }
                    
                    const totalMeasuresMatch = item['Column3'].match(/Total Measures: (\d+)/);
                    newStandards.push({
                        standardId: mainStandardId,
                        programId,
                        description: item['Column2']?.trim() || '',
                        section: currentSection,
                        totalMeasures: totalMeasuresMatch ? parseInt(totalMeasuresMatch[1], 10) : undefined,
                        subStandards: subStandards.length > 0 ? subStandards : undefined
                    });

                    i = nextIndex - 1;
                }
            }
        } else if (typeof data === 'object' && data !== null) {
            // Old format parser logic (object of arrays)
            for (const key in data) {
                const items = data[key];
                if (!Array.isArray(items)) continue;

                let section = 'Uncategorized';
                const chapterRow = items.find(item => item[idFieldKey]?.trim().startsWith('Chapter'));
                if (chapterRow && chapterRow['Column2']) {
                    section = chapterRow['Column2'].trim();
                }

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (!item[idFieldKey]) continue;

                    if (item['Column3']?.toString().includes('Total Measures')) {
                        const mainStandardId = item[idFieldKey].trim();
                        const subStandards: SubStandard[] = [];
                        let nextIndex = i + 1;

                        while (nextIndex < items.length) {
                            const nextItem = items[nextIndex];
                            const nextIdField = nextItem[idFieldKey]?.trim();
                            
                            if (nextItem['Column3']?.toString().includes('Total Measures')) break;
                            
                            if (nextIdField && nextIdField.startsWith(mainStandardId.split(' ')[0].replace(/\.$/, '')) && nextIdField !== mainStandardId) {
                                let description = nextItem['Column2']?.trim() || '';
                                let continuationIndex = nextIndex + 1;
                                while(continuationIndex < items.length && !items[continuationIndex][idFieldKey]) {
                                    if (items[continuationIndex]['Column2']) {
                                        description += `\n${items[continuationIndex]['Column2'].trim()}`;
                                    }
                                    continuationIndex++;
                                }
                                subStandards.push({ id: nextIdField, description });
                                nextIndex = continuationIndex;
                                continue;
                            }
                            nextIndex++;
                        }
                        
                        const totalMeasuresMatch = item['Column3'].match(/Total Measures: (\d+)/);
                        newStandards.push({
                            standardId: mainStandardId,
                            programId,
                            description: item['Column2']?.trim() || '',
                            section,
                            totalMeasures: totalMeasuresMatch ? parseInt(totalMeasuresMatch[1], 10) : undefined,
                            subStandards: subStandards.length > 0 ? subStandards : undefined
                        });

                        i = nextIndex - 1;
                    }
                }
            }
        } else {
             return { success: false, count: 0, error: 'Invalid JSON format. Expected an object or an array.' };
        }
        
        if (newStandards.length === 0) {
            return { success: false, count: 0, error: `No valid standards found. Ensure file contains objects with a '${idFieldKey.trim()}' key.` };
        }

        const existingStandards = this.getStandards();
        const existingStandardIds = new Set(existingStandards.map(s => s.standardId));
        const standardsToAdd = newStandards.filter(s => !existingStandardIds.has(s.standardId));
        
        await dataService.setStandards([...existingStandards, ...standardsToAdd]);
        
        return { success: true, count: standardsToAdd.length };

    } catch (e) {
        console.error("Error parsing standards file:", e);
        return { success: false, count: 0, error: 'Invalid JSON file format.' };
    }
  }

  async addProcessMap(docData: { name: { en: string; ar: string } }, uploadedBy: string): Promise<AppDocument> {
    const now = new Date().toISOString();
    const newDocId = `doc-${Date.now()}`;
    const newDoc: AppDocument = { id: newDocId, name: docData.name, type: 'Process Map', uploadedAt: now, status: 'Draft', link: `/documents/${newDocId}`, currentVersion: '1.0', versionHistory: [{ version: '1.0', date: now, uploadedBy }], isControlled: true, processMapContent: { nodes: [], edges: [] } };
    const documents = dataService.getDocuments();
    documents.push(newDoc);
    await dataService.setDocuments(documents);
    return newDoc;
  }

  async uploadEvidenceDocument(projectId: string, checklistItemId: string, docData: { name: { en: string; ar: string }, uploadedFile: { name: string, type: string } }, uploadedBy: string): Promise<{ updatedProject: Project, newDocument: AppDocument }> {
    const project = dataService.getProjects().find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");

    const now = new Date().toISOString();
    const newDocId = `doc-${Date.now()}`;
    const newDocument: AppDocument = { id: newDocId, name: docData.name, type: 'Evidence', uploadedAt: now, status: 'Approved', link: `/documents/${newDocId}`, currentVersion: '1.0', versionHistory: [{ version: '1.0', date: now, uploadedBy }], uploadedFile: docData.uploadedFile, isControlled: false, };
    const documents = dataService.getDocuments();
    documents.push(newDocument);
    await dataService.setDocuments(documents);

    const updatedChecklist = project.checklist.map(item => item.id === checklistItemId ? { ...item, evidenceFiles: [...item.evidenceFiles, newDocument.id] } : item);
    const updatedProject = { ...project, checklist: updatedChecklist };
    await this.updateProject(updatedProject);

    return { updatedProject, newDocument };
  }

  async generateProjectReport(project: Project, reportType: string, generatedBy: string): Promise<AppDocument> {
    const now = new Date().toISOString();
    const newDocId = `doc-${Date.now()}`;
    let content = `<h1>Compliance Summary for ${project.name}</h1><p>Generated on: ${new Date(now).toLocaleDateString()}</p><p>Status: ${project.status}</p><p>Progress: ${project.progress}%</p><h2>Checklist Summary</h2><ul>`;
    project.checklist.forEach(item => { content += `<li><strong>${item.standardId}:</strong> ${item.status}</li>`; });
    content += `</ul>`;
    const newReport: AppDocument = { id: newDocId, name: { en: `Compliance Report - ${project.name}`, ar: `تقرير الامتثال - ${project.name}` }, type: 'Report', uploadedAt: now, status: 'Approved', link: `/documents/${newDocId}`, currentVersion: '1.0', versionHistory: [{ version: '1.0', date: now, uploadedBy: generatedBy }], content: { en: content, ar: content }, isControlled: false, };
    const documents = dataService.getDocuments();
    documents.push(newReport);
    await dataService.setDocuments(documents);
    return newReport;
  }
  
  async addCompetency(compData: Omit<Competency, 'id'>): Promise<Competency> {
    const newComp: Competency = { ...compData, id: `comp-${Date.now()}` };
    const competencies = dataService.getCompetencies();
    competencies.push(newComp);
    await dataService.setCompetencies(competencies);
    return newComp;
  }

  async updateCompetency(updatedComp: Competency): Promise<Competency> {
    const competencies = dataService.getCompetencies();
    const compIndex = competencies.findIndex(c => c.id === updatedComp.id);
    if (compIndex !== -1) { competencies[compIndex] = updatedComp; await dataService.setCompetencies(competencies); }
    return updatedComp;
  }

  async deleteCompetency(compId: string): Promise<void> {
    const competencies = dataService.getCompetencies().filter(c => c.id !== compId);
    await dataService.setCompetencies(competencies);
    const users = dataService.getUsers().map(u => ({ ...u, competencies: u.competencies?.filter(uc => uc.competencyId !== compId) }));
    await dataService.setUsers(users);
  }

  async submitQuiz(trainingId: string, userId: string, answers: { [questionId: string]: number }): Promise<{ score: number; passed: boolean; certificateId: string | null }> {
    const training = dataService.getTrainingPrograms().find(t => t.id === trainingId);
    const user = dataService.getUsers().find(u => u.id === userId);
    if (!training || !user) throw new Error("Training or User not found");

    let correctAnswers = 0;
    training.quiz.forEach(q => { if (answers[q.id] === q.correctOptionIndex) correctAnswers++; });
    const score = Math.round((correctAnswers / training.quiz.length) * 100);
    const passed = score >= training.passingScore;
    let certificateId: string | null = null;
    
    const userTrainingStatuses = dataService.getUserTrainingStatuses();
    if (!userTrainingStatuses[userId]) userTrainingStatuses[userId] = {};

    if (passed) {
      const existingStatus = userTrainingStatuses[userId][trainingId];
      if (existingStatus?.certificateId) {
        certificateId = existingStatus.certificateId;
      } else {
        const newCertificate: CertificateData = { id: `cert-${Date.now()}`, userId, userName: user.name, trainingId, trainingTitle: training.title, completionDate: new Date().toISOString() };
        const certificates = dataService.getCertificates();
        certificates.push(newCertificate);
        await dataService.setCertificates(certificates);
        certificateId = newCertificate.id;
      }
    }

    userTrainingStatuses[userId][trainingId] = { status: 'Completed', score, completionDate: passed ? new Date().toISOString() : null, certificateId: certificateId };
    await dataService.setUserTrainingStatuses(userTrainingStatuses);
    return { score, passed, certificateId };
  }
// FIX: Add missing training management functions to BackendService.
  async addTrainingProgram(programData: Omit<TrainingProgram, 'id'>): Promise<TrainingProgram> {
      const newProgram: TrainingProgram = { ...programData, id: `train-${Date.now()}` };
      const programs = dataService.getTrainingPrograms();
      programs.push(newProgram);
      await dataService.setTrainingPrograms(programs);
      return newProgram;
  }

  async updateTrainingProgram(updatedProgram: TrainingProgram): Promise<TrainingProgram> {
      const programs = dataService.getTrainingPrograms();
      const index = programs.findIndex(p => p.id === updatedProgram.id);
      if (index !== -1) {
          programs[index] = updatedProgram;
          await dataService.setTrainingPrograms(programs);
      }
      return updatedProgram;
  }

  async deleteTrainingProgram(programId: string): Promise<void> {
      const programs = dataService.getTrainingPrograms().filter(p => p.id !== programId);
      await dataService.setTrainingPrograms(programs);
      // Also need to remove assignments from users.
      const users = dataService.getUsers().map(u => ({
          ...u,
          trainingAssignments: u.trainingAssignments?.filter(a => a.trainingId !== programId)
      }));
      await dataService.setUsers(users);
  }

  async assignTraining(data: { trainingId: string; userIds: string[]; departmentIds: string[]; dueDate?: string }): Promise<void> {
      const { trainingId, userIds, departmentIds, dueDate } = data;
      const users = dataService.getUsers();
      const affectedUserIds = new Set(userIds);

      if (departmentIds.length > 0) {
          users.forEach(u => {
              if (u.departmentId && departmentIds.includes(u.departmentId)) {
                  affectedUserIds.add(u.id);
              }
          });
      }
      
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) return;

      const assignment = {
          trainingId,
          assignedDate: new Date().toISOString(),
          assignedBy: currentUser.id,
          dueDate: dueDate || undefined,
      };
      
      const updatedUsers = users.map(u => {
          if (affectedUserIds.has(u.id)) {
              const newAssignments = [...(u.trainingAssignments || [])];
              // Avoid duplicate assignments
              if (!newAssignments.some(a => a.trainingId === trainingId)) {
                  newAssignments.push(assignment);
              }
              return { ...u, trainingAssignments: newAssignments };
          }
          return u;
      });

      await dataService.setUsers(updatedUsers);
  }
  async startMockSurvey(projectId: string, surveyorId: string): Promise<{ updatedProject: Project, newSurvey: MockSurvey }> {
    const project = dataService.getProjects().find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    const newSurvey: MockSurvey = { id: `survey-${Date.now()}`, surveyorId, date: new Date().toISOString(), status: 'In Progress', results: project.checklist.map(item => ({ checklistItemId: item.id, result: 'Not Applicable', notes: '' })) };
    const updatedProject = { ...project, mockSurveys: [...project.mockSurveys, newSurvey] };
    await this.updateProject(updatedProject);
    return { updatedProject, newSurvey };
  }

  async updateMockSurvey(projectId: string, survey: MockSurvey): Promise<Project> {
    const project = dataService.getProjects().find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    const surveyIndex = project.mockSurveys.findIndex(s => s.id === survey.id);
    if (surveyIndex !== -1) project.mockSurveys[surveyIndex] = survey;
    return this.updateProject({ ...project });
  }

  async applySurveyFindingsToProject(projectId: string, surveyId: string, userName: string): Promise<Project> {
    const project = dataService.getProjects().find(p => p.id === projectId);
    const survey = project?.mockSurveys.find(s => s.id === surveyId);
    if (!project || !survey) throw new Error("Project or Survey not found");

    const updatedChecklist = project.checklist.map(item => {
      const finding = survey.results.find(r => r.checklistItemId === item.id);
      if (finding && finding.result === 'Fail') return { ...item, status: ComplianceStatus.NonCompliant, actionPlan: finding.notes || item.actionPlan || 'Follow up required based on mock survey finding.' };
      return item;
    });
    
    const applyLog: ActivityLogItem = { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), user: userName, action: { en: `Applied findings from mock survey conducted on ${new Date(survey.date).toLocaleDateString()}`, ar: `تم تطبيق ملاحظات الجولة الوهمية التي أجريت في ${new Date(survey.date).toLocaleDateString()}` } };
    const updatedProject = { ...project, checklist: updatedChecklist, activityLog: [applyLog, ...project.activityLog] };
    return this.updateProject(updatedProject);
  }
  
  async addCustomEvent(eventData: Omit<CustomCalendarEvent, 'id'|'type'>): Promise<CustomCalendarEvent> {
    const newEvent: CustomCalendarEvent = { ...eventData, id: `event-${Date.now()}`, type: 'Custom' };
    const customEvents = dataService.getCustomEvents();
    customEvents.push(newEvent);
    await dataService.setCustomEvents(customEvents);
    return newEvent;
  }
  async updateCustomEvent(updatedEvent: CustomCalendarEvent): Promise<CustomCalendarEvent> {
    const customEvents = dataService.getCustomEvents();
    const index = customEvents.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) { customEvents[index] = updatedEvent; await dataService.setCustomEvents(customEvents); }
    return updatedEvent;
  }
  async deleteCustomEvent(eventId: string): Promise<void> {
    const customEvents = dataService.getCustomEvents().filter(e => e.id !== eventId);
    await dataService.setCustomEvents(customEvents);
  }

  async addCapaReport(projectId: string, capaData: Omit<CAPAReport, 'id'>): Promise<Project> {
    const project = dataService.getProjects().find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    const newCapa: CAPAReport = { ...capaData, id: `capa-${Date.now()}` };
    project.capaReports.push(newCapa);
    return this.updateProject(project);
  }
  
  async updateCapa(projectId: string, updatedCapa: CAPAReport): Promise<Project> {
    const project = dataService.getProjects().find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    const capaIndex = project.capaReports.findIndex(c => c.id === updatedCapa.id);
    if (capaIndex > -1) project.capaReports[capaIndex] = updatedCapa;
    return this.updateProject(project);
  }
  
  async addRisk(riskData: Omit<Risk, 'id'>): Promise<Risk> {
    const newRisk: Risk = { ...riskData, id: `risk-${Date.now()}` };
    const risks = dataService.getRisks();
    risks.push(newRisk);
    await dataService.setRisks(risks);
    return newRisk;
  }
  async updateRisk(updatedRisk: Risk): Promise<Risk> {
    const risks = dataService.getRisks();
    const index = risks.findIndex(r => r.id === updatedRisk.id);
    if (index !== -1) { risks[index] = updatedRisk; await dataService.setRisks(risks); }
    return updatedRisk;
  }
  async deleteRisk(riskId: string): Promise<void> {
    const risks = dataService.getRisks().filter(r => r.id !== riskId);
    await dataService.setRisks(risks);
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
      const notifications = dataService.getNotifications();
      const notif = notifications.find(n => n.id === notificationId && n.userId === userId);
      if (notif) { notif.read = true; await dataService.setNotifications(notifications); }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
      const notifications = dataService.getNotifications();
      notifications.forEach(n => { if (n.userId === userId) n.read = true; });
      await dataService.setNotifications(notifications);
  }

  async addComment(projectId: string, checklistItemId: string, commentData: Omit<Comment, 'id'>): Promise<Project> {
    const project = dataService.getProjects().find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    const checklistItem = project.checklist.find(i => i.id === checklistItemId);
    if (!checklistItem) throw new Error("Checklist item not found");
    const newComment: Comment = { ...commentData, id: `comment-${Date.now()}` };
    checklistItem.comments.push(newComment);
    return this.updateProject(project);
  }
  
  async updateDesignControls(projectId: string, designControls: DesignControlItem[]): Promise<Project> {
    const project = dataService.getProjects().find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    project.designControls = designControls;
    return this.updateProject(project);
  }

  async updateAppSettings(settings: AppSettings): Promise<AppSettings> {
    await dataService.setAppSettings(settings);
    return settings;
  }

  exportAllData(): string {
    return dataService.exportAllData();
  }

  async importAllData(jsonData: string): Promise<void> {
    const currentUser = useUserStore.getState().currentUser;
    const data = JSON.parse(jsonData);

    if (currentUser && data.users && Array.isArray(data.users)) {
        const importedUsers: User[] = data.users;
        const currentUserIndex = importedUsers.findIndex(u => u.id === currentUser.id);

        if (currentUserIndex > -1) {
            // Preserve the currently logged-in user's data to prevent lockout.
            importedUsers[currentUserIndex] = currentUser;
        } else {
            // Add the current user if they aren't in the import file.
            importedUsers.push(currentUser);
        }
        data.users = importedUsers;
    }

    await dataService.importAllData(JSON.stringify(data));
  }
  
  async addIncidentReport(reportData: Omit<IncidentReport, 'id'>): Promise<IncidentReport> {
    const newReport: IncidentReport = { ...reportData, id: `inc-${Date.now()}` };
    const reports = dataService.getIncidentReports();
    reports.push(newReport);
    await dataService.setIncidentReports(reports);
    return newReport;
  }
  async updateIncidentReport(updatedReport: IncidentReport): Promise<IncidentReport> {
    const reports = dataService.getIncidentReports();
    const index = reports.findIndex(r => r.id === updatedReport.id);
    if (index !== -1) { reports[index] = updatedReport; await dataService.setIncidentReports(reports); }
    return updatedReport;
  }
  async deleteIncidentReport(reportId: string): Promise<void> {
    const reports = dataService.getIncidentReports().filter(r => r.id !== reportId);
    await dataService.setIncidentReports(reports);
  }
}

export const backendService = new BackendService();