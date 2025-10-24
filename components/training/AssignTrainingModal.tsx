import React, { useState, FC } from 'react';
import { TrainingProgram, User, Department } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../hooks/useToast';
import DatePicker from '../ui/DatePicker';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';

interface AssignTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: { trainingId: string; userIds: string[]; departmentIds: string[]; dueDate?: string }) => Promise<void>;
  trainingPrograms: TrainingProgram[];
  users: User[];
  departments: Department[];
}

const AssignTrainingModal: FC<AssignTrainingModalProps> = ({ isOpen, onClose, onAssign, trainingPrograms, users, departments }) => {
    const { t, lang } = useTranslation();
    const toast = useToast();
    const [trainingId, setTrainingId] = useState('');
    const [userIds, setUserIds] = useState<string[]>([]);
    const [departmentIds, setDepartmentIds] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<Date | undefined>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!trainingId || (userIds.length === 0 && departmentIds.length === 0)) {
            toast.error(t('pleaseFillRequired'));
            return;
        }
        await onAssign({ trainingId, userIds, departmentIds, dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined });
        toast.success(t('trainingAssignedSuccess'));
        onClose();
    }
    
    const footer = (
        <>
            <button type="button" onClick={onClose} className="py-2 px-4 border rounded-md">{t('cancel')}</button>
            <button type="submit" form="assign-form" className="py-2 px-4 border rounded-md text-white bg-brand-primary">{t('assign')}</button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('assignTraining')} footer={footer} size="lg">
            <form id="assign-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="training" className={labelClasses}>{t('trainingModule')}</label>
                    <select id="training" value={trainingId} onChange={e => setTrainingId(e.target.value)} className={inputClasses} required>
                        <option value="">{t('selectTraining')}</option>
                        {trainingPrograms.map(p => <option key={p.id} value={p.id}>{p.title[lang]}</option>)}
                    </select>
                </div>
                    <div>
                    <label htmlFor="users" className={labelClasses}>{t('assignToUsers')}</label>
                    <select id="users" multiple value={userIds} onChange={e => setUserIds(Array.from(e.target.selectedOptions, (opt: HTMLOptionElement) => opt.value))} className={`${inputClasses} h-32`}>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                    <div>
                    <label htmlFor="departments" className={labelClasses}>{t('assignToDepartments')}</label>
                    <select id="departments" multiple value={departmentIds} onChange={e => setDepartmentIds(Array.from(e.target.selectedOptions, (opt: HTMLOptionElement) => opt.value))} className={`${inputClasses} h-24`}>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="dueDate" className={labelClasses}>{t('assignmentDueDate')}</label>
                    <DatePicker date={dueDate} setDate={setDueDate} />
                </div>
            </form>
        </Modal>
    );
};

export default AssignTrainingModal;