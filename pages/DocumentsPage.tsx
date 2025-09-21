
import React, { useState } from 'react';
import { AppDocument, Standard, User, UserRole } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import DocumentEditorModal from '@/components/documents/DocumentEditorModal';
import SignatureModal from '@/components/common/SignatureModal';

interface DocumentsPageProps {
  documents: AppDocument[];
  standards: Standard[];
  projectProgramId: string;
  isFinalized: boolean;
  currentUser: User;
  onUpdateDocument: (updatedDocument: AppDocument) => void;
  onApproveDocument: (docId: string, passwordAttempt: string) => void;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ documents, standards, projectProgramId, isFinalized, currentUser, onUpdateDocument, onApproveDocument }) => {
  const { t, lang } = useTranslation();
  const [selectedDoc, setSelectedDoc] = useState<AppDocument | null>(null);
  const [signingDoc, setSigningDoc] = useState<AppDocument | null>(null);

  const canApprove = currentUser.role === UserRole.Admin || currentUser.role === UserRole.ProjectLead;

  const statusColors: Record<AppDocument['status'], string> = {
    Approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Pending Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    Archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const handleSaveDocument = (updatedDocument: AppDocument) => {
    onUpdateDocument(updatedDocument);
    setSelectedDoc(null);
  };
  
  const handleRowClick = (doc: AppDocument) => {
    if (!isFinalized && doc.status !== 'Approved') {
      setSelectedDoc(doc);
    }
  }

  const handleRequestApproval = (doc: AppDocument) => {
    onUpdateDocument({ ...doc, status: 'Pending Review' });
  };
  
  const handleConfirmSignature = (password: string) => {
    if (signingDoc) {
      onApproveDocument(signingDoc.id, password);
      setSigningDoc(null);
    }
  };

  return (
    <>
      <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
        <div className="p-6 border-b dark:border-dark-brand-border">
          <h2 className="text-xl font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{t('documentRepository')}</h2>
          <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('documentRepositoryDescription')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('documentName')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('status')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('version')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('lastUpdated')}</th>
                <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
              {documents.map((doc) => (
                <tr key={doc.id} onClick={() => handleRowClick(doc)} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!isFinalized && doc.status !== 'Approved' ? 'cursor-pointer' : 'cursor-default'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${!isFinalized && doc.status !== 'Approved' ? 'text-brand-primary' : 'text-brand-text-primary dark:text-dark-brand-text-primary'}`}>{doc.name[lang]}</div>
                    <div className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary">{doc.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[doc.status]}`}>
                      {doc.status}
                    </span>
                    {doc.status === 'Approved' && doc.approvedBy && (
                      <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">{t('signedBy').replace('{name}', doc.approvedBy).replace('{date}', new Date(doc.approvalDate!).toLocaleDateString())}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">v{doc.currentVersion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                    {!isFinalized && (
                      <>
                        {doc.status === 'Draft' && <button onClick={(e) => { e.stopPropagation(); handleRequestApproval(doc); }} className="text-brand-primary hover:underline">{t('requestApproval')}</button>}
                        {doc.status === 'Pending Review' && canApprove && <button onClick={(e) => { e.stopPropagation(); setSigningDoc(doc); }} className="text-green-600 hover:underline">{t('approve')}</button>}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {documents.length === 0 && <p className="text-center py-8 text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('noDocumentsForProject')}</p>}
        </div>
      </div>
      {selectedDoc && (
        <DocumentEditorModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          onSave={handleSaveDocument}
          standards={standards.filter(s => s.programId === projectProgramId)}
        />
      )}
      {signingDoc && (
        <SignatureModal
            isOpen={!!signingDoc}
            onClose={() => setSigningDoc(null)}
            onConfirm={handleConfirmSignature}
            actionTitle={`${t('approve')} "${signingDoc.name[lang]}"`}
            signatureStatement={t('signatureStatementDocument')}
            confirmActionText={t('signAndApprove')}
        />
      )}
    </>
  );
};

export default DocumentsPage;