import { ProjectStatus } from '../types';
import { locales } from '../data/locales';

export function getStatusTranslationKey(status: ProjectStatus): keyof typeof locales.en {
  const key = status.charAt(0).toLowerCase() + status.slice(1).replace(/\s/g, '');
  return key as keyof typeof locales.en;
}
