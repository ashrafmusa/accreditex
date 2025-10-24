import React, { useState, FC } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  actionTitle: string;
  signatureStatement: string;
  confirmActionText: string;
}

const SignatureModal: FC<SignatureModalProps> = ({ isOpen, onClose, onConfirm, actionTitle, signatureStatement, confirmActionText }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      onConfirm(password);
    }
  };
  
  const footer = (
    <>
        <button
            type="button"
            onClick={onClose}
            className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500"
        >
            {t('cancel')}
        </button>
        <button
            type="submit"
            form="signature-form"
            disabled={!password}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {confirmActionText}
        </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('eSignature')} footer={footer}>
        <form id="signature-form" onSubmit={handleSubmit}>
            <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{actionTitle}</p>
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <p className="text-xs text-gray-600 dark:text-gray-300">{signatureStatement}</p>
            </div>
            <div className="mt-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('enterPasswordToSign')}</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-800 dark:text-white"
                    required
                    autoFocus
                />
            </div>
        </form>
    </Modal>
  );
};

export default SignatureModal;