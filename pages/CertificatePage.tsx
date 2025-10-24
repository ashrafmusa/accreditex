import React from 'react';
import { CertificateData } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { CheckBadgeIcon, LogoIcon } from '../components/icons';
import { useAppStore } from '../stores/useAppStore';

interface CertificatePageProps {
  certificate: CertificateData;
}

const CertificatePage: React.FC<CertificatePageProps> = ({ certificate }) => {
  const { t, lang } = useTranslation();
  const { appSettings } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto bg-brand-surface dark:bg-dark-brand-surface p-4">
      <div className="border-4 border-brand-primary dark:border-indigo-400 p-8 rounded-lg relative text-center shadow-2xl bg-white dark:bg-slate-800">
        <div className="absolute top-8 left-8">
            {appSettings?.logoUrl ? <img src={appSettings.logoUrl} alt="Logo" className="h-12"/> : <LogoIcon className="h-12 w-12 text-brand-primary"/>}
        </div>

        <CheckBadgeIcon className="w-24 h-24 text-green-500 mx-auto" />
        
        <h1 className="text-3xl font-bold uppercase tracking-widest text-brand-text-primary dark:text-dark-brand-text-primary mt-6">{t('certificateOfCompletion')}</h1>
        
        <p className="text-lg text-brand-text-secondary dark:text-dark-brand-text-secondary mt-8">{t('thisCertifiesThat')}</p>
        
        <p className="text-4xl font-handwriting font-bold text-brand-primary my-4">{certificate.userName}</p>
        
        <p className="text-lg text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('hasSuccessfullyCompleted')}</p>
        
        <p className="text-2xl font-semibold text-brand-text-primary dark:text-dark-brand-text-primary mt-2">"{certificate.trainingTitle[lang]}"</p>
        
        <div className="mt-12 flex justify-around items-center">
            <div>
                <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary uppercase tracking-wider">{t('on')}</p>
                <p className="font-semibold text-brand-text-primary dark:text-dark-brand-text-primary border-t-2 pt-1 mt-1">{new Date(certificate.completionDate).toLocaleDateString()}</p>
            </div>
            <div>
                <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary uppercase tracking-wider">{t('withAScoreOf')}</p>
                <p className="font-semibold text-brand-text-primary dark:text-dark-brand-text-primary border-t-2 pt-1 mt-1">{certificate.score}%</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
