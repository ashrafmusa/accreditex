import React, { useState, useMemo, FC } from 'react';
import { Project, AppDocument, CustomCalendarEvent, NavigationState, Language, CAPAReport } from '@/types';
import { useTranslation } from '../hooks/useTranslation';
import { CalendarDaysIcon, PlusIcon } from '../components/icons';
import EventModal from '../components/calendar/EventModal';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import DayDetailModal from '../components/calendar/DayDetailModal';
import { useProjectStore } from '../stores/useProjectStore';
import { useAppStore } from '../stores/useAppStore';

export type CalendarEventType = 'Project' | 'Survey' | 'Document' | 'Custom' | 'CAPA';

export interface UnifiedEvent {
  id: string;
  date: string;
  title: string;
  type: CalendarEventType;
  description?: string;
  link?: () => void;
  color: string;
  rawEvent: Project | AppDocument | CustomCalendarEvent | CAPAReport;
}

interface CalendarPageProps {
  setNavigation: (state: NavigationState) => void;
}

const CalendarPage: FC<CalendarPageProps> = ({ setNavigation }) => {
  const { t, lang } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CustomCalendarEvent | null>(null);
  
  const projects = useProjectStore(state => state.projects);
  const { documents, customEvents, addCustomEvent, updateCustomEvent, deleteCustomEvent } = useAppStore();

  const [filters, setFilters] = useState<Record<CalendarEventType, boolean>>({
    Project: true, Survey: true, Document: true, Custom: true, CAPA: true
  });
  
  const allEvents: UnifiedEvent[] = useMemo(() => {
    const projectEvents = projects.flatMap(p => ([
        { id: `${p.id}-start`, date: p.startDate, title: `${t('projectStart')}: ${p.name}`, type: 'Project' as CalendarEventType, color: 'bg-blue-500', link: () => setNavigation({ view: 'projectDetail', projectId: p.id }), rawEvent: p },
        ...(p.endDate ? [{ id: `${p.id}-end`, date: p.endDate, title: `${t('projectEnd')}: ${p.name}`, type: 'Project' as CalendarEventType, color: 'bg-blue-800', link: () => setNavigation({ view: 'projectDetail', projectId: p.id }), rawEvent: p }] : []),
        ...p.mockSurveys.map(s => ({ id: s.id, date: s.date, title: `${t('mockSurvey')}: ${p.name}`, type: 'Survey' as CalendarEventType, color: 'bg-orange-500', link: () => setNavigation({ view: 'surveyReport', projectId: p.id, surveyId: s.id }), rawEvent: p }))
    ]));
    
    const documentEvents = documents.filter(d => d.reviewDate).map(d => ({
        id: d.id, date: d.reviewDate!, title: `${t('documentReview')}: ${d.name[lang as Language]}`, type: 'Document' as CalendarEventType, color: 'bg-purple-500', rawEvent: d
    }));
    
    const customCalendarEvents = customEvents.map(e => ({
        id: e.id, date: e.date, title: e.title[lang as Language], description: e.description?.[lang as Language], type: 'Custom' as CalendarEventType, color: 'bg-gray-500', rawEvent: e
    }));
    
    const capaEvents = projects.flatMap(p => p.capaReports.filter(c => c.status === 'Open').map(c => ({
        id: c.id, date: c.dueDate, title: `CAPA: ${c.sourceStandardId}`, type: 'CAPA' as CalendarEventType, color: 'bg-red-500', link: () => setNavigation({ view: 'risk' }), rawEvent: c
    })));

    return [...projectEvents, ...documentEvents, ...customCalendarEvents, ...capaEvents];
  }, [projects, documents, customEvents, t, lang, setNavigation]);

  const filteredEvents = useMemo(() => allEvents.filter(event => filters[event.type]), [allEvents, filters]);

  const handleOpenCreateModal = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setEditingEvent(null);
    setIsEventModalOpen(true);
  }

  const handleOpenEditModal = (event: CustomCalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
    setIsEventModalOpen(true);
  }

  const handleOpenDayModal = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setIsDayModalOpen(true);
  }

  const handleSaveEvent = (data: Omit<CustomCalendarEvent, 'id'|'type'>, id?: string) => {
    if (id) {
        updateCustomEvent({ ...data, id, type: 'Custom' });
    } else {
        addCustomEvent(data);
    }
    setIsEventModalOpen(false);
  }
  
  const handleDelete = (id: string) => {
      deleteCustomEvent(id);
      setIsEventModalOpen(false);
  }
  
  const eventsForDayModal = selectedDate ? filteredEvents.filter(e => new Date(e.date).toDateString() === selectedDate.toDateString()) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
          <CalendarDaysIcon className="h-8 w-8 text-brand-primary" />
          <div>
            <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('complianceCalendar')}</h1>
            <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('calendarHubDescription')}</p>
          </div>
        </div>
        <button onClick={() => handleOpenCreateModal(new Date().getDate())} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-semibold shadow-sm w-full md:w-auto">
            <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('createEvent')}
        </button>
      </div>

      <CalendarHeader filters={filters} onFilterChange={setFilters} currentDate={currentDate} setCurrentDate={setCurrentDate} />

      <div className="bg-brand-surface dark:bg-dark-brand-surface p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
          <CalendarGrid 
            currentDate={currentDate}
            events={filteredEvents}
            onDayClick={handleOpenDayModal}
            onEventClick={(event) => {
              if (event.type === 'Custom') {
                handleOpenEditModal(event.rawEvent as CustomCalendarEvent);
              } else if (event.link) {
                event.link();
              }
            }}
          />
      </div>
      
      {isEventModalOpen && selectedDate && (
        <EventModal 
            isOpen={isEventModalOpen} 
            onClose={() => setIsEventModalOpen(false)} 
            onSave={handleSaveEvent}
            onDelete={handleDelete}
            selectedDate={selectedDate}
            eventToEdit={editingEvent}
        />
      )}

      {isDayModalOpen && selectedDate && (
        <DayDetailModal
            isOpen={isDayModalOpen}
            onClose={() => setIsDayModalOpen(false)}
            date={selectedDate}
            events={eventsForDayModal}
        />
      )}

    </div>
  );
};

export default CalendarPage;
