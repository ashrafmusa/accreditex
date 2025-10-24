import React, { useState } from 'react';
import { AppDocument } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import { inputClasses, labelClasses } from '../ui/constants';

interface DocumentMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: { en: string; ar: string }, type: AppDocument['type'] }) => void;
}

const DocumentMetadataModal: React.FC<DocumentMetadataModalProps> = ({ isOpen, onClose, onSave }) => {
    const { t } = useTranslation();
    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [type, setType] = useState<AppDocument['type']>('Policy');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name: { en: nameEn, ar: nameAr }, type });
        onClose();
    };

    const footer = (
        <>
            <button type="button" onClick={onClose} className="py-2 px-4 border rounded-md text-sm">{t('cancel')}</button>
            <button type="submit" form="doc-meta-form" className="py-2 px-4 border rounded-md text-sm text-white bg-brand-primary">{t('save')}</button>
        </>
    );
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('addNewDocument')} footer={footer}>
          <form id="doc-meta-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClasses}>{t('documentNameEn')}</label>
              <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>{t('documentNameAr')}</label>
              <input type="text" value={nameAr} onChange={e => setNameAr(e.target.value)} className={inputClasses} dir="rtl" required />
            </div>
              <div>
              <label className={labelClasses}>{t('documentType')}</label>
              <select value={type} onChange={e => setType(e.target.value as any)} className={inputClasses}>
                <option value="Policy">{t('policy')}</option>
                <option value="Procedure">{t('procedure')}</option>
                <option value="Report">{t('report')}</option>
              </select>
            </div>
          </form>
      </Modal>
    );
}

export default DocumentMetadataModal;