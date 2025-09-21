
import React, { useState, useMemo, useEffect } from 'react';
import { Project, User, UserRole, NavigationState, AccreditationProgram } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUserStore } from '@/stores/useUserStore';
import { useAppStore } from '@/stores/useAppStore';

interface CreateProjectPageProps {
  setNavigation: (state: NavigationState) => void;
  navigation: NavigationState;
}

const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ setNavigation, navigation }) => {
  const { t } = useTranslation();
  const isEditMode = navigation.view === 'editProject';

  const { projects, addProject, updateProject } = useProjectStore();
  const { users } = useUserStore();
  const { accreditationPrograms: programs } = useAppStore();

  const projectToEdit = isEditMode ? projects.find(p => p.id === (navigation as any).projectId) : undefined;

  const [name, setName] = useState('');
  const [programId, setProgramId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leadId, setLeadId] = useState('');
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    if (isEditMode && projectToEdit) {
      setName(projectToEdit.name);
      setProgramId(projectToEdit.programId);
      setStartDate(projectToEdit.startDate);
      setEndDate(projectToEdit.endDate || '');
      setLeadId(projectToEdit.projectLead.id);
      setDescription(projectToEdit.description || '');
    }
  }, [isEditMode, projectToEdit]);

  const projectLeads = useMemo(() => 
    users.filter(user => user.role === UserRole.ProjectLead || user.role === UserRole.Admin), 
  [users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !programId || !startDate) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (isEditMode && projectToEdit) {
      const lead = users.find(u => u.id === leadId);
      if (!lead) return;
      const updatedProjectData: Project = { ...projectToEdit, name, programId, startDate, endDate: endDate || null, description, projectLead: lead, };
      updateProject(updatedProjectData);
    } else {
      addProject({
        name,
        programId,
        startDate,
        endDate: endDate || null,
        description,
        leadId: leadId,
      });
    }
  };

  const inputClasses = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-brand-surface dark:bg-dark-brand-surface p-8 rounded-lg shadow-md space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{isEditMode ? t('editProject') : t('createNewProject')}</h2>
          <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{isEditMode ? t('editProjectDescription') : t('projectInformationDescription')}</p>
        </div>
        
        <div className="border-t border-gray-200 dark:border-dark-brand-border pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="projectName" className={labelClasses}>{t('projectName')}</label>
              <input type="text" id="projectName" value={name} onChange={e => setName(e.target.value)} required className={inputClasses} />
            </div>

            <div>
              <label htmlFor="program" className={labelClasses}>{t('accreditationProgram')}</label>
              <select id="program" value={programId} onChange={e => setProgramId(e.target.value)} required className={inputClasses}>
                <option value="">{t('selectAProgram')}</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="projectLead" className={labelClasses}>{t('projectLead')}</label>
              <select id="projectLead" value={leadId} onChange={e => setLeadId(e.target.value)} required className={inputClasses}>
                <option value="">{t('selectALead')}</option>
                {projectLeads.map(user => (<option key={user.id} value={user.id}>{user.name}</option>))}
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className={labelClasses}>{t('startDate')}</label>
              <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className={inputClasses}/>
            </div>

            <div>
              <label htmlFor="endDate" className={labelClasses}>{t('endDateOptional')}</label>
              <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} className={inputClasses} />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className={labelClasses}>{t('descriptionOptional')}</label>
              <textarea id="description" rows={4} value={description} onChange={e => setDescription(e.target.value)} className={inputClasses} />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 rtl:space-x-reverse">
          <button type="button" onClick={() => setNavigation({ view: 'projects' })} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
            {t('cancel')}
          </button>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
            {isEditMode ? t('saveChanges') : t('createProject')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;