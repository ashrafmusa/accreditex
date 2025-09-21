import React from 'react';
import { CertificateData } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { LogoIcon } from '@/components/icons';

interface CertificatePageProps {
  certificate: CertificateData;
}

const CertificatePage: React.FC<CertificatePageProps> = ({ certificate }) => {
  const { t, lang, dir } = useTranslation();

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-wrapper, #certificate-wrapper * {
            visibility: visible;
          }
          #certificate-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="bg-gray-200 dark:bg-gray-900 min-h-screen flex flex-col justify-center items-center p-4 print:p-0 print:bg-white" dir={dir}>
        <div id="certificate-wrapper" className="w-full max-w-4xl bg-white dark:bg-dark-brand-surface shadow-2xl">
          <div className="p-10 border-8 border-indigo-200 dark:border-indigo-900 m-4 relative">
            <div className="text-center">
              <LogoIcon className="h-16 w-16 mx-auto" />
              <h1 className="text-4xl font-bold text-brand-primary mt-4 tracking-wider">{t('certificateOfCompletion')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-6 text-lg">{t('thisCertifiesThat')}</p>
              <h2 className="text-3xl font-serif font-semibold text-gray-800 dark:text-gray-200 my-4 border-b-2 border-gray-300 pb-2 inline-block">
                {certificate.userName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">{t('hasSuccessfullyCompleted')}</p>
              <p className="text-2xl font-semibold text-brand-primary my-3">
                "{certificate.trainingTitle[lang]}"
              </p>
            </div>
            <div className="mt-12 flex justify-between items-end">
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-gray-400 pb-1">{t('dateOfCompletion')}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{new Date(certificate.completionDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-center">
                 <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-gray-400 pb-1">{t('issuingAuthority')}</p>
                 <p className="text-gray-600 dark:text-gray-400 mt-1 font-serif">AccreditEx</p>
              </div>
            </div>
             <p className="text-xs text-gray-400 dark:text-gray-600 absolute bottom-2 right-2">{t('certificateId')}: {certificate.id}</p>
          </div>
        </div>
         <div className="mt-6 no-print">
            <button onClick={() => window.print()} className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold">
              {t('printCertificate')}
            </button>
        </div>
      </div>
    </>
  );
};

export default CertificatePage;