

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, NavigationState, ProjectStatus, User, UserRole, Department, AccreditationProgram } from '@/types';
import { CheckCircleIcon, ClockIcon, PauseCircleIcon, PlayCircleIcon, PlusIcon, SearchIcon, ViewColumnsIcon, ViewGridIcon, FolderIcon } from '@/components/icons';
import { useTranslation } from '@/hooks/useTranslation';
import ProjectCard from '@/components/projects/ProjectCard';
import EmptyState from '@/components/common/EmptyState';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUserStore } from '@/stores/useUserStore';
import { useAppStore } from '@/stores/useAppStore';

type ViewMode = 'grid' | 'board';

interface ProjectListPageProps {
  setNavigation: (state: NavigationState) => void;
}

const statusIndicator = {
  [ProjectStatus.Completed]: { icon: CheckCircleIcon, color: 'text-brand-success', bg: 'bg-green-100 dark:bg-green-900/50 dark:text-green-300', border: 'border-brand-success' },
  [ProjectStatus.InProgress]: { icon: PlayCircleIcon, color: 'text-brand-warning', bg: 'bg-orange-100 dark:bg-orange-900/50 dark:text-orange-300', border: 'border-brand-warning' },
  [ProjectStatus.OnHold]: { icon: PauseCircleIcon, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300', border: 'border-yellow-600' },
  [ProjectStatus.NotStarted]: { icon: ClockIcon, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300', border: 'border-gray-500' },
  [ProjectStatus.Finalized]: { icon: CheckCircleIcon, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300', border: 'border-blue-600' },
};

// --- VIRTUALIZATION CONSTANTS ---
const ITEM_HEIGHT = 290; // Approximate height of a ProjectCard + gap
const BUFFER = 3;      // Number of rows to render above and below the visible area

const ProjectListPage: React.FC<ProjectListPageProps> = ({ setNavigation }) => {
  const { t, lang } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sortBy, setSortBy] = useState('startDate-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // --- VIRTUALIZATION STATE ---
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [gridHeight, setGridHeight] = useState(0);
  const [columns, setColumns] = useState(3);

  const { projects, deleteProject: onDeleteProject } = useProjectStore();
  const { currentUser, users } = useUserStore();
  const { departments, accreditationPrograms: programs } = useAppStore();
  
  const programMap = useMemo(() => new Map(programs.map(p => [p.id, p.name])), [programs]);
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  
  const projectsWithDetails = useMemo(() => {
    return projects.map(p => {
        const assignedUserIds = new Set(p.checklist.map(item => item.assignedTo).filter(Boolean));
        assignedUserIds.add(p.projectLead.id);
        const teamMembers = Array.from(assignedUserIds).map(id => userMap.get(id!)).filter((u): u is User => !!u);
        return { ...p, teamMembers, programName: programMap.get(p.programId) || 'Unknown' };
    });
  }, [projects, programMap, userMap]);

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = projectsWithDetails.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesProgram = programFilter === 'All' || p.programId === programFilter;
        const userIdsInDept = departmentFilter === 'All' ? new Set() : new Set(users.filter(u => u.departmentId === departmentFilter).map(u => u.id));
        const matchesDepartment = departmentFilter === 'All' || p.teamMembers.some(member => userIdsInDept.has(member.id));
        return matchesSearch && matchesStatus && matchesProgram && matchesDepartment;
    });

    return filtered.sort((a, b) => {
        const [key, direction] = sortBy.split('-');
        const dir = direction === 'asc' ? 1 : -1;
        switch (key) {
            case 'startDate': return (new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) * dir;
            case 'name': return a.name.localeCompare(b.name) * dir;
            case 'progress': return (a.progress - b.progress) * dir;
            default: return 0;
        }
    });
  }, [projectsWithDetails, searchTerm, statusFilter, programFilter, departmentFilter, sortBy, users]);
  
  // --- VIRTUALIZATION LOGIC ---
  useEffect(() => {
    const grid = gridContainerRef.current;
    if (!grid) return;
    
    const observer = new ResizeObserver(() => {
        setGridHeight(grid.clientHeight);
        const gridWidth = grid.clientWidth;
        if (gridWidth < 768) setColumns(1);
        else if (gridWidth < 1280) setColumns(2);
        else setColumns(3);
    });

    observer.observe(grid);
    // Initial setup
    setGridHeight(grid.clientHeight);
    const gridWidth = grid.clientWidth;
    if (gridWidth < 768) setColumns(1);
    else if (gridWidth < 1280) setColumns(2);
    else setColumns(3);

    return () => observer.disconnect();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
  };
  
  const totalRows = Math.ceil(filteredAndSortedProjects.length / columns);
  const startRow = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + gridHeight) / ITEM_HEIGHT) + BUFFER);
  
  const startIndex = startRow * columns;
  const endIndex = endRow * columns;

  const visibleProjects = filteredAndSortedProjects.slice(startIndex, endIndex);
  
  const paddingTop = startRow * ITEM_HEIGHT;
  
  // --- END VIRTUALIZATION LOGIC ---

  const handleDelete = (projectId: string) => {
    if (window.confirm(t('areYouSureDeleteProject'))) {
        onDeleteProject(projectId);
    }
  };

  const renderGrid = () => {
    if (filteredAndSortedProjects.length === 0) {
        return <EmptyState icon={FolderIcon} title={t('noProjectsFound')} message="Try adjusting your filters or create a new project." />;
    }
    
    return (
        <div ref={gridContainerRef} onScroll={handleScroll} className="overflow-y-auto" style={{ height: 'calc(100vh - 250px)' /* Adjust height as needed */ }}>
            <div style={{ height: totalRows * ITEM_HEIGHT, position: 'relative' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-1" style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${paddingTop}px)` }}>
                    {visibleProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            currentUser={currentUser!}
                            onSelect={() => setNavigation({ view: 'projectDetail', projectId: project.id })}
                            onEdit={() => setNavigation({ view: 'editProject', projectId: project.id })}
                            onDelete={() => handleDelete(project.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
  }
  
  const renderBoard = () => {
    const statuses = [ProjectStatus.NotStarted, ProjectStatus.InProgress, ProjectStatus.OnHold, ProjectStatus.Completed, ProjectStatus.Finalized];
    const projectsByStatus = statuses.reduce((acc, status) => {
        acc[status] = filteredAndSortedProjects.filter(p => p.status === status);
        return acc;
    }, {} as Record<ProjectStatus, typeof filteredAndSortedProjects>);

    return (
      <div className="flex space-x-4 rtl:space-x-reverse overflow-x-auto p-4">
        {statuses.map(status => {
          const StatusIcon = statusIndicator[status].icon;
          return (
            <div key={status} className="w-80 flex-shrink-0">
              <h3 className={`flex items-center gap-2 font-semibold px-3 py-2 rounded-t-lg ${statusIndicator[status].bg} ${statusIndicator[status].color}`}>
                  <StatusIcon className="w-5 h-5"/>
                  {t((status.charAt(0).toLowerCase() + status.slice(1).replace(/\s/g, '')) as any)} ({projectsByStatus[status].length})
              </h3>
              <div className={`p-2 space-y-4 h-full bg-slate-50 dark:bg-slate-900/50 rounded-b-lg`}>
                {projectsByStatus[status].map(project => (
                  <ProjectCard
                      key={project.id}
                      project={project}
                      currentUser={currentUser!}
                      onSelect={() => setNavigation({ view: 'projectDetail', projectId: project.id })}
                      onEdit={() => setNavigation({ view: 'editProject', projectId: project.id })}
                      onDelete={() => handleDelete(project.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text-primary dark:text-dark-brand-text-primary">{t('projectsHub')}</h1>
          <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('projectsHubDescription')}</p>
        </div>
        <button onClick={() => setNavigation({ view: 'createProject'})} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center font-semibold shadow-sm w-full md:w-auto">
          <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('createNewProject')}
        </button>
      </div>

       <div className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-xl shadow-md border border-brand-border dark:border-dark-brand-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                  <SearchIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full ltr:pl-10 rtl:pr-10 px-4 py-2 border border-brand-border dark:border-dark-brand-border rounded-lg bg-transparent"/>
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border border-brand-border dark:border-dark-brand-border rounded-lg bg-transparent"><option value="All">{t('allStatuses')}</option>{Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
              <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="w-full border border-brand-border dark:border-dark-brand-border rounded-lg bg-transparent"><option value="All">{t('allPrograms')}</option>{programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-full border border-brand-border dark:border-dark-brand-border rounded-lg bg-transparent"><option value="All">{t('allDepartments')}</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}</select>
          </div>
          <div className="border-t border-brand-border dark:border-dark-brand-border mt-4 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full sm:w-auto border border-brand-border dark:border-dark-brand-border rounded-lg bg-transparent text-sm">
                  <option value="startDate-desc">{t('sortByDateDesc')}</option><option value="startDate-asc">{t('sortByDateAsc')}</option><option value="name-asc">{t('sortByNameAsc')}</option><option value="name-desc">{t('sortByNameDesc')}</option><option value="progress-desc">{t('sortByProgressDesc')}</option><option value="progress-asc">{t('sortByProgressAsc')}</option>
              </select>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setViewMode('grid')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''} flex items-center gap-2`}><ViewGridIcon className="w-5 h-5"/>{t('grid')}</button>
                <button onClick={() => setViewMode('board')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'board' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''} flex items-center gap-2`}><ViewColumnsIcon className="w-5 h-5"/>{t('board')}</button>
              </div>
          </div>
      </div>

      {viewMode === 'grid' ? renderGrid() : renderBoard()}
    </div>
  );
};

export default ProjectListPage;