
import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useUserStore } from '../../stores/useUserStore';
import { useProjectStore } from '../../stores/useProjectStore';

import DashboardPage from '../../pages/DashboardPage';
import AnalyticsPage from '../../pages/AnalyticsPage';
import QualityInsightsPage from '../../pages/QualityInsightsPage';
import CalendarPage from '../../pages/CalendarPage';
import ProjectListPage from '../../pages/ProjectListPage';
import ProjectDetailPage from '../../pages/ProjectDetailPage';
import CreateProjectPage from '../../pages/CreateProjectPage';
import MyTasksPage from '../../pages/MyTasksPage';
import RiskHubPage from '../../pages/RiskHubPage';
import AuditHubPage from '../../pages/AuditHubPage';
import DocumentControlHubPage from '../../pages/DocumentControlHubPage';
import DataHubPage from '../../pages/DataHubPage';
import DepartmentsPage from '../../pages/DepartmentsPage';
import DepartmentDetailPage from '../../pages/DepartmentDetailPage';
import TrainingHubPage from '../../pages/TrainingHubPage';
import TrainingDetailPage from '../../pages/TrainingDetailPage';
import CertificatePage from '../../pages/CertificatePage';
import UserProfilePage from '../../pages/UserProfilePage';
import StandardsPage from '../../pages/StandardsPage';
import SettingsLayout from '../settings/SettingsLayout';
import AuditLogPage from '../../pages/AuditLogPage';
import DesignControlsPage from '../../pages/DesignControlsPage';
import MockSurveyListPage from '../../pages/MockSurveyListPage';
import MockSurveyPage from '../../pages/MockSurveyPage';
import SurveyReportPage from '../../pages/SurveyReportPage';

