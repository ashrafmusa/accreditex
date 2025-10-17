import React, { useState, FC, ReactNode } from 'react';
import { ChevronDownIcon } from '../icons';

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  defaultOpen?: boolean;
}

const SettingsCard: FC<SettingsCardProps> = ({ title, description, children, footer, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-xl shadow-sm border border-brand-border dark:border-dark-brand-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex justify-between items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{title}</h3>
          <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{description}</p>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <div className="p-6 space-y-4 border-t border-brand-border dark:border-dark-brand-border">
            {children}
          </div>
          {footer && (
            <div className="bg-slate-50 dark:bg-dark-brand-surface/50 px-6 py-4 flex justify-end border-t border-brand-border dark:border-dark-brand-border">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsCard;