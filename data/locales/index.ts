import { en as en_common } from './en/common';
import { ar as ar_common } from './ar/common';
import { en as en_dashboard } from './en/dashboard';
import { ar as ar_dashboard } from './ar/dashboard';
import { en as en_analytics } from './en/analytics';
import { ar as ar_analytics } from './ar/analytics';
import { en as en_qualityInsights } from './en/qualityInsights';
import { ar as ar_qualityInsights } from './ar/qualityInsights';
import { en as en_calendar } from './en/calendar';
import { ar as ar_calendar } from './ar/calendar';
import { en as en_projects } from './en/projects';
import { ar as ar_projects } from './ar/projects';
import { en as en_documents } from './en/documents';
import { ar as ar_documents } from './ar/documents';
import { en as en_tasks } from './en/tasks';
import { ar as ar_tasks } from './ar/tasks';
import { en as en_risk } from './en/risk';
import { ar as ar_risk } from './ar/risk';
import { en as en_departments } from './en/departments';
import { ar as ar_departments } from './ar/departments';
import { en as en_training } from './en/training';
import { ar as ar_training } from './ar/training';
import { en as en_settings } from './en/settings';
import { ar as ar_settings } from './ar/settings';
import { en as en_onboarding } from './en/onboarding';
import { ar as ar_onboarding } from './ar/onboarding';
import { en as en_components } from './en/components';
import { ar as ar_components } from './ar/components';

export const locales = {
  en: {
    ...en_common,
    ...en_dashboard,
    ...en_analytics,
    ...en_qualityInsights,
    ...en_calendar,
    ...en_projects,
    ...en_documents,
    ...en_tasks,
    ...en_risk,
    ...en_departments,
    ...en_training,
    ...en_settings,
    ...en_onboarding,
    ...en_components
  },
  ar: {
    ...ar_common,
    ...ar_dashboard,
    ...ar_analytics,
    ...ar_qualityInsights,
    ...ar_calendar,
    ...ar_projects,
    ...ar_documents,
    ...ar_tasks,
    ...ar_risk,
    ...ar_departments,
    ...ar_training,
    ...ar_settings,
    ...ar_onboarding,
    ...ar_components
  },
};