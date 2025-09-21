

import React, { useMemo } from 'react';
import { ChecklistItem, ComplianceStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  checklistItems: ChecklistItem[];
}

const ProblematicStandardsTable: React.FC<Props> = ({ checklistItems }) => {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const failureCounts = checklistItems
      .filter(item => item.status === ComplianceStatus.NonCompliant || item.status === ComplianceStatus.PartiallyCompliant)
      .reduce((acc: Record<string, number>, item) => {
        acc[item.standardId] = (acc[item.standardId] || 0) + 1;
        return acc;
      }, {});
      
    return Object.entries(failureCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([id, count]) => ({ standard: id, count }));
  }, [checklistItems]);

  const maxFailures = Math.max(...data.map(item => item.count), 0);

  return (
    <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-xl shadow-md border border-brand-border dark:border-dark-brand-border">
      <div className="p-6 border-b dark:border-dark-brand-border">
        <h3 className="text-lg font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{t('top5ProblematicStandards')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50/50 dark:bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('standard')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right w-2/5">{t('failureCount')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
            {data.map((item) => (
              <tr key={item.standard}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.standard}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-red-600 w-8">{item.count}</span>
                    <div className="w-full bg-red-100 dark:bg-red-900/30 rounded-full h-2.5">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${maxFailures > 0 ? (item.count / maxFailures) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
             {data.length === 0 && (
              <tr>
                  <td colSpan={2} className="text-center py-8 text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('noDataAvailable')}</td>
              </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProblematicStandardsTable;