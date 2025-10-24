import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { CircleStackIcon } from '../components/icons';
import ApiStatusWidget from '../components/data-hub/ApiStatusWidget';
import LiveDataFeed from '../components/data-hub/LiveDataFeed';
import Collapsible from '../components/ui/Collapsible';

const CodeBlock: React.FC<{ code: string; lang: string }> = ({ code, lang }) => (
    <pre className="bg-slate-800 text-white p-4 rounded-lg text-xs overflow-x-auto">
        <code className={`language-${lang}`}>{code}</code>
    </pre>
);

const DataHubPage: React.FC = () => {
    const { t } = useTranslation();

    const fhirExample = `{
  "resourceType": "Observation",
  "status": "final",
  "code": { "text": "Hand Hygiene Compliance" },
  "valueInteger": 98,
  "subject": { "reference": "Practitioner/user-3" }
}`;

    const apiExample = `POST /api/v1/evidence
Authorization: Bearer <YOUR_API_TOKEN>

{
  "checklistItemId": "cl-1-1a",
  "sourceSystem": "EHR-Interface-1",
  "evidence": {
    "resourceType": "MeasureReport",
    "status": "complete",
    "measure": "http://accreditation.org/Measure/hand-hygiene",
    "value": "98.5"
  }
}`;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                <CircleStackIcon className="h-8 w-8 text-brand-primary" />
                <div>
                    <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('dataHub')}</h1>
                    <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('dataHubDescription')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ApiStatusWidget />
                <LiveDataFeed />
            </div>

            <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-xl shadow-md border border-brand-border dark:border-dark-brand-border">
                <h3 className="text-lg font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{t('integrationStrategy')}</h3>
                <p className="mt-1 text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('integrationStrategyDescription')}</p>
                <div className="mt-4 space-y-4">
                    <Collapsible title={t('fhirFoundation')}>
                        <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary mb-4">{t('fhirFoundationDescription')}</p>
                        <p className="text-xs font-semibold mb-2">{t('exampleResource')}</p>
                        <CodeBlock code={fhirExample} lang="json" />
                    </Collapsible>
                    <Collapsible title={t('apiArchitecture')}>
                        <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary mb-4">{t('apiArchitectureDescription')}</p>
                        <p className="text-xs font-semibold mb-2">{t('exampleApiCall')}</p>
                        <CodeBlock code={apiExample} lang="http" />
                    </Collapsible>
                </div>
            </div>
        </div>
    );
};

export default DataHubPage;