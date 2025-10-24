import React, { useState } from 'react';
// FIX: Import ProjectStatus enum
import { AccreditationProgram, User, Project, NavigationState, ProjectStatus } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { FolderIcon } from '../components/icons';
import { useToast } from '../hooks/useToast';
import { labelClasses, inputClasses } from '../components/ui/constants';
import DatePicker from '../components/ui/DatePicker';

interface CreateProjectPageProps {
  programs: AccreditationProgram[];
  users: User[];
  onAddProject: (projectData: Omit<Project, 'id' | 'progress' | 'checklist' | 'activityLog' | 'mockSurveys' | 'capaReports' | 'designControls'>) => void;
  setNavigation: (state: NavigationState) => void;
}

const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ programs, users, onAddProject, setNavigation }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [programId, setProgramId] = useState('');
  const [projectLeadId, setProjectLeadId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectLead = users.find(u => u.id === projectLeadId);
    if (!name || !programId || !projectLead || !startDate) {
        toast.error(t('pleaseFillRequired'));
        return;
    }

    onAddProject({
        name,
        description,
        programId,
        projectLead,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        // FIX: Use ProjectStatus enum instead of raw string
        status: ProjectStatus.NotStarted,
    });
    
    toast.success(t('projectCreatedSuccess'));
    setNavigation({ view: 'projects' });
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 rtl:space-x-reverse self-start mb-6">
          <FolderIcon className="h-8 w-8 text-brand-primary" />
          <div>
            <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('createNewProject')}</h1>
            <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('createProjectDescription')}</p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-brand-surface dark:bg-dark-brand-surface p-8 rounded-lg shadow-md border border-brand-border dark:border-dark-brand-border">
        <div>
          <label htmlFor="name" className={labelClasses}>{t('projectName')}</label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
        </div>

        <div>
          <label htmlFor="description" className={labelClasses}>{t('projectDescription')}</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClasses} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label htmlFor="program" className={labelClasses}>{t('accreditationProgram')}</label>
            <select id="program" value={programId} onChange={e => setProgramId(e.target.value)} className={inputClasses} required>
                <option value="">{t('selectProgram')}</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            </div>

            <div>
            <label htmlFor="lead" className={labelClasses}>{t('projectLead')}</label>
            <select id="lead" value={projectLeadId} onChange={e => setProjectLeadId(e.target.value)} className={inputClasses} required>
                <option value="">{t('selectUser')}</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="startDate" className={labelClasses}>{t('startDate')}</label>
                <DatePicker date={startDate} setDate={setStartDate} />
            </div>
            <div>
                <label htmlFor="endDate" className={labelClasses}>{t('targetEndDate')}</label>
                <DatePicker date={endDate} setDate={setEndDate} fromDate={startDate} />
            </div>
        </div>

        <div className="pt-5 border-t border-brand-border dark:border-dark-brand-border">
          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <button type="button" onClick={() => setNavigation({ view: 'projects' })} className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600">
              {t('cancel')}
            </button>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">
              {t('createProject')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;
