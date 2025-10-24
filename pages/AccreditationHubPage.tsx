import React, { useState, useMemo } from 'react';
import { AccreditationProgram, Standard, NavigationState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { GlobeAltIcon, PlusIcon } from '../components/icons';
import ProgramCard from '../components/accreditation/ProgramCard';
import ProgramModal from '../components/accreditation/ProgramModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useProjectStore } from '../stores/useProjectStore';
import { useAppStore } from '../stores/useAppStore';

interface AccreditationHubPageProps {
    setNavigation: (state: NavigationState) => void;
}

const AccreditationHubPage: React.FC<AccreditationHubPageProps> = ({ setNavigation }) => {
    const { t } = useTranslation();
    const { programs, standards, addProgram, updateProgram, deleteProgram } = useAppStore();
    const { projects } = useProjectStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<AccreditationProgram | null>(null);
    const [deletingProgram, setDeletingProgram] = useState<AccreditationProgram | null>(null);

    const programData = useMemo(() => 
        programs.map(p => ({
            ...p,
            standardCount: standards.filter(s => s.programId === p.id).length,
            projectCount: projects.filter(proj => proj.programId === p.id).length
        })), [programs, standards, projects]);
    
    const handleSave = (program: AccreditationProgram | Omit<AccreditationProgram, 'id'>) => {
        if('id' in program) {
            updateProgram(program);
        } else {
            addProgram(program);
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if(deletingProgram) {
            deleteProgram(deletingProgram.id);
            setDeletingProgram(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold">{t('accreditationHubTitle')}</h2>
                <button onClick={() => { setEditingProgram(null); setIsModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-semibold shadow-sm w-full sm:w-auto">
                    <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('addNewProgram')}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programData.map(program => (
                    <ProgramCard 
                        key={program.id}
                        program={program}
                        standardCount={program.standardCount}
                        projectCount={program.projectCount}
                        canModify={true} // Assuming admin view
                        onSelect={() => setNavigation({ view: 'standards', programId: program.id })}
                        onEdit={() => { setEditingProgram(program); setIsModalOpen(true); }}
                        onDelete={() => setDeletingProgram(program)}
                    />
                ))}
            </div>

            {isModalOpen && <ProgramModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingProgram={editingProgram} />}
            {deletingProgram && (
                 <ConfirmationModal
                    isOpen={!!deletingProgram}
                    onClose={() => setDeletingProgram(null)}
                    onConfirm={handleDelete}
                    title={t('deleteProgram')}
                    message={t('areYouSureDeleteProgram')}
                    confirmationText={t('delete')}
                />
            )}
        </div>
    );
};

export default AccreditationHubPage;
