import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { useAppStore } from '../stores/useAppStore';
import { useTranslation } from '../hooks/useTranslation';
import { ChartBarSquareIcon, CheckCircleIcon, ExclamationTriangleIcon, FolderIcon } from '../components/icons';
import { ProjectStatus, ComplianceStatus } from '../types';
import StatCard from '../components/common/StatCard';
import KpiCard from '../components/analytics/KpiCard';
import DepartmentalPerformanceChart from '../components/analytics/DepartmentalPerformanceChart';
import ComplianceOverTimeChart from '../components/analytics/ComplianceOverTimeChart';
import ProblematicStandardsChart from '../components/analytics/ProblematicStandardsChart';
import CapaRootCauseChart from '../components/analytics/CapaRootCauseChart';
import TaskStatusDistributionChart from '../components/analytics/TaskStatusDistributionChart';
import TaskDistributionByUserChart from '../components/analytics/TaskDistributionByUserChart';

const AnalyticsPage: React.FC = () => {
    const { t } = useTranslation();
    const { projects } = useProjectStore();
    const { users, programs, departments, setNavigation } = useAppStore();
    const [programFilter, setProgramFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesProgram = programFilter === 'all' || p.programId === programFilter;
            if (!matchesProgram) return false;
            
            if (departmentFilter !== 'all') {
                const usersInDept = users.filter(u => u.departmentId === departmentFilter).map(u => u.id);
                const hasDeptTasks = p.checklist.some(item => item.assignedTo && usersInDept.includes(item.assignedTo));
                return hasDeptTasks;
            }
            return true;
        });
    }, [projects, users, programFilter, departmentFilter]);

    const allChecklistItems = useMemo(() => filteredProjects.flatMap(p => p.checklist), [filteredProjects]);

    const kpis = useMemo(() => {
        const totalProjects = filteredProjects.length;
        const activeProjects = filteredProjects.filter(p => p.status !== ProjectStatus.Completed && p.status !== ProjectStatus.Finalized).length;
        const totalTasks = allChecklistItems.length;
        const overdueTasks = allChecklistItems.filter(i => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== ComplianceStatus.Compliant).length;
        const overallCompliance = totalProjects > 0 ? filteredProjects.reduce((acc, p) => acc + p.progress, 0) / totalProjects : 0;
        const compliantTasks = allChecklistItems.filter(i => i.status === ComplianceStatus.Compliant).length;

        return {
            activeProjects,
            overdueTasks,
            overallCompliance,
            totalTasks,
            compliantTasks,
        };
    }, [filteredProjects, allChecklistItems]);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                <ChartBarSquareIcon className="h-8 w-8 text-brand-primary" />
                <div>
                    <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('analytics')}</h1>
                    <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('analyticsHubDescription')}</p>
                </div>
            </div>

            <div className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-xl shadow-sm border border-brand-border dark:border-dark-brand-border flex flex-col md:flex-row gap-4">
                <h3 className="text-lg font-semibold">{t('controlPanel')}</h3>
                <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="w-full md:w-auto border border-brand-border dark:border-dark-brand-border rounded-lg py-2 px-3 focus:ring-brand-primary focus:border-brand-primary bg-brand-surface dark:bg-dark-brand-surface text-sm">
                    <option value="all">{t('allPrograms')}</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-full md:w-auto border border-brand-border dark:border-dark-brand-border rounded-lg py-2 px-3 focus:ring-brand-primary focus:border-brand-primary bg-brand-surface dark:bg-dark-brand-surface text-sm">
                    <option value="all">{t('allDepartments')}</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name.en}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={t('overallComplianceRate')} value={Math.round(kpis.overallCompliance)} total={kpis.totalTasks} completed={kpis.compliantTasks} description={t('tasksCompliant')} color="#4f46e5" />
                <StatCard title={t('totalActiveProjects')} value={kpis.activeProjects} icon={FolderIcon} color="bg-blue-500"/>
                <StatCard title={t('totalOverdueTasks')} value={kpis.overdueTasks} icon={ExclamationTriangleIcon} color="bg-red-500"/>
                <StatCard title={t('totalTasks')} value={kpis.totalTasks} icon={CheckCircleIcon} color="bg-green-500"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComplianceOverTimeChart projects={filteredProjects} />
                <DepartmentalPerformanceChart projects={filteredProjects} departments={departments} users={users} setNavigation={setNavigation} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1"><CapaRootCauseChart projects={filteredProjects} /></div>
                <div className="lg:col-span-2"><ProblematicStandardsChart checklistItems={allChecklistItems} /></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2"><TaskStatusDistributionChart checklistItems={allChecklistItems} /></div>
                <div className="lg:col-span-3"><TaskDistributionByUserChart checklistItems={allChecklistItems} users={users} setNavigation={setNavigation} /></div>
            </div>
        </div>
    );
};

export default AnalyticsPage;