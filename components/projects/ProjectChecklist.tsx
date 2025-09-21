import React, { useState, useMemo } from 'react';
import { Project, User, ChecklistItem, AppDocument, Department, Standard, ComplianceStatus } from '@/types';
import ChecklistItemComponent from '@/components/projects/ChecklistItemComponent';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchIcon, ChevronDownIcon } from '@/components/icons';

interface ProjectChecklistProps {
  project: Project;
  users: User[];
  documents: AppDocument[];
  departments: Department[];
  standards: Standard[];
  currentUser: User;
  isFinalized: boolean;
  onUpdateProject: (updatedProject: Project) => void;
  onAddComment: (projectId: string, checklistItemId: string, text: string) => void;
  onCreateCapa: (item: ChecklistItem) => void;
  programName: string;
  onUploadEvidence: (checklistItemId: string, docData: { name: { en: string; ar: string }, uploadedFile: { name: string, type: string }}) => void;
}

const StandardAccordionGroup: React.FC<{
  parentStandard: Standard;
  items: ChecklistItem[];
  users: User[];
  documents: AppDocument[];
  departments: Department[];
  currentUser: User;
  isFinalized: boolean;
  onUpdate: (item: ChecklistItem) => void;
  onAddComment: (itemId: string, text: string) => void;
  onCreateCapa: (item: ChecklistItem) => void;
  programName: string;
  onUploadEvidence: (checklistItemId: string, docData: { name: { en: string; ar: string }, uploadedFile: { name: string, type: string }}) => void;
}> = ({ parentStandard, items, users, documents, departments, currentUser, isFinalized, onUpdate, onAddComment, onCreateCapa, programName, onUploadEvidence }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { t } = useTranslation();
  
  const { progress, compliantCount, totalApplicable } = useMemo(() => {
    const applicableItems = items.filter(i => i.status !== ComplianceStatus.NotApplicable);
    if (applicableItems.length === 0) {
      return { progress: 100, compliantCount: 0, totalApplicable: 0 };
    }
    const score = applicableItems.reduce((acc, item) => {
        if (item.status === ComplianceStatus.Compliant) return acc + 1;
        if (item.status === ComplianceStatus.PartiallyCompliant) return acc + 0.5;
        return acc;
    }, 0);
    const compliantCount = applicableItems.filter(i => i.status === ComplianceStatus.Compliant).length;
    return { progress: (score / applicableItems.length) * 100, compliantCount, totalApplicable: applicableItems.length };
  }, [items]);
  
  const displayTotal = parentStandard.totalMeasures && parentStandard.totalMeasures >= items.length 
    ? parentStandard.totalMeasures 
    : items.length;

  const programColors: { [key: string]: string } = {
    'JCI': 'border-red-500', 'DNV': 'border-indigo-500', 'HFAP': 'border-purple-500', 'CBAHI': 'border-emerald-500', 'GAHAR': 'border-sky-500', 'DOH': 'border-amber-500', 'NHRA': 'border-rose-500', 'OSAHI': 'border-teal-500', 'CMS': 'border-blue-500',
  };

  return (
    <div className={`bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border dark:border-dark-brand-border overflow-hidden ltr:border-l-4 rtl:border-r-4 ${programColors[programName] || 'border-gray-500'}`}>
      <button
        className="w-full text-left p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 text-left rtl:text-right">
            <h3 className="font-bold text-brand-text-primary dark:text-dark-brand-text-primary">{parentStandard.standardId}</h3>
            <p className="text-sm mt-1 text-brand-text-secondary dark:text-dark-brand-text-secondary">{parentStandard.description}</p>
          </div>
          <ChevronDownIcon className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ltr:ml-4 rtl:mr-4 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-brand-text-secondary dark:text-dark-brand-text-secondary">
              {t('measuresCompliant').replace('{count}', compliantCount.toString()).replace('{total}', totalApplicable.toString())}
            </span>
            <span className="text-xs font-bold text-brand-primary">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-brand-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </button>
      {isExpanded && (
        <div className="p-4 border-t dark:border-dark-brand-border space-y-3 bg-white dark:bg-dark-brand-surface">
          {items.length > 0 
            ? items.map(item => <ChecklistItemComponent key={item.id} item={item} standard={parentStandard} users={users} documents={documents} departments={departments} onUpdate={onUpdate} currentUser={currentUser} onAddComment={onAddComment} onCreateCapa={onCreateCapa} isFinalized={isFinalized} onUploadEvidence={onUploadEvidence} />)
            : <p className="text-sm text-center text-brand-text-secondary dark:text-dark-brand-text-secondary py-4">{t('noChecklistItems')}</p>
          }
        </div>
      )}
    </div>
  );
};


