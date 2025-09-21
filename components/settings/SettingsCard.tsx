import React from 'react';

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, description, children, footer }) => (
    <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-xl shadow-sm border border-brand-border dark:border-dark-brand-border">
      <div className="p-6 border-b border-brand-border dark:border-dark-brand-border">
        <h3 className="text-lg font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{title}</h3>
        <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{description}</p>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
      {footer && <div className="bg-slate-50 dark:bg-dark-brand-surface/50 px-6 py-4 rounded-b-xl flex justify-end">{footer}</div>}
    </div>
);

export default SettingsCard;