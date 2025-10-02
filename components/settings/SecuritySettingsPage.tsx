import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import SettingsCard from './SettingsCard';

const SecuritySettingsPage: React.FC = () => {
    const { t } = useTranslation();
    
    const labelClasses = "font-medium text-brand-text-primary dark:text-dark-brand-text-primary";
    const descriptionClasses = "text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary";

    return (
        <SettingsCard title={t('security')} description={t('securityDescription')}>
            <div className="divide-y divide-brand-border dark:divide-dark-brand-border">
                <div className="py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={labelClasses}>{t('twoFactorAuth')}</p>
                            <p className={descriptionClasses}>{t('twoFactorAuthDescription')}</p>
                        </div>
                        <label htmlFor="2fa-toggle" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" id="2fa-toggle" className="sr-only" />
                                <div className="block bg-gray-200 dark:bg-gray-600 w-14 h-8 rounded-full"></div>
                                <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                            </div>
                        </label>
                    </div>
                </div>
                 <div className="py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={labelClasses}>{t('granularPermissions')}</p>
                            <p className={descriptionClasses}>{t('granularPermissionsDescription')}</p>
                        </div>
                        <button disabled className="text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed">
                            Manage Roles
                        </button>
                    </div>
                </div>
            </div>
             <style>{`
                input:checked ~ .dot {
                    transform: translateX(100%);
                    background-color: #4f46e5;
                }
                input:checked ~ .block {
                    background-color: #a5b4fc;
                }
            `}</style>
        </SettingsCard>
    );
};

export default SecuritySettingsPage;
