import React, { useState, useMemo } from 'react';
import { ChecklistItem, User, AppDocument, Department, ComplianceStatus, Standard, StandardCriticality } from '@/types';
import { PaperClipIcon, UserCircleIcon, SparklesIcon, ExclamationTriangleIcon, ChatBubbleLeftEllipsisIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon, ChevronDownIcon, SlashCircleIcon } from '@/components/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { backendService } from '@/services/BackendService';
import UploadEvidenceModal from '@/components/documents/UploadEvidenceModal';
import { useToast } from '@/hooks/useToast';

interface ChecklistItemProps {
  item: ChecklistItem;
  standard: Standard;
  users: User[];
  documents: AppDocument[];
  departments: Department[];
  currentUser: User;
  isFinalized: boolean;
  onUpdate: (updatedItem: ChecklistItem) => void;
  onAddComment: (itemId: string, text: string) => void;
  onCreateCapa: (item: ChecklistItem) => void;
  onUploadEvidence: (checklistItemId: string, docData: { name: { en: string; ar: string }, uploadedFile: { name: string, type: string }}) => void;
}

const ChecklistItemComponent: React.FC<ChecklistItemProps> = ({ item, standard, users, documents, departments, currentUser, isFinalized, onUpdate, onAddComment, onCreateCapa, onUploadEvidence }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { t, lang } = useTranslation();
  const toast = useToast();
  const assignedUser = users.find(u => u.id === item.assignedTo);
  
  const evidenceDocs = documents.filter(doc => item.evidenceFiles.includes(doc.id));

  const usersWithDepartments = useMemo(() => {
    return users.map(user => ({
      ...user,
      department: departments.find(d => d.id === user.departmentId)
    }));
  }, [users, departments]);

  const groupedUsers = useMemo(() => {
    return usersWithDepartments.reduce((acc, user) => {
        const deptName = user.department ? user.department.name[lang] : t('unassigned');
        if (!acc[deptName]) {
            acc[deptName] = [];
        }
        acc[deptName].push(user);
        return acc;
    }, {} as Record<string, typeof usersWithDepartments>);
  }, [usersWithDepartments, lang, t]);

  const handleStatusChange = (newStatus: ComplianceStatus) => {
    if (isFinalized) return;
    onUpdate({ ...item, status: newStatus });
  };
  
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ ...item, assignedTo: e.target.value || null });
  };
  
  const handleSuggestActionPlan = async () => {
    setIsAiLoading(true);
    try {
        const suggestion = await backendService.suggestActionPlan(item.item);
        onUpdate({ ...item, actionPlan: suggestion });
    } catch (error) {
        console.error("AI suggestion failed:", error);
        toast.error(t('actionPlanError'));
    } finally {
        setIsAiLoading(false);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
        onAddComment(item.id, newComment.trim());
        setNewComment('');
    }
  };

  const handleSaveEvidence = (docData: { name: { en: string; ar: string }, uploadedFile: { name: string, type: string }}) => {
    onUploadEvidence(item.id, docData);
    setIsUploadModalOpen(false);
  }
  
  const inputClasses = "w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  
  const criticalityStyles: Record<StandardCriticality, string> = {
    [StandardCriticality.High]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    [StandardCriticality.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [StandardCriticality.Low]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  };

  const statusOptions = [
    { status: ComplianceStatus.Compliant, icon: CheckCircleIcon, color: 'text-green-500', text: 'text-green-800 dark:text-green-300' },
    { status: ComplianceStatus.PartiallyCompliant, icon: MinusCircleIcon, color: 'text-yellow-500', text: 'text-yellow-800 dark:text-yellow-300' },
    { status: ComplianceStatus.NonCompliant, icon: XCircleIcon, color: 'text-red-500', text: 'text-red-800 dark:text-red-300' },
    { status: ComplianceStatus.NotApplicable, icon: SlashCircleIcon, color: 'text-gray-400', text: 'text-gray-800 dark:text-gray-300' },
  ];

  return (
    <>
    <div className="border dark:border-dark-brand-border rounded-lg overflow-hidden transition-shadow hover:shadow-md bg-white dark:bg-dark-brand-surface">
      <div className="p-4 flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${
              item.status === ComplianceStatus.Compliant ? 'line-through text-gray-500 dark:text-gray-400' : 'text-brand-text-primary dark:text-dark-brand-text-primary'
            }`}>
              {item.item}
            </p>
            <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('standard')}: {item.standardId}</p>
                {standard.criticality && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${criticalityStyles[standard.criticality]}`}>{t(standard.criticality.toLowerCase() as any)}</span>
                )}
            </div>
          </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse flex-shrink-0">
            <div className="flex items-center text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">
                {assignedUser ? (
                    <>
                        <UserCircleIcon className="h-5 w-5 ltr:mr-1.5 rtl:ml-1.5 text-gray-400" />
                        {assignedUser.name}
                    </>
                ) : (
                    <span className="text-gray-400 italic">{t('unassigned')}</span>
                )}
            </div>
             <div className="flex items-center text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">
                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 ltr:mr-1.5 rtl:ml-1.5 text-gray-400" />
                {item.comments.length}
            </div>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} aria-expanded={isExpanded} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ltr:ml-2 rtl:mr-2">
          <ChevronDownIcon className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isExpanded && (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t dark:border-dark-brand-border">
            <div className="flex items-center justify-between mb-4">
                <label className={labelClasses}>{t('status')}</label>
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                    {statusOptions.map(opt => {
                        const isActive = item.status === opt.status;
                        return (
                            <button key={opt.status} onClick={() => handleStatusChange(opt.status)} disabled={isFinalized}
                                className={`px-2 py-1 text-sm font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                                    isActive ? `bg-white dark:bg-gray-600 shadow-sm ${opt.text}` : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-600/50'
                                }`}
                                title={t(opt.status.charAt(0).toLowerCase() + opt.status.slice(1).replace(/\s/g, '') as any)}
                            >
                                <opt.icon className={`w-5 h-5 ${opt.color}`} />
                                <span className="hidden sm:inline">{t(opt.status.charAt(0).toLowerCase() + opt.status.slice(1).replace(/\s/g, '') as any)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>{t('assignedTo')}</label>
                <select value={item.assignedTo || ''} onChange={handleAssigneeChange} disabled={isFinalized} className={inputClasses}>
                    <option value="">{t('unassigned')}</option>
                    {Object.entries(groupedUsers).map(([deptName, usersInDept]) => (
                      <optgroup key={deptName} label={deptName}>
                        {usersInDept.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </optgroup>
                    ))}
                </select>
              </div>
              <div>
                <label className={labelClasses}>{t('dueDate')}</label>
                <input type="date" value={item.dueDate || ''} onChange={(e) => onUpdate({...item, dueDate: e.target.value || null})} disabled={isFinalized} className={inputClasses} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>{t('notes')}</label>
                <textarea rows={2} value={item.notes} onChange={(e) => onUpdate({...item, notes: e.target.value})} disabled={isFinalized} className={inputClasses} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>{t('actionPlan')}</label>
                <div className="relative">
                    <textarea rows={4} value={item.actionPlan || ''} onChange={(e) => onUpdate({...item, actionPlan: e.target.value})} placeholder={t('actionPlanPlaceholder')} className={inputClasses} disabled={isFinalized || isAiLoading}/>
                    {item.status !== ComplianceStatus.Compliant && !isFinalized && (
                        <div className="absolute bottom-2 ltr:right-2 rtl:left-2 flex gap-2">
                           <button onClick={() => onCreateCapa(item)} className="inline-flex items-center justify-center sm:justify-start px-2 sm:px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700" title={t('createCapa')}>
                               <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                               <span className="hidden sm:inline ltr:ml-1.5 rtl:mr-1.5">{t('createCapa')}</span>
                           </button>
                           <button onClick={handleSuggestActionPlan} disabled={isAiLoading} className="inline-flex items-center justify-center sm:justify-start px-2 sm:px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-indigo-700 disabled:bg-gray-400" title={isAiLoading ? t('generating') : t('suggestWithAI')}>
                               <SparklesIcon className="h-4 w-4 flex-shrink-0" />
                               <span className="hidden sm:inline ltr:ml-1.5 rtl:mr-1.5">{isAiLoading ? t('generating') : t('suggestWithAI')}</span>
                           </button>
                        </div>
                    )}
                </div>
              </div>
              <div className="md:col-span-2">
                <h4 className={labelClasses}>{t('evidenceLabel')}</h4>
                {evidenceDocs.length > 0 ? (
                     <ul className="space-y-1">
                        {evidenceDocs.map(doc => ( <li key={doc.id} className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{doc.name[lang]}</li>))}
                     </ul>
                ) : <p className="text-sm text-gray-500 dark:text-gray-400">{t('noEvidenceUploaded')}</p>}
                {!isFinalized && <button onClick={() => setIsUploadModalOpen(true)} className="text-sm mt-2 text-brand-primary font-medium hover:underline">{t('uploadFile')}</button>}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t dark:border-dark-brand-border">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{t('comments')}</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {item.comments.map(comment => (
                        <div key={comment.id} className="flex items-start space-x-3 rtl:space-x-reverse">
                           <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-brand-primary flex items-center justify-center font-bold flex-shrink-0 text-sm">{comment.userName.charAt(0)}</div>
                           <div>
                               <p className="text-sm"><strong className="font-semibold">{comment.userName}</strong> <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span></p>
                               <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                           </div>
                        </div>
                    ))}
                </div>
                {!isFinalized && (
                  <form onSubmit={handlePostComment} className="mt-4 flex items-center gap-2">
                      <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder={t('addComment')} className={inputClasses} />
                      <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('postComment')}</button>
                  </form>
                )}
            </div>
        </div>
      )}
    </div>
    {isUploadModalOpen && (
      <UploadEvidenceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSave={handleSaveEvidence}
      />
    )}
    </>
  );
};

export default ChecklistItemComponent;
