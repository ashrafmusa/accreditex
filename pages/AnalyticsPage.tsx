import React, { useState, useMemo } from 'react';
import { Project, User, Department, AccreditationProgram, Standard, ComplianceStatus } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { ChartBarSquareIcon, CheckCircleIcon, ExclamationTriangleIcon, AcademicCapIcon, BookOpenIcon } from '@/components/icons';
import DepartmentalPerformanceChart from '@/components/analytics/DepartmentalPerformanceChart';
import ComplianceOverTimeChart from '@/components/analytics/ComplianceOverTimeChart';
import CapaStatusChart from '@/components/analytics/CapaStatusChart';
import ProblematicStandardsTable from '@/components/analytics/ProblematicStandardsTable';
import StatCard from '@/components/common/StatCard';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUserStore } from '@/stores/useUserStore';
import { useAppStore } from '@/stores/useAppStore';

const AnalyticsPage: React.FC = () => {
  const { t, lang } = useTranslation();

  const projects = useProjectStore(state => state.projects);
  const users = useUserStore(state => state.users);
  const { departments, accreditationPrograms: programs } = useAppStore();

  const [dateFilter, setDateFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredData = useMemo(() => {
    let filteredProjects = [...projects];
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date(new Date().setDate(new Date().getDate() - days));
      filteredProjects = filteredProjects.filter(p => new Date(p.startDate) >= cutoffDate);
    }
    if (programFilter !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.programId === programFilter);
    }
    
    let projectChecklistItems = filteredProjects.flatMap(p => p.checklist);
    if (departmentFilter !== 'all') {
      const userIdsInDept = new Set(users.filter(u => u.departmentId === departmentFilter).map(u => u.id));
      const relevantProjectIds = new Set(filteredProjects.filter(p => p.checklist.some(item => item.assignedTo && userIdsInDept.has(item.assignedTo))).map(p => p.id));
      filteredProjects = filteredProjects.filter(p => relevantProjectIds.has(p.id));
      projectChecklistItems = filteredProjects.flatMap(p => p.checklist).filter(item => item.assignedTo && userIdsInDept.has(item.assignedTo));
    }
    
    return { projects: filteredProjects, checklistItems: projectChecklistItems };
  }, [projects, users, dateFilter, programFilter, departmentFilter]);

  const kpis = useMemo(() => {
    const allCapas = filteredData.projects.flatMap(p => p.capaReports);
    const capaRate = allCapas.length > 0 ? Math.round((allCapas.filter(c => c.status === 'Closed').length / allCapas.length) * 100) : 0;
    
    const applicableItems = filteredData.checklistItems.filter(c => c.status !== ComplianceStatus.NotApplicable);
    const score = applicableItems.reduce((acc, item) => {
        if (item.status === ComplianceStatus.Compliant) return acc + 1;
        if (item.status === ComplianceStatus.PartiallyCompliant) return acc + 0.5;
        return acc;
    }, 0);
    const complianceRate = applicableItems.length > 0 ? Math.round((score / applicableItems.length) * 100) : 0;
    
    const surveys = filteredData.projects.flatMap(p => p.mockSurveys.filter(s => s.status === 'Completed'));
    const avgScore = surveys.length > 0 ? Math.round(surveys.reduce((acc, s) => {
        const pass = s.results.filter(r => r.result === 'Pass').length;
        const total = s.results.filter(r => r.result === 'Pass' || r.result === 'Fail').length;
        return acc + (total > 0 ? (pass / total) * 100 : 0);
      }, 0) / surveys.length) : 0;

    const failureCounts = filteredData.checklistItems
        .filter(i => i.status === ComplianceStatus.NonCompliant || i.status === ComplianceStatus.PartiallyCompliant)
        .reduce((acc: Record<string, number>, i) => {
            acc[i.standardId] = (acc[i.standardId] || 0) + 1;
            return acc;
        }, {});
    const mostFailed = (Object.entries(failureCounts) as [string, number][]).sort(([, countA], [, countB]) => countB - countA)[0];
    
    return {
      complianceRate: `${complianceRate}%`,
      avgMockSurveyScore: surveys.length > 0 ? `${avgScore}%` : t('notApplicableShort'),
      mostFailedStandard: mostFailed ? mostFailed[0] : t('notApplicableShort'),
      capaResolutionRate: `${capaRate}%`,
    };
  }, [filteredData, t]);

  const selectClasses = "border border-brand-border dark:border-dark-brand-border rounded-lg py-2 px-3 focus:ring-brand-primary-500 focus:border-brand-primary-500 bg-brand-surface dark:bg-dark-brand-surface text-sm dark:text-dark-brand-text-primary";

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
        <ChartBarSquareIcon className="h-8 w-8 text-brand-primary" />
        <div>
          <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('analyticsHub')}</h1>
          <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('analyticsHubDescription')}</p>
        </div>
      </div>
      
      <div className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-xl shadow-md border border-brand-border dark:border-dark-brand-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={selectClasses}><option value="all">{t('allTime')}</option><option value="30">{t('last30Days')}</option><option value="90">{t('last90Days')}</option></select>
            <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className={selectClasses}><option value="all">{t('allPrograms')}</option>{programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className={selectClasses}><option value="all">{t('allDepartments')}</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}</select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title={t('overallCompliance')} value={kpis.complianceRate} icon={CheckCircleIcon} color="from-indigo-500 to-indigo-700 bg-gradient-to-br" />
        <StatCard title={t('capaResolutionRate')} value={kpis.capaResolutionRate} icon={ExclamationTriangleIcon} color="from-red-500 to-red-700 bg-gradient-to-br" />
        <StatCard title={t('avgMockSurveyScore')} value={kpis.avgMockSurveyScore} icon={AcademicCapIcon} color="from-sky-500 to-sky-700 bg-gradient-to-br" />
        <StatCard title={t('mostFailedStandard')} value={kpis.mostFailedStandard} icon={BookOpenIcon} color="from-amber-500 to-amber-700 bg-gradient-to-br" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentalPerformanceChart projects={projects} departments={departments} users={users} />
        <CapaStatusChart projects={filteredData.projects} />
        <ComplianceOverTimeChart projects={filteredData.projects} />
      </div>
      
      <ProblematicStandardsTable checklistItems={filteredData.checklistItems} />
    </div>
  );
};

export default AnalyticsPage;