import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../common/ThemeProvider';

interface Props {
  projects: Project[];
}

const CapaStatusChart: React.FC<Props> = ({ projects }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const data = useMemo(() => {
    const allCapas = projects.flatMap(p => p.capaReports);
    const openCount = allCapas.filter(c => c.status === 'Open').length;
    const closedCount = allCapas.filter(c => c.status === 'Closed').length;
    return [{ name: t('open'), value: openCount }, { name: t('closed'), value: closedCount }];
  }, [projects, t]);
  
  const COLORS = { [t('open')]: '#F97316', [t('closed')]: '#22C55E' };
  const tooltipStyle = {
    borderRadius: '0.5rem',
    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(4px)',
    border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
  };

  return (
    <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-xl shadow-md border border-brand-border dark:border-dark-brand-border">
      <h3 className="text-lg font-semibold mb-4 text-brand-text-primary dark:text-dark-brand-text-primary">{t('capaStatusAnalysis')}</h3>
      {data.some(d => d.value > 0) ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} labelLine={false}>
              {data.map((entry) => <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      ) : <div className="flex items-center justify-center h-[300px]"><p className="text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('noDataAvailable')}</p></div>}
    </div>
  );
};

export default CapaStatusChart;