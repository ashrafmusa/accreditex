import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { CircleStackIcon, ShareIcon } from '../components/icons';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto">
        <code className="font-mono text-indigo-600 dark:text-indigo-300">{children}</code>
    </pre>
);

const DataHubPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
        <CircleStackIcon className="h-8 w-8 text-brand-primary" />
        <div>
          <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('dataHub')}</h1>
          <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('dataHubDescription')}</p>
        </div>
      </div>
      
      <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
        <h2 className="text-xl font-semibold text-brand-text-primary dark:text-dark-brand-text-primary flex items-center gap-2"><ShareIcon className="w-6 h-6 text-brand-primary" />{t('integrationStrategy')}</h2>
        <p className="mt-2 text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('integrationStrategyDescription')}</p>
      </div>
      
      <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
        <h3 className="text-lg font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{t('fhirFoundation')}</h3>
        <p className="mt-2 text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('fhirFoundationDescription')}</p>
        <p className="mt-4 font-semibold text-sm">{t('exampleResource')}</p>
        <CodeBlock>
{`{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "text": "Hand Hygiene Compliance"
  },
  "valueQuantity": {
    "value": 98,
    "unit": "%",
    "system": "http://unitsofmeasure.org"
  }
}`}
        </CodeBlock>
      </div>

      <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
        <h3 className="text-lg font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{t('apiArchitecture')}</h3>
        <p className="mt-2 text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('apiArchitectureDescription')}</p>
        <p className="mt-4 font-semibold text-sm">{t('exampleApiCall')}</p>
        <CodeBlock>
{`POST /api/v1/fhir/Observation
Host: api.accreditex.com
Authorization: Bearer <YOUR_API_KEY>

{ ... (FHIR Observation Resource) }`}
        </CodeBlock>
      </div>
    </div>
  );
};

export default DataHubPage;