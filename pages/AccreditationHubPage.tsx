import React, { useState, useMemo, useRef } from 'react';
// FIX: Corrected import path for types
import { AccreditationProgram, UserRole, NavigationState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { PlusIcon, ShieldCheckIcon } from '../components/icons';
import ProgramModal from '../components/accreditation/ProgramModal';
import ProgramCard from '../components/accreditation/ProgramCard';
import EmptyState from '../components/common/EmptyState';
import { useAppStore } from '../stores/useAppStore';
import { useProjectStore } from '../stores/useProjectStore';
import { useUserStore } from '../stores/useUserStore';
import ImportStandardsModal from '../components/accreditation/ImportStandardsModal';
import { useToast } from '../hooks/useToast';

interface AccreditationHubPageProps {
  setNavigation: (state: NavigationState) => void;
}

const AccreditationHubPage: React.FC<AccreditationHubPageProps> = ({ setNavigation }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AccreditationProgram | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileContent, setImportFileContent] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const { 
    accreditationPrograms: programs, 
    standards, 
    addProgram: onCreateProgram, 
    updateProgram: onUpdateProgram, 
    deleteProgram: onDeleteProgram,
    importStandards
  } = useAppStore();
  const { projects } = useProjectStore();
  const { currentUser } = useUserStore();

  const canModify = currentUser!.role === UserRole.Admin;

  const handleOpenCreateModal = () => { setEditingProgram(null); setIsModalOpen(true); };
  const handleOpenEditModal = (program: AccreditationProgram) => { setEditingProgram(program); setIsModalOpen(true); };
  
  const handleSaveProgram = (program: AccreditationProgram | Omit<AccreditationProgram, 'id'>) => {
    if ('id' in program) { onUpdateProgram(program); } else { onCreateProgram(program); }
    handleCloseModal();
  };
  
  const handleCloseModal = () => { setIsModalOpen(false); setEditingProgram(null); };

  const handleDeleteProgram = (programId: string) => {
      if (window.confirm(t('areYouSureDeleteProgram'))) {
          onDeleteProgram(programId);
      }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setImportFileContent(text);
            setIsImportModalOpen(true);
        };
        reader.readAsText(file);
    }
    if (importFileRef.current) importFileRef.current.value = "";
  };
  
  const handleConfirmImport = async (programId: string) => {
    if (!importFileContent) return;
    const result = await importStandards(importFileContent, programId);
    if (result.success) {
        toast.success(t('importSuccess').replace('{count}', result.count.toString()));
    } else {
        toast.error(result.error || t('importError'));
    }
    setIsImportModalOpen(false);
    setImportFileContent(null);
  };

  const programStats = useMemo(() => {
    return programs.map(prog => {
      const standardCount = standards.filter(s => s.programId === prog.id).length;
      const projectCount = projects.filter(p => p.programId === prog.id).length;
      return { ...prog, standardCount, projectCount };
    });
  }, [programs, standards, projects]);
  
  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <input type="file" ref={importFileRef} onChange={handleFileSelect} className="hidden" accept=".json" />
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
          <ShieldCheckIcon className="h-8 w-8 text-brand-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary">{t('accreditationHub')}</h1>
            <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('accreditationHubDescription')}</p>
          </div>
        </div>
        {canModify && (
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
             <button onClick={() => importFileRef.current?.click()} className="bg-white dark:bg-slate-700 text-brand-text-primary dark:text-dark-brand-text-primary border border-slate-300 dark:border-slate-600 px-5 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-center font-semibold shadow-sm">
                {t('importStandards')}
            </button>
            <button onClick={handleOpenCreateModal} className="bg-brand-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-brand-primary-700 transition-colors flex items-center justify-center font-semibold shadow-sm from-brand-primary-500 to-brand-primary-700 bg-gradient-to-br">
                <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('createNewProgram')}
            </button>
          </div>
        )}
      </div>

      {programStats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {programStats.map(prog => (
            <ProgramCard 
              key={prog.id} 
              program={prog} 
              standardCount={prog.standardCount} 
              projectCount={prog.projectCount}
              canModify={canModify}
              onSelect={() => setNavigation({ view: 'standards', programId: prog.id })}
              onEdit={() => handleOpenEditModal(prog)}
              onDelete={() => handleDeleteProgram(prog.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheckIcon}
          title={t('noProgramsFound')}
          message="Create a new accreditation program to add standards and start projects."
        />
      )}

      {isModalOpen && (
        <ProgramModal 
          program={editingProgram}
          onSave={handleSaveProgram}
          onClose={handleCloseModal} 
        />
      )}
      
      {isImportModalOpen && importFileContent && (
        <ImportStandardsModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleConfirmImport}
            fileContent={importFileContent}
            programs={programs}
        />
      )}
    </div>
  );
};

export default AccreditationHubPage;