const MainRouter: React.FC = () => {
    const { navigation, setNavigation, users, documents, standards, programs, departments, competencies, trainings, customEvents,
            addProgram, updateProgram, deleteProgram, addStandard, updateStandard, deleteStandard, importStandards,
            addDepartment, updateDepartment, deleteDepartment,
            addCompetency, updateCompetency, deleteCompetency,
            addTraining, updateTraining, deleteTraining, assignTraining,
            addDocument, updateDocument, deleteDocument, approveDocument, addProcessMap,
            addCustomEvent, updateCustomEvent, deleteCustomEvent,
            updateUser, addUser, deleteUser
    } = useAppStore();

    const { currentUser, userTrainingStatuses, certificates, updateTrainingStatus, generateCertificate } = useUserStore();
    const { projects, addProject } = useProjectStore();

    if (!currentUser) return null; // Should not happen if within Layout

    const renderContent = () => {
        switch (navigation.view) {
            case 'dashboard':
                return <DashboardPage />;
            case 'analytics':
                return <AnalyticsPage />;
            case 'qualityInsights':
                return <QualityInsightsPage 
                            projects={projects}
                            risks={[]}
                            users={users}
                            departments={departments}
                            competencies={competencies}
                            userTrainingStatuses={userTrainingStatuses}
                       />;
            case 'calendar':
                return <CalendarPage 
                            customEvents={customEvents}
                            onAddEvent={addCustomEvent}
                            onUpdateEvent={updateCustomEvent}
                            onDeleteEvent={deleteCustomEvent}
                       />;
            case 'projects':
                return <ProjectListPage />;
            case 'projectDetail':
                return <ProjectDetailPage navigation={navigation} />;
            case 'createProject':
                return <CreateProjectPage
                    programs={programs}
                    users={users}
                    onAddProject={addProject}
                    setNavigation={setNavigation}
                />;
            case 'myTasks':
                return <MyTasksPage 
                            projects={projects}
                            currentUser={currentUser}
                            setNavigation={setNavigation}
                       />;
            case 'departments':
                return <DepartmentsPage 
                            departments={departments}
                            users={users}
                            projects={projects}
                            onAdd={addDepartment}
                            onUpdate={updateDepartment}
                            onDelete={deleteDepartment}
                            setNavigation={setNavigation}
                       />;
            case 'departmentDetail':
                 const department = departments.find(d => d.id === navigation.departmentId);
                 return department ? <DepartmentDetailPage department={department} users={users} projects={projects} /> : <div>Department not found</div>;
            case 'trainingHub':
                return <TrainingHubPage 
                            trainingPrograms={trainings}
                            userTrainingStatus={userTrainingStatuses[currentUser.id] || {}}
                            currentUser={currentUser}
                            setNavigation={setNavigation}
                            users={users}
                            departments={departments}
                            onAssign={assignTraining}
                            onCreate={addTraining}
                            onUpdate={updateTraining}
                            onDelete={deleteTraining}
                       />;
            case 'trainingDetail':
                const training = trainings.find(t => t.id === navigation.trainingId);
                const userStatus = userTrainingStatuses[currentUser.id]?.[navigation.trainingId];
                return training ? <TrainingDetailPage 
                                    program={training}
                                    userStatus={userStatus}
                                    onStatusUpdate={(status, score) => updateTrainingStatus(currentUser.id, training.id, status, score)}
                                    onGenerateCertificate={(score) => generateCertificate(currentUser.id, training.id, score)}
                                    setNavigation={setNavigation}
                                /> : <div>Training not found</div>;
            case 'certificate':
                const certificate = certificates.find(c => c.id === navigation.certificateId);
                return certificate ? <CertificatePage certificate={certificate} /> : <div>Certificate not found</div>;
            case 'standards':
                const program = programs.find(p => p.id === navigation.programId);
                return program ? <StandardsPage 
                                    program={program}
                                    standards={standards.filter(s => s.programId === navigation.programId)}
                                    canModify={currentUser.role === 'Admin'}
                                    onAdd={addStandard}
                                    onUpdate={updateStandard}
                                    onDelete={(stdId) => deleteStandard(navigation.programId, stdId)}
                                    onImport={(stds) => importStandards(navigation.programId, stds)}
                                /> : <div>Program not found</div>;
            case 'risk':
                return <RiskHubPage />;
            case 'auditHub':
                return <AuditHubPage />;
            case 'documentControl':
                return <DocumentControlHubPage 
                            documents={documents}
                            standards={standards}
                            currentUser={currentUser}
                            onUpdateDocument={updateDocument}
                            onCreateDocument={(data) => addDocument({...data, isControlled: true, status: 'Draft', content: {en:'',ar:''}, currentVersion: 1, uploadedAt: new Date().toISOString() })}
                            onAddProcessMap={addProcessMap}
                            onDeleteDocument={deleteDocument}
                            onApproveDocument={(docId, pass) => pass === 'password' && approveDocument(docId, currentUser.name)}
                       />;
            case 'dataHub':
                return <DataHubPage />;
            case 'userProfile':
                const user = users.find(u => u.id === navigation.userId);
                return user ? <UserProfilePage 
                                user={user}
                                currentUser={currentUser}
                                department={departments.find(d => d.id === user.departmentId)}
                                projects={projects}
                                trainingPrograms={trainings}
                                userTrainingStatus={userTrainingStatuses[user.id] || {}}
                                competencies={competencies}
                                documents={documents}
                                onUpdateUser={updateUser}
                                setNavigation={setNavigation}
                              /> : <div>User not found</div>;
            case 'settings':
                return <SettingsLayout section={navigation.section} setNavigation={setNavigation} />;
            
            // Newly Implemented Pages
            case 'auditLog':
                return <AuditLogPage projects={projects} />;
            case 'designControls':
                return <DesignControlsPage projects={projects} />;
            case 'mockSurveyList':
                 return <MockSurveyListPage setNavigation={setNavigation} />;
            case 'mockSurvey':
                return <MockSurveyPage navigation={navigation} setNavigation={setNavigation} />;
            case 'surveyReport':
                return <SurveyReportPage navigation={navigation} />;
            
            default:
                return <DashboardPage />;
        }
    };

    return (
        <div className="page-enter-active">
            {renderContent()}
        </div>
    );
};

export default MainRouter;
