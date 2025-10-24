import React, { useState, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { CalendarDaysIcon } from '../components/icons';
import { CalendarView, CustomCalendarEvent, UnifiedEvent } from '../types';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import AgendaView from '../components/calendar/AgendaView';
import YearView from '../components/calendar/YearView';
import EventModal from '../components/calendar/EventModal';
import DayDetailModal from '../components/calendar/DayDetailModal';
import { useUnifiedEvents } from '../hooks/useUnifiedEvents';

interface CalendarPageProps {
    customEvents: CustomCalendarEvent[];
    onAddEvent: (event: Omit<CustomCalendarEvent, 'id' | 'type'>) => void;
    onUpdateEvent: (event: CustomCalendarEvent) => void;
    onDeleteEvent: (id: string) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = (props) => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [eventToEdit, setEventToEdit] = useState<CustomCalendarEvent | null>(null);

    const allEvents = useUnifiedEvents();
    
    const handleAddEvent = () => {
        setEventToEdit(null);
        setIsDayDetailOpen(false);
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = (event: Omit<CustomCalendarEvent, 'id' | 'type'>, id?: string) => {
        if (id) {
            props.onUpdateEvent({ ...event, id, type: 'Custom' });
        } else {
            props.onAddEvent(event);
        }
        setIsEventModalOpen(false);
    };

    const handleDeleteEvent = (id: string) => {
        if (window.confirm(t('areYouSureDeleteEvent'))) {
            props.onDeleteEvent(id);
            setIsEventModalOpen(false);
        }
    };

    const handleDayClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        setIsDayDetailOpen(true);
    };
    
    const handleEventClick = (event: UnifiedEvent) => {
        if (event.type === 'Custom') {
            // FIX: Safely find the original CustomCalendarEvent instead of unsafe casting
            const originalEvent = props.customEvents.find(e => e.id === event.id);
            if (originalEvent) {
                setEventToEdit(originalEvent);
                setIsEventModalOpen(true);
            }
        }
        // Could add navigation for other event types here
    };

    const dayDetailEvents = useMemo(() => allEvents.filter(e => new Date(e.date).toDateString() === selectedDate.toDateString()), [allEvents, selectedDate]);

    const renderView = () => {
        switch (view) {
            case 'month':
                return <CalendarGrid currentDate={currentDate} events={allEvents} onDayClick={handleDayClick} onEventClick={handleEventClick} />;
            case 'agenda':
                return <AgendaView currentDate={currentDate} events={allEvents} onEventClick={handleEventClick} />;
            case 'year':
                return <YearView currentDate={currentDate} events={allEvents} setCurrentDate={setCurrentDate} setView={setView} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                <CalendarDaysIcon className="h-8 w-8 text-brand-primary" />
                <div>
                    {/* FIX: Cast translation key to any */}
                    <h1 className="text-3xl font-bold">{t('complianceCalendar' as any)}</h1>
                </div>
            </div>
            <div className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-lg shadow-sm border border-brand-border dark:border-dark-brand-border">
                <CalendarHeader 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate}
                    view={view}
                    setView={setView}
                    onAddEvent={handleAddEvent}
                />
                <div className="mt-4">
                    {renderView()}
                </div>
            </div>

            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                selectedDate={selectedDate}
                eventToEdit={eventToEdit}
            />

            <DayDetailModal 
                isOpen={isDayDetailOpen}
                onClose={() => setIsDayDetailOpen(false)}
                date={selectedDate}
                events={dayDetailEvents}
                onAddEvent={handleAddEvent}
                onEventClick={handleEventClick}
            />
        </div>
    );
};

export default CalendarPage;