const ProjectChecklist: React.FC<ProjectChecklistProps> = ({ project, users, documents, departments, standards, currentUser, isFinalized, onUpdateProject, onAddComment, onCreateCapa, programName, onUploadEvidence }) => {
  const { t, lang } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const usersWithDepartments = useMemo(() => 
    users.map(user => ({...user, department: departments.find(d => d.id === user.departmentId)})), 
  [users, departments]);

  const handleUpdateChecklistItem = (updatedItem: ChecklistItem) => {
    const updatedChecklist = project.checklist.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    onUpdateProject({ ...project, checklist: updatedChecklist });
  };

  const handleAddComment = (checklistItemId: string, text: string) => {
    onAddComment(project.id, checklistItemId, text);
  }
  
  const filteredChecklist = useMemo(() => {
    return project.checklist.filter(item => {
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        
        const assignee = usersWithDepartments.find(u => u.id === item.assignedTo);
        const matchesUser = userFilter === 'All' || item.assignedTo === userFilter;
        const matchesDepartment = departmentFilter === 'All' || assignee?.departmentId === departmentFilter;

        const matchesSearch = searchTerm === '' || 
                              item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.standardId.toLowerCase().includes(searchTerm.toLowerCase());
                              
        return matchesStatus && matchesUser && matchesDepartment && matchesSearch;
    });
  }, [project.checklist, statusFilter, userFilter, departmentFilter, searchTerm, usersWithDepartments]);

  const subStandardToParentMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const standard of standards) {
        if (standard.subStandards) {
            for (const sub of standard.subStandards) {
                map.set(sub.id, standard.standardId);
            }
        }
    }
    return map;
  }, [standards]);

  const groupedChecklist = useMemo(() => {
    return filteredChecklist.reduce((acc, item) => {
      const parentId = subStandardToParentMap.get(item.standardId) || item.standardId;
      
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(item);
      return acc;
    }, {} as Record<string, ChecklistItem[]>);
  }, [filteredChecklist, subStandardToParentMap]);
  
  const selectClasses = "border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-brand-primary focus:border-brand-primary text-sm bg-white dark:bg-gray-700 dark:text-white";

  return (
    <div className="space-y-6">
      <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h2 className="text-xl font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{t('projectChecklist')}</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                <SearchIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder={t('searchChecklist')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full ltr:pl-10 rtl:pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"/>
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${selectClasses} w-full sm:w-auto`}>
                <option value="All">{t('allStatuses')}</option>
                {Object.values(ComplianceStatus).map(s => <option key={s} value={s}>{t(s.charAt(0).toLowerCase() + s.slice(1).replace(/\s/g, '') as any)}</option>)}
              </select>
              <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className={`${selectClasses} w-full sm:w-auto`}>
                <option value="All">{t('allUsers')}</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className={`${selectClasses} w-full sm:w-auto`}>
                <option value="All">{t('allDepartments')}</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}
              </select>
          </div>
        </div>
      </div>

      {Object.keys(groupedChecklist).length > 0 ? (
        <div className="space-y-4">
            {Object.entries(groupedChecklist).sort(([idA], [idB]) => idA.localeCompare(idB)).map(([parentStandardId, items]) => {
              const parentStandard = standards.find(s => s.standardId === parentStandardId);
              if (!parentStandard) return null;
              return (
                <StandardAccordionGroup
                  key={parentStandardId}
                  parentStandard={parentStandard}
                  items={items}
                  users={users}
                  documents={documents}
                  departments={departments}
                  currentUser={currentUser}
                  isFinalized={isFinalized}
                  onUpdate={handleUpdateChecklistItem}
                  onAddComment={handleAddComment}
                  onCreateCapa={onCreateCapa}
                  programName={programName}
                  onUploadEvidence={onUploadEvidence}
                />
              );
            })}
        </div>
      ) : (
        <div className="text-center py-8 bg-brand-surface dark:bg-dark-brand-surface rounded-lg">
          <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('noChecklistItems')}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectChecklist;
