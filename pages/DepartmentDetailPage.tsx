import React, { useMemo } from 'react';
import { Department, User, Project, ComplianceStatus } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { BuildingOffice2Icon, CheckCircleIcon, ClipboardDocumentCheckIcon, UsersIcon } from '../components/icons';
import StatCard from '../components/common/StatCard';
import DepartmentUserList from '../components/departments/DepartmentUserList';
import DepartmentTaskTable from '../components/departments/DepartmentTaskTable';

interface DepartmentDetailPageProps {
  department: Department;
  users: User[];
  projects: Project[];
}

const DepartmentDetailPage: React.FC<DepartmentDetailPageProps> = ({ department, users, projects }) => {
    const { t, lang } = useTranslation();

    const departmentData = useMemo(() => {
        const usersInDept = users.filter(u => u.departmentId === department.id);
        const userIdsInDept = new Set(usersInDept.map(u => u.id));
        const tasks = projects.flatMap(p => 
            p.checklist
                .filter(item => item.assignedTo && userIdsInDept.has(item.assignedTo))
                .map(item => ({...item, projectName: p.name}))
        );
        
        const applicableTasks = tasks.filter(c => c.status !== ComplianceStatus.NotApplicable);
        let score = 0;
        applicableTasks.forEach(item => {
          if (item.status === ComplianceStatus.Compliant) score += 1;
          if (item.status === ComplianceStatus.PartiallyCompliant) score += 0.5;
        });
        const compliance = applicableTasks.length > 0 ? Math.round((score / applicableTasks.length) * 100) : 100;
        
        return { usersInDept, tasks, compliance, userCount: usersInDept.length, taskCount: tasks.length };
    }, [department, users, projects]);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                <BuildingOffice2Icon className="h-8 w-8 text-brand-primary" />
                <div>
                    <h1 className="text-3xl font-bold">{department.name[lang]}</h1>
                    <p className="text-brand-text-secondary mt-1">{t('departmentDetails')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={t('complianceRate')} value={`${departmentData.compliance}%`} icon={CheckCircleIcon} color="bg-green-500" />
                <StatCard title={t('totalMembers')} value={departmentData.userCount} icon={UsersIcon} color="bg-blue-500" />
                <StatCard title={t('totalTasks')} value={departmentData.taskCount} icon={ClipboardDocumentCheckIcon} color="bg-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1">
                    <DepartmentUserList users={departmentData.usersInDept} />
                </div>
                <div className="lg:col-span-2">
                    <DepartmentTaskTable tasks={departmentData.tasks} users={users} />
                </div>
            </div>
        </div>
    );
};

export default DepartmentDetailPage;
