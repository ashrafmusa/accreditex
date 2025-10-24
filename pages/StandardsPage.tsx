import React, { useState, useMemo, useRef } from 'react';
import { AccreditationProgram, Standard, UserRole } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useUserStore } from '../stores/useUserStore';
import { ShieldCheckIcon, PlusIcon, UploadIcon, SearchIcon } from '../components/icons';
import StandardAccordion from '../components/accreditation/StandardAccordion';
import StandardModal from '../components/accreditation/StandardModal';
import ImportStandardsModal from '../components/accreditation/ImportStandardsModal';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../hooks/useToast';

interface StandardsPageProps {
  program: AccreditationProgram;
  standards: Standard[];
  canModify: boolean;
  onAdd: (standard: Standard) => void;
  onUpdate: (standard: Standard) => void;
  onDelete: (standardId: string) => void;
  onImport: (standards: Standard[]) => void;
}

const StandardsPage: React.FC<StandardsPageProps> = (props) => {
    const { program, standards, canModify, onAdd, onUpdate, onDelete, onImport } = props;
    const { t, lang } = useTranslation();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isStandardModalOpen, setIsStandardModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingStandard, setEditingStandard] = useState<Standard | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [fileContent, setFileContent] = useState('');

    const filteredStandards = useMemo(() => {
        return standards.filter(s => 
            s.standardId.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [standards, searchTerm]);

    const handleSave = (standard: Standard | Omit<Standard, 'programId'>) => {
        const standardWithProgram = { ...standard, programId: program.id };
        if ('standardId' in editingStandard!) {
            onUpdate(standardWithProgram as Standard);
        } else {
            onAdd(standardWithProgram as Standard);
        }
        setIsStandardModalOpen(false);
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setFileContent(text);
                setIsImportModalOpen(true);
            };
            reader.readAsText(file);
        }
    };
    
    const handleImport = (programId: string) => {
        try {
            const parsedStandards = JSON.parse(fileContent);
            onImport(parsedStandards);
            toast.success('Standards imported successfully!');
        } catch(e) {
            toast.error('Failed to parse JSON file.');
        }
        setIsImportModalOpen(false);
        setFileContent('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                    <ShieldCheckIcon className="h-8 w-8 text-brand-primary" />
                    <div>
                        {/* FIX: Cast translation key to any */}
                        <h1 className="text-3xl font-bold">{program.name} {t('standards' as any)}</h1>
                        <p className="text-brand-text-secondary mt-1">{program.description[lang]}</p>
                    </div>
                </div>
                {canModify && (
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".json" />
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white dark:bg-slate-700 text-brand-text-primary dark:text-dark-brand-text-primary border border-slate-300 dark:border-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-center font-semibold shadow-sm text-sm">
                        <UploadIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> {t('import')}
                    </button>
                    <button onClick={() => { setEditingStandard(null); setIsStandardModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-semibold shadow-sm text-sm">
                        <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> {t('addStandard')}
                    </button>
                </div>
                )}
            </div>

            <div className="relative flex-grow">
                <SearchIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                {/* FIX: Cast translation key to any */}
                <input type="text" placeholder={t('searchStandards' as any)} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full ltr:pl-10 rtl:pr-10 px-4 py-2 border rounded-lg" />
            </div>

            {filteredStandards.length > 0 ? (
                <div className="space-y-4">
                    {filteredStandards.map(standard => (
                        <StandardAccordion 
                            key={standard.standardId} 
                            standard={standard}
                            canModify={canModify}
                            onEdit={() => { setEditingStandard(standard); setIsStandardModalOpen(true); }}
                            onDelete={() => onDelete(standard.standardId)}
                        />
                    ))}
                </div>
            ) : (
                // FIX: Cast translation keys to any
                <EmptyState icon={ShieldCheckIcon} title={t('noStandardsFound' as any)} message={t('noStandardsFoundMessage' as any)} />
            )}

            {isStandardModalOpen && (
                <StandardModal
                    isOpen={isStandardModalOpen}
                    onClose={() => setIsStandardModalOpen(false)}
                    onSave={handleSave}
                    existingStandard={editingStandard}
                />
            )}
            {isImportModalOpen && (
                <ImportStandardsModal 
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={handleImport}
                    fileContent={fileContent}
                    programs={[program]}
                />
            )}
        </div>
    );
};

export default StandardsPage;