

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Project, User, NavigationState, ProjectStatus, AppDocument, CAPAReport, ComplianceStatus } from '@/types';
import { CheckCircleIcon, ExclamationTriangleIcon, FolderIcon, PauseCircleIcon, PlayCircleIcon, PlusIcon, ClipboardDocumentCheckIcon, CalendarDaysIcon } from '@/components/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/components/common/ThemeProvider';
import StatCard from '@/components/common/StatCard';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUserStore } from '@/stores/useUserStore';
import { useAppStore } from '@/stores/useAppStore';

interface DashboardPageProps {
  setNavigation: (state: NavigationState) => void;
}

const CustomTooltip = ({ active, payload, label, t }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
          <p className="font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{label}</p>
          <p className="text-sm text-brand-primary dark:text-brand-primary-400">{`${t('complianceRate')}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

const DashboardPage: React.FC<DashboardPageProps> = ({ setNavigation }) => {
  const { t, lang } = useTranslation();
  const { theme } = useTheme();
  
  const projects = useProjectStore(state => state.projects);
  const { users, currentUser } = useUserStore();
  const { documents } = useAppStore();

  const dashboardData = useMemo(() => {
    // KPI Calculations
    const totalProjects = projects.length;
    const inProgressCount = projects.filter(p => p.status === ProjectStatus.InProgress).length;
    const completedCount = projects.filter(p => p.status === ProjectStatus.Completed).length;
    
    let totalScore = 0;
    let totalApplicableTasks = 0;
    projects.forEach(p => {
        const applicableItems = p.checklist.filter(c => c.status !== ComplianceStatus.NotApplicable);
        totalApplicableTasks += applicableItems.length;
        applicableItems.forEach(item => {
            if (item.status === ComplianceStatus.Compliant) totalScore += 1;
            if (item.status === ComplianceStatus.PartiallyCompliant) totalScore += 0.5;
        });
    });
    const overallCompliance = totalApplicableTasks > 0 ? ((totalScore / totalApplicableTasks) * 100).toFixed(1) : '0.0';

    const openCapaReports = projects.flatMap(p => p.capaReports.filter(c => c.status === 'Open'));
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const upcomingProjectDeadlines = projects.filter(p => p.endDate && new Date(p.endDate) <= thirtyDaysFromNow && new Date(p.endDate) > new Date());
    const upcomingDocReviews = documents.filter(d => d.reviewDate && new Date(d.reviewDate) <= thirtyDaysFromNow && new Date(d.reviewDate) > new Date());
    const upcomingDeadlinesCount = upcomingProjectDeadlines.length + upcomingDocReviews.length;

    // Chart Data
    const complianceChartData = projects.map(project => ({
        name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
        compliance: parseFloat(project.progress.toFixed(1)),
        id: project.id
    }));

    const statusCounts = projects.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
    }, {} as Record<ProjectStatus, number>);
    const pieChartData = Object.entries(statusCounts).map(([name, value]) => ({ name: t((name.charAt(0).toLowerCase() + name.slice(1).replace(/\s/g, '')) as any) || name, value }));

    return {
        totalProjects,
        inProgressCount,
        completedCount,
        overallCompliance: `${overallCompliance}%`,
        openCapaCount: openCapaReports.length,
        upcomingDeadlinesCount,
        complianceChartData,
        pieChartData,
        recentOpenCapa: openCapaReports
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5),
    };
  }, [projects, documents, t]);

  const PIE_COLORS = [ '#4f46e5', '#22c55e', '#6b7280', '#f59e0b', '#3b82f6'];

  const tickStyle = { fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: '12px' };

  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-xl shadow-md border border-brand-border dark:border-dark-brand-border">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-brand-text-primary dark:text-dark-brand-text-primary">{t('welcomeBack').replace('{name}', currentUser.name.split(' ')[0])}</h1>
                <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('dashboardGreeting')}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button onClick={() => setNavigation({ view: 'myTasks' })} className="text-sm font-semibold text-brand-primary-600 dark:text-brand-primary-400 bg-brand-primary-50 dark:bg-dark-brand-surface px-4 py-2 rounded-lg hover:bg-brand-primary-100 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto border border-brand-primary-100 dark:border-dark-brand-border">
                    <ClipboardDocumentCheckIcon className="w-5 h-5"/> <span>{t('viewMyTasks')}</span>
                </button>
                <button onClick={() => setNavigation({ view: 'createProject'})} className="text-sm font-semibold text-white bg-brand-primary-600 px-4 py-2 rounded-lg hover:bg-brand-primary-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                    <PlusIcon className="w-5 h-5"/> <span>{t('createNewProject')}</span>
                </button>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title={t('totalProjects')} value={dashboardData.totalProjects} icon={FolderIcon} color="bg-blue-600"/>
        <StatCard title={t('inProgress')} value={dashboardData.inProgressCount} icon={PlayCircleIcon} color="bg-orange-500"/>
        <StatCard title={t('completed')} value={dashboardData.completedCount} icon={CheckCircleIcon} color="bg-emerald-600"/>
        <StatCard title={t('overallCompliance')} value={dashboardData.overallCompliance} icon={CheckCircleIcon} color="bg-indigo-600" />
        <StatCard title={t('openCapaReports')} value={dashboardData.openCapaCount} icon={ExclamationTriangleIcon} color="bg-red-600" />
        <StatCard title={t('upcomingDeadlines')} value={dashboardData.upcomingDeadlinesCount} icon={CalendarDaysIcon} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-xl shadow-md border border-brand-border dark:border-dark-brand-border">
            <h3 className="text-lg font-semibold text-brand-text-primary dark:text-dark-brand-text-primary mb-4">{t('projectComplianceRate')}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.complianceChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={1}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(128,128,128,0.1)' : 'rgba(128,128,128,0.2)'} />
                    <XAxis dataKey="name" tick={tickStyle} />
                    <YAxis unit="%" tick={tickStyle} />
                    <Tooltip content={<CustomTooltip t={t} />} cursor={{fill: theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 0.4)'}} />
                    <Bar dataKey="compliance" fill="url(#barGradient)" name={t('complianceRate')} barSize={30} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-xl shadow-md border border-brand-border dark:border-dark-brand-border">
            <h3 className="text-lg font-semibold text-brand-text-primary dark:text-dark-brand-text-primary mb-4">{t('projectStatusDistribution')}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={dashboardData.pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return ( <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12"> {`${(percent * 100).toFixed(0)}%`} </text> );
                    }}>
                        {dashboardData.pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip t={t} />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
      
       <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-xl shadow-md border border-brand-border dark:border-dark-brand-border">
            <h3 className="text-lg font-semibold text-brand-text-primary dark:text-dark-brand-text-primary mb-4">{t('openCapaReports')}</h3>
            <div className="space-y-4">
                {dashboardData.recentOpenCapa.length > 0 ? dashboardData.recentOpenCapa.map((capa: CAPAReport) => {
                    const project = projects.find(p => p.id === capa.sourceProjectId);
                    const assignee = users.find(u => u.id === capa.assignedTo);
                    return (
                        <div key={capa.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50">
                            <div>
                                <p className="font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{capa.sourceStandardId}</p>
                                <p className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('inProject')} {project?.name}</p>
                            </div>
                             <div className="flex items-center gap-4 text-sm mt-2 sm:mt-0">
                                <span className={`font-semibold ${capa.type === 'Corrective' ? 'text-red-500' : 'text-blue-500'}`}>{t(capa.type.toLowerCase() as any)}</span>
                                <span>{t('assignedTo')}: {assignee?.name || t('unassigned')}</span>
                                <span className="text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('dueDate')}: {new Date(capa.dueDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )
                }) : (
                     <p className="text-center text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary py-6">{t('noOpenCapa')}</p>
                )}
            </div>
        </div>
    </div>
  );
};

export default DashboardPage;