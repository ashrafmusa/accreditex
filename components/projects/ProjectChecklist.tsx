import React, { useState, useMemo } from 'react';
import { Project, Standard, User, ChecklistItem, ComplianceStatus, UserRole } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import ChecklistItemComponent from './ChecklistItemComponent';
import { SearchIcon } from '../icons';

interface ProjectChecklistProps {
  project: Project;
  standards: Standard[];
  users: User[];
  currentUser: User;
  // FIX: Update prop types to match store function signatures
  onUpdateItem: (projectId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  onAddComment: (projectId: string, itemId: string, commentText: string) => void;
  onUploadEvidence: (projectId: string, checklistItemId: string, fileData: any) => void;
}

const ProjectChecklist: React.FC<ProjectChecklistProps> = (props) => {
  const { project, standards, users, currentUser, onUpdateItem, onAddComment, onUploadEvidence } = props;
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');

  const groupedChecklist = useMemo(() => {
    const sections = standards.reduce<Record<string, Standard[]>>((acc, std) => {
      const sectionKey = std.section || 'Uncategorized';
      if (!acc[sectionKey]) acc[sectionKey] = [];
      acc[sectionKey].push(std);
      return acc;
    }, {});

    return Object.entries(sections).map(([section, standardsInSection]) => {
      const standardIds = new Set(standardsInSection.flatMap(s => [s.standardId, ...(s.subStandards?.map(sub => sub.id) || [])]));
      const items = project.checklist
        .filter(item => standardIds.has(item.standardId))
        .filter(item => {
            const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase()) || item.standardId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const matchesAssignee = assigneeFilter === 'all' || item.assignedTo === assigneeFilter;
            return matchesSearch && matchesStatus && matchesAssignee;
        });
        
      return { section, items };
    }).filter(group => group.items.length > 0);
  }, [project.checklist, standards, searchTerm, statusFilter, assigneeFilter]);
  
  const isFinalized = project.status === 'Finalized';

  return (
    <div className="space-y-6">
        <div className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-lg border border-brand-border dark:border-dark-brand-border flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
                <SearchIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={t('searchChecklist')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full ltr:pl-10 rtl:pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                />
            </div>
            <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full md:w-auto border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm"
            >
                <option value="all">{t('allStatuses')}</option>
                {Object.values(ComplianceStatus).map(s => <option key={s} value={s}>{t((s.charAt(0).toLowerCase() + s.slice(1).replace(' ', '')) as any)}</option>)}
            </select>
            <select
                value={assigneeFilter}
                onChange={e => setAssigneeFilter(e.target.value)}
                className="w-full md:w-auto border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm"
            >
                <option value="all">{t('allAssignees')}</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                <option value="">{t('unassigned')}</option>
            </select>
        </div>

        <div className="space-y-6">
            {groupedChecklist.map(({ section, items }) => (
                <div key={section}>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2 dark:border-dark-brand-border">{section}</h3>
                    <div className="space-y-3">
                        {items.map(item => (
                            <ChecklistItemComponent 
                                key={item.id}
                                item={item}
                                standard={standards.find(s => s.standardId === item.standardId || s.subStandards?.some(sub => sub.id === item.standardId))}
                                project={project}
                                users={users}
                                currentUser={currentUser}
                                isFinalized={isFinalized}
                                onUpdate={(itemId, updates) => onUpdateItem(project.id, itemId, updates)}
                                onAddComment={(commentText) => onAddComment(project.id, item.id, commentText)}
                                onUploadEvidence={(fileData) => onUploadEvidence(project.id, item.id, fileData)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default ProjectChecklist;
