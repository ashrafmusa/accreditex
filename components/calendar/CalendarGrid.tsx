

import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { PlusIcon, FolderIcon, ClipboardDocumentSearchIcon, DocumentTextIcon, ExclamationTriangleIcon, CalendarDaysIcon } from '../icons';
import { UnifiedEvent, CalendarEventType } from '../../pages/CalendarPage';

interface Props {
  currentDate: Date;
  events: UnifiedEvent[];
  onDayClick: (day: number) => void;
  onEventClick: (event: UnifiedEvent) => void;
}

const getIconForType = (type: CalendarEventType) => {
    switch(type) {
        case 'Project': return FolderIcon;
        case 'Survey': return ClipboardDocumentSearchIcon;
        case 'Document': return DocumentTextIcon;
        case 'CAPA': return ExclamationTriangleIcon;
        case 'Custom': return CalendarDaysIcon;
        default: return CalendarDaysIcon;
    }
}

const CalendarGrid: React.FC<Props> = ({ currentDate, events, onDayClick, onEventClick }) => {
  const { lang } = useTranslation();
  
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const daysOfWeek = lang === 'ar' 
    ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(day => <div key={day} className="text-center font-semibold text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary py-2">{day}</div>)}
        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="border rounded-md dark:border-dark-brand-border bg-gray-50 dark:bg-gray-900/50"></div>)}
        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
            const day = dayIndex + 1;
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = dayDate.toDateString() === new Date().toDateString();
            const dayEvents = events.filter(e => new Date(e.date).toDateString() === dayDate.toDateString());
            return (
              <button key={day} onClick={() => onDayClick(day)} className="border rounded-md dark:border-dark-brand-border p-1.5 min-h-[120px] flex flex-col relative group bg-white dark:bg-dark-brand-surface hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-left align-top focus:outline-none focus:ring-2 focus:ring-brand-primary z-0 hover:z-10">
                  <time dateTime={dayDate.toISOString()} className={`font-semibold text-xs sm:text-sm ${isToday ? 'bg-brand-primary text-white rounded-full flex items-center justify-center h-6 w-6' : ''}`}>{day}</time>
                  <div className="mt-1 space-y-1 flex-grow overflow-y-auto">
                     {dayEvents.slice(0, 3).map(event => {
                         const Icon = getIconForType(event.type);
                         return (
                            <div key={event.id} onClick={e => { e.stopPropagation(); onEventClick(event); }} className={`text-white text-[10px] sm:text-xs p-1 rounded-md ${event.color} truncate flex items-center gap-1 cursor-pointer`}>
                                <Icon className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{event.title}</span>
                            </div>
                         )
                     })}
                     {dayEvents.length > 3 && <div className="text-xs text-center text-gray-500">+{dayEvents.length - 3} more</div>}
                  </div>
              </button>
            )
        })}
    </div>
  );
};

export default CalendarGrid;