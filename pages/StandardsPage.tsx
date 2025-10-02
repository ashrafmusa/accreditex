import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import { Standard, AccreditationProgram, User, UserRole } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { SearchIcon, BookOpenIcon, PlusIcon } from '../components/icons';
import StandardModal from '../components/accreditation/StandardModal';
import StandardAccordion from '../components/accreditation/StandardAccordion';

interface StandardsPageProps {
  program: AccreditationProgram;
  standards: Standard[];
  currentUser: User;
  onCreateStandard: (standard: Standard) => void;
  onUpdateStandard: (standard: Standard) => void;
  onDeleteStandard: (standardId: string) => void;
}

const StandardsPage: React.FC<StandardsPageProps> = ({ program, standards, currentUser, onCreateStandard, onUpdateStandard, onDeleteStandard }) => {
  const { t, lang } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null);

  const canModify = currentUser.role === UserRole.Admin;

  const handleOpenCreateModal = () => { setEditingStandard(null); setIsModalOpen(true); };
  const handleOpenEditModal = (standard: Standard) => { setEditingStandard(standard); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingStandard(null); };

  const handleSaveStandard = (standardData: Standard) => {
    if (editingStandard) {
      onUpdateStandard(standardData);
    } else {
      onCreateStandard(standardData);
    }
    handleCloseModal();
  };

  const handleDeleteStandard = (standardId: string) => {
    if (window.confirm(t('areYouSureDeleteStandard'))) {
      onDeleteStandard(standardId);
    }
  };

  const filteredStandards = useMemo(() => {
    return standards.filter(s => {
      const subStandardsText = s.subStandards?.map(sub => `${sub.id} ${sub.description}`).join(' ') || '';
      const searchContent = `${s.standardId} ${s.description} ${s.section || ''} ${subStandardsText}`.toLowerCase();
      return searchContent.includes(searchTerm.toLowerCase());
    });
  }, [standards, searchTerm]);

  const groupedStandards = useMemo(() => {
    return filteredStandards.reduce((acc, standard) => {
      const section = standard.section || t('uncategorized');
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(standard);
      return acc;
    }, {} as Record<string, Standard[]>);
  }, [filteredStandards, t]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
          <BookOpenIcon className="h-8 w-8 text-brand-primary"/>
          <div>
            <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{program.name} {t('standardsLibrary')}</h1>
            <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{program.description[lang]}</p>
          </div>
        </div>
        {canModify && (
           <button onClick={handleOpenCreateModal} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center font-semibold shadow-sm w-full md:w-auto">
            <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('addStandard')}
          </button>
        )}
      </div>

      <div className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border flex flex-wrap items-center gap-4">
        <div className="relative flex-grow min-w-[200px]">
          <SearchIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder={t('searchByStandard')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full ltr:pl-10 rtl:pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"/>
        </div>
      </div>

      {Object.keys(groupedStandards).length > 0 ? (
        <div className="space-y-8">
          {/* FIX: Correctly type the map function parameters. */}
          {Object.entries(groupedStandards).map(([section, standardsInSection]) => (
            <div key={section}>
              <h2 className="text-xl font-semibold text-brand-text-primary dark:text-dark-brand-text-primary mb-4 pb-2 border-b-2 border-brand-primary dark:border-indigo-400">{section}</h2>
              <div className="space-y-4">
                {standardsInSection.map(standard => (
                  <StandardAccordion 
                    key={standard.standardId} 
                    standard={standard} 
                    canModify={canModify}
                    onEdit={() => handleOpenEditModal(standard)}
                    onDelete={() => handleDeleteStandard(standard.standardId)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-brand-surface dark:bg-dark-brand-surface rounded-lg">
          <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('noStandardsFound')}</p>
        </div>
      )}
      {isModalOpen && (
        <StandardModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveStandard}
          programId={program.id}
          existingStandard={editingStandard}
        />
      )}
    </div>
  );
};

export default StandardsPage;