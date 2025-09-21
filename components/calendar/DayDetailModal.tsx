

import React, { FC } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { UnifiedEvent } from '../../pages/CalendarPage';
import { FolderIcon, ClipboardDocumentSearchIcon, DocumentTextIcon, ExclamationTriangleIcon, CalendarDaysIcon } from '../icons';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: UnifiedEvent[];
}

const ICON_MAP = {
    Project: FolderIcon,
    Survey: ClipboardDocumentSearchIcon,
    Document: DocumentTextIcon,
    CAPA: ExclamationTriangleIcon,
    Custom: CalendarDaysIcon
};

const DayDetailModal: FC<DayDetailModalProps> = ({ isOpen, onClose, date, events }) => {
  const { t, dir, lang } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm modal-enter" onClick={onClose}>
      <div className="bg-white dark:bg-dark-brand-surface rounded-lg shadow-xl w-full max-w-lg m-4 modal-content-enter" onClick={e => e.stopPropagation()} dir={dir}>
        <div className="p-6 border-b dark:border-dark-brand-border">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">{t('dayDetails')}</h3>
          <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">
            {date.toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          {events.length > 0 ? (
            <ul className="space-y-3">
              {events.map(event => {
                const Icon = ICON_MAP[event.type];
                return (
                  <li key={event.id} className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className={`p-2 rounded-full ${event.color} text-white mt-1`}><Icon className="w-5 h-5" /></div>
                    <div>
                      <p className="font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{event.title}</p>
                      {event.description && <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{event.description}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">{t('noEventsFound')}</p>
          )}
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 flex justify-end">
          <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md text-sm">{t('cancel')}</button>
        </div>
      </div>
    </div>
  );
};

export default DayDetailModal;