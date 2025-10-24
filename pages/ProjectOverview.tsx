import React, { useMemo } from 'react';
import { Project, ComplianceStatus } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import StatCard from '../components/common/StatCard';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, ClockIcon } from '../components/icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../components/common/ThemeProvider';

interface ProjectOverviewProps {
  project: Project;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();

    const stats = useMemo(() => {
        const total = project.checklist.length;
        const compliant = project.checklist.filter(c => c.status === ComplianceStatus.Compliant).length;
        const nonCompliant = project.checklist.filter(c => c.status === ComplianceStatus.NonCompliant).length;
        const partial = project.checklist.filter(c => c.status === ComplianceStatus.PartiallyCompliant).length;
        const notStarted = project.checklist.filter(c => c.status !== ComplianceStatus.Compliant && c.status !== ComplianceStatus.PartiallyCompliant && c.status !== ComplianceStatus.NonCompliant && c.status !== ComplianceStatus.NotApplicable).length;

        return { total, compliant, nonCompliant, partial, notStarted };
    }, [project.checklist]);

    const chartData = [
        { name: t('compliant'), value: stats.compliant, color: '#22c55e' },
        { name: t('partiallyCompliant'), value: stats.partial, color: '#f97316' },
        { name: t('nonCompliant'), value: stats.nonCompliant, color: '#ef4444' },
    ];
    
    const tooltipStyle = {
        borderRadius: '0.5rem',
        background: theme === 'dark' ? '#0f172a' : '#FFFFFF',
        border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
      };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('compliant')} value={stats.compliant} icon={CheckCircleIcon} color="bg-green-500" />
                <StatCard title={t('partiallyCompliant')} value={stats.partial} icon={MinusCircleIcon} color="bg-yellow-500" />
                <StatCard title={t('nonCompliant')} value={stats.nonCompliant} icon={XCircleIcon} color="bg-red-500" />
                {/* FIX: Cast translation key to any */}
                <StatCard title={t('daysRemaining' as any)} value={'N/A'} icon={ClockIcon} color="bg-gray-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg shadow-sm border border-brand-border dark:border-dark-brand-border h-80">
                    {/* FIX: Cast translation key to any */}
                    <h3 className="text-lg font-semibold mb-4">{t('taskStatus' as any)}</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5}>
                                {chartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg shadow-sm border border-brand-border dark:border-dark-brand-border">
                    {/* FIX: Cast translation key to any */}
                    <h3 className="text-lg font-semibold mb-4">{t('recentActivity' as any)}</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                        {project.activityLog.slice(0, 10).map(log => (
                            <div key={log.id} className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold text-xs">{log.user.charAt(0)}</div>
                                <div>
                                    <p><span className="font-semibold">{log.user}</span> {log.action.en}</p>
                                    <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectOverview;