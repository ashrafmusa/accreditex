import React, { useState, useMemo } from 'react';
import { Department, User, Project, NavigationState, ComplianceStatus } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { BuildingOffice2Icon, PlusIcon } from '../components/icons';
import { useUserStore } from '../stores/useUserStore';
import { useAppStore } from '../stores/useAppStore';
import DepartmentCard from '../components/departments/DepartmentCard';
import DepartmentModal from '../components/departments/DepartmentModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import EmptyState from '../components/common/EmptyState';

interface DepartmentsPageProps {
  departments: Department[];
  users: User[];
  projects: Project[];
  onAdd: (dept: Omit<Department, 'id'>) => void;
  onUpdate: (dept: Department) => void;
  onDelete: (deptId: string) => void;
  setNavigation: (state: NavigationState) => void;
}

const DepartmentsPage: React.FC<DepartmentsPageProps> = (props) => {
    const { departments, users, projects, onAdd, onUpdate, onDelete, setNavigation } = props;
    const { t } = useTranslation();
    const { currentUser } = useUserStore();
    const { competencies } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [deletingDept, setDeletingDept] = useState<Department | null>(null);

    const canModify = currentUser?.role === 'Admin';

    const departmentData = useMemo(() => {
        return departments.map(dept => {
            const usersInDept = users.filter(u => u.departmentId === dept.id);
            const userIdsInDept = new Set(usersInDept.map(u => u.id));
            const tasks = projects.flatMap(p => p.checklist).filter(item => item.assignedTo && userIdsInDept.has(item.assignedTo));
            const applicableTasks = tasks.filter(c => c.status !== ComplianceStatus.NotApplicable);
            let score = 0;
            applicableTasks.forEach(item => {
              if (item.status === ComplianceStatus.Compliant) score += 1;
              if (item.status === ComplianceStatus.PartiallyCompliant) score += 0.5;
            });
            const compliance = applicableTasks.length > 0 ? Math.round((score / applicableTasks.length) * 100) : 100;

            return { ...dept, userCount: usersInDept.length, taskCount: tasks.length, compliance, usersInDept };
        });
    }, [departments, users, projects]);

    const handleSave = (dept: Department | Omit<Department, 'id'>) => {
        if ('id' in dept) { onUpdate(dept); } else { onAdd(dept); }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if(deletingDept) { onDelete(deletingDept.id); setDeletingDept(null); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                    <BuildingOffice2Icon className="h-8 w-8 text-brand-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">{t('departmentsHub')}</h1>
                        <p className="text-brand-text-secondary mt-1">{t('departmentsHubDescription')}</p>
                    </div>
                </div>
                {canModify && (
                <button onClick={() => { setEditingDept(null); setIsModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-semibold shadow-sm w-full md:w-auto">
                    <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> {t('addNewDepartment')}
                </button>
                )}
            </div>

            {departmentData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departmentData.map(dept => (
                        <DepartmentCard
                            key={dept.id}
                            department={dept}
                            canModify={canModify}
                            onSelect={() => setNavigation({ view: 'departmentDetail', departmentId: dept.id })}
                            onEdit={() => { setEditingDept(dept); setIsModalOpen(true); }}
                            onDelete={() => setDeletingDept(dept)}
                        />
                    ))}
                </div>
            ) : <EmptyState icon={BuildingOffice2Icon} title={t('noDepartments')} message={t('noDepartmentsMessage')} />}

            {isModalOpen && <DepartmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingDepartment={editingDept} competencies={competencies} />}
            {deletingDept && <ConfirmationModal isOpen={!!deletingDept} onClose={() => setDeletingDept(null)} onConfirm={handleDelete} title={t('deleteDepartment')} message={t('areYouSureDeleteDepartment')} confirmationText={t('delete')} />}
        </div>
    );
};

export default DepartmentsPage;
