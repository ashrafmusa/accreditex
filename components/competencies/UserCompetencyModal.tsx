import React, { useState, useEffect, FC } from 'react';
import { UserCompetency, Competency, AppDocument } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import DatePicker from '../ui/DatePicker';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';

interface UserCompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (competency: UserCompetency) => void;
  competencies: Competency[];
  documents: AppDocument[];
  existingUserCompetency: UserCompetency | null;
}

const UserCompetencyModal: FC<UserCompetencyModalProps> = ({ isOpen, onClose, onSave, competencies, documents, existingUserCompetency }) => {
  const { t, lang } = useTranslation();
  const isEditMode = !!existingUserCompetency;

  const [competencyId, setCompetencyId] = useState('');
  const [issueDate, setIssueDate] = useState<Date | undefined>();
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [evidenceDocumentId, setEvidenceDocumentId] = useState('');

  useEffect(() => {
    if (existingUserCompetency) {
      setCompetencyId(existingUserCompetency.competencyId);
      setIssueDate(new Date(existingUserCompetency.issueDate));
      setExpiryDate(existingUserCompetency.expiryDate ? new Date(existingUserCompetency.expiryDate) : undefined);
      setEvidenceDocumentId(existingUserCompetency.evidenceDocumentId || '');
    } else {
        setCompetencyId('');
        setIssueDate(undefined);
        setExpiryDate(undefined);
        setEvidenceDocumentId('');
    }
  }, [existingUserCompetency, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!competencyId || !issueDate) return;
    
    onSave({
      competencyId,
      issueDate: issueDate.toISOString().split('T')[0],
      expiryDate: expiryDate ? expiryDate.toISOString().split('T')[0] : undefined,
      evidenceDocumentId: evidenceDocumentId || undefined,
    });
  };

  const footer = (
    <>
        <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">{t('cancel')}</button>
        <button type="submit" form="competency-form" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('save')}</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('editCompetency') : t('addCompetency')} footer={footer} size="lg">
      <form id="competency-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* FIX: Cast translation key to any */}
          <label htmlFor="competency" className={labelClasses}>{t('competency' as any)}</label>
          <select id="competency" value={competencyId} onChange={e => setCompetencyId(e.target.value)} className={inputClasses} required disabled={isEditMode}>
            <option value="">{t('selectCompetency')}</option>
            {competencies.map(c => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="issueDate" className={labelClasses}>{t('issueDate')}</label>
            <DatePicker date={issueDate} setDate={setIssueDate} />
          </div>
          <div>
            <label htmlFor="expiryDate" className={labelClasses}>{t('expiryDate')}</label>
            <DatePicker date={expiryDate} setDate={setExpiryDate} fromDate={issueDate} />
          </div>
        </div>
        <div>
          <label htmlFor="evidence" className={labelClasses}>{t('evidence')}</label>
          {/* FIX: Cast translation key to any */}
          <select id="evidence" value={evidenceDocumentId} onChange={e => setEvidenceDocumentId(e.target.value)} className={inputClasses}>
            <option value="">{t('selectEvidence' as any)}</option>
            {documents.map(d => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}
          </select>
        </div>
      </form>
    </Modal>
  );
};

export default UserCompetencyModal;