
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { CalendarEventType } from '../../pages/CalendarPage';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';

interface Props {
  filters: Record<CalendarEventType, boolean>;
  onFilterChange: React.Dispatch<React.SetStateAction<Record<CalendarEventType, boolean>>>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

const FilterToggle: React.FC<{
    type: CalendarEventType;
    label: string;
    color: string;
    isChecked: boolean;
    onChange: (type: CalendarEventType) => void;
}> = ({ type, label, color, isChecked, onChange }) => (
    <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm cursor-pointer">
        <input 
            type="checkbox" 
            checked={isChecked} 
            onChange={() => onChange(type)} 
            className={`form-checkbox rounded h-4 w-4 text-${color}-600 focus:ring-${color}-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900`}
        />
        <span className={`font-medium ${isChecked ? 'text-brand-text-primary dark:text-dark-brand-text-primary' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
    </label>
);

const CalendarHeader: React.FC<Props> = ({ filters, onFilterChange, currentDate, setCurrentDate }) => {
  const { t, lang } = useTranslation();
  
  const handleFilterChange = (type: CalendarEventType) => {
    onFilterChange(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  }
  
  const filterOptions: { type: CalendarEventType; color: string; label: string; }[] = [
    { type: 'Project', color: 'blue', label: t('projectEvents') },
    { type: 'Survey', color: 'orange', label: t('surveyEvents') },
    { type: 'Document', color: 'purple', label: t('documentEvents') },
    { type: 'CAPA', color: 'red', label: t('capaEvents') },
    { type: 'Custom', color: 'gray', label: t('customEvents') },
  ];

  return (
    <div className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-6 h-6"/></button>
            <h2 className="text-xl font-semibold w-48 text-center">{currentDate.toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-US', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon className="w-6 h-6"/></button>
        </div>
        <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">{t('today')}</button>
      </div>
      <div className="border-t dark:border-dark-brand-border pt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
      {filterOptions.map(opt => (
        <FilterToggle 
            key={opt.type}
            type={opt.type}
            label={opt.label}
            color={opt.color}
            isChecked={filters[opt.type]}
            onChange={handleFilterChange}
        />
      ))}
    </div>
    </div>
  );
};

export default CalendarHeader;