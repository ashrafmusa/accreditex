import React from 'react';
import { AppDocument } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { PencilIcon, TrashIcon } from '../icons';

interface ControlledDocumentsTableProps {
    documents: AppDocument[];
    canModify: boolean;
    onApprove: (doc: AppDocument) => void;
    onDelete: (docId: string) => void;
    onView: (doc: AppDocument) => void;
}

const ControlledDocumentsTable: React.FC<ControlledDocumentsTableProps> = ({ documents, canModify, onApprove, onDelete, onView }) => {
    const { t, lang } = useTranslation();

    const statusColors: Record<AppDocument['status'], string> = {
        Approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Pending Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        Archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      };

    return (
        <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('documentName')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('status')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('version')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reviewDate')}</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('actions')}</th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
                {documents.map((doc) => (
                    <tr key={doc.id} onClick={() => onView(doc)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <td className="px-6 py-4"><div className="font-medium">{doc.name[lang]}</div><div className="text-xs text-gray-500">{doc.type}</div></td>
                    <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[doc.status]}`}>{doc.status}</span></td>
                    <td className="px-6 py-4 text-sm">{doc.currentVersion}</td>
                    <td className="px-6 py-4 text-sm">{doc.reviewDate ? new Date(doc.reviewDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                        {canModify && doc.status === 'Pending Review' && <button onClick={(e) => { e.stopPropagation(); onApprove(doc);}} className="text-green-600 hover:underline">{t('approve')}</button>}
                        {canModify && (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); onView(doc);}} className="p-1 text-gray-500 hover:text-brand-primary"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id);}} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                            </>
                        )}
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {documents.length === 0 && <p className="text-center py-8 text-gray-500">{t('noControlledDocuments')}</p>}
            </div>
        </div>
    );
};

export default ControlledDocumentsTable;