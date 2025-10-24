import React, { useState, FC } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: { en: string; ar: string }, uploadedFile: { name: string, type: string }}) => void;
}

const UploadEvidenceModal: FC<UploadEvidenceModalProps> = ({ isOpen, onClose, onSave }) => {
    const { t } = useTranslation();
    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [fileName, setFileName] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!nameEn || !nameAr || !fileName) return;
        onSave({ 
            name: { en: nameEn, ar: nameAr },
            uploadedFile: { name: fileName, type: 'PDF' } // Simulate file type
        });
    };

    const footer = (
      <>
        <button type="button" onClick={onClose} className="py-2 px-4 border rounded-md text-sm">{t('cancel')}</button>
        <button type="submit" form="upload-form" className="py-2 px-4 border rounded-md text-sm text-white bg-brand-primary">{t('save')}</button>
      </>
    );
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('uploadEvidence')} footer={footer}>
        <form id="upload-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nameEn" className={labelClasses}>{t('documentNameEn')}</label>
            <input type="text" id="nameEn" value={nameEn} onChange={e => setNameEn(e.target.value)} className={inputClasses} required />
          </div>
          <div>
            <label htmlFor="nameAr" className={labelClasses}>{t('documentNameAr')}</label>
            <input type="text" id="nameAr" value={nameAr} onChange={e => setNameAr(e.target.value)} className={inputClasses} dir="rtl" required />
          </div>
          <div>
            <label htmlFor="fileName" className={labelClasses}>{t('fileName')}</label>
            <input type="text" id="fileName" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="e.g., audit_report_q1.pdf" className={inputClasses} required />
          </div>
        </form>
      </Modal>
    );
}

export default UploadEvidenceModal;